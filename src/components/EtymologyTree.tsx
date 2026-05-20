// src/components/EtymologyTree.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import type { EtymNode, WordData } from '../types/etymology';
import { LANGUAGE_DEFS } from '../lib/languages';
import NodeTooltip from './NodeTooltip';

interface Props { data: WordData; }

/* ─── Leaf shape path (centered at 0,0) ───────────────────────────────── */
function leafPath(w: number, h: number): string {
  const hw = w / 2, hh = h / 2;
  // Pointed top & bottom, widest in middle — classic leaf silhouette
  return [
    `M 0,${-hh}`,
    `C ${hw * 0.6},${-hh} ${hw},${-hh * 0.4} ${hw},0`,
    `C ${hw},${hh * 0.4} ${hw * 0.6},${hh} 0,${hh}`,
    `C ${-hw * 0.6},${hh} ${-hw},${hh * 0.4} ${-hw},0`,
    `C ${-hw},${-hh * 0.4} ${-hw * 0.6},${-hh} 0,${-hh}`,
    'Z',
  ].join(' ');
}

/* ─── Trunk / root hexagon (for the searched word) ───────────────────── */
function hexPath(r: number): string {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    return `${r * Math.cos(a)},${r * Math.sin(a)}`;
  });
  return `M ${pts.join(' L ')} Z`;
}

/* ─── Tapered organic branch between two points ─────────────────────── */
function branchPath(
  sx: number, sy: number,
  tx: number, ty: number,
  w1: number, w2: number,
): string {
  // Midpoint control point for S-curve
  const my = sy + (ty - sy) * 0.5;
  const hw1 = w1 / 2, hw2 = w2 / 2;

  // Left side: parent → child
  const lx1 = sx - hw1, lx2 = tx - hw2;
  const rx1 = sx + hw1, rx2 = tx + hw2;

  return [
    `M ${lx1},${sy}`,
    `C ${lx1},${my} ${lx2},${my} ${lx2},${ty}`,
    `L ${rx2},${ty}`,
    `C ${rx2},${my} ${rx1},${my} ${rx1},${sy}`,
    'Z',
  ].join(' ');
}

const MARGIN = { top: 80, right: 100, bottom: 100, left: 100 };
const SVG_H  = 560;
const LEAF_W = 150;
const LEAF_H = 52;

export default function EtymologyTree({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef       = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<EtymNode | null>(null);
  const [err, setErr]           = useState<string | null>(null);

  const draw = useCallback(() => {
    if (!svgRef.current || !containerRef.current || !data?.tree) return;
    setErr(null);

    try {
      const cw   = containerRef.current.getBoundingClientRect().width || 700;
      const W    = Math.max(cw, 480);
      const H    = SVG_H;
      const innerW = W - MARGIN.left - MARGIN.right;
      const innerH = H - MARGIN.top  - MARGIN.bottom;

      /* ── hierarchy ── */
      const root = d3.hierarchy<EtymNode>(
        data.tree,
        d => (d.children?.length ? d.children : null),
      );
      const maxDepth = root.height || 1;

      const treeLayout = d3.tree<EtymNode>()
        .size([innerW, innerH])
        .separation((a, b) => (a.parent === b.parent ? 1.8 : 2.4));
      treeLayout(root);

      /* ── flip Y so root is at BOTTOM (real tree) ── */
      const flipY = (y: number) => innerH - y;

      /* ── SVG setup ── */
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();
      svg.attr('viewBox', `0 0 ${W} ${H}`)
         .attr('width', W)
         .attr('height', H)
         .style('display', 'block');

      /* ── Defs: gradients, filters, patterns ── */
      const defs = svg.append('defs');

      // Bark gradient for trunk
      const barkGrad = defs.append('linearGradient')
        .attr('id', 'bark-grad').attr('x1','0%').attr('y1','0%').attr('x2','100%').attr('y2','0%');
      barkGrad.append('stop').attr('offset','0%').attr('stop-color','#5A3C20');
      barkGrad.append('stop').attr('offset','40%').attr('stop-color','#9A7050');
      barkGrad.append('stop').attr('offset','100%').attr('stop-color','#6A4828');

      // Drop shadow for leaves
      const shadow = defs.append('filter').attr('id','leaf-shadow')
        .attr('x','-30%').attr('y','-30%').attr('width','160%').attr('height','160%');
      shadow.append('feDropShadow')
        .attr('dx',0).attr('dy',3).attr('stdDeviation',6)
        .attr('flood-color','#000').attr('flood-opacity',0.7);

      // Glow filter for root node
      const glow = defs.append('filter').attr('id','root-glow')
        .attr('x','-50%').attr('y','-50%').attr('width','200%').attr('height','200%');
      glow.append('feGaussianBlur').attr('in','SourceGraphic').attr('stdDeviation',8).attr('result','blur');
      const glowMerge = glow.append('feMerge');
      glowMerge.append('feMergeNode').attr('in','blur');
      glowMerge.append('feMergeNode').attr('in','SourceGraphic');

      // Per-language glow filters
      root.descendants().forEach(d => {
        const langDef = LANGUAGE_DEFS[d.data.language] ?? LANGUAGE_DEFS['unknown'];
        const id = `glow-${d.data.language}`;
        if (!defs.select(`#${id}`).node()) {
          const f = defs.append('filter').attr('id', id)
            .attr('x','-40%').attr('y','-40%').attr('width','180%').attr('height','180%');
          f.append('feDropShadow')
            .attr('dx',0).attr('dy',0).attr('stdDeviation',8)
            .attr('flood-color', langDef.glow).attr('flood-opacity',1);
        }
      });

      /* ── Background ── */
      // Deep night sky feel
      svg.append('rect').attr('width',W).attr('height',H).attr('fill','#06080F');

      // Subtle dot-grid
      const dotGrid = defs.append('pattern')
        .attr('id','dot-grid').attr('width',32).attr('height',32)
        .attr('patternUnits','userSpaceOnUse');
      dotGrid.append('circle').attr('cx',16).attr('cy',16).attr('r',0.8)
        .attr('fill','rgba(60,80,120,0.35)');
      svg.append('rect').attr('width',W).attr('height',H).attr('fill','url(#dot-grid)');

      /* ── Main group ── */
      const g = svg.append('g')
        .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

      /* ══════════════════════════════════════════
         BRANCHES — tapered, organic bark-colored
      ══════════════════════════════════════════ */
      const links = root.links();

      // Shadow pass first
      g.selectAll('.branch-shadow')
        .data(links).join('path').attr('class','branch-shadow')
        .attr('d', d => {
          const sx = d.source.x, sy = flipY(d.source.y!);
          const tx = d.target.x,  ty = flipY(d.target.y!);
          const depth = d.source.depth;
          const w1 = Math.max(3, 18 - depth * 4.5);
          const w2 = Math.max(2, 12 - d.target.depth * 4);
          return branchPath(sx, sy, tx, ty, w1, w2);
        })
        .attr('fill','rgba(0,0,0,0.5)')
        .attr('transform','translate(3,4)');

      // Bark fill pass
      g.selectAll('.branch')
        .data(links).join('path').attr('class','branch')
        .attr('d', d => {
          const sx = d.source.x, sy = flipY(d.source.y!);
          const tx = d.target.x,  ty = flipY(d.target.y!);
          const depth = d.source.depth;
          const w1 = Math.max(3, 18 - depth * 4.5);
          const w2 = Math.max(2, 12 - d.target.depth * 4);
          return branchPath(sx, sy, tx, ty, w1, w2);
        })
        .attr('fill', d => {
          const depth = d.source.depth;
          if (depth === 0) return 'url(#bark-grad)';
          return d3.interpolate('#7A5538', '#4A3020')(Math.min(depth / maxDepth, 1));
        })
        .attr('opacity', 0)
        .transition().duration(600).delay((_, i) => i * 70)
        .attr('opacity', 1);

      // Highlight line along branches
      g.selectAll('.branch-line')
        .data(links).join('path').attr('class','branch-line')
        .attr('d', d => {
          const sx = d.source.x, sy = flipY(d.source.y!);
          const tx = d.target.x,  ty = flipY(d.target.y!);
          const my = sy + (ty - sy) * 0.5;
          return `M ${sx},${sy} C ${sx},${my} ${tx},${my} ${tx},${ty}`;
        })
        .attr('fill','none')
        .attr('stroke','rgba(180,130,80,0.35)')
        .attr('stroke-width', d => Math.max(0.5, 3 - d.source.depth * 0.7))
        .attr('stroke-linecap','round')
        .attr('pointer-events','none');

      /* ══════════════════════════════════════════
         BUDS — small circles at branch joints
      ══════════════════════════════════════════ */
      g.selectAll('.bud')
        .data(root.descendants().filter(d => d.depth > 0 && (d.children?.length ?? 0) > 0))
        .join('circle').attr('class','bud')
        .attr('cx', d => d.x)
        .attr('cy', d => flipY(d.y!))
        .attr('r', d => Math.max(3, 8 - d.depth * 2))
        .attr('fill', '#9A7050')
        .attr('stroke','#C09060')
        .attr('stroke-width',1);

      /* ══════════════════════════════════════════
         NODES — leaf shapes, language-colored
      ══════════════════════════════════════════ */
      const nodes = g.selectAll('.node')
        .data(root.descendants())
        .join('g').attr('class','node')
        .attr('transform', d => `translate(${d.x},${flipY(d.y!)})`)
        .style('cursor','pointer')
        .on('click', (_, d) => setSelected(d.data));

      // ── Root node (English word searched) — special hexagonal medallion ──
      const rootNode = nodes.filter(d => d.depth === 0);

      // Outer glow ring
      rootNode.append('circle')
        .attr('r', 52)
        .attr('fill','none')
        .attr('stroke', '#F0B840')
        .attr('stroke-width', 1)
        .attr('opacity', 0.25)
        .attr('class','pulse-ring')
        .style('animation','pulseRing 2.4s ease-in-out infinite');

      rootNode.append('circle')
        .attr('r', 44)
        .attr('fill','none')
        .attr('stroke', '#F0B840')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.15);

      // Hex background
      rootNode.append('path')
        .attr('d', hexPath(38))
        .attr('fill','#1E1A08')
        .attr('stroke','#F0B840')
        .attr('stroke-width', 2.5)
        .attr('filter','url(#root-glow)')
        .attr('opacity', 0)
        .transition().duration(500).delay(400)
        .attr('opacity', 1);

      // Root word text
      rootNode.append('text')
        .attr('text-anchor','middle').attr('dy','-0.15em')
        .attr('font-family','Lora, Georgia, serif')
        .attr('font-size', 14).attr('font-weight', 600)
        .attr('fill','#F0E0A0')
        .attr('pointer-events','none')
        .text(d => {
          const w = d.data.word;
          return w.length > 14 ? w.slice(0, 12) + '…' : w;
        });

      rootNode.append('text')
        .attr('text-anchor','middle').attr('dy','1.2em')
        .attr('font-family','JetBrains Mono, monospace')
        .attr('font-size', 7.5).attr('fill','#B08830')
        .attr('pointer-events','none')
        .text('Modern English');

      // ── Ancestor leaf nodes ──
      const leafNodes = nodes.filter(d => d.depth > 0);

      // Leaf shadow
      leafNodes.append('path')
        .attr('d', d => {
          const w = d.depth === maxDepth ? LEAF_W * 0.85 : LEAF_W;
          const h = d.depth === maxDepth ? LEAF_H * 0.85 : LEAF_H;
          return leafPath(w, h);
        })
        .attr('fill','rgba(0,0,0,0.55)')
        .attr('transform','translate(4,6)')
        .attr('pointer-events','none');

      // Leaf body
      leafNodes.append('path')
        .attr('d', d => {
          const w = d.depth === maxDepth ? LEAF_W * 0.85 : LEAF_W;
          const h = d.depth === maxDepth ? LEAF_H * 0.85 : LEAF_H;
          return leafPath(w, h);
        })
        .attr('fill', d => {
          const lang = LANGUAGE_DEFS[d.data.language] ?? LANGUAGE_DEFS['unknown'];
          return lang.fill;
        })
        .attr('stroke', d => {
          const lang = LANGUAGE_DEFS[d.data.language] ?? LANGUAGE_DEFS['unknown'];
          return lang.stroke;
        })
        .attr('stroke-width', d => d.data.isReconstructed ? 1 : 2)
        .attr('stroke-dasharray', d => d.data.isReconstructed ? '4,3' : 'none')
        .attr('filter', d => `url(#glow-${d.data.language})`)
        .attr('opacity', 0)
        .transition().duration(500).delay((_, i) => 200 + i * 60)
        .attr('opacity', 1);

      // Leaf center vein
      leafNodes.append('line')
        .attr('x1', 0).attr('y1', d => {
          const h = d.depth === maxDepth ? LEAF_H * 0.85 : LEAF_H;
          return -h * 0.38;
        })
        .attr('x2', 0).attr('y2', d => {
          const h = d.depth === maxDepth ? LEAF_H * 0.85 : LEAF_H;
          return h * 0.38;
        })
        .attr('stroke', d => {
          const lang = LANGUAGE_DEFS[d.data.language] ?? LANGUAGE_DEFS['unknown'];
          return lang.stroke + '50';
        })
        .attr('stroke-width', 0.8)
        .attr('pointer-events','none');

      // Word text on leaf
      leafNodes.append('text')
        .attr('text-anchor','middle').attr('dy','-0.15em')
        .attr('font-family','Lora, Georgia, serif')
        .attr('font-size', d => d.depth === maxDepth ? 11 : 12.5)
        .attr('font-weight', 500)
        .attr('fill', d => {
          const lang = LANGUAGE_DEFS[d.data.language] ?? LANGUAGE_DEFS['unknown'];
          return lang.text;
        })
        .attr('pointer-events','none')
        .text(d => {
          const w = d.data.word;
          return w.length > 16 ? w.slice(0,14) + '…' : w;
        });

      // Language sublabel
      leafNodes.append('text')
        .attr('text-anchor','middle').attr('dy','1.15em')
        .attr('font-family','JetBrains Mono, monospace')
        .attr('font-size', 7)
        .attr('fill', d => {
          const lang = LANGUAGE_DEFS[d.data.language] ?? LANGUAGE_DEFS['unknown'];
          return lang.stroke + 'CC';
        })
        .attr('pointer-events','none')
        .text(d => {
          const name = (LANGUAGE_DEFS[d.data.language] ?? LANGUAGE_DEFS['unknown']).name;
          return name.length > 20 ? name.slice(0, 18) + '…' : name;
        });

      // Reconstructed ✶ badge
      leafNodes.filter(d => d.data.isReconstructed)
        .append('text')
        .attr('x', d => (d.depth === maxDepth ? LEAF_W * 0.85 : LEAF_W) / 2 - 6)
        .attr('y', d => -(d.depth === maxDepth ? LEAF_H * 0.85 : LEAF_H) / 2 + 10)
        .attr('font-size', 8)
        .attr('fill','#FFD080')
        .attr('text-anchor','middle')
        .attr('pointer-events','none')
        .text('✶');

      // Hover effects
      nodes.on('mouseenter', function(_, d) {
        d3.select(this).select('path')
          .transition().duration(150)
          .attr('stroke-width', d.depth === 0 ? 3.5 : 3)
          .attr('transform', 'scale(1.06)');
      }).on('mouseleave', function(_, d) {
        d3.select(this).select('path')
          .transition().duration(150)
          .attr('stroke-width', d.depth === 0 ? 2.5 : d.data.isReconstructed ? 1 : 2)
          .attr('transform', 'scale(1)');
      });

      /* ── Ground line (roots) ── */
      const groundY = innerH + 20;
      g.append('line')
        .attr('x1', innerW * 0.2).attr('y1', groundY)
        .attr('x2', innerW * 0.8).attr('y2', groundY)
        .attr('stroke','#3A2818').attr('stroke-width', 2)
        .attr('stroke-linecap','round').attr('opacity', 0.6);

      // Small root lines going into the ground
      [-40, -20, 0, 20, 40].forEach(offset => {
        g.append('path')
          .attr('d', `M ${innerW/2 + offset},${groundY} Q ${innerW/2 + offset + 15},${groundY + 18} ${innerW/2 + offset},${groundY + 28}`)
          .attr('fill','none').attr('stroke','#3A2818')
          .attr('stroke-width', Math.abs(offset) < 5 ? 3 : 1.5)
          .attr('opacity', 0.5);
      });

      console.log(`[EtymologyTree] Rendered ${root.descendants().length} nodes, ${W}×${H}`);

    } catch (e) {
      console.error('[EtymologyTree]', e);
      setErr('Tree render failed. See console.');
    }
  }, [data]);

  useEffect(() => { draw(); }, [draw]);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(el);
    return () => ro.disconnect();
  }, [draw]);

  const exportSVG = () => {
    if (!svgRef.current) return;
    let src = new XMLSerializer().serializeToString(svgRef.current);
    if (!src.includes('xmlns=')) src = src.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([src], { type: 'image/svg+xml' })),
      download: `${data.word}-etymology.svg`,
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Toolbar */}
      <div className="absolute top-0 right-0 z-10 flex gap-2 p-2">
        <button onClick={exportSVG}
          className="text-[11px] font-mono text-[#8BA4CC] hover:text-[#EEF2FF] border border-[#1E2848] hover:border-[#F0B840]/50 rounded-lg px-3 py-1.5 bg-[#0B0E1A]/80 backdrop-blur hover:bg-[#111830] transition-all duration-200 cursor-pointer">
          export SVG
        </button>
      </div>

      <div ref={containerRef} className="flex-1 overflow-auto"
        style={{ minHeight: `${SVG_H + 40}px` }}>
        {err ? (
          <div className="flex items-center justify-center h-full text-sm font-mono text-[#E05040] p-8 text-center">
            ⚠ {err}
          </div>
        ) : (
          <svg ref={svgRef} style={{ display: 'block' }} />
        )}
      </div>

      {selected && (
        <NodeTooltip node={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

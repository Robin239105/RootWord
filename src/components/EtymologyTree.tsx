// src/components/EtymologyTree.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import type { EtymNode, WordData } from '../types/etymology';
import { LANGUAGE_DEFS } from '../lib/languages';
import NodeTooltip from './NodeTooltip';

interface Props { data: WordData; }

/* ─── Node card dimensions ─────────────────────────────────────────────── */
const NODE_W   = 168;
const NODE_H   = 72;
const NODE_R   = 12;   // corner radius
const H_GAP    = 80;   // horizontal gap between depth levels (added to NODE_W)
const SVG_H    = 500;
const MARGIN   = { top: 70, right: 60, bottom: 70, left: 60 };

/* ─── Parchment warm palette ────────────────────────────────────────────── */
const PARCHMENT = '#F5EFE0';
const INK       = '#3A2E1A';
const BRANCH    = '#8A6A3A';
const BRANCH_LT = '#B89060';

/* ─── Language-specific card colors (for light parchment background) ────── */
const NODE_COLORS: Record<string, { bg: string; accent: string; text: string; sub: string }> = {
  'english':              { bg: '#FFFBEE', accent: '#C4880A', text: '#3A2800', sub: '#8A6A10' },
  'middle-english':       { bg: '#FFF8E2', accent: '#B07818', text: '#3A2800', sub: '#806010' },
  'old-english':          { bg: '#FFF4D0', accent: '#9A6808', text: '#3A2000', sub: '#705000' },
  'old-french':           { bg: '#EDFAF2', accent: '#1A8840', text: '#0A3018', sub: '#207038' },
  'latin':                { bg: '#E8F8EE', accent: '#168038', text: '#0A3018', sub: '#1A6A30' },
  'medieval-latin':       { bg: '#E8F8EE', accent: '#168038', text: '#0A3018', sub: '#1A6A30' },
  'ancient-greek':        { bg: '#EAF2FF', accent: '#2858C8', text: '#081840', sub: '#2048A8' },
  'proto-greek':          { bg: '#E4EEFF', accent: '#1E48A8', text: '#081840', sub: '#1A3888' },
  'proto-germanic':       { bg: '#FFF2E0', accent: '#A06020', text: '#3A1800', sub: '#804A10' },
  'proto-indo-european':  { bg: '#FFF0EC', accent: '#C04020', text: '#3A1000', sub: '#A03018' },
  'arabic':               { bg: '#F8EEFF', accent: '#8030C0', text: '#280048', sub: '#6820A0' },
  'old-norse':            { bg: '#E8FBF6', accent: '#148870', text: '#083028', sub: '#107060' },
  'unknown':              { bg: '#F4F4F4', accent: '#707070', text: '#303030', sub: '#505050' },
};

function getNodeColors(lang: string) {
  return NODE_COLORS[lang] ?? NODE_COLORS['unknown'];
}

/* ─── Connection curve (horizontal bezier) ──────────────────────────────── */
function hLink(sx: number, sy: number, tx: number, ty: number): string {
  const mx = (sx + tx) / 2;
  return `M ${sx},${sy} C ${mx},${sy} ${mx},${ty} ${tx},${ty}`;
}

export default function EtymologyTree({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef       = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<EtymNode | null>(null);
  const [err, setErr]           = useState<string | null>(null);

  const draw = useCallback(() => {
    if (!svgRef.current || !containerRef.current || !data?.tree) return;
    setErr(null);

    try {
      const cw     = containerRef.current.getBoundingClientRect().width || 800;
      const W      = Math.max(cw, 500);
      const H      = SVG_H;

      /* ── d3 hierarchy ── */
      const root = d3.hierarchy<EtymNode>(
        data.tree,
        d => d.children?.length ? d.children : null,
      );
      const maxDepth = root.height || 1;
      const numNodes = root.descendants().length;

      /* ── Horizontal tree layout ──
         d3.tree().size([H_spread, W_spread]) gives:
           node.x  → vertical spread (0..H_spread)
           node.y  → horizontal depth (0..W_spread, 0=root, W_spread=deepest)
         We render: translate(margin.left + node.y, margin.top + node.x)
      */
      const spreadH = H - MARGIN.top - MARGIN.bottom;
      const spreadW = maxDepth * (NODE_W + H_GAP);
      const totalW  = Math.max(W, spreadW + MARGIN.left + MARGIN.right);

      const treeLayout = d3.tree<EtymNode>()
        .size([spreadH, spreadW])
        .separation((a, b) => a.parent === b.parent ? 1.4 : 1.8);
      treeLayout(root);

      /* ── SVG setup ── */
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();
      svg
        .attr('viewBox', `0 0 ${totalW} ${H}`)
        .attr('width', totalW)
        .attr('height', H)
        .style('display', 'block');

      /* ── Defs ── */
      const defs = svg.append('defs');

      // Parchment grain filter
      const grain = defs.append('filter').attr('id', 'grain')
        .attr('x', '0%').attr('y', '0%').attr('width', '100%').attr('height', '100%');
      grain.append('feTurbulence')
        .attr('type', 'fractalNoise').attr('baseFrequency', '0.65')
        .attr('numOctaves', 3).attr('result', 'noise');
      grain.append('feColorMatrix')
        .attr('in', 'noise').attr('type', 'saturate').attr('values', 0).attr('result', 'gray');
      grain.append('feBlend')
        .attr('in', 'SourceGraphic').attr('in2', 'gray').attr('mode', 'multiply');

      // Card shadow
      const cardShadow = defs.append('filter').attr('id', 'card-shadow')
        .attr('x', '-15%').attr('y', '-20%').attr('width', '130%').attr('height', '160%');
      cardShadow.append('feDropShadow')
        .attr('dx', 0).attr('dy', 3).attr('stdDeviation', 6)
        .attr('flood-color', 'rgba(60,40,20,0.22)');

      // Root card glow (warm gold)
      const rootGlow = defs.append('filter').attr('id', 'root-glow')
        .attr('x', '-25%').attr('y', '-25%').attr('width', '150%').attr('height', '150%');
      rootGlow.append('feDropShadow')
        .attr('dx', 0).attr('dy', 0).attr('stdDeviation', 10)
        .attr('flood-color', '#D4A020').attr('flood-opacity', 0.5);

      /* ── Parchment background ── */
      svg.append('rect').attr('width', totalW).attr('height', H)
        .attr('fill', PARCHMENT);

      // Subtle radial vignette
      const vigGrad = defs.append('radialGradient').attr('id', 'vignette')
        .attr('cx', '50%').attr('cy', '50%').attr('r', '70%');
      vigGrad.append('stop').attr('offset', '0%').attr('stop-color', 'transparent');
      vigGrad.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(120,90,40,0.12)');
      svg.append('rect').attr('width', totalW).attr('height', H)
        .attr('fill', 'url(#vignette)');

      /* ── Era band labels ── */
      const eraLabels: Array<{ label: string; depth: number; color: string }> = [
        { label: 'Present', depth: 0, color: '#C4880A' },
        { label: '1000–1500 CE', depth: 1, color: '#168038' },
        { label: '500–1000 CE', depth: 2, color: '#2858C8' },
        { label: 'Prehistoric', depth: 3, color: '#C04020' },
      ];

      eraLabels.filter(e => e.depth <= maxDepth).forEach(era => {
        const colX = MARGIN.left + (era.depth / maxDepth) * spreadW + (era.depth === 0 ? 0 : NODE_W / 2);
        // Vertical divider (except for first column)
        if (era.depth > 0) {
          svg.append('line')
            .attr('x1', MARGIN.left + era.depth * (NODE_W + H_GAP) - H_GAP / 2 - 4)
            .attr('y1', 28)
            .attr('x2', MARGIN.left + era.depth * (NODE_W + H_GAP) - H_GAP / 2 - 4)
            .attr('y2', H - 28)
            .attr('stroke', 'rgba(140,110,60,0.15)')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4,4');
        }
        svg.append('text')
          .attr('x', MARGIN.left + era.depth * (NODE_W + H_GAP) + NODE_W / 2)
          .attr('y', 22)
          .attr('text-anchor', 'middle')
          .attr('font-family', 'JetBrains Mono, monospace')
          .attr('font-size', 9)
          .attr('fill', era.color)
          .attr('opacity', 0.7)
          .text(era.label);
      });

      /* ── Main group ── */
      const g = svg.append('g')
        .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

      /* ─────────────────────────────────────────
         BRANCHES — smooth warm bezier curves
      ───────────────────────────────────────── */
      const links = root.links();

      // Branch shadows
      g.selectAll('.branch-shadow')
        .data(links).join('path')
        .attr('d', d => hLink(d.source.y! + NODE_W / 2, d.source.x!, d.target.y! - NODE_W / 2, d.target.x!))
        .attr('fill', 'none')
        .attr('stroke', 'rgba(100,70,30,0.18)')
        .attr('stroke-width', d => Math.max(2, 7 - d.source.depth * 1.8))
        .attr('stroke-linecap', 'round')
        .attr('transform', 'translate(2,3)');

      // Main branches
      g.selectAll('.branch')
        .data(links).join('path').attr('class', 'branch')
        .attr('d', d => hLink(d.source.y! + NODE_W / 2, d.source.x!, d.target.y! - NODE_W / 2, d.target.x!))
        .attr('fill', 'none')
        .attr('stroke', d => {
          const t = Math.min(d.source.depth / maxDepth, 1);
          return d3.interpolateRgb(BRANCH, '#5A3A18')(t);
        })
        .attr('stroke-width', d => Math.max(1.5, 6 - d.source.depth * 1.5))
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('opacity', 0)
        .transition().duration(600).delay((_, i) => i * 80)
        .attr('opacity', 0.85);

      // Branch highlight (lighter sheen along top of branch)
      g.selectAll('.branch-hi')
        .data(links).join('path')
        .attr('d', d => hLink(d.source.y! + NODE_W / 2, d.source.x! - 0.5, d.target.y! - NODE_W / 2, d.target.x! - 0.5))
        .attr('fill', 'none')
        .attr('stroke', BRANCH_LT)
        .attr('stroke-width', d => Math.max(0.5, 2 - d.source.depth * 0.4))
        .attr('stroke-linecap', 'round')
        .attr('opacity', 0.35);

      /* ─────────────────────────────────────────
         NODES — beautiful parchment cards
      ───────────────────────────────────────── */
      const nodes = g.selectAll('.node')
        .data(root.descendants())
        .join('g').attr('class', 'node')
        .attr('transform', d => `translate(${d.y},${d.x})`)
        .style('cursor', 'pointer')
        .on('click', (_, d) => setSelected(d.data));

      /* ─ Card background ─ */
      nodes.append('rect')
        .attr('x', -NODE_W / 2).attr('y', -NODE_H / 2)
        .attr('width', NODE_W).attr('height', NODE_H)
        .attr('rx', NODE_R)
        .attr('fill', d => getNodeColors(d.data.language).bg)
        .attr('stroke', d => getNodeColors(d.data.language).accent)
        .attr('stroke-width', d => d.depth === 0 ? 2.5 : 1.5)
        .attr('stroke-dasharray', d => d.data.isReconstructed ? '5,3' : 'none')
        .attr('filter', d => d.depth === 0 ? 'url(#root-glow)' : 'url(#card-shadow)')
        .attr('opacity', 0)
        .transition().duration(400).delay((_, i) => 100 + i * 55)
        .attr('opacity', 1);

      /* ─ Color accent bar (left side of card) ─ */
      nodes.append('rect')
        .attr('x', -NODE_W / 2).attr('y', -NODE_H / 2 + 6)
        .attr('width', 5).attr('height', NODE_H - 12)
        .attr('rx', 2.5)
        .attr('fill', d => getNodeColors(d.data.language).accent)
        .attr('opacity', 0)
        .transition().duration(400).delay((_, i) => 150 + i * 55)
        .attr('opacity', 1);

      /* ─ Root crown decoration ─ */
      nodes.filter(d => d.depth === 0).append('rect')
        .attr('x', -NODE_W / 2).attr('y', -NODE_H / 2)
        .attr('width', NODE_W).attr('height', 4)
        .attr('rx', NODE_R)
        .attr('fill', d => getNodeColors(d.data.language).accent);

      /* ─ Reconstructed badge ─ */
      nodes.filter(d => d.data.isReconstructed).append('text')
        .attr('x', NODE_W / 2 - 10).attr('y', -NODE_H / 2 + 14)
        .attr('text-anchor', 'middle')
        .attr('font-size', 10)
        .attr('fill', d => getNodeColors(d.data.language).accent)
        .attr('opacity', 0.8)
        .attr('pointer-events', 'none')
        .text('✶');

      /* ─ Word label ─ */
      nodes.append('text')
        .attr('text-anchor', 'middle').attr('dy', '-0.25em')
        .attr('font-family', 'Lora, Georgia, serif')
        .attr('font-size', d => d.depth === 0 ? 15 : 13.5)
        .attr('font-weight', d => d.depth === 0 ? '700' : '600')
        .attr('fill', d => getNodeColors(d.data.language).text)
        .attr('pointer-events', 'none')
        .text(d => {
          const w = d.data.word;
          return w.length > 17 ? w.slice(0, 15) + '…' : w;
        });

      /* ─ Language sublabel ─ */
      nodes.append('text')
        .attr('text-anchor', 'middle').attr('dy', '1.2em')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', 8)
        .attr('fill', d => getNodeColors(d.data.language).sub)
        .attr('pointer-events', 'none')
        .text(d => {
          const name = LANGUAGE_DEFS[d.data.language]?.name ?? 'Unknown';
          return name.replace(' ✶', '').length > 20
            ? name.replace(' ✶', '').slice(0, 18) + '…'
            : name.replace(' ✶', '');
        });

      /* ─ Era label (italic, faint) ─ */
      nodes.filter(d => !!d.data.era).append('text')
        .attr('text-anchor', 'middle').attr('dy', '2.5em')
        .attr('font-family', 'Lora, serif').attr('font-style', 'italic')
        .attr('font-size', 7)
        .attr('fill', d => getNodeColors(d.data.language).sub)
        .attr('opacity', 0.6)
        .attr('pointer-events', 'none')
        .text(d => d.data.era || '');

      /* ─ Hover glow ─ */
      nodes
        .on('mouseenter', function(_, d) {
          const c = getNodeColors(d.data.language);
          d3.select(this).select('rect:first-of-type')
            .transition().duration(150)
            .attr('stroke-width', d.depth === 0 ? 3.5 : 2.5)
            .style('filter', `drop-shadow(0 0 12px ${c.accent}80)`);
        })
        .on('mouseleave', function(_, d) {
          d3.select(this).select('rect:first-of-type')
            .transition().duration(200)
            .attr('stroke-width', d.depth === 0 ? 2.5 : 1.5)
            .style('filter', d.depth === 0 ? 'url(#root-glow)' : 'url(#card-shadow)');
        });

      /* ── Compass rose decoration (top-right) ── */
      const cr = svg.append('g').attr('transform', `translate(${totalW - 36},${H - 36})`);
      cr.append('text').attr('text-anchor', 'middle').attr('font-size', 28)
        .attr('fill', 'rgba(140,110,60,0.18)').attr('font-family', 'serif').text('✦');
      cr.append('text').attr('text-anchor', 'middle').attr('dy', '0.35em')
        .attr('font-family', 'JetBrains Mono').attr('font-size', 6)
        .attr('fill', 'rgba(140,110,60,0.35)').text('ety');

      /* ── Bottom instruction label ── */
      svg.append('text')
        .attr('x', totalW / 2).attr('y', H - 10)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'JetBrains Mono, monospace').attr('font-size', 8)
        .attr('fill', 'rgba(140,110,60,0.5)')
        .text('← most recent · click any card to inspect · oldest →');

      console.log(`[EtymologyTree] Rendered ${numNodes} nodes in horizontal layout ${totalW}×${H}`);

    } catch (e) {
      console.error('[EtymologyTree]', e);
      setErr('Tree render error. See console.');
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
    <div className="relative w-full h-full flex flex-col bg-[#F5EFE0]">
      {/* Toolbar */}
      <div className="absolute top-2 right-3 z-10">
        <button onClick={exportSVG}
          className="text-[10px] font-mono text-[#8A6A30] hover:text-[#4A3010] border border-[#C4A870]/40 hover:border-[#C4A870] rounded-lg px-3 py-1.5 bg-[#FDF8EE]/80 backdrop-blur hover:bg-[#FDF8EE] transition-all duration-200 cursor-pointer shadow-sm">
          export SVG
        </button>
      </div>

      <div ref={containerRef} className="flex-1 overflow-auto"
        style={{ minHeight: `${SVG_H}px` }}>
        {err ? (
          <div className="flex items-center justify-center h-full text-sm font-mono text-red-700 p-8">
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

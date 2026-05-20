// src/components/EtymologyTree.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import type { EtymNode, WordData } from '../types/etymology';
import { LANGUAGE_DEFS, formatLanguageLabel } from '../lib/languages';
import NodeTooltip from './NodeTooltip';

interface Props {
  data: WordData;
}

const NODE_W = 160;
const NODE_H = 52;
const MARGIN = { top: 70, right: 80, bottom: 70, left: 80 };
const SVG_HEIGHT = 520;

export default function EtymologyTree({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<EtymNode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const drawTree = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;

    try {
      // Verify tree data exists and is valid
      if (!data?.tree) {
        setError('No etymology tree data available.');
        return;
      }

      setError(null);

      const containerWidth = containerRef.current.getBoundingClientRect().width;
      const width = Math.max(containerWidth || 700, 500);
      const height = SVG_HEIGHT;
      const innerW = width - MARGIN.left - MARGIN.right;
      const innerH = height - MARGIN.top - MARGIN.bottom;

      // Build D3 hierarchy — children are ancestor branches
      const root = d3.hierarchy<EtymNode>(data.tree, d => (d.children && d.children.length > 0 ? d.children : null));
      const nodeCount = root.descendants().length;

      // Tree layout — vertical (root at top, ancestors below)
      const treeLayout = d3.tree<EtymNode>()
        .size([innerW, innerH])
        .separation((a, b) => (a.parent === b.parent ? 1.6 : 2.2));

      treeLayout(root);

      // Setup SVG — use explicit pixel height, NOT '100%'
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();
      svg
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('width', width)
        .attr('height', height)
        .style('display', 'block')
        .style('overflow', 'visible');

      // Background subtle grid
      const defs = svg.append('defs');
      const pattern = defs.append('pattern')
        .attr('id', 'grid')
        .attr('width', 40)
        .attr('height', 40)
        .attr('patternUnits', 'userSpaceOnUse');
      pattern.append('path')
        .attr('d', 'M 40 0 L 0 0 0 40')
        .attr('fill', 'none')
        .attr('stroke', '#1E1C16')
        .attr('stroke-width', 0.5);
      svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'url(#grid)')
        .attr('opacity', 0.6);

      // Drop shadow filter
      const filter = defs.append('filter').attr('id', 'node-shadow');
      filter.append('feDropShadow')
        .attr('dx', 0)
        .attr('dy', 3)
        .attr('stdDeviation', 6)
        .attr('flood-color', '#000')
        .attr('flood-opacity', 0.5);

      const g = svg.append('g')
        .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

      // Draw links (curved connectors)
      const linkGen = d3.linkVertical<d3.HierarchyPointLink<EtymNode>, d3.HierarchyPointNode<EtymNode>>()
        .x(d => d.x)
        .y(d => d.y);

      g.selectAll('.link')
        .data(root.links())
        .join('path')
        .attr('class', 'link')
        .attr('d', linkGen)
        .attr('fill', 'none')
        .attr('stroke', '#6A6040')
        .attr('stroke-width', 1.8)
        .attr('stroke-dasharray', d => d.target.data.isReconstructed ? '6,4' : 'none')
        .attr('opacity', 0);

      // Animate links in
      g.selectAll('.link')
        .transition()
        .duration(600)
        .delay((_, i) => i * 80)
        .attr('opacity', 0.75);

      // Draw node groups
      const node = g.selectAll('.node')
        .data(root.descendants())
        .join('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.x},${d.y})`)
        .style('cursor', 'pointer')
        .on('click', (_, d) => setSelected(d.data));

      // Node background rect
      node.append('rect')
        .attr('x', -NODE_W / 2)
        .attr('y', -NODE_H / 2)
        .attr('width', NODE_W)
        .attr('height', NODE_H)
        .attr('rx', 9)
        .attr('fill', d => {
          const def = LANGUAGE_DEFS[d.data.language] ?? LANGUAGE_DEFS['unknown'];
          return def.fill;
        })
        .attr('stroke', d => {
          const def = LANGUAGE_DEFS[d.data.language] ?? LANGUAGE_DEFS['unknown'];
          return def.stroke;
        })
        .attr('stroke-width', d => d.depth === 0 ? 2.5 : 1.5)
        .attr('stroke-dasharray', d => d.data.isReconstructed ? '6,4' : 'none')
        .attr('filter', 'url(#node-shadow)')
        .attr('opacity', 0);

      // Animate node rects in
      node.selectAll('rect')
        .transition()
        .duration(500)
        .delay((_, i) => i * 60 + 200)
        .attr('opacity', 1);

      // Root node golden top ribbon
      node.filter(d => d.depth === 0)
        .append('rect')
        .attr('x', -NODE_W / 2)
        .attr('y', -NODE_H / 2)
        .attr('width', NODE_W)
        .attr('height', 3)
        .attr('rx', 2)
        .attr('fill', '#C4973A');

      // Word label
      node.append('text')
        .attr('dy', '-0.15em')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', d => d.depth === 0 ? 14.5 : 13)
        .attr('font-weight', d => d.depth === 0 ? '600' : '400')
        .attr('font-family', 'Lora, Georgia, serif')
        .attr('fill', d => {
          const def = LANGUAGE_DEFS[d.data.language] ?? LANGUAGE_DEFS['unknown'];
          return def.text;
        })
        .attr('pointer-events', 'none')
        .text(d => {
          const w = d.data.word;
          return w.length > 18 ? w.slice(0, 16) + '…' : w;
        });

      // Language sublabel
      node.append('text')
        .attr('dy', '1.3em')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 8.5)
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('fill', d => {
          const def = LANGUAGE_DEFS[d.data.language] ?? LANGUAGE_DEFS['unknown'];
          return def.stroke;
        })
        .attr('pointer-events', 'none')
        .attr('opacity', 0.9)
        .text(d => {
          const label = formatLanguageLabel(d.data.language, undefined);
          return label.length > 22 ? label.slice(0, 20) + '…' : label;
        });

      // Hover interaction highlight
      node.on('mouseenter', function(_, d) {
        d3.select(this).select('rect')
          .transition().duration(150)
          .attr('stroke-width', d.depth === 0 ? 3.5 : 2.5)
          .attr('opacity', 0.95);
      }).on('mouseleave', function(_, d) {
        d3.select(this).select('rect')
          .transition().duration(150)
          .attr('stroke-width', d.depth === 0 ? 2.5 : 1.5)
          .attr('opacity', 1);
      });

      // Debug: log node count to console
      console.log(`[EtymologyTree] Rendered ${nodeCount} nodes, SVG: ${width}x${height}`);

    } catch (err) {
      console.error('[EtymologyTree] Render error:', err);
      setError('Failed to render etymology tree. Check console for details.');
    }
  }, [data]);

  // Initial draw + redraw on data change
  useEffect(() => {
    drawTree();
  }, [drawTree]);

  // Responsive resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => drawTree());
    ro.observe(el);
    return () => ro.disconnect();
  }, [drawTree]);

  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgRef.current);
    if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.word}-etymology.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-full h-full flex flex-col select-none">
      {/* Toolbar */}
      <div className="absolute top-[-36px] right-0 flex gap-2">
        <button
          onClick={handleExportSVG}
          className="text-[11px] font-mono text-[#8A7D5E] hover:text-[#EDE0C4] border border-[#2E2B22] rounded-md px-2.5 py-1 bg-[#1A1810] hover:border-[#C4973A] transition-all duration-200 cursor-pointer"
        >
          export SVG
        </button>
      </div>

      {/* Tree canvas */}
      <div
        ref={containerRef}
        className="flex-1 w-full overflow-x-auto overflow-y-auto"
        style={{ minHeight: `${SVG_HEIGHT}px` }}
      >
        {error ? (
          <div className="flex items-center justify-center h-full text-sm font-mono text-[#8A3A28] p-8 text-center">
            <span>⚠ {error}</span>
          </div>
        ) : (
          <svg
            ref={svgRef}
            style={{ display: 'block', minHeight: `${SVG_HEIGHT}px` }}
          />
        )}
      </div>

      {selected && (
        <NodeTooltip node={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

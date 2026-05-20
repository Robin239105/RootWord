// src/components/EtymologyTree.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { EtymNode, WordData } from '../types/etymology';
import { LANGUAGE_DEFS, formatLanguageLabel } from '../lib/languages';
import NodeTooltip from './NodeTooltip';

interface Props {
  data: WordData;
}

export default function EtymologyTree({ data }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<EtymNode | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Responsive width calculation
    const clientWidth = svgRef.current.parentElement?.clientWidth || 800;
    const width = Math.max(clientWidth, 600);
    const height = 480;
    const margin = { top: 60, right: 60, bottom: 60, left: 60 };

    // Initialize D3 hierarchy
    const root = d3.hierarchy(data.tree, d => d.children);

    // Tree layout configuration
    const treeLayout = d3.tree<EtymNode>()
      .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
      .separation((a, b) => (a.parent === b.parent ? 1.4 : 1.8));

    treeLayout(root);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .attr('width', '100%')
       .attr('height', '100%');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Draw curved lines
    g.selectAll('.link')
      .data(root.links())
      .join('path')
      .attr('class', 'link')
      .attr('d', d3.linkVertical<d3.HierarchyPointLink<EtymNode>, d3.HierarchyPointNode<EtymNode>>()
        .x(d => d.x)
        .y(d => d.y)
      )
      .attr('fill', 'none')
      .attr('stroke', '#5A5240')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', d => d.target.data.isReconstructed ? '5,4' : 'none')
      .attr('opacity', 0.7);

    // Draw nodes group
    const node = g.selectAll('.node')
      .data(root.descendants())
      .join('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (_, d) => setSelected(d.data));

    // Styling configurations
    const nodeWidth = 150;
    const nodeHeight = 50;

    // Node Rect Backgrounds
    node.append('rect')
      .attr('x', -nodeWidth / 2)
      .attr('y', -nodeHeight / 2)
      .attr('width', nodeWidth)
      .attr('height', nodeHeight)
      .attr('rx', 8)
      .attr('fill', d => {
        const langDef = LANGUAGE_DEFS[d.data.language] ?? LANGUAGE_DEFS['unknown'];
        return langDef.fill;
      })
      .attr('stroke', d => {
        const langDef = LANGUAGE_DEFS[d.data.language] ?? LANGUAGE_DEFS['unknown'];
        return langDef.stroke;
      })
      .attr('stroke-width', d => d.depth === 0 ? 2.5 : 1.5)
      .attr('stroke-dasharray', d => d.data.isReconstructed ? '5,4' : 'none')
      .attr('filter', 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))');

    // Decorative golden accent ribbon on the root English search node
    node.filter(d => d.depth === 0).append('rect')
      .attr('x', -nodeWidth / 2)
      .attr('y', -nodeHeight / 2)
      .attr('width', nodeWidth)
      .attr('height', 3)
      .attr('rx', 1.5)
      .attr('fill', '#C4973A');

    // Word Text
    node.append('text')
      .attr('dy', '-0.1em')
      .attr('text-anchor', 'middle')
      .attr('font-size', d => d.depth === 0 ? 14 : 12.5)
      .attr('font-weight', d => d.depth === 0 ? '600' : '400')
      .attr('font-family', 'Lora, Georgia, serif')
      .attr('fill', d => {
        const langDef = LANGUAGE_DEFS[d.data.language] ?? LANGUAGE_DEFS['unknown'];
        return langDef.text;
      })
      .text(d => d.data.word.length > 17 ? d.data.word.slice(0, 15) + '…' : d.data.word);

    // Subtitle Monospace Language Labels
    node.append('text')
      .attr('dy', '1.15em')
      .attr('text-anchor', 'middle')
      .attr('font-size', 8)
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', d => {
        const langDef = LANGUAGE_DEFS[d.data.language] ?? LANGUAGE_DEFS['unknown'];
        return langDef.stroke;
      })
      .text(d => formatLanguageLabel(d.data.language, d.data.era));

  }, [data]);

  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const svgEl = svgRef.current;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgEl);

    // Add XML declarations
    if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `${data.word}-etymology-tree.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between select-none">
      {/* Dynamic inline toolbar */}
      <div className="absolute top-[-36px] right-0 flex gap-2">
        <button 
          onClick={handleExportSVG}
          className="text-[11px] font-mono text-[#8A7D5E] hover:text-[#EDE0C4] border border-[#2E2B22] rounded-md px-2.5 py-1 bg-[#1A1810] hover:border-[#C4973A] transition-aesthetic cursor-pointer"
        >
          export SVG
        </button>
      </div>

      <div className="flex-1 w-full h-full min-h-[440px] flex items-center justify-center overflow-x-auto overflow-y-hidden">
        <svg ref={svgRef} className="block w-full max-w-5xl h-[480px]" />
      </div>

      {selected && (
        <NodeTooltip node={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

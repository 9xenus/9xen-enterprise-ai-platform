import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  Database,
  Cpu,
  Box,
  Wrench,
  Search,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  ExternalLink,
  Filter,
  Layers,
  Sparkles,
  Play,
  ArrowRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  category: 'table' | 'product' | 'model' | 'service';
  typeLabel: string;
  description: string;
  details?: {
    primaryKey?: string;
    rowCount?: string;
    linkedApiRoutes?: string[];
    techStack?: string;
    metrics?: string;
  };
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  relationship: string;
  type: 'data' | 'dependency' | 'inference' | 'service';
}

const INITIAL_NODES: GraphNode[] = [
  // Database Tables
  {
    id: 'tbl-products',
    name: 'products',
    category: 'table',
    typeLabel: 'DuckDB Table',
    description: 'Stores enterprise products catalog, features, pricing tiers, and metadata.',
    details: { primaryKey: 'id (VARCHAR)', rowCount: '5 records', linkedApiRoutes: ['/api/content/products', '/api/assistant/chat'] },
  },
  {
    id: 'tbl-services',
    name: 'services',
    category: 'table',
    typeLabel: 'DuckDB Table',
    description: 'Institutional AI data training, fine-tuning, and VPC deployment service definitions.',
    details: { primaryKey: 'id (VARCHAR)', rowCount: '4 records', linkedApiRoutes: ['/api/content/services'] },
  },
  {
    id: 'tbl-outreach-queue',
    name: 'outreach_queue',
    category: 'table',
    typeLabel: 'DuckDB Table',
    description: 'AI-classified B2B lead pipeline with intent tags and suggested draft responses.',
    details: { primaryKey: 'id (VARCHAR)', rowCount: '6 active leads', linkedApiRoutes: ['/api/outreach/queue', '/api/outreach/batch-classify'] },
  },
  {
    id: 'tbl-outreach-templates',
    name: 'outreach_templates',
    category: 'table',
    typeLabel: 'DuckDB Table',
    description: 'Prompt templates and instructions for Gemini outreach draft response generation.',
    details: { primaryKey: 'id (VARCHAR)', rowCount: '4 templates', linkedApiRoutes: ['/api/outreach/templates'] },
  },
  {
    id: 'tbl-telemetry',
    name: 'telemetry_logs',
    category: 'table',
    typeLabel: 'DuckDB Table',
    description: 'High-throughput inference logs, token counts, model latency, and SLA metrics.',
    details: { primaryKey: 'id (VARCHAR)', rowCount: '1,840+ logs', linkedApiRoutes: ['/api/admin/telemetry'] },
  },
  {
    id: 'tbl-activity',
    name: 'activity_logs',
    category: 'table',
    typeLabel: 'DuckDB Table',
    description: 'Cryptographic administrative audit logs for SOC-2 compliance and configuration changes.',
    details: { primaryKey: 'id (VARCHAR)', rowCount: '142 logs', linkedApiRoutes: ['/api/admin/duckdb-sync'] },
  },

  // Products
  {
    id: 'prod-quant',
    name: 'Quant Trading Engine',
    category: 'product',
    typeLabel: 'Platform Product',
    description: 'High-frequency Forex & Crypto trading bot (AlphaBot Pro) with prop firm drawdown guardrails.',
    details: { techStack: 'MetaTrader 5 / FIX 4.4 / C++ Core', metrics: '< 1.8ms execution latency' },
  },
  {
    id: 'prod-agentic',
    name: 'Agentic Core',
    category: 'product',
    typeLabel: 'Platform Product',
    description: 'Autonomous multi-agent orchestration framework with stateful memory and tool integration.',
    details: { techStack: 'Node.js / Python vLLM / Vector Store', metrics: '99.4% task completion' },
  },
  {
    id: 'prod-reguletter',
    name: 'Reguletter RegTech',
    category: 'product',
    typeLabel: 'Platform Product',
    description: 'Real-time regulatory compliance engine tracking SEC, FINRA, and EU AI Act mandates.',
    details: { techStack: 'RegTech Knowledge Graph / Natural Language Engine', metrics: '85% audit labor reduction' },
  },
  {
    id: 'prod-gateway',
    name: 'Enterprise Guardrail Proxy',
    category: 'product',
    typeLabel: 'Platform Product',
    description: 'Sub-5ms AI firewall preventing prompt injection, PII leakage, and enforcing token quotas.',
    details: { techStack: 'Rust / Envoy Proxy / DuckDB Telemetry', metrics: 'Sub-5ms firewall latency' },
  },

  // Models
  {
    id: 'model-omni',
    name: '9xen Omni 2.5',
    category: 'model',
    typeLabel: 'Foundation AI Model',
    description: 'Flagship multi-modal foundation model with 1M context window and cached prompt support.',
    details: { techStack: '@google/genai SDK', metrics: '1M Context Window' },
  },
  {
    id: 'model-reasoning',
    name: '9xen Reasoning Pro',
    category: 'model',
    typeLabel: 'Foundation AI Model',
    description: 'Frontier chain-of-thought model engineered for complex mathematical and regulatory logic.',
    details: { techStack: 'Deep Reasoning CoT Architecture', metrics: 'Frontier Benchmark Grade' },
  },
  {
    id: 'model-flash',
    name: 'Gemini 3.8 Flash',
    category: 'model',
    typeLabel: 'Foundation AI Model',
    description: 'Ultra-low latency model powering real-time sales chat and lead classification.',
    details: { techStack: 'Gemini 3.8 Flash / Flash Turbo', metrics: 'Sub-38ms TTFT' },
  },
  {
    id: 'model-alphabot',
    name: 'AlphaBot Quant Neural Engine',
    category: 'model',
    typeLabel: 'Specialized Neural Engine',
    description: 'Proprietary orderflow delta and triangular arbitrage neural model for financial markets.',
    details: { techStack: 'TensorRT-LLM / CUDA 12.2', metrics: 'Zero Slippage Execution' },
  },
  {
    id: 'model-imagen',
    name: 'Imagen 3 & Gemini Vision',
    category: 'model',
    typeLabel: 'Vision Model',
    description: 'High-resolution image generation engine synthesizing 16:9 panoramic cybernetic assets.',
    details: { techStack: 'Imagen 3 / Gemini 3.1 Flash Image', metrics: '8K Volumetric Synthesis' },
  },

  // Services
  {
    id: 'svc-training',
    name: 'AI Data Training',
    category: 'service',
    typeLabel: 'Enterprise Service',
    description: 'Custom dataset curation, synthetic data generation, and model fine-tuning for enterprises.',
    details: { techStack: 'Distributed GPU Cluster / Multi-Tenant Isolation' },
  },
  {
    id: 'svc-finetuning',
    name: 'Custom Model Alignment',
    category: 'service',
    typeLabel: 'Enterprise Service',
    description: 'Domain-specific LoRA adaptation and RLHF policy alignment for proprietary quant algorithms.',
    details: { techStack: 'PyTorch / Distributed Quantization' },
  },
  {
    id: 'svc-vpc',
    name: 'Private VPC Deployment',
    category: 'service',
    typeLabel: 'Enterprise Service',
    description: 'Air-gapped deployment in client AWS EKS, Google GKE, or Azure AKS with Zero Data Retention.',
    details: { techStack: 'Helm / Kubernetes / Zero Data Retention' },
  },
  {
    id: 'svc-audit',
    name: 'SOC-2 & Governance Audit',
    category: 'service',
    typeLabel: 'Enterprise Service',
    description: 'Comprehensive AI security audit, model risk evaluation, and cryptographic proof verification.',
    details: { techStack: 'SOC-2 Type II / ISO 27001 / HIPAA' },
  },
];

const INITIAL_LINKS: GraphLink[] = [
  // Products -> Tables
  { source: 'prod-quant', target: 'tbl-products', relationship: 'Persisted in', type: 'data' },
  { source: 'prod-agentic', target: 'tbl-products', relationship: 'Persisted in', type: 'data' },
  { source: 'prod-reguletter', target: 'tbl-products', relationship: 'Persisted in', type: 'data' },
  { source: 'prod-gateway', target: 'tbl-telemetry', relationship: 'Logs inferences to', type: 'data' },

  // Products -> Models
  { source: 'prod-quant', target: 'model-alphabot', relationship: 'Engineered with', type: 'dependency' },
  { source: 'prod-quant', target: 'model-flash', relationship: 'Execution signals via', type: 'inference' },
  { source: 'prod-agentic', target: 'model-omni', relationship: 'Powered by', type: 'inference' },
  { source: 'prod-agentic', target: 'model-reasoning', relationship: 'Planning via', type: 'inference' },
  { source: 'prod-reguletter', target: 'model-reasoning', relationship: 'Policy evaluation via', type: 'inference' },
  { source: 'prod-gateway', target: 'model-omni', relationship: 'Protects & proxies', type: 'dependency' },
  { source: 'prod-gateway', target: 'model-flash', relationship: 'Protects & proxies', type: 'dependency' },

  // Services -> Tables & Products
  { source: 'svc-training', target: 'tbl-services', relationship: 'Persisted in', type: 'data' },
  { source: 'svc-finetuning', target: 'tbl-services', relationship: 'Persisted in', type: 'data' },
  { source: 'svc-vpc', target: 'tbl-services', relationship: 'Persisted in', type: 'data' },
  { source: 'svc-audit', target: 'tbl-activity', relationship: 'Audits logs in', type: 'data' },

  { source: 'svc-finetuning', target: 'model-alphabot', relationship: 'Optimizes strategy for', type: 'service' },
  { source: 'svc-training', target: 'model-omni', relationship: 'Curates datasets for', type: 'service' },
  { source: 'svc-vpc', target: 'prod-gateway', relationship: 'Deploys air-gapped', type: 'service' },

  // Tables -> Outreach & AI Operations
  { source: 'tbl-outreach-queue', target: 'tbl-outreach-templates', relationship: 'Uses templates from', type: 'data' },
  { source: 'tbl-outreach-queue', target: 'model-flash', relationship: 'Classified & drafted by', type: 'inference' },
  { source: 'tbl-telemetry', target: 'tbl-activity', relationship: 'Synchronizes telemetry to', type: 'data' },
];

interface Props {
  onQueryTable?: (tableName: string) => void;
}

export const DatabaseRelationshipGraph: React.FC<Props> = ({ onQueryTable }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(INITIAL_NODES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Filter nodes based on search and category
  const filteredNodes = INITIAL_NODES.filter((node) => {
    const matchesCategory = activeCategoryFilter === 'all' || node.category === activeCategoryFilter;
    const matchesSearch =
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.typeLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));

  const filteredLinks = INITIAL_LINKS.filter((link) => {
    const sourceId = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source;
    const targetId = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target;
    return filteredNodeIds.has(sourceId) && filteredNodeIds.has(targetId);
  });

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 900;
    const height = 520;

    // Clear previous SVG contents
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Create marker defs for arrows
    const defs = svg.append('defs');

    // Arrow markers for different link types
    const createMarker = (id: string, color: string) => {
      defs
        .append('marker')
        .attr('id', id)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 24)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', color);
    };

    createMarker('arrow-data', '#10b981');
    createMarker('arrow-dependency', '#38bdf8');
    createMarker('arrow-inference', '#a855f7');
    createMarker('arrow-service', '#f59e0b');

    // Container group for zooming
    const g = svg.append('g').attr('class', 'graph-container');

    // Setup D3 Zoom
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(Math.round(event.transform.k * 100) / 100);
      });

    svg.call(zoomBehavior as any);

    // Deep clone nodes and links to prevent simulation mutation issues
    const nodesData: GraphNode[] = filteredNodes.map((d) => ({ ...d }));
    const linksData: GraphLink[] = filteredLinks.map((d) => ({
      ...d,
      source: typeof d.source === 'object' ? (d.source as GraphNode).id : d.source,
      target: typeof d.target === 'object' ? (d.target as GraphNode).id : d.target,
    }));

    // Setup Force Simulation
    const simulation = d3
      .forceSimulation<GraphNode>(nodesData)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(linksData)
          .id((d) => d.id)
          .distance(120)
      )
      .force('charge', d3.forceManyBody().strength(-350))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(45));

    // Draw Links
    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(linksData)
      .enter()
      .append('line')
      .attr('stroke-width', 1.8)
      .attr('stroke', (d) => {
        if (d.type === 'data') return '#10b98188';
        if (d.type === 'dependency') return '#38bdf888';
        if (d.type === 'inference') return '#a855f788';
        return '#f59e0b88';
      })
      .attr('marker-end', (d) => `url(#arrow-${d.type})`);

    // Draw Link Labels
    const linkLabel = g
      .append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(linksData)
      .enter()
      .append('text')
      .text((d) => d.relationship)
      .attr('font-size', '9px')
      .attr('font-weight', '500')
      .attr('fill', '#94a3b8')
      .attr('text-anchor', 'middle')
      .attr('dy', -4);

    // Drag Behavior
    const drag = (sim: d3.Simulation<GraphNode, undefined>) => {
      function dragstarted(event: any, d: GraphNode) {
        if (!event.active) sim.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event: any, d: GraphNode) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event: any, d: GraphNode) {
        if (!event.active) sim.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3.drag<SVGGElement, GraphNode>().on('start', dragstarted).on('drag', dragged).on('end', dragended);
    };

    // Helper functions for category colors
    const getNodeColor = (cat: string) => {
      switch (cat) {
        case 'table':
          return { bg: '#059669', border: '#34d399', text: '#ecfdf5', glow: '#10b98144' };
        case 'product':
          return { bg: '#0284c7', border: '#38bdf8', text: '#f0f9ff', glow: '#0284c744' };
        case 'model':
          return { bg: '#7e22ce', border: '#c084fc', text: '#faf5ff', glow: '#a855f744' };
        case 'service':
          return { bg: '#d97706', border: '#fbbf24', text: '#fffbeb', glow: '#f59e0b44' };
        default:
          return { bg: '#475569', border: '#94a3b8', text: '#f8fafc', glow: '#64748b44' };
      }
    };

    // Draw Node Groups
    const node = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodesData)
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .style('cursor', 'pointer')
      .call(drag(simulation) as any)
      .on('click', (_event, d) => {
        setSelectedNode(d);
      });

    // Node Outer Glow / Halo
    node
      .append('circle')
      .attr('r', (d) => (d.category === 'table' ? 22 : 20))
      .attr('fill', (d) => getNodeColor(d.category).glow)
      .attr('stroke', (d) => getNodeColor(d.category).border)
      .attr('stroke-width', 2);

    // Inner Circle
    node
      .append('circle')
      .attr('r', (d) => (d.category === 'table' ? 18 : 16))
      .attr('fill', (d) => getNodeColor(d.category).bg);

    // Node Labels
    node
      .append('text')
      .text((d) => d.name)
      .attr('x', 0)
      .attr('y', 32)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', '#f1f5f9')
      .attr('class', 'select-none pointer-events-none');

    // Type Label Pill
    node
      .append('text')
      .text((d) => d.typeLabel)
      .attr('x', 0)
      .attr('y', 44)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8.5px')
      .attr('font-weight', '500')
      .attr('fill', '#94a3b8')
      .attr('class', 'select-none pointer-events-none');

    // Simulation Ticks
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      linkLabel
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2);

      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [searchQuery, activeCategoryFilter]);

  const handleResetZoom = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(500).call(d3.zoom().transform as any, d3.zoomIdentity);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full bg-slate-950 text-slate-100 rounded-xl overflow-hidden">
      {/* Visualizer Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800/80 relative">
        {/* Graph Toolbar */}
        <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative w-48 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search nodes or links..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Filter Category Chips */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {[
                { id: 'all', label: 'All', icon: Layers },
                { id: 'table', label: 'Tables', icon: Database },
                { id: 'product', label: 'Products', icon: Box },
                { id: 'model', label: 'Models', icon: Cpu },
                { id: 'service', label: 'Services', icon: Wrench },
              ].map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryFilter(cat.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">
              Zoom: {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleResetZoom}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-all"
              title="Reset Zoom & Pan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* D3 Canvas Stage */}
        <div ref={containerRef} className="flex-1 w-full h-[520px] bg-slate-950/90 relative overflow-hidden">
          <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Legend Overlay */}
          <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800/80 p-2.5 rounded-xl backdrop-blur-md space-y-1.5 shadow-xl text-[11px]">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Graph Legend</div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-300 font-medium">DuckDB Tables</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span className="text-slate-300 font-medium">Platform Products</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="text-slate-300 font-medium">Foundation Models</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-300 font-medium">Enterprise Services</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Node Details Drawer */}
      <div className="w-full lg:w-80 bg-slate-900/60 p-5 flex flex-col justify-between space-y-5 border-t lg:border-t-0 border-slate-800">
        {selectedNode ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-0.5">
                  {selectedNode.typeLabel}
                </span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  {selectedNode.name}
                </h3>
              </div>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                  selectedNode.category === 'table'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : selectedNode.category === 'product'
                    ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                    : selectedNode.category === 'model'
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                {selectedNode.category}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              {selectedNode.description}
            </p>

            {/* Node Metadata Section */}
            {selectedNode.details && (
              <div className="space-y-2 text-xs">
                {selectedNode.details.primaryKey && (
                  <div className="flex justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800/50">
                    <span className="text-slate-400">Primary Key:</span>
                    <span className="text-emerald-400 font-mono font-semibold">{selectedNode.details.primaryKey}</span>
                  </div>
                )}
                {selectedNode.details.rowCount && (
                  <div className="flex justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800/50">
                    <span className="text-slate-400">Record Volume:</span>
                    <span className="text-cyan-300 font-semibold">{selectedNode.details.rowCount}</span>
                  </div>
                )}
                {selectedNode.details.techStack && (
                  <div className="flex justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800/50">
                    <span className="text-slate-400">Core Runtime:</span>
                    <span className="text-purple-300 font-medium">{selectedNode.details.techStack}</span>
                  </div>
                )}
                {selectedNode.details.metrics && (
                  <div className="flex justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800/50">
                    <span className="text-slate-400">Performance Metric:</span>
                    <span className="text-amber-300 font-semibold">{selectedNode.details.metrics}</span>
                  </div>
                )}
                {selectedNode.details.linkedApiRoutes && (
                  <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800/50 space-y-1">
                    <span className="text-slate-400 block font-medium">Linked Express Endpoints:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedNode.details.linkedApiRoutes.map((route) => (
                        <span key={route} className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 font-mono px-1.5 py-0.5 rounded">
                          {route}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Action Button */}
            {selectedNode.category === 'table' && onQueryTable && (
              <button
                onClick={() => onQueryTable(selectedNode.name)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Query {selectedNode.name} Table in SQL Console</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 space-y-2">
            <Info className="w-6 h-6 opacity-40" />
            <p className="text-xs">Click any node in the graph to inspect schema details, linked models, and API endpoints.</p>
          </div>
        )}

        <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> D3.js Force Layout
          </span>
          <span>{filteredNodes.length} Nodes / {filteredLinks.length} Links</span>
        </div>
      </div>
    </div>
  );
};

/**
 * PathwayDiagram — renderizador SVG puro de fluxos de decisão clínica.
 *
 * Recebe nodes/edges da Pathway e produz um diagrama hierárquico top-down.
 * Sem dependências externas além de React.
 *
 * Algoritmo de layout: BFS a partir do nó entry → atribui níveis →
 * distribui nós horizontalmente centrados em cada nível →
 * bezier cúbico vertical para cada edge.
 */

import { useMemo } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface PathwayNode {
  id: string;
  label: string;
  node_type: 'entry' | 'decision' | 'exam' | 'intervention' | 'followup' | string;
  notes?: string;
}

export interface PathwayEdge {
  from_node: string;
  to_node: string;
  condition_label?: string;
}

// ─── Constantes de layout ─────────────────────────────────────────────────────

const NODE_W = 186;
const NODE_H = 52;
const DECISION_W = 192;
const DECISION_H = 58; // altura aumentada para acomodar losango
const LEVEL_GAP = 110; // espaço vertical entre níveis (borda inf → borda sup)
const H_GAP = 28;      // espaço horizontal entre nós no mesmo nível
const PAD_X = 30;
const PAD_Y = 24;

// ─── Estilos por node_type ────────────────────────────────────────────────────

const NODE_STYLE: Record<
  string,
  { fill: string; stroke: string; labelColor: string }
> = {
  entry:        { fill: '#DBEAFE', stroke: '#3B82F6', labelColor: '#1E40AF' },
  decision:     { fill: '#FEF9C3', stroke: '#F59E0B', labelColor: '#92400E' },
  exam:         { fill: '#D1FAE5', stroke: '#059669', labelColor: '#064E3B' },
  intervention: { fill: '#EDE9FE', stroke: '#7C3AED', labelColor: '#4C1D95' },
  followup:     { fill: '#FFEDD5', stroke: '#EA580C', labelColor: '#7C2D12' },
  default:      { fill: '#F1F5F9', stroke: '#94A3B8', labelColor: '#1E293B' },
};

const NODE_TYPE_LABEL: Record<string, string> = {
  entry: 'Entrada',
  decision: 'Decisão',
  exam: 'Exame',
  intervention: 'Intervenção',
  followup: 'Seguimento',
};

// ─── Algoritmo de layout ──────────────────────────────────────────────────────

interface LayoutNode {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  level: number;
  node: PathwayNode;
}

/** Quebra texto longo em múltiplas linhas para caber no nó */
function wrapText(text: string, maxChars = 22): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > maxChars && line.length > 0) {
      lines.push(line.trim());
      line = w;
    } else {
      line = (line + ' ' + w).trim();
    }
  }
  if (line) lines.push(line.trim());
  return lines;
}

function computeLayout(
  nodes: PathwayNode[],
  edges: PathwayEdge[],
): { nodeLayouts: LayoutNode[]; svgWidth: number; svgHeight: number } {
  // Guard: nenhum nó → retorna SVG vazio
  if (nodes.length === 0) {
    return { nodeLayouts: [], svgWidth: 200, svgHeight: 100 };
  }

  // Mapa de filhos e pais
  const children = new Map<string, string[]>();
  const parents = new Map<string, string[]>();
  for (const n of nodes) {
    children.set(n.id, []);
    parents.set(n.id, []);
  }
  for (const e of edges) {
    children.get(e.from_node)?.push(e.to_node);
    parents.get(e.to_node)?.push(e.from_node);
  }

  // Encontra nó entry (ou primeiro nó sem pais)
  const entryNode =
    nodes.find((n) => n.node_type === 'entry') ??
    nodes.find((n) => (parents.get(n.id) ?? []).length === 0) ??
    nodes[0];

  // BFS para atribuir níveis
  const levelMap = new Map<string, number>();
  const queue: string[] = [entryNode.id];
  levelMap.set(entryNode.id, 0);
  while (queue.length > 0) {
    const cur = queue.shift()!;
    const curLevel = levelMap.get(cur)!;
    for (const child of children.get(cur) ?? []) {
      if (!levelMap.has(child)) {
        levelMap.set(child, curLevel + 1);
        queue.push(child);
      } else {
        // Toma o nível máximo para nós com múltiplos pais (ex: convergência)
        const existing = levelMap.get(child)!;
        if (curLevel + 1 > existing) {
          levelMap.set(child, curLevel + 1);
        }
      }
    }
  }

  // Agrupa nós por nível, preservando ordem de chegada pelo BFS
  const byLevel = new Map<number, string[]>();
  for (const [id, lv] of levelMap) {
    if (!byLevel.has(lv)) byLevel.set(lv, []);
    byLevel.get(lv)!.push(id);
  }

  // Ordena nós dentro de cada nível pelo id do pai (mantém coerência visual)
  for (const [lv, ids] of byLevel) {
    if (lv === 0) continue;
    ids.sort((a, b) => {
      const pa = parents.get(a)?.[0] ?? '';
      const pb = parents.get(b)?.[0] ?? '';
      const ia = byLevel.get(lv - 1)?.indexOf(pa) ?? 0;
      const ib = byLevel.get(lv - 1)?.indexOf(pb) ?? 0;
      return ia - ib;
    });
  }

  const numLevels = byLevel.size;

  // Calcula largura total necessária (base no nível mais populado)
  const maxCount = Math.max(...Array.from(byLevel.values()).map((v) => v.length));
  const svgWidth = maxCount * NODE_W + (maxCount - 1) * H_GAP + 2 * PAD_X;
  const svgHeight = numLevels * (NODE_H + LEVEL_GAP) - LEVEL_GAP + 2 * PAD_Y + 20;

  // Atribui posições x,y a cada nó
  const nodeLayouts: LayoutNode[] = [];
  const idxMap = new Map<string, LayoutNode>();

  for (const [lv, ids] of byLevel) {
    const count = ids.length;
    const rowW = count * NODE_W + (count - 1) * H_GAP;
    const startX = (svgWidth - rowW) / 2;
    const y = PAD_Y + lv * (NODE_H + LEVEL_GAP);

    ids.forEach((id, i) => {
      const node = nodes.find((n) => n.id === id)!;
      const w = node.node_type === 'decision' ? DECISION_W : NODE_W;
      const h = node.node_type === 'decision' ? DECISION_H : NODE_H;
      const x = startX + i * (NODE_W + H_GAP);
      const layout: LayoutNode = { id, x, y, w, h, level: lv, node };
      nodeLayouts.push(layout);
      idxMap.set(id, layout);
    });
  }

  return { nodeLayouts, svgWidth, svgHeight };
}

// ─── Componentes SVG internos ─────────────────────────────────────────────────

function SvgNode({ layout }: { layout: LayoutNode }) {
  const { x, y, w, h, node } = layout;
  const style = NODE_STYLE[node.node_type] ?? NODE_STYLE.default;
  const lines = wrapText(node.label, node.node_type === 'decision' ? 24 : 22);
  const cx = x + w / 2;
  const cy = y + h / 2;
  const typeLabel = NODE_TYPE_LABEL[node.node_type];

  if (node.node_type === 'decision') {
    // Losango para nós de decisão
    const points = `${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`;
    return (
      <g>
        <polygon
          points={points}
          fill={style.fill}
          stroke={style.stroke}
          strokeWidth={1.5}
        />
        {typeLabel && (
          <text
            x={cx}
            y={y + 9}
            textAnchor="middle"
            fontSize={8}
            fill={style.stroke}
            fontWeight={600}
            letterSpacing={0.3}
          >
            {typeLabel.toUpperCase()}
          </text>
        )}
        {lines.map((line, i) => (
          <text
            key={i}
            x={cx}
            y={cy + (i - (lines.length - 1) / 2) * 13}
            textAnchor="middle"
            fontSize={10.5}
            fill={style.labelColor}
            fontWeight={500}
          >
            {line}
          </text>
        ))}
      </g>
    );
  }

  // Rect arredondado para demais nós
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        fill={style.fill}
        stroke={style.stroke}
        strokeWidth={1.5}
      />
      {typeLabel && (
        <text
          x={x + 8}
          y={y + 11}
          fontSize={8}
          fill={style.stroke}
          fontWeight={600}
          letterSpacing={0.3}
        >
          {typeLabel.toUpperCase()}
        </text>
      )}
      {lines.map((line, i) => (
        <text
          key={i}
          x={cx}
          y={cy + 3 + (i - (lines.length - 1) / 2) * 13}
          textAnchor="middle"
          fontSize={10.5}
          fill={style.labelColor}
          fontWeight={500}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function SvgEdge({
  fromLayout,
  toLayout,
  label,
  edgeIndex,
}: {
  fromLayout: LayoutNode;
  toLayout: LayoutNode;
  label?: string;
  edgeIndex: number;
}) {
  const fx = fromLayout.x + fromLayout.w / 2;
  const fy = fromLayout.y + fromLayout.h;
  const tx = toLayout.x + toLayout.w / 2;
  const ty = toLayout.y;

  // Bezier cúbico com pontos de controle verticais
  const cpY = (fy + ty) / 2;
  const d = `M ${fx} ${fy} C ${fx} ${cpY}, ${tx} ${cpY}, ${tx} ${ty}`;

  const midX = (fx + tx) / 2;
  const midY = cpY;
  const markerId = `arrow-${edgeIndex}`;

  return (
    <g>
      <defs>
        <marker
          id={markerId}
          markerWidth={7}
          markerHeight={7}
          refX={6}
          refY={3.5}
          orient="auto"
        >
          <polygon points="0 0, 7 3.5, 0 7" fill="#94A3B8" />
        </marker>
      </defs>
      <path
        d={d}
        fill="none"
        stroke="#94A3B8"
        strokeWidth={1.5}
        markerEnd={`url(#${markerId})`}
        strokeDasharray={label ? '0' : '0'}
      />
      {label && (
        <text
          x={midX}
          y={midY - 4}
          textAnchor="middle"
          fontSize={9}
          fill="#64748B"
          fontStyle="italic"
          paintOrder="stroke"
          stroke="white"
          strokeWidth={3}
        >
          {label}
        </text>
      )}
    </g>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface PathwayDiagramProps {
  nodes: PathwayNode[];
  edges: PathwayEdge[];
}

export function PathwayDiagram({ nodes, edges }: PathwayDiagramProps) {
  const { nodeLayouts, svgWidth, svgHeight } = useMemo(
    () => computeLayout(nodes, edges),
    [nodes, edges],
  );

  const layoutMap = useMemo(() => {
    const m = new Map<string, LayoutNode>();
    for (const l of nodeLayouts) m.set(l.id, l);
    return m;
  }, [nodeLayouts]);

  if (nodes.length === 0) {
    return (
      <div className="overflow-x-auto rounded-xl border border-otto-border bg-white/60 p-3">
        <svg width={200} height={100} aria-label="Diagrama vazio" role="img" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-otto-border bg-white/60 p-3">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        width={svgWidth}
        height={svgHeight}
        style={{ maxWidth: '100%', display: 'block', margin: '0 auto' }}
        aria-label="Fluxo de decisão clínica"
        role="img"
      >
        {/* Edges (desenhadas abaixo dos nós) */}
        {edges.map((e, i) => {
          const from = layoutMap.get(e.from_node);
          const to = layoutMap.get(e.to_node);
          if (!from || !to) return null;
          return (
            <SvgEdge
              key={i}
              fromLayout={from}
              toLayout={to}
              label={e.condition_label}
              edgeIndex={i}
            />
          );
        })}

        {/* Nodes */}
        {nodeLayouts.map((layout) => (
          <SvgNode key={layout.id} layout={layout} />
        ))}
      </svg>

      {/* Legenda */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 px-1">
        {Object.entries(NODE_TYPE_LABEL).map(([type, label]) => {
          const s = NODE_STYLE[type] ?? NODE_STYLE.default;
          return (
            <span key={type} className="flex items-center gap-1.5 text-xs text-otto-muted">
              <span
                className="inline-block w-3 h-3 rounded-sm border"
                style={{ background: s.fill, borderColor: s.stroke }}
              />
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
                                            
import type { Node, Edge } from "@xyflow/react";

export interface CanvasNodeData {
  [key: string]: unknown;
  label: string;
  canvasType: "text" | "file" | "link" | "group";
  color?: string;
  url?: string;
  file?: string;
  isSelected?: boolean;
}

export interface GraphIndex {
  parents: Map<string, string[]>;
  children: Map<string, string[]>;
  edgeLabels: Map<string, string>;
}

interface RawCanvasNode {
  id: string;
  type: "text" | "file" | "link" | "group";
  text?: string;
  url?: string;
  file?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  label?: string;
}

interface RawCanvasEdge {
  id: string;
  fromNode: string;
  fromSide?: string;
  toNode: string;
  toSide?: string;
  color?: string;
  label?: string;
}

interface RawCanvasData {
  nodes: RawCanvasNode[];
  edges: RawCanvasEdge[];
}

const OBSIDIAN_COLORS: Record<string, string> = {
  "1": "#fb464c",
  "2": "#e9973f",
  "3": "#e0de71",
  "4": "#44cf6e",
  "5": "#53dfdd",
  "6": "#a882ff",
};

function resolveColor(color?: string): string | undefined {
  if (!color) return undefined;
  return OBSIDIAN_COLORS[color] || color;
}

export function parseCanvas(data: RawCanvasData) {
  const nodeMap = new Map<string, CanvasNodeData>();

  const nodes: Node[] = data.nodes.map((node) => {
    const nodeData: CanvasNodeData = {
      label: node.text || node.file || node.url || node.label || "",
      canvasType: node.type,
      color: resolveColor(node.color),
      url: node.url,
      file: node.file,
    };
    nodeMap.set(node.id, nodeData);

    return {
      id: node.id,
      type: node.type === "group" ? "canvasGroup" : "canvasNode",
      position: { x: node.x, y: node.y },
      style: { width: node.width, height: node.height },
      data: nodeData,
      draggable: false,
      ...(node.type === "group" ? { zIndex: -1 } : {}),
    };
  });

  const edges: Edge[] = data.edges.map((edge) => ({
    id: edge.id,
    source: edge.fromNode,
    target: edge.toNode,
    sourceHandle: edge.fromSide || undefined,
    targetHandle: edge.toSide || undefined,
    style: {
      stroke: resolveColor(edge.color) || "rgba(150, 150, 150, 0.6)",
      strokeWidth: 1.5,
    },
    label: edge.label,
    labelStyle: edge.label ? { fill: "white", fontSize: 12 } : undefined,
  }));

  const graphIndex = buildGraphIndex(data.edges);

  return { nodes, edges, graphIndex, nodeMap };
}

function buildGraphIndex(edges: RawCanvasEdge[]): GraphIndex {
  const parents = new Map<string, string[]>();
  const children = new Map<string, string[]>();
  const edgeLabels = new Map<string, string>();

  for (const edge of edges) {
    if (!children.has(edge.fromNode)) children.set(edge.fromNode, []);
    children.get(edge.fromNode)!.push(edge.toNode);

    if (!parents.has(edge.toNode)) parents.set(edge.toNode, []);
    parents.get(edge.toNode)!.push(edge.fromNode);

    if (edge.label) {
      edgeLabels.set(`${edge.fromNode}->${edge.toNode}`, edge.label);
    }
  }

  return { parents, children, edgeLabels };
}

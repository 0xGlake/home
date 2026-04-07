import type { Node, Edge } from "@xyflow/react";

export type HandleSide = "top" | "bottom" | "left" | "right";

export interface CanvasNodeData {
  [key: string]: unknown;
  label: string;
  /**
   * Pre-rendered HTML for text nodes. Parsed once at load time so the
   * expensive ReactMarkdown component doesn't have to run 78+ times and
   * keep remark ASTs in memory (which was crashing mobile Safari).
   */
  html?: string;
  canvasType: "text" | "file" | "link" | "group";
  color?: string;
  url?: string;
  file?: string;
  /**
   * Sides this node is actually used from/to. Lets CanvasNode render
   * only the Handles that real edges attach to instead of 8 per node.
   * Cuts Handle components from ~900 down to ~165 on the default canvas
   * — a big memory/subscription win on mobile.
   */
  sourceHandles?: HandleSide[];
  targetHandles?: HandleSide[];
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Inline formatting: bold, italic, inline code.
// Bold must run before italic so ** doesn't get eaten as two *.
function formatInline(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

// Minimal markdown → HTML. Handles headings, bold, italic, code,
// unordered lists, and paragraphs — which covers everything in our
// canvas data. Runs once per node at load time instead of having
// ReactMarkdown parse the same content on every mount.
export function mdToHtml(md: string): string {
  const escaped = escapeHtml(md);
  const lines = escaped.split("\n");
  const out: string[] = [];
  let paragraph: string[] = [];
  let inList = false;

  const flushParagraph = () => {
    if (paragraph.length) {
      out.push(`<p>${paragraph.join(" ")}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      out.push(`<h${level}>${formatInline(heading[2])}</h${level}>`);
      continue;
    }

    const listItem = line.match(/^[-*]\s+(.*)$/);
    if (listItem) {
      flushParagraph();
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${formatInline(listItem[1])}</li>`);
      continue;
    }

    flushList();
    paragraph.push(formatInline(line));
  }

  flushParagraph();
  flushList();

  return out.join("");
}

const SIDES: HandleSide[] = ["top", "bottom", "left", "right"];

function isSide(value: string | undefined): value is HandleSide {
  return (
    value === "top" ||
    value === "bottom" ||
    value === "left" ||
    value === "right"
  );
}

export function parseCanvas(data: RawCanvasData) {
  const nodeMap = new Map<string, CanvasNodeData>();

  // Walk edges once to collect exactly which handle sides are used on
  // each node. Nodes then register only those handles.
  const sourceSides = new Map<string, Set<HandleSide>>();
  const targetSides = new Map<string, Set<HandleSide>>();
  for (const edge of data.edges) {
    const fromSide = isSide(edge.fromSide) ? edge.fromSide : "bottom";
    const toSide = isSide(edge.toSide) ? edge.toSide : "top";
    if (!sourceSides.has(edge.fromNode))
      sourceSides.set(edge.fromNode, new Set());
    sourceSides.get(edge.fromNode)!.add(fromSide);
    if (!targetSides.has(edge.toNode))
      targetSides.set(edge.toNode, new Set());
    targetSides.get(edge.toNode)!.add(toSide);
  }

  const toSortedSides = (set: Set<HandleSide> | undefined): HandleSide[] =>
    set ? SIDES.filter((s) => set.has(s)) : [];

  const nodes: Node[] = data.nodes.map((node) => {
    const label = node.text || node.file || node.url || node.label || "";
    const nodeData: CanvasNodeData = {
      label,
      html: node.type === "text" ? mdToHtml(label) : undefined,
      canvasType: node.type,
      color: resolveColor(node.color),
      url: node.url,
      file: node.file,
      sourceHandles: toSortedSides(sourceSides.get(node.id)),
      targetHandles: toSortedSides(targetSides.get(node.id)),
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

  const edges: Edge[] = data.edges.map((edge) => {
    const base: Edge = {
      id: edge.id,
      source: edge.fromNode,
      target: edge.toNode,
      sourceHandle: edge.fromSide || undefined,
      targetHandle: edge.toSide || undefined,
      style: {
        stroke: resolveColor(edge.color) || "rgba(150, 150, 150, 0.6)",
        strokeWidth: 1.5,
      },
    };
    if (edge.label) {
      base.label = edge.label;
      base.labelStyle = { fill: "white", fontSize: 12 };
    }
    return base;
  });

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

"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./styles.css";
import GraphPane from "./GraphPane";
import Sidebar from "./Sidebar";
import {
  parseCanvas,
  type GraphIndex,
  type CanvasNodeData,
} from "./parseCanvas";
import type { Node, Edge } from "@xyflow/react";

interface CanvasViewerProps {
  canvasPath: string;
}

function CanvasViewerInner({ canvasPath }: CanvasViewerProps) {
  const [baseNodes, setBaseNodes] = useState<Node[]>([]);
  const [baseEdges, setBaseEdges] = useState<Edge[]>([]);
  const [graphIndex, setGraphIndex] = useState<GraphIndex>({
    parents: new Map(),
    children: new Map(),
    edgeLabels: new Map(),
  });
  const [nodeMap, setNodeMap] = useState<Map<string, CanvasNodeData>>(
    new Map(),
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t0 = performance.now();
    fetch(canvasPath)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load canvas: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const t1 = performance.now();
        if (data.description) setDescription(data.description);
        const parsed = parseCanvas(data);
        const t2 = performance.now();
        setBaseNodes(parsed.nodes);
        setBaseEdges(parsed.edges);
        setGraphIndex(parsed.graphIndex);
        setNodeMap(parsed.nodeMap);
        setLoading(false);
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.log(
            `[canvas] nodes=${parsed.nodes.length} edges=${parsed.edges.length} fetch=${(t1 - t0).toFixed(1)}ms parse=${(t2 - t1).toFixed(1)}ms`,
          );
        }
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [canvasPath]);

  const visualNodes = useMemo(() => {
    if (!selectedNodeId) {
      return baseNodes;
    }
    const connected = new Set<string>([
      selectedNodeId,
      ...(graphIndex.parents.get(selectedNodeId) || []),
      ...(graphIndex.children.get(selectedNodeId) || []),
    ]);

    // Important: we only change `className`, never `data`. Since the
    // custom node component's memo comparator only looks at fields in
    // `data`, the actual node component instance never re-renders on
    // selection — only its React Flow wrapper div's class changes.
    return baseNodes.map((node) => {
      if (node.id === selectedNodeId) {
        return { ...node, className: "node-selected" };
      }
      return {
        ...node,
        className: connected.has(node.id) ? "node-connected" : "node-dimmed",
      };
    });
  }, [baseNodes, selectedNodeId, graphIndex]);

  const visualEdges = useMemo(() => {
    if (!selectedNodeId) {
      return baseEdges;
    }

    return baseEdges.map((edge) => ({
      ...edge,
      className:
        edge.source === selectedNodeId || edge.target === selectedNodeId
          ? "edge-highlighted"
          : "edge-dimmed",
    }));
  }, [baseEdges, selectedNodeId]);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      // Clicking the currently-selected node deselects it.
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
        setSidebarOpen(false);
        return;
      }
      setSelectedNodeId(nodeId);
      setSidebarOpen(true);
    },
    [selectedNodeId],
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSidebarOpen(false);
  }, []);

  const handleSidebarSelectNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSidebarOpen(true);
  }, []);

  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  if (error) {
    return (
      <div className="canvas-loading">
        <span className="text-red-400 font-mono">{error}</span>
        <p className="text-gray-500 font-mono text-sm mt-2">
          Place a .canvas file at{" "}
          <code className="text-gray-400">{canvasPath}</code>
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="canvas-loading">
        <div className="canvas-loading-spinner" />
      </div>
    );
  }

  return (
    <div className="canvas-viewer">
      <div className="canvas-graph-area">
        <GraphPane
          nodes={visualNodes}
          edges={visualEdges}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
        />
      </div>
      {showIntro && description && (
        <div className="canvas-intro-overlay" onClick={() => setShowIntro(false)}>
          <div className="canvas-intro-card" onClick={(e) => e.stopPropagation()}>
            <p className="canvas-intro-description">{description}</p>
            <div className="canvas-intro-hints">
              <span>scroll to pan</span>
              <span>pinch to zoom</span>
              <span>tap nodes to explore</span>
            </div>
            <button className="canvas-intro-dismiss" onClick={() => setShowIntro(false)}>
              Enter
            </button>
          </div>
        </div>
      )}
      <Sidebar
        selectedNodeId={selectedNodeId}
        graphIndex={graphIndex}
        nodeMap={nodeMap}
        open={sidebarOpen}
        onToggle={handleSidebarToggle}
        onSelectNode={handleSidebarSelectNode}
      />
    </div>
  );
}

export default function CanvasViewer({ canvasPath }: CanvasViewerProps) {
  return (
    <ReactFlowProvider>
      <CanvasViewerInner canvasPath={canvasPath} />
    </ReactFlowProvider>
  );
}

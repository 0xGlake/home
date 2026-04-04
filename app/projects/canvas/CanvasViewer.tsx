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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(canvasPath)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load canvas: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const parsed = parseCanvas(data);
        setBaseNodes(parsed.nodes);
        setBaseEdges(parsed.edges);
        setGraphIndex(parsed.graphIndex);
        setNodeMap(parsed.nodeMap);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [canvasPath]);

  const visualNodes = useMemo(() => {
    const t0 = performance.now();
    let result: Node[];

    if (!selectedNodeId) {
      result = baseNodes;
    } else {
      const connected = new Set<string>([
        selectedNodeId,
        ...(graphIndex.parents.get(selectedNodeId) || []),
        ...(graphIndex.children.get(selectedNodeId) || []),
      ]);

      result = baseNodes.map((node) => {
        if (node.id === selectedNodeId) {
          return {
            ...node,
            className: "node-selected",
            data: { ...node.data, isSelected: true },
          };
        }
        return {
          ...node,
          className: connected.has(node.id) ? "node-connected" : "node-dimmed",
        };
      });
    }

    console.log(`[perf] visualNodes: ${(performance.now() - t0).toFixed(2)}ms, ${result.length} nodes, selected=${selectedNodeId}`);
    return result;
  }, [baseNodes, selectedNodeId, graphIndex]);

  const visualEdges = useMemo(() => {
    const t0 = performance.now();
    let result: Edge[];

    if (!selectedNodeId) {
      result = baseEdges;
    } else {
      result = baseEdges.map((edge) => ({
        ...edge,
        className:
          edge.source === selectedNodeId || edge.target === selectedNodeId
            ? "edge-highlighted"
            : "edge-dimmed",
      }));
    }

    console.log(`[perf] visualEdges: ${(performance.now() - t0).toFixed(2)}ms, ${result.length} edges`);
    return result;
  }, [baseEdges, selectedNodeId]);

  const handleNodeClick = useCallback((nodeId: string) => {
    console.time("[perf] node click → render complete");
    setSelectedNodeId(nodeId);
    setSidebarOpen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        console.timeEnd("[perf] node click → render complete");
      });
    });
  }, []);

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

  if (loading) {
    return (
      <div className="canvas-loading">
        <span className="text-gray-400 font-mono">Loading canvas...</span>
      </div>
    );
  }

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

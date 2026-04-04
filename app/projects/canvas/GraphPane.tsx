"use client";
import { memo } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
  type NodeTypes,
} from "@xyflow/react";
import { CanvasNode, CanvasGroup } from "./CanvasNode";

const nodeTypes: NodeTypes = {
  canvasNode: CanvasNode,
  canvasGroup: CanvasGroup,
};

interface GraphPaneProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick: (nodeId: string) => void;
  onPaneClick: () => void;
}

export default memo(function GraphPane({
  nodes,
  edges,
  onNodeClick,
  onPaneClick,
}: GraphPaneProps) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodeClick={(_, node) => onNodeClick(node.id)}
      onPaneClick={onPaneClick}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.1}
      maxZoom={4}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag
      panOnScroll
      zoomOnScroll={false}
      zoomOnPinch
      proOptions={{ hideAttribution: true }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        color="rgba(255,255,255,0.05)"
        gap={20}
      />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
});

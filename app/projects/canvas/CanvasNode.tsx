"use client";
import { memo, useEffect, useMemo, useRef } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import ReactMarkdown from "react-markdown";
import type { CanvasNodeData } from "./parseCanvas";

const handles = [
  { type: "source" as const, position: Position.Top, id: "top" },
  { type: "target" as const, position: Position.Top, id: "top" },
  { type: "source" as const, position: Position.Bottom, id: "bottom" },
  { type: "target" as const, position: Position.Bottom, id: "bottom" },
  { type: "source" as const, position: Position.Left, id: "left" },
  { type: "target" as const, position: Position.Left, id: "left" },
  { type: "source" as const, position: Position.Right, id: "right" },
  { type: "target" as const, position: Position.Right, id: "right" },
];

function CanvasNodeComponent({ data }: NodeProps) {
  const { label, canvasType, color, url, isSelected } =
    data as unknown as CanvasNodeData;

  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = nodeRef.current;
    if (!el || !isSelected) return;

    const handler = (e: WheelEvent) => {
      e.stopPropagation();
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [isSelected]);

  // Memoize the expensive ReactMarkdown parse — label never changes,
  // so this runs once per node and is reused across all re-renders.
  const content = useMemo(() => {
    if (canvasType === "link") {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline break-all"
        >
          {label || url}
        </a>
      );
    }
    if (canvasType === "file") {
      return <div className="text-gray-300 italic">{label}</div>;
    }
    return (
      <div className="canvas-node-markdown">
        <ReactMarkdown>{label}</ReactMarkdown>
      </div>
    );
  }, [label, canvasType, url]);

  return (
    <>
      {handles.map((h, i) => (
        <Handle
          key={i}
          type={h.type}
          position={h.position}
          id={h.id}
          className="canvas-handle"
        />
      ))}
      <div
        ref={nodeRef}
        className={`canvas-node ${isSelected ? "canvas-node-scrollable" : ""}`}
        style={color ? { borderColor: color } : undefined}
      >
        {content}
      </div>
    </>
  );
}

function CanvasGroupComponent({ data }: NodeProps) {
  const { label, color } = data as unknown as CanvasNodeData;

  return (
    <div
      className="canvas-group"
      style={
        color
          ? { borderColor: color, backgroundColor: color + "15" }
          : undefined
      }
    >
      {label && <span className="canvas-group-label">{label}</span>}
    </div>
  );
}

function areNodePropsEqual(prev: NodeProps, next: NodeProps) {
  const p = prev.data as unknown as CanvasNodeData;
  const n = next.data as unknown as CanvasNodeData;
  return (
    p.label === n.label &&
    p.canvasType === n.canvasType &&
    p.color === n.color &&
    p.url === n.url &&
    p.isSelected === n.isSelected
  );
}

function areGroupPropsEqual(prev: NodeProps, next: NodeProps) {
  const p = prev.data as unknown as CanvasNodeData;
  const n = next.data as unknown as CanvasNodeData;
  return p.label === n.label && p.color === n.color;
}

export const CanvasNode = memo(CanvasNodeComponent, areNodePropsEqual);
export const CanvasGroup = memo(CanvasGroupComponent, areGroupPropsEqual);

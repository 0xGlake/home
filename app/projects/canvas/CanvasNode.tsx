"use client";
import { memo, useEffect, useRef } from "react";
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
        {canvasType === "link" ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline break-all"
          >
            {label || url}
          </a>
        ) : canvasType === "file" ? (
          <div className="text-gray-300 italic">{label}</div>
        ) : (
          <div className="canvas-node-markdown">
            <ReactMarkdown>{label}</ReactMarkdown>
          </div>
        )}
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

export const CanvasNode = memo(CanvasNodeComponent);
export const CanvasGroup = memo(CanvasGroupComponent);

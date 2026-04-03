"use client";
import { memo } from "react";
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
  const { label, canvasType, color, url, visualState } =
    data as unknown as CanvasNodeData;

  const stateClass =
    visualState === "selected"
      ? "canvas-node-selected"
      : visualState === "connected"
        ? "canvas-node-connected"
        : visualState === "dimmed"
          ? "canvas-node-dimmed"
          : "";

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
        className={`canvas-node ${stateClass}`}
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
  const { label, color, visualState } = data as unknown as CanvasNodeData;

  const stateClass = visualState === "dimmed" ? "canvas-node-dimmed" : "";

  return (
    <div
      className={`canvas-group ${stateClass}`}
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

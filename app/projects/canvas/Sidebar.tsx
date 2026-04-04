"use client";
import { memo, useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useReactFlow } from "@xyflow/react";
import ReactMarkdown from "react-markdown";
import type { CanvasNodeData, GraphIndex } from "./parseCanvas";

interface SidebarProps {
  selectedNodeId: string | null;
  graphIndex: GraphIndex;
  nodeMap: Map<string, CanvasNodeData>;
  open: boolean;
  onToggle: () => void;
  onSelectNode: (id: string) => void;
}

export default memo(function Sidebar({
  selectedNodeId,
  graphIndex,
  nodeMap,
  open,
  onToggle,
  onSelectNode,
}: SidebarProps) {
  const { fitView } = useReactFlow();
  const [width, setWidth] = useState(280);
  const dragging = useRef(false);

  console.time("[perf] Sidebar render");
  const selectedData = selectedNodeId ? nodeMap.get(selectedNodeId) : null;
  console.log(`[perf] Sidebar: open=${open}, selectedId=${selectedNodeId}, labelLen=${selectedData?.label?.length || 0}`);
  const parentIds = selectedNodeId
    ? graphIndex.parents.get(selectedNodeId) || []
    : [];
  const childIds = selectedNodeId
    ? graphIndex.children.get(selectedNodeId) || []
    : [];

  const selectedContent = useMemo(() => {
    if (!selectedData) return null;
    return (
      <div className="sidebar-label canvas-node-markdown">
        <ReactMarkdown>{selectedData.label}</ReactMarkdown>
      </div>
    );
  }, [selectedData?.label]);

  const handleConnectionClick = (nodeId: string) => {
    onSelectNode(nodeId);
    setTimeout(() => {
      fitView({ nodes: [{ id: nodeId }], duration: 300, padding: 0.5 });
    }, 50);
  };

  const preview = (text: string) => {
    const lines = text.split("\n").filter((l) => l.trim());
    const title = lines[0]?.replace(/^#+\s*/, "").replace(/\*\*/g, "") || "";
    const body = lines[1]?.replace(/^#+\s*/, "").replace(/\*\*/g, "") || "";
    const truncatedBody =
      body.length > 80 ? body.slice(0, 80) + "\u2026" : body;
    return { title, body: truncatedBody };
  };

  const onDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    dragging.current = true;
  }, []);

  useEffect(() => {
    const getClientX = (e: MouseEvent | TouchEvent) =>
      "touches" in e ? e.touches[0].clientX : e.clientX;

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current) return;
      const newWidth = window.innerWidth - getClientX(e);
      setWidth(Math.max(200, Math.min(newWidth, window.innerWidth * 0.8)));
    };
    const onEnd = () => {
      dragging.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, []);

  console.timeEnd("[perf] Sidebar render");

  return (
    <>
      <button
        onClick={onToggle}
        className="sidebar-toggle"
        style={{
          right: open ? `min(${width + 4}px, calc(100vw - 44px))` : "12px",
        }}
        aria-label={open ? "Close sidebar" : "Open sidebar"}
      >
        {open ? "\u2715" : "\u2630"}
      </button>

      {open && (
        <div
          className="sidebar-resize-handle"
          style={{ right: width - 6 }}
          onMouseDown={onDragStart}
          onTouchStart={onDragStart}
        />
      )}

      <div
        className={`sidebar ${open ? "sidebar-open" : "sidebar-closed"}`}
        style={{ width }}
      >
        {selectedData ? (
          <>
            <div className="sidebar-section">
              <h3 className="sidebar-heading">Selected</h3>
              <div
                className="sidebar-node-preview"
                style={
                  selectedData.color
                    ? { borderLeftColor: selectedData.color }
                    : undefined
                }
              >
                {selectedContent}
              </div>
            </div>

            {parentIds.length > 0 && (
              <div className="sidebar-section">
                <h3 className="sidebar-heading">
                  Parents ({parentIds.length})
                </h3>
                <ul className="sidebar-list">
                  {parentIds.map((id) => {
                    const node = nodeMap.get(id);
                    const p = preview(node?.label || id);
                    const edgeLabel = graphIndex.edgeLabels.get(
                      `${id}->${selectedNodeId}`,
                    );
                    return (
                      <li key={id}>
                        {edgeLabel && (
                          <span className="sidebar-edge-label">
                            {edgeLabel}
                          </span>
                        )}
                        <button
                          onClick={() => handleConnectionClick(id)}
                          className="sidebar-list-item"
                        >
                          <span className="sidebar-item-title">{p.title}</span>
                          {p.body && (
                            <span className="sidebar-item-body">{p.body}</span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {childIds.length > 0 && (
              <div className="sidebar-section">
                <h3 className="sidebar-heading">
                  Children ({childIds.length})
                </h3>
                <ul className="sidebar-list">
                  {childIds.map((id) => {
                    const node = nodeMap.get(id);
                    const p = preview(node?.label || id);
                    const edgeLabel = graphIndex.edgeLabels.get(
                      `${selectedNodeId}->${id}`,
                    );
                    return (
                      <li key={id}>
                        {edgeLabel && (
                          <span className="sidebar-edge-label">
                            {edgeLabel}
                          </span>
                        )}
                        <button
                          onClick={() => handleConnectionClick(id)}
                          className="sidebar-list-item"
                        >
                          <span className="sidebar-item-title">{p.title}</span>
                          {p.body && (
                            <span className="sidebar-item-body">{p.body}</span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {parentIds.length === 0 && childIds.length === 0 && (
              <p className="sidebar-empty">No connections</p>
            )}
          </>
        ) : (
          <p className="sidebar-empty">Click a node to see its connections</p>
        )}
      </div>
    </>
  );
});

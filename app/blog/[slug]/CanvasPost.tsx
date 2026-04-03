"use client";
import dynamic from "next/dynamic";

const CanvasViewer = dynamic(
  () => import("../../projects/canvas/CanvasViewer"),
  { ssr: false },
);

export default function CanvasPost({ canvasFile }: { canvasFile: string }) {
  return (
    <div className="flex-1 relative">
      <CanvasViewer canvasPath={`/canvas/${canvasFile}`} />
    </div>
  );
}

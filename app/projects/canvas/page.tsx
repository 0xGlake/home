"use client";
import Link from "next/link";
import dynamic from "next/dynamic";

const CanvasViewer = dynamic(() => import("./CanvasViewer"), { ssr: false });

export default function CanvasPage() {
  return (
    <div
      className="h-screen flex flex-col"
      style={{ background: "rgb(16, 16, 16)" }}
    >
      <div className="px-4 py-3">
        <Link
          href="/portfolio"
          className="text-lg font-mono font-bold text-violet-400 hover:text-violet-300"
        >
          &lt; Back
        </Link>
      </div>
      <div className="flex-1 relative">
        <CanvasViewer canvasPath="/canvas/default.canvas" />
      </div>
    </div>
  );
}

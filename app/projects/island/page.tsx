import React from "react";
import Link from "next/link";

export default function IslandPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          href="/portfolio"
          className="block text-3xl font-mono font-bold my-2 pl-5 pt-5 text-violet-400 hover:text-violet-300"
        >
          &lt; Back to Portfolio
        </Link>

        <div className="flex flex-col items-center justify-center mt-8">
          <h1 className="text-4xl font-mono font-bold text-white mb-6">
            Floating Island City
          </h1>

          <div className="w-full flex items-center justify-center">
            <iframe
              src="/sketches/island.html"
              width={800}
              height={600}
              style={{
                border: "none",
                display: "block",
              }}
              title="Island Sketch"
            />
          </div>

          <div className="max-w-2xl mt-8 text-center">
            <p className="text-gray-300 mb-4">
              A procedurally generated isometric city simulation on a floating
              island. Watch as cities grow, roads connect, and artificial
              islands emerge from the water.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["p5.js", "Procedural Generation", "Isometric"].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-violet-900 text-violet-100 rounded-full text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

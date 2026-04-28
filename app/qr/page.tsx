"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const QRSketch = dynamic(() => import("../components/qrSketch"), {
  ssr: false,
});

export default function QRPage() {
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null
  );
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    setUrl(window.location.href);

    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#161232]">
      {size && url && (
        <QRSketch
          key={`${size.width}-${size.height}`}
          width={size.width}
          height={size.height}
          url={url}
        />
      )}
      <Link
        href="/"
        className="absolute top-4 left-4 text-gray-300 hover:text-white font-mono text-sm z-10 mix-blend-difference"
      >
        ← back
      </Link>
    </main>
  );
}

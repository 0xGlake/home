import React from "react";
import Link from "next/link";
import ImageSlideshow from "./ImageSlideshow";

// Project data ordered from newest to oldest
const projects = [
  {
    id: 8,
    title: "TradeBoard",
    date: "2026",
    description:
      "A lightweight social trading idea marketplace built on top of Hyperliquid. Users create structured trade ideas (baskets of long/short positions across crypto perps, commodities, equities, and spot assets), publish them to a public feed, and earn fees when other users manually allocate capital to those ideas.",
    type: "screenshot",
    imageUrls: ["/tradeboard.png"],
    tech: ["Next.js", "TypeScript", "Hyperliquid", "DeFi"],
    demoUrl: "https://trade-board.vercel.app/",
  },
  {
    id: 7,
    title: "Crypto Taxonomy Map",
    date: "2026",
    description:
      "An interactive classification map of the crypto ecosystem, organizing protocols and services across communication infrastructure, trading venues, financial primitives, and L1/L2 networks, with live price data and direct protocol links.",
    type: "screenshot",
    imageUrls: ["/crypto-taxonomy.png"],
    tech: ["Next.js", "TypeScript", "DeFi", "Data Viz"],
    demoUrl: "https://home-lake-alpha.vercel.app/blog/crypto-taxonomy",
  },
  {
    id: 6,
    title: "Eudaimonai",
    date: "2025",
    description:
      "Self improvement tool which allows the LLM to write to a database which can then be visualised in a mermaid diagram.",
    type: "screenshot",
    imageUrls: [
      "/eudaimonai.png",
      "/eudaimonai1.png",
      "/eudaimonai2.png",
      "/eudaimonai3.png",
      "/eudaimonai4.png",
    ],
    tech: ["Next.js", "LLM Chat", "postgres"],
    demoUrl: "https://eudaimonai.vercel.app/",
  },
  {
    id: 5,
    title: "Perpetual DEX Analytics",
    date: "2025",
    description:
      "A comprehensive comparison tool for perpetual trading decentralized exchanges, analyzing funding rates, orderbook depth, and open interest distributions across multiple platforms.",
    type: "screenshot",
    imageUrls: ["/perp-dex-preview.png"],
    tech: ["React", "Next.js", "DeFi", "Real-time Data"],
    demoUrl: "https://parallax-one-flame.vercel.app/",
  },
  {
    id: 4,
    title: "Floating Island City",
    date: "2025",
    description:
      "A procedurally generated isometric city simulation on a floating island. Watch as cities grow, roads connect, and artificial islands emerge from the water.",
    type: "sketch",
    imageUrls: [
      "/island-preview.png",
      "/island-preview1.png",
      "/island-preview2.png",
    ],
    tech: ["p5.js", "Procedural Generation", "Isometric"],
    slug: "island",
  },
  {
    id: 3,
    title: "OnlyPerps",
    date: "2024",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras porttitor metus justo, ut condimentum felis sagittis at.",
    vimeoId: "1024627383",
    tech: ["React", "Next.js", "Tailwind"],
    slug: "onlyperps",
  },
  {
    id: 2,
    title: "Real Time Jupiter Limit Orders",
    date: "2024",
    description:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.",
    vimeoId: "1024626992",
    tech: ["TypeScript", "Node.js", "MongoDB"],
    slug: "jupiterlim",
  },
  {
    id: 1,
    title: "BackPack Swap (Mayan)",
    date: "2023",
    description:
      "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    vimeoId: "1024627026",
    tech: ["JavaScript", "Express", "PostgreSQL"],
    slug: "backpackswap",
  },
];

export default function ProjectPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="block text-5xl font-mono font-bold my-2 pl-5 pt-5 hover:text-violet-400"
      >
        &gt; Portfolio
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {projects.map((project) => {
          const card = (
            <div className="relative bg-violet-100 rounded-lg shadow-md overflow-hidden h-full hover:shadow-xl transition-shadow duration-300 hover:text-violet-100 hover:bg-violet-200">
              {!project.vimeoId && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-violet-900/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <span className="flex items-center gap-2 text-white text-xl font-mono font-bold">
                    {project.demoUrl ? "Visit Live Site" : "View Project"}
                    <span aria-hidden="true">&#8599;</span>
                  </span>
                </div>
              )}
              <div className="p-6">
                <h2 className="text-violet-900 text-2xl font-mono font-bold mb-1">
                  {project.title}
                </h2>
                {project.date && (
                  <p className="text-violet-500 text-sm font-mono mb-4">
                    {project.date}
                  </p>
                )}
                <div className="aspect-video w-full relative z-30 mb-4">
                  {project.type === "sketch" ||
                  project.type === "screenshot" ? (
                    <ImageSlideshow
                      images={project.imageUrls}
                      alt={project.title}
                    />
                  ) : (
                    <iframe
                      src={`https://player.vimeo.com/video/${project.vimeoId}`}
                      className="absolute top-0 left-0 w-full h-full"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );

          // Video projects are self-contained — no link wrapper.
          if (project.vimeoId) {
            return (
              <div key={project.id} className="group">
                {card}
              </div>
            );
          }

          return (
            <Link
              href={project.demoUrl || `/projects/${project.slug}`}
              key={project.id}
              className="group"
              {...(project.demoUrl && {
                target: "_blank",
                rel: "noopener noreferrer",
              })}
            >
              {card}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

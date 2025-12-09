import React from "react";
import Link from "next/link";
import Image from "next/image";

// Project data ordered from newest to oldest
const projects = [
  {
    id: 6,
    title: "Eudaimonai",
    description:
      "Self improvement tool which allows the LLM to write to a database which can then be visualised in a mermaid diagram.",
    type: "screenshot",
    imageUrl: "/eudaimonai.png",
    tech: ["Next.js", "LLM Chat", "postgres"],
    demoUrl: "https://eudaimonai.vercel.app/",
  },
  {
    id: 5,
    title: "Perpetual DEX Analytics",
    description:
      "A comprehensive comparison tool for perpetual trading decentralized exchanges, analyzing funding rates, orderbook depth, and open interest distributions across multiple platforms.",
    type: "screenshot",
    imageUrl: "/perp-dex-preview.png",
    tech: ["React", "Next.js", "DeFi", "Real-time Data"],
    demoUrl: "https://parallax-one-flame.vercel.app/",
  },
  {
    id: 4,
    title: "Floating Island City",
    description:
      "A procedurally generated isometric city simulation on a floating island. Watch as cities grow, roads connect, and artificial islands emerge from the water.",
    type: "sketch",
    imageUrl: "/island-preview.png",
    tech: ["p5.js", "Procedural Generation", "Isometric"],
    slug: "island",
  },
  {
    id: 3,
    title: "OnlyPerps",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras porttitor metus justo, ut condimentum felis sagittis at.",
    vimeoId: "1024627383",
    tech: ["React", "Next.js", "Tailwind"],
    slug: "onlyperps",
  },
  {
    id: 2,
    title: "Real Time Jupiter Limit Orders",
    description:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.",
    vimeoId: "1024626992",
    tech: ["TypeScript", "Node.js", "MongoDB"],
    slug: "jupiterlim",
  },
  {
    id: 1,
    title: "BackPack Swap (Mayan)",
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
        {projects.map((project) => (
          <Link
            href={project.demoUrl || `/projects/${project.slug}`}
            key={project.id}
            className="group"
            {...(project.demoUrl && {
              target: "_blank",
              rel: "noopener noreferrer",
            })}
          >
            <div className="bg-violet-100 rounded-lg shadow-md overflow-hidden h-full hover:shadow-xl transition-shadow duration-300 hover:text-violet-100 hover:bg-violet-200">
              <div className="p-6">
                <h2 className="text-violet-900 text-2xl font-mono font-bold mb-4">
                  {project.title}
                </h2>
                <div className="aspect-video w-full relative mb-4">
                  {project.type === "sketch" ||
                  project.type === "screenshot" ? (
                    <div className="w-full h-full flex items-center justify-center bg-black rounded overflow-hidden relative">
                      <Image
                        src={project.imageUrl}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    </div>
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
          </Link>
        ))}
      </div>
    </div>
  );
}

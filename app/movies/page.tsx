import React from "react";
import Link from "next/link";
import Image from "next/image";

interface Movie {
  title: string;
  imageFile: string;
}

const movies: Movie[] = [
  {
    title: "Ghost in the Shell (1995)",
    imageFile: "ghost-in-the-shell.jpg",
  },
  {
    title: "Gattaca",
    imageFile: "gattaca.webp",
  },
  {
    title: "Spirited Away",
    imageFile: "spirited-away.webp",
  },
  {
    title: "Howl's Moving Castle",
    imageFile: "howls-moving-castle.webp",
  },
  {
    title: "Iron Man 1",
    imageFile: "iron-man-1.webp",
  },
  {
    title: "James Bond Casino Royale",
    imageFile: "james-bond-casino-royale.webp",
  },
  {
    title: "Whiplash",
    imageFile: "whiplash.webp",
  },
  {
    title: "The Princess Bride",
    imageFile: "the-princess-bride.webp",
  },
  {
    title: "Catch Me if You Can",
    imageFile: "catch-me-if-you-can.webp",
  },
  {
    title: "Ex Machina",
    imageFile: "ex-machina.webp",
  },
  {
    title: "Limitless",
    imageFile: "limitless.webp",
  },
];

export default function MoviesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="block text-5xl font-mono font-bold my-4 pb-4 pt-4 hover:text-violet-400"
      >
        &gt; Favourite Movies
      </Link>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-11">
        {movies.map((movie, index) => (
          <div key={index} className="flex flex-col items-center group">
            <div className="relative w-full aspect-[3/2] bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-violet-500/50 transition-shadow duration-300">
              <Image
                src={`/movies/${movie.imageFile}`}
                alt={movie.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
            <p className="text-gray-400 font-mono text-sm mt-3 text-center">
              {movie.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

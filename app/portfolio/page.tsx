import Link from 'next/link';

export default function ProjectPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/" className="block text-5xl font-mono font-bold my-2 pl-5 pt-5 hover:text-violet-400">
      &gt; Portfolio
      </Link>
    </div>
  );
}

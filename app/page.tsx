import dynamic from 'next/dynamic';

const P5Sketch = dynamic(() => import('./components/sketch'), {
  ssr: false
});

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="z-10 w-full items-center justify-between font-mono text-sm lg:flex">
      </div>
      <P5Sketch width={750} height={750} />
    </main>
  );
}

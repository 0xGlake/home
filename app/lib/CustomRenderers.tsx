import Image from 'next/image';
import type { Components } from 'react-markdown';

export const customRenderers: Components = {
  h1: ({ node, ...props }) => <h1 className="text-4xl font-bold mt-6 mb-4" {...props} />,
  h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />,
  h3: ({ node, ...props }) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
  p: ({ node, ...props }) => <p className="mb-4" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4" {...props} />,
  li: ({ node, ...props }) => <li className="mb-2" {...props} />,
  a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" {...props} />,
  table: ({ node, ...props }) => <table className="border-collapse table-auto w-full" {...props} />,
  td: ({ node, ...props }) => <td className="border px-4 py-2" {...props} />,
  tr: ({ node, ...props }) => <tr className="bg-gray-100" {...props} />,
  del: ({ node, ...props }) => <del className="line-through" {...props} />,
  code: ({ node, ...props }) => <code className="bg-gray-100 rounded px-1 py-0.5" {...props} />,
  pre: ({ node, ...props }) => (
    <pre className="block bg-gray-100 rounded p-2 my-2 overflow-x-auto" {...props} />
  ),
  // Markdown carries no intrinsic dimensions, so width/height are 0 and the
  // rendered size comes from CSS. `sizes` mirrors the post container widths in
  // app/blog/[slug]/page.tsx so the optimizer picks a source near the display size.
  img: ({ node, src, alt, width, height, ...props }) => (
    <Image
      {...props}
      src={typeof src === 'string' ? src : ''}
      alt={alt ?? ''}
      width={0}
      height={0}
      sizes="(min-width: 1280px) 42vw, (min-width: 1024px) 58vw, (min-width: 768px) 67vw, (min-width: 640px) 75vw, 100vw"
      className="mx-auto my-4 h-auto w-full"
    />
  ),
};

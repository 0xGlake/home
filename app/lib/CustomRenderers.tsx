export const customRenderers = {
  h1: ({ node, ...props }: any) => <h1 className="text-4xl font-bold mt-6 mb-4" {...props} />,
  h2: ({ node, ...props }: any) => <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />,
  h3: ({ node, ...props }: any) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
  p: ({ node, ...props }: any) => <p className="mb-4" {...props} />,
  ul: ({ node, ...props }: any) => <ul className="list-disc pl-5 mb-4" {...props} />,
  ol: ({ node, ...props }: any) => <ol className="list-decimal pl-5 mb-4" {...props} />,
  li: ({ node, ...props }: any) => <li className="mb-2" {...props} />,
  a: ({ node, ...props }: any) => <a className="text-blue-600 hover:underline" {...props} />,
  table: ({node, ...props}: any) => <table className="border-collapse table-auto w-full" {...props} />,
  tableCell: ({node, ...props}: any) => <td className="border px-4 py-2" {...props} />,
  tableRow: ({node, ...props}: any) => <tr className="bg-gray-100" {...props} />,
  del: ({node, ...props}: any) => <del className="line-through" {...props} />,
  blockquote: ({ node, ...props }: any) => (
    <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" {...props} />
  ),
  code: ({ node, inline, ...props }: any) => 
    inline ? (
      <code className="bg-gray-100 rounded px-1 py-0.5" {...props} />
    ) : (
      <code className="block bg-gray-100 rounded p-2 my-2 overflow-x-auto" {...props} />
    ),
};

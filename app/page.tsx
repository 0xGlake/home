'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';

const P5Sketch = dynamic(() => import('./components/sketch'), {
  ssr: false
});

export default function Home() {
  const [size, setSize] = useState({ width: 975, height: 750 });

  useEffect(() => {
    const handleResize = () => {
      const height = Math.min(window.innerWidth * 0.6, window.innerHeight * 0.8);
      const width = height * 1.3;
      setSize({ width: Math.floor(width), height: Math.floor(height) });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const linkVariants = {
    hover: {
      scale: 1.1,
      transition: { duration: 0.2 }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="flex items-center">
        <div className="flex flex-col items-end mr-16">
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-9xl font-bold text-gray-800 font-mono whitespace-nowrap absolute left-8 bottom-24"
            style={{ 
              transform: 'rotate(-90deg)',
              transformOrigin: 'top left'
            }}
          >
            0xGlake
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col space-y-4 items-end"
          >
            <motion.div variants={linkVariants} whileHover="hover">
              <Link href="/blog" className="text-gray-600 hover:text-gray-200 font-mono hover:underline">Blog</Link>
            </motion.div>
            <motion.div variants={linkVariants} whileHover="hover">
              <Link href="/portfolio" className="text-gray-600 hover:text-gray-200 font-mono hover:underline">Portfolio</Link>
            </motion.div>
            <motion.div variants={linkVariants} whileHover="hover">
              <Link href="/readingList" className="text-gray-600 hover:text-gray-200 font-mono hover:underline">Reading List</Link>
            </motion.div>
            <motion.div variants={linkVariants} whileHover="hover">
              <a href="https://twitter.com/0xGlake" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-200 font-mono hover:underline">Twitter</a>
            </motion.div>
          </motion.div>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          style={{width: size.width, height: size.height}}
        >
          <P5Sketch width={size.width} height={size.height} />
        </motion.div>
      </div>
    </main>
  );
}
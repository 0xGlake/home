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
  const [isMedium, setIsMedium] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMediumScreen = width <= 768; // md breakpoint

      setIsMedium(isMediumScreen);

      if (isMediumScreen) {
        const newSize = Math.min(width * 0.8, height * 0.8);
        setSize({ width: newSize, height: newSize });
      } else {
        const newHeight = Math.min(width * 0.6, height * 0.8);
        const newWidth = newHeight * 1.3;
        setSize({ width: Math.floor(newWidth), height: Math.floor(newHeight) });
      }
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
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col md:flex-row md:items-center">
        <div className="flex flex-col items-center md:items-end mx-16">
          <div className={`text-9xl font-bold text-gray-800 font-mono whitespace-nowrap ${isMedium ? '' : 'absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/4 -rotate-90'}`}>
            <motion.div
              initial={{ opacity: 0, x: isMedium ? 0 : -100, y: isMedium ? -50 : 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              0xGlake
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col space-y-4 items-center md:items-end mt-8 md:mt-0 ml-0 md:ml-16"
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
          style={{ width: size.width, height: size.height }}
          className="flex items-center mt-8 md:mt-0"
        >
          <P5Sketch key={`${size.width}-${size.height}`} width={size.width} height={size.height} />
        </motion.div>
      </div>
    </main>
  );
}

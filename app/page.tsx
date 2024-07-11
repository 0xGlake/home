'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';

const P5Sketch = dynamic(() => import('./components/sketch'), {
  ssr: false
});

const SCREEN_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
};

const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1333,
};

export default function Home() {
  const [size, setSize] = useState({ width: 975, height: 750 });
  const [screenSize, setScreenSize] = useState(SCREEN_SIZES.XL);

  useEffect(() => {
    const handleResize = () => {
      const { innerWidth: width, innerHeight: height } = window;

      let newScreenSize;
      let newSize;

      if (width <= BREAKPOINTS.SM) {
        newScreenSize = SCREEN_SIZES.SM;
        const newWidth = Math.min(width * 0.8, height * 0.5);
        newSize = { width: newWidth, height: newWidth * 1.3 };
      } else if (width <= BREAKPOINTS.MD) {
        newScreenSize = SCREEN_SIZES.MD;
        const newWidth = Math.min(width * 0.8, height * 0.8);
        newSize = { width: newWidth, height: newWidth };
      } else if (width <= BREAKPOINTS.LG) {
        newScreenSize = SCREEN_SIZES.LG;
        const newWidth = Math.min(width * 0.6, height * 0.6);
        newSize = { width: newWidth, height: newWidth };
      } else {
        newScreenSize = SCREEN_SIZES.XL;
        const newHeight = Math.min(width * 0.6, height * 0.7);
        const newWidth = newHeight * 1.4;
        newSize = { width: newWidth, height: newHeight };
      }

      //console.log(width, newScreenSize);

      setScreenSize(newScreenSize);
      setSize({
        width: Math.floor(newSize.width),
        height: Math.floor(newSize.height)
      });
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

  const getTitleStyle = () => {
    if (screenSize === SCREEN_SIZES.SM) {
      return 'text-7xl';
    }
    if (screenSize === SCREEN_SIZES.MD) {
      return 'text-8xl';
    }
    if (screenSize === SCREEN_SIZES.LG) {
      return 'text-9xl absolute left-1/2 top-0 transform -translate-x-1/2';
    }
    return 'text-9xl absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/3 -rotate-90';
  };

  const getLayoutStyle = () => {
    if (screenSize === SCREEN_SIZES.XL) {
      return 'flex flex-row justify-center items-center w-full h-screen';
    }
    return `flex flex-col ${
      screenSize === SCREEN_SIZES.LG ? 'md:flex-row md:justify-center' : 'items-center'
    } w-full`;
  };

  const getContentContainerStyle = () => {
    if (screenSize === SCREEN_SIZES.XL) {
      return 'flex flex-col space-y-4 items-end justify-center h-full ml-16 mr-12 z-50';
    }
    if (screenSize === SCREEN_SIZES.LG) {
      return 'flex flex-col space-y-4 items-end mt-24 mr-8';
    }
    return 'flex flex-col space-y-4 items-center mt-8';
  };

  const getAboutMeStyle = () => {
    if (screenSize === SCREEN_SIZES.XL) {
      return 'text-right mb-6 max-w-md w-10/12';
    }
    if (screenSize === SCREEN_SIZES.LG) {
      return 'text-right mb-6 max-w-md';
    }
    return 'text-center mb-4 max-w-md';
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 md:px-0">
      <div className={getLayoutStyle()}>
        {screenSize === SCREEN_SIZES.XL && (
          <div className="relative flex-1">
            <div className={`font-bold text-gray-800 font-mono whitespace-nowrap ${getTitleStyle()}`}>
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                &gt; 0xGlake
              </motion.div>
            </div>
          </div>
        )}
        {screenSize !== SCREEN_SIZES.XL && (
          <div className={`flex flex-col items-center ${
            screenSize === SCREEN_SIZES.LG ? 'md:items-end mx-16 md:mx-0' : 'mt-8'
          }`}>
            <div className={`font-bold text-gray-800 font-mono whitespace-nowrap ${getTitleStyle()}`}>
              <motion.div
                initial={{ opacity: 0, x: 
                  screenSize === SCREEN_SIZES.MD || 
                  screenSize === SCREEN_SIZES.SM ? 0 : -100, y: 
                  screenSize === SCREEN_SIZES.MD || 
                  screenSize === SCREEN_SIZES.SM ? -50 : 0 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                0xGlake
              </motion.div>
            </div>
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={getContentContainerStyle()}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={getAboutMeStyle()}
          >
            <p className="text-gray-400 font-mono width-1/3 z-50">
            Thanks for dropping by.
            <br /><br />
            My current interests are in: defi, full stack dev, communities, DnB, reflexive assets, green tea, employability, and more. 
            <br /><br />
            Please feel free to reach out on twitter.
            </p>
          </motion.div>
          {[
            { href: '/blog', text: 'blog' },
            { href: '/portfolio', text: 'portfolio' },
            { href: '/readingList', text: 'reading list' },
            { href: 'https://twitter.com/0xGlake', text: 'twitter', external: true },
          ].map(({ href, text, external }) => (
            <motion.div key={href} variants={linkVariants} whileHover="hover">
              {external ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-200 font-mono hover:underline">
                {text}
                </a>
              ) : (
                <Link href={href} className="text-gray-600 hover:text-gray-200 font-mono hover:underline">
                  {text}
                </Link>
              )}
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          style={{ width: size.width, height: size.height }}
          className={`flex items-center justify-center 
            ${screenSize === SCREEN_SIZES.XL ? 'mr-16 flex-1' : 'mt-8 md:mt-0 w-full'}
            ${screenSize === SCREEN_SIZES.LG ? 'mr-8' : ''}
            ${screenSize === SCREEN_SIZES.SM ? 'mb-8' : ''}`}
        >
          <P5Sketch key={`${size.width}-${size.height}`} width={size.width} height={size.height} />
        </motion.div>
      </div>
    </main>
  );
}

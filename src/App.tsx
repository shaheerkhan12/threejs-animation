import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { WaveGlobe } from './components/WaveGlobe';

function App() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = window.scrollY / scrollHeight;
      setScrollProgress(Math.min(1, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full">
      <div className="h-screen w-full fixed top-0 left-0">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 60 }}
          style={{ background: '#000000' }}
          dpr={[1, 2]}
        >
          <WaveGlobe scrollProgress={scrollProgress} />
        </Canvas>
      </div>
      
      <div className="relative">
        <div className="h-[300vh] flex flex-col justify-between text-white px-8 py-24">
          <div className="text-center mt-[50vh]">
            <h1 className="text-6xl font-bold mb-4">Scroll Down</h1>
            <p className="text-xl opacity-75">Watch the transformation</p>
          </div>
          
          <div className="text-center mb-[50vh]">
            <h2 className="text-4xl font-bold mb-4">Keep Going</h2>
            <p className="text-xl opacity-75">See the complete globe</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COUNT = 10000;
const RADIUS = 2;
const GRID_WIDTH = 8;
const GRID_HEIGHT = 4;
const WAVE_HEIGHT = 0.3;

export function WaveGlobe({ scrollProgress = 0 }) {
  const points = useRef();
  const positions = useRef(new Float32Array(COUNT * 3));
  const spherePositions = useRef(new Float32Array(COUNT * 3));
  const initialWavePositions = useRef(new Float32Array(COUNT * 3));

  // Initialize positions once
  if (!points.current) {
    const rows = Math.sqrt(COUNT);
    const cols = Math.sqrt(COUNT);
    const spacing = GRID_WIDTH / cols;

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      
      // Create a grid pattern for initial wave positions
      const col = Math.floor(i % cols);
      const row = Math.floor(i / rows);
      const x = (col * spacing) - (GRID_WIDTH / 2) + (spacing / 2);
      const z = (row * spacing) - (GRID_WIDTH / 2) + (spacing / 2);
      
      // Store initial wave positions
      initialWavePositions.current[i3] = x;
      initialWavePositions.current[i3 + 1] = 1.5;
      initialWavePositions.current[i3 + 2] = z;
      
      // Set current positions
      positions.current[i3] = x;
      positions.current[i3 + 1] = 1.5;
      positions.current[i3 + 2] = z;

      // Sphere positions
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      spherePositions.current[i3] = RADIUS * Math.sin(phi) * Math.cos(theta);
      spherePositions.current[i3 + 1] = RADIUS * Math.sin(phi) * Math.sin(theta);
      spherePositions.current[i3 + 2] = RADIUS * Math.cos(phi);
    }
  }

  useFrame((state) => {
    if (!points.current) return;

    const currentPositions = points.current.geometry.attributes.position.array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < COUNT * 3; i += 3) {
      // Calculate interpolation factor with smooth transition
      const transitionProgress = Math.min(1, scrollProgress * 1.5);

      if (transitionProgress < 0.01) {
        // Pure wave state
        const x = initialWavePositions.current[i];
        const z = initialWavePositions.current[i + 2];
        const distance = Math.sqrt(x * x + z * z);
        const waveY = 1.5 + Math.sin(distance * 2 - time * 2) * WAVE_HEIGHT;
        
        currentPositions[i] = x;
        currentPositions[i + 1] = waveY;
        currentPositions[i + 2] = z;
      } else {
        // Interpolate between wave and sphere
        const waveX = initialWavePositions.current[i];
        const waveZ = initialWavePositions.current[i + 2];
        const distance = Math.sqrt(waveX * waveX + waveZ * waveZ);
        const waveY = 1.5 + Math.sin(distance * 2 - time * 2) * WAVE_HEIGHT * (1 - transitionProgress);

        const sphereX = spherePositions.current[i];
        const sphereY = spherePositions.current[i + 1];
        const sphereZ = spherePositions.current[i + 2];

        currentPositions[i] = THREE.MathUtils.lerp(waveX, sphereX, transitionProgress);
        currentPositions[i + 1] = THREE.MathUtils.lerp(waveY, sphereY, transitionProgress);
        currentPositions[i + 2] = THREE.MathUtils.lerp(waveZ, sphereZ, transitionProgress);
      }
    }

    points.current.geometry.attributes.position.needsUpdate = true;
    
    // Rotate the entire points system
    if (points.current && scrollProgress > 0.5) {
      points.current.rotation.y += 0.001;
    } else if (points.current) {
      // Reset rotation when back to wave state
      points.current.rotation.y = 0;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNT}
          array={positions.current}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        transparent
        opacity={0.8}
        color="#ff3030"
      />
    </points>
  );
} 
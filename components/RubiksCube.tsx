import React, { useRef, useEffect, useState, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Object3D, Vector3, DoubleSide } from 'three';
import { RoundedBox, useCursor } from '@react-three/drei';
import { Cubie, Face } from '../types';
import { CUBE_COLORS } from '../constants';

interface Props {
  cubies: Cubie[];
  onAnimationComplete: () => void;
  isCelebrating?: boolean;
  theme: 'light' | 'dark';
}

// Visual component for a single colored face tile
// Memoized for performance - only re-renders when color, position, rotation, or theme changes
const FaceTile = React.memo(({ color, position, rotation, theme }: { color: string, position: [number, number, number], rotation: [number, number, number], theme: 'light' | 'dark' }) => (
  <group position={position} rotation={rotation}>
    <RoundedBox args={[0.82, 0.82, 0.05]} radius={0.08} smoothness={4}>
      <meshStandardMaterial 
        color={color} 
        roughness={0.05} 
        metalness={0.1} 
        envMapIntensity={theme === 'dark' ? 1.5 : 1.2}
        emissive={color}
        emissiveIntensity={theme === 'dark' ? 0.3 : 0}
      />
    </RoundedBox>
  </group>
));

FaceTile.displayName = 'FaceTile';

// Optimization: Memoize CubieMesh to prevent unnecessary re-renders of static cubes
const CubieMesh = React.memo(forwardRef(({ position, id, isHighlighted, theme }: any, ref: any) => {
  const [hovered, setHovered] = useState(false);
  
  // Change cursor on hover
  useCursor(hovered);

  const scale = hovered ? 1.02 : 1;

  // We construct the cube from a black core and 6 colored tiles
  return (
    <group 
      position={position} 
      ref={ref} 
      name={`cubie-${id}`}
      scale={scale}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Core Black Plastic Body. Lighter in dark mode to distinguish form. */}
      <RoundedBox args={[0.95, 0.95, 0.95]} radius={0.12} smoothness={4}>
        <meshStandardMaterial 
            color={theme === 'dark' ? "#333333" : "#1a1a1a"}
            roughness={0.4} 
            metalness={0.1}
            emissive={isHighlighted ? '#666' : '#000'}
        />
      </RoundedBox>

      {/* Face Tiles */}
      <FaceTile color={CUBE_COLORS.R} position={[0.5, 0, 0]} rotation={[0, Math.PI / 2, 0]} theme={theme} /> {/* Right */}
      <FaceTile color={CUBE_COLORS.L} position={[-0.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]} theme={theme} /> {/* Left */}
      <FaceTile color={CUBE_COLORS.U} position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} theme={theme} /> {/* Up */}
      <FaceTile color={CUBE_COLORS.D} position={[0, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]} theme={theme} /> {/* Down */}
      <FaceTile color={CUBE_COLORS.F} position={[0, 0, 0.5]} rotation={[0, 0, 0]} theme={theme} /> {/* Front */}
      <FaceTile color={CUBE_COLORS.B} position={[0, 0, -0.5]} rotation={[0, Math.PI, 0]} theme={theme} /> {/* Back */}
    </group>
  );
}));

const FaceIndicator = ({ face }: { face: Face | null }) => {
  if (!face) return null;
  
  const offset = 1.6;
  let pos: [number, number, number] = [0, 0, 0];
  let rot: [number, number, number] = [0, 0, 0];

  switch(face) {
    case Face.R: pos = [offset, 0, 0]; rot = [0, Math.PI/2, 0]; break;
    case Face.L: pos = [-offset, 0, 0]; rot = [0, Math.PI/2, 0]; break;
    case Face.U: pos = [0, offset, 0]; rot = [Math.PI/2, 0, 0]; break;
    case Face.D: pos = [0, -offset, 0]; rot = [Math.PI/2, 0, 0]; break;
    case Face.F: pos = [0, 0, offset]; rot = [0, 0, 0]; break;
    case Face.B: pos = [0, 0, -offset]; rot = [0, 0, 0]; break;
  }

  return (
    <group position={pos} rotation={rot}>
      <mesh>
        <ringGeometry args={[1.5, 1.6, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} side={DoubleSide} />
      </mesh>
    </group>
  );
};

const RubiksCube: React.FC<Props> = ({ cubies, onAnimationComplete, isCelebrating, theme }) => {
  const groupRef = useRef<Group>(null);
  const rotatingGroupRef = useRef<Group>(null);
  const containerRef = useRef<Group>(null);
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [highlightedIds, setHighlightedIds] = useState<number[]>([]);
  const [currentFace, setCurrentFace] = useState<Face | null>(null);
  
  const animationProgress = useRef(0);
  const animationTarget = useRef<{ axis: Vector3, angle: number, cubieIds: number[] } | null>(null);

  const cubieObjects = useRef<Map<number, Object3D>>(new Map());

  // Easing: Ease Out Cubic for smoother feel
  const easeOutCubic = (x: number): number => {
    return 1 - Math.pow(1 - x, 3);
  };

  useEffect(() => {
    const handleRotation = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      startAnimation(detail.face, detail.clockwise);
    };

    window.addEventListener('rotate-face', handleRotation);
    return () => window.removeEventListener('rotate-face', handleRotation);
  }, [cubies]); 

  const startAnimation = (face: Face, clockwise: boolean) => {
    if (isAnimating || !groupRef.current || !rotatingGroupRef.current) return;

    const targetIds: number[] = [];
    let axis = new Vector3(0, 0, 0);

    cubies.forEach(c => {
        const [x, y, z] = c.position;
        let match = false;
        switch (face) {
            case Face.R: match = x > 0.5; break;
            case Face.L: match = x < -0.5; break;
            case Face.U: match = y > 0.5; break;
            case Face.D: match = y < -0.5; break;
            case Face.F: match = z > 0.5; break;
            case Face.B: match = z < -0.5; break;
        }
        if (match) targetIds.push(c.id);
    });

    setHighlightedIds(targetIds);
    setCurrentFace(face);

    // Axis Setup
    if (face === Face.R) axis.set(1, 0, 0); 
    if (face === Face.L) axis.set(1, 0, 0); 
    if (face === Face.U) axis.set(0, 1, 0);
    if (face === Face.D) axis.set(0, 1, 0);
    if (face === Face.F) axis.set(0, 0, 1);
    if (face === Face.B) axis.set(0, 0, 1);

    // Rotation Angle
    let angle = Math.PI / 2;
    if (face === Face.R) angle = clockwise ? -Math.PI/2 : Math.PI/2;
    if (face === Face.L) angle = clockwise ? Math.PI/2 : -Math.PI/2;
    if (face === Face.U) angle = clockwise ? -Math.PI/2 : Math.PI/2;
    if (face === Face.D) angle = clockwise ? Math.PI/2 : -Math.PI/2;
    if (face === Face.F) angle = clockwise ? -Math.PI/2 : Math.PI/2;
    if (face === Face.B) angle = clockwise ? Math.PI/2 : -Math.PI/2;

    targetIds.forEach(id => {
        const obj = cubieObjects.current.get(id);
        if (obj && rotatingGroupRef.current) {
            rotatingGroupRef.current.attach(obj);
        }
    });

    animationTarget.current = { axis, angle, cubieIds: targetIds };
    animationProgress.current = 0;
    setIsAnimating(true);
  };

  useFrame((state, delta) => {
    // Celebration Animation
    if (isCelebrating && containerRef.current) {
        containerRef.current.rotation.y += delta * 6;
        containerRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 12) * 0.15;
        containerRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 10) * 0.1);
    } else if (containerRef.current) {
        // Reset transform gracefully
        containerRef.current.rotation.y *= 0.9;
        containerRef.current.rotation.x *= 0.9;
        containerRef.current.scale.lerp(new Vector3(1,1,1), 0.1);
    }

    // Move Animation
    if (isAnimating && rotatingGroupRef.current && animationTarget.current) {
      const duration = 0.3; // Snappy rotation
      animationProgress.current += delta / duration;

      const { axis, angle } = animationTarget.current;
      
      const t = Math.min(1, animationProgress.current);
      const ease = easeOutCubic(t);

      if (t >= 1) {
        rotatingGroupRef.current.setRotationFromAxisAngle(axis, angle);
        
        const ids = animationTarget.current.cubieIds;
        ids.forEach(id => {
            const obj = cubieObjects.current.get(id);
            if (obj && groupRef.current) {
                groupRef.current.attach(obj);
            }
        });

        rotatingGroupRef.current.rotation.set(0, 0, 0);
        
        setIsAnimating(false);
        setHighlightedIds([]);
        setCurrentFace(null);
        animationTarget.current = null;
        
        onAnimationComplete();
      } else {
        const currentAngle = angle * ease;
        rotatingGroupRef.current.setRotationFromAxisAngle(axis, currentAngle);
      }
    }
  });

  return (
    <group ref={containerRef}>
      <group ref={groupRef}>
        {cubies.map((c) => (
          <CubieMesh 
            key={c.id} 
            id={c.id} 
            position={c.position}
            isHighlighted={highlightedIds.includes(c.id)}
            theme={theme}
            ref={(el: Group) => {
               if (el) cubieObjects.current.set(c.id, el);
            }} 
          />
        ))}
      </group>
      <group ref={rotatingGroupRef}>
         {isAnimating && <FaceIndicator face={currentFace} />}
      </group>
    </group>
  );
};

export default RubiksCube;
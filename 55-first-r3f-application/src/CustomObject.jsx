import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";

export default function CustomObject() {
  const geometryRef = useRef();
  const verticesCount = 10 * 3;

  const positions = useMemo(() => {
    const positions = new Float32Array(verticesCount * 3);

    for (let i = 0; i < verticesCount; i++) {
      positions[i] = (Math.random() - 0.5) * 3;
    }

    return positions;
  }, []);

  useEffect(() => {
    geometryRef.current.computeVertexNormals();
  }, []);

  const colors = new Float32Array(verticesCount * 3);

  return (
    <mesh scale={1.5} position={[-2, -0.5, 0]}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={verticesCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <meshStandardMaterial color="red" side={THREE.DoubleSide} />
    </mesh>
  );
}

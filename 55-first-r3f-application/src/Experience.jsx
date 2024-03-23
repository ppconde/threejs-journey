import { useFrame, extend, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import CustomObject from "./CustomObject";

extend({ OrbitControls });

export default function Experience() {
  const cubeRef = useRef();
  const groupRef = useRef();

  const { camera, gl } = useThree();

  useFrame((state, delta) => {
    // Rotate the cube
    cubeRef.current.rotation.x += delta;
    state.camera.position.x = Math.sin(state.clock.elapsedTime) * 8;
    state.camera.position.z = Math.cos(state.clock.elapsedTime) * 8;
    state.camera.lookAt(0, 0, 0);
    // groupRef.current.rotation.y += delta;
  });

  return (
    <>
      <orbitControls args={[camera, gl.domElement]} />
      <directionalLight position={[1, 2, 3]} intensity={4.5} />
      <ambientLight intensity={1.5} />
      <group ref={groupRef}>
        <CustomObject />
        <mesh ref={cubeRef} scale={1.5} position={[2, -1, 0]}>
          <boxGeometry />
          <meshStandardMaterial color="mediumpurple" />
        </mesh>
      </group>
      <mesh scale={1.5} position={[0, -2, 0]}>
        <boxGeometry args={[10, 0.1, 5]} />
        <meshStandardMaterial color="greenyellow" />
      </mesh>
    </>
  );
}

import { useRef } from "react";
import { useThree } from "@react-three/fiber";
import {
  PivotControls,
  OrbitControls,
  TransformControls,
  Html,
  Text,
  Float,
  MeshReflectorMaterial,
} from "@react-three/drei";

export default function Experience() {
  const { camera, gl } = useThree();
  const cubeRef = useRef();
  const sphereRef = useRef();

  return (
    <>
      <OrbitControls makeDefault />
      <directionalLight position={[1, 2, 3]} intensity={4.5} />
      <ambientLight intensity={1.5} />

      <PivotControls
        anchor={[0, 0, 0]}
        depthTest={false}
        lineWidth={4}
        axisColors={["#9381ff", "#ff4d6d", "#7ae582"]}
        scale={100}
        fixed={true}
      >
        <mesh ref={sphereRef} position-x={-2}>
          <sphereGeometry />
          <meshStandardMaterial color="orange" />
          <Html
            position={[1, 1, 0]}
            wrapperClass="label"
            center
            distanceFactor={8}
            occlude={[sphereRef, cubeRef]}
          >
            That's a sphere 🌐
          </Html>
        </mesh>
      </PivotControls>
      <mesh ref={cubeRef} position-x={2} scale={1.5}>
        <boxGeometry />
        <meshStandardMaterial color="mediumpurple" />
      </mesh>

      <TransformControls object={cubeRef} />

      <mesh position-y={-1} rotation-x={-Math.PI * 0.5} scale={10}>
        <planeGeometry />
        {/* <meshStandardMaterial color="greenyellow" /> */}
        <MeshReflectorMaterial
          resolution={512}
          blur={[1000, 1000]}
          mixBlur={1}
          mirror={0.75}
          color={"greenyellow"}
        />
      </mesh>

      <Float speed={5} floatIntensity={2}>
        <Text
          font="./bangers-v20-latin-regular.woff"
          fontSize={1}
          color={"salmon"}
          position-y={2}
          maxWidth={2}
          textAlign="center"
        >
          I Love R3F
        </Text>
      </Float>
    </>
  );
}

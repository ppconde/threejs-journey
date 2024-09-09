import {
  useMatcapTexture,
  Center,
  Text3D,
  OrbitControls,
} from "@react-three/drei";
import { Perf } from "r3f-perf";
import * as THREE from "three";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";

export default function Experience() {
  const torusGeometry = new THREE.TorusGeometry(1, 0.6, 16, 32);
  const material = new THREE.MeshMatcapMaterial();

  //   const donutsGroup = useRef();
  const donuts = useRef([]);
  const [matcapTexture] = useMatcapTexture("605352_E9CCC5_C7A8A3_A89291", 256);

  useEffect(() => {
    matcapTexture.colorSpace = THREE.SRGBColorSpace;
    matcapTexture.needsUpdate = true;
    material.matcap = matcapTexture;
    material.needsUpdate = true;
  }, []);

  useFrame((_state, delta) => {
    // for (const donut of donutsGroup.current.children) {
    //   donut.rotation.x += delta * 0.1;
    //   donut.rotation.y += delta * 0.1;
    // }
  });

  return (
    <>
      <Perf position="top-left" />

      <OrbitControls makeDefault />

      <Center>
        <Text3D
          material={material}
          font="./fonts/helvetiker_regular.typeface.json"
          size={0.75}
          height={0.2}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
        >
          Hello R3F
          {/* <meshMatcapMaterial matcap={matcapTexture} /> */}
        </Text3D>
      </Center>

      {/* <group ref={donutsGroup}> */}
      {Array.from({ length: 100 }).map((_, i) => (
        <mesh
          ref={(element) => (donuts.current[i] = element)}
          key={i}
          material={material}
          geometry={torusGeometry}
          position={[
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
          ]}
          scale={0.2 + Math.random() * 0.2}
          rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
        >
          {/* <torusGeometry args={[1, 0.6, 16, 32]} /> */}
          {/* <meshMatcapMaterial matcap={matcapTexture} /> */}
        </mesh>
      ))}
      {/* </group> */}
    </>
  );
}

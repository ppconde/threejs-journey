import { useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  useHelper,
  SoftShadows,
  AccumulativeShadows,
  BakeShadows,
  RandomizedLight,
  Environment,
  ContactShadows,
  Sky,
  Lightformer,
  Stage,
} from "@react-three/drei";
import { useRef, useEffect } from "react";
import { Perf } from "r3f-perf";
import * as THREE from "three";
import { useControls } from "leva";

export default function Experience() {
  const cube = useRef();
  const directionalLightRef = useRef();

  useFrame((state, delta) => {
    cube.current.rotation.y += delta * 0.2;
    // cube.current.position.z = Math.sin(state.clock.getElapsedTime()) * 0.5;
    // cube.current.position.x = Math.cos(state.clock.getElapsedTime()) * 0.5;
  });

  useHelper(directionalLightRef, THREE.DirectionalLightHelper, 1);
  const { color, opacity, blur } = useControls("Contact Shadows", {
    color: "#316d39",
    opacity: { value: 0.4, min: 0, max: 1 },
    blur: { value: 2.8, min: 0, max: 19 },
  });

  const { sunPosition } = useControls("Sun Position", {
    sunPosition: { value: [1, 2, 3] },
  });

  const { envMapIntensity, envMapHeight, envMapRadius, envMapScale } =
    useControls("Environment Map", {
      envMapIntensity: { value: 1, min: 0, max: 12 },
      envMapHeight: { value: 7, min: 0, max: 12 },
      envMapRadius: { value: 28, min: 0, max: 100 },
      envMapScale: { value: 100, min: 0, max: 100 },
    });

  const scene = useThree((state) => state.scene);
  useEffect(() => {
    console.log(scene);
    scene.envMapIntensity = envMapIntensity;
  }, [envMapIntensity]);

  return (
    <>
      {/* <Environment
        // background
        ground={{
          height: envMapHeight,
          radius: envMapRadius,
          scale: envmapss,
        }}
        // files={[
        //   "./environmentMaps/2/px.jpg",
        //   "./environmentMaps/2/nx.jpg",
        //   "./environmentMaps/2/py.jpg",
        //   "./environmentMaps/2/ny.jpg",
        //   "./environmentMaps/2/pz.jpg",
        //   "./environmentMaps/2/nz.jpg",
        // ]}
        // files={"./environmentMaps/the_sky_is_on_fire_2k.hdr"}
        preset="sunset"
      >
        <color args={["#000000"]} attach={"background"} />
        <Lightformer
          position-z={-5}
          scale={10}
          color={"red"}
          intensity={10}
          form={"ring"}
        />
        <mesh position-z={-5} scale={10}>
          <planeGeometry />
          <meshBasicMaterial color={[10, 0, 0]} />
        </mesh>
      </Environment> */}
      {/* <BakeShadows /> */}
      {/* <SoftShadows size={25} samples={10} focus={0} rings={11} /> */}
      <Perf position="top-left" />

      <OrbitControls makeDefault />

      {/* <AccumulativeShadows
        position-y={-0.99}
        scale={10}
        color="#316d39"
        opacity={0.8}
        frames={Infinity}
        temporal
        blend={100}
      >
        <RandomizedLight
          amount={8}
          radius={1}
          ambient={0.5}
          intensity={3}
          position={[1, 2, 3]}
          bias={0.001}
        />
      </AccumulativeShadows> */}

      {/* <ContactShadows
        scale={10}
        position-y={-0.99}
        resolution={512}
        far={5}
        color={color}
        opacity={opacity}
        blur={blur}
        // for baking
        frames={1}
      /> */}
      {/* <directionalLight
        castShadow
        ref={directionalLightRef}
        position={sunPosition}
        intensity={4.5}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={10}
        shadow-camera-top={5}
        shadow-camera-right={5}
        shadow-camera-bottom={-5}
        shadow-camera-left={-5}
      />
      <ambientLight intensity={1.5} /> */}

      {/* <Sky sunPosition={sunPosition} /> */}
      <Stage
        shadows={{
          type: "contact",
          opacity: 0.5,
          blur: 3,
        }}
        environment={"sunset"}
        preset={"portrait"}
        intensity={envMapIntensity}
      >
        <mesh position-x={-2} position-y={1} castShadow>
          <sphereGeometry />
          <meshStandardMaterial
            color="orange"
            envMapIntensity={envMapIntensity}
          />
        </mesh>

        <mesh ref={cube} position-x={2} position-y={1} scale={1.5} castShadow>
          <boxGeometry />
          <meshStandardMaterial
            color="mediumpurple"
            envMapIntensity={envMapIntensity}
          />
        </mesh>
      </Stage>
      {/* <mesh
        position-y={0}
        rotation-x={-Math.PI * 0.5}
        scale={10}
        // receiveShadow
      >
        <planeGeometry />
        <meshStandardMaterial
          color="greenyellow"
          envMapIntensity={envMapIntensity}
        />
      </mesh> */}
    </>
  );
}

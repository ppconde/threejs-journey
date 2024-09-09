import { Clone, useGLTF } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

export default function Model() {
  //   const model = useLoader(GLTFLoader, "hamburger.glb", (loader) => {
  //     const dracoLoader = new DRACOLoader();
  //     dracoLoader.setDecoderPath("/draco/");
  //     loader.setDRACOLoader(dracoLoader);
  //   });
  // Works with draco loader too, it downloads it from a CDN
  const model = useGLTF("hamburger-draco.glb");

  //   return <primitive object={model.scene} scale={0.35} />;

  // Best for multiple instances of the same model. You should clone it when possible
  // it keeps the same geometry in memory and only creates new materials
  return (
    <>
      <Clone object={model.scene} scale={0.35} position-x={-4} />
      <Clone object={model.scene} scale={0.35} position-x={0} />
      <Clone object={model.scene} scale={0.35} position-x={4} />
    </>
  );
}

// Make sure you are using this model, it will preload it for you
useGLTF.preload("hamburger-draco.glb");

import { useGLTF } from "@react-three/drei";
import { useAnimations } from "@react-three/drei";
import { useEffect } from "react";
import { useControls } from "leva";

export default function Fox(props) {
  const fox = useGLTF("Fox/glTF/Fox.gltf");
  const { actions, names } = useAnimations(fox.animations, fox.scene);

  const { animationName } = useControls({
    animationName: { value: "Run", options: names },
  });

  useEffect(() => {
    actions[animationName].reset().fadeIn(0.5).play();

    return () => {
      actions[animationName].fadeOut(0.5);
    };

    // setTimeout(() => {
    //   actions.Walk.play();
    //   actions.Walk.crossFadeFrom(actions.Run, 1);
    // }, 2000);
  }, [animationName]);

  return (
    <primitive
      object={fox.scene}
      {...props}
      scale={0.02}
      position={[-2.5, 0, 2.5]}
      rotation-y={0.3}
    />
  );
}

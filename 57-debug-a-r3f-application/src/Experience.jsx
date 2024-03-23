import { OrbitControls } from "@react-three/drei";
import { button, useControls } from "leva";
import { Perf } from "r3f-perf";

export default function Experience() {
  const { color, position, visible } = useControls("Sphere", {
    color: "#db8282",
    position: {
      value: { x: 2, y: 0 },
      step: 0.01,
      joystick: "invertY",
    },
    visible: true,
    myInterval: {
      min: 0,
      max: 10,
      value: [4, 5],
    },
    clickMe: button(() => console.log("clicked")),
    choice: {
      options: ["Option 1", "Option 2", "Option 3"],
    },
  });

  const { scale } = useControls("Box", {
    scale: {
      value: 1.5,
      step: 0.01,
      min: 0.5,
      max: 2,
    },
  });

  const { perfVisible } = useControls({ perfVisible: true });

  return (
    <>
      {perfVisible ? <Perf position="top-left" /> : null}
      <OrbitControls makeDefault />

      <directionalLight position={[1, 2, 3]} intensity={4.5} />
      <ambientLight intensity={1.5} />

      <mesh position-x={-2}>
        <sphereGeometry />
        <meshStandardMaterial color="orange" />
      </mesh>

      <mesh
        position={[position.x, position.y, 0]}
        scale={scale}
        visible={visible}
      >
        <boxGeometry />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh position-y={-1} rotation-x={-Math.PI * 0.5} scale={10}>
        <planeGeometry />
        <meshStandardMaterial color="greenyellow" />
      </mesh>
    </>
  );
}

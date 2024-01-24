import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import GUI from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const textureLoader = new THREE.TextureLoader();

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      child.material.envMapIntensity = 2.5;
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
  "/textures/environmentMaps/0/px.jpg",
  "/textures/environmentMaps/0/nx.jpg",
  "/textures/environmentMaps/0/py.jpg",
  "/textures/environmentMaps/0/ny.jpg",
  "/textures/environmentMaps/0/pz.jpg",
  "/textures/environmentMaps/0/nz.jpg",
]);

scene.background = environmentMap;
scene.environment = environmentMap;

/**
 * Models
 */
gltfLoader.load("/models/DamagedHelmet/glTF/DamagedHelmet.gltf", (gltf) => {
  gltf.scene.scale.set(2, 2, 2);
  gltf.scene.rotation.y = Math.PI * 0.5;
  scene.add(gltf.scene);

  updateAllMaterials();
});

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 3, -2.25);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Update effect composer
  effectComposer.setSize(sizes.width, sizes.height);
  effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(4, 1, -4);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Post processing
 */

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Effects
// Render target
const renderTarget = new THREE.WebGLRenderTarget(800, 600, {
  // Fixes antialias, 0 corresponds to no samples, increasing this value will lower the performance
  samples: renderer.getPixelRatio() === 1 ? 2 : 0,
});
const effectComposer = new EffectComposer(renderer, renderTarget);
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
effectComposer.setSize(sizes.width, sizes.height);

const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);

const dotScreenPass = new DotScreenPass();
dotScreenPass.enabled = false;
effectComposer.addPass(dotScreenPass);

const glitchPass = new GlitchPass();
glitchPass.enabled = false;
effectComposer.addPass(glitchPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
effectComposer.addPass(rgbShiftPass);

const unrealBloomPass = new UnrealBloomPass();
unrealBloomPass.enabled = true;
unrealBloomPass.strength = 0.3;
unrealBloomPass.radius = 0.5;
unrealBloomPass.threshold = 0.6;
effectComposer.addPass(unrealBloomPass);
gui.add(unrealBloomPass, "enabled").name("Bloom");
gui.add(unrealBloomPass, "strength").min(0).max(2).step(0.001).name("Strength");
gui.add(unrealBloomPass, "radius").min(0).max(2).step(0.001).name("Radius");
gui
  .add(unrealBloomPass, "threshold")
  .min(0)
  .max(1)
  .step(0.001)
  .name("Threshold");

// Tint pass
const tintShader = {
  uniforms: {
    // It will have the texture of the previous pass, effect composer will update it automatically
    tDiffuse: { value: null },
    uTint: { value: null },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vUv = uv;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec3 uTint;

    varying vec2 vUv;

    void main() {
        vec4 color = texture2D(tDiffuse, vUv);
        color.rgb += uTint;
        gl_FragColor = vec4(color);
    }`,
};

const tintPass = new ShaderPass(tintShader);
tintPass.uniforms.uTint.value = new THREE.Vector3();
effectComposer.addPass(tintPass);

gui
  .add(tintPass.uniforms.uTint.value, "x")
  .min(-1)
  .max(1)
  .step(0.001)
  .name("Red");
gui
  .add(tintPass.uniforms.uTint.value, "y")
  .min(-1)
  .max(1)
  .step(0.001)
  .name("Green");
gui
  .add(tintPass.uniforms.uTint.value, "z")
  .min(-1)
  .max(1)
  .step(0.001)
  .name("Blue");

// Displacement shader
const displacementShader = {
  uniforms: {
    // It will have the texture of the previous pass, effect composer will update it automatically
    tDiffuse: { value: null },
    // uTime: { value: 0 },
    uNormalMap: { value: null },
    // Light reflection on the behive effect
    uLightDirection: { value: null },
  },
  vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vUv = uv;
      }
    `,
  fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse;
      uniform sampler2D uNormalMap;
      uniform float uTime;
      uniform vec3 uLightDirection;
      varying vec2 vUv;
  
      void main() {    
        vec3 normalColor = texture2D(uNormalMap, vUv).rgb * 2.0 - 1.0;
        vec2 newUv = vUv + normalColor.xy;
        vec4 color = texture2D(tDiffuse, newUv);
        // newUv.y += sin(vUv.x * 10.0 + uTime) * 0.1;
        vec3 lightDirection = normalize(uLightDirection);
        float lightness = clamp(dot(normalColor, lightDirection), 0.0, 1.0);
        color.rgb += lightness * 2.0;
        gl_FragColor = color;
      }`,
};

const displacementPass = new ShaderPass(displacementShader);
displacementPass.material.uniforms.uNormalMap.value = textureLoader.load(
  "/textures/interfaceNormalMap.png"
);
displacementPass.material.uniforms.uLightDirection.value =
  directionalLight.position;
effectComposer.addPass(displacementPass);

gui
  .add(displacementPass.material.uniforms.uLightDirection.value, "x")
  .min(-10)
  .max(10)
  .step(0.001)
  .name("Light X");
gui
  .add(displacementPass.material.uniforms.uLightDirection.value, "y")
  .min(-10)
  .max(10)
  .step(0.001)
  .name("Light Y");
gui
  .add(displacementPass.material.uniforms.uLightDirection.value, "z")
  .min(-10)
  .max(10)
  .step(0.001)
  .name("Light Z");

// Fixes the color of the scene
const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
effectComposer.addPass(gammaCorrectionPass);

// Anti aliasing
const smmaPass = new SMAAPass();
if (renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2) {
  effectComposer.addPass(smmaPass);
  console.log("Using SMAA");
}

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  //   displacementPass.material.uniforms.uTime.value = elapsedTime;
  // Update controls
  controls.update();

  // Render
  //   renderer.render(scene, camera);
  effectComposer.render();
  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

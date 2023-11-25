import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

function generateKochSnowflake(level, centerX, centerY, size) {
    const points = [];

    function kochLine(x1, y1, x2, y2, level) {
        if (level === 0) {
            points.push(x1, y1, x2, y2);
        } else {
            const deltaX = (x2 - x1) / 3;
            const deltaY = (y2 - y1) / 3;

            const xA = x1 + deltaX;
            const yA = y1 + deltaY;

            const xB = 0.5 * (x1 + x2) + Math.sqrt(3) * (y1 - y2) / 6;
            const yB = 0.5 * (y1 + y2) + Math.sqrt(3) * (x2 - x1) / 6;

            const xC = x1 + 2 * deltaX;
            const yC = y1 + 2 * deltaY;

            kochLine(x1, y1, xA, yA, level - 1);
            kochLine(xA, yA, xB, yB, level - 1);
            kochLine(xB, yB, xC, yC, level - 1);
            kochLine(xC, yC, x2, y2, level - 1);
        }
    }

    // Initial triangle points
    const height = (Math.sqrt(3) / 2) * size;
    const x1 = centerX;
    const y1 = centerY - height / 2;
    const x2 = centerX - size / 2;
    const y2 = centerY + height / 2;
    const x3 = centerX + size / 2;
    const y3 = centerY + height / 2;

    // Generate the three segments of the Koch snowflake
    kochLine(x1, y1, x2, y2, level);
    kochLine(x2, y2, x3, y3, level);
    kochLine(x3, y3, x1, y1, level);

    return new Float32Array(points);
}

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/textures/particles/2.png');


/**
 * Particles
 */
// Geometry
// const particlesGeometry = new THREE.SphereGeometry(1, 32, 32);
// Material
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    sizeAttenuation: true,
    color: new THREE.Color('#ff88cc'),
    alphaMap: particleTexture,
    transparent: true,
    // alphaTest: 0.001,
    // depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
});

// Points
// const particles = new THREE.Points(particlesGeometry, particlesMaterial);
// scene.add(particles);

// Custom geometry
// const customGeometry = new THREE.BufferGeometry();
// const snowFlakeVertices = generateKochSnowflake(3, 0, 0, 1);
// customGeometry.setAttribute('position', new THREE.BufferAttribute(snowFlakeVertices, 3))
// const snowFlakes = new THREE.Points(customGeometry, particlesMaterial);
// scene.add(snowFlakes);

const particlesGeometry = new THREE.BufferGeometry();
const count = 500000;

const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3) // RGB same size as vec3

for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10;
    colors[i] = Math.random();
}

particlesGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3),
);
particlesGeometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colors, 3),
);
const particles = new THREE.Points(particlesGeometry, particlesMaterial);


scene.add(particles);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    //Update particles
    // particles.rotation.y = elapsedTime * 0.02;

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const y3 = i3 + 1;
        const x3 = i3 + 0;
        const x = particlesGeometry.attributes.position.array[x3];
        particlesGeometry.attributes.position.array[y3] = Math.sin(elapsedTime + x);

        particlesGeometry.attributes.position.needsUpdate = true;
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import * as CANNON from 'cannon-es';

/**
 * Debug
 */
const gui = new GUI()
const debugObject = {};

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sounds
 */
const hitSound = new Audio('/sounds/hit.mp3');

const playHitSound = (collision) => {
    const impactStr = collision.contact.getImpactVelocityAlongNormal();
    const maxImpactStr = collision.contact.maxForce;
    const minImpactStr = collision.contact.minForce;
    if (impactStr > 1.5) {
        // Value normalized between 0 and 1 and scaled back to 0 and 100_000
        hitSound.volume = (impactStr - minImpactStr) / (maxImpactStr - minImpactStr) * 100_000;
        hitSound.currentTime = 0;
        hitSound.play();
    }
}

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
]);

/**
 * Physics
 */

// World
const world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;
// Set gravity with g constant for y
world.gravity.set(0, -9.82, 0);

// Materials
const defaultMaterial = new CANNON.Material('concrete');

const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.7,
    }
);

world.addContactMaterial(defaultContactMaterial);
world.defaultContactMaterial = defaultContactMaterial;

// Floor
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
floorBody.mass = 0;
floorBody.addShape(floorShape);
floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1, 0, 0),
    Math.PI / 2,
)
world.addBody(floorBody);

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

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
camera.position.set(- 3, 3, 3)
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
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Utils
 */
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture
});
const objectsToUpdate = [];
const createSphere = (radius, position) => {
    // Three.js mesh
    const mesh = new THREE.Mesh(
        sphereGeometry,
        sphereMaterial
    );
    mesh.scale.set(radius, radius, radius);
    mesh.castShadow = true;
    mesh.position.copy(position)
    scene.add(mesh);

    // Cannon.js body
    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape,
        material: defaultMaterial,
    });
    body.position.copy(position);
    body.addEventListener('collide', playHitSound);
    world.addBody(body);

    objectsToUpdate.push({ mesh, body });
}

debugObject.createSphere = () => {
    const radius = Math.random() * 0.5;
    const position = {
        x: (Math.random() - 0.5) * 3,
        y: 3,
        z: (Math.random() - 0.5) * 3
    }
    createSphere(radius, position);
};
// createSphere(0.5, { x: 0, y: 3, z: 0 });

// Create boxes
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
});
const createBox = (width, height, depth, position) => {
    const mesh = new THREE.Mesh(
        boxGeometry,
        boxMaterial,
    );
    mesh.scale.set(width, height, depth);
    mesh.position.copy(position);
    mesh.castShadow = true;
    scene.add(mesh);

    // Cannon body
    // Box shape needs to be half the size of the mesh because it's center is at the center of box
    // and the vector is related to the center of the box
    const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(),
        shape,
        material: defaultMaterial,
    });

    body.position.copy(position);
    body.addEventListener('collide', playHitSound);
    world.addBody(body);
    objectsToUpdate.push({ mesh, body });
}
// createBox(1, 1, 1, { x: 0, y: 3, z: 0 });

debugObject.createBox = () => {
    const width = Math.random() * 0.5;
    const height = Math.random() * 0.5;
    const depth = Math.random() * 0.5;
    const position = {
        x: (Math.random() - 0.5) * 3,
        y: 3,
        z: (Math.random() - 0.5) * 3
    }
    createBox(width, height, depth, position);
};

debugObject.reset = () => {
    for (const object of objectsToUpdate) {
        object.body.removeEventListener('collide', playHitSound);
        world.removeBody(object.body);
        scene.remove(object.mesh);
    }
    objectsToUpdate.length = 0;
}

gui.add(debugObject, 'createSphere')
gui.add(debugObject, 'createBox');
gui.add(debugObject, 'reset');

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0;
const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime;
    oldElapsedTime = elapsedTime;

    // Update physics world
    // 1/60 is the period needed for 60 fps
    world.step(1 / 60, deltaTime, 3);

    for (const object of objectsToUpdate) {
        object.mesh.position.copy(object.body.position);
        object.mesh.quaternion.copy(object.body.quaternion);
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
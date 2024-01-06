// it will apply transformations to the coordinates into the clip space coordinates
uniform mat4 projectionMatrix;
// it will apply transformations relative to the Camera (position, rotation, fov, near, far)
uniform mat4 viewMatrix;
// it will apply transformations relative to the Mesh (position, rotation, scale)
uniform mat4 modelMatrix;

// Set from script.js
uniform vec2 uFrequency;

uniform float uTime;

attribute vec3 position;
// Set from script.js
attribute float aRandom;

attribute vec2 uv;

varying vec2 vUv;

varying float vRandom;

varying float vElevation;

void main() {
    // vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    // // modelPosition.z = sin(modelPosition.x * 10.0) * 0.1;
    // modelPosition.z = aRandom * 0.1;
    // vec4 viewPosition = viewMatrix * modelPosition;
    // vec4 projectedPosition = projectionMatrix * viewPosition;

    // gl_Position = projectedPosition;
    // // gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

    // vRandom = aRandom;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float elevation = sin(modelPosition.x * uFrequency.x - uTime) * 0.1;
    elevation += sin(modelPosition.y * uFrequency.y - uTime) * 0.1;

    modelPosition.z += sin(modelPosition.x * uFrequency.x - uTime) * 0.1;
    modelPosition.z += elevation;
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    vUv = uv;
    vElevation = elevation;
}
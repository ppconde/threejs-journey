// Threejs converts to a vec3 because it has no alpha channel
uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;

void main() {
    float mixStrengh = vElevation * uColorMultiplier + uColorOffset;
    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrengh);

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
}
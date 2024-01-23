varying vec3 vColor;

void main() {
    #include <colorspace_fragment>
    // float strength = distance(gl_PointCoord, vec2(0.5));
    // strength = 1.0 - smoothstep(0.0, 0.3, strength);

    // Light point
    float strength = 1.0 - distance(gl_PointCoord, vec2(0.5));
    strength = pow(strength, 1.0);

    // Final color
    vec3 color = mix(vec3(0.0), vColor, strength);

    gl_FragColor = vec4(color, 1.0);
}
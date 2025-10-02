export const coneTrailVertex = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const coneTrailFragment = `
uniform float time;
uniform float threshold;
uniform float scaleU;
uniform float scaleV;
uniform vec2 direction;
uniform float speed;
uniform float rotation;
uniform vec3 color1;
uniform vec3 color2;

uniform float fadeStrength;
uniform vec2 fadeAxis;
uniform float fadeOffset;
uniform float fadeSmoothness;
uniform float fadeRotation;

varying vec2 vUv;

// Pseudo-random function
float rand(vec2 co) {
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

// 2D noise
float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  float a = rand(i);
  float b = rand(i + vec2(1.0, 0.0));
  float c = rand(i + vec2(0.0, 1.0));
  float d = rand(i + vec2(1.0, 1.0));

  vec2 u = f*f*(3.0-2.0*f);
  return mix(a, b, u.x) +
         (c - a)*u.y*(1.0 - u.x) +
         (d - b)*u.x*u.y;
}

// Rotate UV around center
vec2 rotateUV(vec2 uv, float angle) {
  vec2 center = vec2(0.5);
  uv -= center;
  float cosA = cos(angle);
  float sinA = sin(angle);
  uv = vec2(
    uv.x * cosA - uv.y * sinA,
    uv.x * sinA + uv.y * cosA
  );
  uv += center;
  return uv;
}

// Rotate a vector
vec2 rotateVector(vec2 v, float angle) {
  float cosA = cos(angle);
  float sinA = sin(angle);
  return vec2(v.x * cosA - v.y * sinA, v.x * sinA + v.y * cosA);
}

void main() {
  vec2 uv = vUv;

  // Rotate noise
  uv = rotateUV(uv, rotation);

  // Scale/stretch
  uv = uv * vec2(scaleU, scaleV);

  // Animate along direction
  uv += direction * time * speed;

  // Compute noise
  float n = noise(uv);
  
  // Apply threshold
  n = step(threshold, n);
  
  // Invert noise
  n = 1.0 - n;
  
  // Mix colors
  vec3 color = mix(color1, color2, n);

  // Rotate fade axis
  vec2 rotatedFadeAxis = rotateVector(fadeAxis, fadeRotation);

  // Compute dynamic edge fade along rotated axis
  float fadeCoord = dot(vUv, rotatedFadeAxis);
  float edgeFade = 1.0 - smoothstep(fadeOffset, fadeOffset + fadeSmoothness, 1.0 - fadeCoord);

  float alpha = n * edgeFade * fadeStrength;

  gl_FragColor = vec4(color, alpha);
}
`;
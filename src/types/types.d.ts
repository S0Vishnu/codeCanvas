declare module "three/examples/jsm/utils/BufferGeometryUtils" {
  import * as THREE from "three";
  export function mergeBufferGeometries(
    geometries: THREE.BufferGeometry[],
    useGroups?: boolean
  ): THREE.BufferGeometry;
}
// images
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

// 3D models
declare module '*.glb' {
  const value: string;
  export default value;
}

declare module '*.gltf' {
  const value: string;
  export default value;
}

// Videos
declare module '*.mp4' {
  const value: string;
  export default value;
}

// Audio
declare module '*.mp3' {
  const value: string;
  export default value;
}

// Cube textures / arrays of images
declare module '*.cube' {
  const value: string[];
  export default value;
}

declare module "*.vert" {
  const value: string;
  export default value;
}

declare module "*.frag" {
  const value: string;
  export default value;
}

declare module '*.glsl' {
  const value: string;
  export default value;
}

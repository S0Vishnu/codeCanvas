import { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

type UploadedModelProps = {
  url: string;
};

const UploadedModel = ({ url }: UploadedModelProps) => {
  const { scene } = useGLTF(url, true);
  return <primitive object={scene} />;
};

export default function GLTFCompressorPage() {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<any | null>(null);
  const [compressedScene, setCompressedScene] = useState<THREE.Group | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setModelUrl(url);
      setCompressedScene(null);
      setStats(null);
    }
  };

  const normalizeGeometry = (geom: THREE.BufferGeometry) => {
    if (!geom.getAttribute("position")) return null;

    // Ensure we have normals
    if (!geom.getAttribute("normal")) {
      geom.computeVertexNormals();
    }

    // Ensure we have UVs (even if dummy)
    if (!geom.getAttribute("uv")) {
      const count = geom.getAttribute("position").count;
      const dummyUVs = new Float32Array(count * 2);
      geom.setAttribute("uv", new THREE.BufferAttribute(dummyUVs, 2));
    }

    // Clear morph attributes
    geom.morphAttributes = {};

    return geom;
  };

  const compressTexture = (texture: THREE.Texture): Promise<THREE.Texture> => {
    return new Promise((resolve) => {
      if (!texture.image) {
        resolve(texture);
        return;
      }

      // If the texture is already compressed, don't recompress
      if (texture.userData.compressed) {
        resolve(texture);
        return;
      }

      const img = texture.image;
      
      // Create offscreen canvas for compression
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(texture);
        return;
      }

      // Calculate dimensions while maintaining aspect ratio
      const maxDimension = 1024;
      let width = img.width;
      let height = img.height;

      if (width > height && width > maxDimension) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else if (height > maxDimension) {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }

      width = Math.max(128, width);
      height = Math.max(128, height);

      canvas.width = width;
      canvas.height = height;

      // Draw image to canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Check if the image has transparency
      let imageData, hasTransparency = false;
      try {
        imageData = ctx.getImageData(0, 0, width, height);
        for (let i = 3; i < imageData.data.length; i += 4) {
          if (imageData.data[i] < 255) {
            hasTransparency = true;
            break;
          }
        }
      } catch (e) {
        console.log('e: ', e);
        // Cross-origin issue, can't check transparency
        console.warn("Could not check image transparency due to CORS restrictions");
      }

      // Use appropriate format based on transparency
      const mimeType = hasTransparency ? 'image/png' : 'image/jpeg';
      const quality = hasTransparency ? 0.9 : 0.8;

      // Convert to data URL
      const dataUrl = canvas.toDataURL(mimeType, quality);
      
      // Create a new image to load the compressed data
      const newImg = new Image();
      newImg.onload = () => {
        const compressedTexture = new THREE.Texture(newImg);
        compressedTexture.colorSpace = THREE.SRGBColorSpace;
        compressedTexture.flipY = false;
        compressedTexture.needsUpdate = true;
        compressedTexture.userData.compressed = true;
        resolve(compressedTexture);
      };
      
      newImg.onerror = () => {
        console.error("Failed to load compressed image");
        resolve(texture); // Fallback to original texture
      };
      
      newImg.src = dataUrl;
    });
  };

  const handleCompress = async () => {
    if (!sceneRef.current) return;
    
    setIsCompressing(true);
    
    // Small delay to allow UI to update
    await new Promise(resolve => setTimeout(resolve, 100));

    const meshes: THREE.Mesh[] = [];
    sceneRef.current.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        meshes.push(obj as THREE.Mesh);
      }
    });
    
    if (meshes.length === 0) {
      setIsCompressing(false);
      return;
    }

    // Group geometries by material to preserve textures
    const geometryGroups: {[key: string]: THREE.BufferGeometry[]} = {};
    const materialMap: {[key: string]: THREE.Material} = {};
    
    for (const mesh of meshes) {
      const material = Array.isArray(mesh.material) 
        ? mesh.material[0] 
        : mesh.material;
      
      const materialKey = (material as any).uuid || "default";
      
      if (!geometryGroups[materialKey]) {
        geometryGroups[materialKey] = [];
        materialMap[materialKey] = material;
      }
      
      const clonedGeometry = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
      const normalizedGeometry = normalizeGeometry(clonedGeometry);
      
      if (normalizedGeometry) {
        geometryGroups[materialKey].push(normalizedGeometry);
      }
    }

    // Create a new group for the compressed scene
    const compressedGroup = new THREE.Group();
    
    // Process each material group
    for (const materialKey in geometryGroups) {
      if (geometryGroups[materialKey].length === 0) continue;
      
      // Merge geometries with the same material
      const mergedGeometry = BufferGeometryUtils.mergeGeometries(
        geometryGroups[materialKey], 
        false
      );
      
      if (!mergedGeometry) continue;
      
      let material = materialMap[materialKey];
      
      // Compress texture if it exists
      if ((material as THREE.MeshStandardMaterial).map) {
        try {
          const compressedTexture = await compressTexture(
            (material as THREE.MeshStandardMaterial).map!
          );
          
          material = material.clone();
          (material as THREE.MeshStandardMaterial).map = compressedTexture;
          (material as THREE.MeshStandardMaterial).needsUpdate = true;
        } catch (error) {
          console.error("Error compressing texture:", error);
        }
      }
      
      const mergedMesh = new THREE.Mesh(mergedGeometry, material);
      compressedGroup.add(mergedMesh);
    }

    // Calculate statistics
    const originalVerts = meshes.reduce(
      (sum, m) => sum + m.geometry.attributes.position.count,
      0
    );
    
    const mergedVerts = compressedGroup.children.reduce(
      (sum, child) => sum + (child as THREE.Mesh).geometry.attributes.position.count,
      0
    );
    
    const originalGeom = meshes.length;
    const mergedGeom = compressedGroup.children.length;
    
    // Estimate texture size
    let textureSize = 0;
    if (meshes[0].material && (meshes[0].material as THREE.MeshStandardMaterial).map) {
      const map = (meshes[0].material as THREE.MeshStandardMaterial).map;
      if (map && map.image) {
        textureSize = map.image.width * map.image.height;
      }
    }

    setStats({
      originalVerts,
      mergedVerts,
      originalGeom,
      mergedGeom,
      textureSize,
      reduction: Math.round((1 - mergedVerts / originalVerts) * 100)
    });

    setCompressedScene(compressedGroup);
    setIsCompressing(false);
  };

  // Clear the compressed scene when a new model is uploaded
  useEffect(() => {
    if (modelUrl) {
      setCompressedScene(null);
    }
  }, [modelUrl]);

  return (
    <div className="compressor-container">
      <div className="toolbar">
        <input
          ref={fileInputRef}
          type="file"
          accept=".glb,.gltf"
          onChange={handleUpload}
        />
        <button 
          className={`btn ${isCompressing ? 'compressing' : ''}`} 
          onClick={handleCompress} 
          disabled={!modelUrl || isCompressing}
        >
          {isCompressing ? 'Compressing...' : 'Compress'}
        </button>
      </div>
      
      {stats && (
        <div className="stats-panel">
          <h3>Compression Results</h3>
          <p>Original Vertices: {stats.originalVerts.toLocaleString()}</p>
          <p>Merged Vertices: {stats.mergedVerts.toLocaleString()}</p>
          <p>Vertex Reduction: {stats.reduction}%</p>
          <p>Original Geometries: {stats.originalGeom}</p>
          <p>Merged Geometries: {stats.mergedGeom}</p>
          <p>Texture Size: {stats.textureSize.toLocaleString()}px</p>
        </div>
      )}
      
      <Canvas
        className="viewer"
        onCreated={({ scene }) => {
          sceneRef.current = scene;
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        
        {compressedScene ? (
          <primitive object={compressedScene} />
        ) : modelUrl ? (
          <UploadedModel url={modelUrl} />
        ) : null}
        
        <OrbitControls />
      </Canvas>
    </div>
  );
}
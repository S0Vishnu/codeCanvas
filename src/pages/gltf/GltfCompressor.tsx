import { useState, useRef, type DragEvent } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import ReactComponentGenerator from "../../modules/gltf/ReactComponentGenerator";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import "../../styles/GltfCompressor.css";

type UploadedModelProps = { url: string };
const UploadedModel = ({ url }: UploadedModelProps) => {
    const { scene } = useGLTF(url, true);
    return <primitive object={scene} />;
};

type CompressionStats = {
    originalVerts: number;
    mergedVerts: number;
    originalGeom: number;
    mergedGeom: number;
    textureSize: number;
    reduction: number;
};

export default function GLTFCompressorPage() {
    const [modelUrl, setModelUrl] = useState<string | null>(null);
    const [stats, setStats] = useState<CompressionStats | null>(null);
    const [compressedScene, setCompressedScene] = useState<THREE.Group | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [compressionStep, setCompressionStep] = useState<string | null>(null);

    // Handle file selection
    const handleFile = (file: File) => {
        const url = URL.createObjectURL(file);
        setModelUrl(url);
        setCompressedScene(null);
        setStats(null);
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.name.endsWith(".glb") || file.name.endsWith(".gltf")) {
                handleFile(file);
            } else alert("Only .glb or .gltf files are supported.");
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(true);
    };
    const handleDragLeave = () => setDragOver(false);

    const normalizeGeometry = (geom: THREE.BufferGeometry) => {
        if (!geom.getAttribute("position")) return null;
        if (!geom.getAttribute("normal")) geom.computeVertexNormals();
        if (!geom.getAttribute("uv")) {
            const count = geom.getAttribute("position").count;
            geom.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(count * 2), 2));
        }
        geom.morphAttributes = {};
        return geom;
    };

    const compressTexture = async (texture: THREE.Texture) => {
        const img = texture.image;
        if (
            !(
                img instanceof HTMLImageElement ||
                img instanceof HTMLCanvasElement ||
                img instanceof ImageBitmap ||
                img instanceof HTMLVideoElement
            )
        ) {
            console.warn("Unsupported texture image type:", img);
            return texture;
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return texture;

        const maxDim = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
        } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
        }
        width = Math.max(128, width);
        height = Math.max(128, height);
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img as CanvasImageSource, 0, 0, width, height);

        // Create a THREE.Texture directly from the canvas
        const compressed = new THREE.Texture(canvas);
        compressed.flipY = false;
        compressed.colorSpace = THREE.SRGBColorSpace;
        compressed.needsUpdate = true;

        return compressed;
    };

    const compressMaterialTextures = async (material: THREE.Material) => {
        const mat = material.clone() as THREE.MeshStandardMaterial;
        const textureProps = [
            "map",
            "aoMap",
            "emissiveMap",
            "metalnessMap",
            "roughnessMap",
            "normalMap",
            "displacementMap",
            "alphaMap",
        ] as const;

        for (const prop of textureProps) {
            const tex = (mat as unknown as Record<string, THREE.Texture | undefined>)[prop];
            if (tex) {
                const compressed = await compressTexture(tex);
                (mat as unknown as Record<string, THREE.Texture | undefined>)[prop] = compressed;
                compressed.needsUpdate = true;
            }
        }
        return mat;
    };

    const handleCompress = async () => {
        if (!sceneRef.current) return;

        setIsCompressing(true);
        setCompressionStep("Collecting meshes...");
        await new Promise((r) => setTimeout(r, 50)); // allow overlay render

        const meshes: THREE.Mesh[] = [];
        sceneRef.current.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh) meshes.push(obj as THREE.Mesh);
        });

        if (!meshes.length) {
            setCompressionStep(null);
            return setIsCompressing(false);
        }

        setCompressionStep(`Found ${meshes.length} meshes. Grouping geometries...`);

        const geometryGroups: Record<string, THREE.BufferGeometry[]> = {};
        const materialMap: Record<string, THREE.Material> = {};

        for (const mesh of meshes) {
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            for (const material of materials) {
                const key = material.uuid || "default";
                if (!geometryGroups[key]) {
                    geometryGroups[key] = [];
                    materialMap[key] = material;
                }
                const geom = normalizeGeometry(
                    mesh.geometry.clone().applyMatrix4(mesh.matrixWorld)
                );
                if (geom) geometryGroups[key].push(geom);
            }
        }

        const compressedGroup = new THREE.Group();
        let totalTextureSize = 0;

        const keys = Object.keys(geometryGroups);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const geoms = geometryGroups[key].filter(Boolean);
            if (!geoms.length) continue;

            setCompressionStep(`Merging geometry ${i + 1} of ${keys.length}...`);
            await new Promise((r) => setTimeout(r, 20)); // let UI repaint

            let mergedGeometry = BufferGeometryUtils.mergeGeometries(geoms, false);

            if (!mergedGeometry) continue;

            mergedGeometry = mergeVertices(mergedGeometry, 1e-5);

            setCompressionStep(`Compressing textures for material ${i + 1}...`);
            let material = materialMap[key];
            material = await compressMaterialTextures(material);

            const mesh = new THREE.Mesh(mergedGeometry, material);
            compressedGroup.add(mesh);

            // sum texture sizes
            const mat = material as THREE.MeshStandardMaterial;
            const textureProps = [
                "map",
                "aoMap",
                "emissiveMap",
                "metalnessMap",
                "roughnessMap",
                "normalMap",
                "displacementMap",
                "alphaMap",
            ] as const;
            for (const prop of textureProps) {
                const tex = (mat as unknown as Record<string, THREE.Texture | undefined>)[prop];
                if (tex?.image) totalTextureSize += tex.image.width * tex.image.height;
            }
        }

        const originalVerts = meshes.reduce(
            (sum, m) => sum + m.geometry.attributes.position.count,
            0
        );
        const mergedVerts = compressedGroup.children.reduce(
            (sum, c) => sum + (c as THREE.Mesh).geometry.attributes.position.count,
            0
        );

        setStats({
            originalVerts,
            mergedVerts,
            originalGeom: meshes.length,
            mergedGeom: compressedGroup.children.length,
            textureSize: totalTextureSize,
            reduction: Math.round((1 - mergedVerts / originalVerts) * 100),
        });

        // Reposition group so its center is at 0,0,0
        compressedGroup.updateMatrixWorld(true);
        const bbox = new THREE.Box3().setFromObject(compressedGroup);
        const center = new THREE.Vector3();
        bbox.getCenter(center);

        // Center at origin
        compressedGroup.position.sub(center);

        // Optional: keep top of model at y=0
        const size = new THREE.Vector3();
        bbox.getSize(size);
        compressedGroup.position.y += size.y / 2;

        setCompressedScene(compressedGroup);
        setCompressionStep(null);
        requestAnimationFrame(() => setIsCompressing(false));
    };

    const clearScene = () => {
        setModelUrl(null);
        setCompressedScene(null);
        setStats(null);
    };

    return (
        <div
            className={`compressor-container ${dragOver ? "drag-over" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
            <Canvas className="viewer" onCreated={({ scene }) => (sceneRef.current = scene)}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 10]} intensity={1} />
                <Stage adjustCamera={true} intensity={0.5}>
                    <group position={[0, 0, 0]}>
                        {compressedScene ? (
                            <primitive object={compressedScene} />
                        ) : modelUrl ? (
                            <UploadedModel url={modelUrl} />
                        ) : null}
                    </group>
                </Stage>
                <OrbitControls />
            </Canvas>

            {/* Overlay before any file is loaded */}
            {!modelUrl && (
                <div className="overlay" onClick={openFileDialog}>
                    <p>
                        {dragOver
                            ? "Release to upload your .glb/.gltf file"
                            : "Click or drag & drop a .glb/.gltf file here"}
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".glb,.gltf"
                        style={{ display: "none" }}
                        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                    />
                </div>
            )}

            {/* Compress Button */}
            {modelUrl && !isCompressing && (
                <button className="btn compress-btn" onClick={handleCompress}>
                    Compress
                </button>
            )}

            {/* Clear Scene Button */}
            {modelUrl && (
                <button className="btn clear-btn" onClick={clearScene}>
                    Clear Scene
                </button>
            )}

            {modelUrl && <ReactComponentGenerator url={modelUrl} />}

            {/* Compressing Overlay */}
            {isCompressing && <div className="compressing-overlay">Compressing...</div>}

            {/* Stats Panel */}
            {stats && (
                <div className="stats-panel">
                    <h3>Compression Results</h3>
                    <p>Original Vertices: {stats.originalVerts.toLocaleString()}</p>
                    <p>Merged Vertices: {stats.mergedVerts.toLocaleString()}</p>
                    <p>Vertex Reduction: {stats.reduction}%</p>
                    <p>Original Geometries: {stats.originalGeom}</p>
                    <p>Merged Geometries: {stats.mergedGeom}</p>
                    <p>Total Texture Size: {stats.textureSize.toLocaleString()}px</p>
                </div>
            )}
            {isCompressing && (
                <div
                    className="compressing-overlay"
                    style={{ display: "flex", flexDirection: "column" }}
                >
                    <div>Compressing...</div>
                    {compressionStep && (
                        <p style={{ marginTop: 10, fontSize: "1rem" }}>{compressionStep}</p>
                    )}
                </div>
            )}
        </div>
    );
}

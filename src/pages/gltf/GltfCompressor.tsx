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
            className={`w-full h-screen relative bg-gradient-to-br from-slate-900 to-black overflow-hidden font-sans ${dragOver ? "opacity-90" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
            <Canvas className="w-full h-full block" onCreated={({ scene }) => (sceneRef.current = scene)}>
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
                <div className="absolute inset-0 flex-col flex-center z-10 bg-black/60 backdrop-blur-sm p-8 text-center cursor-pointer transition-colors hover:bg-black/70" onClick={openFileDialog}>
                    <div className="glass-panel p-12 flex-col flex-center gap-md border-dashed border-2 border-white/20">
                        <span className="text-6xl mb-4">📦</span>
                        <p className="text-xl font-bold text-gradient">
                            {dragOver
                                ? "Release to upload your .glb/.gltf file"
                                : "Click or drag & drop a .glb/.gltf file here"}
                        </p>
                        <p className="text-secondary">Supported formats: .glb, .gltf</p>
                    </div>
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
                <button className="btn-base btn-primary absolute top-4 right-4 z-20" onClick={handleCompress}>
                    Compress
                </button>
            )}

            {/* Clear Scene Button */}
            {modelUrl && (
                <button className="btn-base btn-secondary absolute top-4 right-36 z-20" onClick={clearScene}>
                    Clear Scene
                </button>
            )}

            {modelUrl && <ReactComponentGenerator url={modelUrl} />}

            {/* Compressing Overlay */}
            {isCompressing && (
                <div className="absolute inset-0 z-30 flex-col flex-center bg-black/80 backdrop-blur-sm text-white pointer-events-none">
                    <div className="spinner w-12 h-12 mb-4"></div>
                    <div className="text-2xl font-bold mb-2">Compressing...</div>
                    {compressionStep && (
                        <p className="text-secondary">{compressionStep}</p>
                    )}
                </div>
            )}

            {/* Stats Panel */}
            {stats && (
                <div className="glass-card absolute bottom-4 left-4 p-5 text-sm z-20 w-[300px] pointer-events-none">
                    <h3 className="text-lg font-bold mb-3 border-b border-white/10 pb-2">Compression Results</h3>
                    <div className="flex-col gap-1">
                        <div className="flex-row justify-between"><span className="text-secondary">Original Vertices:</span> <span>{stats.originalVerts.toLocaleString()}</span></div>
                        <div className="flex-row justify-between"><span className="text-secondary">Merged Vertices:</span> <span className="text-primary">{stats.mergedVerts.toLocaleString()}</span></div>
                        <div className="flex-row justify-between"><span className="text-secondary">Vertex Reduction:</span> <span className="text-success font-bold">{stats.reduction}%</span></div>
                        <div className="flex-row justify-between"><span className="text-secondary">Original Geometries:</span> <span>{stats.originalGeom}</span></div>
                        <div className="flex-row justify-between"><span className="text-secondary">Merged Geometries:</span> <span>{stats.mergedGeom}</span></div>
                        <div className="flex-row justify-between"><span className="text-secondary">Total Texture Size:</span> <span>{(stats.textureSize / (1024 * 1024)).toFixed(2)} MP</span></div>
                    </div>
                </div>
            )}
        </div>
    );
}

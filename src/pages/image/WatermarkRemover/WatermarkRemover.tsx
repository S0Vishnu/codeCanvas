import React, { useState, useRef, useCallback, useEffect } from "react";
import { FileInput } from "../../../components/inputs";
import { WatermarkEngine } from "./core/WatermarkEngine";

type ImageItem = {
    id: string;
    file: File;
    originalUrl: string;
    processedUrl?: string; // Blob URL of the processed image
    isProcessing: boolean;
    error?: string;
};

type ToastMessage = {
    id: string;
    message: string;
    type: "error" | "success" | "info";
};

const WatermarkRemover: React.FC = () => {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const dropRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Engine instance
    const engineRef = useRef<WatermarkEngine | null>(null);

    // Initialize engine
    useEffect(() => {
        WatermarkEngine.create().then(engine => {
            engineRef.current = engine;
        }).catch(err => {
            console.error("Failed to initialize Watermark Engine", err);
            addToast("Failed to initialize AI Engine. Please reload.", "error");
        });
    }, []);

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const addToast = (message: string, type: ToastMessage["type"] = "info") => {
        const id = generateId();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 5000);
    };

    const handleFiles = (files: File[]) => {
        const newImages = files.map(file => ({
            id: generateId(),
            file,
            originalUrl: URL.createObjectURL(file),
            isProcessing: false
        }));
        setImages(prev => [...prev, ...newImages]);
        addToast(`${newImages.length} images added.`, "success");
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
        if (files.length > 0) handleFiles(files);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        handleFiles(files);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeImage = (id: string) => {
        const img = images.find(i => i.id === id);
        if (img) {
            URL.revokeObjectURL(img.originalUrl);
            if (img.processedUrl) URL.revokeObjectURL(img.processedUrl);
        }
        setImages(prev => prev.filter(i => i.id !== id));
    };

    const processImage = async (image: ImageItem) => {
        if (!engineRef.current) {
            addToast("Engine not ready yet.", "error");
            return;
        }

        setImages(prev => prev.map(i => i.id === image.id ? { ...i, isProcessing: true, error: undefined } : i));

        try {
            // Load image onto an HTMLImageElement
            const imgEl = new Image();
            await new Promise<void>((resolve, reject) => {
                imgEl.onload = () => resolve();
                imgEl.onerror = reject;
                imgEl.src = image.originalUrl;
            });

            const processedCanvas = await engineRef.current.removeWatermarkFromImage(imgEl);

            processedCanvas.toBlob((blob) => {
                if (blob) {
                    const processedUrl = URL.createObjectURL(blob);
                    setImages(prev => prev.map(i => i.id === image.id ? { ...i, isProcessing: false, processedUrl } : i));
                    addToast(`Processed ${image.file.name}`, "success");
                } else {
                    throw new Error("Failed to generate blob");
                }
            }, "image/png");

        } catch (error) {
            console.error(error);
            setImages(prev => prev.map(i => i.id === image.id ? { ...i, isProcessing: false, error: "Processing failed" } : i));
            addToast(`Failed to process ${image.file.name}`, "error");
        }
    };

    const stripMetadata = async (image: ImageItem) => {
        setImages(prev => prev.map(i => i.id === image.id ? { ...i, isProcessing: true, error: undefined } : i));

        try {
            // Load image onto an HTMLImageElement
            const imgEl = new Image();
            await new Promise<void>((resolve, reject) => {
                imgEl.onload = () => resolve();
                imgEl.onerror = reject;
                imgEl.src = image.originalUrl;
            });

            // Create canvas and draw image to strip metadata
            const canvas = document.createElement("canvas");
            canvas.width = imgEl.width;
            canvas.height = imgEl.height;
            const ctx = canvas.getContext("2d");

            if (!ctx) throw new Error("Could not get 2d context");

            ctx.drawImage(imgEl, 0, 0);

            canvas.toBlob((blob) => {
                if (blob) {
                    const processedUrl = URL.createObjectURL(blob);
                    setImages(prev => prev.map(i => i.id === image.id ? { ...i, isProcessing: false, processedUrl } : i));
                    addToast(`Metadata removed from ${image.file.name}`, "success");
                } else {
                    throw new Error("Failed to generate blob");
                }
            }, "image/png");

        } catch (error) {
            console.error(error);
            setImages(prev => prev.map(i => i.id === image.id ? { ...i, isProcessing: false, error: "Metadata removal failed" } : i));
            addToast(`Failed to remove metadata from ${image.file.name}`, "error");
        }
    };

    const processAll = () => {
        images.filter(i => !i.processedUrl && !i.isProcessing).forEach(processImage);
    };

    const downloadImage = (image: ImageItem) => {
        if (!image.processedUrl) return;
        const link = document.createElement("a");
        link.href = image.processedUrl;
        link.download = `cleaned_${image.file.name.replace(/\.[^.]+$/, "")}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div
            ref={dropRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`page-container ${isDragging ? "dragging" : ""}`}
        >
            <div className="toast-container">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toast toast-${toast.type}`}>
                        {toast.message}
                    </div>
                ))}
            </div>

            <div className="flex-col gap-sm flex-center mb-8">
                <h1 className="text-title text-gradient">Gemini Watermark Remover</h1>
                <p className="text-subtitle">
                    Remove watermarks from images generated by Gemini AI.
                </p>
            </div>

            {/* Upload Section */}
            {images.length === 0 && (
                <div className="w-full h-full flex-center">
                    <div className="upload-zone w-full max-w-2xl">
                        <div className="upload-icon">✨</div>
                        <h3 className="text-xl font-bold mb-2">Upload Images</h3>
                        <p className="text-secondary mb-4">Drag & drop Gemini-generated images here</p>
                        <button
                            className="btn-base btn-primary"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Choose Files
                        </button>
                        <FileInput
                            ref={fileInputRef}
                            accept="image/*"
                            multiple
                            onChange={handleFileInput}
                            style={{ display: "none" }}
                        />
                    </div>
                </div>
            )}

            {images.length > 0 && (
                <div className="flex-col gap-lg">
                    {/* Toolbar */}
                    <div className="glass-panel p-4 flex-row justify-between items-center">
                        <div className="flex-row gap-md">
                            <button className="btn-base btn-primary" onClick={processAll}>
                                Process All
                            </button>
                            <button className="btn-base btn-secondary" onClick={() => fileInputRef.current?.click()}>
                                Add More
                            </button>
                            <FileInput
                                ref={fileInputRef}
                                accept="image/*"
                                multiple
                                onChange={handleFileInput}
                                style={{ display: "none" }}
                            />
                        </div>
                        <div className="text-secondary">
                            {images.filter(i => i.processedUrl).length} / {images.length} Processed
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid-images">
                        {images.map(image => (
                            <div key={image.id} className="image-card glass-card relative group">
                                <button
                                    className="btn-remove absolute top-2 right-2"
                                    onClick={() => removeImage(image.id)}
                                >
                                    ✕
                                </button>

                                <div className="aspect-square relative overflow-hidden rounded-md bg-black/20">
                                    <img
                                        src={image.processedUrl || image.originalUrl}
                                        alt={image.file.name}
                                        className="w-full h-full object-contain"
                                    />
                                    {image.isProcessing && (
                                        <div className="absolute inset-0 flex-center bg-black/50 backdrop-blur-sm">
                                            <div className="spinner"></div>
                                        </div>
                                    )}
                                    {image.processedUrl && (
                                        <div className="absolute bottom-2 right-2 bg-green-500/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-md">
                                            Cleaned
                                        </div>
                                    )}
                                </div>

                                <div className="mt-2 flex-col gap-xs">
                                    <p className="text-sm truncate" title={image.file.name}>{image.file.name}</p>

                                    {!image.processedUrl && !image.isProcessing && (
                                        <>
                                            <button
                                                className="btn-sm btn-secondary w-full"
                                                onClick={() => processImage(image)}
                                            >
                                                Remove Watermark
                                            </button>
                                            <button
                                                className="btn-sm btn-ghost w-full"
                                                onClick={() => stripMetadata(image)}
                                            >
                                                Strip Metadata Only
                                            </button>
                                        </>
                                    )}

                                    {image.processedUrl && (
                                        <button
                                            className="btn-sm btn-success w-full"
                                            onClick={() => downloadImage(image)}
                                        >
                                            Download
                                        </button>
                                    )}

                                    {image.error && <p className="text-xs text-red-400">{image.error}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WatermarkRemover;

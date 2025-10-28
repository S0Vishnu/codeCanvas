import React, { useState, useRef, useCallback, useEffect } from "react";
import imageCompression from "browser-image-compression";
import JSZip from "jszip";
import "../../styles/ImageCompressor.css";

type ImageItem = {
    id: string;
    file: File;
    originalUrl: string;
    originalSize: number;
    originalDimensions: { width: number; height: number };
    compressedFile?: File;
    compressedUrl?: string;
    compressedSize?: number;
    compressedDimensions?: { width: number; height: number };
    isCompressing: boolean;
    error?: string;
};

type ToastMessage = {
    id: string;
    message: string;
    type: "error" | "success" | "info";
};

type DimensionPreset = {
    label: string;
    width: number;
    height: number;
    type: "preset" | "multiplier";
};

const ImageCompressor: React.FC = () => {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [previewOriginalId, setPreviewOriginalId] = useState<string | null>(null);

    // Global compression settings
    const [globalQuality, setGlobalQuality] = useState(0.8);
    const [globalMaxDimension, setGlobalMaxDimension] = useState(1024);
    const [useDimensionPreset, setUseDimensionPreset] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState<string>("original");
    const [settingsChanged, setSettingsChanged] = useState(false);
    const [downloadFormat, setDownloadFormat] = useState<"jpeg" | "png" | "webp">("jpeg");

    const dropRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Constants - Removed limitations
    const SUPPORTED_TYPES = [".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif", ".tiff", ".avif"];

    // Dimension presets
    const dimensionPresets: DimensionPreset[] = [
        { label: "Original Size", width: 0, height: 0, type: "preset" },
        { label: "Instagram Post (1080x1080)", width: 1080, height: 1080, type: "preset" },
        { label: "Instagram Story (1080x1920)", width: 1080, height: 1920, type: "preset" },
        { label: "Facebook Post (1200x630)", width: 1200, height: 630, type: "preset" },
        { label: "Twitter Post (1200x675)", width: 1200, height: 675, type: "preset" },
        { label: "Pinterest Pin (1000x1500)", width: 1000, height: 1500, type: "preset" },
        { label: "LinkedIn Post (1200x627)", width: 1200, height: 627, type: "preset" },
        { label: "HD (1280x720)", width: 1280, height: 720, type: "preset" },
        { label: "Full HD (1920x1080)", width: 1920, height: 1080, type: "preset" },
        { label: "4K (3840x2160)", width: 3840, height: 2160, type: "preset" },
        { label: "Square (1000x1000)", width: 1000, height: 1000, type: "preset" },
        { label: "Portrait (1080x1350)", width: 1080, height: 1350, type: "preset" },
        { label: "Landscape (1920x1080)", width: 1920, height: 1080, type: "preset" },
        { label: "2x Multiplier", width: 2, height: 2, type: "multiplier" },
        { label: "4x Multiplier", width: 4, height: 4, type: "multiplier" },
    ];

    // Generate unique ID
    const generateId = () => Math.random().toString(36).substr(2, 9);

    // Toast management
    const addToast = (message: string, type: ToastMessage["type"] = "info") => {
        const id = generateId();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 5000);
    };

    // Get image dimensions
    const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(img.src); // Clean up
                resolve({ width: img.naturalWidth, height: img.naturalHeight });
            };
            img.onerror = () => {
                URL.revokeObjectURL(img.src); // Clean up
                reject(new Error("Failed to load image for dimension check"));
            };
            img.src = URL.createObjectURL(file);
        });
    };

    // Calculate dimensions based on preset and original dimensions
    const calculateTargetDimensions = (originalWidth: number, originalHeight: number) => {
        if (!useDimensionPreset || selectedPreset === "original") {
            return {
                width: globalMaxDimension,
                height: globalMaxDimension,
                mode: "maxDimension" as const,
            };
        }

        const preset = dimensionPresets.find((p) => p.label === selectedPreset);
        if (!preset) {
            return {
                width: globalMaxDimension,
                height: globalMaxDimension,
                mode: "maxDimension" as const,
            };
        }

        if (preset.type === "multiplier") {
            const newWidth = Math.min(originalWidth * preset.width, 10000); // Limit to reasonable size
            const newHeight = Math.min(originalHeight * preset.height, 10000);
            return { width: newWidth, height: newHeight, mode: "multiplier" as const };
        }

        // For preset dimensions, maintain aspect ratio and don't upscale
        const aspectRatio = originalWidth / originalHeight;
        const presetAspectRatio = preset.width / preset.height;

        let targetWidth = preset.width;
        let targetHeight = preset.height;

        // Don't upscale - use preset only if it's smaller than original
        if (preset.width > originalWidth || preset.height > originalHeight) {
            // Fit within original dimensions while maintaining preset aspect ratio
            if (presetAspectRatio > aspectRatio) {
                targetHeight = Math.min(preset.height, originalHeight);
                targetWidth = targetHeight * presetAspectRatio;
            } else {
                targetWidth = Math.min(preset.width, originalWidth);
                targetHeight = targetWidth / presetAspectRatio;
            }
        }

        return {
            width: Math.round(targetWidth),
            height: Math.round(targetHeight),
            mode: "preset" as const,
        };
    };

    // Validate file - Removed size restrictions
    const validateFile = (file: File): boolean => {
        const extension = "." + file.name.split(".").pop()?.toLowerCase();
        if (!SUPPORTED_TYPES.includes(extension)) {
            addToast(
                `Unsupported file type: ${file.name}. Supported: ${SUPPORTED_TYPES.join(", ")}`,
                "error"
            );
            return false;
        }

        // Optional: Add warning for very large files
        if (file.size > 100 * 1024 * 1024) {
            // 100MB warning
            addToast(
                `Large file detected: ${file.name} (${(file.size / (1024 * 1024)).toFixed(
                    1
                )}MB). Compression may take longer.`,
                "info"
            );
        }

        return true;
    };

    // Handle file uploads - Removed count and size limits
    const handleFiles = async (files: File[]) => {
        const validFiles = files.filter(validateFile);

        if (validFiles.length === 0) return;

        try {
            const newImages = await Promise.all(
                validFiles.map(async (file) => {
                    try {
                        const dimensions = await getImageDimensions(file);
                        return {
                            id: generateId(),
                            file,
                            originalUrl: URL.createObjectURL(file),
                            originalSize: file.size,
                            originalDimensions: dimensions,
                            isCompressing: false,
                        };
                    } catch (error) {
                        console.error(`Failed to process ${file.name}:`, error);
                        addToast(`Failed to process ${file.name}. File may be corrupted.`, "error");
                        return null;
                    }
                })
            );

            const successfulImages = newImages.filter((img): img is ImageItem => img !== null);

            if (successfulImages.length > 0) {
                setImages((prev) => [...prev, ...successfulImages]);
                addToast(`${successfulImages.length} image(s) uploaded successfully`, "success");
            }
        } catch (error) {
            console.error("Error processing files:", error);
            addToast("Some files couldn't be processed. Please try again.", "error");
        }
    };

    // Drag and drop handlers
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

    // Compress all images with better error handling for large files
    const compressAll = async () => {
        const uncompressedImages = images.filter((img) => !img.compressedFile || settingsChanged);

        if (uncompressedImages.length === 0) {
            addToast("No images to compress", "info");
            return;
        }

        // Show warning for large batches
        if (uncompressedImages.length > 10) {
            addToast(
                `Compressing ${uncompressedImages.length} images. This may take a while for large files.`,
                "info"
            );
        }

        for (const image of uncompressedImages) {
            if (image.isCompressing) continue;

            setImages((prev) =>
                prev.map((img) =>
                    img.id === image.id ? { ...img, isCompressing: true, error: undefined } : img
                )
            );

            try {
                // Determine file type and compression options
                const fileExtension = image.file.name.split(".").pop()?.toLowerCase();
                const isPNG = fileExtension === "png";
                const isWebP = fileExtension === "webp";
                const isTransparent = isPNG || isWebP;

                // Calculate target dimensions
                const targetDimensions = calculateTargetDimensions(
                    image.originalDimensions.width,
                    image.originalDimensions.height
                );

                // Adaptive compression based on file size
                const originalSizeMB = image.originalSize / (1024 * 1024);
                const maxSizeMB = Math.max(0.1, originalSizeMB * 0.5); // More aggressive compression for larger files

                const options: any = {
                    maxSizeMB: maxSizeMB,
                    useWebWorker: true,
                    // Preserve transparency for PNG and WebP
                    ...(isTransparent
                        ? {
                              fileType: isPNG ? "image/png" : "image/webp",
                              initialQuality: 0.9, // Slight compression for transparent images
                          }
                        : {
                              fileType: "image/jpeg",
                              initialQuality: globalQuality,
                          }),
                };

                // Set dimensions based on mode
                if (useDimensionPreset && selectedPreset !== "original") {
                    if (targetDimensions.mode === "multiplier") {
                        // For multipliers, set exact dimensions
                        options.maxWidthOrHeight = Math.max(
                            targetDimensions.width,
                            targetDimensions.height
                        );
                    } else {
                        // For presets, set exact dimensions
                        options.maxWidthOrHeight = Math.max(
                            targetDimensions.width,
                            targetDimensions.height
                        );
                    }
                } else {
                    // Use max dimension setting
                    options.maxWidthOrHeight = globalMaxDimension;
                }

                const compressed = await imageCompression(image.file, options);

                // Get compressed image dimensions
                const compressedDimensions = await getImageDimensions(compressed);

                setImages((prev) =>
                    prev.map((img) =>
                        img.id === image.id
                            ? {
                                  ...img,
                                  compressedFile: compressed,
                                  compressedUrl: URL.createObjectURL(compressed),
                                  compressedSize: compressed.size,
                                  compressedDimensions: compressedDimensions,
                                  isCompressing: false,
                              }
                            : img
                    )
                );

                const savedPercent = (
                    ((image.originalSize - compressed.size) / image.originalSize) *
                    100
                ).toFixed(1);
                const dimensionInfo =
                    useDimensionPreset && selectedPreset !== "original"
                        ? ` → ${compressedDimensions.width}×${compressedDimensions.height}`
                        : "";
                addToast(
                    `Compressed: ${image.file.name} (saved ${savedPercent}%)${dimensionInfo}`,
                    "success"
                );
            } catch (error) {
                console.error(`Compression failed for ${image.file.name}:`, error);
                setImages((prev) =>
                    prev.map((img) =>
                        img.id === image.id
                            ? {
                                  ...img,
                                  isCompressing: false,
                                  error:
                                      error instanceof Error ? error.message : "Compression failed",
                              }
                            : img
                    )
                );
                addToast(`Compression failed for: ${image.file.name}`, "error");
            }
        }

        setSettingsChanged(false);
    };

    // Handle global settings change
    const handleQualityChange = (quality: number) => {
        setGlobalQuality(quality);
        setSettingsChanged(true);
    };

    const handleMaxDimensionChange = (maxDimension: number) => {
        setGlobalMaxDimension(maxDimension);
        setSettingsChanged(true);
    };

    const handlePresetChange = (presetLabel: string) => {
        setSelectedPreset(presetLabel);
        setSettingsChanged(true);
    };

    const handleUsePresetToggle = (usePreset: boolean) => {
        setUseDimensionPreset(usePreset);
        setSettingsChanged(true);
    };

    // Remove image with proper cleanup
    const removeImage = (imageId: string) => {
        const image = images.find((img) => img.id === imageId);
        if (image) {
            URL.revokeObjectURL(image.originalUrl);
            if (image.compressedUrl) {
                URL.revokeObjectURL(image.compressedUrl);
            }
        }
        setImages((prev) => prev.filter((img) => img.id !== imageId));
        addToast("Image removed", "info");
    };

    // Download all as ZIP with chunking for large files
    const downloadZip = async () => {
        const compressedImages = images.filter((img) => img.compressedFile);
        if (compressedImages.length === 0) {
            addToast("No compressed images to download", "error");
            return;
        }

        // Show warning for large ZIP files
        const totalSize = compressedImages.reduce((acc, img) => acc + (img.compressedSize || 0), 0);
        if (totalSize > 100 * 1024 * 1024) {
            addToast("Creating large ZIP file. This may take a moment...", "info");
        }

        try {
            const zip = new JSZip();

            // Add files to ZIP
            // #region filename
            compressedImages.forEach((img) => {
                if (img.compressedFile) {
                    const name = img.file.name.replace(/\.[^/.]+$/, "");
                    const extension = downloadFormat;
                    // const dimensionInfo = img.compressedDimensions
                    //     ? `_${img.compressedDimensions.width}x${img.compressedDimensions.height}`
                    //     : "";
                    zip.file(
                        `${name}.${extension}`,
                        img.compressedFile,
                        {
                            binary: true,
                        }
                    );
                }
            });

            // Generate ZIP with progress for large files
            const blob = await zip.generateAsync({
                type: "blob",
                compression: "DEFLATE",
                compressionOptions: { level: 6 },
            });

            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "compressed-images.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up URL
            setTimeout(() => URL.revokeObjectURL(link.href), 100);

            addToast(
                `ZIP download started (${(blob.size / (1024 * 1024)).toFixed(1)}MB)`,
                "success"
            );
        } catch (error) {
            console.error("ZIP creation failed:", error);
            addToast("Failed to create ZIP file. The files might be too large.", "error");
        }
    };

    // Clear all images
    const clearAll = () => {
        images.forEach((img) => {
            URL.revokeObjectURL(img.originalUrl);
            if (img.compressedUrl) {
                URL.revokeObjectURL(img.compressedUrl);
            }
        });
        setImages([]);
        setSettingsChanged(false);
        addToast("All images cleared", "info");
    };

    // Preview toggle handlers
    const handlePreviewStart = (imageId: string) => {
        setPreviewOriginalId(imageId);
    };

    const handlePreviewEnd = () => {
        setPreviewOriginalId(null);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            images.forEach((img) => {
                URL.revokeObjectURL(img.originalUrl);
                if (img.compressedUrl) {
                    URL.revokeObjectURL(img.compressedUrl);
                }
            });
        };
    }, []);

    // Format file size
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    // Calculate compression ratio
    const getCompressionRatio = (original: number, compressed: number) => {
        return (((original - compressed) / original) * 100).toFixed(1);
    };

    // Get compression stats
    const getCompressionStats = () => {
        const original = images.reduce((acc, img) => acc + img.originalSize, 0);
        const compressed = images.reduce((acc, img) => acc + (img.compressedSize || 0), 0);
        const saved = original - compressed;
        return {
            original: formatFileSize(original),
            compressed: formatFileSize(compressed),
            saved: formatFileSize(saved),
            savedPercent: original > 0 ? ((saved / original) * 100).toFixed(1) : "0",
            totalImages: images.length,
            compressedImages: images.filter((img) => img.compressedFile).length,
        };
    };

    const stats = getCompressionStats();

    // Get current dimension info for display
    const getCurrentDimensionInfo = () => {
        if (!useDimensionPreset || selectedPreset === "original") {
            return `Max dimension: ${globalMaxDimension}px`;
        }

        const preset = dimensionPresets.find((p) => p.label === selectedPreset);
        if (!preset) return `Max dimension: ${globalMaxDimension}px`;

        if (preset.type === "multiplier") {
            return `${preset.label} (up to ${preset.width}x scale)`;
        }

        return `${preset.label} (${preset.width}×${preset.height})`;
    };

    return (
        <div
            ref={dropRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`image-compressor-container ${isDragging ? "dragging" : ""}`}
        >
            {/* Toast Messages */}
            <div className="toast-container">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toast toast-${toast.type}`}>
                        {toast.message}
                    </div>
                ))}
            </div>

            <div className="page-header">
                <h1 className="title">Multi Image Compressor</h1>
                <p className="subtitle">
                    Compress multiple images with custom quality and size settings
                </p>
            </div>

            {/* Upload Section */}
            {images.length === 0 && (
                <div className="upload-section">
                    <div className="upload-area">
                        <div className="upload-icon">📁</div>
                        <h3>Upload Images</h3>
                        <p>Drag & drop images here or click to browse</p>
                        <p className="upload-info">
                            Supported: {SUPPORTED_TYPES.join(", ")} • No file size limits
                        </p>
                        <button
                            className="btn upload"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Choose Files
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileInput}
                            style={{ display: "none" }}
                        />
                    </div>
                </div>
            )}

            {/* Main Content */}
            {images.length > 0 && (
                <div className="main-content">
                    {/* Control Panel */}
                    <div className="control-panel">
                        <div className="panel-header">
                            <h2>Compression Settings</h2>
                            <div className="header-actions">
                                <button
                                    className="btn zip"
                                    onClick={downloadZip}
                                    disabled={!images.some((img) => img.compressedFile)}
                                >
                                    Download All
                                </button>
                                <button className="btn clear" onClick={clearAll}>
                                    Clear All
                                </button>
                            </div>
                        </div>

                        <div className="settings-section">
                            <div className="sliders-container">
                                <div className="setting-group">
                                    <label>
                                        Quality: {globalQuality * 100}%
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="1"
                                            step="0.05"
                                            className="custom-range"
                                            value={globalQuality}
                                            onChange={(e) =>
                                                handleQualityChange(parseFloat(e.target.value))
                                            }
                                        />
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label>
                                        Max Dimension: {globalMaxDimension}px
                                        <input
                                            type="range"
                                            min="100"
                                            max="4000"
                                            step="100"
                                            className="custom-range"
                                            value={globalMaxDimension}
                                            onChange={(e) =>
                                                handleMaxDimensionChange(parseInt(e.target.value))
                                            }
                                        />
                                    </label>
                                </div>

                                <div className="setting-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={useDimensionPreset}
                                            onChange={(e) =>
                                                handleUsePresetToggle(e.target.checked)
                                            }
                                        />
                                        Use Dimension Preset
                                    </label>
                                </div>

                                {useDimensionPreset && (
                                    <div className="setting-group">
                                        <label>
                                            Dimension Preset:
                                            <select
                                                value={selectedPreset}
                                                onChange={(e) => handlePresetChange(e.target.value)}
                                                className="format-select"
                                            >
                                                {dimensionPresets.map((preset) => (
                                                    <option key={preset.label} value={preset.label}>
                                                        {preset.label}{" "}
                                                        {preset.type === "preset" &&
                                                        preset.width > 0
                                                            ? `(${preset.width}×${preset.height})`
                                                            : ""}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        <div className="preset-info">
                                            <small>{getCurrentDimensionInfo()}</small>
                                        </div>
                                    </div>
                                )}

                                <div className="setting-group">
                                    <label>
                                        Download Format:
                                        <select
                                            value={downloadFormat}
                                            onChange={(e) =>
                                                setDownloadFormat(
                                                    e.target.value as "jpeg" | "png" | "webp"
                                                )
                                            }
                                            className="format-select"
                                        >
                                            <option value="jpeg">JPEG</option>
                                            <option value="png">
                                                PNG (Preserves Transparency)
                                            </option>
                                            <option value="webp">
                                                WebP (Preserves Transparency)
                                            </option>
                                        </select>
                                    </label>
                                </div>
                            </div>

                            {/* Compression Results */}
                            {images.some((img) => img.compressedFile) ? (
                                <div className="results-panel">
                                    <h3>Compression Results</h3>
                                    <div className="results-stats">
                                        <div className="result-item">
                                            <span className="result-label">Original:</span>
                                            <span className="result-value">{stats.original}</span>
                                        </div>
                                        <div className="result-item">
                                            <span className="result-label">Compressed:</span>
                                            <span className="result-value">{stats.compressed}</span>
                                        </div>
                                        <div className="result-item">
                                            <span className="result-label">Saved:</span>
                                            <span className="result-value success">
                                                {stats.saved} ({stats.savedPercent}%)
                                            </span>
                                        </div>
                                        <div className="result-item">
                                            <span className="result-label">Processed:</span>
                                            <span className="result-value">
                                                {stats.compressedImages}/{stats.totalImages} images
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="results-panel skeleton">
                                    <h3>Compression Results</h3>
                                    <div className="results-stats">
                                        <div className="result-item">
                                            <span className="result-label">Original:</span>
                                            <span className="result-value skeleton-text"></span>
                                        </div>
                                        <div className="result-item">
                                            <span className="result-label">Compressed:</span>
                                            <span className="result-value skeleton-text"></span>
                                        </div>
                                        <div className="result-item">
                                            <span className="result-label">Saved:</span>
                                            <span className="result-value skeleton-text"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="action-buttons">
                            <button
                                className="btn compress"
                                onClick={compressAll}
                                disabled={
                                    images.every((img) => img.compressedFile && !settingsChanged) ||
                                    images.some((img) => img.isCompressing)
                                }
                            >
                                {images.some((img) => img.isCompressing)
                                    ? "Compressing..."
                                    : "Compress All"}
                            </button>
                            <button
                                className="btn upload"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Add More Images
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileInput}
                                style={{ display: "none" }}
                            />
                        </div>

                        {settingsChanged && (
                            <div className="settings-notice">
                                ⚠️ Settings changed. Re-compress images to apply new settings.
                            </div>
                        )}
                    </div>

                    {/* Images Grid */}
                    <div className="images-section">
                        <h3>Images ({images.length})</h3>
                        <div className="image-grid">
                            {images.map((img) => (
                                <div key={img.id} className="image-card">
                                    <div className="image-header">
                                        <h4 title={img.file.name}>{img.file.name}</h4>
                                        <button
                                            className="btn-remove"
                                            onClick={() => removeImage(img.id)}
                                            title="Remove image"
                                        >
                                            <svg
                                                width="14"
                                                height="14"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M18 6L6 18M6 6L18 18"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="image-preview">
                                        <img
                                            src={
                                                previewOriginalId === img.id
                                                    ? img.originalUrl
                                                    : img.compressedUrl || img.originalUrl
                                            }
                                            alt={img.file.name}
                                            onPointerDown={() =>
                                                img.compressedFile && handlePreviewStart(img.id)
                                            }
                                            onPointerUp={handlePreviewEnd}
                                            onPointerLeave={handlePreviewEnd}
                                        />
                                        {img.compressedFile && (
                                            <div className="preview-toggle">
                                                <span>Hold to view original</span>
                                            </div>
                                        )}
                                        {img.isCompressing && (
                                            <div className="compressing-overlay">
                                                <div className="spinner"></div>
                                                <span>Compressing...</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="image-info">
                                        <div className="info-row">
                                            <span>Original:</span>
                                            <span>{formatFileSize(img.originalSize)}</span>
                                        </div>
                                        <div className="info-row">
                                            <span>Resolution:</span>
                                            <span>
                                                {img.originalDimensions.width} ×{" "}
                                                {img.originalDimensions.height}
                                            </span>
                                        </div>
                                        {img.compressedFile && img.compressedDimensions && (
                                            <>
                                                <div className="info-row">
                                                    <span>Compressed:</span>
                                                    <span>
                                                        {formatFileSize(img.compressedSize!)}
                                                    </span>
                                                </div>
                                                <div className="info-row">
                                                    <span>New Resolution:</span>
                                                    <span>
                                                        {img.compressedDimensions.width} ×{" "}
                                                        {img.compressedDimensions.height}
                                                    </span>
                                                </div>
                                                <div className="info-row">
                                                    <span>Saved:</span>
                                                    <span className="success">
                                                        {getCompressionRatio(
                                                            img.originalSize,
                                                            img.compressedSize!
                                                        )}
                                                        %
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {img.error && <div className="error-message">{img.error}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageCompressor;

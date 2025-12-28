import React, { useState, useRef, useCallback } from "react";
import Dropdown from "../components/Dropdown";


interface Resolution {
    width: number;
    height: number;
    label: string;
}

interface CompressionSettings {
    resolution: string;
    format: string;
    exportType: "video" | "audio" | "both" | "separate";
    quality: number;
}

interface VideoCompressorProps {
    className?: string;
    style?: React.CSSProperties;
}

const VideoCompressor: React.FC<VideoCompressorProps> = ({
    className = "",
    style,
}) => {
    // Default resolutions
    const defaultResolutions: Resolution[] = [
        { width: 3840, height: 2160, label: "4K (3840x2160)" },
        { width: 2560, height: 1440, label: "1440p (2560x1440)" },
        { width: 1920, height: 1080, label: "1080p (1920x1080)" },
        { width: 1280, height: 720, label: "720p (1280x720)" },
        { width: 854, height: 480, label: "480p (854x480)" },
        { width: 640, height: 360, label: "360p (640x360)" },
        { width: 426, height: 240, label: "240p (426x240)" },
    ];

    // Available formats
    const videoFormats = [
        { value: "mp4", label: "MP4" },
        { value: "mov", label: "MOV" },
        { value: "webm", label: "WebM" },
        { value: "avi", label: "AVI" },
    ];

    const audioFormats = [
        { value: "mp3", label: "MP3" },
        { value: "wav", label: "WAV" },
        { value: "aac", label: "AAC" },
        { value: "ogg", label: "OGG" },
    ];

    const exportTypes = [
        { value: "video", label: "Video Only" },
        { value: "audio", label: "Audio Only" },
        { value: "both", label: "Both (Combined)" },
        { value: "separate", label: "Both (Separate Files)" },
    ];

    // State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [compressionSettings, setCompressionSettings] =
        useState<CompressionSettings>({
            resolution: "1920x1080",
            format: "mp4",
            exportType: "video",
            quality: 80,
        });
    const [isCompressing, setIsCompressing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [compressedUrl, setCompressedUrl] = useState<string>("");
    const [compressedFileName, setCompressedFileName] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle file selection
    const handleFileSelect = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file && file.type.startsWith("video/")) {
                setSelectedFile(file);
                setPreviewUrl(URL.createObjectURL(file));
                // Reset compressed file state
                setCompressedUrl("");
                setCompressedFileName("");
                // Set default resolution based on file type
                setCompressionSettings((prev) => ({
                    ...prev,
                    format: file.type.includes("mp4")
                        ? "mp4"
                        : file.type.includes("quicktime")
                            ? "mov"
                            : file.type.includes("webm")
                                ? "webm"
                                : "mp4",
                }));
            }
        },
        []
    );

    // Handle compression settings change
    const handleSettingsChange = useCallback(
        (key: keyof CompressionSettings, value: string | number) => {
            setCompressionSettings((prev) => ({
                ...prev,
                [key]: value,
            }));
        },
        []
    );

    // Get available formats based on export type
    const getAvailableFormats = useCallback(() => {
        if (compressionSettings.exportType === "audio") {
            return audioFormats;
        } else if (
            compressionSettings.exportType === "video" ||
            compressionSettings.exportType === "both"
        ) {
            return videoFormats;
        } else {
            // For separate export, we need both video and audio formats
            return [...videoFormats, ...audioFormats];
        }
    }, [compressionSettings.exportType]);

    // Generate file name for compressed file
    const generateFileName = useCallback(() => {
        if (!selectedFile) return "";
        const originalName = selectedFile.name
            .split(".")
            .slice(0, -1)
            .join(".");
        const resolution = compressionSettings.resolution.split("x")[1];
        const format = compressionSettings.format;
        return `${originalName}_${resolution}p.${format}`;
    }, [
        selectedFile,
        compressionSettings.resolution,
        compressionSettings.format,
    ]);

    // Simulate compression process
    const handleCompress = useCallback(async () => {
        if (!selectedFile) return;

        setIsCompressing(true);
        setProgress(0);
        setCompressedUrl("");

        // Simulate compression progress
        for (let i = 0; i <= 100; i += 10) {
            await new Promise((resolve) => setTimeout(resolve, 300));
            setProgress(i);
        }

        // In a real implementation, you would use FFmpeg.js or similar here
        console.log("Compression settings:", compressionSettings);

        // Simulate compressed file creation
        const fileName = generateFileName();
        setCompressedFileName(fileName);

        // Create a mock blob URL for demonstration
        const mockBlob = new Blob([selectedFile], { type: selectedFile.type });
        const mockUrl = URL.createObjectURL(mockBlob);
        setCompressedUrl(mockUrl);

        setIsCompressing(false);
    }, [selectedFile, compressionSettings, generateFileName]);

    // Handle download
    const handleDownload = useCallback(() => {
        if (!compressedUrl) return;

        const link = document.createElement("a");
        link.href = compressedUrl;
        link.download = compressedFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [compressedUrl, compressedFileName]);

    // Format file size
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <div
            className={`page-container ${className}`}
            style={style}
        >
            <div className="flex-col gap-sm flex-center mb-8">
                <h2 className="text-title text-gradient">Video Compressor</h2>
                <p className="text-subtitle">
                    Compress and convert your videos to different formats and
                    resolutions
                </p>
            </div>

            {/* File Upload Section */}
            <div className="w-full mb-8">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="video-upload"
                />
                <label
                    htmlFor="video-upload"
                    className="upload-zone w-full"
                >
                    <div className="flex-col flex-center gap-md">
                        <svg
                            className="upload-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                        <span className="text-xl font-semibold text-white">
                            {selectedFile
                                ? selectedFile.name
                                : "Choose Video File"}
                        </span>
                        {selectedFile && (
                            <span className="text-sm text-secondary bg-slate-800 px-4 py-2 rounded-lg">
                                {formatFileSize(selectedFile.size)}
                            </span>
                        )}
                    </div>
                </label>
            </div>

            {selectedFile && (
                <div className="video-compressor-content">
                    {/* Preview Section */}
                    <div className="flex-col gap-md mb-8">
                        <h3 className="text-lg font-semibold text-secondary">
                            Preview
                        </h3>
                        <div className="aspect-video bg-black/40 rounded-lg overflow-hidden border border-white/10 flex-center">
                            <video
                                src={previewUrl}
                                controls
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>

                    {/* Compression Settings */}
                    <div className="glass-panel p-6">
                        <h3 className="text-title" style={{ fontSize: '1.5rem' }}>
                            Compression Settings
                        </h3>


                        <div className="grid-2 mb-8">
                            {/* Resolution Dropdown */}
                            <div className="flex-col gap-sm">
                                <label className="label-text">
                                    Resolution
                                </label>
                                <Dropdown
                                    options={defaultResolutions.map((res) => ({
                                        value: `${res.width}x${res.height}`,
                                        label: res.label,
                                    }))}
                                    value={compressionSettings.resolution}
                                    onChange={(value) =>
                                        handleSettingsChange(
                                            "resolution",
                                            value
                                        )
                                    }
                                    placeholder="Select resolution"
                                />
                            </div>

                            {/* Export Type Dropdown */}
                            <div className="flex-col gap-sm">
                                <label className="label-text">
                                    Export Type
                                </label>
                                <Dropdown
                                    options={exportTypes}
                                    value={compressionSettings.exportType}
                                    onChange={(value) =>
                                        handleSettingsChange(
                                            "exportType",
                                            value
                                        )
                                    }
                                />
                            </div>

                            {/* Format Dropdown */}
                            <div className="flex-col gap-sm">
                                <label className="label-text">
                                    Format
                                </label>
                                <Dropdown
                                    options={getAvailableFormats()}
                                    value={compressionSettings.format}
                                    onChange={(value) =>
                                        handleSettingsChange("format", value)
                                    }
                                />
                            </div>

                            {/* Quality Slider */}
                            <div className="flex-col gap-sm">
                                <label className="label-text flex-row" style={{ justifyContent: 'space-between' }}>
                                    Quality
                                    <span className="text-primary">{compressionSettings.quality}%</span>
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={compressionSettings.quality}
                                    onChange={(e) =>
                                        handleSettingsChange(
                                            "quality",
                                            parseInt(e.target.value)
                                        )
                                    }
                                    className="w-full"
                                />
                                <div className="flex-row" style={{ justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                    <span>Smaller File</span>
                                    <span>Better Quality</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex-col gap-md">
                            <div className="flex-row gap-md">
                                <button
                                    onClick={handleCompress}
                                    disabled={isCompressing}
                                    className={`btn-base btn-primary w-full ${isCompressing
                                        ? "opacity-75 cursor-wait"
                                        : ""
                                        }`}
                                >
                                    {isCompressing ? (
                                        <>
                                            <div className="spinner"></div>
                                            Compressing... {progress}%
                                        </>
                                    ) : (
                                        "Compress Video"
                                    )}
                                </button>

                                {compressedUrl && (
                                    <button
                                        onClick={handleDownload}
                                        className="btn-base btn-success w-full"
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                        Download
                                    </button>
                                )}
                            </div>

                            {/* Progress Bar */}
                            {isCompressing && (
                                <div className="progress-container">
                                    <div
                                        className="progress-bar"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            )}

                            {/* Download Info */}
                            {compressedUrl && (
                                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex flex-col gap-1">
                                    <span className="text-sm font-semibold text-green-400">
                                        {compressedFileName}
                                    </span>
                                    <span className="text-xs text-green-400/80">
                                        Ready for download
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoCompressor;

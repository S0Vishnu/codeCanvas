import React, { useState, useRef, useCallback } from "react";
import Dropdown from "../components/Dropdown";
import "../styles/VideoCompressor.css";

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
            className={`video-compressor-container ${className}`}
            style={style}
        >
            <div className="video-compressor-header">
                <h2 className="video-compressor-title">Video Compressor</h2>
                <p className="video-compressor-subtitle">
                    Compress and convert your videos to different formats and
                    resolutions
                </p>
            </div>

            {/* File Upload Section */}
            <div className="video-compressor-upload-section">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="video-compressor-file-input"
                    id="video-upload"
                />
                <label
                    htmlFor="video-upload"
                    className="video-compressor-upload-label"
                >
                    <div className="video-compressor-upload-content">
                        <svg
                            className="video-compressor-upload-icon"
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
                        <span className="video-compressor-upload-text">
                            {selectedFile
                                ? selectedFile.name
                                : "Choose Video File"}
                        </span>
                        {selectedFile && (
                            <span className="video-compressor-file-size">
                                {formatFileSize(selectedFile.size)}
                            </span>
                        )}
                    </div>
                </label>
            </div>

            {selectedFile && (
                <div className="video-compressor-content">
                    {/* Preview Section */}
                    <div className="video-compressor-preview-section">
                        <h3 className="video-compressor-section-title">
                            Preview
                        </h3>
                        <div className="video-compressor-preview-container">
                            <video
                                src={previewUrl}
                                controls
                                className="video-compressor-preview"
                            />
                        </div>
                    </div>

                    {/* Compression Settings */}
                    <div className="video-compressor-settings-section">
                        <h3 className="video-compressor-section-title">
                            Compression Settings
                        </h3>

                        <div className="video-compressor-settings-grid">
                            {/* Resolution Dropdown */}
                            <div className="video-compressor-setting-group">
                                <label className="video-compressor-setting-label">
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
                                    className="video-compressor-dropdown"
                                    dropdownClassName="video-compressor-dropdown-menu"
                                    optionClassName="video-compressor-dropdown-option"
                                />
                            </div>

                            {/* Export Type Dropdown */}
                            <div className="video-compressor-setting-group">
                                <label className="video-compressor-setting-label">
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
                                    className="video-compressor-dropdown"
                                    dropdownClassName="video-compressor-dropdown-menu"
                                    optionClassName="video-compressor-dropdown-option"
                                />
                            </div>

                            {/* Format Dropdown */}
                            <div className="video-compressor-setting-group">
                                <label className="video-compressor-setting-label">
                                    Format
                                </label>
                                <Dropdown
                                    options={getAvailableFormats()}
                                    value={compressionSettings.format}
                                    onChange={(value) =>
                                        handleSettingsChange("format", value)
                                    }
                                    className="video-compressor-dropdown"
                                    dropdownClassName="video-compressor-dropdown-menu"
                                    optionClassName="video-compressor-dropdown-option"
                                />
                            </div>

                            {/* Quality Slider */}
                            <div className="video-compressor-setting-group">
                                <label className="video-compressor-setting-label">
                                    Quality: {compressionSettings.quality}%
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
                                    className="video-compressor-quality-slider"
                                />
                                <div className="video-compressor-quality-labels">
                                    <span>Smaller File</span>
                                    <span>Better Quality</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="video-compressor-actions">
                            <div className="video-compressor-buttons">
                                <button
                                    onClick={handleCompress}
                                    disabled={isCompressing}
                                    className={`video-compressor-button video-compressor-button--compress ${
                                        isCompressing
                                            ? "video-compressor-button--compressing"
                                            : ""
                                    }`}
                                >
                                    {isCompressing ? (
                                        <>
                                            <div className="video-compressor-spinner"></div>
                                            Compressing... {progress}%
                                        </>
                                    ) : (
                                        "Compress Video"
                                    )}
                                </button>

                                {compressedUrl && (
                                    <button
                                        onClick={handleDownload}
                                        className="video-compressor-button video-compressor-button--download"
                                    >
                                        <svg
                                            className="video-compressor-download-icon"
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
                                <div className="video-compressor-progress-container">
                                    <div
                                        className="video-compressor-progress-bar"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            )}

                            {/* Download Info */}
                            {compressedUrl && (
                                <div className="video-compressor-download-info">
                                    <span className="video-compressor-download-filename">
                                        {compressedFileName}
                                    </span>
                                    <span className="video-compressor-download-ready">
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

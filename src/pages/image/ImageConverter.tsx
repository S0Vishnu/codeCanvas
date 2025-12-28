import React, { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { DropdownOption } from "../../components/Dropdown";
import Dropdown from "../../components/Dropdown";
import { FiDownload, FiTrash2, FiCopy, FiEye } from "react-icons/fi";
import "../../styles/BatchImageConverter.css";

// extended output options
type SupportedFormat =
    | "png"
    | "jpeg"
    | "webp"
    | "bmp"
    | "gif"
    | "avif"
    | "blob"
    | "url"
    | "base64"
    | "text";

interface ConvertedFile {
    name: string;
    url?: string;
    blob?: Blob;
    text?: string;
    type: SupportedFormat;
}

const BatchFileConverter: React.FC = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
    const [targetFormat, setTargetFormat] = useState<SupportedFormat>("png");
    const [isConverting, setIsConverting] = useState(false);
    const [previewFile, setPreviewFile] = useState<ConvertedFile | null>(null);

    const formatOptions: DropdownOption[] = [
        { label: "PNG", value: "png" },
        { label: "JPEG", value: "jpeg" },
        { label: "WEBP", value: "webp" },
        { label: "BMP", value: "bmp" },
        { label: "GIF", value: "gif" },
        { label: "AVIF", value: "avif" },
        { label: "Blob", value: "blob" },
        { label: "Object URL", value: "url" },
        { label: "Base64", value: "base64" },
        { label: "Text (UTF-8)", value: "text" },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        setSelectedFiles((prev) => [...prev, ...files]);
    };

    const removeUploadedFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const clearAllUploaded = () => {
        setSelectedFiles([]);
        setConvertedFiles([]);
    };

    const convertFile = (file: File): Promise<ConvertedFile> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            const baseName = file.name.replace(/\.[^/.]+$/, "");

            // Handle text conversion
            if (targetFormat === "text") {
                reader.onload = () => {
                    resolve({
                        name: `${baseName}.txt`,
                        text: reader.result as string,
                        type: "text",
                    });
                };
                reader.onerror = () => reject(new Error("Failed to read file as text"));
                reader.readAsText(file);
                return;
            }

            // Handle image and binary formats
            if (
                ["blob", "url", "base64", "png", "jpeg", "webp", "bmp", "gif", "avif"].includes(
                    targetFormat
                )
            ) {
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement("canvas");
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext("2d");
                        if (!ctx) {
                            reject(new Error("Could not get canvas context"));
                            return;
                        }

                        // Draw image on canvas
                        ctx.drawImage(img, 0, 0);

                        if (targetFormat === "blob") {
                            canvas.toBlob((blob) => {
                                if (blob) {
                                    resolve({
                                        name: `${baseName}.blob`,
                                        blob: blob,
                                        type: "blob",
                                    });
                                } else {
                                    reject(new Error("Failed to create blob"));
                                }
                            }, "image/png");
                        } else if (targetFormat === "url") {
                            canvas.toBlob((blob) => {
                                if (blob) {
                                    const url = URL.createObjectURL(blob);
                                    resolve({
                                        name: `${baseName}.url`,
                                        url,
                                        blob: blob,
                                        type: "url",
                                    });
                                } else {
                                    reject(new Error("Failed to create blob for URL"));
                                }
                            }, "image/png");
                        } else if (targetFormat === "base64") {
                            try {
                                const base64 = canvas.toDataURL("image/png", 1.0);
                                resolve({
                                    name: `${baseName}.b64.txt`,
                                    text: base64,
                                    type: "base64",
                                });
                            } catch (error) {
                                console.log("error: ", error);
                                reject(new Error("Failed to convert to base64"));
                            }
                        } else {
                            try {
                                const mimeType =
                                    targetFormat === "jpeg"
                                        ? "image/jpeg"
                                        : `image/${targetFormat}`;
                                const converted = canvas.toDataURL(mimeType, 1.0);
                                resolve({
                                    name: `${baseName}.${targetFormat}`,
                                    url: converted,
                                    type: targetFormat,
                                });
                            } catch (error) {
                                console.log("error: ", error);
                                reject(new Error(`Failed to convert to ${targetFormat}`));
                            }
                        }
                    };

                    img.onerror = () => reject(new Error("Failed to load image"));

                    if (event.target?.result) {
                        img.src = event.target.result as string;
                    } else {
                        reject(new Error("No data loaded from file"));
                    }
                };

                reader.onerror = () => reject(new Error("Failed to read file"));
                reader.readAsDataURL(file);
            } else {
                reject(new Error(`Unsupported format: ${targetFormat}`));
            }
        });
    };

    const handleConvertAll = async () => {
        if (selectedFiles.length === 0) return;

        setIsConverting(true);
        const results: ConvertedFile[] = [];
        const errors: string[] = [];

        for (const file of selectedFiles) {
            try {
                const converted = await convertFile(file);
                results.push(converted);
            } catch (error) {
                console.error(`Failed to convert ${file.name}:`, error);
                errors.push(
                    `${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`
                );
            }
        }

        setConvertedFiles(results);
        setIsConverting(false);

        if (errors.length > 0) {
            alert(`Some files failed to convert:\n${errors.join("\n")}`);
        }
    };

    const handleDownload = (file: ConvertedFile) => {
        try {
            if (file.blob) {
                saveAs(file.blob, file.name);
            } else if (file.url) {
                const link = document.createElement("a");
                link.href = file.url;
                link.download = file.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Clean up object URL if it's a blob URL
                if (file.url.startsWith("blob:")) {
                    setTimeout(() => URL.revokeObjectURL(file.url!), 100);
                }
            } else if (file.text) {
                const blob = new Blob([file.text], { type: "text/plain;charset=utf-8" });
                saveAs(blob, file.name);
            }
        } catch (error) {
            console.error("Download failed:", error);
            alert("Download failed. The file might be too large.");
        }
    };

    const handleDownloadAll = async () => {
        try {
            const zip = new JSZip();

            for (const file of convertedFiles) {
                if (file.blob) {
                    zip.file(file.name, file.blob);
                } else if (file.text) {
                    zip.file(file.name, file.text);
                } else if (file.url && file.url.startsWith("data:")) {
                    const base64Data = file.url.split(",")[1];
                    zip.file(file.name, base64Data, { base64: true });
                } else if (file.url) {
                    // Handle blob URLs by fetching and converting to blob
                    try {
                        const response = await fetch(file.url);
                        const blob = await response.blob();
                        zip.file(file.name, blob);
                    } catch (error) {
                        console.error(`Failed to add ${file.name} to ZIP:`, error);
                    }
                }
            }

            const blob = await zip.generateAsync({ type: "blob" });
            saveAs(blob, "converted_files.zip");
        } catch (error) {
            console.error("ZIP creation failed:", error);
            alert("Failed to create ZIP file. Some files might be too large.");
        }
    };

    const copyToClipboard = async (file: ConvertedFile) => {
        try {
            if (file.text) {
                await navigator.clipboard.writeText(file.text);
            } else if (file.blob) {
                await navigator.clipboard.write([
                    new ClipboardItem({ [file.blob.type]: file.blob }),
                ]);
            } else if (file.url && file.url.startsWith("data:")) {
                // For data URLs, extract base64 and create a blob
                const response = await fetch(file.url);
                const blob = await response.blob();
                await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
            } else if (file.url) {
                // For blob URLs, fetch and create clipboard item
                const response = await fetch(file.url);
                const blob = await response.blob();
                await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
            } else {
                throw new Error("No data to copy");
            }
            alert("Copied to clipboard!");
        } catch (err) {
            console.error("Copy failed:", err);
            alert("Failed to copy. The content might be too large for clipboard.");
        }
    };

    return (
        <>
            <div className="page-container glass-panel p-6 flex-col gap-lg h-fit">
                <div className="flex-col gap-sm flex-center">
                    <h2 className="text-title text-gradient">Batch File Converter</h2>
                    <p className="text-subtitle">Convert multiple files to different formats simultaneously</p>
                </div>

                <div className="upload-zone w-full">
                    <input
                        id="file-upload"
                        type="file"
                        accept="*/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <label htmlFor="file-upload" className="flex-col flex-center cursor-pointer w-full h-full">
                        <div className="upload-icon">📂</div>
                        <span className="text-lg font-semibold text-white">Choose Files</span>
                        <span className="text-sm text-secondary mt-2">Supports images and text files</span>
                    </label>
                </div>

                {selectedFiles.length > 0 && (
                    <div className="flex-col gap-md">
                        <div className="flex-row justify-between border-b border-white/10 pb-4">
                            <h4 className="font-bold">Uploaded Files ({selectedFiles.length})</h4>
                            <button className="btn-base btn-danger text-xs px-3 py-1" onClick={clearAllUploaded}>
                                Clear All
                            </button>
                        </div>
                        <div className="grid-images">
                            {selectedFiles.map((file, index) => (
                                <div key={index} className="glass-card flex-col gap-sm items-center relative group">
                                    <div className="w-12 h-12 bg-white/5 rounded-full flex-center mb-2">
                                        <span className="text-2xl">📄</span>
                                    </div>
                                    <p className="font-medium truncate w-full text-center" title={file.name}>{file.name}</p>
                                    <p className="text-xs text-secondary">
                                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                    <button
                                        className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeUploadedFile(index)}
                                        title="Remove"
                                    >
                                        <FiTrash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="glass-card p-6 flex-col gap-md">
                    <div className="flex-col gap-sm">
                        <label className="label-text">Convert to:</label>
                        <Dropdown
                            options={formatOptions}
                            value={targetFormat}
                            onChange={(val) => setTargetFormat(val as SupportedFormat)}
                            placeholder="Select format"
                            closeOnSelect
                        />
                    </div>

                    <button
                        className="btn-base btn-primary w-full"
                        onClick={handleConvertAll}
                        disabled={selectedFiles.length === 0 || isConverting}
                    >
                        {isConverting ? "Converting..." : "Convert All"}
                    </button>
                </div>

                {isConverting && (
                    <div className="flex-col flex-center py-8">
                        <div className="spinner mb-4"></div>
                        <p className="text-secondary">Converting files, please wait...</p>
                    </div>
                )}

                {convertedFiles.length > 0 && (
                    <div className="flex-col gap-md">
                        <div className="flex-row justify-between border-b border-white/10 pb-4">
                            <h3 className="font-bold text-lg">Converted Files ({convertedFiles.length})</h3>
                            <div className="flex-row gap-sm">
                                <button
                                    className="btn-base btn-danger text-xs px-3 py-1"
                                    onClick={() => setConvertedFiles([])}
                                >
                                    Clear All
                                </button>
                                <button className="btn-base btn-success text-xs px-3 py-1" onClick={handleDownloadAll}>
                                    Download All (ZIP)
                                </button>
                            </div>
                        </div>
                        <div className="grid-images">
                            {convertedFiles.map((file, index) => (
                                <div key={index} className="glass-card flex-col gap-sm relative group overflow-hidden">
                                    <div className="aspect-video bg-black/40 rounded-lg overflow-hidden flex-center relative">
                                        {file.url && file.type !== "base64" ? (
                                            <img
                                                src={file.url}
                                                alt={file.name}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = "none";
                                                }}
                                            />
                                        ) : (
                                            <div className="text-4xl">📄</div>
                                        )}

                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex-center gap-2">
                                            <button
                                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                                                onClick={() => copyToClipboard(file)}
                                                title="Copy"
                                            >
                                                <FiCopy size={18} />
                                            </button>
                                            <button
                                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                                                onClick={() => setPreviewFile(file)}
                                                title="Preview"
                                            >
                                                <FiEye size={18} />
                                            </button>
                                            <button
                                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                                                onClick={() => handleDownload(file)}
                                                title="Download"
                                            >
                                                <FiDownload size={18} />
                                            </button>
                                            <button
                                                className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white transition-colors"
                                                onClick={() =>
                                                    setConvertedFiles((prev) =>
                                                        prev.filter((_, i) => i !== index)
                                                    )
                                                }
                                                title="Remove"
                                            >
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="font-medium truncate w-full text-center text-sm" title={file.name}>{file.name}</p>

                                    {file.text && (
                                        <div className="w-full h-20 bg-black/20 rounded-md p-2 overflow-hidden">
                                            <p className="text-xs font-mono text-secondary break-all line-clamp-3">
                                                {file.text.substring(0, 100)}...
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {previewFile && (
                <div className="fixed inset-0 z-50 flex-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="glass-panel p-6 max-w-[90vw] max-h-[90vh] overflow-auto relative w-full md:w-auto">
                        <button
                            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
                            onClick={() => setPreviewFile(null)}
                        >
                            ✕
                        </button>

                        <h4 className="text-xl font-bold mb-4 pr-12">{previewFile.name}</h4>

                        <div className="flex-center bg-black/20 rounded-lg p-4 min-h-[300px]">
                            {previewFile.blob && (
                                <img
                                    src={URL.createObjectURL(previewFile.blob)}
                                    alt={previewFile.name}
                                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                                />
                            )}
                            {previewFile.url && !previewFile.blob && (
                                <img
                                    src={previewFile.url}
                                    alt={previewFile.name}
                                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                                />
                            )}
                            {previewFile.text && (
                                <textarea
                                    value={previewFile.text}
                                    readOnly
                                    rows={12}
                                    className="w-full min-w-[50vw] min-h-[50vh] bg-transparent border-none text-mono text-sm resize-none focus:outline-none"
                                ></textarea>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BatchFileConverter;

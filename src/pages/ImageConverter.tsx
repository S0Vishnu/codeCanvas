import React, { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import "../styles/BatchImageConverter.css";
import type { DropdownOption } from "../components/Dropdown";
import Dropdown from "../components/Dropdown";
import { FiDownload, FiTrash2, FiCopy, FiEye } from "react-icons/fi";

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
            <div className="converter-container">
                <h2 className="converter-title">Batch File Converter</h2>

                <div className="file-input-wrapper">
                    <input
                        id="file-upload"
                        type="file"
                        accept="*/*"
                        multiple
                        onChange={handleFileChange}
                        className="file-input-hidden"
                    />
                    <label htmlFor="file-upload" className="file-input-label">
                        📂 Choose Files
                    </label>
                </div>

                {selectedFiles.length > 0 && (
                    <div className="uploaded-images">
                        <div className="header">
                            <h4>Uploaded Files ({selectedFiles.length})</h4>
                            <button className="clear-all-btn" onClick={clearAllUploaded}>
                                Clear All
                            </button>
                        </div>
                        <div className="images-grid">
                            {selectedFiles.map((file, index) => (
                                <div key={index} className="image-card">
                                    <p className="image-name">{file.name}</p>
                                    <p className="file-size">
                                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                    <button
                                        className="remove-btn"
                                        onClick={() => removeUploadedFile(index)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="convert-wrap">
                    <div className="convert-format-select">
                        <label>Convert to:</label>
                        <Dropdown
                            options={formatOptions}
                            value={targetFormat}
                            onChange={(val) => setTargetFormat(val as SupportedFormat)}
                            placeholder="Select format"
                            closeOnSelect
                        />
                    </div>

                    <button
                        className="convert-btn"
                        onClick={handleConvertAll}
                        disabled={selectedFiles.length === 0 || isConverting}
                    >
                        {isConverting ? "Converting..." : "Convert All"}
                    </button>
                </div>

                {isConverting && (
                    <div className="results loading-container">
                        <p>Converting files, please wait...</p>
                        <div className="spinner"></div>
                    </div>
                )}

                {convertedFiles.length > 0 && (
                    <div className="results">
                        <div className="header">
                            <h3>Converted Files ({convertedFiles.length})</h3>
                            <div className="header">
                                <button
                                    className="clear-all-btn"
                                    onClick={() => setConvertedFiles([])}
                                >
                                    Clear All
                                </button>
                                <button className="download-all-btn" onClick={handleDownloadAll}>
                                    Download All (ZIP)
                                </button>
                            </div>
                        </div>
                        <div className="images-grid">
                            {convertedFiles.map((file, index) => (
                                <div key={index} className="image-card">
                                    {file.url && file.type !== "base64" && (
                                        <img
                                            src={file.url}
                                            alt={file.name}
                                            className="image-preview"
                                            onError={(e) => {
                                                // Hide image if it fails to load (e.g., for non-image formats)
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />
                                    )}
                                    <p className="image-name">{file.name}</p>
                                    {file.text && (
                                        <div className="text-box">
                                            <textarea
                                                value={file.text}
                                                readOnly
                                                rows={6}
                                            ></textarea>
                                        </div>
                                    )}
                                    <div className="image-actions">
                                        <button
                                            className="icon-btn"
                                            onClick={() => copyToClipboard(file)}
                                            title="Copy"
                                        >
                                            <FiCopy size={20} />
                                        </button>
                                        <button
                                            className="icon-btn preview-btn"
                                            onClick={() => setPreviewFile(file)}
                                            title="Preview"
                                        >
                                            <FiEye size={20} />
                                        </button>
                                        <button
                                            className="icon-btn download-btn"
                                            onClick={() => handleDownload(file)}
                                            title="Download"
                                        >
                                            <FiDownload size={20} />
                                        </button>
                                        <button
                                            className="icon-btn remove-btn"
                                            onClick={() =>
                                                setConvertedFiles((prev) =>
                                                    prev.filter((_, i) => i !== index)
                                                )
                                            }
                                            title="Remove"
                                        >
                                            <FiTrash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {previewFile && (
                <div className="preview-modal">
                    <div className="modal-content">
                        <h4>{previewFile.name}</h4>
                        {previewFile.blob && (
                            <img
                                src={URL.createObjectURL(previewFile.blob)}
                                alt={previewFile.name}
                                className="preview-img"
                            />
                        )}
                        {previewFile.url && !previewFile.blob && (
                            <img
                                src={previewFile.url}
                                alt={previewFile.name}
                                className="preview-img"
                            />
                        )}
                        {previewFile.text && (
                            <textarea
                                value={previewFile.text}
                                readOnly
                                rows={12}
                                style={{ width: "100%", minHeight: "300px" }}
                            ></textarea>
                        )}
                        <button className="close-btn" onClick={() => setPreviewFile(null)}>
                            X
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default BatchFileConverter;

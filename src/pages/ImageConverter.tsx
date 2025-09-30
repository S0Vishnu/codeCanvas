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
        return new Promise((resolve) => {
            const reader = new FileReader();
            const baseName = file.name.replace(/\.[^/.]+$/, "");

            if (targetFormat === "text") {
                reader.onload = () => {
                    resolve({
                        name: `${baseName}.txt`,
                        text: reader.result as string,
                        type: "text",
                    });
                };
                reader.readAsText(file);
                return;
            }

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
                        if (!ctx) return;
                        ctx.drawImage(img, 0, 0);

                        if (targetFormat === "blob") {
                            canvas.toBlob((blob) => {
                                resolve({
                                    name: `${baseName}.blob`,
                                    blob: blob || undefined,
                                    type: "blob",
                                });
                            }, "image/png");
                        } else if (targetFormat === "url") {
                            canvas.toBlob((blob) => {
                                const url = blob ? URL.createObjectURL(blob) : "";
                                resolve({
                                    name: `${baseName}.url`,
                                    url,
                                    blob: blob || undefined,
                                    type: "url",
                                });
                            }, "image/png");
                        } else if (targetFormat === "base64") {
                            const base64 = canvas.toDataURL("image/png", 1.0);
                            resolve({ name: `${baseName}.b64.txt`, text: base64, type: "base64" });
                        } else {
                            const converted = canvas.toDataURL(`image/${targetFormat}`, 1.0);
                            resolve({
                                name: `${baseName}.${targetFormat}`,
                                url: converted,
                                type: targetFormat,
                            });
                        }
                    };
                    if (event.target?.result) {
                        img.src = event.target.result as string;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    };

    const handleConvertAll = async () => {
        if (selectedFiles.length === 0) return;
        setIsConverting(true);
        const results: ConvertedFile[] = [];

        for (const file of selectedFiles) {
            const converted = await convertFile(file);
            results.push(converted);
        }

        setConvertedFiles(results);
        setIsConverting(false);
    };

    const handleDownload = (file: ConvertedFile) => {
        if (file.blob) {
            saveAs(file.blob, file.name);
        } else if (file.url) {
            const link = document.createElement("a");
            link.href = file.url;
            link.download = file.name;
            link.click();
        } else if (file.text) {
            const blob = new Blob([file.text], { type: "text/plain;charset=utf-8" });
            saveAs(blob, file.name);
        }
    };

    const handleDownloadAll = async () => {
        const zip = new JSZip();
        convertedFiles.forEach((file) => {
            if (file.blob) {
                zip.file(file.name, file.blob);
            } else if (file.text) {
                zip.file(file.name, file.text);
            } else if (file.url) {
                const base64Data = file.url.split(",")[1];
                zip.file(file.name, base64Data, { base64: true });
            }
        });
        const blob = await zip.generateAsync({ type: "blob" });
        saveAs(blob, "converted_files.zip");
    };

    const copyToClipboard = async (file: ConvertedFile) => {
        try {
            if (file.text) {
                await navigator.clipboard.writeText(file.text);
            } else if (file.blob || file.url) {
                // Convert to blob if URL is present but blob is not
                let blob = file.blob;
                if (!blob && file.url) {
                    const response = await fetch(file.url);
                    blob = await response.blob();
                }
                if (blob) {
                    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
                } else {
                    throw new Error("No data to copy");
                }
            }
            alert("Copied to clipboard!");
        } catch (err) {
            console.error("Copy failed:", err);
            alert("Failed to copy.");
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
                        disabled={selectedFiles.length === 0}
                    >
                        Convert All
                    </button>
                </div>

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
                                    {file.url && (
                                        <img
                                            src={file.url}
                                            alt={file.name}
                                            className="image-preview"
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

                {isConverting && convertedFiles.length === 0 && (
                    <div className="results loading-container">
                        <p>Converting files, please wait...</p>
                        <div className="spinner"></div>
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
                            <textarea value={previewFile.text} readOnly rows={12}></textarea>
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

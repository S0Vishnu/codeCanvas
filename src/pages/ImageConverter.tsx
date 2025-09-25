import React, { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import "../styles/BatchImageConverter.css";
import type { DropdownOption } from "../components/Dropdown";
import Dropdown from "../components/Dropdown";
import { FiDownload, FiTrash2 } from "react-icons/fi";

type SupportedFormat = "png" | "jpeg" | "webp" | "bmp" | "gif" | "avif";

interface ConvertedImage {
    name: string;
    url: string;
}

const BatchImageConverter: React.FC = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);
    const [targetFormat, setTargetFormat] = useState<SupportedFormat>("png");
    const [isConverting, setIsConverting] = useState(false); // NEW

    const formatOptions: DropdownOption[] = [
        { label: "PNG", value: "png" },
        { label: "JPEG", value: "jpeg" },
        { label: "WEBP", value: "webp" },
        { label: "BMP", value: "bmp" },
        { label: "GIF", value: "gif" },
        { label: "AVIF", value: "avif" },
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
        setConvertedImages([]);
    };

    const convertImage = (file: File): Promise<ConvertedImage> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;

                    const ctx = canvas.getContext("2d");
                    if (!ctx) return;

                    ctx.drawImage(img, 0, 0);

                    const converted = canvas.toDataURL(`image/${targetFormat}`, 1.0);
                    const baseName = file.name.replace(/\.[^/.]+$/, "");
                    resolve({ name: `${baseName}.${targetFormat}`, url: converted });
                };
                if (event.target?.result) {
                    img.src = event.target.result as string;
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleConvertAll = async () => {
        if (selectedFiles.length === 0) return;
        setIsConverting(true); // START LOADING
        const results: ConvertedImage[] = [];

        for (const file of selectedFiles) {
            const converted = await convertImage(file);
            results.push(converted);
        }

        setConvertedImages(results);
        setIsConverting(false); // STOP LOADING
    };

    const handleDownload = (img: ConvertedImage) => {
        const link = document.createElement("a");
        link.href = img.url;
        link.download = img.name;
        link.click();
    };

    const handleDownloadAll = async () => {
        const zip = new JSZip();
        convertedImages.forEach((img) => {
            const base64Data = img.url.split(",")[1];
            zip.file(img.name, base64Data, { base64: true });
        });
        const blob = await zip.generateAsync({ type: "blob" });
        saveAs(blob, "converted_images.zip");
    };

    const removeConvertedImage = (index: number) => {
        setConvertedImages((prev) => prev.filter((_, i) => i !== index));
    };

    const clearAllConverted = () => {
        setConvertedImages([]);
    };

    return (
        <div className="converter-container">
            <h2 className="converter-title">Batch Image Converter</h2>

            <div className="file-input-wrapper">
                <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="file-input-hidden"
                />
                <label htmlFor="file-upload" className="file-input-label">
                    📂 Choose Images
                </label>
            </div>

            {selectedFiles.length > 0 && (
                <div className="uploaded-images">
                    <div className="header">
                        <h4>Uploaded Images ({selectedFiles.length})</h4>
                        <button className="clear-all-btn" onClick={clearAllUploaded}>
                            Clear All
                        </button>
                    </div>
                    <div className="images-grid">
                        {selectedFiles.map((file, index) => {
                            const url = URL.createObjectURL(file);
                            return (
                                <div key={index} className="image-card">
                                    <img src={url} alt={file.name} className="image-preview" />
                                    <p className="image-name">{file.name}</p>
                                    <button
                                        className="remove-btn"
                                        onClick={() => removeUploadedFile(index)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            );
                        })}
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

            {convertedImages.length > 0 && (
                <div className="results">
                    <div className="header">
                        <h3>Converted Images ({convertedImages.length})</h3>
                        <div className="header">
                            <button className="clear-all-btn" onClick={clearAllConverted}>
                                Clear All
                            </button>
                            <button className="download-all-btn" onClick={handleDownloadAll}>
                                Download All (ZIP)
                            </button>
                        </div>
                    </div>
                    <div className="images-grid">
                        {convertedImages.map((img, index) => (
                            <div key={index} className="image-card">
                                <img src={img.url} alt={img.name} className="image-preview" />
                                <p className="image-name">{img.name}</p>
                                <div className="image-actions">
                                    <button
                                        className="icon-btn download-btn"
                                        onClick={() => handleDownload(img)}
                                        title="Download"
                                    >
                                        <FiDownload size={20} />
                                    </button>

                                    <button
                                        className="icon-btn remove-btn"
                                        onClick={() => removeConvertedImage(index)}
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
            {isConverting && convertedImages.length === 0 && (
                <div className="results loading-container">
                    <p>Converting images, please wait...</p>
                    <div className="spinner"></div>
                </div>
            )}
        </div>
    );
};

export default BatchImageConverter;

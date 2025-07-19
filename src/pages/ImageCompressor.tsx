import React, { useState, useRef, useCallback } from "react";
import imageCompression from "browser-image-compression";
import JSZip from "jszip";
import "../styles/ImageCompressor.css";

type ImageItem = {
  file: File;
  originalUrl: string;
  compressedFile?: File;
  compressedUrl?: string;
};

const ImageCompressor: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [maxSizeMB, setMaxSizeMB] = useState(1);
  const [maxDimension, setMaxDimension] = useState(1024);
  const [quality, setQuality] = useState(0.8);
  const [format, setFormat] = useState<"jpeg" | "jpg" | "png">("jpeg");
  const dropRef = useRef<HTMLDivElement>(null);

  const handleFiles = (files: File[]) => {
    const newImages = files.map((file) => ({
      file,
      originalUrl: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length > 0) handleFiles(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const compressAll = async () => {
    const compressedImages = await Promise.all(
      images.map(async (img) => {
        try {
          const options = {
            maxSizeMB,
            maxWidthOrHeight: maxDimension,
            useWebWorker: true,
            initialQuality: quality,
            fileType: `image/${format}`,
          };
          const compressed = await imageCompression(img.file, options);
          return {
            ...img,
            compressedFile: compressed,
            compressedUrl: URL.createObjectURL(compressed),
          };
        } catch (err) {
          console.error("Compression failed:", err);
          return img;
        }
      })
    );
    setImages(compressedImages);
  };

  const downloadImage = (file: File, name: string) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = `${name}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    images.forEach((img, i) => {
      if (img.compressedFile) {
        zip.file(`compressed-${i}.${format}`, img.compressedFile, {
          binary: true,
        });
      }
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "compressed-images.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTotalSizes = () => {
    const original = images.reduce((acc, img) => acc + img.file.size, 0);
    const compressed = images.reduce(
      (acc, img) => acc + (img.compressedFile?.size || 0),
      0
    );
    const saved = original - compressed;
    return {
      originalKB: (original / 1024).toFixed(2),
      compressedKB: (compressed / 1024).toFixed(2),
      savedKB: (saved / 1024).toFixed(2),
      savedPercent: ((saved / original) * 100).toFixed(1),
    };
  };

  const clearAll = () => {
    setImages([]);
  };

  const { originalKB, compressedKB, savedKB, savedPercent } = getTotalSizes();

  return (
    <div
      ref={dropRef}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="image-compressor-container"
    >
      <h1 className="title">Multi Image Compressor</h1>

      <div className="controls">
        <div className="inputs">
          <label className="file-input-wrapper">
            <span className="file-label">📁 Upload Images</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInput}
            />
          </label>

          <label>
            Max Size (MB): {maxSizeMB}
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              className="custom-range"
              value={maxSizeMB}
              onChange={(e) => setMaxSizeMB(parseFloat(e.target.value))}
            />
          </label>

          <label>
            Max Width/Height: {maxDimension}px
            <input
              type="range"
              min="100"
              max="4000"
              step="100"
              className="custom-range"
              value={maxDimension}
              onChange={(e) => setMaxDimension(parseInt(e.target.value))}
            />
          </label>

          <label>
            Quality: {quality}
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              className="custom-range"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
            />
          </label>
        </div>

        <label className="format-select">
          Output Format:
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as any)}
          >
            <option value="jpeg">JPEG</option>
            <option value="jpg">JPG</option>
            <option value="png">PNG</option>
          </select>
        </label>

        <div className="action-buttons">
          <button className="btn compress" onClick={compressAll}>
            Compress All
          </button>
          <button
            className="btn zip"
            onClick={downloadZip}
            disabled={!images.some((img) => img.compressedFile)}
          >
            Zip & Download All
          </button>
          <button className="btn clear" onClick={clearAll}>
            Clear All
          </button>
        </div>

        {images.length > 0 && (
          <p className="stats">
            Total Original: {originalKB} KB | Compressed: {compressedKB} KB |
            Saved: {savedKB} KB ({savedPercent}%)
          </p>
        )}
      </div>

      <div className="image-grid">
        {images.map((img, index) => (
          <div key={index} className="image-card">
            <h2>Original</h2>
            <img src={img.originalUrl} alt="original" />
            <p>{(img.file.size / 1024).toFixed(2)} KB</p>

            {img.compressedFile && (
              <>
                <h2>Compressed</h2>
                <img src={img.compressedUrl} alt="compressed" />
                <p>{(img.compressedFile.size / 1024).toFixed(2)} KB</p>
                <button
                  className="btn download"
                  onClick={() =>
                    downloadImage(img.compressedFile!, `compressed-${index}`)
                  }
                >
                  Download {format.toUpperCase()}
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageCompressor;

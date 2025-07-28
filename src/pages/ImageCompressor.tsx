import React, { useState, useRef, useCallback, useEffect } from "react";
import imageCompression from "browser-image-compression";
import JSZip from "jszip";
import "../styles/ImageCompressor.css";

type ImageItem = {
  id: string;
  file: File;
  originalUrl: string;
  originalSize: number;
  originalDimensions: { width: number; height: number };
  compressedFile?: File;
  compressedUrl?: string;
  compressedSize?: number;
  isCompressing: boolean;
  error?: string;
};

type ToastMessage = {
  id: string;
  message: string;
  type: "error" | "success" | "info";
};

const ImageCompressor: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewOriginalId, setPreviewOriginalId] = useState<string | null>(null);
  
  // Global compression settings
  const [globalQuality, setGlobalQuality] = useState(0.8);
  const [globalMaxDimension, setGlobalMaxDimension] = useState(1024);
  const [settingsChanged, setSettingsChanged] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  
  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Constants
  const MAX_IMAGES = 15;
  const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB
  const SUPPORTED_TYPES = ['.jpg', '.jpeg', '.png', '.webp'];

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Toast management
  const addToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  // Get image dimensions
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // Validate file
  const validateFile = (file: File): boolean => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!SUPPORTED_TYPES.includes(extension)) {
      addToast(`Unsupported file type: ${file.name}`, 'error');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB per file
      addToast(`File too large: ${file.name}`, 'error');
      return false;
    }
    return true;
  };

  // Handle file uploads
  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter(validateFile);
    
    if (validFiles.length === 0) return;

    // Check limits
    const currentTotalSize = images.reduce((acc, img) => acc + img.file.size, 0);
    const newTotalSize = validFiles.reduce((acc, file) => acc + file.size, 0);
    
    if (images.length + validFiles.length > MAX_IMAGES) {
      addToast(`Maximum ${MAX_IMAGES} images allowed`, 'error');
      return;
    }
    
    if (currentTotalSize + newTotalSize > MAX_TOTAL_SIZE) {
      addToast('Total file size exceeds 50MB limit', 'error');
      return;
    }

    try {
      const newImages = await Promise.all(
        validFiles.map(async (file) => {
          const dimensions = await getImageDimensions(file);
          return {
            id: generateId(),
            file,
            originalUrl: URL.createObjectURL(file),
            originalSize: file.size,
            originalDimensions: dimensions,
            isCompressing: false,
          };
        })
      );

      setImages(prev => [...prev, ...newImages]);
      addToast(`${validFiles.length} image(s) uploaded successfully`, 'success');
    } catch {
      addToast('Some files couldn\'t be read. Please re-upload.', 'error');
    }
  };

  // Drag and drop handlers
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
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
      fileInputRef.current.value = '';
    }
  };

  // Compress all images
  const compressAll = async () => {
    const uncompressedImages = images.filter(img => !img.compressedFile || settingsChanged);
    
    if (uncompressedImages.length === 0) {
      addToast('No images to compress', 'info');
      return;
    }

    for (const image of uncompressedImages) {
      if (image.isCompressing) continue;

      setImages(prev => prev.map(img => 
        img.id === image.id ? { ...img, isCompressing: true, error: undefined } : img
      ));

      try {
        // Determine file type and compression options
        const fileExtension = image.file.name.split('.').pop()?.toLowerCase();
        const isPNG = fileExtension === 'png';
        const isWebP = fileExtension === 'webp';
        
        const options = {
          maxSizeMB: image.originalSize / (1024 * 1024) * 0.8,
          maxWidthOrHeight: globalMaxDimension,
          useWebWorker: true,
          // Preserve transparency for PNG and WebP
          ...(isPNG || isWebP ? {
            fileType: isPNG ? 'image/png' : 'image/webp',
            initialQuality: 1, // Use maximum quality for PNG/WebP to preserve transparency
          } : {
            fileType: 'image/jpeg',
            initialQuality: globalQuality,
          }),
        };

        const compressed = await imageCompression(image.file, options);
        
        setImages(prev => prev.map(img => 
          img.id === image.id ? {
            ...img,
            compressedFile: compressed,
            compressedUrl: URL.createObjectURL(compressed),
            compressedSize: compressed.size,
            isCompressing: false
          } : img
        ));

        addToast(`Compressed: ${image.file.name}`, 'success');
      } catch {
        setImages(prev => prev.map(img => 
          img.id === image.id ? {
            ...img,
            isCompressing: false,
            error: 'Compression failed'
          } : img
        ));
        addToast(`Compression failed for: ${image.file.name}`, 'error');
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

  // Remove image
  const removeImage = (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (image) {
      URL.revokeObjectURL(image.originalUrl);
      if (image.compressedUrl) {
        URL.revokeObjectURL(image.compressedUrl);
      }
    }
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  // Download all as ZIP
  const downloadZip = async () => {
    const compressedImages = images.filter(img => img.compressedFile);
    if (compressedImages.length === 0) {
      addToast('No compressed images to download', 'error');
      return;
    }

    const zip = new JSZip();
    compressedImages.forEach((img) => {
      if (img.compressedFile) {
        const name = img.file.name.replace(/\.[^/.]+$/, '');
        zip.file(`${name}-compressed.${downloadFormat}`, img.compressedFile, {
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
    addToast('ZIP download started', 'success');
  };

  // Clear all images
  const clearAll = () => {
    images.forEach(img => {
      URL.revokeObjectURL(img.originalUrl);
      if (img.compressedUrl) {
        URL.revokeObjectURL(img.compressedUrl);
      }
    });
    setImages([]);
    setSettingsChanged(false);
    addToast('All images cleared', 'info');
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
      images.forEach(img => {
        URL.revokeObjectURL(img.originalUrl);
        if (img.compressedUrl) {
          URL.revokeObjectURL(img.compressedUrl);
        }
      });
    };
  }, []);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate compression ratio
  const getCompressionRatio = (original: number, compressed: number) => {
    return ((original - compressed) / original * 100).toFixed(1);
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
      savedPercent: original > 0 ? ((saved / original) * 100).toFixed(1) : '0',
    };
  };

  const stats = getCompressionStats();

  return (
    <div
      ref={dropRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`image-compressor-container ${isDragging ? 'dragging' : ''}`}
    >
      {/* Toast Messages */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>

      <div className="page-header">
        <h1 className="title">Multi Image Compressor</h1>
        <p className="subtitle">Compress multiple images with custom quality and size settings</p>
      </div>

      {/* Upload Section */}
      {images.length === 0 && (
        <div className="upload-section">
          <div className="upload-area">
            <div className="upload-icon">📁</div>
            <h3>Upload Images</h3>
            <p>Drag & drop images here or click to browse</p>
            <p className="upload-info">
              Supported: JPG, PNG, WebP • Max: {MAX_IMAGES} images, 50MB total
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
              style={{ display: 'none' }}
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
                  disabled={!images.some(img => img.compressedFile)}
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
                      onChange={(e) => handleQualityChange(parseFloat(e.target.value))}
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
                      onChange={(e) => handleMaxDimensionChange(parseInt(e.target.value))}
                    />
                  </label>
                </div>

                <div className="setting-group">
                  <label>
                    Download Format:
                    <select
                      value={downloadFormat}
                      onChange={(e) => setDownloadFormat(e.target.value as 'jpeg' | 'png' | 'webp')}
                      className="format-select"
                    >
                      <option value="jpeg">JPEG</option>
                      <option value="png">PNG (Preserves Transparency)</option>
                      <option value="webp">WebP (Preserves Transparency)</option>
                    </select>
                  </label>
                </div>
              </div>

              {/* Compression Results */}
              {images.some(img => img.compressedFile) ? (
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
                      <span className="result-value success">{stats.saved} ({stats.savedPercent}%)</span>
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
                disabled={images.every(img => img.compressedFile && !settingsChanged) || images.some(img => img.isCompressing)}
              >
                {images.some(img => img.isCompressing) ? 'Compressing...' : 'Compress All'}
              </button>
              <button 
                className="btn upload"
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= MAX_IMAGES}
              >
                Add More Images
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInput}
                style={{ display: 'none' }}
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
            <h3>Images ({images.length}/{MAX_IMAGES})</h3>
            <div className="image-grid">
              {images.map((img) => (
                <div key={img.id} className="image-card">
                  <div className="image-header">
                    <h4>{img.file.name}</h4>
                    <button 
                      className="btn-remove"
                      onClick={() => removeImage(img.id)}
                      title="Remove image"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>

                  <div className="image-preview">
                    <img 
                      src={previewOriginalId === img.id ? img.originalUrl : (img.compressedUrl || img.originalUrl)} 
                      alt={img.file.name}
                      onPointerDown={() => img.compressedFile && handlePreviewStart(img.id)}
                      onPointerUp={handlePreviewEnd}
                      onPointerLeave={handlePreviewEnd}
                    />
                    {img.compressedFile && (
                      <div className="preview-toggle">
                        <span>Hold to view original</span>
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
                      <span>{img.originalDimensions.width} × {img.originalDimensions.height}</span>
                    </div>
                    {img.compressedFile && (
                      <>
                        <div className="info-row">
                          <span>Compressed:</span>
                          <span>{formatFileSize(img.compressedSize!)}</span>
                        </div>
                        <div className="info-row">
                          <span>Saved:</span>
                          <span>{getCompressionRatio(img.originalSize, img.compressedSize!)}%</span>
                        </div>
                      </>
                    )}
                  </div>

                  {img.error && (
                    <div className="error-message">
                      {img.error}
                    </div>
                  )}
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


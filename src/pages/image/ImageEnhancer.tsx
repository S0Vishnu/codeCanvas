import React, { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import Controls from "../../modules/imageEnhancer/Controls";
import "../../styles/ImageEnhancer.css";

export type ImageEnhancerProps = {
    src?: string;
    width?: number;
    height?: number;
    maintainAspect?: boolean;
    onExport?: (dataUrl: string) => void;
    initial?: Partial<{
        brightness: number;
        contrast: number;
        saturation: number;
        rotate: number;
        flipH: boolean;
        flipV: boolean;
        zoom: number;
        filter: FilterName;
        cropRatio: number | null;
    }>;
    className?: string;
};

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const defaultState = (initial?: ImageEnhancerProps["initial"]): EditState => ({
    brightness: initial?.brightness ?? 0,
    contrast: initial?.contrast ?? 0,
    saturation: initial?.saturation ?? 0,
    rotate: initial?.rotate ?? 0,
    flipH: initial?.flipH ?? false,
    flipV: initial?.flipV ?? false,
    zoom: initial?.zoom ?? 1,
    filter: initial?.filter ?? "none",
    crop: null,
});

export const ImageEnhancer: React.FC<ImageEnhancerProps> = ({
    src,
    width = 800,
    height = 600,
    maintainAspect = true,
    onExport,
    initial,
    className,
}) => {
    const [currentSrc, setCurrentSrc] = useState(src || "");
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
    const [state, setState] = useState<EditState>(() => defaultState(initial));
    const [history, setHistory] = useState<EditState[]>([]);
    const [future, setFuture] = useState<EditState[]>([]);
    const [isPanning, setIsPanning] = useState(false);
    const panRef = useRef({ x: 0, y: 0 });
    const panStartRef = useRef<{ x: number; y: number } | null>(null);
    const offsetRef = useRef({ x: 0, y: 0 });

    // Load image
    useEffect(() => {
        if (!currentSrc) return;
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            imageRef.current = img;
            setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
            setLoaded(true);
        };
        img.onerror = () => {
            console.error("Failed loading image", currentSrc);
            setLoaded(false);
        };
        img.src = currentSrc;
        setState(defaultState(initial));
        setHistory([]);
        setFuture([]);
        offsetRef.current = { x: 0, y: 0 };
        panRef.current = { x: 0, y: 0 };
    }, [currentSrc, initial]);

    // Upload handler
    const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === "string") {
                    setCurrentSrc(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // History manager
    const pushHistory = useCallback(
        (next: EditState) => {
            setHistory((h) => {
                const newH = [...h, state];
                if (newH.length > 50) newH.shift();
                return newH;
            });
            setFuture([]);
            setState(next);
        },
        [state]
    );

    const handleUndo = useCallback(() => {
        setHistory((h) => {
            if (h.length === 0) return h;
            const prev = h[h.length - 1];
            setFuture((f) => [state, ...f]);
            setState(prev);
            return h.slice(0, -1);
        });
    }, [state]);

    const handleRedo = useCallback(() => {
        setFuture((f) => {
            if (f.length === 0) return f;
            const next = f[0];
            setHistory((h) => [...h, state]);
            setState(next);
            return f.slice(1);
        });
    }, [state]);

    // draw routine
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (!canvas || !img) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // compute canvas size
        let cW = width;
        let cH = height;
        if (maintainAspect && naturalSize) {
            const ratio = naturalSize.w / naturalSize.h;
            // fit inside width x height preserving aspect
            if (width / height > ratio) {
                cH = height;
                cW = Math.round(height * ratio);
            } else {
                cW = width;
                cH = Math.round(width / ratio);
            }
        }
        canvas.width = cW;
        canvas.height = cH;

        // clear
        ctx.clearRect(0, 0, cW, cH);

        // save and transform (rotate/flip/zoom/pan)
        ctx.save();

        // Center
        ctx.translate(cW / 2 + offsetRef.current.x, cH / 2 + offsetRef.current.y);

        // rotation
        const rad = (state.rotate * Math.PI) / 180;
        ctx.rotate(rad);

        // flips
        const scaleX = state.flipH ? -1 : 1;
        const scaleY = state.flipV ? -1 : 1;
        ctx.scale(scaleX * state.zoom, scaleY * state.zoom);

        // apply filters using ctx.filter (modern browsers)
        // build CSS filter string
        const filters = [
            `brightness(${100 + clamp(state.brightness, -100, 100)}%)`,
            `contrast(${100 + clamp(state.contrast, -100, 100)}%)`,
            `saturate(${100 + clamp(state.saturation, -100, 100)}%)`,
        ].join(" ");

        // additional effects (grayscale/sepia)
        let extras = "";
        if (state.filter === "grayscale") extras += " grayscale(100%)";
        if (state.filter === "sepia") extras += " sepia(100%)";

        ctx.filter = filters + extras;

        // draw image centered at 0,0
        const drawW = cW;
        const drawH = cH;
        // We'll draw using the image natural dimensions scaled to canvas dimensions
        // compute image draw size to fill canvas (cover-like)
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = cW / cH;
        let renderW = drawW;
        let renderH = drawH;
        if (imgRatio > canvasRatio) {
            // image wider than canvas -> match height
            renderH = drawH;
            renderW = imgRatio * renderH;
        } else {
            renderW = drawW;
            renderH = renderW / imgRatio;
        }

        ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH);

        ctx.restore();

        // If a crop box is set, draw overlay (visual only)
        if (state.crop) {
            ctx.save();
            ctx.strokeStyle = "rgba(255,255,255,0.9)";
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.strokeRect(state.crop.x, state.crop.y, state.crop.w, state.crop.h);
            ctx.restore();
        }
    }, [state, width, height, naturalSize, maintainAspect]);

    // redraw when state or image loads
    useEffect(() => {
        draw();
    }, [draw, loaded, state]);

    // pan handlers (mouse)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const onDown = (e: MouseEvent) => {
            if (e.button !== 0) return;
            setIsPanning(true);
            panStartRef.current = { x: e.clientX, y: e.clientY };
        };
        const onMove = (e: MouseEvent) => {
            if (!isPanning || !panStartRef.current) return;
            const dx = e.clientX - panStartRef.current.x;
            const dy = e.clientY - panStartRef.current.y;
            offsetRef.current = { x: panRef.current.x + dx, y: panRef.current.y + dy };
            draw();
        };
        const onUp = () => {
            if (!isPanning) return;
            setIsPanning(false);
            panRef.current = { ...offsetRef.current };
            panStartRef.current = null;
        };

        canvas.addEventListener("mousedown", onDown);
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => {
            canvas.removeEventListener("mousedown", onDown);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
    }, [isPanning, draw]);

    // wheel to zoom
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.05 : 0.05;
            const nextZoom = clamp(state.zoom + delta, 0.1, 10);
            const next = { ...state, zoom: nextZoom };
            pushHistory(next);
        };
        canvas.addEventListener("wheel", onWheel, { passive: false });
        return () => canvas.removeEventListener("wheel", onWheel);
    }, [state, pushHistory]);

    // export image (applies crop if set and returns dataURL)
    const exportImage = useCallback(
        (type: "download" | "dataUrl" = "download", filename = "edited.png") => {
            const canvas = document.createElement("canvas");
            const displayCanvas = canvasRef.current;
            if (!displayCanvas || !imageRef.current) return;
            // If crop exists, set canvas to crop size otherwise use display size
            const crop = state.crop;
            const srcW = displayCanvas.width;
            const srcH = displayCanvas.height;

            if (crop) {
                canvas.width = Math.round(crop.w);
                canvas.height = Math.round(crop.h);
            } else {
                canvas.width = srcW;
                canvas.height = srcH;
            }

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.drawImage(displayCanvas, crop ? -crop.x : 0, crop ? -crop.y : 0);

            const dataUrl = canvas.toDataURL("image/png");
            if (type === "download") {
                const a = document.createElement("a");
                a.href = dataUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
            if (onExport) onExport(dataUrl);
            if (type === "dataUrl") return dataUrl;
            return undefined;
        },
        [state.crop, onExport]
    );

    const handleReset = useCallback(() => {
        const resetState = defaultState(initial);
        setState(resetState);
        setHistory([]);
        setFuture([]);
        offsetRef.current = { x: 0, y: 0 };
        panRef.current = { x: 0, y: 0 };
        panStartRef.current = null;
        draw();
    }, [initial, draw]);

    // simple crop setter (centered default)
    const setCropCentered = useCallback(
        (ratio: number | null) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            if (!ratio) {
                pushHistory({ ...state, crop: null });
                return;
            }
            const cW = canvas.width;
            const cH = canvas.height;
            let w = cW;
            let h = Math.round(w / ratio);
            if (h > cH) {
                h = cH;
                w = Math.round(h * ratio);
            }
            const x = Math.round((cW - w) / 2);
            const y = Math.round((cH - h) / 2);
            pushHistory({ ...state, crop: { x, y, w, h } });
        },
        [state, pushHistory]
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const observer = new ResizeObserver(() => {
            draw(); // re-run draw with new dimensions
        });

        observer.observe(canvas.parentElement as HTMLElement);

        return () => {
            observer.disconnect();
        };
    }, [draw]);

    return (
        <div className={`page-container flex-row gap-lg items-start ${className ?? ""}`}>
            <div
                className={`flex-1 glass-panel p-6 min-h-[500px] flex-center relative overflow-hidden ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                            if (typeof reader.result === "string") {
                                setCurrentSrc(reader.result);
                            }
                        };
                        reader.readAsDataURL(file);
                    }
                }}
            >
                <canvas
                    ref={canvasRef}
                    aria-label="Image editor canvas"
                    role="img"
                    className="max-w-full h-auto rounded-lg"
                />

                {/* Centered upload */}
                {!currentSrc && (
                    <label className="upload-zone w-full h-full border-none shadow-none bg-transparent">
                        <div className="flex-col flex-center">
                            <div className="upload-icon">📁</div>
                            <span className="text-lg font-semibold text-white mb-2">Click or Drag & Drop an image</span>
                            <span className="text-sm text-secondary">Supports JPG, PNG, WebP</span>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleUpload}
                            className="hidden"
                        />
                    </label>
                )}
            </div>
            <Controls
                state={state}
                onChangeField={(k, v) => pushHistory({ ...state, [k]: v })}
                onSliderChange={(k, v) => pushHistory({ ...state, [k]: clamp(v, -100, 100) })}
                onToggleFlip={(axis) =>
                    pushHistory({
                        ...state,
                        flipH: axis === "H" ? !state.flipH : state.flipH,
                        flipV: axis === "V" ? !state.flipV : state.flipV,
                    })
                }
                onRotate={(deg) => pushHistory({ ...state, rotate: (state.rotate + deg) % 360 })}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={history.length > 0}
                canRedo={future.length > 0}
                onZoom={(z) => pushHistory({ ...state, zoom: clamp(z, 0.1, 10) })}
                onExport={() => exportImage("download")}
                onExportDataUrl={() => exportImage("dataUrl")}
                onSetCropRatio={setCropCentered}
                onReset={handleReset}
            />
        </div>
    );
};

export default ImageEnhancer;

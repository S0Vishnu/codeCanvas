import Dropdown from "../../components/Dropdown";

type ControlsProps = {
    state: EditState;
    onChangeField: <K extends keyof EditState>(k: K, v: EditState[K]) => void;
    onSliderChange: (k: "brightness" | "contrast" | "saturation", v: number) => void;
    onToggleFlip: (axis: "H" | "V") => void;
    onRotate: (deg: number) => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onZoom: (z: number) => void;
    onExport: () => void;
    onExportDataUrl: () => string | undefined;
    onSetCropRatio: (ratio: number | null) => void;
    onReset: () => void;
};

const Controls: React.FC<ControlsProps> = ({
    state,
    onChangeField,
    onSliderChange,
    onToggleFlip,
    onRotate,
    onUndo,
    onRedo,
    onReset,
    canUndo,
    canRedo,
    onZoom,
    onExport,
    onExportDataUrl,
    onSetCropRatio,
}) => {
    return (
        <div className="glass-card w-[320px] min-w-[320px] p-6 flex-col gap-md h-fit">
            <h3 className="text-xl font-bold mb-2">Edit</h3>

            <div className="flex-col gap-sm">
                <strong className="label-text">Filter</strong>
                <Dropdown
                    options={[
                        { label: "None", value: "none" },
                        { label: "Grayscale", value: "grayscale" },
                        { label: "Sepia", value: "sepia" },
                    ]}
                    value={state.filter}
                    onChange={(val) => onChangeField("filter", val as FilterName)}
                    placeholder="Select filter"
                    closeOnSelect
                />
            </div>

            <div className="flex-col gap-sm">
                <label className="label-text flex-row justify-between">
                    Brightness <span className="text-primary">{state.brightness}</span>
                </label>
                <input
                    type="range"
                    min={-100}
                    max={100}
                    value={state.brightness}
                    onChange={(e) => onSliderChange("brightness", Number(e.target.value))}
                />
            </div>

            <div className="flex-col gap-sm">
                <label className="label-text flex-row justify-between">
                    Contrast <span className="text-primary">{state.contrast}</span>
                </label>
                <input
                    type="range"
                    min={-100}
                    max={100}
                    value={state.contrast}
                    onChange={(e) => onSliderChange("contrast", Number(e.target.value))}
                />
            </div>

            <div className="flex-col gap-sm">
                <label className="label-text flex-row justify-between">
                    Saturation <span className="text-primary">{state.saturation}</span>
                </label>
                <input
                    type="range"
                    min={-100}
                    max={100}
                    value={state.saturation}
                    onChange={(e) => onSliderChange("saturation", Number(e.target.value))}
                />
            </div>

            <div className="flex-col gap-sm">
                <label className="label-text flex-row justify-between">
                    Zoom <span className="text-primary">{state.zoom.toFixed(2)}x</span>
                </label>
                <input
                    type="range"
                    min={0.1}
                    max={3}
                    step={0.01}
                    value={state.zoom}
                    onChange={(e) => onZoom(Number(e.target.value))}
                />
            </div>

            <div className="flex-col gap-sm">
                <strong className="label-text">Rotate & Flip</strong>
                <div className="grid grid-cols-4 gap-2">
                    <button className="btn-base btn-primary text-xl px-2 py-2" onClick={() => onRotate(-90)} title="Rotate Left">⟲</button>
                    <button className="btn-base btn-primary text-xl px-2 py-2" onClick={() => onRotate(90)} title="Rotate Right">⟳</button>
                    <button className="btn-base btn-primary text-xl px-2 py-2" onClick={() => onToggleFlip("H")} title="Flip Horizontal">⇋</button>
                    <button className="btn-base btn-primary text-xl px-2 py-2" onClick={() => onToggleFlip("V")} title="Flip Vertical">⇵</button>
                </div>
            </div>

            <div className="flex-col gap-sm">
                <strong className="label-text">Crop</strong>
                <div className="grid grid-cols-4 gap-2">
                    <button className="btn-base bg-slate-700 hover:bg-slate-600 text-xs px-1" onClick={() => onSetCropRatio(null)}>Off</button>
                    <button className="btn-base bg-slate-700 hover:bg-slate-600 text-xs px-1" onClick={() => onSetCropRatio(1)}>1:1</button>
                    <button className="btn-base bg-slate-700 hover:bg-slate-600 text-xs px-1" onClick={() => onSetCropRatio(4 / 3)}>4:3</button>
                    <button className="btn-base bg-slate-700 hover:bg-slate-600 text-xs px-1" onClick={() => onSetCropRatio(16 / 9)}>16:9</button>
                </div>
            </div>

            <div className="flex-row gap-sm pt-4 border-t border-white/10">
                <button className="btn-base flex-1 bg-slate-700 hover:bg-slate-600" onClick={onUndo} disabled={!canUndo}>Undo</button>
                <button className="btn-base flex-1 bg-slate-700 hover:bg-slate-600" onClick={onRedo} disabled={!canRedo}>Redo</button>
                <button className="btn-base flex-1 btn-danger" onClick={onReset}>Reset</button>
            </div>

            <div className="flex-col gap-sm mt-2">
                <button className="btn-base btn-success w-full" onClick={onExport}>Download Image</button>
            </div>
        </div>
    );
};

export default Controls;

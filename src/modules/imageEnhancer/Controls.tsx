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
        <div className="controls-panel">
            <h3 className="controls-title">Edit</h3>

            <strong className="header">Filter</strong>
            <div className="control-group">
                <label>
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
                </label>
            </div>

            <div className="control-group">
                <label>Brightness {state.brightness}</label>
                <input
                    type="range"
                    min={-100}
                    max={100}
                    value={state.brightness}
                    onChange={(e) => onSliderChange("brightness", Number(e.target.value))}
                />
            </div>

            <div className="control-group">
                <label>Contrast {state.contrast}</label>
                <input
                    type="range"
                    min={-100}
                    max={100}
                    value={state.contrast}
                    onChange={(e) => onSliderChange("contrast", Number(e.target.value))}
                />
            </div>

            <div className="control-group">
                <label>Saturation {state.saturation}</label>
                <input
                    type="range"
                    min={-100}
                    max={100}
                    value={state.saturation}
                    onChange={(e) => onSliderChange("saturation", Number(e.target.value))}
                />
            </div>

            <div className="control-group">
                <label>Zoom</label>
                <input
                    type="range"
                    min={0.1}
                    max={3}
                    step={0.01}
                    value={state.zoom}
                    onChange={(e) => onZoom(Number(e.target.value))}
                />
            </div>

            <strong className="header">RotateFlip</strong>
            <div className="button-row">
                <button type="button" onClick={() => onRotate(-90)} aria-label="Rotate left">
                    ⟲
                </button>
                <button type="button" onClick={() => onRotate(90)} aria-label="Rotate right">
                    ⟳
                </button>
                <button
                    type="button"
                    onClick={() => onToggleFlip("H")}
                    aria-label="Flip horizontal"
                >
                    ⇋
                </button>
                <button type="button" onClick={() => onToggleFlip("V")} aria-label="Flip vertical">
                    ⇵
                </button>
            </div>

            <div className="control-group">
                <strong>Crop</strong>
                <div className="button-row">
                    <button onClick={() => onSetCropRatio(null)}>Off</button>
                    <button onClick={() => onSetCropRatio(1)}>1:1</button>
                    <button onClick={() => onSetCropRatio(4 / 3)}>4:3</button>
                    <button onClick={() => onSetCropRatio(16 / 9)}>16:9</button>
                </div>
            </div>

            <div className="button-row">
                <button onClick={onUndo} disabled={!canUndo}>
                    Undo
                </button>
                <button onClick={onRedo} disabled={!canRedo}>
                    Redo
                </button>
                <button onClick={onReset}>Reset</button>
            </div>

            <div className="button-row">
                <button onClick={onExport}>Download</button>
                <button
                    onClick={() => {
                        const url = onExportDataUrl();
                        if (url) {
                            const w = window.open();
                            if (w) w.document.write(`<img src="${url}" alt="export"/>`);
                        }
                    }}
                >
                    Show dataUrl
                </button>
            </div>
        </div>
    );
};

export default Controls;

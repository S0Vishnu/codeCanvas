import { useRef } from "react";
import type { Asset } from "../store/useAssetStore";
import img from "../../../assets/icons/arrow.svg";

type TransformField = "position" | "rotation" | "scale";

const AxisInput = ({
  axis,
  asset,
  property,
  handleInputChange,
}: {
  axis: "x" | "y" | "z";
  asset: Asset;
  property: TransformField;
  handleInputChange: (
    id: string,
    field: TransformField,
    axis: "x" | "y" | "z",
    value: number
  ) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(asset.transform[property][axis]);

  const handlePointerDown = async () => {
    if (!document.body.requestPointerLock) return;
    valueRef.current = asset.transform[property][axis];
    document.body.requestPointerLock();

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.movementX;
      const sensitivity = 0.01;
      const newValue = valueRef.current + delta * sensitivity;
      handleInputChange(
        asset.id,
        property,
        axis,
        parseFloat(newValue.toFixed(2))
      );
    };

    const handlePointerUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handlePointerUp);
      document.exitPointerLock?.();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handlePointerUp);
  };

  return (
    <div className="input-with-dragger-container">
      <input
        ref={inputRef}
        type="number"
        step={0.1}
        value={asset.transform[property][axis]}
        onChange={(e) => {
          handleInputChange(
            asset.id,
            property,
            axis as "x" | "y" | "z",
            parseFloat(e.target.value) || 0
          );
        }}
      />
      <div className="dragger" onPointerDown={handlePointerDown}>
        <img src={img} alt="" />
      </div>
    </div>
  );
};

export default AxisInput;

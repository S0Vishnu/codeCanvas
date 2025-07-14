import { Vector3 } from "three";
import { useAssetStore } from "./store/useAssetStore";
import AssetUploader from "./assetsHandler/AssetUploader";
import AxisInput from "./components/AxisInput";

const axisMap = { x: 0, y: 1, z: 2 } as const;

const Properties = () => {
  const { assets, updateAssetTransform, selectedAssets, handleAssetSelection } =
    useAssetStore();

  const handleInputChange = (
    id: string,
    key: "position" | "rotation" | "scale",
    axis: "x" | "y" | "z",
    value: number
  ) => {
    const asset = assets.find((a) => a.id === id);
    if (!asset) return;

    const vec = new Vector3().copy(asset.transform[key]);
    vec.setComponent(axisMap[axis], value);
    updateAssetTransform(id, key, vec);
  };

  // Get only selected assets
  const selectedAssetObjects = assets.filter((asset) =>
    selectedAssets.includes(asset.id)
  );

  return (
    <div className="properties-pannel">
      <AssetUploader />
      <div className="properties-pannel__header">
        <h2>Scene Properties</h2>
      </div>

      {/* Asset List */}
      <div className="asset-list">
        <h3>Assets</h3>
        <ul>
          {assets.map((asset) => (
            <li
              key={asset.id}
              className={selectedAssets.includes(asset.id) ? "selected" : ""}
              onClick={(e) => handleAssetSelection(asset.id, e.shiftKey)}
            >
              {asset.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Properties for Selected Assets */}
      {selectedAssetObjects.length > 0 ? (
        <div className="selected-properties">
          <p className="header">Selected Properties</p>
          {selectedAssetObjects.map((asset) => (
            <div key={asset.id} className="asset-properties">
              <h4 className="asset-name">Name : {asset.name.split(".")[0]}</h4>
              <div className="asset-property-input-container">
                <div className="title">Position:</div>
                {["x", "y", "z"].map((axis) => (
                  <AxisInput
                    axis={axis as "x" | "y" | "z"}
                    asset={asset}
                    property={'position'}
                    handleInputChange={handleInputChange}
                  />
                ))}
              </div>
              <div className="asset-property-input-container">
                <div className="title">Rotation:</div>
                {["x", "y", "z"].map((axis) => (
                  <AxisInput
                    axis={axis as "x" | "y" | "z"}
                    asset={asset}
                    property={'rotation'}
                    handleInputChange={handleInputChange}
                  />
                ))}
              </div>
              <div className="asset-property-input-container">
                <div className="title">Scale:</div>
                {["x", "y", "z"].map((axis) => (
                  <AxisInput
                    axis={axis as "x" | "y" | "z"}
                    asset={asset}
                    property={'scale'}
                    handleInputChange={handleInputChange}
                  />
                ))}
              </div>
              {asset.animations && asset.animations?.length > 0 && (
                <div>
                  Animations:
                  <ul>
                    {asset.animations.map((anim, i) => (
                      <li key={i}>{anim.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="no-selected-properties">No asset selected</p>
      )}
    </div>
  );
};

export default Properties;

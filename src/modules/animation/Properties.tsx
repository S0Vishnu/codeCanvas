import { Vector3 } from "three";
import { useAssetStore } from "./store/useAssetStore";
import AssetUploader from "./assetsHandler/AssetUploader";

const axisMap = { x: 0, y: 1, z: 2 } as const;

const Properties = () => {
  const {
    assets,
    updateAssetTransform,
    selectedAssets,
    handleAssetSelection,
  } = useAssetStore();

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
          <h3>Selected Properties</h3>
          {selectedAssetObjects.map((asset) => (
            <div key={asset.id} className="asset-properties">
              <h4>{asset.name}</h4>
              <div>
                Position:
                {["x", "y", "z"].map((axis) => (
                  <input
                    key={axis}
                    type="number"
                    step="0.1"
                    value={asset.transform.position[axis as "x" | "y" | "z"]}
                    onChange={(e) =>
                      handleInputChange(
                        asset.id,
                        "position",
                        axis as "x" | "y" | "z",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                ))}
              </div>
              <div>
                Rotation:
                {["x", "y", "z"].map((axis) => (
                  <input
                    key={axis}
                    type="number"
                    step="0.1"
                    value={asset.transform.rotation[axis as "x" | "y" | "z"]}
                    onChange={(e) =>
                      handleInputChange(
                        asset.id,
                        "rotation",
                        axis as "x" | "y" | "z",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                ))}
              </div>
              <div>
                Scale:
                {["x", "y", "z"].map((axis) => (
                  <input
                    key={axis}
                    type="number"
                    step="0.1"
                    value={asset.transform.scale[axis as "x" | "y" | "z"]}
                    onChange={(e) =>
                      handleInputChange(
                        asset.id,
                        "scale",
                        axis as "x" | "y" | "z",
                        parseFloat(e.target.value) || 0
                      )
                    }
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
        <p>No asset selected</p>
      )}
    </div>
  );
};

export default Properties;

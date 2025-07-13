import { Vector3 } from "three";
import { useAssetStore } from "./store/useAssetStore";
import AssetUploader from "./assetsHandler/AssetUploader";

const axisMap = { x: 0, y: 1, z: 2 } as const;

const Properties = () => {
  const { assets, updateAssetTransform } = useAssetStore();

  const handleInputChange = (
    id: string,
    key: "position" | "rotation" | "scale",
    axis: "x" | "y" | "z",
    value: number
  ) => {
    const asset = assets.find((a) => a.id === id);
    if (!asset) return;

    const vec = new Vector3().copy(asset.transform[key]);
    vec.setComponent(axisMap[axis], value); // Safe axis mapping

    updateAssetTransform(id, key, vec);
  };

  return (
    <div className="properties-pannel">
      <AssetUploader />
      <div className="properties-pannel__header">
        <h2>Scene Properties</h2>
      </div>
      <ul>
        {assets.map((asset) => (
          <li key={asset.id}>
            <strong>{asset.name}</strong>
            <div>
              Position:
              {["x", "y", "z"].map((axis) => (
                <input
                  key={axis}
                  type="number"
                  value={asset.transform.position[axis as "x" | "y" | "z"]}
                  onChange={(e) =>
                    handleInputChange(
                      asset.id,
                      "position",
                      axis as "x" | "y" | "z",
                      parseFloat(e.target.value)
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
                  value={asset.transform.rotation[axis as "x" | "y" | "z"]}
                  onChange={(e) =>
                    handleInputChange(
                      asset.id,
                      "rotation",
                      axis as "x" | "y" | "z",
                      parseFloat(e.target.value)
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
                  value={asset.transform.scale[axis as "x" | "y" | "z"]}
                  onChange={(e) =>
                    handleInputChange(
                      asset.id,
                      "scale",
                      axis as "x" | "y" | "z",
                      parseFloat(e.target.value)
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
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Properties;

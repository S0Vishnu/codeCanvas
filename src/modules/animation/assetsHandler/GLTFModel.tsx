import React, {
  useEffect,
  useRef,
  useImperativeHandle,
} from "react";
import { useGLTF } from "@react-three/drei";
import { Group } from "three";
import type { Asset } from "../store/useAssetStore";

const GLTFModel = React.forwardRef<Group, { asset: Asset; isSelected: boolean }>(
  ({ asset }, ref) => {
    const { scene } = useGLTF(asset.url);
    const group = useRef<Group>(scene); // point directly to loaded scene

    useEffect(() => {
      group.current.position.copy(asset.transform.position);
      const r = asset.transform.rotation;
      group.current.rotation.set(r.x, r.y, r.z);
      group.current.scale.copy(asset.transform.scale);

      // Make children selectable and assign IDs
      group.current.traverse((child) => {
        child.userData.selectable = true;
        child.userData.id = asset.id;
      });
    }, [asset]);

    useImperativeHandle(ref, () => group.current);

    return (
      <primitive object={group.current} />
    );
  }
);

export default GLTFModel;

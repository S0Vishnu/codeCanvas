import React, {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  Suspense,
} from "react";
import { Group } from "three";
import { useGLTF } from "@react-three/drei";
import { getGLTFById } from "../utils/indexedDb";
import type { Asset } from "../store/useAssetStore";

// Subcomponent: only mounts when blobUrl is valid
const GLTFWrapper = React.forwardRef<Group, { asset: Asset; blobUrl: string }>(
  ({ asset, blobUrl }, ref) => {
    const group = useRef<Group>(new Group());
    const { scene } = useGLTF(blobUrl, true) as { scene: Group };

    useEffect(() => {
      const cloned = scene.clone();
      group.current.clear();
      group.current.add(cloned);

      group.current.position.copy(asset.transform.position);
      group.current.rotation.set(
        asset.transform.rotation.x,
        asset.transform.rotation.y,
        asset.transform.rotation.z
      );
      group.current.scale.copy(asset.transform.scale);
      // group.current
      group.current.userData.id = asset.id;

      console.log("group.current: ", group.current);

      group.current.traverse((child) => {
        child.userData.selectable = true;
        child.userData.id = asset.id;
      });

      return () => {
        group.current.remove(cloned);
        URL.revokeObjectURL(blobUrl);
      };
    }, [scene]);

    useImperativeHandle(ref, () => group.current);

    return <primitive object={group.current} />;
  }
);

const GLTFModel = React.forwardRef<Group, { asset: Asset }>(
  ({ asset }, ref) => {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      (async () => {
        try {
          const result = await getGLTFById(asset.id);
          if (!result?.buffer) throw new Error("Missing buffer");
          const url = URL.createObjectURL(new Blob([result.buffer]));
          setBlobUrl(url);
        } catch (e) {
          console.error(e);
          setError("Failed to load GLTF");
        }
      })();
    }, [asset.id]);

    if (error) {
      return (
        <mesh
          position={[
            asset.transform.position.x,
            asset.transform.position.y,
            asset.transform.position.z,
          ]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>
      );
    }

    if (!blobUrl) {
      return (
        <mesh
          position={[
            asset.transform.position.x,
            asset.transform.position.y,
            asset.transform.position.z,
          ]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="gray" />
        </mesh>
      );
    }

    return (
      <Suspense fallback={null}>
        <GLTFWrapper asset={asset} blobUrl={blobUrl} ref={ref} />
      </Suspense>
    );
  }
);

export default GLTFModel;

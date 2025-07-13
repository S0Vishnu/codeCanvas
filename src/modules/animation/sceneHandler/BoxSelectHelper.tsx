import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { Box3, Mesh, Object3D, Vector3 } from "three";

function isMesh(object: Object3D): object is Mesh {
  return (object as Mesh).isMesh !== undefined;
}

const BoxSelectHelper = ({
  domRect,
  onSelect,
}: {
  domRect: DOMRect | null;
  onSelect: (ids: string[]) => void;
}) => {
  const { scene, camera, gl } = useThree();

  useEffect(() => {
    if (!domRect) return;

    const selectedIds: string[] = [];
    const width = gl.domElement.clientWidth;
    const height = gl.domElement.clientHeight;

    scene.traverse((obj) => {
      if (!obj.userData.selectable || !isMesh(obj)) return;
      const center = new Vector3();
      new Box3().setFromObject(obj).getCenter(center);
      const projected = center.clone().project(camera);

      const screenX = (projected.x + 1) * 0.5 * width;
      const screenY = (-projected.y + 1) * 0.5 * height;

      if (
        screenX >= domRect.left &&
        screenX <= domRect.right &&
        screenY >= domRect.top &&
        screenY <= domRect.bottom
      ) {
        selectedIds.push(obj.userData.id); // Use your asset's ID
      }
    });

    onSelect(selectedIds);
  }, [domRect]);

  return null;
};

export default BoxSelectHelper;

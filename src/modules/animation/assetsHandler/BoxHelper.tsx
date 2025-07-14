import { useEffect, useRef } from "react";
import { BoxHelper, Group, Color } from "three";
import { useThree, useFrame } from "@react-three/fiber";

const BoundingBox = ({ object }: { object: Group }) => {
  const helperRef = useRef<BoxHelper | null>(null);
  const { scene } = useThree();

  useEffect(() => {
    if (!object) return;

    const helper = new BoxHelper(object, new Color("blue"));
    helperRef.current = helper;
    scene.add(helper);

    return () => {
      scene.remove(helper);
    };
  }, [object, scene]);

  useFrame(() => {
    if (helperRef.current) {
      helperRef.current.update();
    }
  });

  return null;
};

export default BoundingBox;

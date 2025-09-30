import { Environment } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { SRGBColorSpace, TextureLoader } from "three";
import bg from "./assets/sky_27_2k.webp";

const PostProcessing = () => {
    const texture = useLoader(TextureLoader, bg);
    texture.colorSpace = SRGBColorSpace;

    return (
        <>
            <Environment map={texture} background />
        </>
    );
};

export default PostProcessing;

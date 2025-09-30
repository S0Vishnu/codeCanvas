import { Environment } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { SRGBColorSpace, TextureLoader } from "three";
// import {
//     EffectComposer,
//     Scanline,
//     Sepia,
//     Vignette,
// } from "@react-three/postprocessing";
// import { BlendFunction } from "postprocessing";

import bg from "./assets/sky_27_2k.webp";

const PostProcessing = () => {
    const texture = useLoader(TextureLoader, bg);
    texture.colorSpace = SRGBColorSpace;

    return (
        <>
            {/* Background Environment */}
            <Environment map={texture} background />

            {/* Postprocessing pipeline */}
            {/* <EffectComposer>
                <Sepia intensity={1.0} blendFunction={BlendFunction.NORMAL} />
                <Vignette
                    offset={0.5}
                    darkness={0.5}
                    eskil={false}
                    blendFunction={BlendFunction.NORMAL}
                />
                <Scanline
                    blendFunction={BlendFunction.OVERLAY}
                    density={1}
                />
            </EffectComposer> */}
        </>
    );
};

export default PostProcessing;

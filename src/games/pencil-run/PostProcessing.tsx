import { Environment } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { SRGBColorSpace, TextureLoader } from "three";
import { BrightnessContrast, EffectComposer, HueSaturation, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

import bg from "./assets/sky_27_2k.webp";

const PostProcessing = () => {
    const texture = useLoader(TextureLoader, bg);
    texture.colorSpace = SRGBColorSpace;

    return (
        <>
            {/* Background Environment */}
            <Environment map={texture} background />

            <EffectComposer>
                {/* Dark edges for depth */}
                <Vignette
                    offset={0.3} // tighter vignette
                    darkness={0.8} // stronger vignette
                    eskil={false}
                    blendFunction={BlendFunction.NORMAL}
                />

                {/* Punch up saturation */}
                <HueSaturation
                    hue={0.05} // slight warm shift
                    saturation={0.4} // bold colors
                />

                {/* High contrast pop */}
                <BrightnessContrast
                    brightness={0.05} // slight lift
                    contrast={0.15} // strong contrast
                />
            </EffectComposer>
        </>
    );
};

export default PostProcessing;

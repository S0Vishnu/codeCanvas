import { CameraShake, Environment, Stars } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { SRGBColorSpace, TextureLoader } from "three";
import { Bloom, BrightnessContrast, EffectComposer, HueSaturation, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

import bg from "../assets/sky_27_2k.webp";

const PostProcessing = () => {
    const texture = useLoader(TextureLoader, bg);
    texture.colorSpace = SRGBColorSpace;
    const config = {
        maxYaw: 0.1,
        maxPitch: 0.1,
        maxRoll: 0.1,
        yawFrequency: 0.1,
        pitchFrequency: 0.1,
        rollFrequency: 0.1,
        intensity: 1,
        decay: false,
        decayRate: 0.65,
        controls: undefined,
    }

    return (
        <>
            {/* Background Environment */}
            <Environment preset="night" />

            <CameraShake {...config} />

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

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

                <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} intensity={1.5} />
            </EffectComposer>
        </>
    );
};

export default PostProcessing;

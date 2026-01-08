import Properties from "../../modules/animation/Properties";
import Scene from "../../modules/animation/Scene";

const AnimationEditor = () => {
    return (
        <div className="animation-editor">
            <div className="animation-layout">
                <div className="animation-scene-container">
                    <Scene />
                    {/* <KeyframeEditor /> */}
                </div>
                <Properties />
            </div>
        </div>
    );
};

export default AnimationEditor;

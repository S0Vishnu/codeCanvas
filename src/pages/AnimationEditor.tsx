import KeyframeEditor from "../modules/animation/KeyframeEditor";
import Properties from "../modules/animation/Properties";
import Scene from "../modules/animation/Scene";
import "../styles/AnimationEditor.css";

const AnimationEditor = () => {
  return (
    <div className="animation-editor">
      <div className="container-2">
        <div className="container-1">
          <Scene />
          <KeyframeEditor />
        </div>
        <Properties />
      </div>
    </div>
  );
};

export default AnimationEditor;

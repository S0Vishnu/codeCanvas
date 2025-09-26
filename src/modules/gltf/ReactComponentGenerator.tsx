import { useState } from "react";

type ReactComponentCodeProps = {
  url: string;
};

const ReactComponentGenerator = ({ url }: ReactComponentCodeProps) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [copied, setCopied] = useState<"none" | "plain" | "typed">("none");

  // Generates plain React component string
  const generatePlainComponent = () => `
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

export default function Model() {
  const { scene } = useGLTF("${url}", true);
  return <primitive object={scene} />;
}

`;

  // Generates typed TypeScript React component string
  const generateTypedComponent = () => `
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

type UploadedModelProps = { url: string };

export default function Model({ url }: UploadedModelProps) {
  const { scene } = useGLTF(url, true) as { scene: THREE.Group };
  return <primitive object={scene} />;
}
`;

  const copyToClipboard = (text: string, type: "plain" | "typed") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied("none"), 2000);
  };

  return (
    <>
      <button
        className="btn generate-btn"
        onClick={() => setShowOverlay(true)}
      >
        Generate React Component
      </button>

      {showOverlay && (
        <div className="component-overlay">
          <div className="overlay-header">
            <h4>React Component Preview</h4>
            <button
              className="close-btn"
              onClick={() => setShowOverlay(false)}
            >
              ✕
            </button>
          </div>
          <div className="overlay-body">
            <pre>{generatePlainComponent()}</pre>
            <div className="overlay-buttons">
              <button
                onClick={() => copyToClipboard(generatePlainComponent(), "plain")}
              >
                Copy Plain {copied === "plain" && "✓"}
              </button>
              <button
                onClick={() => copyToClipboard(generateTypedComponent(), "typed")}
              >
                Copy With Types {copied === "typed" && "✓"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReactComponentGenerator;

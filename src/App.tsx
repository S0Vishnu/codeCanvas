import { Routes, Route } from "react-router-dom";
import { StringToArrayParser } from "./pages/StringToArrayParser";
import "./App.css";
import Pages from "./Pages";
import HomeButton from "./components/HomeButton";
import AnimationEditor from "./pages/AnimationEditor";
import LiveEditor from "./pages/LiveEditor";
import ImageCompressor from "./pages/ImageCompressor";
import GLTFCompressor from "./pages/GltfCompressor";
import BatchImageConverter from "./pages/ImageConverter";
import ImageEnhancer from "./pages/ImageEnhancer";

function App() {
    return (
        <>
            <HomeButton />
            <Routes>
                <Route path="/" element={<Pages />} />
                <Route path="/parser" element={<StringToArrayParser />} />
                <Route path="/three-js-animator-and-configurer" element={<AnimationEditor />} />
                <Route path="/live-editor" element={<LiveEditor />} />
                <Route path="/image-compressor" element={<ImageCompressor />} />
                <Route path="/gltf-compressor" element={<GLTFCompressor />} />
                <Route path="/image-converter" element={<BatchImageConverter />} />
                <Route
                    path="/image-enhancer"
                    element={
                        <ImageEnhancer
                            src=""
                            width={900}
                            height={600}
                            onExport={(dataUrl) => {
                                console.log("Exported dataUrl length:", dataUrl.length);
                            }}
                            initial={{ zoom: 1, brightness: 0 }}
                        />
                    }
                />
            </Routes>
        </>
    );
}

export default App;

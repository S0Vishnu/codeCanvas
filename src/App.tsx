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
import ChessGame from "./games/Chess";
import PencilRunGame from "./games/pencil-run/PencilRunGame";
import VideoCompressor from "./pages/VideoCompressor";

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
                <Route path="/image-enhancer" element={<ImageEnhancer />} />
                {/* games */}
                <Route path="/chess" element={<ChessGame />} />
                <Route path="/pencil-runner" element={<PencilRunGame />} />
                {/* projects */}
                {/* test */}
                <Route path="/video-compressor" element={<VideoCompressor />} />
            </Routes>
        </>
    );
}

export default App;

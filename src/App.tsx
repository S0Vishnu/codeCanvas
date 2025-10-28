import { Routes, Route } from "react-router-dom";
import "./App.css";

// 🏠 Core Pages
import Pages from "./Pages";
import HomeButton from "./components/HomeButton";

// 🧩 Code Tools
import LiveEditor from "./pages/code/LiveEditor";
import { StringToArrayParser } from "./pages/code/StringToArrayParser";

// 🖼️ Image Tools
import BatchImageConverter from "./pages/image/ImageConverter";
import ImageCompressor from "./pages/image/ImageCompressor";
import ImageEnhancer from "./pages/image/ImageEnhancer";

// 🧱 GLTF / 3D Tools
import AnimationEditor from "./pages/gltf/AnimationEditor";
import GLTFCompressor from "./pages/gltf/GltfCompressor";

// 🧾 Text Utilities
import { CaseConverter } from "./pages/text/CaseConverter";
import { DiffChecker } from "./pages/text/DiffChecker";
import { DuplicateRemover } from "./pages/text/DuplicateRemover";
import { FindReplace } from "./pages/text/FindReplace";
import { LoremGenerator } from "./pages/text/LoremGenerator";
import { RandomDataGenerator } from "./pages/text/RandomDataGenerator";
import { TextSorter } from "./pages/text/TextSorter";
import { WordCounter } from "./pages/text/WordCounter";

// 🎮 Games
import ChessGame from "./games/Chess";
import PencilRunGame from "./games/pencil-run/PencilRunGame";

// 🎬 Video Tools
import VideoCompressor from "./pages/VideoCompressor";
import { ToastProvider } from "./providers/ToastContext";
import { ToastContainer } from "./components/Toast";

function App() {
    return (
        <>
            <HomeButton />
            <ToastProvider>
                <ToastContainer />
                <Routes>
                    {/* === HOME === */}
                    <Route path="/" element={<Pages />} />

                    {/* === CODE TOOLS === */}
                    <Route path="/parser" element={<StringToArrayParser />} />
                    <Route path="/live-editor" element={<LiveEditor />} />

                    {/* === IMAGE TOOLS === */}
                    <Route path="/image-compressor" element={<ImageCompressor />} />
                    <Route path="/image-enhancer" element={<ImageEnhancer />} />
                    <Route path="/image-converter" element={<BatchImageConverter />} />

                    {/* === GLTF / 3D TOOLS === */}
                    <Route path="/gltf-compressor" element={<GLTFCompressor />} />
                    <Route path="/three-js-animator-and-configurer" element={<AnimationEditor />} />

                    {/* === TEXT UTILITIES === */}
                    <Route path="/text/case-converter" element={<CaseConverter />} />
                    <Route path="/text/diff-checker" element={<DiffChecker />} />
                    <Route path="/text/duplicate-remover" element={<DuplicateRemover />} />
                    <Route path="/text/find-replace" element={<FindReplace />} />
                    <Route path="/text/lorem-generator" element={<LoremGenerator />} />
                    <Route path="/text/random-data-generator" element={<RandomDataGenerator />} />
                    <Route path="/text/text-sorter" element={<TextSorter />} />
                    <Route path="/text/word-counter" element={<WordCounter />} />

                    {/* === GAMES === */}
                    <Route path="/chess" element={<ChessGame />} />
                    <Route path="/pencil-runner" element={<PencilRunGame />} />

                    {/* === VIDEO TOOLS === */}
                    <Route path="/video-compressor" element={<VideoCompressor />} />

                    {/* === FALLBACK === */}
                    <Route
                        path="*"
                        element={
                            <div style={{ padding: "2rem", textAlign: "center", color: "#999" }}>
                                404 - Page Not Found
                            </div>
                        }
                    />
                </Routes>
            </ToastProvider>
        </>
    );
}

export default App;

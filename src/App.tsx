import { Routes, Route } from "react-router-dom";
import { StringToArrayParser } from "./pages/StringToArrayParser";
import "./App.css";
import Pages from "./Pages";
import HomeButton from "./components/HomeButton";
import AnimationEditor from "./pages/AnimationEditor";
import LiveEditor from "./pages/LiveEditor";
import ImageCompressor from "./pages/ImageCompressor";
import GLTFCompressor from "./pages/GltfCompressor";

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
      </Routes>
    </>
  );
}

export default App;

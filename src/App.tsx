import { Routes, Route } from "react-router-dom";
import { StringToArrayParser } from "./pages/StringToArrayParser";
import "./App.css";
import Pages from "./Pages";
import HomeButton from "./components/HomeButton";
import AnimationEditor from "./pages/AnimationEditor";
import LiveEditor from "./pages/LiveEditor";

function App() {
  return (
    <>
      <HomeButton />
      <Routes>
        <Route path="/" element={<Pages />} />
        <Route path="/parser" element={<StringToArrayParser />} />
        <Route path="/three-js-animator-and-configurer" element={<AnimationEditor />} />
        <Route path="/live-editor" element={<LiveEditor />} />
      </Routes>
    </>
  );
}

export default App;

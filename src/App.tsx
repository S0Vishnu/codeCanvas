import { Routes, Route } from "react-router-dom";
import Cursor from "./components/Cursor";
import { StringToArrayParser } from "./pages/StringToArrayParser";
import "./App.css";
import Pages from "./Pages";
import HomeButton from "./components/HomeButton";
import AnimationEditor from "./pages/AnimationEditor";

function App() {
  return (
    <>
      <Cursor />
      <HomeButton />
      <Routes>
        <Route path="/" element={<Pages />} />
        <Route path="/parser" element={<StringToArrayParser />} />
        <Route path="/three-js-animator-and-configurer" element={<AnimationEditor />} />
      </Routes>
    </>
  );
}

export default App;

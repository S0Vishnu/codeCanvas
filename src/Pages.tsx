import { useNavigate } from "react-router-dom";
import Cursor from "./components/Cursor";

const Pages = () => {
  const navigate = useNavigate();

  const links = [
    { name: "Parser - String to JSON", path: "/parser" },
    {
      name: "Three.js Animator and Configurer",
      path: "/three-js-animator-and-configurer",
    },
    // add more links here
    { name: "Live HTML Editor", path: "/live-editor" },
    { name: "Image Compressor", path: "/image-compressor" },
  ];

  return (
    <div style={{ padding: "2rem" }}>
      <Cursor />
      <h1>Pages</h1>
      <ul style={{ listStyle: "none", padding: 0, marginTop: "40px" }}>
        {links.map((link) => (
          <li key={link.path} style={{ marginBottom: "1rem" }}>
            <button onClick={() => navigate(link.path)}>{link.name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Pages;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cursor from "./components/Cursor";
import "./styles/main/Page.css";

interface LinkItem {
    name: string;
    path: string;
    beta?: boolean;
    thumbnail: string; // thumbnail image URL
}

const Pages = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

    const links: LinkItem[] = [
        {
            name: "Parser - String to JSON",
            path: "/parser",
            thumbnail: "/thumbnails/parser.jpeg",
        },
        {
            name: "Three.js Animator and Configurer",
            path: "/three-js-animator-and-configurer",
            beta: true,
            thumbnail: "/thumbnails/threejs.jpeg",
        },
        { name: "Live HTML Editor", path: "/live-editor", thumbnail: "/thumbnails/html.jpeg" },
        {
            name: "Image Compressor",
            path: "/image-compressor",
            thumbnail: "/thumbnails/compressor.jpeg",
        },
        {
            name: "Gltf/Glb Compressor",
            path: "/gltf-compressor",
            thumbnail: "/thumbnails/gltf.jpeg",
        },
        {
            name: "Image Converter",
            path: "/image-converter",
            thumbnail: "/thumbnails/converter.jpeg",
        },
    ];

    const filteredLinks = links.filter((link) =>
        link.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="dashboard-container">
            <Cursor />
            <h1 className="dashboard-title">
                Tools Dashboard
                <input
                    type="text"
                    placeholder="Search pages..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="dashboard-search"
                />
            </h1>

            <div className="cards-grid">
                {filteredLinks.map((link) => (
                    <button
                        key={link.path}
                        className="dashboard-card"
                        onClick={() => navigate(link.path)}
                    >
                        {link.beta && <span className="beta-tag">Beta</span>}
                        <img src={link.thumbnail} alt={link.name} className="card-thumbnail" />
                        <p className="card-title">{link.name}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Pages;

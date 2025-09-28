import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cursor from "./components/Cursor";
import "./styles/main/Page.css";

interface LinkItem {
    name: string;
    path: string;
    category: "Tools" | "Games" | "Projects";
    beta?: boolean;
    thumbnail?: string;
}

const Pages = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<"Tools" | "Games" | "Projects">("Tools");

    const links: LinkItem[] = [
        {
            name: "Parser - String to JSON",
            path: "/parser",
            category: "Tools",
            thumbnail: "/thumbnails/parser.jpeg",
        },
        {
            name: "Three.js Animator and Configurer",
            path: "/three-js-animator-and-configurer",
            category: "Tools",
            beta: true,
            thumbnail: "/thumbnails/threejs.jpeg",
        },
        {
            name: "Live HTML Editor",
            path: "/live-editor",
            category: "Tools",
            thumbnail: "/thumbnails/html.jpeg",
        },
        {
            name: "Image Compressor",
            path: "/image-compressor",
            category: "Tools",
            thumbnail: "/thumbnails/compressor.jpeg",
        },
        {
            name: "Gltf/Glb Compressor",
            path: "/gltf-compressor",
            category: "Tools",
            beta: true,
            thumbnail: "/thumbnails/gltf.jpeg",
        },
        {
            name: "Image Converter",
            path: "/image-converter",
            category: "Tools",
            thumbnail: "/thumbnails/converter.jpeg",
        },
        {
            name: "Image Enhancer",
            path: "/image-enhancer",
            category: "Tools",
            thumbnail: "/thumbnails/enhancer.png",
        },
        // Projects (Coming Soon)
        { name: "Coming Soon", path: "/", category: "Projects" },
        // Games
        {
            name: "Chess",
            path: "/chess",
            category: "Games",
            thumbnail: "/thumbnails/chess.png",
        },
        { name: "Coming Soon", path: "/", category: "Games" },
    ];

    const filteredLinks = links.filter(
        (link) =>
            link.category === activeCategory &&
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

            {/* Category Toggle */}
            <div className="category-toggle">
                {(["Tools", "Games", "Projects"] as const).map((cat) => (
                    <button
                        key={cat}
                        className={`category-btn ${activeCategory === cat ? "active" : ""}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="cards-grid">
                {filteredLinks.map((link) => (
                    <button
                        key={link.name}
                        className="dashboard-card"
                        onClick={() => navigate(link.path)}
                    >
                        {link.beta && <span className="beta-tag">Beta</span>}
                        {link.thumbnail && (
                            <img src={link.thumbnail} alt={link.name} className="card-thumbnail" />
                        )}
                        <p className="card-title">{link.name}</p>
                        {link.path === "/coming-soon" && (
                            <span className="coming-soon-tag">Coming Soon</span>
                        )}
                    </button>
                ))}
                {filteredLinks.length === 0 && <p className="no-results">No pages found</p>}
            </div>
        </div>
    );
};

export default Pages;

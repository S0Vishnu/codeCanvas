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
    openinNewTab?: boolean;
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
            thumbnail: "/thumbnails/parser.webp",
        },
        {
            name: "Three.js Animator and Configurer",
            path: "/three-js-animator-and-configurer",
            category: "Tools",
            beta: true,
            thumbnail: "/thumbnails/threejs.webp",
        },
        {
            name: "Live HTML Editor",
            path: "/live-editor",
            category: "Tools",
            thumbnail: "/thumbnails/html.webp",
        },
        {
            name: "Image Compressor",
            path: "/image-compressor",
            category: "Tools",
            thumbnail: "/thumbnails/compressor.webp",
        },
        {
            name: "Gltf/Glb Compressor",
            path: "/gltf-compressor",
            category: "Tools",
            beta: true,
            thumbnail: "/thumbnails/gltf.webp",
        },
        {
            name: "Image Converter",
            path: "/image-converter",
            category: "Tools",
            thumbnail: "/thumbnails/converter.webp",
        },
        {
            name: "Image Enhancer",
            path: "/image-enhancer",
            category: "Tools",
            beta: true,
            thumbnail: "/thumbnails/enhancer.webp",
        },
        // Projects (Coming Soon)
        { name: "Coming Soon", path: "/", category: "Projects" },
        // Games
        {
            name: "Chess",
            path: "/chess",
            category: "Games",
            thumbnail: "/thumbnails/chess.webp",
        },
        {
            name: "Fall Guys Clone",
            path: "https://fall-guys-clone.netlify.app/",
            category: "Games",
            thumbnail: "/thumbnails/fall-guys.webp",
            openinNewTab: true,
        },
        {
            name: "Pencil Runner",
            path: "/pencil-runner",
            category: "Games",
            thumbnail: "/thumbnails/pencilRun.webp",
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
                        onClick={() => {
                            if (link.openinNewTab) {
                                window.open(link.path, "_blank");
                            } else {
                                navigate(link.path);
                            }
                        }}
                    >
                        {link.beta && <span className="beta-tag">Beta</span>}
                        {link.thumbnail ? (
                            <img src={link.thumbnail} alt={link.name} className="card-thumbnail" />
                        ):(
                            <img src={'/thumbnails/no-image.webp'} alt={link.name} className="card-thumbnail" />
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

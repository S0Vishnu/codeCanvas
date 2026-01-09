import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    TbLayoutGrid,
    TbPhoto,
    TbTypography,
    TbCube,
    TbDots,
    TbVideo,
    TbTools,
    TbMusic,
    TbFileTypePdf
} from "react-icons/tb";
import Cursor from "./components/Cursor";
import { links, type LinkItem } from "./data/pageLinks";
import { storage } from "./utils/storage";

const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("all")) return <TbLayoutGrid className="icon" size={18} />;
    if (lower.includes("image")) return <TbPhoto className="icon" size={18} />;
    if (lower.includes("text")) return <TbTypography className="icon" size={18} />;
    if (lower.includes("3d") || lower.includes("gltf")) return <TbCube className="icon" size={18} />;
    if (lower.includes("video")) return <TbVideo className="icon" size={18} />;
    if (lower.includes("audio")) return <TbMusic className="icon" size={18} />;
    if (lower.includes("pdf")) return <TbFileTypePdf className="icon" size={18} />;
    if (lower.includes("other")) return <TbDots className="icon" size={18} />;
    return <TbTools className="icon" size={18} />;
};

const Pages = () => {
    const navigate = useNavigate();

    // === State with persistence ===
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<"Tools" | "Games" | "Projects">(() =>
        storage.get("dashboard-active-category", "Tools")
    );
    const [activeSubcategory, setActiveSubcategory] = useState<"All Tools" | string>(() =>
        storage.get("dashboard-active-subcategory", "All Tools")
    );

    // === Persist category and subcategory selections ===
    useEffect(() => {
        storage.set("dashboard-active-category", activeCategory);
    }, [activeCategory]);

    useEffect(() => {
        storage.set("dashboard-active-subcategory", activeSubcategory);
    }, [activeSubcategory]);

    const filteredLinks = links.filter(
        (link) =>
            link.category === activeCategory &&
            link.name.toLowerCase().includes(search.toLowerCase())
    );

    const toolSubcategories = Array.from(
        new Set(links.filter((l) => l.category === "Tools").map((l) => l.subcategory))
    ).filter(Boolean) as NonNullable<LinkItem["subcategory"]>[];

    const displayedTools =
        activeSubcategory === "All Tools"
            ? filteredLinks
            : filteredLinks.filter((l) => l.subcategory === activeSubcategory);

    return (
        <div className="page-container">
            <Cursor />

            <h1 className="page-header">
                Tools Dashboard
                <input
                    type="text"
                    placeholder="Search pages..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field"
                />
            </h1>

            {/* Category Toggle */}
            <div className="flex-row gap-sm mb-lg flex-wrap">
                {(["Tools", "Games", "Projects"] as const).map((cat) => (
                    <button
                        key={cat}
                        className={`btn-base ${activeCategory === cat ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => {
                            setActiveCategory(cat);
                            setActiveSubcategory("All Tools");
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* === Tools View with Sidebar === */}
            {activeCategory === "Tools" ? (
                <div className="dashboard-layout">
                    {/* Sidebar */}
                    <aside className="sidebar">
                        <h3 className="sidebar-title">Categories</h3>
                        <div className="sidebar-list">
                            <button
                                className={`sidebar-item ${activeSubcategory === "All Tools" ? "active" : ""
                                    }`}
                                onClick={() => setActiveSubcategory("All Tools")}
                            >
                                <TbLayoutGrid className="icon" size={18} />
                                <span>All Tools</span>
                            </button>
                            {toolSubcategories.map((subcat) => (
                                <button
                                    key={subcat}
                                    className={`sidebar-item ${activeSubcategory === subcat ? "active" : ""
                                        }`}
                                    onClick={() => setActiveSubcategory(subcat)}
                                >
                                    {getCategoryIcon(subcat)}
                                    <span>{subcat}</span>
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="dashboard-main-content">
                        <div className="cards-grid">
                            {displayedTools.map((link) => (
                                <button
                                    key={link.name}
                                    className="dashboard-card"
                                    onClick={() =>
                                        link.openinNewTab
                                            ? window.open(link.path, "_blank")
                                            : navigate(link.path)
                                    }
                                >
                                    <img
                                        src={link.thumbnail || "/thumbnails/no-image.webp"}
                                        alt={link.name}
                                        className="card-thumbnail"
                                    />
                                    <p className="card-title">{link.name}</p>
                                </button>
                            ))}
                            {displayedTools.length === 0 && (
                                <p className="no-results">No pages found</p>
                            )}
                        </div>
                    </main>
                </div>
            ) : (
                // === Games / Projects ===
                <div className="cards-grid">
                    {filteredLinks.map((link) => (
                        <button
                            key={link.name}
                            className="dashboard-card"
                            onClick={() =>
                                link.openinNewTab
                                    ? window.open(link.path, "_blank")
                                    : navigate(link.path)
                            }
                        >
                            <img
                                src={link.thumbnail || "/thumbnails/no-image.webp"}
                                alt={link.name}
                                className="card-thumbnail"
                            />
                            <p className="card-title">{link.name}</p>
                        </button>
                    ))}
                    {filteredLinks.length === 0 && <p className="no-results">No pages found</p>}
                </div>
            )}
        </div>
    );
};

export default Pages;

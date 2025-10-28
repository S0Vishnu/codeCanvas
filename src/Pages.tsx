import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cursor from "./components/Cursor";
import "./styles/main/Page.css";
import { links, type LinkItem } from "./data/pageLinks";
import { storage } from "./utils/storage";

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
                                className={`sidebar-item ${
                                    activeSubcategory === "All Tools" ? "active" : ""
                                }`}
                                onClick={() => setActiveSubcategory("All Tools")}
                            >
                                All Tools
                            </button>
                            {toolSubcategories.map((subcat) => (
                                <button
                                    key={subcat}
                                    className={`sidebar-item ${
                                        activeSubcategory === subcat ? "active" : ""
                                    }`}
                                    onClick={() => setActiveSubcategory(subcat)}
                                >
                                    {subcat}
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
                                    {link.beta && <span className="beta-tag">Beta</span>}
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
                            {link.beta && <span className="beta-tag">Beta</span>}
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

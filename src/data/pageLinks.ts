export interface LinkItem {
    name: string;
    path: string;
    category: "Tools" | "Games" | "Projects";
    subcategory?: "Image Tools" | "Text Tools" | "3D / GLTF Tools" | "Video" | "Other Tools";
    beta?: boolean;
    thumbnail?: string;
    openinNewTab?: boolean;
}

export const links: LinkItem[] = [
    // === IMAGE TOOLS ===
    {
        name: "Image Compressor",
        path: "/image-compressor",
        category: "Tools",
        subcategory: "Image Tools",
        thumbnail: "/thumbnails/tools/image/compressor.webp",
    },
    {
        name: "Image Converter",
        path: "/image-converter",
        category: "Tools",
        subcategory: "Image Tools",
        thumbnail: "/thumbnails/tools/image/converter.webp",
    },
    {
        name: "Image Enhancer",
        path: "/image-enhancer",
        category: "Tools",
        subcategory: "Image Tools",
        beta: true,
        thumbnail: "/thumbnails/tools/image/enhancer.webp",
    },

    // === TEXT TOOLS ===
    {
        name: "Case Converter",
        path: "/text/case-converter",
        category: "Tools",
        subcategory: "Text Tools",
        thumbnail: "/thumbnails/tools/text/case-converter.webp",
    },
    {
        name: "Diff Checker",
        path: "/text/diff-checker",
        category: "Tools",
        subcategory: "Text Tools",
        thumbnail: "/thumbnails/tools/text/diff-checker.webp",
    },
    {
        name: "Duplicate Remover",
        path: "/text/duplicate-remover",
        category: "Tools",
        subcategory: "Text Tools",
        thumbnail: "/thumbnails/tools/text/duplicate-remover.webp",
    },
    {
        name: "Find & Replace",
        path: "/text/find-replace",
        category: "Tools",
        subcategory: "Text Tools",
        thumbnail: "/thumbnails/tools/text/find-replace.webp",
    },
    {
        name: "Random Data Generator",
        path: "/text/random-data-generator",
        category: "Tools",
        subcategory: "Text Tools",
        thumbnail: "/thumbnails/tools/text/random-data-generator.webp",
    },
    {
        name: "Text Sorter",
        path: "/text/text-sorter",
        category: "Tools",
        subcategory: "Text Tools",
        thumbnail: "/thumbnails/tools/text/text-sorter.webp",
    },
    {
        name: "Word Counter",
        path: "/text/word-counter",
        category: "Tools",
        subcategory: "Text Tools",
        thumbnail: "/thumbnails/tools/text/word-counter.webp",
    },
    {
        name: "Lorem Generator",
        path: "/text/lorem-generator",
        category: "Tools",
        subcategory: "Text Tools",
        thumbnail: "/thumbnails/tools/text/lorem-generator.webp",
    },

    // === 3D / GLTF TOOLS ===
    {
        name: "Three.js Animator and Configurer",
        path: "/three-js-animator-and-configurer",
        category: "Tools",
        subcategory: "3D / GLTF Tools",
        beta: true,
        thumbnail: "/thumbnails/tools/gltf/threejs.webp",
    },
    {
        name: "GLTF / GLB Compressor",
        path: "/gltf-compressor",
        category: "Tools",
        subcategory: "3D / GLTF Tools",
        beta: true,
        thumbnail: "/thumbnails/tools/gltf/gltf.webp",
    },

    // === OTHER TOOLS ===
    {
        name: "Parser - String to JSON",
        path: "/parser",
        category: "Tools",
        subcategory: "Other Tools",
        thumbnail: "/thumbnails/tools/others/parser.webp",
    },
    {
        name: "Live HTML Editor",
        path: "/live-editor",
        category: "Tools",
        subcategory: "Other Tools",
        thumbnail: "/thumbnails/tools/others/html.webp",
    },
    {
        name: "Video Compressor",
        path: "/video-compressor",
        category: "Tools",
        subcategory: "Video",
        thumbnail: "/thumbnails/tools/video/video-compressor.webp",
    },

    // === PROJECTS ===
    { name: "Coming Soon", path: "/", category: "Projects" },

    // === GAMES ===
    {
        name: "Chess",
        path: "/chess",
        category: "Games",
        thumbnail: "/thumbnails/games/chess.webp",
    },
    {
        name: "Fall Guys Clone",
        path: "https://fall-guys-clone.netlify.app/",
        category: "Games",
        thumbnail: "/thumbnails/games/fall-guys.webp",
        openinNewTab: true,
    },
    {
        name: "Pencil Runner",
        path: "/pencil-runner",
        category: "Games",
        thumbnail: "/thumbnails/games/pencilRun.webp",
    },
    { name: "Coming Soon", path: "/", category: "Games" },
];

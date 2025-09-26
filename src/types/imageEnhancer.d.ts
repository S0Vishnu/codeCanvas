type CropBox = { x: number; y: number; w: number; h: number };

type EditState = {
    brightness: number;
    contrast: number;
    saturation: number;
    rotate: number;
    flipH: boolean;
    flipV: boolean;
    zoom: number;
    filter: FilterName;
    crop?: CropBox | null;
};

type FilterName = "none" | "grayscale" | "sepia";


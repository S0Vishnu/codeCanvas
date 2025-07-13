export const setupDeleteKeyHandler = (
  getSelectedIds: () => string[],
  deleteAsset: (id: string) => void
) => {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Delete" || e.key === "Backspace") {
      const selected = getSelectedIds();
      selected.forEach((id) => deleteAsset(id));
    }
  };

  window.addEventListener("keydown", onKeyDown);

  // Cleanup function for manual unbinding (if needed)
  return () => {
    window.removeEventListener("keydown", onKeyDown);
  };
};

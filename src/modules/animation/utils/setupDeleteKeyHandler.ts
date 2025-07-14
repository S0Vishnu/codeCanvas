export const setupDeleteKeyHandler = (
  getSelectedIds: () => string[],
  deleteAsset: (id: string) => Promise<void>
) => {
  const handleKeyDown = async (e: KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      const selectedIds = getSelectedIds();
      if (selectedIds.length > 0) {
        try {
          // Delete all selected assets concurrently
          await Promise.all(selectedIds.map(id => deleteAsset(id)));
        } catch (error) {
          console.error('Error deleting assets:', error);
        }
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Keyboard Navigation Utility for Spreadsheet-like Table Grids
 * 
 * Handles:
 * - Enter: Move focus to input in the same column on the NEXT row.
 * - Shift + Enter: Move focus to input in the same column on the PREVIOUS row.
 * - ArrowDown: Move focus to input in the same column on the NEXT row.
 * - ArrowUp: Move focus to input in the same column on the PREVIOUS row.
 * - ArrowRight: Move focus to next input in the same row (when cursor at end).
 * - ArrowLeft: Move focus to previous input in the same row (when cursor at start).
 */

export function handleGridKeyDown(e, rowIndex, colIndex, totalRows, totalCols, prefix = 'grid', onAddNewRow = null) {
  const { key, shiftKey, target } = e;

  const focusTarget = (r, c) => {
    const selector = `[data-grid-id="${prefix}-${r}-${c}"]`;
    const elem = document.querySelector(selector);
    if (elem) {
      elem.focus();
      if (elem.select && typeof elem.select === 'function') {
        try {
          elem.select();
        } catch (err) {
          // ignore if select not supported on element
        }
      }
    }
  };

  if (key === 'Enter') {
    e.preventDefault();
    if (shiftKey) {
      if (rowIndex > 0) {
        focusTarget(rowIndex - 1, colIndex);
      }
    } else {
      if (rowIndex + 1 < totalRows) {
        focusTarget(rowIndex + 1, colIndex);
      } else if (onAddNewRow) {
        onAddNewRow();
        setTimeout(() => {
          focusTarget(rowIndex + 1, colIndex);
        }, 60);
      }
    }
    return;
  }

  if (key === 'ArrowDown') {
    e.preventDefault();
    if (rowIndex + 1 < totalRows) {
      focusTarget(rowIndex + 1, colIndex);
    } else if (onAddNewRow) {
      onAddNewRow();
      setTimeout(() => {
        focusTarget(rowIndex + 1, colIndex);
      }, 60);
    }
    return;
  }

  if (key === 'ArrowUp') {
    e.preventDefault();
    if (rowIndex > 0) {
      focusTarget(rowIndex - 1, colIndex);
    }
    return;
  }

  if (key === 'ArrowRight') {
    const isAtEnd = target.selectionEnd === target.value?.length || target.selectionEnd === undefined || target.tagName === 'SELECT';
    if (isAtEnd && colIndex + 1 < totalCols) {
      e.preventDefault();
      focusTarget(rowIndex, colIndex + 1);
    }
    return;
  }

  if (key === 'ArrowLeft') {
    const isAtStart = target.selectionStart === 0 || target.selectionStart === undefined || target.tagName === 'SELECT';
    if (isAtStart && colIndex > 0) {
      e.preventDefault();
      focusTarget(rowIndex, colIndex - 1);
    }
    return;
  }
}

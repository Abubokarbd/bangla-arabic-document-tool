
/* =================================
   Page Layout Module
   File: assets/js/page-layout.js
   ================================= */

(function () {
  "use strict";

  const MM_TO_PX = 96 / 25.4;

  const DEFAULT_LAYOUT = {
    paperSize: "A4",
    orientation: "portrait",
    marginTop: 20,
    marginRight: 20,
    marginBottom: 20,
    marginLeft: 20,
    showPageNumbers: false
  };

  let currentLayout = { ...DEFAULT_LAYOUT };

  function getLayout() {
    return { ...currentLayout };
  }

  function getDefaultLayout() {
    return { ...DEFAULT_LAYOUT };
  }

  function updateLayout(changes) {
    if (!changes || typeof changes !== "object") {
      return false;
    }

    const next = { ...currentLayout };

    if (changes.paperSize !== undefined) {
      if (!["A4"].includes(changes.paperSize)) {
        return false;
      }
      next.paperSize = changes.paperSize;
    }

    if (changes.orientation !== undefined) {
      if (!["portrait", "landscape"].includes(changes.orientation)) {
        return false;
      }
      next.orientation = changes.orientation;
    }

    const marginKeys = [
      "marginTop",
      "marginRight",
      "marginBottom",
      "marginLeft"
    ];

    for (const key of marginKeys) {
      if (changes[key] !== undefined) {
        const value = Number(changes[key]);

        if (!Number.isFinite(value) || value < 0 || value > 50) {
          return false;
        }

        next[key] = value;
      }
    }

    if (changes.showPageNumbers !== undefined) {
      if (typeof changes.showPageNumbers !== "boolean") {
        return false;
      }
      next.showPageNumbers = changes.showPageNumbers;
    }

    currentLayout = next;
    return true;
  }

  function getPageDimensions() {
    const a4WidthMm = 210;
    const a4HeightMm = 297;

    const isLandscape = currentLayout.orientation === "landscape";

    const widthMm = isLandscape ? a4HeightMm : a4WidthMm;
    const heightMm = isLandscape ? a4WidthMm : a4HeightMm;

    return {
      widthMm,
      heightMm,
      widthPx: widthMm * MM_TO_PX,
      heightPx: heightMm * MM_TO_PX,
      contentWidthPx:
        (widthMm - currentLayout.marginLeft - currentLayout.marginRight)
        * MM_TO_PX,
      contentHeightPx:
        (heightMm - currentLayout.marginTop - currentLayout.marginBottom)
        * MM_TO_PX
    };
  }

  function resetLayout() {
    currentLayout = { ...DEFAULT_LAYOUT };
    return getLayout();
  }

  window.PageLayout = {
    getLayout,
    getDefaultLayout,
    updateLayout,
    getPageDimensions,
    resetLayout
  };
})();

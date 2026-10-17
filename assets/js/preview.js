
/* =================================
   Document Preview Module
   File: assets/js/preview.js
   ================================= */

(function () {
  "use strict";

  let zoomLevel = 1;

  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 2;
  const ZOOM_STEP = 0.1;

  function getElements() {
    return {
      modal: document.getElementById("preview-modal"),
      previewContent: document.getElementById("preview-content"),
      openButton: document.getElementById("preview-button"),
      closeButton: document.getElementById("close-preview"),
      zoomInButton: document.getElementById("zoom-in"),
      zoomOutButton: document.getElementById("zoom-out"),
      fitButton: document.getElementById("fit-preview")
    };
  }

  function applyZoom() {
    const { previewContent } = getElements();

    if (!previewContent) return;

    previewContent.style.setProperty(
      "--preview-zoom",
      String(zoomLevel)
    );

    previewContent.querySelectorAll(".document-page").forEach((page) => {
      page.style.transform = `scale(${zoomLevel})`;
      page.style.transformOrigin = "top center";
      page.style.marginBottom = `${(zoomLevel - 1) * 100}%`;
    });
  }

  function openPreview() {
    const { modal } = getElements();

    if (!modal) return;

    modal.hidden = false;
    zoomLevel = 1;
    applyZoom();

    document.body.style.overflow = "hidden";
  }

  function closePreview() {
    const { modal } = getElements();

    if (!modal) return;

    modal.hidden = true;
    document.body.style.overflow = "";
  }

  function zoomIn() {
    zoomLevel = Math.min(MAX_ZOOM, zoomLevel + ZOOM_STEP);
    applyZoom();
  }

  function zoomOut() {
    zoomLevel = Math.max(MIN_ZOOM, zoomLevel - ZOOM_STEP);
    applyZoom();
  }

  function fitPreview() {
    zoomLevel = 1;
    applyZoom();

    const { previewContent } = getElements();

    if (previewContent) {
      previewContent.scrollTop = 0;
      previewContent.scrollLeft = 0;
    }
  }

  function initialize() {
    const elements = getElements();

    if (elements.openButton) {
      elements.openButton.addEventListener("click", openPreview);
    }

    if (elements.closeButton) {
      elements.closeButton.addEventListener("click", closePreview);
    }

    if (elements.zoomInButton) {
      elements.zoomInButton.addEventListener("click", zoomIn);
    }

    if (elements.zoomOutButton) {
      elements.zoomOutButton.addEventListener("click", zoomOut);
    }

    if (elements.fitButton) {
      elements.fitButton.addEventListener("click", fitPreview);
    }

    if (elements.modal) {
      elements.modal.addEventListener("click", (event) => {
        if (event.target === elements.modal) {
          closePreview();
        }
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closePreview();
      }
    });
  }

  window.DocumentPreview = {
    open: openPreview,
    close: closePreview,
    zoomIn,
    zoomOut,
    fit: fitPreview,
    applyZoom
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();


/* =================================
   PNG Export Module
   File: assets/js/png-export.js
   ================================= */

(function () {
  "use strict";

  const LIBRARY_URL =
    "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";

  let libraryPromise = null;

  function loadHtml2Canvas() {
    if (window.html2canvas) {
      return Promise.resolve(window.html2canvas);
    }

    if (libraryPromise) {
      return libraryPromise;
    }

    libraryPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");

      script.src = LIBRARY_URL;
      script.async = true;

      script.onload = () => {
        if (window.html2canvas) {
          resolve(window.html2canvas);
        } else {
          reject(new Error("PNG library could not be initialized."));
        }
      };

      script.onerror = () => {
        libraryPromise = null;
        reject(new Error("Could not load the PNG export library."));
      };

      document.head.appendChild(script);
    });

    return libraryPromise;
  }

  function downloadCanvas(canvas, filename) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Could not create the PNG image."));
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);

        resolve();
      }, "image/png");
    });
  }

  function waitForFonts() {
    if (document.fonts && document.fonts.ready) {
      return document.fonts.ready;
    }

    return Promise.resolve();
  }

  async function downloadPNG() {
    const content = document.getElementById("preview-content");

    if (!content) {
      alert("The document preview could not be found.");
      return;
    }

    const pages = Array.from(
      content.querySelectorAll(".document-page")
    );

    const targets = pages.length ? pages : [content];

    if (!content.textContent.trim()) {
      alert("There is no document to export yet.");
      return;
    }

    const button = document.getElementById("download-png");

    if (button) {
      button.disabled = true;
      button.textContent = "Preparing PNG...";
    }

    try {
      const html2canvas = await loadHtml2Canvas();
      await waitForFonts();

      for (let i = 0; i < targets.length; i++) {
        const element = targets[i];

        const canvas = await html2canvas(element, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          logging: false
        });

        const filename = targets.length > 1
          ? `document-page-${i + 1}.png`
          : "document.png";

        await downloadCanvas(canvas, filename);
      }
    } catch (error) {
      console.error("PNG export failed:", error);
      alert(
        "PNG export failed. Please check your internet connection and try again."
      );
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Download PNG";
      }
    }
  }

  function initialize() {
    const button = document.getElementById("download-png");

    if (button) {
      button.addEventListener("click", downloadPNG);
    }
  }

  window.PNGExport = {
    download: downloadPNG
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();

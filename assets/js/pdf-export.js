
/* =================================
   PDF Export Module
   File: assets/js/pdf-export.js

   Exports existing document pages
   without adding duplicate margins.
   ================================= */

(function () {
  "use strict";

  function getPreviewContent() {
    return document.getElementById("preview-content");
  }

  function downloadPDF() {
    const content = getPreviewContent();

    if (!content) {
      alert("The document preview could not be found.");
      return;
    }

    const pages = Array.from(
      content.querySelectorAll(".document-page")
    );

    if (!pages.length || !content.textContent.trim()) {
      alert("There is no document to export yet.");
      return;
    }

    if (typeof window.html2pdf !== "function") {
      alert("PDF library did not load. Please refresh and try again.");
      return;
    }

    const layout = window.PageLayout
      ? window.PageLayout.getLayout()
      : {
          paperSize: "A4",
          orientation: "portrait"
        };

    const orientation =
      layout.orientation === "landscape"
        ? "landscape"
        : "portrait";

    const exportArea = document.createElement("div");

    exportArea.id = "pdf-export-temporary";
    exportArea.style.position = "fixed";
    exportArea.style.left = "-100000px";
    exportArea.style.top = "0";
    exportArea.style.width =
      orientation === "landscape" ? "1122.52px" : "793.70px";
    exportArea.style.margin = "0";
    exportArea.style.padding = "0";
    exportArea.style.background = "#ffffff";
    exportArea.style.color = "#000000";

    pages.forEach(function (originalPage, index) {
      const page = originalPage.cloneNode(true);

      page.style.transform = "none";
      page.style.width =
        orientation === "landscape" ? "1122.52px" : "793.70px";
      page.style.height =
        orientation === "landscape" ? "793.70px" : "1122.52px";
      page.style.minHeight = "0";
      page.style.maxHeight = "none";
      page.style.margin = "0";
      page.style.boxSizing = "border-box";
      page.style.overflow = "hidden";
      page.style.boxShadow = "none";
      page.style.breakInside = "avoid";
      page.style.pageBreakInside = "avoid";
      page.style.breakAfter =
        index < pages.length - 1 ? "page" : "auto";
      page.style.pageBreakAfter =
        index < pages.length - 1 ? "always" : "auto";

      exportArea.appendChild(page);
    });

    document.body.appendChild(exportArea);

    const options = {
      margin: 0,
      filename: "bangla-arabic-document.pdf",
      image: {
        type: "jpeg",
        quality: 1
      },
      html2canvas: {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: orientation,
        compress: true
      },
      pagebreak: {
        mode: ["css"]
      }
    };

    const button = document.getElementById("download-pdf");

    if (button) {
      button.disabled = true;
      button.textContent = "Preparing PDF...";
    }

    function cleanup() {
      exportArea.remove();

      if (button) {
        button.disabled = false;
        button.textContent = "Download PDF";
      }
    }

    window.html2pdf()
      .set(options)
      .from(exportArea)
      .save()
      .then(cleanup)
      .catch(function (error) {
        console.error("PDF export failed:", error);
        cleanup();
        alert("PDF download failed. Please try again.");
      });
  }

  function initialize() {
    const button = document.getElementById("download-pdf");

    if (button && !button.dataset.pdfExportInitialized) {
      button.dataset.pdfExportInitialized = "true";
      button.addEventListener("click", downloadPDF);
    }
  }

  window.PDFExport = {
    download: downloadPDF
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();

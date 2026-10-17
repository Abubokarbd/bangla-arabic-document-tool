
/* =================================
   PDF Export Module
   File: assets/js/pdf-export.js

   Downloads PDF directly.
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

    if (!content.innerHTML.trim()) {
      alert("There is no document to export yet.");
      return;
    }

    if (typeof window.html2pdf !== "function") {
      alert("PDF library did not load. Please refresh the page and try again.");
      return;
    }

    const layout = window.PageLayout
      ? window.PageLayout.getLayout()
      : {
          paperSize: "A4",
          orientation: "portrait",
          marginTop: 20,
          marginRight: 20,
          marginBottom: 20,
          marginLeft: 20
        };

    const pages = content.querySelectorAll(".document-page");

    const paperSize = String(layout.paperSize || "A4").toLowerCase();
    const orientation =
      String(layout.orientation || "portrait").toLowerCase() === "landscape"
        ? "landscape"
        : "portrait";

    const margin = [
      Number(layout.marginTop ?? 20),
      Number(layout.marginRight ?? 20),
      Number(layout.marginBottom ?? 20),
      Number(layout.marginLeft ?? 20)
    ];

    const options = {
      margin: margin,
      filename: "bangla-arabic-document.pdf",
      image: {
        type: "jpeg",
        quality: 0.98
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false
      },
      jsPDF: {
        unit: "mm",
        format: paperSize,
        orientation: orientation
      },
      pagebreak: {
        mode: ["css", "legacy"],
        after: ".document-page"
      }
    };

    const exportArea = document.createElement("div");
    exportArea.style.background = "#ffffff";
    exportArea.style.color = "#000000";
    exportArea.style.width = "100%";

    exportArea.innerHTML = content.innerHTML;

    exportArea.querySelectorAll(".document-page").forEach(function (page) {
      page.style.breakAfter = "page";
      page.style.pageBreakAfter = "always";
      page.style.overflow = "visible";
      page.style.boxSizing = "border-box";
    });

    const lastPage = exportArea.querySelector(".document-page:last-child");

    if (lastPage) {
      lastPage.style.breakAfter = "auto";
      lastPage.style.pageBreakAfter = "auto";
    }

    window.html2pdf()
      .set(options)
      .from(exportArea)
      .save()
      .catch(function (error) {
        console.error("PDF export failed:", error);
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

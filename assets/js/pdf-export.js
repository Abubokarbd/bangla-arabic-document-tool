
/* PDF Export Module */
(function () {
  "use strict";

  const HTML2CANVAS_URL =
    "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";

  function loadScript(url, test) {
    if (test()) return Promise.resolve();

    return new Promise(function (resolve, reject) {
      const script = document.createElement("script");
      script.src = url;
      script.onload = function () {
        if (test()) resolve();
        else reject(new Error("Library failed to initialize."));
      };
      script.onerror = function () {
        reject(new Error("Could not load PDF library."));
      };
      document.head.appendChild(script);
    });
  }

  async function downloadPDF() {
    const content = document.getElementById("preview-content");
    const button = document.getElementById("download-pdf");

    if (!content) {
      alert("Document preview could not be found.");
      return;
    }

    const pages = Array.from(
      content.querySelectorAll(".document-page")
    );

    if (!pages.length || !content.textContent.trim()) {
      alert("There is no document to export.");
      return;
    }

    if (button) {
      button.disabled = true;
      button.textContent = "Preparing PDF...";
    }

    try {
      await loadScript(HTML2CANVAS_URL, function () {
        return typeof window.html2canvas === "function";
      });

      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
        function () {
          return !!(window.jspdf && window.jspdf.jsPDF);
        }
      );

      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      const layout = window.PageLayout
        ? window.PageLayout.getLayout()
        : { orientation: "portrait" };

      const orientation =
        layout.orientation === "landscape"
          ? "landscape"
          : "portrait";

      const PDF = window.jspdf.jsPDF;
      const pdf = new PDF({
        orientation: orientation,
        unit: "mm",
        format: "a4",
        compress: true
      });

      for (let i = 0; i < pages.length; i++) {
        const canvas = await window.html2canvas(pages[i], {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          logging: false,
          scrollX: 0,
          scrollY: 0
        });

        const image = canvas.toDataURL("image/jpeg", 1);

        if (i > 0) {
          pdf.addPage("a4", orientation);
        }

        const width = orientation === "landscape" ? 297 : 210;
        const height = orientation === "landscape" ? 210 : 297;

        pdf.addImage(
          image,
          "JPEG",
          0,
          0,
          width,
          height
        );
      }

      pdf.save("bangla-arabic-document.pdf");
    } catch (error) {
      console.error("PDF export failed:", error);
      alert(
        "PDF export failed. Please refresh the page and try again."
      );
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Download PDF";
      }
    }
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

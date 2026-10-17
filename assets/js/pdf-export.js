
/* =================================
   PDF Export Module
   File: assets/js/pdf-export.js

   Uses the browser's print dialog.
   Users can choose "Save as PDF".
   ================================= */

(function () {
  "use strict";

  function getPreviewContent() {
    return document.getElementById("preview-content");
  }

  function buildPrintDocument(content) {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Please allow pop-ups to export your document.");
      return false;
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
    const documentHTML = content.innerHTML.trim();

    if (!documentHTML) {
      printWindow.close();
      alert("There is no document to export yet.");
      return false;
    }

    const pageHTML = pages.length
      ? documentHTML
      : `<div class="document-page">${documentHTML}</div>`;

    printWindow.document.open();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <title>Document PDF Export</title>

        <style>
          @page {
            size: A4 ${layout.orientation};
            margin:
              ${layout.marginTop}mm
              ${layout.marginRight}mm
              ${layout.marginBottom}mm
              ${layout.marginLeft}mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            color: #000;
            background: #fff;
            font-family: "Times New Roman", serif;
          }

          .document-page {
            width: 100%;
            min-height: 1px;
            background: #fff;
            color: #000;
            overflow-wrap: anywhere;
            break-after: page;
            page-break-after: always;
          }

          .document-page:last-child {
            break-after: auto;
            page-break-after: auto;
          }

          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>

      <body>
        <main id="print-document">${pageHTML}</main>
      </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.onload = function () {
      printWindow.focus();
      printWindow.print();
    };

    return true;
  }

  function downloadPDF() {
    const content = getPreviewContent();

    if (!content) {
      alert("The document preview could not be found.");
      return;
    }

    buildPrintDocument(content);
  }

  function initialize() {
    const button = document.getElementById("download-pdf");

    if (button) {
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

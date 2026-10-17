
/* =================================
   Main Application Controller
   File: assets/js/app.js
   ================================= */

(function () {
  "use strict";

  const MM_TO_PX = 96 / 25.4;

  function getEditor() {
    return document.getElementById("document-text");
  }

  function getPreviewContainer() {
    return document.getElementById("preview-content");
  }

  function getFontSettings() {
    if (window.FontSettings) {
      return window.FontSettings.getSettings();
    }

    return {
      bengali: {
        fontFamily: "SolaimanLipi, serif",
        fontSize: 14
      },
      arabic: {
        fontFamily: '"Times New Roman", serif',
        fontSize: 18
      },
      english: {
        fontFamily: '"Times New Roman", serif',
        fontSize: 12
      }
    };
  }

  function getPageLayout() {
    if (window.PageLayout) {
      return window.PageLayout.getLayout();
    }

    return {
      orientation: "portrait",
      marginTop: 20,
      marginRight: 20,
      marginBottom: 20,
      marginLeft: 20
    };
  }

  function getPageDimensions(layout) {
    const portraitWidth = 210;
    const portraitHeight = 297;

    const landscape = layout.orientation === "landscape";

    const widthMm = landscape ? portraitHeight : portraitWidth;
    const heightMm = landscape ? portraitWidth : portraitHeight;

    return {
      widthPx: widthMm * MM_TO_PX,
      heightPx: heightMm * MM_TO_PX,
      contentHeightPx:
        (heightMm - layout.marginTop - layout.marginBottom) * MM_TO_PX
    };
  }

  function getCharacterLanguage(character) {
    if (window.LanguageDetection) {
      return window.LanguageDetection.detectCharacterLanguage(character);
    }

    return /[\u0980-\u09FF]/.test(character)
      ? "bengali"
      : /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(character)
        ? "arabic"
        : /[A-Za-z]/.test(character)
          ? "english"
          : "other";
  }

  function splitIntoRuns(text) {
    const characters = Array.from(text);
    const runs = [];

    for (let i = 0; i < characters.length; i++) {
      const character = characters[i];
      let language = getCharacterLanguage(character);

      // Keep punctuation and spaces with a neighboring text run.
      if (language === "other") {
        language = runs.length
          ? runs[runs.length - 1].language
          : "other";
      }

      const lastRun = runs[runs.length - 1];

      if (lastRun && lastRun.language === language) {
        lastRun.text += character;
      } else {
        runs.push({ language, text: character });
      }
    }

    return runs;
  }

  function createParagraph(text, settings) {
    const paragraph = document.createElement("p");

    paragraph.style.margin = "0 0 0.65em";
    paragraph.style.padding = "0";
    paragraph.style.whiteSpace = "pre-wrap";
    paragraph.style.overflowWrap = "anywhere";
    paragraph.style.lineHeight = "1.6";

    const runs = splitIntoRuns(text);

    runs.forEach((run) => {
      const span = document.createElement("span");
      const language = settings[run.language]
        ? run.language
        : "english";

      span.textContent = run.text;
      span.style.fontFamily = settings[language].fontFamily;
      span.style.fontSize = settings[language].fontSize + "pt";

      if (language === "arabic") {
        span.lang = "ar";
        span.dir = "rtl";
        span.style.unicodeBidi = "isolate";
      } else if (language === "bengali") {
        span.lang = "bn";
        span.dir = "ltr";
      } else {
        span.lang = "en";
        span.dir = "ltr";
      }

      paragraph.appendChild(span);
    });

    return paragraph;
  }

  function createPage(layout, dimensions, pageNumber) {
    const page = document.createElement("div");

    page.className = "document-page";
    page.dataset.pageNumber = String(pageNumber);

    page.style.width = dimensions.widthPx + "px";
    page.style.height = dimensions.heightPx + "px";
    page.style.boxSizing = "border-box";
    page.style.padding = [
      layout.marginTop,
      layout.marginRight,
      layout.marginBottom,
      layout.marginLeft
    ].map((margin) => margin * MM_TO_PX + "px").join(" ");

    page.style.margin = "0 auto 16px";
    page.style.background = "#ffffff";
    page.style.color = "#000000";
    page.style.overflow = "hidden";
    page.style.position = "relative";
    page.style.boxShadow = "0 2px 10px rgba(0,0,0,0.12)";

    return page;
  }

  function renderDocument() {
    const editor = getEditor();
    const container = getPreviewContainer();

    if (!editor || !container) return;

    const text = editor.value;
    const settings = getFontSettings();
    const layout = getPageLayout();
    const dimensions = getPageDimensions(layout);

    container.replaceChildren();

    if (!text.trim()) return;

    const pageContentHeight = dimensions.contentHeightPx;
    let pageNumber = 1;
    let page = createPage(layout, dimensions, pageNumber);

    container.appendChild(page);

    const lines = text.split("\n");

    lines.forEach((line) => {
      const paragraph = createParagraph(line, settings);

      page.appendChild(paragraph);

      // Move a paragraph to the next page if it overflows
      // and the current page already contains other content.
      if (
        page.scrollHeight > page.clientHeight + 1 &&
        page.children.length > 1
      ) {
        page.removeChild(paragraph);

        pageNumber++;
        page = createPage(layout, dimensions, pageNumber);
        container.appendChild(page);
        page.appendChild(paragraph);
      }
    });

    // Leave enough space for the page's bottom margin.
    container.dataset.pageCount = String(pageNumber);
    container.dataset.contentHeight = String(pageContentHeight);
  }

  function initialize() {
    const editor = getEditor();

    if (!editor) return;

    editor.addEventListener("input", renderDocument);

    // Render existing text if the editor is already populated.
    renderDocument();
  }

  window.DocumentApp = {
    render: renderDocument
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();

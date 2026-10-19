
/* =================================
   Main Application Controller
   File: assets/js/app.js
   ================================= */

(function () {
  "use strict";

  const MM_TO_PX = 96 / 25.4;

  const DEFAULT_FONTS = {
    bengali: 14,
    english: 12,
    arabic: 18
  };

  function $(id) {
    return document.getElementById(id);
  }

  function getEditor() {
    return $("document-text");
  }

  function getFontSettings() {
    return window.FontSettings.getSettings();
  }

  function getLayout() {
    return window.PageLayout.getLayout();
  }

  function updateFontsFromControls() {
    const controls = [
      ["bengali", "bengali-font-size"],
      ["english", "english-font-size"],
      ["arabic", "arabic-font-size"]
    ];

    controls.forEach(([language, id]) => {
      const input = $(id);
      if (!input) return;

      const size = Number(input.value);

      if (Number.isFinite(size) && size >= 6 && size <= 72) {
        window.FontSettings.updateFontSize(language, size);
      }
    });

    renderDocument();
  }

  function updatePageSettings() {
    const orientation = $("page-orientation").value;
    const margin = Number($("page-margin").value);
    const showPageNumbers = $("show-page-numbers").checked;

    if (!Number.isFinite(margin) || margin < 0 || margin > 50) {
      alert("Please enter a margin between 0 and 50 mm.");
      return;
    }

    const success = window.PageLayout.updateLayout({
      orientation,
      marginTop: margin,
      marginRight: margin,
      marginBottom: margin,
      marginLeft: margin,
      showPageNumbers
    });

    if (success) {
      renderDocument();
    }
  }

  function resetFonts() {
    window.FontSettings.resetSettings();

    $("bengali-font-size").value = DEFAULT_FONTS.bengali;
    $("english-font-size").value = DEFAULT_FONTS.english;
    $("arabic-font-size").value = DEFAULT_FONTS.arabic;

    renderDocument();
  }

  function resetPageSettings() {
    window.PageLayout.resetLayout();

    $("page-orientation").value = "portrait";
    $("page-margin").value = 20;
    $("show-page-numbers").checked = false;

    renderDocument();
  }

  function getDimensions(layout) {
    const landscape = layout.orientation === "landscape";
    const widthMm = landscape ? 297 : 210;
    const heightMm = landscape ? 210 : 297;

    return {
      widthPx: widthMm * MM_TO_PX,
      heightPx: heightMm * MM_TO_PX
    };
  }

  function getCharacterLanguage(character) {
    return window.LanguageDetection
      .detectCharacterLanguage(character);
  }

  function splitIntoRuns(text) {
    const characters = Array.from(text);
    const runs = [];

    characters.forEach((character) => {
      let language = getCharacterLanguage(character);

      if (language === "other") {
        language = runs.length
          ? runs[runs.length - 1].language
          : "english";
      }

      const last = runs[runs.length - 1];

      if (last && last.language === language) {
        last.text += character;
      } else {
        runs.push({ language, text: character });
      }
    });

    return runs;
  }

  function createParagraph(text, settings) {
    const paragraph = document.createElement("p");

    paragraph.style.margin = "0 0 0.65em";
    paragraph.style.padding = "0";
    paragraph.style.whiteSpace = "pre-wrap";
    paragraph.style.overflowWrap = "anywhere";
    paragraph.style.lineHeight = "1.6";

    splitIntoRuns(text).forEach((run) => {
      const language = settings[run.language]
        ? run.language
        : "english";

      const span = document.createElement("span");

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
    page.style.flexShrink = "0";
    page.style.padding = [
      layout.marginTop,
      layout.marginRight,
      layout.marginBottom,
      layout.marginLeft
    ].map((value) => value * MM_TO_PX + "px").join(" ");

    page.style.margin = "0 auto 16px";
    page.style.background = "#fff";
    page.style.color = "#000";
    page.style.overflow = "hidden";
    page.style.position = "relative";

    if (layout.showPageNumbers) {
      const number = document.createElement("div");
      number.className = "document-page-number";
      number.textContent = String(pageNumber);
      number.style.position = "absolute";
      number.style.bottom = Math.max(4, layout.marginBottom / 2) * MM_TO_PX + "px";
      number.style.left = "0";
      number.style.right = "0";
      number.style.textAlign = "center";
      number.style.fontSize = "10pt";
      number.style.color = "#555";
      page.appendChild(number);
    }

    return page;
  }

 function renderDocument() {
  const editor = getEditor();
  const container = $("preview-content");

  if (!editor || !container) return;

  const text = editor.value;
  const settings = getFontSettings();
  const layout = getLayout();
  const dimensions = getDimensions(layout);

  container.replaceChildren();

  if (!text.trim()) {
    container.dataset.pageCount = "0";
    return;
  }

  let pageNumber = 1;
  let page = createPage(layout, dimensions, pageNumber);

  container.appendChild(page);

  function createNextPage() {
    pageNumber++;
    page = createPage(layout, dimensions, pageNumber);
    container.appendChild(page);
  }

  function isOverflowing() {
    return page.scrollHeight > page.clientHeight + 1;
  }

  function addLine(line) {
    let paragraph = createParagraph(line, settings);
    page.appendChild(paragraph);

    if (!isOverflowing()) return;

    page.removeChild(paragraph);

    // প্রথমে সম্পূর্ণ অনুচ্ছেদটি নতুন পৃষ্ঠায় নেওয়ার চেষ্টা।
    if (page.querySelector("p")) {
      createNextPage();
      page.appendChild(paragraph);

      if (!isOverflowing()) return;

      page.removeChild(paragraph);
    }

    // দীর্ঘ অনুচ্ছেদ শব্দ অনুযায়ী ছোট অংশে ভাগ করা।
    const tokens = line.match(/\S+\s*|\s+/g) || [""];
    let chunk = "";
    let currentParagraph = null;

    for (const token of tokens) {
      const candidateText = chunk + token;
      const candidate = createParagraph(candidateText, settings);

      if (currentParagraph) {
        page.removeChild(currentParagraph);
      }

      page.appendChild(candidate);

      if (isOverflowing()) {
        page.removeChild(candidate);

        if (chunk) {
          currentParagraph = createParagraph(chunk, settings);
          page.appendChild(currentParagraph);
        }

        createNextPage();

        chunk = token;
        currentParagraph = createParagraph(chunk, settings);
        page.appendChild(currentParagraph);
      } else {
        chunk = candidateText;
        currentParagraph = candidate;
      }
    }
  }

  text.split("\n").forEach(addLine);

  container.dataset.pageCount = String(pageNumber);
}

  function initialize() {
    const editor = getEditor();

    if (!editor) return;

    editor.addEventListener("input", renderDocument);

    [
      "bengali-font-size",
      "english-font-size",
      "arabic-font-size"
    ].forEach((id) => {
      $(id).addEventListener("change", updateFontsFromControls);
    });

    ["page-orientation", "page-margin", "show-page-numbers"]
      .forEach((id) => {
        $(id).addEventListener("change", updatePageSettings);
      });

    $("reset-font-settings").addEventListener("click", resetFonts);
    $("reset-page-settings").addEventListener("click", resetPageSettings);

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

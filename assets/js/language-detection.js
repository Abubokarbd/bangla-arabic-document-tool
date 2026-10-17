
/* =================================
   Language Detection
   File: assets/js/language-detection.js
   ================================= */

(function () {
  "use strict";

  const LANGUAGE_PATTERNS = {
    bengali: /[\u0980-\u09FF]/,
    arabic: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/,
    english: /[A-Za-z]/
  };

  /**
   * Detect languages present in a text string.
   * A single string may contain multiple languages.
   */
  function detectLanguages(text) {
    const value = String(text || "");

    return {
      bengali: LANGUAGE_PATTERNS.bengali.test(value),
      arabic: LANGUAGE_PATTERNS.arabic.test(value),
      english: LANGUAGE_PATTERNS.english.test(value)
    };
  }

  /**
   * Identify the language of an individual character.
   */
  function detectCharacterLanguage(character) {
    if (LANGUAGE_PATTERNS.bengali.test(character)) {
      return "bengali";
    }

    if (LANGUAGE_PATTERNS.arabic.test(character)) {
      return "arabic";
    }

    if (LANGUAGE_PATTERNS.english.test(character)) {
      return "english";
    }

    return "other";
  }

  // Make the functions available to the other app files.
  window.LanguageDetection = {
    detectLanguages,
    detectCharacterLanguage
  };
})();

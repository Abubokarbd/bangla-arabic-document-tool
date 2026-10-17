
/* =================================
   Font Settings Module
   File: assets/js/font-settings.js
   ================================= */

(function () {
  "use strict";

  const DEFAULT_SETTINGS = {
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

  let currentSettings = copySettings(DEFAULT_SETTINGS);

  function copySettings(settings) {
    return JSON.parse(JSON.stringify(settings));
  }

  function getSettings() {
    return copySettings(currentSettings);
  }

  function getDefaultSettings() {
    return copySettings(DEFAULT_SETTINGS);
  }

  function updateFontSize(language, size) {
    if (!Object.prototype.hasOwnProperty.call(
      currentSettings,
      language
    )) {
      return false;
    }

    const fontSize = Number(size);

    if (!Number.isFinite(fontSize) || fontSize < 6 || fontSize > 72) {
      return false;
    }

    currentSettings[language].fontSize = fontSize;
    return true;
  }

  function updateFontFamily(language, fontFamily) {
    if (!Object.prototype.hasOwnProperty.call(
      currentSettings,
      language
    )) {
      return false;
    }

    if (typeof fontFamily !== "string" || !fontFamily.trim()) {
      return false;
    }

    currentSettings[language].fontFamily = fontFamily.trim();
    return true;
  }

  function resetSettings() {
    currentSettings = copySettings(DEFAULT_SETTINGS);
    return getSettings();
  }

  window.FontSettings = {
    getSettings,
    getDefaultSettings,
    updateFontSize,
    updateFontFamily,
    resetSettings
  };
})();

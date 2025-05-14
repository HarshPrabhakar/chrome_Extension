const fontSelect = document.getElementById("fontSelect");
const letterSpacingRange = document.getElementById("letterSpacingRange");
const lineSpacingRange = document.getElementById("lineSpacingRange");
const letterVal = document.getElementById("letterVal");
const lineVal = document.getElementById("lineVal");
const resetBtn = document.getElementById("resetBtn");
const speakBtn = document.getElementById("speakBtn");
const translateBtn = document.getElementById("translateBtn");
const languageSelect = document.getElementById("languageSelect");

fontSelect.addEventListener("change", () => {
  updateStyle({ font: fontSelect.value });
});

letterSpacingRange.addEventListener("input", () => {
  const letterSpacing = letterSpacingRange.value;
  letterVal.textContent = letterSpacing;
  updateStyle({ letterSpacing });
});

lineSpacingRange.addEventListener("input", () => {
  const lineSpacing = lineSpacingRange.value;
  lineVal.textContent = lineSpacing;
  updateStyle({ lineSpacing });
});

resetBtn.addEventListener("click", () => {
  fontSelect.value = "Arial";
  letterSpacingRange.value = 1;
  lineSpacingRange.value = 1.5;
  letterVal.textContent = "1";
  lineVal.textContent = "1.5";
  updateStyle({ reset: true });
});

function updateStyle(changes) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: applyChanges,
      args: [changes]
    });
  });
}

function applyChanges({ font, letterSpacing, lineSpacing, reset }) {
  if (reset) {
    document.body.style.fontFamily = "";
    document.body.style.letterSpacing = "";
    document.body.style.lineHeight = "";
    return;
  }
  if (font) {
    document.body.style.fontFamily = font;
  }
  if (letterSpacing !== undefined) {
    document.body.style.letterSpacing = `${letterSpacing}px`;
  }
  if (lineSpacing !== undefined) {
    document.body.style.lineHeight = lineSpacing;
  }
}

speakBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        const selectedText = window.getSelection().toString();
        if (selectedText.trim()) {
          const utterance = new SpeechSynthesisUtterance(selectedText);
          utterance.lang = "en-US";
          speechSynthesis.speak(utterance);
        } else {
          alert("Please select some text on the page first.");
        }
      }
    });
  });
});

translateBtn.addEventListener("click", () => {
  const targetLang = languageSelect.value;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => window.getSelection().toString(),
    }, (results) => {
      if (!results || !results[0] || !results[0].result) {
        alert("Could not retrieve selected text.");
        return;
      }

      const selectedText = results[0].result.trim();
      if (!selectedText) {
        alert("Please select some text.");
        return;
      }

      chrome.runtime.sendMessage({
        action: "translateText",
        text: selectedText,
        targetLang: targetLang
      }, (response) => {
        if (!response) {
          alert("No response from background script.");
        } else if (response.error) {
          alert("Translation failed: " + response.error);
        } else {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            args: [response.translated],
            func: (translated) => {
              try {
                const range = window.getSelection().getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(translated));
              } catch (e) {
                alert("Failed to insert translated text.");
              }
            }
          });
        }
      });
    });
  });
});

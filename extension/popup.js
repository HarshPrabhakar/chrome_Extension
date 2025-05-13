const fontSelect = document.getElementById("fontSelect");
const letterSpacingRange = document.getElementById("letterSpacingRange");
const lineSpacingRange = document.getElementById("lineSpacingRange");
const letterVal = document.getElementById("letterVal");
const lineVal = document.getElementById("lineVal");
const resetBtn = document.getElementById("resetBtn");
const speakBtn = document.getElementById("speakBtn");

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

speakBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        const selectedText = window.getSelection().toString();
        if (selectedText) {
          const utterance = new SpeechSynthesisUtterance(selectedText);
          speechSynthesis.speak(utterance);
        } else {
          alert("Please select some text on the page.");
        }
      }
    });
  });
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

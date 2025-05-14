chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "translateText") {
    fetch("http://localhost:5000/translate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    q: request.text,
    source: "auto",
    target: request.targetLang,
    format: "text"
  })
})

    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      sendResponse({ translated: data.translatedText });
    })
    .catch(err => {
      console.error("Translation fetch failed:", err);
      sendResponse({ error: "Network error or endpoint unreachable" });
    });

    return true;
  }
});

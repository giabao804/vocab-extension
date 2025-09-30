// Create/refresh the context menu on install and on browser startup
function setupContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "saveWord",
      title: "Save",
      contexts: ["selection"] // only shows when text is selected
    });
  });
}

chrome.runtime.onInstalled.addListener(setupContextMenu);
chrome.runtime.onStartup.addListener(setupContextMenu);

// Save selected word/phrase
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "saveWord" || !info.selectionText) return;

  const word = info.selectionText.trim();
  if (!word) return;
  if (word.length > 5000) return;

  chrome.storage.local.get({ words: [] }, (result) => {
    const set = new Set(result.words || []);
    set.add(word);
    chrome.storage.local.set({ words: Array.from(set) }, () => {
      console.log("✅ Saved word:", word);
      console.log("📂 Current word list:", Array.from(set));
    });
  });
});


// Export as TXT and clear
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action !== "export") return;

  chrome.storage.local.get({ words: [] }, (result) => {
    const words = Array.isArray(result.words) ? result.words : [];
    const content = words.join("\n");

    // Encode content into a data URL
    const url = "data:text/plain;charset=utf-8," + encodeURIComponent(content);

    // Extract date for filename when saving
    const date = new Date().toISOString().split("T")[0];
    const filename = `vocabulary_${date}.txt`;

    chrome.downloads.download({ url, filename }, () => {
      if (chrome.runtime.lastError) {
        console.error("❌ Download error:", chrome.runtime.lastError);
        sendResponse({ ok: false, error: chrome.runtime.lastError.message });
        return;
      }

      // Clear list after successful download
      chrome.storage.local.set({ words: [] }, () => {
        sendResponse({ ok: true, count: words.length });
      });
    });
  });

  // Keep the channel open for async sendResponse
  return true;
});

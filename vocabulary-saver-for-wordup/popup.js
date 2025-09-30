document.getElementById('export').addEventListener('click', function () {
  chrome.runtime.sendMessage({ action: 'export' }, function (response) {
    const statusEl = document.getElementById('status');

    if (chrome.runtime.lastError) {
      statusEl.textContent = "❌ Error: " + chrome.runtime.lastError.message;
      statusEl.style.color = "red";
      return;
    }

    if (response && response.ok) {
      if (response.count > 0) {
        statusEl.textContent = `✅ Exported ${response.count} words to vocabulary.txt`;
        statusEl.style.color = "green";
      } else {
        statusEl.textContent = "⚠️ No words to export";
        statusEl.style.color = "orange";
      }
    } else {
      statusEl.textContent = "❌ Failed to export";
      statusEl.style.color = "red";
    }
  });
});

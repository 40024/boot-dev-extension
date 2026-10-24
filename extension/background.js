
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    if (message.type !== "SYNC_CODE") return;

    fetch("http://127.0.0.1:8765/code", {
        method: "POST",
        headers: { "Content-Type": "text/plain", "X-Sync-Token": "af79848bb6d5b2a1ee7114033ba52a4788daa41bf9103144736a47f6a3e5e047" },
        body: message.code
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            console.log("[Go Sync] Code updated successfully");
            sendResponse({ success: true });
        })
        .catch(error => {
            console.error("[Go Sync] Request failed:", error);
            sendResponse({ success: false, error: error.message });
        });

    return true;
});

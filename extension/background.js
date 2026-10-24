
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type !== "SYNC_CODE") return;

    fetch("http://127.0.0.1:8765/code", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
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

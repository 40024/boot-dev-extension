(() => {
    const SELECTOR = '[aria-label="Code editor"]';

    let lastCode = "";
    let inFlightCode = "";
    let timer;
    let lastUrl = location.href;

    console.log("[Go Sync] Extension script loaded:", lastUrl);

    function syncCode() {
        const editor = document.querySelector(SELECTOR);

        if (!editor) {
            console.log("[Go Sync] No editor found yet");
            return;
        }

        const code = [...editor.querySelectorAll(".cm-line")]
            .map(line => line.textContent)
            .join("\n");

        if (!code.trim() || code === lastCode || code === inFlightCode) {
            return;
        }

        inFlightCode = code;
        console.log("[Go Sync] Sending code:", code.length, "characters");
        console.log("[Go Sync] Extracted code:\n" + code);

        chrome.runtime.sendMessage(
            { type: "SYNC_CODE", code },
            response => {
                if (chrome.runtime.lastError) {
                    console.error(
                        "[Go Sync] Extension messaging failed:",
                        chrome.runtime.lastError.message
                    );
                    return;
                }

                if (response?.success) {
                    lastCode = code;
                    console.log("[Go Sync] Code updated successfully");
                } else {
                    console.error("[Go Sync] Sync failed:", response?.error);
                }
            }
        );
    }

    function scheduleSync() {
        clearTimeout(timer);
        timer = setTimeout(syncCode, 400);
    }

    // Watch DOM for changes
    const observer = new MutationObserver(scheduleSync);

    observer.observe(document.documentElement, {
        subtree: true,
        childList: true,
        characterData: true
    });

    // Detect navigation in Boot.dev's SPA
    setInterval(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            lastCode = "";

            console.log("[Go Sync] Page moved:", lastUrl);
            scheduleSync();
        }
    }, 500);

    scheduleSync();
})();

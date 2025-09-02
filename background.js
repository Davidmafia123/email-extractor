chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle command to inject the content script
  if (message.command === 'extract') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab && activeTab.id) {
        chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          files: ['content.js']
        });
      } else {
        console.error("Could not find active tab to inject script.");
      }
    });
    return true; // Indicates an asynchronous response
  }

  // Handle results coming back from the content script
  if (message.command === 'extraction_complete') {
    // Forward the results to the popup
    chrome.runtime.sendMessage({
        command: 'display_results',
        emails: message.emails
    });
    return true; // Indicates an asynchronous response
  }
});

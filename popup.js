document.addEventListener('DOMContentLoaded', () => {
  const extractButton = document.getElementById('extract-button');
  const resultsDiv = document.getElementById('results');

  extractButton.addEventListener('click', () => {
    resultsDiv.textContent = 'Extracting...';
    // Send a message to the background script to start the extraction
    chrome.runtime.sendMessage({ command: 'extract' });
  });

  // Listen for messages from the background script with the results
  chrome.runtime.onMessage.addListener((message) => {
    if (message.command === 'display_results') {
      if (message.emails && message.emails.length > 0) {
        resultsDiv.textContent = message.emails.join('\n');
      } else {
        resultsDiv.textContent = 'No emails found.';
      }
    }
  });
});

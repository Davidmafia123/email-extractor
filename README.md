# Email Extractor Chrome Extension

This is a simple Chrome extension to extract email addresses from the text of the current webpage.

## Files

- `manifest.json`: The extension's manifest file, declaring its properties, permissions, and file paths.
- `popup.html`: The HTML structure for the popup UI that appears when the extension icon is clicked.
- `popup.js`: The JavaScript logic for the popup. It handles user clicks and communication with the background script.
- `background.js`: The extension's service worker. It listens for messages from the popup and injects the content script into the active tab. It also relays results back to the popup.
- `content.js`: This script is injected into the webpage. It reads the page's text content, extracts unique email addresses using a regular expression, and sends them back to the background script.
- `icon.png`: The icon for the extension. **Note: This file must be created by the user.**

## How to Install

1.  Create a simple PNG image (e.g., 128x128 pixels) and save it as `icon.png` in this folder.
2.  Open Google Chrome and navigate to `chrome://extensions`.
3.  Enable "Developer mode" using the toggle switch in the top-right corner.
4.  Click the "Load unpacked" button that appears.
5.  Select the folder containing all these files.

The extension should now be installed and ready to use. You can click its icon in the Chrome toolbar when you are on a webpage to extract emails.

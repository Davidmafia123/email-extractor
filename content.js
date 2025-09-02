// This script is injected into the page to extract emails.

function extractEmails() {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g;
  const bodyText = document.body.innerText;
  const matches = bodyText.match(emailRegex);

  // Deduplicate using a Set
  const uniqueEmails = matches ? [...new Set(matches)] : [];

  return uniqueEmails;
}

const emails = extractEmails();

// Send the results back to the background script
chrome.runtime.sendMessage({
  command: 'extraction_complete',
  emails: emails
});

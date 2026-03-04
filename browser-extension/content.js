// PC Agent Browser Extension - Content Script

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'get-page-data') {
    const data = {
      url: window.location.href,
      title: document.title,
      selection: window.getSelection()?.toString() || '',
      meta: {
        description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
        keywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content') || ''
      },
      links: Array.from(document.querySelectorAll('a[href]')).slice(0, 50).map(a => ({
        text: a.textContent?.trim().slice(0, 100),
        href: a.getAttribute('href')
      })),
      forms: Array.from(document.querySelectorAll('form')).map(f => ({
        action: f.action,
        method: f.method,
        id: f.id,
        fields: Array.from(f.querySelectorAll('input,select,textarea')).map(el => ({
          type: el.getAttribute('type') || el.tagName.toLowerCase(),
          name: el.getAttribute('name'),
          id: el.id
        }))
      }))
    };
    sendResponse(data);
  }
  return false;
});

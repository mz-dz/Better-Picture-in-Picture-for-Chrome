// 1. Create the context menu item when the extension is installed.
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "open-custom-pip",
    title: "Open in better PiP",
    // This makes the menu item appear ONLY when you right-click on a video.
    contexts: ["video"] 
  });
});

// 2. Listen for a click on our context menu item.
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // Check if the clicked menu item is ours.
  if (info.menuItemId === "open-custom-pip") {
    // Execute the content script in the tab where the click happened.
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  }
});

// (Optional) You can keep the toolbar icon click functionality as well.
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });
});
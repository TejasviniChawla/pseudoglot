// Background script for SpurHacked Language Learning extension

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('SpurHacked Language Learning extension installed');
        
        // Set default settings
        chrome.storage.sync.set({
            targetLanguage: 'fr',
            learningLevel: 'beginner',
            translationEnabled: false,
            wordsTranslated: 0
        });
    }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateStats') {
        // Forward stats update to popup if it's open
        chrome.runtime.sendMessage(request);
    }
});

// Handle tab updates to ensure content script runs on page load
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && 
        (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
        
        // Inject content script if not already injected
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }).catch(err => {
            // Content script might already be injected, ignore error
            console.log('Content script injection skipped:', err.message);
        });
    }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // This will open the popup automatically due to manifest configuration
    console.log('Extension icon clicked');
}); 
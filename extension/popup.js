// Popup script for SpurHacked Language Learning extension

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const targetLanguageSelect = document.getElementById('targetLanguage');
    const learningLevelSelect = document.getElementById('learningLevel');
    const translationToggle = document.getElementById('translationToggle');
    const saveSettingsBtn = document.getElementById('saveSettings');
    const testConnectionBtn = document.getElementById('testConnection');
    const statusDiv = document.getElementById('status');
    const statsDiv = document.getElementById('stats');

    // Load saved settings
    loadSettings();

    // Event listeners
    saveSettingsBtn.addEventListener('click', saveSettings);
    testConnectionBtn.addEventListener('click', testConnection);
    translationToggle.addEventListener('click', toggleTranslation);

    // Load settings from storage
    function loadSettings() {
        chrome.storage.sync.get({
            targetLanguage: 'fr',
            learningLevel: 'beginner',
            translationEnabled: false,
            wordsTranslated: 0
        }, function(items) {
            targetLanguageSelect.value = items.targetLanguage;
            learningLevelSelect.value = items.learningLevel;
            translationToggle.classList.toggle('active', items.translationEnabled);
            statsDiv.textContent = `Words translated: ${items.wordsTranslated}`;
        });
    }

    // Save settings to storage
    function saveSettings() {
        const settings = {
            targetLanguage: targetLanguageSelect.value,
            learningLevel: learningLevelSelect.value,
            translationEnabled: translationToggle.classList.contains('active')
        };

        chrome.storage.sync.set(settings, function() {
            showStatus('Settings saved successfully!', 'success');
            
            // Notify content script about settings change
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'settingsUpdated',
                        settings: settings
                    });
                }
            });
        });
    }

    // Test connection to backend
    function testConnection() {
        testConnectionBtn.disabled = true;
        testConnectionBtn.textContent = 'Testing...';
        
        fetch('http://localhost:5001/health')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'healthy') {
                    showStatus('✅ Backend connection successful!', 'success');
                } else {
                    showStatus('❌ Backend responded but status is not healthy', 'error');
                }
            })
            .catch(error => {
                console.error('Connection test failed:', error);
                showStatus('❌ Cannot connect to backend. Make sure the server is running on localhost:5001', 'error');
            })
            .finally(() => {
                testConnectionBtn.disabled = false;
                testConnectionBtn.textContent = 'Test Connection';
            });
    }

    // Toggle translation on/off
    function toggleTranslation() {
        translationToggle.classList.toggle('active');
        
        // Update storage immediately
        chrome.storage.sync.set({
            translationEnabled: translationToggle.classList.contains('active')
        });

        // Notify content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'translationToggled',
                    enabled: translationToggle.classList.contains('active')
                });
            }
        });

        const isEnabled = translationToggle.classList.contains('active');
        showStatus(
            isEnabled ? '🟢 Translation enabled' : '🔴 Translation disabled', 
            'info'
        );
    }

    // Show status message
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'block';
        
        // Hide status after 3 seconds
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }

    // Listen for messages from content script
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'updateStats') {
            statsDiv.textContent = `Words translated: ${request.count}`;
        }
    });
}); 
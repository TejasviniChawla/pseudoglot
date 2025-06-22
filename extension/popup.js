// Popup script for SpurHacked Language Learning extension

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const targetLanguageSelect = document.getElementById('targetLanguage');
    const learningLevelSelect = document.getElementById('learningLevel');
    const translationToggle = document.getElementById('translationToggle');
    const saveSettingsBtn = document.getElementById('saveSettings');
    const testConnectionBtn = document.getElementById('testConnection');
    const statusDiv = document.getElementById('status');
    
    // Statistics elements
    const wordsLearnedTodayDiv = document.getElementById('wordsLearnedToday');
    const learningProgressDiv = document.getElementById('learningProgress');
    const totalHoversDiv = document.getElementById('totalHovers');
    const mostCommonWordDiv = document.getElementById('mostCommonWord');
    const dailyRecapDiv = document.getElementById('dailyRecap');
    const recapMessageDiv = document.getElementById('recapMessage');

    // Load saved settings
    loadSettings();
    loadStatistics();

    // Event listeners
    saveSettingsBtn.addEventListener('click', saveSettings);
    testConnectionBtn.addEventListener('click', testConnection);
    translationToggle.addEventListener('click', toggleTranslation);

    // Load settings from storage
    function loadSettings() {
        chrome.storage.sync.get({
            targetLanguage: 'fr',
            learningLevel: 'beginner',
            translationEnabled: false
        }, function(items) {
            targetLanguageSelect.value = items.targetLanguage;
            learningLevelSelect.value = items.learningLevel;
            translationToggle.classList.toggle('active', items.translationEnabled);
        });
    }

    // Load and display statistics from CSV data
    function loadStatistics() {
        fetch('http://localhost:5001/api/stats')
            .then(response => response.json())
            .then(data => {
                // Update statistics display
                wordsLearnedTodayDiv.textContent = data.words_learned_today;
                learningProgressDiv.textContent = `${data.learning_progress}%`;
                totalHoversDiv.textContent = data.total_hovers;
                mostCommonWordDiv.textContent = data.most_common_word || '-';
                
                // Show motivational message if progress is good
                if (data.words_learned_today > 0) {
                    showMotivationalMessage(data);
                }
            })
            .catch(error => {
                console.error('Error loading statistics:', error);
                // Set default values if API is not available
                wordsLearnedTodayDiv.textContent = '0';
                learningProgressDiv.textContent = '0%';
                totalHoversDiv.textContent = '0';
                mostCommonWordDiv.textContent = '-';
            });
    }

    // Show motivational message based on progress
    function showMotivationalMessage(data) {
        const messages = [
            `🎉 Great job! You've learned ${data.words_learned_today} words today!`,
            `🌟 Fantastic progress! ${data.learning_progress}% of words studied!`,
            `🚀 You're on fire! ${data.total_hovers} total interactions today!`,
            `💪 Keep it up! You're making excellent progress!`,
            `✨ Amazing dedication! ${data.words_learned_today} new words learned!`
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        recapMessageDiv.textContent = randomMessage;
        
        dailyRecapDiv.style.display = 'block';
        
        // Hide recap after 5 seconds
        setTimeout(() => {
            dailyRecapDiv.style.display = 'none';
        }, 5000);
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
                    // Reload statistics after successful connection
                    loadStatistics();
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
            // Reload statistics when new words are learned
            loadStatistics();
        }
    });
}); 
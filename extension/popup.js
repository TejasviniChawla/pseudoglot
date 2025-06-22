// Popup script – merged stats + settings for SpurHacked

/*
  Elements expected in popup.html:
  - #targetLanguage            (select)
  - #learningLevel             (select)
  - #translationToggle         (button/div to toggle)
  - #saveSettings              (button)
  - #testConnection            (button)
  - #status                    (div span)

  Stats area (old + new):
  - #stats                     (shows total words translated – chrome‑storage)
  - #wordsLearnedToday         (span)
  - #learningProgress          (span)
  - #totalHovers               (span)
  - #mostCommonWord            (span)
  - #dailyRecap                (div, initially hidden)
  - #recapMessage              (span inside dailyRecap)
*/

document.addEventListener('DOMContentLoaded', () => {
  /* ───────────────────────────────
     Cache DOM references
  ─────────────────────────────── */
  const targetLanguageSelect = document.getElementById('targetLanguage');
  const learningLevelSelect  = document.getElementById('learningLevel');
  const translationToggle    = document.getElementById('translationToggle');
  const saveSettingsBtn      = document.getElementById('saveSettings');
  const testConnectionBtn    = document.getElementById('testConnection');
  const statusDiv            = document.getElementById('status');

  // legacy simple stat
  const statsDiv             = document.getElementById('stats'); // total words translated

  // new detailed stats
  const wordsLearnedTodayDiv = document.getElementById('wordsLearnedToday');
  const learningProgressDiv  = document.getElementById('learningProgress');
  const totalHoversDiv       = document.getElementById('totalHovers');
  const mostCommonWordDiv    = document.getElementById('mostCommonWord');
  const dailyRecapDiv        = document.getElementById('dailyRecap');
  const recapMessageDiv      = document.getElementById('recapMessage');

  /* ───────────────────────────────
     Init
  ─────────────────────────────── */
  loadSettings();   // pull settings + wordsTranslated from chrome.storage
  loadStatistics(); // pull live stats from backend

  /* ───────────────────────────────
     Listeners
  ─────────────────────────────── */
  saveSettingsBtn .addEventListener('click', saveSettings);
  testConnectionBtn.addEventListener('click', testConnection);
  translationToggle.addEventListener('click', toggleTranslation);

  /* ───────────────────────────────
     Functions
  ─────────────────────────────── */

  // ► Load settings & local word‑count
  function loadSettings() {
    chrome.storage.sync.get({
      targetLanguage   : 'fr',
      learningLevel    : 'beginner',
      translationEnabled: false,
      wordsTranslated   : 0
    }, items => {
      targetLanguageSelect.value = items.targetLanguage;
      learningLevelSelect .value = items.learningLevel;
      translationToggle.classList.toggle('active', items.translationEnabled);
      if (statsDiv) statsDiv.textContent = `Words translated: ${items.wordsTranslated}`;
    });
  }

  // ► Save settings
  function saveSettings() {
    const settings = {
      targetLanguage   : targetLanguageSelect.value,
      learningLevel    : learningLevelSelect.value,
      translationEnabled: translationToggle.classList.contains('active')
    };

    chrome.storage.sync.set(settings, () => {
      showStatus('Settings saved successfully!', 'success');

      // broadcast to content script
      chrome.tabs.query({active:true, currentWindow:true}, tabs => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action  : 'settingsUpdated',
            settings: settings
          });
        }
      });
    });
  }

  // ► Backend health check
  function testConnection() {
    testConnectionBtn.disabled = true;
    testConnectionBtn.textContent = 'Testing…';

    fetch('http://localhost:5001/health')
      .then(r => r.json())
      .then(data => {
        if (data.status === 'healthy') {
          showStatus('✅ Backend connection successful!', 'success');
          loadStatistics(); // refresh live stats
        } else {
          showStatus('⚠️ Backend responded but not healthy', 'error');
        }
      })
      .catch(err => {
        console.error('Connection test failed:', err);
        showStatus('❌ Cannot connect to backend on localhost:5001', 'error');
      })
      .finally(() => {
        testConnectionBtn.disabled = false;
        testConnectionBtn.textContent = 'Test Connection';
      });
  }

  // ► Toggle translation
  function toggleTranslation() {
    translationToggle.classList.toggle('active');

    const enabled = translationToggle.classList.contains('active');
    chrome.storage.sync.set({ translationEnabled: enabled });

    chrome.tabs.query({active:true, currentWindow:true}, tabs => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action : 'translationToggled',
          enabled: enabled
        });
      }
    });

    showStatus(enabled ? '🟢 Translation enabled' : '🔴 Translation disabled', 'info');
  }

  // ► Load live learning statistics from API
  function loadStatistics() {
    fetch('http://localhost:5001/api/stats')
      .then(r => r.json())
      .then(data => {
        wordsLearnedTodayDiv.textContent = data.words_learned_today ?? '0';
        learningProgressDiv .textContent = `${data.learning_progress ?? 0}%`;
        totalHoversDiv      .textContent = data.total_hovers ?? '0';
        mostCommonWordDiv   .textContent = data.most_common_word || '-';

        if (data.words_learned_today > 0) {
          showMotivationalMessage(data);
        }
      })
      .catch(err => {
        console.error('Error loading statistics:', err);
        // set safe defaults
        wordsLearnedTodayDiv.textContent = '0';
        learningProgressDiv .textContent = '0%';
        totalHoversDiv      .textContent = '0';
        mostCommonWordDiv   .textContent = '-';
      });
  }

  // ► Flash motivational recap
  function showMotivationalMessage(data) {
    const msgs = [
      `🎉 Great job! You learned ${data.words_learned_today} words today!`,
      `🌟 Fantastic progress! ${data.learning_progress}% of words studied!`,
      `🚀 ${data.total_hovers} total interactions – keep going!`,
      `💪 Keep it up! Your dedication shows!`,
      `✨ Amazing! ${data.words_learned_today} new words mastered!`
    ];
    recapMessageDiv.textContent = msgs[Math.floor(Math.random()*msgs.length)];

    dailyRecapDiv.style.display = 'block';
    setTimeout(() => dailyRecapDiv.style.display = 'none', 5000);
  }

  // ► Status banner helper
  function showStatus(msg, type='info') {
    statusDiv.textContent = msg;
    statusDiv.className   = `status ${type}`;
    statusDiv.style.display = 'block';
    setTimeout(() => statusDiv.style.display = 'none', 3000);
  }

  // ► Listen for runtime messages (update stats count)
  chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
    if (request.action === 'updateStats') {
      // update local word‑count & reload detailed stats
      if (statsDiv) statsDiv.textContent = `Words translated: ${request.count}`;
      loadStatistics();
    }
  });
});

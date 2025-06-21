// Content script for SpurHacked Language Learning extension

class SpurHackedTranslator {
    constructor() {
        this.settings = {
            targetLanguage: 'fr',
            learningLevel: 'beginner',
            translationEnabled: false
        };
        this.translations = new Map();
        this.translatedWords = new Set();
        this.tooltipElement = null;
        this.isProcessing = false;
        
        this.init();
    }

    async init() {
        // Load settings
        await this.loadSettings();
        
        // Create tooltip element
        this.createTooltip();
        
        // Start processing if enabled
        if (this.settings.translationEnabled) {
            this.processPage();
        }
        
        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'settingsUpdated') {
                this.settings = request.settings;
                if (this.settings.translationEnabled) {
                    this.processPage();
                } else {
                    this.removeTranslations();
                }
            } else if (request.action === 'translationToggled') {
                this.settings.translationEnabled = request.enabled;
                if (request.enabled) {
                    this.processPage();
                } else {
                    this.removeTranslations();
                }
            }
        });
        
        // Listen for DOM changes
        this.observeDOMChanges();
        
        // Listen for copy events to replace translated text with original text
        document.addEventListener('copy', (e) => this.handleCopyEvent(e));
    }

    async loadSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get({
                targetLanguage: 'fr',
                learningLevel: 'beginner',
                translationEnabled: false
            }, (items) => {
                this.settings = items;
                resolve();
            });
        });
    }

    createTooltip() {
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.id = 'spurhacked-tooltip';
        this.tooltipElement.style.cssText = `
            position: absolute;
            z-index: 10000;
            background: #333;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 14px;
            font-family: Arial, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease;
            max-width: 300px;
            word-wrap: break-word;
            display: none;
            border: 1px solid #555;
        `;
        document.body.appendChild(this.tooltipElement);
    }

    async processPage() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            // Extract text from the page
            const pageText = this.extractPageText();
            
            if (!pageText.trim()) {
                console.log('SpurHacked: No text found on page');
                return;
            }

            // Get translations from backend
            const translations = await this.getTranslations(pageText);
            
            if (translations && translations.length > 0) {
                this.translations.clear();
                translations.forEach(t => {
                    this.translations.set(t.original.toLowerCase(), t);
                });
                
                // Apply translations to the page
                this.applyTranslations();
                
                // Update stats
                this.updateStats();
            }
        } catch (error) {
            console.error('SpurHacked: Error processing page:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    extractPageText() {
        // Get text from body, excluding script and style elements
        const body = document.body;
        if (!body) return '';

        // Clone body to avoid modifying the original
        const clone = body.cloneNode(true);
        
        // Remove script and style elements
        const scripts = clone.querySelectorAll('script, style, noscript, iframe, img, svg, canvas');
        scripts.forEach(el => el.remove());

        return clone.innerText || clone.textContent || '';
    }

    async getTranslations(text) {
        try {
            const response = await fetch('http://localhost:5001/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    level: this.settings.learningLevel,
                    targetLanguage: this.settings.targetLanguage
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.translations || [];
        } catch (error) {
            console.error('SpurHacked: Error fetching translations:', error);
            return [];
        }
    }

    applyTranslations() {
        // Walk through all text nodes in the document
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Skip if parent is script, style, or already processed
                    const parent = node.parentElement;
                    if (!parent || 
                        parent.tagName === 'SCRIPT' || 
                        parent.tagName === 'STYLE' || 
                        parent.tagName === 'NOSCRIPT' ||
                        parent.id === 'spurhacked-tooltip' ||
                        parent.classList.contains('spurhacked-translated') ||
                        parent.classList.contains('spurhacked-word') ||
                        parent.classList.contains('spurhacked-word-container')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }

        // Process each text node
        textNodes.forEach(textNode => {
            this.processTextNode(textNode);
        });
    }

    processTextNode(textNode) {
        // Skip if this text node is already part of a translated element
        let parent = textNode.parentElement;
        while (parent) {
            if (parent.classList.contains('spurhacked-translated') ||
                parent.classList.contains('spurhacked-word') ||
                parent.classList.contains('spurhacked-word-container') ||
                parent.classList.contains('spurhacked-speaker-btn') ||
                parent.id === 'spurhacked-tooltip') {
                return; // Skip already translated elements
            }
            parent = parent.parentElement;
        }

        const text = textNode.textContent;
        const words = text.split(/(\s+)/);
        let hasChanges = false;

        const newWords = words.map(word => {
            const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
            const translation = this.translations.get(cleanWord);
            
            if (translation && !this.translatedWords.has(textNode)) {
                hasChanges = true;
                return this.createTranslatedWord(word, translation);
            }
            return word;
        });

        if (hasChanges) {
            const wrapper = document.createElement('span');
            wrapper.className = 'spurhacked-translated';
            
            // Add each word to the wrapper
            newWords.forEach(word => {
                if (typeof word === 'string') {
                    wrapper.appendChild(document.createTextNode(word));
                } else {
                    wrapper.appendChild(word);
                }
            });
            
            textNode.parentNode.replaceChild(wrapper, textNode);
            this.translatedWords.add(wrapper);
        }
    }

    createTranslatedWord(originalWord, translation) {
        const cleanWord = originalWord.replace(/[^\w]/g, '').toLowerCase();
        const isCapitalized = originalWord[0] === originalWord[0]?.toUpperCase();
        
        let translatedText = translation.translated;
        if (isCapitalized) {
            translatedText = translatedText.charAt(0).toUpperCase() + translatedText.slice(1);
        }

        // Create a container for the word and speaker button
        const container = document.createElement('span');
        container.className = 'spurhacked-word-container';
        container.style.cssText = `
            display: inline-flex;
            align-items: center;
            gap: 2px;
            position: relative;
        `;

        // Create the translated word span
        const span = document.createElement('span');
        span.className = 'spurhacked-word';
        span.setAttribute('data-original', cleanWord);
        span.setAttribute('data-translation', translation.translated);
        span.setAttribute('data-meaning', translation.meaning);
        span.setAttribute('data-pronunciation', translation.pronunciation);
        span.style.cssText = `
            color: #2196F3;
            text-decoration: underline;
            text-decoration-style: dotted;
            cursor: help;
            position: relative;
        `;
        span.textContent = translatedText;

        // Add hover events to the word span
        span.addEventListener('mouseenter', (e) => this.showTooltip(e, translation));
        span.addEventListener('mouseleave', () => this.hideTooltip());

        // Create the speaker button
        const speakerButton = document.createElement('span');
        speakerButton.className = 'spurhacked-speaker-btn';
        speakerButton.innerHTML = '🔊';
        speakerButton.style.cssText = `
            cursor: pointer;
            font-size: 12px;
            opacity: 0.7;
            transition: opacity 0.2s ease;
            user-select: none;
            display: inline-block;
            vertical-align: middle;
            margin-left: 2px;
        `;

        // Add hover effect to speaker button
        speakerButton.addEventListener('mouseenter', () => {
            speakerButton.style.opacity = '1';
        });
        speakerButton.addEventListener('mouseleave', () => {
            speakerButton.style.opacity = '0.7';
        });

        // Add click event to speaker button (currently does nothing as requested)
        speakerButton.addEventListener('click', (e) => {
            e.stopPropagation();
            // Play pronunciation of the translated word
            this.playPronunciation(translation.translated, translation.pronunciation, speakerButton);
        });

        // Add both elements to the container
        container.appendChild(span);
        container.appendChild(speakerButton);

        return container;
    }

    showTooltip(event, translation) {
        console.log('SpurHacked: Tooltip translation object:', translation);
        console.log('SpurHacked: Original word:', translation.original);
        console.log('SpurHacked: Translated word:', translation.translated);
        
        const tooltip = this.tooltipElement;
        tooltip.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 4px; color: #fff;">${translation.original} → ${translation.translated}</div>
            <div style="margin-bottom: 2px; color: #fff;"><strong>Meaning:</strong> ${translation.meaning}</div>
            <div style="color: #fff;"><strong>Pronunciation:</strong> ${translation.pronunciation}</div>
        `;
        
        const rect = event.target.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        tooltip.style.left = (rect.left + scrollLeft) + 'px';
        tooltip.style.top = (rect.bottom + scrollTop + 5) + 'px';
        tooltip.style.opacity = '1';
        tooltip.style.zIndex = '10000';
        tooltip.style.display = 'block';
        
        console.log('SpurHacked: Tooltip shown for', translation.original);
    }

    hideTooltip() {
        if (this.tooltipElement) {
            this.tooltipElement.style.opacity = '0';
            this.tooltipElement.style.display = 'none';
        }
    }

    playPronunciation(text, pronunciation, speakerButton) {
        console.log('SpurHacked: Playing pronunciation for:', text);
        console.log('SpurHacked: Target language:', this.settings.targetLanguage);
        
        // Check if speech synthesis is supported
        if (!window.speechSynthesis) {
            console.warn('SpurHacked: Speech synthesis not supported in this browser');
            this.showSpeechError(speakerButton, 'Speech synthesis not supported');
            return;
        }

        // Check if speech synthesis is paused (common issue)
        if (window.speechSynthesis.paused) {
            console.log('SpurHacked: Speech synthesis was paused, resuming...');
            window.speechSynthesis.resume();
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Create a new speech utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set language based on target language
        const languageMap = {
            'fr': 'fr-FR',
            'es': 'es-ES',
            'de': 'de-DE',
            'it': 'it-IT',
            'pt': 'pt-PT',
            'ru': 'ru-RU',
            'ja': 'ja-JP',
            'ko': 'ko-KR',
            'zh': 'zh-CN',
            'ar': 'ar-SA',
            'hi': 'hi-IN',
            'nl': 'nl-NL',
            'sv': 'sv-SE',
            'no': 'no-NO',
            'da': 'da-DK',
            'pl': 'pl-PL',
            'tr': 'tr-TR',
            'he': 'he-IL',
            'th': 'th-TH',
            'vi': 'vi-VN'
        };

        const targetLang = languageMap[this.settings.targetLanguage] || 'en-US';
        
        // Get available voices and try to find a matching voice
        const voices = window.speechSynthesis.getVoices();
        
        // Try to find a voice for the target language
        let selectedVoice = null;
        
        // First, try to find an exact match
        selectedVoice = voices.find(voice => 
            voice.lang.toLowerCase() === targetLang.toLowerCase() ||
            voice.lang.toLowerCase().startsWith(targetLang.split('-')[0])
        );
        
        if (selectedVoice) {
            console.log('SpurHacked: Using voice:', selectedVoice.name, 'for language:', selectedVoice.lang);
            utterance.voice = selectedVoice;
        } else {
            console.log('SpurHacked: Using default voice for language:', targetLang);
            utterance.lang = targetLang;
        }
        
        // Set speech properties
        utterance.rate = 0.8; // Slightly slower for better pronunciation
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Add visual feedback to the speaker button
        const originalContent = speakerButton.innerHTML;
        speakerButton.innerHTML = '🔊';
        speakerButton.style.opacity = '1';
        speakerButton.classList.add('playing');

        // Play the speech
        utterance.onstart = () => {
            console.log('SpurHacked: Pronunciation started for:', text);
        };

        utterance.onend = () => {
            // Reset button appearance
            speakerButton.innerHTML = originalContent;
            speakerButton.classList.remove('playing');
            speakerButton.style.opacity = '0.7';
            console.log('SpurHacked: Pronunciation finished for:', text);
        };

        utterance.onerror = (event) => {
            console.error('SpurHacked: Speech synthesis error:', event.error);
            this.showSpeechError(speakerButton, `Speech error: ${event.error}`);
        };

        // Speak the text
        try {
            window.speechSynthesis.speak(utterance);
        } catch (error) {
            console.error('SpurHacked: Error starting speech synthesis:', error);
            this.showSpeechError(speakerButton, `Start error: ${error.message}`);
        }
    }

    showSpeechError(speakerButton, message) {
        console.error('SpurHacked:', message);
        const originalContent = speakerButton.innerHTML;
        speakerButton.innerHTML = '❌';
        speakerButton.style.opacity = '1';
        speakerButton.classList.remove('playing');
        
        // Reset after 2 seconds
        setTimeout(() => {
            speakerButton.innerHTML = originalContent;
            speakerButton.style.opacity = '0.7';
        }, 2000);
    }

    removeTranslations() {
        // Remove all translated words and restore original text
        const translatedElements = document.querySelectorAll('.spurhacked-word');
        translatedElements.forEach(element => {
            const originalWord = element.getAttribute('data-original');
            element.textContent = originalWord;
            element.className = '';
            element.removeAttribute('style');
            element.removeAttribute('data-original');
            element.removeAttribute('data-translation');
            element.removeAttribute('data-meaning');
            element.removeAttribute('data-pronunciation');
        });

        // Remove wrapper spans
        const wrappers = document.querySelectorAll('.spurhacked-translated');
        wrappers.forEach(wrapper => {
            const parent = wrapper.parentNode;
            if (parent) {
                parent.replaceChild(document.createTextNode(wrapper.textContent), wrapper);
            }
        });

        this.translatedWords.clear();
        this.translations.clear();
    }

    observeDOMChanges() {
        // Observe DOM changes to handle dynamic content
        const observer = new MutationObserver((mutations) => {
            if (!this.settings.translationEnabled) return;

            let shouldProcess = false;
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if new text nodes were added
                    mutation.addedNodes.forEach(node => {
                        // Skip if the node is already translated or contains translated elements
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const element = node;
                            if (element.classList.contains('spurhacked-translated') ||
                                element.classList.contains('spurhacked-word') ||
                                element.classList.contains('spurhacked-word-container') ||
                                element.querySelector('.spurhacked-translated') ||
                                element.querySelector('.spurhacked-word')) {
                                return; // Skip already translated elements
                            }
                        }
                        
                        if (node.nodeType === Node.TEXT_NODE || 
                            (node.nodeType === Node.ELEMENT_NODE && node.textContent)) {
                            shouldProcess = true;
                        }
                    });
                }
            });

            if (shouldProcess) {
                // Debounce the processing
                clearTimeout(this.processTimeout);
                this.processTimeout = setTimeout(() => {
                    this.processPage();
                }, 1000);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    updateStats() {
        const count = this.translations.size;
        chrome.storage.sync.set({ wordsTranslated: count });
        
        // Notify popup
        chrome.runtime.sendMessage({
            action: 'updateStats',
            count: count
        });
    }

    handleCopyEvent(e) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        let selectedText = range.toString();
        
        // Check if the selection contains any translated words
        let hasTranslatedWords = false;
        let modifiedText = selectedText;
        
        // Find all translated word spans within the selection
        const translatedSpans = range.cloneContents().querySelectorAll('.spurhacked-word');
        
        if (translatedSpans.length > 0) {
            hasTranslatedWords = true;
            
            // Create a temporary container to work with the selection
            const tempContainer = document.createElement('div');
            tempContainer.appendChild(range.cloneContents());
            
            // Remove speaker buttons from the temporary container
            const speakerButtons = tempContainer.querySelectorAll('.spurhacked-speaker-btn');
            speakerButtons.forEach(button => button.remove());
            
            // Replace all translated words with their original text
            const spansInTemp = tempContainer.querySelectorAll('.spurhacked-word');
            spansInTemp.forEach(span => {
                const originalText = span.getAttribute('data-original');
                if (originalText) {
                    // Preserve capitalization if the translated word was capitalized
                    const translatedText = span.textContent;
                    const isCapitalized = translatedText[0] === translatedText[0]?.toUpperCase();
                    const replacementText = isCapitalized ? 
                        originalText.charAt(0).toUpperCase() + originalText.slice(1) : 
                        originalText;
                    
                    // Replace the span with the original text
                    const textNode = document.createTextNode(replacementText);
                    span.parentNode.replaceChild(textNode, span);
                }
            });
            
            // Get the modified text, ensuring we get clean text content
            modifiedText = tempContainer.textContent || tempContainer.innerText;
            
            // Clean up any extra whitespace that might have been introduced
            modifiedText = modifiedText.replace(/\s+/g, ' ').trim();
        }
        
        // If we found translated words, modify the clipboard data
        if (hasTranslatedWords) {
            e.preventDefault();
            
            // Set the modified text to clipboard
            if (e.clipboardData) {
                e.clipboardData.setData('text/plain', modifiedText);
                e.clipboardData.setData('text/html', modifiedText);
            } else if (window.clipboardData) {
                // Fallback for older browsers
                window.clipboardData.setData('Text', modifiedText);
            }
            
            console.log('SpurHacked: Copy intercepted - replaced translated text with original text');
            console.log('SpurHacked: Original selection:', selectedText);
            console.log('SpurHacked: Modified text:', modifiedText);
        }
    }
}

// Initialize the translator when the page is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new SpurHackedTranslator();
    });
} else {
    new SpurHackedTranslator();
} 
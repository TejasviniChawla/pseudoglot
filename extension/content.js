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
                        parent.classList.contains('spurhacked-translated')) {
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

        // Add hover events
        span.addEventListener('mouseenter', (e) => this.showTooltip(e, translation));
        span.addEventListener('mouseleave', () => this.hideTooltip());

        return span;
    }

    showTooltip(event, translation) {
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
}

// Initialize the translator when the page is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new SpurHackedTranslator();
    });
} else {
    new SpurHackedTranslator();
} 
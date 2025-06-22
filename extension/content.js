// Merged content script for SpurHacked Language Learning extension
// Combines: hover‑frequency tracking, copy‑intercept, robust DOM filtering,
// pronunciation, tooltip, dynamic content observer, and stats updates

class SpurHackedTranslator {
    constructor() {
        this.settings = {
            targetLanguage: 'fr',
            learningLevel: 'beginner',
            translationEnabled: false
        };

        // === Combined state ===
        this.hoveredWords      = new Set();   // from v1 – track first‑time hovers
        this.translations      = new Map();
        this.translatedWords   = new Set();
        this.tooltipElement    = null;
        this.isProcessing      = false;
        this.processTimeout    = null;        // debounce handle

        this.init();
    }

    /* ------------------------------------------------------------------
       🏁  INITIALISATION
    ------------------------------------------------------------------ */
    async init() {
        await this.loadSettings();
        this.createTooltip();

        // run once if enabled
        if (this.settings.translationEnabled) {
            this.processPage();
        }

        /* 🎧 Listen for settings messages from popup */
        chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
            if (request.action === 'settingsUpdated') {
                this.settings = request.settings;
            } else if (request.action === 'translationToggled') {
                this.settings.translationEnabled = request.enabled;
            }

            if (this.settings.translationEnabled) {
                this.processPage();
            } else {
                this.removeTranslations();
            }
        });

        // 👀 React to DOM mutations (SPA / dynamic pages)
        this.observeDOMChanges();

        // 📋 Intercept copy to strip translated text
        document.addEventListener('copy', e => this.handleCopyEvent(e));
    }

    /* ------------------------------------------------------------------
       🔧  SETTINGS & TOOLTIP
    ------------------------------------------------------------------ */
    async loadSettings() {
        return new Promise(resolve => {
            chrome.storage.sync.get({
                targetLanguage: 'fr',
                learningLevel : 'beginner',
                translationEnabled: false
            }, items => {
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
            background: #1a1a1a; 
            color: #ffffff;
            padding: 12px 16px; 
            border-radius: 8px; 
            font: 14px/1.5 'Segoe UI', Arial, sans-serif;
            box-shadow: 0 8px 24px rgba(0,0,0,0.4); 
            pointer-events: none; 
            opacity: 0;
            transition: opacity 0.2s ease; 
            max-width: 320px; 
            word-wrap: break-word;
            display: none; 
            border: 1px solid #404040;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        `;
        document.body.appendChild(this.tooltipElement);
    }

    /* ------------------------------------------------------------------
       🚀  MAIN PIPELINE
    ------------------------------------------------------------------ */
    async processPage() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            const pageText = this.extractPageText();
            if (!pageText.trim()) {
                console.log('SpurHacked: No text found on page');
                return;
            }

            const translations = await this.getTranslations(pageText);
            if (translations.length) {
                this.translations.clear();
                translations.forEach(t => this.translations.set(t.original.toLowerCase(), t));
                this.applyTranslations();
                this.updateStats();
            }
        } catch (err) {
            console.error('SpurHacked: Error processing page:', err);
        } finally {
            this.isProcessing = false;
        }
    }

    extractPageText() {
        const body = document.body;
        if (!body) return '';
        const clone = body.cloneNode(true);
        clone.querySelectorAll('script,style,noscript,iframe,img,svg,canvas').forEach(el => el.remove());
        return clone.innerText || clone.textContent || '';
    }

    async getTranslations(text) {
        try {
            const res = await fetch('http://localhost:5001/translate', {
                method : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body   : JSON.stringify({
                    text,
                    level          : this.settings.learningLevel,
                    targetLanguage : this.settings.targetLanguage
                })
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            return data.translations || [];
        } catch (err) {
            console.error('SpurHacked: Error fetching translations:', err);
            return [];
        }
    }

    /* ------------------------------------------------------------------
       ✨  APPLY TRANSLATIONS TO DOM
    ------------------------------------------------------------------ */
    applyTranslations() {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: node => {
                    const parent = node.parentElement;
                    if (!parent) return NodeFilter.FILTER_REJECT;

                    // Skip unwanted parents / already processed nodes
                    if (['SCRIPT','STYLE','NOSCRIPT'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
                    if (parent.id === 'spurhacked-tooltip')                        return NodeFilter.FILTER_REJECT;
                    if (parent.classList.contains('spurhacked-translated') ||
                        parent.classList.contains('spurhacked-word') ||
                        parent.classList.contains('spurhacked-word-container'))  return NodeFilter.FILTER_REJECT;

                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const nodes = [];
        let n; while ((n = walker.nextNode())) nodes.push(n);
        nodes.forEach(tn => this.processTextNode(tn));
    }

    processTextNode(textNode) {
        // Abort if ancestor already processed
        for (let p = textNode.parentElement; p; p = p.parentElement) {
            if (p.classList && (p.classList.contains('spurhacked-translated') ||
                                p.classList.contains('spurhacked-word') ||
                                p.classList.contains('spurhacked-word-container') ||
                                p.classList.contains('spurhacked-speaker-btn'))) return;
            if (p.id === 'spurhacked-tooltip') return;
        }

        const words = textNode.textContent.split(/(\s+)/);
        let changed = false;
        const pieces = words.map(w => {
            const key = w.replace(/[^\w]/g,'').toLowerCase();
            const t   = this.translations.get(key);
            if (t) {
                changed = true;
                return this.createTranslatedWord(w,t);
            }
            return w;
        });

        if (!changed) return;

        const wrap = document.createElement('span');
        wrap.className = 'spurhacked-translated';
        pieces.forEach(p => {
            if (typeof p === 'string') wrap.appendChild(document.createTextNode(p));
            else                        wrap.appendChild(p);
        });
        textNode.parentNode.replaceChild(wrap, textNode);
        this.translatedWords.add(wrap);
    }

    /* ------------------------------------------------------------------
       🏷️  CREATE MARKED‑UP WORD (with hover + speaker)
    ------------------------------------------------------------------ */
    createTranslatedWord(originalWord, translation) {
        const clean   = originalWord.replace(/[^\w]/g,'').toLowerCase();
        let transText = translation.translated;
        if (originalWord[0] === originalWord[0]?.toUpperCase()) {
            transText = transText.charAt(0).toUpperCase() + transText.slice(1);
        }

        const container = document.createElement('span');
        container.className = 'spurhacked-word-container';
        container.style.cssText = 'display:inline-flex;align-items:center;gap:2px;position:relative;';

        const span = document.createElement('span');
        span.className = 'spurhacked-word';
        span.dataset.original      = clean;
        span.dataset.translation   = translation.translated;
        span.dataset.meaning       = translation.meaning;
        span.dataset.pronunciation = translation.pronunciation;
        span.style.cssText = 'color:#2196F3;text-decoration:underline dotted;cursor:help;position:relative;';
        span.textContent  = transText;

        // Hover handlers – tooltip + frequency tracking (from v1)
        span.addEventListener('mouseenter', e => {
            this.showTooltip(e, translation);
            const eng = translation.original.toLowerCase();
            if (!this.hoveredWords.has(eng)) {
                this.hoveredWords.add(eng);
                
                // Send hover frequency to backend
                fetch('http://localhost:5001/api/hover', {
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({english:eng})
                }).catch(err=>console.warn('SpurHacked: hover freq error', err));
                
                // Update statistics - this is a new word learned
                this.updateLearningStats(1);
            }
        });
        span.addEventListener('mouseleave', () => this.hideTooltip());

        // 🔊 speaker
        const speaker = document.createElement('span');
        speaker.className = 'spurhacked-speaker-btn';
        speaker.innerHTML = '🔊';
        speaker.style.cssText = 'cursor:pointer;font-size:12px;opacity:.7;transition:opacity .2s ease;user-select:none;vertical-align:middle;margin-left:2px;';
        speaker.addEventListener('mouseenter', () => { speaker.style.opacity = '1'; });
        speaker.addEventListener('mouseleave', () => { speaker.style.opacity = '.7'; });
        speaker.addEventListener('click', e => {
            e.stopPropagation();
            this.playPronunciation(translation.translated, translation.pronunciation, speaker);
        });

        container.append(span,speaker);
        return container;
    }

    /* ------------------------------------------------------------------
       🛈  TOOLTIP
    ------------------------------------------------------------------ */
    showTooltip(evt, tr) {
        const tt = this.tooltipElement;
        tt.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 8px; color: #ffffff; font-size: 15px; border-bottom: 1px solid #404040; padding-bottom: 6px;">${tr.original} → ${tr.translated}</div>
            <div style="margin-bottom: 6px; color: #e0e0e0;"><strong style="color: #ffffff;">Meaning:</strong> ${tr.meaning}</div>
            <div style="color: #e0e0e0;"><strong style="color: #ffffff;">Pronunciation:</strong> ${tr.pronunciation}</div>`;

        const rect  = evt.target.getBoundingClientRect();
        const top   = rect.bottom + (window.pageYOffset||document.documentElement.scrollTop) + 5;
        const left  = rect.left   + (window.pageXOffset||document.documentElement.scrollLeft);
        tt.style.top = `${top}px`;
        tt.style.left= `${left}px`;
        tt.style.opacity = '1';
        tt.style.display = 'block';

        console.log('SpurHacked: Tooltip shown for', tr.original);
    }

    hideTooltip() {
        if (this.tooltipElement) {
            this.tooltipElement.style.opacity = '0';
            this.tooltipElement.style.display = 'none';
        }
    }

    /* ------------------------------------------------------------------
       🔈  PRONUNCIATION via SpeechSynthesis
    ------------------------------------------------------------------ */
    playPronunciation(text, _pron, btn) {
        if (!window.speechSynthesis) {
            this.showSpeechError(btn,'Speech synthesis not supported');
            return;
        }

        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        window.speechSynthesis.cancel();

        const utter = new SpeechSynthesisUtterance(text);
        const map   = {
            fr:'fr-FR', es:'es-ES', de:'de-DE', it:'it-IT', pt:'pt-PT', ru:'ru-RU',
            ja:'ja-JP', ko:'ko-KR', zh:'zh-CN', ar:'ar-SA', hi:'hi-IN', nl:'nl-NL',
            sv:'sv-SE', no:'no-NO', da:'da-DK', pl:'pl-PL', tr:'tr-TR', he:'he-IL',
            th:'th-TH', vi:'vi-VN'
        };
        const langCode = map[this.settings.targetLanguage] || 'en-US';
        const voices   = window.speechSynthesis.getVoices();
        const voice    = voices.find(v => v.lang.toLowerCase() === langCode.toLowerCase() ||
                                          v.lang.toLowerCase().startsWith(langCode.split('-')[0]));
        if (voice) utter.voice = voice; else utter.lang = langCode;
        utter.rate = .8;

        // visual feedback
        const orig = btn.innerHTML;
        btn.innerHTML = '🔊';
        btn.style.opacity = '1';
        btn.classList.add('playing');

        utter.onend   = () => { btn.innerHTML = orig; btn.style.opacity='.7'; btn.classList.remove('playing'); };
        utter.onerror = e   => { this.showSpeechError(btn, `Speech error: ${e.error}`); };

        try { window.speechSynthesis.speak(utter); }
        catch(err) { this.showSpeechError(btn, `Start error: ${err.message}`); }
    }

    showSpeechError(btn,msg) {
        console.error('SpurHacked:', msg);
        const orig = btn.innerHTML;
        btn.innerHTML = '❌';
        btn.style.opacity = '1';
        btn.classList.remove('playing');
        setTimeout(()=>{ btn.innerHTML = orig; btn.style.opacity='.7'; },2000);
    }

    /* ------------------------------------------------------------------
       ❌  REMOVE TRANSLATIONS
    ------------------------------------------------------------------ */
    removeTranslations() {
        document.querySelectorAll('.spurhacked-word').forEach(el => {
            const orig = el.dataset.original;
            el.replaceWith(document.createTextNode(orig));
        });
        document.querySelectorAll('.spurhacked-translated').forEach(w => {
            w.replaceWith(document.createTextNode(w.textContent));
        });
        this.translatedWords.clear();
        this.translations.clear();
    }

    /* ------------------------------------------------------------------
       🔄  MUTATION OBSERVER (debounced)
    ------------------------------------------------------------------ */
    observeDOMChanges() {
        const obs = new MutationObserver(muts => {
            if (!this.settings.translationEnabled) return;
            let should = false;
            muts.forEach(m => {
                if (m.type === 'childList' && m.addedNodes.length) {
                    m.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const el = node;
                            if (el.classList.contains('spurhacked-translated') ||
                                el.classList.contains('spurhacked-word') ||
                                el.classList.contains('spurhacked-word-container') ||
                                el.querySelector('.spurhacked-translated') ||
                                el.querySelector('.spurhacked-word')) return;
                        }
                        if (node.nodeType === Node.TEXT_NODE || (node.textContent)) should = true;
                    });
                }
            });
            if (should) {
                clearTimeout(this.processTimeout);
                this.processTimeout = setTimeout(() => this.processPage(), 1000);
            }
        });
        obs.observe(document.body, { childList:true, subtree:true });
    }

    /* ------------------------------------------------------------------
       📈  STATS
    ------------------------------------------------------------------ */
    updateStats() {
        const count = this.translations.size;
        chrome.storage.sync.set({ wordsTranslated: count });
        chrome.runtime.sendMessage({ action:'updateStats', count });
    }

    /* ------------------------------------------------------------------
       📊  LEARNING STATISTICS
    ------------------------------------------------------------------ */
    updateLearningStats(newWordsCount) {
        // Send update to popup to refresh CSV-based statistics
        chrome.runtime.sendMessage({ 
            action: 'updateStats'
        });
        
        console.log(`SpurHacked: ${newWordsCount} new word(s) learned!`);
    }

    /* ------------------------------------------------------------------
       📋  COPY INTERCEPT (replace translated words with originals)
    ------------------------------------------------------------------ */
    handleCopyEvent(e) {
        const sel = window.getSelection();
        if (!sel.rangeCount) return;
        const range = sel.getRangeAt(0);

        const fragment = range.cloneContents();
        const hasTranslated = fragment.querySelector('.spurhacked-word');
        if (!hasTranslated) return; // nothing to fix

        // Remove speaker buttons, revert words
        fragment.querySelectorAll('.spurhacked-speaker-btn').forEach(b => b.remove());
        fragment.querySelectorAll('.spurhacked-word').forEach(sp => {
            const orig = sp.dataset.original;
            const txt  = sp.textContent;
            const cap  = txt[0] === txt[0]?.toUpperCase();
            const repl = cap ? orig.charAt(0).toUpperCase()+orig.slice(1) : orig;
            sp.replaceWith(document.createTextNode(repl));
        });

        let txtOut = fragment.textContent.replace(/\s+/g,' ').trim();
        e.preventDefault();
        if (e.clipboardData) {
            e.clipboardData.setData('text/plain', txtOut);
            e.clipboardData.setData('text/html', txtOut);
        } else if (window.clipboardData) {
            window.clipboardData.setData('Text', txtOut);
        }
        console.log('SpurHacked: Copy intercepted – replaced translations with originals');
    }
}

// Boot when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new SpurHackedTranslator());
} else {
    new SpurHackedTranslator();
}

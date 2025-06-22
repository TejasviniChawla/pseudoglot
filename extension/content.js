// FINAL merged content script for SpurHacked Language Learning extension
// Includes: hover‑frequency tracking, copy‑intercept, DOM filtering,
// pronunciation, polished tooltip UI, dynamic observer, local & CSV‑based stats.

class SpurHackedTranslator {
  constructor () {
    this.settings = {
      targetLanguage: 'fr',
      learningLevel : 'beginner',
      translationEnabled: false
    };

    // ── state ────────────────────────────────────────────────────────
    this.hoveredWords    = new Set();
    this.translations    = new Map();
    this.translatedWords = new Set();
    this.tooltipElement  = null;
    this.isProcessing    = false;
    this.processTimeout  = null;

    this.init();
  }

  /* ───────────────────────────────────────────────────────── INIT ── */
  async init () {
    await this.loadSettings();
    this.createTooltip();

    if (this.settings.translationEnabled) this.processPage();

    chrome.runtime.onMessage.addListener((req) => {
      if (req.action === 'settingsUpdated') {
        this.settings = req.settings;
      } else if (req.action === 'translationToggled') {
        this.settings.translationEnabled = req.enabled;
      }
      this.settings.translationEnabled ? this.processPage() : this.removeTranslations();
    });

    this.observeDOMChanges();
    document.addEventListener('copy', (e) => this.handleCopyEvent(e));
  }

  loadSettings () {
    return new Promise((res) => {
      chrome.storage.sync.get({ targetLanguage: 'fr', learningLevel:'beginner', translationEnabled:false }, (items) => {
        this.settings = items; res();
      });
    });
  }

  createTooltip () {
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.id = 'spurhacked-tooltip';
    this.tooltipElement.style.cssText = `
      position:absolute;z-index:10000;background:#1a1a1a;color:#fff;padding:12px 16px;
      border-radius:8px;font:14px/1.5 'Segoe UI',Arial,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.4);
      pointer-events:none;opacity:0;transition:opacity .2s ease;max-width:320px;word-wrap:break-word;
      display:none;border:1px solid #404040;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);`;
    document.body.appendChild(this.tooltipElement);
  }

  /* ──────────────────────────────── MAIN PIPELINE ── */
  async processPage () {
    if (this.isProcessing) return; this.isProcessing = true;
    try {
      const text = this.extractPageText();
      if (!text.trim()) return;
      const translations = await this.getTranslations(text);
      if (translations.length) {
        this.translations.clear();
        translations.forEach((t) => this.translations.set(t.original.toLowerCase(), t));
        this.applyTranslations();
        this.updateStats();
      }
    } catch (err) { console.error('SpurHacked:', err); }
    finally { this.isProcessing = false; }
  }

  extractPageText () {
    const clone = document.body.cloneNode(true);
    clone.querySelectorAll('script,style,noscript,iframe,img,svg,canvas').forEach((el) => el.remove());
    return clone.innerText || clone.textContent || '';
  }

  async getTranslations (text) {
    try {
      const r = await fetch('http://localhost:5001/translate', {
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ text, level:this.settings.learningLevel, targetLanguage:this.settings.targetLanguage })
      });
      if (!r.ok) throw new Error(r.status);
      return (await r.json()).translations || [];
    } catch (e) { console.error('translate fetch error',e); return []; }
  }

  /* ───────────────────────────── APPLY TO DOM ── */
  applyTranslations () {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode:n=>{
        const p=n.parentElement; if(!p) return NodeFilter.FILTER_REJECT;
        if(['SCRIPT','STYLE','NOSCRIPT'].includes(p.tagName)) return NodeFilter.FILTER_REJECT;
        if(p.id==='spurhacked-tooltip') return NodeFilter.FILTER_REJECT;
        if(p.classList.contains('spurhacked-translated')||p.classList.contains('spurhacked-word')||p.classList.contains('spurhacked-word-container')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT; }
    });
    const nodes=[]; let n; while((n=walker.nextNode())) nodes.push(n);
    nodes.forEach((node)=>this.processTextNode(node));
  }

  processTextNode (tn) {
    for(let p=tn.parentElement;p;p=p.parentElement){
      if(p.classList&&(p.classList.contains('spurhacked-translated')||p.classList.contains('spurhacked-word')||p.classList.contains('spurhacked-word-container')||p.classList.contains('spurhacked-speaker-btn'))) return;
      if(p.id==='spurhacked-tooltip') return;
    }
    const parts=tn.textContent.split(/(\s+)/); let changed=false;
    const nodes=parts.map(w=>{const key=w.replace(/[^\w]/g,'').toLowerCase();const tr=this.translations.get(key);if(tr){changed=true;return this.createTranslatedWord(w,tr);}return w;});
    if(!changed) return;
    const wrap=document.createElement('span');wrap.className='spurhacked-translated';
    nodes.forEach(p=>typeof p==='string'?wrap.appendChild(document.createTextNode(p)):wrap.appendChild(p));
    tn.parentNode.replaceChild(wrap,tn); this.translatedWords.add(wrap);
  }

  createTranslatedWord (original, tr) {
    const isCap=original[0]===original[0]?.toUpperCase();
    const tWord=isCap?tr.translated.charAt(0).toUpperCase()+tr.translated.slice(1):tr.translated;
    const cont=document.createElement('span');cont.className='spurhacked-word-container';cont.style.cssText='display:inline-flex;align-items:center;gap:2px;position:relative;';
    const span=document.createElement('span');
    span.className='spurhacked-word';
    Object.assign(span.dataset,{original:original.replace(/[^\w]/g,'').toLowerCase(),translation:tr.translated,meaning:tr.meaning,pronunciation:tr.pronunciation});
    span.style.cssText='color:#2196F3;text-decoration:underline dotted;cursor:help;position:relative;';
    span.textContent=tWord;

    span.addEventListener('mouseenter',(e)=>{this.showTooltip(e,tr);const en=tr.original.toLowerCase();
      if(!this.hoveredWords.has(en)){this.hoveredWords.add(en);fetch('http://localhost:5001/api/hover',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({english:en})}).catch(()=>{});this.updateLearningStats(1);} });
    span.addEventListener('mouseleave',()=>this.hideTooltip());

    const speak=document.createElement('span');speak.className='spurhacked-speaker-btn';speak.innerHTML='🔊';speak.style.cssText='cursor:pointer;font-size:12px;opacity:.7;transition:opacity .2s ease;user-select:none;margin-left:2px;';
    speak.addEventListener('mouseenter',()=>speak.style.opacity='1');speak.addEventListener('mouseleave',()=>speak.style.opacity='.7');
    speak.addEventListener('click',(e)=>{e.stopPropagation();this.playPronunciation(tr.translated,tr.pronunciation,speak);});

    cont.append(span,speak);return cont;
  }

  /* ───────── Tooltip ───────── */
  showTooltip (e,tr) {
    this.tooltipElement.innerHTML=`<div style="font-weight:600;margin-bottom:8px;color:#fff;font-size:15px;border-bottom:1px solid #404040;padding-bottom:6px;">${tr.original} → ${tr.translated}</div><div style="margin-bottom:6px;color:#e0e0e0;"><strong style='color:#fff;'>Meaning:</strong> ${tr.meaning}</div><div style='color:#e0e0e0;'><strong style='color:#fff;'>Pronunciation:</strong> ${tr.pronunciation}</div>`;
    const r=e.target.getBoundingClientRect();const top=r.bottom+(window.pageYOffset||document.documentElement.scrollTop)+5;const left=r.left+(window.pageXOffset||document.documentElement.scrollLeft);
    Object.assign(this.tooltipElement.style,{top:`${top}px`,left:`${left}px`,opacity:'1',display:'block'});
  }
  hideTooltip(){this.tooltipElement.style.opacity='0';this.tooltipElement.style.display='none';}

  /* ───────── SpeechSynthesis ───────── */
  playPronunciation (txt,_pron,btn){if(!window.speechSynthesis){this.showSpeechError(btn,'No speechSynthesis');return;}if(window.speechSynthesis.paused)window.speechSynthesis.resume();window.speechSynthesis.cancel();
    const utter=new SpeechSynthesisUtterance(txt);const langMap={fr:'fr-FR',es:'es-ES',de:'de-DE',it:'it-IT',pt:'pt-PT',ru:'ru-RU',ja:'ja-JP',ko:'ko-KR',zh:'zh-CN',ar:'ar-SA',hi:'hi-IN',nl:'nl-NL',sv:'sv-SE',no:'no-NO',da:'da-DK',pl:'pl-PL',tr:'tr-TR',he:'he-IL',th:'th-TH',vi:'vi-VN'};
    const code=langMap[this.settings.targetLanguage]||'en-US';const v=window.speechSynthesis.getVoices().find(v=>v.lang.toLowerCase()===code.toLowerCase()||v.lang.toLowerCase().startsWith(code.split('-')[0]));
    if(v) utter.voice=v; else utter.lang=code; utter.rate=.8;
    const orig=btn.innerHTML;btn.innerHTML='🔊';btn.style.opacity='1';btn.classList.add('playing');
    utter.onend=()=>{btn.innerHTML=orig;btn.style.opacity='.7';btn.classList.remove('playing');}; utter.onerror=()=>this.showSpeechError(btn,'synth error');
    try{window.speechSynthesis.speak(utter);}catch(e){this.showSpeechError(btn,e.message);} }
  showSpeechError(btn,m){console.error(m);const o=btn.innerHTML;btn.innerHTML='❌';btn.style.opacity='1';btn.classList.remove('playing');setTimeout(()=>{btn.innerHTML=o;btn.style.opacity='.7';},2e3);}

  /* ───────── Remove / Observer ───────── */
  removeTranslations(){document.querySelectorAll('.spurhacked-word').forEach(el=>el.replaceWith(document.createTextNode(el.dataset.original)));document.querySelectorAll('.spurhacked-translated').forEach(w=>w.replaceWith(document.createTextNode(w.textContent)));this.translations.clear();this.translatedWords.clear();}

  observeDOMChanges(){new MutationObserver(muts=>{if(!this.settings.translationEnabled) return;let flag=false;for(const m of muts){if(m.type==='childList'&&m.addedNodes.length){m.addedNodes.forEach(node=>{if(node.nodeType===Node.ELEMENT_NODE){if(node.classList.contains('spurhacked-translated')||node.classList.contains('spurhacked-word')||node.classList.contains('spurhacked-word-container')||node.querySelector('.spurhacked-translated')||node.querySelector('.spurhacked-word')) return;} if(node.nodeType===Node.TEXT_NODE||node.textContent) flag=true;});}}if(flag){clearTimeout(this.processTimeout);this.processTimeout=setTimeout(()=>this.processPage(),1000);}}).observe(document.body,{childList:true,subtree:true});}

  /* ───────── Stats handlers ───────── */
  updateStats(){const c=this.translations.size;chrome.storage.sync.set({wordsTranslated:c});chrome.runtime.sendMessage({action:'updateStats',count:c});}
  updateLearningStats(){chrome.runtime.sendMessage({action:'updateStats'});}

  /* ───────── Copy intercept ───────── */
  handleCopyEvent(e){const sel=window.getSelection();if(!sel.rangeCount) return;const r=sel.getRangeAt(0);const frag=r.cloneContents();if(!frag.querySelector('.spurhacked-word')) return;frag.querySelectorAll('.spurhacked-speaker-btn').forEach(b=>b.remove());frag.querySelectorAll('.spurhacked-word').forEach(sp=>{const orig=sp.dataset.original;const txt=sp.textContent;const cap=txt[0]===txt[0]?.toUpperCase();sp.replaceWith(document.createTextNode(cap?orig.charAt(0).toUpperCase()+orig.slice(1):orig));});const out=frag.textContent.replace(/\s+/g,' ').trim();e.preventDefault();e.clipboardData?e.clipboardData.setData('text/plain',out):window.clipboardData.setData('Text',out);} }

// Boot
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>new SpurHackedTranslator()); else new SpurHackedTranslator();

// ---- Language list (code, label) ----
  // Codes follow ISO 639-1 and match what the MyMemory API expects.
  const LANGUAGES = [
    ["en","English"], ["es","Spanish"], ["fr","French"], ["de","German"],
    ["it","Italian"], ["pt","Portuguese"], ["nl","Dutch"], ["ru","Russian"],
    ["zh","Chinese (Simplified)"], ["ja","Japanese"], ["ko","Korean"],
    ["ar","Arabic"], ["hi","Hindi"], ["bn","Bengali"], ["ur","Urdu"],
    ["tr","Turkish"], ["pl","Polish"], ["uk","Ukrainian"], ["vi","Vietnamese"],
    ["th","Thai"], ["id","Indonesian"], ["he","Hebrew"], ["el","Greek"],
    ["sv","Swedish"], ["fi","Finnish"], ["da","Danish"], ["no","Norwegian"],
    ["cs","Czech"], ["ro","Romanian"], ["hu","Hungarian"], ["sw","Swahili"],
    ["fa","Persian"], ["ms","Malay"], ["ta","Tamil"], ["te","Telugu"]
  ];

  // Maps an ISO code to a BCP-47 tag the browser's speech engine recognizes.
  const SPEECH_LOCALE = {
    en:"en-US", es:"es-ES", fr:"fr-FR", de:"de-DE", it:"it-IT", pt:"pt-PT",
    nl:"nl-NL", ru:"ru-RU", zh:"zh-CN", ja:"ja-JP", ko:"ko-KR", ar:"ar-SA",
    hi:"hi-IN", bn:"bn-BD", ur:"ur-PK", tr:"tr-TR", pl:"pl-PL", uk:"uk-UA",
    vi:"vi-VN", th:"th-TH", id:"id-ID", he:"he-IL", el:"el-GR", sv:"sv-SE",
    fi:"fi-FI", da:"da-DK", no:"no-NO", cs:"cs-CZ", ro:"ro-RO", hu:"hu-HU",
    sw:"sw-KE", fa:"fa-IR", ms:"ms-MY", ta:"ta-IN", te:"te-IN"
  };

  const sourceLangSel = document.getElementById("sourceLang");
  const targetLangSel = document.getElementById("targetLang");
  const sourceText = document.getElementById("sourceText");
  const outputText = document.getElementById("outputText");
  const charCount = document.getElementById("charCount");
  const targetCharCount = document.getElementById("targetCharCount");
  const statusBar = document.getElementById("statusBar");
  const swapBtn = document.getElementById("swapBtn");
  const copyBtn = document.getElementById("copyBtn");
  const speakSourceBtn = document.getElementById("speakSource");
  const speakTargetBtn = document.getElementById("speakTarget");
  const toast = document.getElementById("toast");

  let lastTranslation = "";
  let debounceTimer = null;

  function populateSelects(){
    LANGUAGES.forEach(([code, label]) => {
      const o1 = document.createElement("option");
      o1.value = code; o1.textContent = label;
      sourceLangSel.appendChild(o1);

      const o2 = document.createElement("option");
      o2.value = code; o2.textContent = label;
      targetLangSel.appendChild(o2);
    });
    sourceLangSel.value = "en";
    targetLangSel.value = "fr";
  }

  function setStatus(message, type){
    statusBar.textContent = message || "";
    statusBar.classList.remove("error", "success");
    if (type) statusBar.classList.add(type);
  }

  function showToast(message){
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1600);
  }

  // Renders the translated text with a brief "split-flap" reveal per character.
  function renderOutput(text){
    outputText.classList.remove("placeholder");
    outputText.innerHTML = "";
    const frag = document.createDocumentFragment();
    text.split("").forEach((ch, i) => {
      const span = document.createElement("span");
      span.className = "char";
      span.style.animationDelay = `${Math.min(i * 12, 600)}ms`;
      span.textContent = ch;
      frag.appendChild(span);
    });
    outputText.appendChild(frag);
    targetCharCount.textContent = `${text.length} characters`;
  }

  async function translate(){
    const text = sourceText.value.trim();
    const from = sourceLangSel.value;
    const to = targetLangSel.value;

    if (!text){
      outputText.textContent = "Translation will appear here…";
      outputText.classList.add("placeholder");
      targetCharCount.textContent = "";
      setStatus("");
      lastTranslation = "";
      return;
    }

    setStatus("Translating…");
    statusBar.insertAdjacentHTML("afterbegin", '<span class="dot"></span> ');

    try{
      const translated = await translateViaGoogle(text, from, to);
      lastTranslation = translated;
      renderOutput(translated);
      setStatus("Translated", "success");
    } catch (primaryErr){
      // Google's endpoint failed (rare) — fall back to MyMemory before giving up.
      try{
        const translated = await translateViaMyMemory(text, from, to);
        lastTranslation = translated;
        renderOutput(translated);
        setStatus("Translated", "success");
      } catch (fallbackErr){
        setStatus(fallbackErr.message || "Something went wrong. Please try again.", "error");
      }
    }
  }

  // ---- Primary: Google's translation engine, no key needed (default) ----
  // This is the free public endpoint Google's own "Translate" widget uses.
  // It gives noticeably better results than MyMemory for short or casual phrases.
  async function translateViaGoogle(text, from, to){
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    const data = await res.json();

    // The response is a nested array: data[0] is a list of [translatedChunk, originalChunk, ...]
    if (!Array.isArray(data) || !Array.isArray(data[0])){
      throw new Error("Unexpected response from translation service.");
    }
    return data[0].map(chunk => chunk[0]).join("");
  }

  // ---- Fallback: MyMemory's translation-memory API ----
  async function translateViaMyMemory(text, from, to){
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    const data = await res.json();
    if (!data.responseData || typeof data.responseData.translatedText !== "string"){
      throw new Error("Unexpected response from translation service.");
    }
    return data.responseData.translatedText;
  }

  /*
    ---- Swap in Google Cloud's official paid Translation API instead (optional) ----
    The official API requires an API key and billing enabled on a GCP project,
    and is meant to be called from a server (not directly from the browser)
    to avoid exposing your key. If you have a backend, you'd call:

    const res = await fetch("https://translation.googleapis.com/language/translate/v2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: from,
        target: to,
        key: "YOUR_SERVER_SIDE_API_KEY"
      })
    });
    const data = await res.json();
    const translated = data.data.translations[0].translatedText;
  */

  function debouncedTranslate(){
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(translate, 500);
  }

  function speak(text, langCode){
    if (!text) return;
    if (!("speechSynthesis" in window)){
      setStatus("Read-aloud isn't supported in this browser.", "error");
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = SPEECH_LOCALE[langCode] || langCode;
    window.speechSynthesis.speak(utter);
  }

  populateSelects();

  sourceText.addEventListener("input", () => {
    charCount.textContent = sourceText.value.length;
    debouncedTranslate();
  });

  sourceLangSel.addEventListener("change", translate);
  targetLangSel.addEventListener("change", translate);

  swapBtn.addEventListener("click", () => {
    swapBtn.classList.add("spin");
    setTimeout(() => swapBtn.classList.remove("spin"), 250);

    const tmpLang = sourceLangSel.value;
    sourceLangSel.value = targetLangSel.value;
    targetLangSel.value = tmpLang;

    const tmpText = sourceText.value;
    sourceText.value = lastTranslation || "";
    charCount.textContent = sourceText.value.length;
    translate();
  });

  copyBtn.addEventListener("click", async () => {
    if (!lastTranslation){
      showToast("Nothing to copy yet");
      return;
    }
    try{
      await navigator.clipboard.writeText(lastTranslation);
      showToast("Copied to clipboard");
    } catch {
      showToast("Couldn't copy — select text manually");
    }
  });

  speakSourceBtn.addEventListener("click", () => speak(sourceText.value, sourceLangSel.value));
  speakTargetBtn.addEventListener("click", () => speak(lastTranslation, targetLangSel.value));
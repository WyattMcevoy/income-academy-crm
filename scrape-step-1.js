// STEP 1: Fundability Foundation - Paste in console at business-credit-builder page
(async function scrapeStep1() {
  const BASE = 'https://kickstart.fundability.com';
  const STEP = 1;
  const STEP_NAME = 'Fundability Foundation';
  const STEP_PATH = '/business-credit-builder/step-1';
  const SUB_ITEMS = [
    'Business Address', 'Business Entity', 'Foreign Filing', 'Ownership',
    'EIN', 'Business Phone', 'Website and Email', 'Business Licenses',
    'Business Bank Account', 'Merchant Account', 'Business Industry', 'Time in Business'
  ];

  const results = { step: STEP, name: STEP_NAME, scrapedAt: new Date().toISOString(), subPages: [] };
  const delay = ms => new Promise(r => setTimeout(r, ms));

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1400px;height:900px;opacity:0;pointer-events:none;';
  document.body.appendChild(iframe);
  const waitLoad = () => new Promise(r => { iframe.onload = () => setTimeout(r, 3500); });

  function extract() {
    try {
      const doc = iframe.contentDocument;
      const win = iframe.contentWindow;
      if (!doc || !doc.body) return { error: 'no doc' };
      const page = { url: win.location.href, allText: [], optionCards: [], infoBox: null, buttons: [], formFields: [] };

      // All visible text
      const seen = new Set();
      doc.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,div,label,li,td,th,a').forEach(el => {
        const t = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim();
        if (t && t.length > 2 && t.length < 500 && !seen.has(t)) {
          seen.add(t);
          try {
            const cs = win.getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return;
            page.allText.push({ tag: el.tagName, text: t, className: (el.className || '').substring(0, 200), fontSize: cs.fontSize, fontWeight: cs.fontWeight, color: cs.color, bg: cs.backgroundColor, textTransform: cs.textTransform });
          } catch(e) {}
        }
      });

      // Info box
      doc.querySelectorAll('div').forEach(div => {
        try {
          const cs = win.getComputedStyle(div);
          const bg = cs.backgroundColor;
          if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'rgb(255, 255, 255)') {
            const t = div.textContent.trim();
            if (t.length > 20 && t.length < 1500 && (t.includes('?') || t === t.substring(0,50).toUpperCase())) {
              if (!page.infoBox || t.length > page.infoBox.text.length) {
                page.infoBox = { text: t, bg: bg, color: cs.color, className: (div.className||'').substring(0,200), padding: cs.padding, borderRadius: cs.borderRadius };
              }
            }
          }
        } catch(e) {}
      });

      // Option cards
      const skip = new Set(['Business Address','Business Entity','Foreign Filing','Ownership','EIN','Business Phone','Website and Email','Business Licenses','Business Bank Account','Merchant Account','Business Industry','Time in Business','Fundability Foundation','Bureau Profile Verification','Start Building: Tier 1','Monitor Business Reports','Building Credit: Tier 2','Advanced Building: Tier 3','Revolving Accounts: Tier 4','Business Credit Builder','Fundability Dashboard','Bureau Insights','Resource Market','Account Settings','View More','Next','Previous','Go Back','D&B Verification','Experian Verification','Equifax Verification','Addressing Inaccuracies','LexisNexis','Chex Systems','Paydex Score','Get 3 Reporting Vendor Accounts','Get 6 Reporting Vendor Accounts','Get 9 Reporting Vendor Accounts','Get 12 Reporting Vendor Accounts']);
      const cardTexts = new Set();
      doc.querySelectorAll('div,button,a,span').forEach(el => {
        try {
          const cs = win.getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden') return;
          if (cs.cursor !== 'pointer') return;
          const t = el.textContent.trim();
          if (!t || t.length > 150 || t.length < 1 || cardTexts.has(t) || skip.has(t)) return;
          if (t.match(/^step \d|Fundability Score|Trade Vendor|Approved Funding|Revenue vs|Business\s+Fundability|Funding\s+Manager|^KG/i)) return;
          const hasBorder = cs.border && !cs.border.includes('0px');
          const hasBg = cs.backgroundColor !== 'rgba(0, 0, 0, 0)';
          const big = parseInt(cs.width) > 100;
          if (hasBorder || hasBg || big || el.tagName === 'BUTTON') {
            cardTexts.add(t);
            const svg = el.querySelector('svg');
            page.optionCards.push({ text: t, icon: svg ? svg.outerHTML.substring(0,300) : null, className: (el.className||'').substring(0,200), border: cs.border, borderRadius: cs.borderRadius, bg: cs.backgroundColor, color: cs.color, width: cs.width, height: cs.height, padding: cs.padding });
          }
        } catch(e) {}
      });

      // Buttons
      doc.querySelectorAll('button,a').forEach(btn => {
        try {
          const t = btn.textContent.trim();
          if (!t || t.length > 50) return;
          const cs = win.getComputedStyle(btn);
          if (cs.display === 'none') return;
          if (['Next','Go Back','Previous'].includes(t)) {
            page.buttons.push({ text: t, className: (btn.className||'').substring(0,200), bg: cs.backgroundColor, color: cs.color, borderRadius: cs.borderRadius, padding: cs.padding, href: btn.href || null });
          }
        } catch(e) {}
      });

      // Forms
      doc.querySelectorAll('input,select,textarea').forEach(f => {
        try {
          const cs = win.getComputedStyle(f);
          if (cs.display === 'none') return;
          page.formFields.push({ tag: f.tagName, type: f.type, name: f.name, placeholder: f.placeholder, className: (f.className||'').substring(0,200), options: f.tagName === 'SELECT' ? Array.from(f.options).map(o => ({v:o.value,t:o.text})) : undefined });
        } catch(e) {}
      });

      return page;
    } catch(e) { return { error: e.message }; }
  }

  async function clickItem(text) {
    const doc = iframe.contentDocument;
    for (const el of doc.querySelectorAll('div,span,a,li,p')) {
      if (el.textContent.trim() === text) {
        try {
          const cs = iframe.contentWindow.getComputedStyle(el);
          if (cs.cursor === 'pointer' || el.tagName === 'A') { el.click(); await delay(3500); return extract(); }
        } catch(e) {}
        el.click(); await delay(3500); return extract();
      }
    }
    return null;
  }

  console.log(`%c[Step ${STEP}] 🚀 Scraping ${STEP_NAME} (${SUB_ITEMS.length} sub-pages)...`, 'color:#00b894;font-weight:bold;font-size:14px');

  // Get step overview
  iframe.src = BASE + STEP_PATH;
  await waitLoad();
  results.overview = extract();

  // Also grab the CSS on first run
  try {
    const doc = iframe.contentDocument;
    const cssUrl = Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).map(l=>l.href).find(u => u.includes('index.') && u.includes('.css'));
    if (cssUrl) { results.mainCSS = await (await fetch(cssUrl)).text(); console.log(`%c  Got CSS: ${(results.mainCSS.length/1024).toFixed(0)}KB`, 'color:#00b894'); }
    const stepCss = Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).map(l=>l.href).find(u => u.includes('BusinessCreditBuilder'));
    if (stepCss) { results.stepCSS = await (await fetch(stepCss)).text(); }
  } catch(e) {}

  for (let i = 0; i < SUB_ITEMS.length; i++) {
    const sub = SUB_ITEMS[i];
    console.log(`%c  [${i+1}/${SUB_ITEMS.length}] ${sub}`, 'color:#6c5ce7;font-weight:bold');

    iframe.src = BASE + STEP_PATH;
    await waitLoad(); await delay(500);
    const subPage = await clickItem(sub);

    if (subPage && !subPage.error) {
      subPage.name = sub;
      const subUrl = iframe.contentWindow.location.href;
      subPage.navigatedUrl = subUrl;
      console.log(`%c    📄 ${subUrl}`, 'color:#636e72');

      // Click each option
      if (subPage.optionCards.length > 0) {
        console.log(`%c    🔘 ${subPage.optionCards.length} options`, 'color:#636e72');
        subPage.optionResults = [];
        for (const card of subPage.optionCards) {
          try {
            iframe.src = subUrl;
            await waitLoad(); await delay(500);
            const doc2 = iframe.contentDocument;
            let clicked = false;
            for (const el of doc2.querySelectorAll('div,button,a,span')) {
              if (el.textContent.trim() === card.text) {
                try {
                  const cs = iframe.contentWindow.getComputedStyle(el);
                  if (cs.cursor === 'pointer' || el.tagName === 'BUTTON') {
                    el.click(); await delay(2500);
                    const after = extract();
                    const newUrl = iframe.contentWindow.location.href;
                    subPage.optionResults.push({ option: card.text, url: newUrl, changed: newUrl !== subUrl, page: after });
                    console.log(`%c      ✓ "${card.text}" → ${newUrl !== subUrl ? newUrl : 'same'}`, 'color:#00b894');
                    clicked = true; break;
                  }
                } catch(e) {}
              }
            }
            if (!clicked) subPage.optionResults.push({ option: card.text, error: 'no click' });
          } catch(e) { subPage.optionResults.push({ option: card.text, error: e.message }); }
        }
      }
      results.subPages.push(subPage);
    } else {
      results.subPages.push({ name: sub, error: subPage ? subPage.error : 'not found' });
    }
  }

  document.body.removeChild(iframe);
  const json = JSON.stringify(results, null, 2);
  console.log(`%c[Step ${STEP}] ✅ Done! ${results.subPages.length} sub-pages, ${(json.length/1024).toFixed(0)}KB`, 'color:#00b894;font-weight:bold;font-size:14px');
  try { await navigator.clipboard.writeText(json); console.log('%c  📋 Copied!','color:#00b894;font-weight:bold'); } catch(e) {}
  const dl = document.createElement('a'); dl.href = URL.createObjectURL(new Blob([json],{type:'application/json'}));
  dl.download = `fundability-step-${STEP}.json`; dl.textContent = `💾 Download Step ${STEP}`;
  dl.style.cssText = 'position:fixed;top:10px;right:10px;z-index:99999;background:#00b894;color:white;padding:15px 25px;border-radius:8px;font-size:16px;font-weight:bold;text-decoration:none;box-shadow:0 4px 15px rgba(0,0,0,0.3);cursor:pointer;';
  document.body.appendChild(dl);
})();

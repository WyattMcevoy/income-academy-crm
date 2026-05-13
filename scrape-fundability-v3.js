// Fundability Site Scraper V3 - Fixed version with error handling
// Paste into console while logged in at:
// https://kickstart.fundability.com/business-credit-builder

(async function scrapeFundabilityV3() {
  const BASE = 'https://kickstart.fundability.com';
  const results = {
    scrapedAt: new Date().toISOString(),
    baseUrl: BASE,
    globalStyles: {},
    steps: []
  };

  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1400px;height:900px;opacity:0;pointer-events:none;';
  document.body.appendChild(iframe);

  function waitForLoad() {
    return new Promise((resolve) => {
      iframe.onload = () => setTimeout(resolve, 3500);
    });
  }

  function getDoc() { return iframe.contentDocument; }
  function getWin() { return iframe.contentWindow; }

  function extractCurrentPage() {
    try {
      const doc = getDoc();
      if (!doc || !doc.body) return { error: 'No document' };

      const page = {
        url: getWin().location.href,
        title: doc.title,
        infoBox: null,
        optionCards: [],
        buttons: [],
        formFields: [],
        allText: [],
        contentHTML: '',
        links: []
      };

      // Get ALL visible text organized by element
      const textElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, label, li, td, th, a');
      const seenTexts = new Set();
      textElements.forEach(el => {
        const text = Array.from(el.childNodes)
          .filter(n => n.nodeType === 3)
          .map(n => n.textContent.trim())
          .join(' ')
          .trim();
        if (text && text.length > 2 && text.length < 500 && !seenTexts.has(text)) {
          seenTexts.add(text);
          try {
            const cs = getWin().getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return;
            page.allText.push({
              tag: el.tagName,
              text: text,
              className: el.className || '',
              fontSize: cs.fontSize,
              fontWeight: cs.fontWeight,
              color: cs.color,
              backgroundColor: cs.backgroundColor,
              textTransform: cs.textTransform
            });
          } catch(e) {}
        }
      });

      // Find info/question boxes (colored background with question text)
      doc.querySelectorAll('div').forEach(div => {
        try {
          const cs = getWin().getComputedStyle(div);
          const bg = cs.backgroundColor;
          if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'rgb(255, 255, 255)') {
            const text = div.textContent.trim();
            if (text.length > 20 && text.length < 2000) {
              if (text.includes('?') || bg.includes('25') || bg.includes('0, 6') || bg.includes('31')) {
                const existingBox = page.infoBox;
                if (!existingBox || text.length > existingBox.text.length) {
                  page.infoBox = {
                    text: text,
                    innerHTML: div.innerHTML,
                    backgroundColor: bg,
                    color: cs.color,
                    className: div.className,
                    padding: cs.padding,
                    borderRadius: cs.borderRadius
                  };
                }
              }
            }
          }
        } catch(e) {}
      });

      // Find option cards - look for cursor:pointer elements that aren't nav
      const cardTexts = new Set();
      // Known sidebar nav items to skip
      const skipTexts = new Set([
        'Business Address', 'Business Entity', 'Foreign Filing', 'Ownership',
        'EIN', 'Business Phone', 'Website and Email', 'Business Licenses',
        'Business Bank Account', 'Merchant Account', 'Business Industry',
        'Time in Business', 'D&B Verification', 'Experian Verification',
        'Equifax Verification', 'Addressing Inaccuracies', 'Bureau Insights',
        'LexisNexis', 'Chex Systems', 'Paydex Score',
        'Get 3 Reporting Vendor Accounts', 'Get 6 Reporting Vendor Accounts',
        'Get 9 Reporting Vendor Accounts', 'Get 12 Reporting Vendor Accounts',
        'Fundability Foundation', 'Bureau Profile Verification',
        'Start Building: Tier 1', 'Monitor Business Reports',
        'Building Credit: Tier 2', 'Advanced Building: Tier 3',
        'Revolving Accounts: Tier 4', 'Business Credit Builder',
        'Fundability Dashboard', 'Bureau Insights', 'Resource Market',
        'Account Settings', 'View More', 'Next', 'Previous', 'Go Back'
      ]);

      doc.querySelectorAll('div, button, a, span').forEach(el => {
        try {
          const cs = getWin().getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden') return;
          if (cs.cursor !== 'pointer') return;

          const text = el.textContent.trim();
          if (!text || text.length > 150 || text.length < 1) return;
          if (cardTexts.has(text)) return;
          if (skipTexts.has(text)) return;
          if (text.match(/^step \d/i)) return;
          if (text.match(/Fundability Score|Trade Vendor|Approved Funding|Revenue vs/i)) return;
          if (text.match(/^(Business\s+Fundability|Funding\s+Manager|KG)/i)) return;

          // Check if it's inside a card-like container
          const border = cs.border;
          const hasBorder = border && !border.includes('0px');
          const hasBackground = cs.backgroundColor !== 'rgba(0, 0, 0, 0)';
          const isLargeEnough = parseInt(cs.width) > 100 && parseInt(cs.height) > 40;

          if (hasBorder || hasBackground || isLargeEnough || el.tagName === 'BUTTON') {
            cardTexts.add(text);
            const svgEl = el.querySelector('svg');
            const imgEl = el.querySelector('img');
            page.optionCards.push({
              text: text,
              innerHTML: el.innerHTML.substring(0, 1000),
              icon: svgEl ? svgEl.outerHTML.substring(0, 500) : (imgEl ? { src: imgEl.src, alt: imgEl.alt } : null),
              className: el.className,
              border: cs.border,
              borderRadius: cs.borderRadius,
              backgroundColor: cs.backgroundColor,
              color: cs.color,
              width: cs.width,
              height: cs.height,
              padding: cs.padding
            });
          }
        } catch(e) {}
      });

      // Buttons
      doc.querySelectorAll('button, a').forEach(btn => {
        try {
          const text = btn.textContent.trim();
          if (!text || text.length > 50) return;
          const cs = getWin().getComputedStyle(btn);
          if (cs.display === 'none') return;
          if (text === 'Next' || text === 'Go Back' || text === 'Previous' || text.includes('Back')) {
            page.buttons.push({
              text: text,
              className: btn.className,
              backgroundColor: cs.backgroundColor,
              color: cs.color,
              borderRadius: cs.borderRadius,
              padding: cs.padding,
              href: btn.href || null
            });
          }
        } catch(e) {}
      });

      // Form fields
      doc.querySelectorAll('input, select, textarea').forEach(f => {
        try {
          const cs = getWin().getComputedStyle(f);
          if (cs.display === 'none') return;
          page.formFields.push({
            tagName: f.tagName,
            type: f.type,
            name: f.name,
            placeholder: f.placeholder,
            className: f.className,
            options: f.tagName === 'SELECT' ? Array.from(f.options).map(o => ({ value: o.value, text: o.text })) : undefined
          });
        } catch(e) {}
      });

      // Main content HTML
      try {
        const mainSelectors = ['[class*="content"]', 'main', '[class*="main"]', 'section'];
        for (const sel of mainSelectors) {
          const el = doc.querySelector(sel);
          if (el && el.innerHTML.length > 100) {
            page.contentHTML = el.innerHTML;
            break;
          }
        }
      } catch(e) {}

      // Links
      doc.querySelectorAll('a[href]').forEach(a => {
        try {
          if (a.href && a.href.startsWith(BASE)) {
            page.links.push({ text: a.textContent.trim().substring(0, 100), href: a.href });
          }
        } catch(e) {}
      });

      return page;
    } catch(e) {
      return { error: e.message, url: getWin().location.href };
    }
  }

  async function scrapePage(url) {
    console.log(`%c  Loading: ${url}`, 'color: #0984e3');
    iframe.src = url;
    await waitForLoad();
    await delay(1500);
    return extractCurrentPage();
  }

  async function clickSidebarItem(itemText) {
    const doc = getDoc();
    if (!doc) return null;

    const allElements = doc.querySelectorAll('div, span, a, li, p');
    let target = null;

    for (const el of allElements) {
      const text = el.textContent.trim();
      if (text === itemText || text.replace(/\s+/g, ' ') === itemText.replace(/\s+/g, ' ')) {
        try {
          const cs = getWin().getComputedStyle(el);
          if (cs.cursor === 'pointer' || el.tagName === 'A' || el.onclick) {
            target = el;
            break;
          }
          if (!target) target = el;
        } catch(e) {
          if (!target) target = el;
        }
      }
    }

    if (!target) {
      console.warn(`  ⚠ Could not find: "${itemText}"`);
      return null;
    }

    target.click();
    await delay(3500);
    return extractCurrentPage();
  }

  // ---- START ----
  console.log('%c[V3] 🚀 Starting deep crawl of all 7 steps...', 'color: #00b894; font-weight: bold; font-size: 14px');

  // Load main page and get CSS
  iframe.src = BASE + '/business-credit-builder';
  await waitForLoad();

  const mainDoc = getDoc();
  results.globalStyles = {
    font: 'Montserrat, sans-serif',
    stylesheetUrls: Array.from(mainDoc.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href),
    cssContent: ''
  };

  try {
    const cssUrl = results.globalStyles.stylesheetUrls.find(u => u.includes('index.') && u.includes('.css'));
    if (cssUrl) {
      results.globalStyles.cssContent = await (await fetch(cssUrl)).text();
      console.log(`%c[V3] Got CSS: ${(results.globalStyles.cssContent.length / 1024).toFixed(0)}KB`, 'color: #00b894');
    }
  } catch (e) {}

  // Also get the step-specific CSS
  try {
    const stepCssUrl = results.globalStyles.stylesheetUrls.find(u => u.includes('BusinessCreditBuilder'));
    if (stepCssUrl) {
      results.globalStyles.stepCssContent = await (await fetch(stepCssUrl)).text();
    }
  } catch (e) {}

  // ---- STEP DEFINITIONS ----
  const stepStructure = [
    {
      step: 1, name: 'Fundability Foundation', path: '/business-credit-builder/step-1',
      subItems: ['Business Address', 'Business Entity', 'Foreign Filing', 'Ownership',
        'EIN', 'Business Phone', 'Website and Email', 'Business Licenses',
        'Business Bank Account', 'Merchant Account', 'Business Industry', 'Time in Business']
    },
    {
      step: 2, name: 'Bureau Profile Verification', path: '/business-credit-builder/step-2',
      subItems: ['D&B Verification', 'Experian Verification', 'Equifax Verification', 'Addressing Inaccuracies']
    },
    {
      step: 3, name: 'Start Building: Tier 1', path: '/business-credit-builder/step-3',
      subItems: ['Get 3 Reporting Vendor Accounts']
    },
    {
      step: 4, name: 'Monitor Business Reports', path: '/business-credit-builder/step-4',
      subItems: ['Bureau Insights', 'LexisNexis', 'Chex Systems', 'Paydex Score']
    },
    {
      step: 5, name: 'Building Credit: Tier 2', path: '/business-credit-builder/step-5',
      subItems: ['Get 6 Reporting Vendor Accounts']
    },
    {
      step: 6, name: 'Advanced Building: Tier 3', path: '/business-credit-builder/step-6',
      subItems: ['Get 9 Reporting Vendor Accounts']
    },
    {
      step: 7, name: 'Revolving Accounts: Tier 4', path: '/business-credit-builder/step-7',
      subItems: ['Get 12 Reporting Vendor Accounts']
    }
  ];

  let totalSub = 0;
  let totalOpts = 0;

  for (const step of stepStructure) {
    console.log(`%c[V3] ══ STEP ${step.step}/${stepStructure.length}: ${step.name} ══`, 'color: #e17055; font-weight: bold; font-size: 13px');

    const stepOverview = await scrapePage(BASE + step.path);
    const stepData = {
      step: step.step,
      name: step.name,
      overviewUrl: BASE + step.path,
      overview: stepOverview,
      subPages: []
    };

    for (let si = 0; si < step.subItems.length; si++) {
      const subItem = step.subItems[si];
      console.log(`%c  [${si+1}/${step.subItems.length}] ${subItem}`, 'color: #6c5ce7; font-weight: bold');

      // Navigate to step overview first
      iframe.src = BASE + step.path;
      await waitForLoad();
      await delay(1000);

      // Click sidebar item
      const subPage = await clickSidebarItem(subItem);

      if (subPage && !subPage.error) {
        const currentUrl = getWin().location.href;
        console.log(`%c    📄 ${currentUrl}`, 'color: #636e72');
        subPage.subItemName = subItem;
        subPage.navigatedUrl = currentUrl;
        totalSub++;

        // Click each option card to see results
        if (subPage.optionCards.length > 0) {
          console.log(`%c    🔘 ${subPage.optionCards.length} options to check...`, 'color: #636e72');
          subPage.optionResults = [];

          for (let oi = 0; oi < subPage.optionCards.length; oi++) {
            const card = subPage.optionCards[oi];
            try {
              // Re-navigate to sub-page fresh
              iframe.src = currentUrl;
              await waitForLoad();
              await delay(1000);

              // Find and click this option
              const doc2 = getDoc();
              let clicked = false;
              const allEls = doc2.querySelectorAll('div, button, a, span');

              for (const el of allEls) {
                if (el.textContent.trim() === card.text) {
                  try {
                    const cs2 = getWin().getComputedStyle(el);
                    if (cs2.cursor === 'pointer' || cs2.border.includes('1px') || el.tagName === 'BUTTON') {
                      el.click();
                      await delay(2500);

                      const afterClick = extractCurrentPage();
                      const newUrl = getWin().location.href;
                      totalOpts++;

                      subPage.optionResults.push({
                        optionClicked: card.text,
                        resultUrl: newUrl,
                        urlChanged: newUrl !== currentUrl,
                        resultPage: afterClick
                      });

                      console.log(`%c      ✓ "${card.text}" → ${newUrl !== currentUrl ? 'NEW PAGE: ' + newUrl : 'same page'}`, 'color: #00b894');
                      clicked = true;
                      break;
                    }
                  } catch(e) {}
                }
              }

              if (!clicked) {
                subPage.optionResults.push({ optionClicked: card.text, error: 'Could not click' });
                console.log(`%c      ✗ "${card.text}" - could not click`, 'color: #e17055');
              }
            } catch(e) {
              subPage.optionResults.push({ optionClicked: card.text, error: e.message });
            }
          }
        }

        stepData.subPages.push(subPage);
      } else {
        console.warn(`%c    ✗ Failed to navigate to ${subItem}`, 'color: #e17055');
        stepData.subPages.push({ subItemName: subItem, error: subPage ? subPage.error : 'Navigation failed' });
      }
    }

    results.steps.push(stepData);
    console.log(`%c[V3] Step ${step.step} complete: ${stepData.subPages.length} sub-pages captured`, 'color: #00b894');
  }

  // ---- EXTRA PAGES ----
  console.log('%c[V3] Capturing extra pages...', 'color: #00b894');
  try { results.fundabilityDashboard = await scrapePage(BASE + '/fundability-dashboard'); } catch(e) {}
  try { results.bureauInsights = await scrapePage(BASE + '/fundability/bureau-insights'); } catch(e) {}
  try { results.resourceMarket = await scrapePage(BASE + '/resource-market'); } catch(e) {}

  // ---- DONE ----
  document.body.removeChild(iframe);

  const jsonStr = JSON.stringify(results, null, 2);

  console.log('%c═══════════════════════════════════════', 'color: #00b894; font-weight: bold');
  console.log(`%c[V3] ✅ COMPLETE!`, 'color: #00b894; font-weight: bold; font-size: 16px');
  console.log(`%c  📊 ${results.steps.length} steps`, 'color: #00b894; font-size: 13px');
  console.log(`%c  📄 ${totalSub} sub-pages`, 'color: #00b894; font-size: 13px');
  console.log(`%c  🔘 ${totalOpts} option clicks`, 'color: #00b894; font-size: 13px');
  console.log(`%c  💾 ${(jsonStr.length / 1024 / 1024).toFixed(2)}MB`, 'color: #00b894; font-size: 13px');
  console.log('%c═══════════════════════════════════════', 'color: #00b894; font-weight: bold');

  try {
    await navigator.clipboard.writeText(jsonStr);
    console.log('%c  📋 Copied to clipboard!', 'color: #00b894; font-weight: bold');
  } catch (e) {}

  const blob = new Blob([jsonStr], { type: 'application/json' });
  const dl = document.createElement('a');
  dl.href = URL.createObjectURL(blob);
  dl.download = 'fundability-deep-scrape-v3.json';
  dl.textContent = '💾 Download Complete Scrape';
  dl.style.cssText = 'position:fixed;top:10px;right:10px;z-index:99999;background:#00b894;color:white;padding:15px 25px;border-radius:8px;font-size:16px;font-weight:bold;text-decoration:none;box-shadow:0 4px 15px rgba(0,0,0,0.3);cursor:pointer;';
  document.body.appendChild(dl);

  console.log('%c  🟢 Download button in top-right corner', 'color: #00b894; font-weight: bold');
  return results;
})();

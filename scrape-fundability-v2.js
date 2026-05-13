// Fundability Site Scraper V2 - Deep sub-page crawl
// Paste this into your browser console while logged in at:
// https://kickstart.fundability.com/business-credit-builder
//
// This version clicks into every sidebar sub-item to capture the actual sub-pages.

(async function scrapeFundabilityV2() {
  const BASE = 'https://kickstart.fundability.com';
  const results = {
    scrapedAt: new Date().toISOString(),
    baseUrl: BASE,
    globalStyles: {},
    steps: []
  };

  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  // Create hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1400px;height:900px;opacity:0;pointer-events:none;';
  document.body.appendChild(iframe);

  function waitForLoad() {
    return new Promise((resolve) => {
      iframe.onload = () => setTimeout(resolve, 3000);
    });
  }

  function getDoc() { return iframe.contentDocument; }
  function getWin() { return iframe.contentWindow; }

  // Extract all meaningful content from the current page state
  function extractCurrentPage() {
    const doc = getDoc();
    if (!doc || !doc.body) return { error: 'No document' };

    const page = {
      url: iframe.contentWindow.location.href,
      title: doc.title,
      pageHeader: '',
      pageSubHeader: '',
      infoBox: null,
      descriptionText: [],
      optionCards: [],
      buttons: [],
      formFields: [],
      allText: [],
      contentHTML: '',
      links: []
    };

    // Get the Foundation / BUSINESS ADDRESS style header
    // Usually the main heading area at top of content
    const h1s = doc.querySelectorAll('h1, h2, h3, [class*="heading"], [class*="Heading"]');
    h1s.forEach(h => {
      const text = h.textContent.trim();
      if (text && text.length < 100) {
        page.allText.push({ tag: h.tagName, text, className: h.className });
      }
    });

    // Find the page header (e.g., "Foundation") and sub-header (e.g., "BUSINESS ADDRESS")
    // These are typically in the top area of the main content
    const headerArea = doc.querySelector('[class*="foreign-filing-content"], [class*="content"]') || doc.body;

    // Get ALL text nodes organized
    const textElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, label, li, td, th');
    const seenTexts = new Set();
    textElements.forEach(el => {
      // Only get direct text (not deeply nested)
      const text = Array.from(el.childNodes)
        .filter(n => n.nodeType === 3)
        .map(n => n.textContent.trim())
        .join(' ')
        .trim();
      if (text && text.length > 2 && text.length < 500 && !seenTexts.has(text)) {
        seenTexts.add(text);
        const cs = getWin().getComputedStyle(el);
        // Skip hidden elements
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
      }
    });

    // Find info/question boxes (the blue banner at top with icon)
    const allDivs = doc.querySelectorAll('div');
    allDivs.forEach(div => {
      const cs = getWin().getComputedStyle(div);
      const bg = cs.backgroundColor;
      // Look for colored background boxes (info banners)
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'rgb(255, 255, 255)') {
        const text = div.textContent.trim();
        if (text.length > 20 && text.length < 2000) {
          // Check if this looks like an info box (has question mark or is prominent)
          if (text.includes('?') || text.toUpperCase() === text.substring(0, 50).toUpperCase() || bg.includes('rgb(25,') || bg.includes('rgb(0,') || bg.includes('#')) {
            const existingBox = page.infoBox;
            if (!existingBox || text.length > existingBox.text.length) {
              page.infoBox = {
                text: text,
                innerHTML: div.innerHTML,
                backgroundColor: bg,
                color: cs.color,
                className: div.className
              };
            }
          }
        }
      }
    });

    // Find clickable option cards
    // These are the Yes/No, LLC/S Corp type selection cards
    const cardCandidates = doc.querySelectorAll(
      '[class*="card"], [class*="Card"], [class*="option"], [class*="Option"], ' +
      '[class*="choice"], [class*="cursor-pointer"], [role="button"], [role="radio"]'
    );
    const cardTexts = new Set();
    cardCandidates.forEach(el => {
      const text = el.textContent.trim();
      const cs = getWin().getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      // Filter to actual option cards (not nav items, not too long)
      if (text && text.length < 150 && !cardTexts.has(text)) {
        // Skip if this is clearly a nav/sidebar item
        if (text.match(/^(step \d|Bureau Insights|Resource Market|Business\s+Fund|Funding\s+Manager)/i)) return;
        if (text.match(/^(Business Address|Business Entity|Foreign Filing|Ownership|EIN|Business Phone|Website|Business Licenses|Business Bank|Merchant|Business Industry|Time in Business|D&B Verif|Experian Verif|Equifax Verif|Addressing|Bureau Insights|LexisNexis|Chex|Paydex|Get \d+)$/)) {
          // These are sidebar nav items, not option cards
          return;
        }

        const svgEl = el.querySelector('svg');
        const imgEl = el.querySelector('img');
        cardTexts.add(text);
        page.optionCards.push({
          text: text,
          innerHTML: el.innerHTML.substring(0, 500),
          icon: svgEl ? svgEl.outerHTML : (imgEl ? { src: imgEl.src, alt: imgEl.alt } : null),
          className: el.className,
          border: cs.border,
          borderRadius: cs.borderRadius,
          backgroundColor: cs.backgroundColor,
          cursor: cs.cursor,
          width: cs.width,
          height: cs.height
        });
      }
    });

    // If we didn't find cards above, try a broader search for clickable grid items
    if (page.optionCards.length === 0) {
      // Look for grid/flex containers with multiple similar children
      doc.querySelectorAll('[class*="grid"], [class*="flex"]').forEach(container => {
        const children = Array.from(container.children);
        if (children.length >= 2 && children.length <= 10) {
          const childTexts = children.map(c => c.textContent.trim());
          // If all children have short text, they're probably option cards
          if (childTexts.every(t => t.length < 100 && t.length > 0)) {
            children.forEach(child => {
              const text = child.textContent.trim();
              if (!cardTexts.has(text)) {
                cardTexts.add(text);
                const cs = getWin().getComputedStyle(child);
                const svgEl = child.querySelector('svg');
                page.optionCards.push({
                  text: text,
                  innerHTML: child.innerHTML.substring(0, 500),
                  icon: svgEl ? svgEl.outerHTML : null,
                  className: child.className,
                  border: cs.border,
                  borderRadius: cs.borderRadius,
                  backgroundColor: cs.backgroundColor,
                  cursor: cs.cursor
                });
              }
            });
          }
        }
      });
    }

    // Find buttons (Next, Go Back, etc.)
    doc.querySelectorAll('button, a[class*="btn"], a[class*="Btn"], [class*="button"], [class*="Button"]').forEach(btn => {
      const text = btn.textContent.trim();
      const cs = getWin().getComputedStyle(btn);
      if (text && cs.display !== 'none') {
        page.buttons.push({
          text: text,
          className: btn.className,
          backgroundColor: cs.backgroundColor,
          color: cs.color,
          borderRadius: cs.borderRadius,
          href: btn.href || null
        });
      }
    });

    // Find form fields
    doc.querySelectorAll('input, select, textarea').forEach(f => {
      const cs = getWin().getComputedStyle(f);
      if (cs.display === 'none') return;
      page.formFields.push({
        tagName: f.tagName,
        type: f.type,
        name: f.name,
        placeholder: f.placeholder,
        className: f.className,
        value: f.value || '',
        options: f.tagName === 'SELECT' ? Array.from(f.options).map(o => ({ value: o.value, text: o.text })) : undefined
      });
    });

    // Get the main content HTML (excluding sidebars)
    const mainContent = doc.querySelector('[class*="foreign-filing-content"], [class*="content"], main, [class*="main"]');
    if (mainContent) {
      page.contentHTML = mainContent.innerHTML;
    }

    // Collect all links
    doc.querySelectorAll('a[href]').forEach(a => {
      if (a.href.startsWith(BASE)) {
        page.links.push({ text: a.textContent.trim().substring(0, 100), href: a.href });
      }
    });

    return page;
  }

  // Navigate iframe via URL and extract page
  async function scrapePage(url) {
    console.log(`%c  Loading: ${url}`, 'color: #0984e3');
    iframe.src = url;
    await waitForLoad();
    await delay(1000); // Extra wait for SPA rendering
    return extractCurrentPage();
  }

  // Click a sidebar sub-item by text and extract the resulting page
  async function clickSidebarItem(itemText) {
    const doc = getDoc();
    if (!doc) return null;

    // Find the element with matching text in the sidebar
    const allElements = doc.querySelectorAll('div, span, a, li, p');
    let target = null;

    for (const el of allElements) {
      const text = el.textContent.trim();
      // Exact match or close match
      if (text === itemText || text.replace(/\s+/g, ' ') === itemText.replace(/\s+/g, ' ')) {
        // Prefer elements that look clickable
        const cs = getWin().getComputedStyle(el);
        if (cs.cursor === 'pointer' || el.tagName === 'A' || el.onclick || el.getAttribute('role') === 'button') {
          target = el;
          break;
        }
        if (!target) target = el;
      }
    }

    if (!target) {
      console.warn(`  Could not find sidebar item: "${itemText}"`);
      return null;
    }

    // Click it
    target.click();
    await delay(3000); // Wait for SPA navigation

    return extractCurrentPage();
  }

  // ---- EXTRACT GLOBAL STYLES ----
  console.log('%c[Scraper V2] Starting deep crawl...', 'color: #00b894; font-weight: bold; font-size: 14px');

  // Load the main page first to get styles
  iframe.src = BASE + '/business-credit-builder';
  await waitForLoad();

  // Extract stylesheets
  const mainDoc = getDoc();
  results.globalStyles = {
    font: 'Montserrat, sans-serif',
    bodyColor: 'rgb(6, 16, 23)',
    stylesheetUrls: Array.from(mainDoc.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href),
    // Try to get the main CSS file content
    cssContent: ''
  };

  // Fetch the main CSS file
  try {
    const cssUrl = results.globalStyles.stylesheetUrls.find(u => u.includes('index.') && u.includes('.css'));
    if (cssUrl) {
      const cssResp = await fetch(cssUrl);
      results.globalStyles.cssContent = await cssResp.text();
      console.log(`%c[Scraper V2] Captured main CSS (${(results.globalStyles.cssContent.length / 1024).toFixed(1)}KB)`, 'color: #00b894');
    }
  } catch (e) {
    console.warn('[Scraper V2] Could not fetch CSS:', e.message);
  }

  // ---- DEFINE STEP STRUCTURE ----
  // From the initial scrape, we know the steps and their sub-items
  const stepStructure = [
    {
      step: 1,
      name: 'Fundability Foundation',
      path: '/business-credit-builder/step-1',
      subPath: 'foundation',
      subItems: [
        'Business Address', 'Business Entity', 'Foreign Filing', 'Ownership',
        'EIN', 'Business Phone', 'Website and Email', 'Business Licenses',
        'Business Bank Account', 'Merchant Account', 'Business Industry', 'Time in Business'
      ]
    },
    {
      step: 2,
      name: 'Bureau Profile Verification',
      path: '/business-credit-builder/step-2',
      subPath: 'bureau-verification',
      subItems: ['D&B Verification', 'Experian Verification', 'Equifax Verification', 'Addressing Inaccuracies']
    },
    {
      step: 3,
      name: 'Start Building: Tier 1',
      path: '/business-credit-builder/step-3',
      subPath: 'tier-1',
      subItems: ['Get 3 Reporting Vendor Accounts']
    },
    {
      step: 4,
      name: 'Monitor Business Reports',
      path: '/business-credit-builder/step-4',
      subPath: 'monitor',
      subItems: ['Bureau Insights', 'LexisNexis', 'Chex Systems', 'Paydex Score']
    },
    {
      step: 5,
      name: 'Building Credit: Tier 2',
      path: '/business-credit-builder/step-5',
      subPath: 'tier-2',
      subItems: ['Get 6 Reporting Vendor Accounts']
    },
    {
      step: 6,
      name: 'Advanced Building: Tier 3',
      path: '/business-credit-builder/step-6',
      subPath: 'tier-3',
      subItems: ['Get 9 Reporting Vendor Accounts']
    },
    {
      step: 7,
      name: 'Revolving Accounts: Tier 4',
      path: '/business-credit-builder/step-7',
      subPath: 'tier-4',
      subItems: ['Get 12 Reporting Vendor Accounts']
    }
  ];

  // ---- SCRAPE EACH STEP AND SUB-PAGE ----
  for (const step of stepStructure) {
    console.log(`%c[Scraper V2] === STEP ${step.step}: ${step.name} ===`, 'color: #e17055; font-weight: bold');

    // Load the step overview page
    const stepOverview = await scrapePage(BASE + step.path);

    const stepData = {
      step: step.step,
      name: step.name,
      overviewUrl: BASE + step.path,
      overview: stepOverview,
      subPages: []
    };

    // Now click into each sub-item
    for (const subItem of step.subItems) {
      console.log(`%c  → Sub-item: ${subItem}`, 'color: #6c5ce7');

      // First, make sure we're on the step overview page
      iframe.src = BASE + step.path;
      await waitForLoad();
      await delay(1000);

      // Click the sub-item in the sidebar
      const subPage = await clickSidebarItem(subItem);

      if (subPage) {
        // Check if the URL changed (indicating successful navigation)
        const currentUrl = iframe.contentWindow.location.href;
        console.log(`%c    URL: ${currentUrl}`, 'color: #636e72');

        subPage.subItemName = subItem;
        subPage.navigatedUrl = currentUrl;

        // Now try clicking each option card on this sub-page to see what happens
        // First, record the options available
        if (subPage.optionCards.length > 0) {
          console.log(`%c    Found ${subPage.optionCards.length} option cards, checking each...`, 'color: #636e72');
          subPage.optionResults = [];

          for (const card of subPage.optionCards) {
            // Re-navigate to the sub-page fresh
            iframe.src = currentUrl;
            await waitForLoad();
            await delay(1000);

            // Find and click this specific option
            const doc2 = getDoc();
            const allClickables = doc2.querySelectorAll('[class*="card"], [class*="Card"], [class*="option"], [class*="cursor-pointer"], [role="button"], [role="radio"]');
            let clicked = false;

            for (const el of allClickables) {
              if (el.textContent.trim() === card.text) {
                el.click();
                await delay(2000);

                const afterClick = extractCurrentPage();
                const newUrl = iframe.contentWindow.location.href;

                subPage.optionResults.push({
                  optionClicked: card.text,
                  resultUrl: newUrl,
                  urlChanged: newUrl !== currentUrl,
                  resultPage: afterClick
                });

                clicked = true;
                console.log(`%c      Option "${card.text}" → ${newUrl !== currentUrl ? newUrl : '(same page, content may have changed)'}`, 'color: #636e72');
                break;
              }
            }

            if (!clicked) {
              subPage.optionResults.push({
                optionClicked: card.text,
                error: 'Could not find/click element'
              });
            }
          }
        }

        // Also try clicking the "Next" button to see where it leads
        const nextBtn = getDoc().querySelector('a[href*="Next"], button:has-text("Next"), a:has-text("Next")');
        // Actually let's just check the links for a Next button
        const nextLink = subPage.links.find(l => l.text === 'Next' || l.text.includes('Next'));
        if (nextLink) {
          subPage.nextUrl = nextLink.href;
        }

        stepData.subPages.push(subPage);
      } else {
        stepData.subPages.push({ subItemName: subItem, error: 'Could not navigate to sub-page' });
      }
    }

    results.steps.push(stepData);
  }

  // ---- ALSO CAPTURE THE FUNDABILITY DASHBOARD ----
  console.log('%c[Scraper V2] Capturing Fundability Dashboard...', 'color: #00b894');
  try {
    results.fundabilityDashboard = await scrapePage(BASE + '/fundability-dashboard');
  } catch (e) {
    results.fundabilityDashboard = { error: e.message };
  }

  // ---- CAPTURE BUREAU INSIGHTS PAGE ----
  console.log('%c[Scraper V2] Capturing Bureau Insights...', 'color: #00b894');
  try {
    results.bureauInsights = await scrapePage(BASE + '/fundability/bureau-insights');
  } catch (e) {
    results.bureauInsights = { error: e.message };
  }

  // ---- CAPTURE RESOURCE MARKET ----
  console.log('%c[Scraper V2] Capturing Resource Market...', 'color: #00b894');
  try {
    results.resourceMarket = await scrapePage(BASE + '/resource-market');
  } catch (e) {
    results.resourceMarket = { error: e.message };
  }

  // ---- CLEANUP ----
  document.body.removeChild(iframe);

  // ---- OUTPUT ----
  const jsonStr = JSON.stringify(results, null, 2);
  const totalSubPages = results.steps.reduce((sum, s) => sum + s.subPages.length, 0);
  const totalOptionResults = results.steps.reduce((sum, s) =>
    sum + s.subPages.reduce((sum2, sp) => sum2 + (sp.optionResults ? sp.optionResults.length : 0), 0), 0);

  console.log(`%c[Scraper V2] DONE!`, 'color: #00b894; font-weight: bold; font-size: 16px');
  console.log(`%c  Steps: ${results.steps.length}`, 'color: #00b894');
  console.log(`%c  Sub-pages: ${totalSubPages}`, 'color: #00b894');
  console.log(`%c  Option click results: ${totalOptionResults}`, 'color: #00b894');
  console.log(`%c  JSON size: ${(jsonStr.length / 1024).toFixed(1)}KB`, 'color: #00b894');

  // Copy to clipboard
  try {
    await navigator.clipboard.writeText(jsonStr);
    console.log('%c  ✅ Copied to clipboard!', 'color: #00b894; font-weight: bold');
  } catch (e) {
    console.log('%c  Could not auto-copy, use download button', 'color: #e17055');
  }

  // Download button
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const downloadUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = downloadUrl;
  downloadLink.download = 'fundability-deep-scrape.json';
  downloadLink.textContent = '💾 Download Deep Scrape Data';
  downloadLink.style.cssText = 'position:fixed;top:10px;right:10px;z-index:99999;background:#00b894;color:white;padding:15px 25px;border-radius:8px;font-size:16px;font-weight:bold;text-decoration:none;box-shadow:0 4px 15px rgba(0,0,0,0.3);cursor:pointer;';
  document.body.appendChild(downloadLink);

  console.log('%c  Green download button is in the top-right corner.', 'color: #00b894; font-weight: bold');

  return results;
})();

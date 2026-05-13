// Fundability Site Scraper - Paste this into your browser console while logged in
// at https://kickstart.fundability.com/business-credit-builder
// It will crawl every step, sub-page, and option without navigating away.

(async function scrapeFundabilitySite() {
  const BASE = 'https://kickstart.fundability.com';
  const results = {
    scrapedAt: new Date().toISOString(),
    baseUrl: BASE,
    globalLayout: {},
    steps: [],
    sidebarNav: [],
    otherPages: []
  };

  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  // Create a hidden iframe for scraping without disrupting the current page
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1400px;height:900px;opacity:0;pointer-events:none;';
  document.body.appendChild(iframe);

  async function loadPage(url) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`Timeout loading ${url}`)), 30000);
      iframe.onload = () => {
        clearTimeout(timeout);
        // Wait for React/SPA to render
        setTimeout(() => resolve(iframe.contentDocument), 3000);
      };
      iframe.src = url;
    });
  }

  function extractText(el) {
    return el ? el.textContent.trim() : '';
  }

  function extractStyles(el) {
    if (!el) return {};
    const cs = iframe.contentWindow.getComputedStyle(el);
    return {
      backgroundColor: cs.backgroundColor,
      color: cs.color,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      fontFamily: cs.fontFamily,
      padding: cs.padding,
      margin: cs.margin,
      borderRadius: cs.borderRadius,
      border: cs.border,
      boxShadow: cs.boxShadow,
      display: cs.display,
      width: cs.width,
      maxWidth: cs.maxWidth,
    };
  }

  function extractImage(el) {
    if (!el) return null;
    if (el.tagName === 'IMG') return { type: 'img', src: el.src, alt: el.alt };
    if (el.tagName === 'SVG' || el.querySelector('svg')) {
      const svg = el.tagName === 'SVG' ? el : el.querySelector('svg');
      return { type: 'svg', html: svg.outerHTML };
    }
    // Check for background image
    const bg = iframe.contentWindow.getComputedStyle(el).backgroundImage;
    if (bg && bg !== 'none') return { type: 'bg', value: bg };
    return null;
  }

  function extractAllImages(doc) {
    const images = [];
    doc.querySelectorAll('img').forEach(img => {
      images.push({ type: 'img', src: img.src, alt: img.alt, className: img.className });
    });
    doc.querySelectorAll('svg').forEach(svg => {
      images.push({ type: 'svg', html: svg.outerHTML, className: svg.getAttribute('class') || '' });
    });
    return images;
  }

  function extractLinks(doc) {
    const links = [];
    doc.querySelectorAll('a[href]').forEach(a => {
      links.push({ text: a.textContent.trim(), href: a.href, className: a.className });
    });
    return links;
  }

  // Extract the full HTML structure of the main content area
  function extractContentHTML(doc) {
    // Try to find the main content area (excluding sidebar nav)
    const main = doc.querySelector('main') || doc.querySelector('[class*="content"]') || doc.querySelector('[class*="main"]');
    if (main) return main.innerHTML;
    // Fallback: get body minus known sidebars
    const body = doc.body.cloneNode(true);
    body.querySelectorAll('nav, [class*="sidebar"], [class*="Sidebar"]').forEach(el => el.remove());
    return body.innerHTML;
  }

  // Extract option cards (the selectable buttons/cards on each sub-page)
  function extractOptionCards(doc) {
    const cards = [];
    // Look for card-like elements - these are typically divs with click handlers in a grid
    const selectors = [
      '[class*="card"]', '[class*="Card"]',
      '[class*="option"]', '[class*="Option"]',
      '[class*="choice"]', '[class*="Choice"]',
      '[class*="select"]', '[class*="Select"]',
      '[role="button"]', '[role="radio"]',
      'button:not([class*="nav"]):not([class*="Next"]):not([class*="Back"])'
    ];

    const seen = new Set();
    selectors.forEach(sel => {
      doc.querySelectorAll(sel).forEach(el => {
        const text = el.textContent.trim();
        if (text && text.length < 200 && !seen.has(text) && !text.match(/^(Next|Go Back|Back|Login|Sign|Bureau|Resource|Funding|Business\s*(Fundability|Funding)|Step \d)$/i)) {
          seen.add(text);
          const icon = extractImage(el.querySelector('svg, img, [class*="icon"], [class*="Icon"]'));
          cards.push({
            text: text,
            className: el.className,
            tagName: el.tagName,
            icon: icon,
            styles: extractStyles(el),
            innerHTML: el.innerHTML,
            dataAttributes: Array.from(el.attributes)
              .filter(a => a.name.startsWith('data-'))
              .reduce((acc, a) => ({ ...acc, [a.name]: a.value }), {})
          });
        }
      });
    });
    return cards;
  }

  // Extract the info/question box at the top of each sub-page
  function extractInfoBox(doc) {
    // Look for the blue info box with question
    const candidates = doc.querySelectorAll('[class*="info"], [class*="Info"], [class*="alert"], [class*="Alert"], [class*="banner"], [class*="Banner"], [class*="header-card"], [class*="question"]');
    for (const el of candidates) {
      const text = el.textContent.trim();
      if (text.length > 20 && text.length < 2000) {
        return {
          fullText: text,
          innerHTML: el.innerHTML,
          icon: extractImage(el.querySelector('svg, img, [class*="icon"]')),
          styles: extractStyles(el),
          className: el.className
        };
      }
    }
    // Fallback: look for h1/h2/h3 with uppercase text (question headers)
    for (const h of doc.querySelectorAll('h1, h2, h3, h4, h5, h6, [class*="title"], [class*="Title"], [class*="heading"], [class*="Heading"]')) {
      const text = h.textContent.trim();
      if (text.length > 10 && (text === text.toUpperCase() || text.includes('?'))) {
        return {
          fullText: text,
          innerHTML: h.parentElement ? h.parentElement.innerHTML : h.innerHTML,
          styles: extractStyles(h),
          className: h.className
        };
      }
    }
    return null;
  }

  // Extract full page structure
  function extractFullPage(doc, url) {
    const page = {
      url: url,
      title: doc.title,
      // Get ALL text content organized by element
      headings: [],
      paragraphs: [],
      infoBox: extractInfoBox(doc),
      optionCards: extractOptionCards(doc),
      buttons: [],
      forms: [],
      images: extractAllImages(doc),
      links: extractLinks(doc),
      contentHTML: extractContentHTML(doc),
      fullBodyClasses: doc.body ? doc.body.className : '',
      stylesheets: Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href),
      inlineStyles: Array.from(doc.querySelectorAll('style')).map(s => s.textContent),
    };

    // Headings
    doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
      page.headings.push({ tag: h.tagName, text: extractText(h), className: h.className, styles: extractStyles(h) });
    });

    // Paragraphs and text blocks
    doc.querySelectorAll('p, [class*="description"], [class*="Description"], [class*="text"], [class*="subtitle"]').forEach(p => {
      const text = extractText(p);
      if (text.length > 5) {
        page.paragraphs.push({ text: text, className: p.className, tagName: p.tagName, styles: extractStyles(p) });
      }
    });

    // Buttons
    doc.querySelectorAll('button, [class*="btn"], [class*="Btn"], [class*="button"], [class*="Button"], a[class*="btn"], a[class*="Btn"]').forEach(btn => {
      page.buttons.push({ text: extractText(btn), className: btn.className, styles: extractStyles(btn), href: btn.href || null });
    });

    // Forms and inputs
    doc.querySelectorAll('form, input, select, textarea').forEach(f => {
      page.forms.push({
        tagName: f.tagName,
        type: f.type || null,
        name: f.name || null,
        placeholder: f.placeholder || null,
        className: f.className,
        label: f.labels ? Array.from(f.labels).map(l => l.textContent.trim()) : []
      });
    });

    return page;
  }

  // ---- SCRAPE THE MAIN DASHBOARD PAGE FIRST ----
  console.log('%c[Scraper] Starting... Loading main dashboard', 'color: #00b894; font-weight: bold');

  try {
    const mainDoc = await loadPage(BASE + '/business-credit-builder');
    console.log('%c[Scraper] Main page loaded, extracting layout...', 'color: #00b894');

    // Extract global layout elements
    results.globalLayout = {
      logo: extractImage(mainDoc.querySelector('[class*="logo"], [class*="Logo"], header img, nav img')),
      sidebar: {},
      header: {},
      colorScheme: {},
    };

    // Extract sidebar navigation items
    const sidebarItems = mainDoc.querySelectorAll('nav a, [class*="sidebar"] a, [class*="Sidebar"] a, [class*="nav"] a, [class*="Nav"] a, [class*="menu"] a, [class*="Menu"] a');
    sidebarItems.forEach(item => {
      results.sidebarNav.push({
        text: extractText(item),
        href: item.href,
        className: item.className,
        icon: extractImage(item.querySelector('svg, img')),
        styles: extractStyles(item)
      });
    });

    // Extract the main dashboard page fully
    results.dashboardPage = extractFullPage(mainDoc, BASE + '/business-credit-builder');

    // ---- FIND ALL STEP LINKS ----
    // Look for step items in the sidebar/navigation
    const stepLinks = [];
    const allLinks = mainDoc.querySelectorAll('a[href]');
    allLinks.forEach(a => {
      const href = a.href;
      if (href.includes('/step-') || href.includes('/foundation') || href.includes('/bureau') || href.includes('/tier') || href.includes('/monitor') || href.includes('/revolving') || href.includes('/building') || href.includes('/advanced')) {
        stepLinks.push({ text: extractText(a), href: href });
      }
    });

    // Also extract step navigation from the right sidebar
    const rightSidebar = mainDoc.querySelector('[class*="step"], [class*="Step"]');
    if (rightSidebar) {
      results.globalLayout.rightSidebar = {
        innerHTML: rightSidebar.innerHTML,
        styles: extractStyles(rightSidebar)
      };
    }

    // ---- DISCOVER ALL SUB-PAGE URLS ----
    // Strategy: load each step page, find all sub-item links in the sidebar
    const stepUrls = [
      '/business-credit-builder' // main page has step list
    ];

    // First, collect all navigable links from the main page
    const discoveredUrls = new Set();
    allLinks.forEach(a => {
      if (a.href.startsWith(BASE) && a.href.includes('business-credit-builder')) {
        discoveredUrls.add(a.href);
      }
    });

    console.log(`%c[Scraper] Found ${discoveredUrls.size} initial links. Crawling sub-pages...`, 'color: #00b894');

    // ---- CRAWL EACH DISCOVERED PAGE ----
    // We'll do a BFS crawl - visit each page, discover new links, repeat
    const visited = new Set();
    const toVisit = Array.from(discoveredUrls);
    const allPages = [];
    let pageCount = 0;

    while (toVisit.length > 0) {
      const url = toVisit.shift();
      if (visited.has(url)) continue;
      visited.add(url);

      // Skip non-relevant URLs
      if (!url.includes('business-credit-builder') && !url.includes('fundability-dashboard')) continue;
      if (url.includes('signin') || url.includes('logout') || url.includes('account')) continue;

      pageCount++;
      console.log(`%c[Scraper] [${pageCount}] Loading: ${url}`, 'color: #0984e3');

      try {
        const doc = await loadPage(url);
        const pageData = extractFullPage(doc, url);

        // Discover new links on this page
        doc.querySelectorAll('a[href]').forEach(a => {
          const href = a.href.split('#')[0].split('?')[0]; // Clean URL
          if (href.startsWith(BASE) && !visited.has(href) && !toVisit.includes(href)) {
            if (href.includes('business-credit-builder') || href.includes('fundability')) {
              toVisit.push(href);
            }
          }
        });

        // Also look for links in onclick handlers or data attributes that might reveal navigation
        doc.querySelectorAll('[onclick], [data-href], [data-url], [data-link]').forEach(el => {
          const val = el.getAttribute('onclick') || el.getAttribute('data-href') || el.getAttribute('data-url') || el.getAttribute('data-link');
          if (val) {
            const match = val.match(/['"](\/[^'"]+)['"]/);
            if (match) {
              const newUrl = BASE + match[1];
              if (!visited.has(newUrl) && !toVisit.includes(newUrl)) {
                toVisit.push(newUrl);
              }
            }
          }
        });

        // Try to find the step sidebar to discover all sub-page links
        doc.querySelectorAll('[class*="sidebar"] a, [class*="Sidebar"] a, [class*="step"] a, [class*="Step"] a, [class*="nav"] a').forEach(a => {
          const href = a.href.split('#')[0].split('?')[0];
          if (href.startsWith(BASE) && !visited.has(href) && !toVisit.includes(href)) {
            toVisit.push(href);
          }
        });

        allPages.push(pageData);
        console.log(`%c[Scraper]   → Found ${pageData.optionCards.length} options, ${pageData.headings.length} headings`, 'color: #636e72');

      } catch (err) {
        console.warn(`[Scraper] Failed to load ${url}:`, err.message);
        allPages.push({ url: url, error: err.message });
      }

      // Small delay to not hammer the server
      await delay(500);
    }

    results.allPages = allPages;
    results.totalPages = allPages.length;

    // ---- EXTRACT CSS/THEME ----
    console.log('%c[Scraper] Extracting theme and styles...', 'color: #00b894');

    // Get computed styles for key elements from the last loaded page
    try {
      const themeDoc = await loadPage(BASE + '/business-credit-builder');
      const body = themeDoc.body;
      if (body) {
        const bodyStyles = iframe.contentWindow.getComputedStyle(body);
        results.globalLayout.colorScheme = {
          bodyBg: bodyStyles.backgroundColor,
          bodyColor: bodyStyles.color,
          bodyFont: bodyStyles.fontFamily,
        };
      }

      // Try to extract CSS custom properties (CSS variables)
      const rootStyles = iframe.contentWindow.getComputedStyle(themeDoc.documentElement);
      const cssVars = {};
      // Common CSS variable names
      ['--primary', '--secondary', '--accent', '--bg', '--text', '--border', '--success', '--warning', '--error', '--info',
       '--primary-color', '--secondary-color', '--background-color', '--text-color', '--border-color',
       '--font-family', '--font-size', '--heading-font', '--body-font',
       '--sidebar-width', '--sidebar-bg', '--header-height', '--content-max-width',
       '--card-bg', '--card-border', '--card-shadow', '--card-radius',
       '--btn-primary-bg', '--btn-primary-color', '--btn-radius'].forEach(v => {
        const val = rootStyles.getPropertyValue(v);
        if (val) cssVars[v] = val.trim();
      });
      results.globalLayout.cssVariables = cssVars;

      // Get all stylesheets content if same-origin
      results.globalLayout.stylesheetUrls = Array.from(themeDoc.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href);

      // Extract inline styles
      results.globalLayout.inlineStyles = Array.from(themeDoc.querySelectorAll('style')).map(s => s.textContent).filter(s => s.length > 0);

    } catch (e) {
      console.warn('[Scraper] Theme extraction error:', e.message);
    }

    // ---- ALSO CHECK FUNDABILITY DASHBOARD ----
    console.log('%c[Scraper] Checking Fundability Dashboard...', 'color: #00b894');
    try {
      const dashDoc = await loadPage(BASE + '/fundability-dashboard');
      results.fundabilityDashboard = extractFullPage(dashDoc, BASE + '/fundability-dashboard');
    } catch (e) {
      console.warn('[Scraper] Dashboard load error:', e.message);
    }

    // ---- CLEANUP ----
    document.body.removeChild(iframe);

    // ---- OUTPUT ----
    const jsonStr = JSON.stringify(results, null, 2);
    console.log(`%c[Scraper] DONE! Scraped ${results.totalPages} pages. JSON size: ${(jsonStr.length / 1024).toFixed(1)}KB`, 'color: #00b894; font-weight: bold; font-size: 14px');
    console.log('%c[Scraper] Copying to clipboard...', 'color: #00b894');

    // Try to copy to clipboard
    try {
      await navigator.clipboard.writeText(jsonStr);
      console.log('%c[Scraper] ✅ Copied to clipboard! Paste it back to Claude.', 'color: #00b894; font-weight: bold; font-size: 16px');
    } catch (e) {
      console.log('%c[Scraper] Could not auto-copy. Use the download instead.', 'color: #e17055');
    }

    // Also create a download link
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = 'fundability-site-scrape.json';
    downloadLink.textContent = '💾 Download Scraped Data';
    downloadLink.style.cssText = 'position:fixed;top:10px;right:10px;z-index:99999;background:#00b894;color:white;padding:15px 25px;border-radius:8px;font-size:16px;font-weight:bold;text-decoration:none;box-shadow:0 4px 15px rgba(0,0,0,0.3);cursor:pointer;';
    document.body.appendChild(downloadLink);

    console.log('%c[Scraper] A green download button has appeared in the top-right corner of the page.', 'color: #00b894; font-weight: bold');
    console.log('%c[Scraper] Click it to download the JSON file, then share it with Claude.', 'color: #00b894');

    // Also log a truncated preview
    console.log('%c[Scraper] Preview (first 500 chars):', 'color: #636e72');
    console.log(jsonStr.substring(0, 500) + '...');

    return results;

  } catch (err) {
    document.body.removeChild(iframe);
    console.error('[Scraper] Fatal error:', err);
    throw err;
  }
})();

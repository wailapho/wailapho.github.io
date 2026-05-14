/* ============================================================
   Acker · Bordeaux 2025 En Primeur — main.js
   ------------------------------------------------------------
   Handles:
     1. Mobile hamburger menu
     2. Sticky-header shadow on scroll
     3. Scroll-spy for the nav (active link)
     4. Reveal-on-scroll animations
     5. Building mailto links with prefilled subjects for Arthur
     6. Rendering wines + releases from either a Google Sheet
        (live updates) OR an embedded starter array (fallback,
        so the page renders before the Sheet is wired up).
   ============================================================ */

/* ─────────────────────────────────────────────────────────────
   1. SHEET CONFIG  ← paste your two gids, flip ENABLED, save
   ─────────────────────────────────────────────────────────────
   We use Google's "Publish to web" CSV endpoint, one URL per tab.
   The PUBLISH_ID is already filled in from your published sheet.
   All you still need are the two gids (one per tab):

     1. Open the sheet in the Google Sheets editor (not /pubhtml).
     2. Click the "Wines" tab — the URL bar shows  ...#gid=NUMBER.
        Paste that number into GID_WINES below.
     3. Click the "Releases" tab — copy that gid too.
     4. Set ENABLED to true, save the file, refresh the page.

   The page falls back to the starter data baked in below
   until the gids are filled in, so it stays fully functional
   in the meantime.
   ─────────────────────────────────────────────────────────── */
var SHEET = {
  ENABLED:      true,
  PUBLISH_ID:   '2PACX-1vTmJQphCeTFmi2DgWPm1rY89Np0fjiJBJinEtTygY8UC3dsWaIqbcNhGJySu8viSSdjRmv9OC_A1y0W',
  GID_WINES:    '142329619',
  GID_RELEASES: '777895814'
};

function sheetUrl(gid) {
  return 'https://docs.google.com/spreadsheets/d/e/' + SHEET.PUBLISH_ID +
         '/pub?gid=' + encodeURIComponent(gid) + '&single=true&output=csv';
}

/* ─────────────────────────────────────────────────────────────
   2. MAILTO HELPERS — every CTA on the page routes here
   ─────────────────────────────────────────────────────────── */
var ARTHUR = 'Arthur@ackeruk.com';
var SUBJECT_PREFIX = 'Bordeaux 2025 En Primeur';

function mailto(subject, body) {
  var url = 'mailto:' + ARTHUR + '?subject=' + encodeURIComponent(subject);
  if (body) url += '&body=' + encodeURIComponent(body);
  return url;
}

function reserveMailto(wineName, price) {
  var priceLine = price ? '\nEn Primeur price shown: ' + price + '\n' : '';
  return mailto(SUBJECT_PREFIX + ' — Reserve: ' + wineName,
                'Hi Arthur,\n\nI would like to reserve ' + wineName + ' from the Bordeaux 2025 En Primeur campaign.\n' + priceLine + '\nQuantity / format:\n\nMany thanks,');
}

function releaseMailto(wine, date, price) {
  var priceLine = price ? '\nEn Primeur price shown: ' + price + '\n' : '';
  return mailto(SUBJECT_PREFIX + ' — Release: ' + wine + ' (' + date + ')',
                'Hi Arthur,\n\nI would like to register interest in ' + wine + ', released ' + date + '.\n' + priceLine + '\nQuantity / format:\n\nMany thanks,');
}

/* ─────────────────────────────────────────────────────────────
   3. STARTER DATA — used until the Sheet is wired up
   ─────────────────────────────────────────────────────────── */
var STARTER = {
  wines: [
    // RECOMMENDED — Right Bank
    { section: 'Recommended', region: 'St-Émilion',     name: 'Ch Ausone',           note: 'Aromatically inviting, with a gracefully delicious palate.', price: '', bank: 'right' },
    { section: 'Recommended', region: 'St-Émilion',     name: 'Ch Cheval Blanc',     note: 'Effortlessly understated, with depth, breadth and length.', price: '£1,005/3 | $1,365/3', bank: 'right' },
    { section: 'Recommended', region: 'Pomerol',        name: 'Ch La Conseillante',  note: 'Full of energy and power, simply delicious.', price: '', bank: 'right' },
    { section: 'Recommended', region: 'St-Émilion',     name: 'Ch Beausejour',       note: 'Josephine has made a truly wonderful wine, her best so far.', price: '', bank: 'right' },
    { section: 'Recommended', region: 'Pomerol',        name: "Ch l'Evangile",       note: 'Kaleidoscopic ripe but wild fruit with elegance to match.', price: '£582/6 | $825/6', bank: 'right' },
    { section: 'Recommended', region: 'St-Émilion',     name: 'Ch Figeac',           note: 'Simply wonderful. Pure and precise. Contender for Right Bank wine of the vintage.', price: '', bank: 'right' },
    { section: 'Recommended', region: 'St-Émilion',     name: 'Ch Troplong Mondot',  note: 'Another storming vintage from Aymeric showcasing the best of the year.', price: '', bank: 'right' },
    { section: 'Recommended', region: 'Pomerol',        name: 'Vieux Ch Certan',     note: 'Such intensity, yet not big or blowsy. Approachable when young but built to last.', price: '', bank: 'right' },
    // RECOMMENDED — Left Bank
    { section: 'Recommended', region: 'Pessac-Léognan', name: 'Ch Haut Brion',       note: 'Effortless complexity and depth — a benchmark First Growth.', price: '', bank: 'left' },
    { section: 'Recommended', region: 'Margaux',        name: 'Ch Margaux',          note: 'Outstanding First Growth, seriously impressive. Nominee for best Left Bank wine.', price: '', bank: 'left' },
    { section: 'Recommended', region: 'St-Estèphe',     name: 'Ch Montrose',         note: 'Broad but balanced, great complex aromatics and superb concentration.', price: '', bank: 'left' },
    { section: 'Recommended', region: 'Pauillac',       name: 'Ch Mouton Rothschild',note: 'Almost pipping Margaux — a less brooding Mouton, more juicy and delicious.', price: '', bank: 'left' },
    { section: 'Recommended', region: 'Margaux',        name: 'Ch Palmer',           note: "An unctuously dense spiced nose, with a palate that's seriously impressive.", price: '', bank: 'left' },

    // WATCH — Left & Right
    { section: 'Watch', region: 'St-Julien',      name: 'Ch Beychevelle',           note: "After last year's disappointment on price, this year's quality is right up there.", price: '', bank: 'left' },
    { section: 'Watch', region: 'Pomerol',        name: 'Ch le Bon Pasteur',        note: 'Top Pomerol — fruit-forward and energetic.', price: '', bank: 'right' },
    { section: 'Watch', region: 'Margaux',        name: 'Ch Brane Cantenac',        note: 'A Second Growth Margaux for a reason — succulent and perfumed.', price: '', bank: 'left' },
    { section: 'Watch', region: 'St-Julien',      name: 'Ch Branaire-Ducru',        note: 'François-Xavier has leaned into the vintage and built a beauty.', price: '', bank: 'left' },
    { section: 'Watch', region: 'Pessac-Léognan', name: 'Ch Carmes Haut Brion',     note: 'Not as big or showy a Carmes as expected, but dense, ripe and moreish.', price: '', bank: 'left' },
    { section: 'Watch', region: 'Pessac-Léognan', name: 'Domaine de Chevalier',     note: 'Classic Graves bouquet and a ripe juicy palate to match.', price: '', bank: 'left' },
    { section: 'Watch', region: 'St-Émilion',     name: 'Ch Canon',                 note: 'A richer Canon than previous years — it may not be subtle but it is classy.', price: '', bank: 'right' },
    { section: 'Watch', region: 'Margaux',        name: "Ch d'Issan",               note: 'With Margaux overperforming this year, this is Issan turned up to the max, but with acidity to balance.', price: '', bank: 'left' },
    { section: 'Watch', region: 'St-Émilion',     name: 'Ch Larcis Ducasse',        note: 'Impressively well made.', price: '', bank: 'right' },
    { section: 'Watch', region: 'Pessac-Léognan', name: 'Ch Larrivet Haut Brion',   note: 'A mini Carmes, with a long Black-Forest gateau finish.', price: '', bank: 'left' },
    { section: 'Watch', region: 'St-Julien',      name: 'Ch Leoville Barton',       note: 'Coolly intense, high-toned and solidly good.', price: '', bank: 'left' },
    { section: 'Watch', region: 'Pauillac',       name: 'Ch Pontet Canet',          note: "Beautifully judged, aromatically satisfying wine that's succulent and enticing.", price: '£378/6 | $540/6', bank: 'left' },
    { section: 'Watch', region: 'Pauillac',       name: 'Ch Pichon Comtesse Lalande', note: 'High-toned, juicy, and concentrated.', price: '', bank: 'left' },
    { section: 'Watch', region: 'Margaux',        name: 'Ch Rauzan Segla',          note: 'Once again this is stylistically Pauillac yet coming from Margaux, very impressive.', price: '', bank: 'left' },
    { section: 'Watch', region: 'Pomerol',        name: 'Ch Rouget',                note: 'Ripe and rounded Pomerol.', price: '', bank: 'right' }
  ],
  releases: [
    { date: '29 Apr', name: 'Ch Pontet Canet',         price: '£378/6 | $540/6' },
    { date: '30 Apr', name: 'Ch Batailley',            price: '' },
    { date: '6 May',  name: 'Ch Larrivet Haut Brion',  price: '' },
    { date: '19 May', name: 'Ch Gruaud Larose',        price: '' },
    { date: '20 May', name: 'Ch Leoville Barton',      price: '' }
  ]
};

/* ─────────────────────────────────────────────────────────────
   4. CSV PARSER — handles quoted fields with commas / newlines
   ─────────────────────────────────────────────────────────── */
function parseCsv(text) {
  var rows = [], row = [], field = '', inQuotes = false;
  for (var i = 0; i < text.length; i++) {
    var ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { field += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { row.push(field); field = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (field !== '' || row.length) { row.push(field); rows.push(row); row = []; field = ''; }
        if (ch === '\r' && text[i + 1] === '\n') i++;
      } else { field += ch; }
    }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  if (!rows.length) return [];
  var headers = rows.shift().map(function (h) { return h.trim().toLowerCase(); });
  return rows
    .filter(function (r) { return r.some(function (c) { return c && c.trim(); }); })
    .map(function (r) {
      var obj = {};
      headers.forEach(function (h, idx) { obj[h] = (r[idx] || '').trim(); });
      return obj;
    });
}

function fetchSheet(gid) {
  return fetch(sheetUrl(gid), { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('sheet fetch ' + r.status); return r.text(); })
    .then(parseCsv);
}

/* ─────────────────────────────────────────────────────────────
   5. RENDERERS
   ─────────────────────────────────────────────────────────── */
function isShown(row) {
  var s = (row.status || '').toLowerCase();
  return s !== 'hide' && s !== 'hidden' && s !== 'no' && s !== 'false';
}

function renderWines(rows) {
  var rec = document.getElementById('wines-recommended');
  var wat = document.getElementById('wines-watch');
  var recCount = document.getElementById('wines-recommended-count');
  var watCount = document.getElementById('wines-watch-count');
  if (!rec || !wat) return;

  rec.innerHTML = '';
  wat.innerHTML = '';

  var recRows = [], watRows = [];
  rows.forEach(function (r) {
    if (!isShown(r)) return;
    var section = (r.section || '').toLowerCase();
    if (section.indexOf('recommend') !== -1) recRows.push(r);
    else if (section.indexOf('watch') !== -1) watRows.push(r);
  });

  function card(r) {
    var bank = (r.bank || '').toLowerCase().indexOf('right') !== -1 ? 'right' : 'left';
    var name = r.name || '';
    var region = r.region || '';
    var note = r.note || '';
    var price = (r.price || '').trim();
    var priceHtml = price
      ? '<div class="wine-price">' +
          '<div class="wine-price-label">En Primeur Price</div>' +
          '<div class="wine-price-value">' + escapeHtml(price) + '</div>' +
        '</div>'
      : '';
    var div = document.createElement('div');
    div.className = 'wine-card';
    div.setAttribute('data-bank', bank);
    div.innerHTML =
      '<div class="wine-region">' + escapeHtml(region) + '</div>' +
      '<div class="wine-name">' + escapeHtml(name) + '</div>' +
      '<p class="wine-note">' + escapeHtml(note) + '</p>' +
      priceHtml +
      '<a class="wine-cta" href="' + reserveMailto(name, price) + '">Reserve →</a>';
    return div;
  }

  if (recRows.length === 0) rec.innerHTML = '<div class="wines-empty">Recommendations will appear here.</div>';
  else recRows.forEach(function (r) { rec.appendChild(card(r)); });

  if (watRows.length === 0) wat.innerHTML = '<div class="wines-empty">Wines to watch will appear here.</div>';
  else watRows.forEach(function (r) { wat.appendChild(card(r)); });

  if (recCount) recCount.textContent = recRows.length + ' wines';
  if (watCount) watCount.textContent = watRows.length + ' wines';

  applyFilter(document.querySelector('.chip.active'));
}

function renderReleases(rows) {
  var grid = document.getElementById('release-grid');
  if (!grid) return;
  grid.innerHTML = '';
  var shown = rows.filter(isShown);
  if (!shown.length) {
    grid.innerHTML = '<div class="releases-empty">Release dates will appear here as wines are released.</div>';
    return;
  }
  shown.forEach(function (r) {
    var date = r.date || '';
    var name = r.name || '';
    var price = (r.price || '').trim();
    var priceHtml = price ? '<div class="release-price">' + escapeHtml(price) + '</div>' : '';
    var a = document.createElement('a');
    a.className = 'release-item';
    a.href = releaseMailto(name, date, price);
    a.innerHTML =
      '<div class="release-date">' + escapeHtml(date) + '</div>' +
      '<div class="release-name">' + escapeHtml(name) + '</div>' +
      priceHtml +
      '<span class="release-cta">Register Interest</span>';
    grid.appendChild(a);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

/* ─────────────────────────────────────────────────────────────
   6. FILTER CHIPS (All / Left Bank / Right Bank)
   ─────────────────────────────────────────────────────────── */
function applyFilter(chip) {
  if (!chip) return;
  var filter = chip.dataset.filter || 'all';
  document.querySelectorAll('.wine-card').forEach(function (card) {
    if (filter === 'all') card.style.display = 'flex';
    else card.style.display = (card.dataset.bank === filter) ? 'flex' : 'none';
  });
}

/* ─────────────────────────────────────────────────────────────
   7. INIT — once DOM is ready
   ─────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {

  // ─── Wire up mailto on the hero & wishlist static buttons ──
  document.querySelectorAll('[data-mailto]').forEach(function (el) {
    var kind = el.getAttribute('data-mailto');
    if (kind === 'interested') el.href = mailto(SUBJECT_PREFIX + " — I'm Interested",
      "Hi Arthur,\n\nI'm interested in the Bordeaux 2025 En Primeur campaign — please get in touch with details.\n\nMany thanks,");
    else if (kind === 'wishlist') el.href = mailto(SUBJECT_PREFIX + ' — Wish-list',
      "Hi Arthur,\n\nMy Bordeaux 2025 En Primeur wish-list:\n\n— \n— \n— \n\nMany thanks,");
    else if (kind === 'consult') el.href = mailto(SUBJECT_PREFIX + ' — Speak to the team',
      "Hi Arthur,\n\nI'd like to speak with someone about the Bordeaux 2025 En Primeur campaign.\n\nMany thanks,");
  });

  // ─── Render starter content immediately ─────────────────────
  renderWines(STARTER.wines);
  renderReleases(STARTER.releases);

  // ─── Try Sheet override (and keep refreshing it) ───────────
  var gidsReady = SHEET.GID_WINES && SHEET.GID_WINES !== 'PASTE_WINES_TAB_GID_HERE'
               && SHEET.GID_RELEASES && SHEET.GID_RELEASES !== 'PASTE_RELEASES_TAB_GID_HERE';

  function pullSheetData() {
    if (!(SHEET.ENABLED && SHEET.PUBLISH_ID && gidsReady)) return;
    fetchSheet(SHEET.GID_WINES)
      .then(function (rows) { if (rows.length) renderWines(rows); })
      .catch(function (e) { console.warn('[Sheet] Wines fetch failed — using starter data.', e); });
    fetchSheet(SHEET.GID_RELEASES)
      .then(function (rows) { if (rows.length) renderReleases(rows); })
      .catch(function (e) { console.warn('[Sheet] Releases fetch failed — using starter data.', e); });
  }

  // Initial pull
  pullSheetData();
  // Auto-refresh every 5 min so already-open tabs reflect sheet edits without a manual reload
  setInterval(pullSheetData, 5 * 60 * 1000);

  // ─── Filter chips ──────────────────────────────────────────
  document.querySelectorAll('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      document.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      applyFilter(chip);
    });
  });

  // ─── Hamburger / mobile nav ────────────────────────────────
  var hamburger = document.getElementById('hamburger');
  var mobileNav = document.getElementById('mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = mobileNav.classList.toggle('open');
      var spans = hamburger.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
      } else { resetHamburger(); }
    });
    document.querySelectorAll('.mobile-link').forEach(function (l) {
      l.addEventListener('click', function () { mobileNav.classList.remove('open'); resetHamburger(); });
    });
    document.addEventListener('click', function (e) {
      if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        mobileNav.classList.remove('open'); resetHamburger();
      }
    });
  }
  function resetHamburger() {
    if (!hamburger) return;
    var spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = ''; spans[1].style.opacity = ''; spans[2].style.transform = '';
  }

  // ─── Sticky-header shadow ──────────────────────────────────
  var headerTop = document.getElementById('header-top');
  window.addEventListener('scroll', function () {
    if (headerTop) headerTop.style.boxShadow = window.scrollY > 10 ? '0 4px 24px rgba(0,0,0,0.5)' : 'none';
  });

  // ─── Scroll-spy: highlight the active nav link ─────────────
  // Pick up every element that a nav link actually points to,
  // including the theme <article>s (small/classical/...).
  var sectionIds = Array.prototype.map.call(
    document.querySelectorAll('.nav-link[data-section]'),
    function (l) { return l.dataset.section; }
  );
  var sections = sectionIds
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  var navLinks = document.querySelectorAll('.nav-link[data-section]');
  var OFFSET = 140;
  function setActive() {
    var current = '';
    sections.forEach(function (sec) {
      if (window.scrollY >= sec.offsetTop - OFFSET) current = sec.id;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();

  // ─── Reveal-on-scroll ──────────────────────────────────────
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(22px)';
      el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
      observer.observe(el);
    });
  }
});

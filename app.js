/* ============================================================
   PORTFOLIO APP — Google Sheets CMS + routing + rendering
   ============================================================ */

// ---------- CONFIG ----------
const CONFIG = {
  // Google Sheets "Publish to web" ID (everything after /d/e/ in the URL)
  PUBLISH_ID: '2PACX-1vSnvCQCkEuaStabK0hXEymAxKgHl_r6zvO2ObCahmeyXOGH6dd_hStySQT7wucd_LIXKJcrD1gNI9DO',

  // gid of each tab — from each tab's URL after publishing
  TABS: {
    settings: '1064445661',
    projects: '2017465380',
  },

  // Cache duration (ms). Sheet refetches after this. Set to 0 to disable cache.
  CACHE_MS: 60 * 1000,

  // Pagination: initial number of tiles shown
  INITIAL_TILES: 8,
};

// ============================================================
// CSV PARSING (handles quoted strings, commas, newlines)
// ============================================================
function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const c = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (c === '"' && next === '"') {
        cell += '"';
        i += 2;
        continue;
      }
      if (c === '"') {
        inQuotes = false;
        i++;
        continue;
      }
      cell += c;
      i++;
    } else {
      if (c === '"') {
        inQuotes = true;
        i++;
        continue;
      }
      if (c === ',') {
        row.push(cell);
        cell = '';
        i++;
        continue;
      }
      if (c === '\r') { i++; continue; }
      if (c === '\n') {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = '';
        i++;
        continue;
      }
      cell += c;
      i++;
    }
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function csvToObjects(csvText) {
  const rows = parseCSV(csvText.trim());
  if (rows.length === 0) return [];
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (row[i] || '').trim(); });
    return obj;
  });
}

// ============================================================
// FETCH SHEET DATA
// ============================================================
async function fetchSheet(tabKey) {
  const gid = CONFIG.TABS[tabKey];
  if (!CONFIG.PUBLISH_ID || CONFIG.PUBLISH_ID === 'YOUR_PUBLISH_ID' || !gid) {
    return null;
  }
  const url = `https://docs.google.com/spreadsheets/d/e/${CONFIG.PUBLISH_ID}/pub?gid=${gid}&single=true&output=csv`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
    const text = await res.text();
    return csvToObjects(text);
  } catch (err) {
    console.error(`Failed to fetch ${tabKey}:`, err);
    return null;
  }
}

// ============================================================
// DATA STORE
// ============================================================
const STORE = {
  settings: {},
  projects: [],
  loaded: false,
  loadedAt: 0,
};

function settingsArrayToObject(arr) {
  const obj = {};
  arr.forEach(row => {
    if (row.Key || row.key) {
      obj[row.Key || row.key] = row.Value || row.value || '';
    }
  });
  return obj;
}

async function loadData() {
  const fresh = Date.now() - STORE.loadedAt < CONFIG.CACHE_MS;
  if (STORE.loaded && fresh) return;

  const [settingsRows, projectRows] = await Promise.all([
    fetchSheet('settings'),
    fetchSheet('projects'),
  ]);

  if (settingsRows) {
    STORE.settings = settingsArrayToObject(settingsRows);
  } else {
    STORE.settings = FALLBACK.settings;
  }

  if (projectRows) {
    STORE.projects = projectRows
      .filter(p => (p.visible || '').toLowerCase() !== 'false' && p.id)
      .map((p, i) => ({
        ...p,
        number: String(i + 1).padStart(2, '0'),
      }));
  } else {
    STORE.projects = FALLBACK.projects.map((p, i) => ({
      ...p,
      number: String(i + 1).padStart(2, '0'),
    }));
  }

  STORE.loaded = true;
  STORE.loadedAt = Date.now();
}

// ============================================================
// FALLBACK DATA — used when SHEET_ID isn't configured
// ============================================================
const FALLBACK = {
  settings: {
    name: 'Your Name',
    location: 'Perth, Australia',
    tagline: 'Designer working across motion, image, and dimension.',
    hero_description: 'Independent practice working with brands on video, identity, and 3D animation across the Asia-Pacific.',
    about_text: 'Designer based in Perth, working with brands and studios across the Asia-Pacific.',
    email: 'hello@yourname.com',
    status: 'Available Q3',
    since: 'Since 2020',
    services: 'Brand identity, Motion design, 3D animation, Video edit',
    clients: 'Studio Saito, Aurora Co., Onyx Mag, Mori & Sons',
    social_instagram: 'https://instagram.com',
    social_vimeo: 'https://vimeo.com',
    social_arena: 'https://are.na',
    social_linkedin: 'https://linkedin.com',
    copyright: '© 2026',
  },
  projects: [
    {
      id: 'aurora-brand-film', title: 'Aurora — Brand film', category: 'motion',
      year: '2026', type: 'film', duration: '02:14', size: 'large',
      thumbnail: '', media: '', client: 'Aurora Co.', role: 'Direction, motion',
      description: 'A short brand film exploring movement and light. Shot over three days in Western Australia.',
      gallery: '', visible: 'TRUE',
    },
    {
      id: 'mori-identity', title: 'Mori Identity', category: 'graphic',
      year: '2025', type: 'image', duration: '', size: 'small',
      thumbnail: '', media: '', client: 'Mori & Sons', role: 'Brand identity, art direction',
      description: 'Full identity system for a third-generation tea house in Kyoto.',
      gallery: '', visible: 'TRUE',
    },
    {
      id: 'glass-studies', title: 'Glass Studies', category: '3d',
      year: '2025', type: '3d-loop', duration: '00:08', size: 'small',
      thumbnail: '', media: '', client: 'Self-initiated', role: '3D, animation',
      description: 'Material studies exploring refraction and caustics.',
      gallery: '', visible: 'TRUE',
    },
    {
      id: 'saito-posters', title: 'Saito Posters', category: 'graphic',
      year: '2024', type: 'image', duration: '', size: 'small',
      thumbnail: '', media: '', client: 'Studio Saito', role: 'Graphic design',
      description: 'Series of A1 posters for a contemporary art biennale.',
      gallery: '', visible: 'TRUE',
    },
    {
      id: 'hush-titles', title: 'Hush — Title sequence', category: 'motion',
      year: '2025', type: 'film', duration: '00:42', size: 'small',
      thumbnail: '', media: '', client: 'Onyx Mag', role: 'Motion design, type',
      description: 'Opening title sequence for an independent feature.',
      gallery: '', visible: 'TRUE',
    },
    {
      id: 'onyx-redesign', title: 'Onyx — Full system redesign', category: 'graphic',
      year: '2025', type: 'case-study', duration: '', size: 'feature',
      thumbnail: '', media: '', client: 'Onyx Magazine', role: 'Identity, motion, web',
      description: 'Complete brand and digital system redesign for a quarterly art magazine.',
      gallery: '', visible: 'TRUE',
    },
    {
      id: 'kioku-editorial', title: 'Kioku Editorial', category: 'graphic',
      year: '2024', type: 'image', duration: '', size: 'small',
      thumbnail: '', media: '', client: 'Kioku Press', role: 'Editorial design',
      description: 'Editorial design for an annual print publication.',
      gallery: '', visible: 'TRUE',
    },
    {
      id: 'hover-demo', title: 'Hover state demo', category: 'motion',
      year: '2025', type: 'film', duration: '00:42', size: 'large',
      thumbnail: '', media: '', client: 'Demo', role: 'Direction',
      description: 'Demonstrating hover-to-play on the work grid.',
      gallery: '', visible: 'TRUE',
    },
  ],
};

// ============================================================
// HELPERS
// ============================================================
function isVideoURL(url) {
  if (!url) return false;
  return /\.(mp4|mov|webm|m4v)(\?|$)/i.test(url) || url.includes('/video/upload/');
}

function typeLabel(type) {
  const map = {
    'film': 'Film',
    'image': 'Image',
    '3d': '3D',
    '3d-loop': '3D loop',
    'case-study': 'Case study',
  };
  return map[type] || type;
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function setText(selector, text) {
  document.querySelectorAll(selector).forEach(el => { el.textContent = text || ''; });
}

function bindSettings(scope = document) {
  const s = STORE.settings;
  scope.querySelectorAll('[data-bind]').forEach(el => {
    const key = el.dataset.bind;
    if (key in s && s[key]) {
      if (key === 'services' || key === 'clients') {
        // Render as line-break list
        el.innerHTML = s[key].split(',').map(x => escapeHTML(x.trim())).join('<br>');
      } else if (key === 'services_list') {
        el.innerHTML = (s.services || '').split(',').map(x => escapeHTML(x.trim())).join('<br>');
      } else if (key === 'clients_list') {
        el.innerHTML = (s.clients || '').split(',').map(x => escapeHTML(x.trim())).join('<br>');
      } else if (key === 'work_count') {
        el.textContent = `Selected work — ${STORE.projects.length}`;
      } else {
        el.textContent = s[key];
      }
    } else if (key === 'work_count') {
      el.textContent = `Selected work — ${STORE.projects.length}`;
    } else if (key === 'services_list') {
      el.innerHTML = (s.services || '').split(',').map(x => escapeHTML(x.trim())).join('<br>');
    } else if (key === 'clients_list') {
      el.innerHTML = (s.clients || '').split(',').map(x => escapeHTML(x.trim())).join('<br>');
    }
  });
  scope.querySelectorAll('[data-bind-href]').forEach(el => {
    const key = el.dataset.bindHref;
    if (key === 'email' && s.email) {
      el.href = `mailto:${s.email}`;
    } else if (s[key]) {
      el.href = s[key];
    }
  });
  document.title = `${s.name || 'Designer'} — Portfolio`;
}

function renderSocials(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const s = STORE.settings;
  const socials = [
    { key: 'social_instagram', label: 'Instagram' },
    { key: 'social_vimeo', label: 'Vimeo' },
    { key: 'social_arena', label: 'Are.na' },
    { key: 'social_linkedin', label: 'LinkedIn' },
  ];
  container.innerHTML = socials
    .filter(s2 => s[s2.key])
    .map(s2 => `<a href="${escapeHTML(s[s2.key])}" target="_blank" rel="noopener">${s2.label}</a>`)
    .join('');
}

// ============================================================
// HOME VIEW: WORK GRID
// ============================================================
let currentFilter = 'all';
let visibleTileCount = CONFIG.INITIAL_TILES;

function renderWorkGrid() {
  const grid = document.getElementById('work-grid');
  if (!grid) return;

  const filtered = STORE.projects.filter(p =>
    currentFilter === 'all' || p.category === currentFilter
  );

  const visible = filtered.slice(0, visibleTileCount);
  const hidden = filtered.length - visible.length;

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state">No projects in this category yet.</div>`;
    return;
  }

  grid.innerHTML = visible.map(p => renderTile(p)).join('');

  // Wire hover-to-play for video tiles
  grid.querySelectorAll('.tile[data-video]').forEach(tile => {
    let videoEl = null;
    tile.addEventListener('mouseenter', () => {
      if (!videoEl) {
        const src = tile.dataset.video;
        videoEl = document.createElement('video');
        videoEl.src = src;
        videoEl.muted = true;
        videoEl.loop = true;
        videoEl.playsInline = true;
        videoEl.preload = 'metadata';
        videoEl.style.opacity = '0';
        tile.querySelector('.tile-media').appendChild(videoEl);
        videoEl.addEventListener('loadeddata', () => { videoEl.style.opacity = '1'; });
      }
      videoEl.play().catch(() => {});
    });
    tile.addEventListener('mouseleave', () => {
      if (videoEl) {
        videoEl.pause();
        videoEl.currentTime = 0;
      }
    });
  });

  // Wire clicks
  grid.querySelectorAll('.tile').forEach(tile => {
    tile.addEventListener('click', () => {
      navigate(`/work/${tile.dataset.id}`);
    });
  });

  // Load more
  let loadMore = document.querySelector('.load-more');
  if (loadMore) loadMore.remove();
  if (hidden > 0) {
    loadMore = document.createElement('button');
    loadMore.className = 'load-more';
    loadMore.textContent = `+ Load more (${hidden} hidden)`;
    loadMore.addEventListener('click', () => {
      visibleTileCount += 6;
      renderWorkGrid();
    });
    grid.parentElement.appendChild(loadMore);
  }

  // Update count display
  document.querySelectorAll('[data-bind="work_count"]').forEach(el => {
    el.textContent = `Selected work — ${filtered.length}`;
  });
}

function renderTile(p) {
  const isVideo = isVideoURL(p.media);
  const thumb = p.thumbnail || (isVideo ? '' : p.media);
  const hasThumb = !!thumb;
  const videoSrc = isVideo ? p.media : '';
  const showDuration = p.duration && (p.type === 'film' || p.type === '3d-loop');
  const showFeaturedBadge = p.size === 'feature';

  return `
    <article class="tile size-${p.size || 'small'}" data-id="${escapeHTML(p.id)}" ${videoSrc ? `data-video="${escapeHTML(videoSrc)}"` : ''}>
      <div class="tile-media">
        ${hasThumb
          ? `<img src="${escapeHTML(thumb)}" alt="${escapeHTML(p.title)}" loading="lazy" />`
          : `<div class="placeholder"></div>`}
      </div>
      <div class="tile-overlay"></div>
      <div class="tile-content">
        <div class="tile-meta">
          <span>${escapeHTML(p.number)} · ${escapeHTML(typeLabel(p.type))}</span>
          ${showDuration ? `<span>${escapeHTML(p.duration)}</span>` : (showFeaturedBadge ? `<span class="featured-badge">Featured</span>` : '')}
        </div>
        <div class="tile-info">
          <h3 class="tile-title">${escapeHTML(p.title)}</h3>
          <div class="tile-subtitle">${escapeHTML(p.role || p.client || '')} · ${escapeHTML(p.year)}</div>
        </div>
      </div>
    </article>
  `;
}

function wireFilters() {
  const pills = document.querySelectorAll('#filter-pills .pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.dataset.filter;
      visibleTileCount = CONFIG.INITIAL_TILES;
      renderWorkGrid();
    });
  });
}

function renderHome() {
  bindSettings();
  renderSocials('socials');
  renderWorkGrid();
}

// ============================================================
// PROJECT DETAIL VIEW
// ============================================================
function renderProject(id) {
  const project = STORE.projects.find(p => p.id === id);
  if (!project) return false;

  bindSettings();
  renderSocials('socials-project');

  document.getElementById('project-number').textContent = project.number;
  document.getElementById('project-type-label').textContent = typeLabel(project.type);
  document.getElementById('project-title').textContent = project.title;
  document.getElementById('project-category').textContent =
    project.category.charAt(0).toUpperCase() + project.category.slice(1);
  document.getElementById('project-year').textContent = project.year;
  document.getElementById('project-year-2').textContent = project.year;
  document.getElementById('project-client').textContent = project.client || '—';
  document.getElementById('project-role').textContent = project.role || '—';
  document.getElementById('project-description').textContent = project.description || '';

  const durationRow = document.getElementById('duration-row');
  if (project.duration) {
    document.getElementById('project-duration').textContent = project.duration;
    durationRow.hidden = false;
  } else {
    durationRow.hidden = true;
  }

  // Hero media
  const mediaContainer = document.getElementById('project-media');
  if (project.media) {
    if (isVideoURL(project.media)) {
      mediaContainer.innerHTML = `
        <video src="${escapeHTML(project.media)}" autoplay muted loop playsinline controls></video>
      `;
    } else {
      mediaContainer.innerHTML = `<img src="${escapeHTML(project.media)}" alt="${escapeHTML(project.title)}" />`;
    }
  } else {
    mediaContainer.innerHTML = `<div class="media-placeholder">Media placeholder — add Cloudinary URL in sheet</div>`;
  }

  // Gallery
  const galleryContainer = document.getElementById('project-gallery');
  if (project.gallery) {
    const urls = project.gallery.split('|').map(u => u.trim()).filter(Boolean);
    galleryContainer.innerHTML = urls.map(url => {
      if (isVideoURL(url)) {
        return `<video src="${escapeHTML(url)}" muted loop playsinline controls></video>`;
      }
      return `<img src="${escapeHTML(url)}" alt="${escapeHTML(project.title)}" loading="lazy" />`;
    }).join('');
  } else {
    galleryContainer.innerHTML = '';
  }

  // Prev/Next navigation
  const idx = STORE.projects.findIndex(p => p.id === id);
  const prev = STORE.projects[(idx - 1 + STORE.projects.length) % STORE.projects.length];
  const next = STORE.projects[(idx + 1) % STORE.projects.length];
  document.getElementById('prev-title').textContent = prev.title;
  document.getElementById('next-title').textContent = next.title;
  document.getElementById('prev-project').onclick = (e) => { e.preventDefault(); navigate(`/work/${prev.id}`); };
  document.getElementById('next-project').onclick = (e) => { e.preventDefault(); navigate(`/work/${next.id}`); };

  document.title = `${project.title} — ${STORE.settings.name || 'Designer'}`;
  return true;
}

// ============================================================
// ROUTER
// ============================================================
function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => { v.hidden = v.id !== viewId; });
  window.scrollTo({ top: 0, behavior: 'instant' });
}

async function route() {
  await loadData();

  const path = location.pathname;
  const projectMatch = path.match(/^\/work\/([^/]+)\/?$/);

  if (projectMatch) {
    const id = decodeURIComponent(projectMatch[1]);
    const ok = renderProject(id);
    if (ok) {
      showView('project');
    } else {
      showView('notfound');
    }
  } else if (path === '/' || path === '/index.html') {
    renderHome();
    showView('home');
    // Handle hash for in-page nav (#about, #contact)
    if (location.hash) {
      setTimeout(() => {
        const target = document.querySelector(location.hash);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  } else {
    showView('notfound');
  }

  hideLoader();
}

function navigate(path) {
  if (path === location.pathname) return;
  history.pushState({}, '', path);
  route();
}

// Intercept link clicks for client-side routing
function wireLinks() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-link]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto:')) return;
    e.preventDefault();
    navigate(href);
  });
}

// Handle browser back/forward
window.addEventListener('popstate', route);

// Scroll-aware nav border
window.addEventListener('scroll', () => {
  document.querySelectorAll('.nav').forEach(nav => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  });
}, { passive: true });

function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('fade');
    setTimeout(() => loader.remove(), 400);
  }
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  wireFilters();
  wireLinks();
  route();
});

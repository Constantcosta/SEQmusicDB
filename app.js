/* SEQ Musician Database — app.js */

// State
let currentTab = 'venues';
let allData = { venues: [], weddings: [], agents: [], acts: [], musicians: [] };
let activeFilters = {};
let searchQuery = '';
let displayLimit = 60;
const PAGE_SIZE = 60;

// Icons
const icons = {
  location: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  type: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
  music: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  people: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  dollar: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  link: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  capacity: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
  phone: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  fire: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 12c2-2.96 0-7-1-8 0 3.038-1.773 4.741-3 6-1.226 1.26-2 3.24-2 5a6 6 0 1 0 12 0c0-1.532-1.056-3.94-2-5-1.786 3-2.791 3-4 2z"/></svg>',
  instagram: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>',
  spotify: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 15c3-1 6-1 9 .5M7 12.5c4-1.5 8-1.5 11 .5M6.5 10c4.5-1.5 9.5-1.5 13 1"/></svg>',
  facebook: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
  instrument: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
};

// Formatters
function formatType(t) {
  if (!t) return '';
  return t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatActs(a) {
  if (!a) return '';
  const map = { 'bands': 'Bands', 'solo_duo': 'Solo/Duo', 'both': 'Bands & Solo/Duo', 'band': 'Band', 'duo': 'Duo', 'solo': 'Solo', 'trio': 'Trio', 'dj_hybrid': 'DJ + Live', 'tribute': 'Tribute', 'ensemble': 'Ensemble' };
  return map[a] || formatType(a);
}

// Filter configurations per tab
const filterConfigs = {
  venues: {
    region: { label: 'Region', key: 'region', values: [] },
    type: { label: 'Type', key: 'type', values: [] },
    acts: { label: 'Acts', key: 'acts', values: [] },
  },
  weddings: {
    region: { label: 'Region', key: 'region', values: [] },
    type: { label: 'Type', key: 'type', values: [] },
  },
  agents: {
    speciality: { label: 'Speciality', key: 'speciality', values: [] },
  },
  acts: {
    region: { label: 'Region', key: 'region', values: [] },
    type: { label: 'Type', key: 'type', values: [] },
    genre: { label: 'Genre', key: 'genre', values: [] },
  },
  musicians: {
    region: { label: 'Region', key: 'region', values: [] },
    type: { label: 'Type', key: 'type', values: [] },
    genre: { label: 'Genre', key: 'genres', values: [] },
  },
};

// Load data
async function loadData() {
  try {
    const [venues, weddings, agents, acts, musicians] = await Promise.all([
      fetch('./data-venues.json').then(r => r.json()),
      fetch('./data-weddings.json').then(r => r.json()),
      fetch('./data-agents.json').then(r => r.json()),
      fetch('./data-acts.json').then(r => r.json()),
      fetch('./data-musicians.json').then(r => r.json()),
    ]);
    allData = { venues, weddings, agents, acts, musicians };

    // Populate filter values
    populateFilterValues('venues', venues);
    populateFilterValues('weddings', weddings);
    populateFilterValues('agents', agents);
    populateFilterValues('acts', acts);
    populateFilterValues('musicians', musicians);

    // Set stats
    animateNumber('stat-venues', venues.length);
    animateNumber('stat-weddings', weddings.length);
    animateNumber('stat-agents', agents.length);
    animateNumber('stat-acts', acts.length);
    animateNumber('stat-musicians', musicians.length);

    renderFilters();
    renderCards();
  } catch (e) {
    console.error('Failed to load data:', e);
  }
}

function populateFilterValues(tab, data) {
  const config = filterConfigs[tab];
  if (!config) return;
  Object.keys(config).forEach(filterKey => {
    const key = config[filterKey].key;
    const vals = new Set();
    data.forEach(item => {
      const v = item[key];
      if (v) {
        // Handle pipe-separated values (e.g. genre)
        v.split('|').forEach(part => {
          const trimmed = part.trim();
          if (trimmed) vals.add(trimmed);
        });
      }
    });
    config[filterKey].values = [...vals].sort();
  });
}

function animateNumber(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const duration = 800;
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Render filters
function renderFilters() {
  const row = document.getElementById('filter-row');
  row.innerHTML = '';
  activeFilters = {};

  const config = filterConfigs[currentTab];
  if (!config) return;

  Object.keys(config).forEach(filterKey => {
    const { label, values } = config[filterKey];
    if (values.length === 0) return;

    // Create a filter group container
    const group = document.createElement('div');
    group.className = 'filter-group';

    // Group label
    const groupLabel = document.createElement('span');
    groupLabel.className = 'filter-group-label';
    groupLabel.textContent = label + ':';
    group.appendChild(groupLabel);

    // "All" button
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.textContent = 'All';
    allBtn.setAttribute('aria-pressed', 'true');
    allBtn.dataset.filterGroup = filterKey;
    allBtn.dataset.filterValue = '__all__';
    allBtn.addEventListener('click', () => handleFilterClick(filterKey, '__all__'));
    group.appendChild(allBtn);

    values.forEach(val => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.textContent = formatType(val);
      btn.setAttribute('aria-pressed', 'false');
      btn.dataset.filterGroup = filterKey;
      btn.dataset.filterValue = val;
      btn.addEventListener('click', () => handleFilterClick(filterKey, val));
      group.appendChild(btn);
    });

    row.appendChild(group);
  });
}

function handleFilterClick(group, value) {
  if (value === '__all__') {
    delete activeFilters[group];
  } else {
    activeFilters[group] = value;
  }
  displayLimit = PAGE_SIZE;

  // Update button states and aria-pressed
  document.querySelectorAll(`.filter-btn[data-filter-group="${group}"]`).forEach(btn => {
    const isAll = btn.dataset.filterValue === '__all__';
    const isActive = value === '__all__' ? isAll : btn.dataset.filterValue === value;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  renderCards();
}

// Render cards
function renderCards() {
  const data = allData[currentTab] || [];
  const filtered = data.filter(item => matchesFilters(item) && matchesSearch(item));

  const container = document.getElementById('cards-container');
  const emptyState = document.getElementById('empty-state');
  const countEl = document.getElementById('result-count');
  const loadMoreContainer = document.getElementById('load-more-container');

  countEl.textContent = `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    if (loadMoreContainer) loadMoreContainer.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  const visible = filtered.slice(0, displayLimit);
  container.innerHTML = visible.map(item => createCard(item)).join('');

  // Show/hide load more
  if (loadMoreContainer) {
    if (filtered.length > displayLimit) {
      loadMoreContainer.style.display = 'flex';
      loadMoreContainer.querySelector('.load-more-text').textContent = 
        `Showing ${visible.length} of ${filtered.length} — load more`;
    } else {
      loadMoreContainer.style.display = 'none';
    }
  }
}

function loadMore() {
  displayLimit += PAGE_SIZE;
  renderCards();
}

function matchesFilters(item) {
  return Object.entries(activeFilters).every(([group, value]) => {
    const key = filterConfigs[currentTab][group]?.key;
    if (!key) return true;
    const itemVal = item[key] || '';
    // Handle pipe-separated values
    return itemVal.split('|').some(v => v.trim().toLowerCase() === value.toLowerCase());
  });
}

function matchesSearch(item) {
  if (!searchQuery) return true;
  const q = searchQuery.toLowerCase();
  return Object.values(item).some(v => v && String(v).toLowerCase().includes(q));
}

function createCard(item) {
  switch (currentTab) {
    case 'venues': return venueCard(item);
    case 'weddings': return weddingCard(item);
    case 'agents': return agentCard(item);
    case 'acts': return actCard(item);
    case 'musicians': return musicianCard(item);
    default: return '';
  }
}

function venueCard(v) {
  const link = v.website ? `<a class="card-link" href="${escHtml(v.website)}" target="_blank" rel="noopener noreferrer">${icons.link} Visit website</a>` : '';
  return `<div class="card">
    <div class="card-header">
      <span class="card-title">${escHtml(v.name)}</span>
      <span class="card-tag tag-venue">${formatType(v.type)}</span>
    </div>
    <div class="card-meta">
      <span class="card-meta-item">${icons.location} ${escHtml(v.suburb)}, ${escHtml(v.region)}</span>
      <span class="card-meta-item">${icons.music} ${formatActs(v.acts)}</span>
    </div>
    ${v.notes ? `<p class="card-notes">${escHtml(v.notes)}</p>` : ''}
    ${link}
  </div>`;
}

function weddingCard(v) {
  const cap = v.capacity ? `<span class="card-meta-item">${icons.capacity} Up to ${escHtml(v.capacity)} guests</span>` : '';
  const link = v.website ? `<a class="card-link" href="${escHtml(v.website)}" target="_blank" rel="noopener noreferrer">${icons.link} Visit website</a>` : '';
  return `<div class="card">
    <div class="card-header">
      <span class="card-title">${escHtml(v.name)}</span>
      <span class="card-tag tag-wedding">${formatType(v.type)}</span>
    </div>
    <div class="card-meta">
      <span class="card-meta-item">${icons.location} ${escHtml(v.suburb)}, ${escHtml(v.region)}</span>
      ${cap}
    </div>
    ${v.music_notes ? `<p class="card-notes">${escHtml(v.music_notes)}</p>` : ''}
    ${link}
  </div>`;
}

function agentCard(a) {
  const roster = a.roster_size ? `<span class="card-meta-item">${icons.people} ~${escHtml(a.roster_size)} acts</span>` : '';
  const commission = a.commission_model ? `<span class="card-meta-item">${icons.dollar} ${escHtml(a.commission_model.substring(0, 60))}${a.commission_model.length > 60 ? '...' : ''}</span>` : '';
  const link = a.website ? `<a class="card-link" href="${escHtml(a.website)}" target="_blank" rel="noopener noreferrer">${icons.link} Visit website</a>` : '';
  return `<div class="card">
    <div class="card-header">
      <span class="card-title">${escHtml(a.name)}</span>
      <span class="card-tag tag-agent">${formatType(a.speciality)}</span>
    </div>
    <div class="card-meta">
      <span class="card-meta-item">${icons.location} ${escHtml(a.location)}</span>
      ${roster}
    </div>
    ${commission ? `<div class="card-meta">${commission}</div>` : ''}
    ${a.notes ? `<p class="card-notes">${escHtml(a.notes)}</p>` : ''}
    ${a.contact ? `<p class="card-notes" style="-webkit-line-clamp:2;">${icons.phone} ${escHtml(a.contact.substring(0, 120))}${a.contact.length > 120 ? '...' : ''}</p>` : ''}
    ${link}
  </div>`;
}

function actCard(a) {
  const price = a.price_range ? `<span class="card-meta-item">${icons.dollar} ${escHtml(a.price_range)}</span>` : '';
  const agency = a.agency ? `<span class="card-meta-item">${icons.people} ${escHtml(a.agency.substring(0, 50))}${a.agency.length > 50 ? '...' : ''}</span>` : '';
  const link = a.website ? `<a class="card-link" href="${escHtml(a.website)}" target="_blank" rel="noopener noreferrer">${icons.link} Visit website</a>` : '';
  const genres = (a.genre || '').split('|').map(g => g.trim()).filter(Boolean).map(g => formatType(g)).join(', ');
  return `<div class="card">
    <div class="card-header">
      <span class="card-title">${escHtml(a.name)}</span>
      <span class="card-tag tag-act">${formatActs(a.type)}</span>
    </div>
    <div class="card-meta">
      <span class="card-meta-item">${icons.location} ${escHtml(a.region)}</span>
      <span class="card-meta-item">${icons.music} ${escHtml(genres)}</span>
    </div>
    <div class="card-meta">
      ${price}
      ${agency}
    </div>
    ${a.notes ? `<p class="card-notes">${escHtml(a.notes)}</p>` : ''}
    ${link}
  </div>`;
}

function musicianCard(m) {
  const genres = (m.genres || '').split('|').map(g => g.trim()).filter(Boolean).map(g => formatType(g)).join(', ');
  const instruments = (m.instruments || []).map(i => formatType(i)).join(', ');
  const score = m.activity_score || 0;
  const scoreLabel = score >= 75 ? 'Very Active' : score >= 50 ? 'Active' : score >= 25 ? 'Moderate' : 'Low';
  const scoreClass = score >= 75 ? 'score-high' : score >= 50 ? 'score-mid' : 'score-low';

  // Social links
  const socialLinks = [];
  if (m.social) {
    if (m.social.instagram) socialLinks.push(`<a class="social-icon-link" href="${escHtml(m.social.instagram)}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">${icons.instagram}</a>`);
    if (m.social.facebook) socialLinks.push(`<a class="social-icon-link" href="${escHtml(m.social.facebook)}" target="_blank" rel="noopener noreferrer" aria-label="Facebook">${icons.facebook}</a>`);
    if (m.social.spotify) socialLinks.push(`<a class="social-icon-link" href="${escHtml(m.social.spotify)}" target="_blank" rel="noopener noreferrer" aria-label="Spotify">${icons.spotify}</a>`);
    if (m.social.website) socialLinks.push(`<a class="social-icon-link" href="${escHtml(m.social.website)}" target="_blank" rel="noopener noreferrer" aria-label="Website">${icons.link}</a>`);
  }

  return `<div class="card musician-card">
    <div class="card-header">
      <span class="card-title">${escHtml(m.name)}</span>
      <span class="card-tag tag-musician">${formatActs(m.type)}</span>
    </div>
    <div class="card-meta">
      <span class="card-meta-item">${icons.location} ${escHtml(m.suburb || '')}, ${escHtml(m.region)}</span>
      <span class="card-meta-item">${icons.music} ${escHtml(genres)}</span>
    </div>
    <div class="card-meta">
      <span class="card-meta-item">${icons.instrument} ${escHtml(instruments)}</span>
    </div>
    <div class="activity-bar">
      <div class="activity-bar-label">
        <span>${icons.fire} ${scoreLabel}</span>
        <span>${m.gigs_per_month ? m.gigs_per_month + ' gigs/mo' : ''}</span>
      </div>
      <div class="activity-bar-track">
        <div class="activity-bar-fill ${scoreClass}" style="width: ${score}%"></div>
      </div>
    </div>
    ${m.notes ? `<p class="card-notes">${escHtml(m.notes)}</p>` : ''}
    ${socialLinks.length > 0 ? `<div class="social-links">${socialLinks.join('')}</div>` : ''}
  </div>`;
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Debounce utility
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Tab switching
function switchTab(tab) {
  currentTab = tab;
  searchQuery = '';
  document.getElementById('search').value = '';
  activeFilters = {};
  displayLimit = PAGE_SIZE;

  // Update nav
  document.querySelectorAll('.nav-link').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  renderFilters();
  renderCards();
}

// Export CSV
function exportCSV() {
  const data = allData[currentTab] || [];
  const filtered = data.filter(item => matchesFilters(item) && matchesSearch(item));
  if (filtered.length === 0) return;

  const headers = Object.keys(filtered[0]);
  const rows = filtered.map(item => headers.map(h => {
    const val = item[h] || '';
    return `"${String(val).replace(/"/g, '""')}"`;
  }).join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `seq-musician-db-${currentTab}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// Theme toggle (persists choice in localStorage)
(function(){
  const t = document.querySelector('[data-theme-toggle]');
  const r = document.documentElement;
  const stored = localStorage.getItem('seq-theme');
  let d = stored || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  r.setAttribute('data-theme', d);
  updateToggleIcon(t, d);
  t && t.addEventListener('click', () => {
    d = d === 'dark' ? 'light' : 'dark';
    r.setAttribute('data-theme', d);
    localStorage.setItem('seq-theme', d);
    updateToggleIcon(t, d);
  });
})();

function updateToggleIcon(t, d) {
  if (!t) return;
  t.setAttribute('aria-label', 'Switch to ' + (d === 'dark' ? 'light' : 'dark') + ' mode');
  t.innerHTML = d === 'dark'
    ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
    : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
}

// Mobile menu
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileNav = document.querySelector('.mobile-nav');
mobileMenuBtn && mobileMenuBtn.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  mobileMenuBtn.setAttribute('aria-expanded', isOpen);
});

// Event listeners
document.querySelectorAll('.nav-link').forEach(btn => {
  btn.addEventListener('click', () => {
    switchTab(btn.dataset.tab);
    if (mobileNav) mobileNav.classList.remove('open');
  });
});

document.getElementById('search').addEventListener('input', debounce((e) => {
  searchQuery = e.target.value;
  displayLimit = PAGE_SIZE;
  renderCards();
}, 200));

document.getElementById('export-btn').addEventListener('click', exportCSV);

// Load more button (replaces inline onclick)
const loadMoreBtn = document.getElementById('load-more-btn');
if (loadMoreBtn) loadMoreBtn.addEventListener('click', loadMore);

// Init
loadData();

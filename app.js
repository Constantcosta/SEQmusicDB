/* SEQ Musician Database — app.js */

// State
let currentTab = 'venues';
let allData = { venues: [], weddings: [], agents: [], acts: [] };
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
};

// Load data
async function loadData() {
  try {
    const [venues, weddings, agents, acts] = await Promise.all([
      fetch('./data-venues.json').then(r => r.json()),
      fetch('./data-weddings.json').then(r => r.json()),
      fetch('./data-agents.json').then(r => r.json()),
      fetch('./data-acts.json').then(r => r.json()),
    ]);
    allData = { venues, weddings, agents, acts };

    // Populate filter values
    populateFilterValues('venues', venues);
    populateFilterValues('weddings', weddings);
    populateFilterValues('agents', agents);
    populateFilterValues('acts', acts);

    // Set stats
    animateNumber('stat-venues', venues.length);
    animateNumber('stat-weddings', weddings.length);
    animateNumber('stat-agents', agents.length);
    animateNumber('stat-acts', acts.length);

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
    allBtn.dataset.filterGroup = filterKey;
    allBtn.dataset.filterValue = '__all__';
    allBtn.addEventListener('click', () => handleFilterClick(filterKey, '__all__'));
    group.appendChild(allBtn);

    values.forEach(val => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.textContent = formatType(val);
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

  // Update button states
  document.querySelectorAll(`.filter-btn[data-filter-group="${group}"]`).forEach(btn => {
    const isAll = btn.dataset.filterValue === '__all__';
    const isActive = value === '__all__' ? isAll : btn.dataset.filterValue === value;
    btn.classList.toggle('active', isActive);
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

function escHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
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

// Theme toggle
(function(){
  const t = document.querySelector('[data-theme-toggle]');
  const r = document.documentElement;
  let d = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  r.setAttribute('data-theme', d);
  updateToggleIcon(t, d);
  t && t.addEventListener('click', () => {
    d = d === 'dark' ? 'light' : 'dark';
    r.setAttribute('data-theme', d);
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

document.getElementById('search').addEventListener('input', (e) => {
  searchQuery = e.target.value;
  displayLimit = PAGE_SIZE;
  renderCards();
});

document.getElementById('export-btn').addEventListener('click', exportCSV);

// Init
loadData();

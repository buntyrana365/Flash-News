// static/js/app.js — NewsFlash Frontend Logic

// ── State ─────────────────────────────────────────────────────────────────────
const State = {
  category: '',
  query: '',
  sortBy: 'popularity',
  page: 1,
  hasMore: true,
  loading: false,
  mode: 'home',       // 'home' | 'search' | 'bookmarks'
  bookmarks: [],
  breakingArticles: [],
  breakingIdx: 0,
};

// ── DOM Refs ──────────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const searchInput = $('searchInput');
const clearBtn = $('clearSearch');
const newsFeed = $('newsFeed');
const titleText = $('titleText');
const sortSelect = $('sortSelect');
const breakingWrap = $('breakingWrap');
const breakingCarousel = $('breakingCarousel');
const breakingDots = $('breakingDots');
const articleModal = $('articleModal');
const modalTitle = $('modalTitle');
const modalIframe = $('modalIframe');
const bookmarksPanel = $('bookmarksPanel');
const bookmarksFeed = $('bookmarksFeed');
const toast = $('toast');
const tabHome = $('tabHome');
const tabSearch = $('tabSearch');
const tabBookmarks = $('tabBookmarks');
const themeToggle = $('themeToggle');

// ── Theme ─────────────────────────────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeIcon(next);
}
function updateThemeIcon(theme) {
  themeToggle.innerHTML = theme === 'dark'
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
}

// ── Bookmarks ─────────────────────────────────────────────────────────────────
function loadBookmarks() {
  try { State.bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]'); }
  catch { State.bookmarks = []; }
}
function saveBookmarks() {
  localStorage.setItem('bookmarks', JSON.stringify(State.bookmarks));
}
function isBookmarked(url) { return State.bookmarks.some(b => b.url === url); }
function toggleBookmark(article) {
  if (isBookmarked(article.url)) {
    State.bookmarks = State.bookmarks.filter(b => b.url !== article.url);
    showToast('Bookmark removed');
  } else {
    State.bookmarks = [article, ...State.bookmarks];
    showToast('Article bookmarked ✓');
  }
  saveBookmarks();
  // Refresh bookmark icon on visible cards
  document.querySelectorAll(`[data-url="${CSS.escape(article.url)}"] .bm-btn`).forEach(btn => {
    btn.classList.toggle('bookmarked', isBookmarked(article.url));
    btn.innerHTML = bookmarkIcon(isBookmarked(article.url));
  });
}

// ── Toast ─────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const shareIcon = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`;
const bookmarkIcon = (active) => active
  ? `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`
  : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;

// ── Article Card HTML ─────────────────────────────────────────────────────────
function cardHTML(article, idx = 0) {
  const src = article.source?.name || 'News';
  const title = article.title || 'Untitled';
  const desc = article.description || '';
  const img = article.urlToImage || `https://picsum.photos/seed/${encodeURIComponent(title)}/600/300`;
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '';
  const bm = isBookmarked(article.url);

  return `
    <div class="news-card" data-url="${article.url}" style="animation-delay:${idx * 0.06}s"
         onclick="openArticle(${JSON.stringify(article).replace(/"/g, '&quot;')})">
      <div class="card-img-wrap">
        <img src="${img}" alt="${title}" onerror="this.src='https://picsum.photos/600/300?grayscale'">
        <div class="src-badge">${src}</div>
      </div>
      <div class="card-body">
        <h3 class="card-title">${title}</h3>
        ${desc ? `<p class="card-desc">${desc}</p>` : ''}
        <div class="card-footer">
          <span class="card-date">${date}</span>
          <div class="card-actions">
            <button class="card-action-btn" onclick="event.stopPropagation(); shareArticle('${article.url}','${title.replace(/'/g, "\\'")}')" title="Share">${shareIcon()}</button>
            <button class="card-action-btn bm-btn ${bm ? 'bookmarked' : ''}"
              onclick="event.stopPropagation(); toggleBookmark(${JSON.stringify(article).replace(/"/g, '&quot;')})"
              title="Bookmark">${bookmarkIcon(bm)}</button>
          </div>
        </div>
      </div>
    </div>`;
}

// ── Skeleton HTML ─────────────────────────────────────────────────────────────
function skeletonHTML(n = 3) {
  return Array(n).fill(`
    <div class="skeleton-card">
      <div class="sk sk-img"></div>
      <div class="sk-body">
        <div class="sk sk-tag"></div>
        <div class="sk sk-h1"></div><div class="sk sk-h2"></div>
        <div class="sk sk-p1"></div><div class="sk sk-p2"></div>
      </div>
    </div>`).join('');
}

// ── Breaking News ─────────────────────────────────────────────────────────────
async function loadBreaking() {
  try {
    const res = await fetch('/api/breaking');
    const data = await res.json();
    State.breakingArticles = (data.articles || []).filter(a => a.title !== '[Removed]');
    renderBreaking();
  } catch { /* silent fail */ }
}
function renderBreaking() {
  const arts = State.breakingArticles;
  if (!arts.length) { breakingWrap.style.display = 'none'; return; }
  breakingWrap.style.display = '';

  breakingCarousel.innerHTML = arts.map((a, i) => {
    const img = a.urlToImage || `https://picsum.photos/seed/b${i}/600/300`;
    return `<div class="breaking-card" onclick="openArticle(${JSON.stringify(a).replace(/"/g, '&quot;')})">
      <img src="${img}" alt="${a.title}" onerror="this.src='https://picsum.photos/600/300?grayscale'">
      <div class="breaking-overlay">
        <h3>${a.title}</h3><span>${a.source?.name || ''}</span>
      </div></div>`;
  }).join('');

  breakingDots.innerHTML = arts.map((_, i) =>
    `<div class="breaking-dot ${i === 0 ? 'active' : ''}" id="dot-${i}"></div>`).join('');

  // Auto-scroll
  clearInterval(window._breakingTimer);
  window._breakingTimer = setInterval(() => {
    State.breakingIdx = (State.breakingIdx + 1) % arts.length;
    breakingCarousel.scrollTo({ left: State.breakingIdx * (breakingCarousel.offsetWidth * 0.78 + 12), behavior: 'smooth' });
    document.querySelectorAll('.breaking-dot').forEach((d, i) => d.classList.toggle('active', i === State.breakingIdx));
  }, 4000);
}

// ── News Feed ─────────────────────────────────────────────────────────────────
async function loadNews(append = false) {
  if (State.loading) return;
  State.loading = true;

  if (!append) {
    newsFeed.innerHTML = skeletonHTML(4);
    State.page = 1;
  } else {
    const lm = $('loadMoreWrap');
    if (lm) lm.remove();
    newsFeed.insertAdjacentHTML('beforeend', skeletonHTML(2));
  }

  const endpoint = State.query
    ? `/api/search?q=${encodeURIComponent(State.query)}&sortBy=${State.sortBy}&page=${State.page}&pageSize=20`
    : `/api/headlines?country=us&category=${State.category}&page=${State.page}&pageSize=20`;

  try {
    const res = await fetch(endpoint);
    const data = await res.json();

    if (data.error) throw new Error(data.error);

    const articles = (data.articles || []).filter(a => a.title !== '[Removed]' && a.url);

    // Remove skeletons
    document.querySelectorAll('.skeleton-card').forEach(s => s.remove());

    if (!append && articles.length === 0) {
      newsFeed.innerHTML = noResultsHTML();
      State.loading = false;
      return;
    }

    const start = append ? parseInt(newsFeed.querySelectorAll('.news-card').length) : 0;
    newsFeed.insertAdjacentHTML('beforeend', articles.map((a, i) => cardHTML(a, start + i)).join(''));

    State.hasMore = articles.length === 20;
    if (State.hasMore) {
      newsFeed.insertAdjacentHTML('beforeend',
        `<div class="load-more-wrap" id="loadMoreWrap">
           <button class="load-more-btn" onclick="loadMore()">Load More</button>
         </div>`);
    }
  } catch (err) {
    document.querySelectorAll('.skeleton-card').forEach(s => s.remove());
    newsFeed.insertAdjacentHTML('beforeend', errorHTML(err.message));
  }

  State.loading = false;
}

function loadMore() {
  State.page++;
  loadNews(true);
}

function noResultsHTML() {
  return `<div class="state-msg">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    <h3>No results found</h3>
    <p>Try a different keyword, country, or category.</p>
    ${quickChipsHTML()}
  </div>`;
}
function errorHTML(msg) {
  return `<div class="state-msg">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <h3>Couldn't load news</h3>
    <p>${msg || 'Check your connection or backend server.'}</p>
    <button class="retry-btn" onclick="resetAndLoad()">Retry</button>
  </div>`;
}
function quickChipsHTML() {
  const terms = ['India', 'USA', 'UK', 'Uttar Pradesh', 'Maharashtra', 'Technology', 'Sports', 'Business'];
  return `<div class="quick-chips">${terms.map(t =>
    `<button class="quick-chip" onclick="quickSearch('${t}')">${t}</button>`).join('')}</div>`;
}

// ── Search ────────────────────────────────────────────────────────────────────
function quickSearch(term) {
  searchInput.value = term;
  clearBtn.classList.add('visible');
  State.query = term;
  titleText.textContent = `Results for "${term}"`;
  sortSelect.style.display = '';
  resetAndLoad();
}

function handleSearchInput(val) {
  clearBtn.classList.toggle('visible', val.length > 0);
}

function submitSearch() {
  const q = searchInput.value.trim();
  if (!q) return;
  State.query = q;
  titleText.textContent = `Results for "${q}"`;
  sortSelect.style.display = '';
  resetAndLoad();
}

function clearSearch() {
  searchInput.value = '';
  clearBtn.classList.remove('visible');
  State.query = '';
  titleText.textContent = 'Top Headlines';
  sortSelect.style.display = 'none';
  resetAndLoad();
}

// ── Categories ────────────────────────────────────────────────────────────────
function selectCategory(id, value) {
  State.category = value;
  State.query = '';
  searchInput.value = '';
  clearBtn.classList.remove('visible');
  titleText.textContent = value
    ? document.querySelector(`[data-cat="${id}"]`).textContent + ' News'
    : 'Top Headlines';
  sortSelect.style.display = 'none';
  document.querySelectorAll('.cat-pill').forEach(p => p.classList.toggle('active', p.dataset.cat === id));
  resetAndLoad();
}

// ── Sort ──────────────────────────────────────────────────────────────────────
function onSortChange(val) {
  State.sortBy = val;
  resetAndLoad();
}

// ── Reset & Reload ────────────────────────────────────────────────────────────
function resetAndLoad() {
  State.page = 1;
  State.hasMore = true;
  loadNews(false);
}

// ── Article Modal ─────────────────────────────────────────────────────────────
function openArticle(article) {
  modalTitle.textContent = article.source?.name || 'Article';
  $('modalShareBtn').onclick = () => shareArticle(article.url, article.title);
  $('modalBmBtn').classList.toggle('bookmarked', isBookmarked(article.url));
  $('modalBmBtn').innerHTML = bookmarkIcon(isBookmarked(article.url));
  $('modalBmBtn').onclick = () => {
    toggleBookmark(article);
    $('modalBmBtn').classList.toggle('bookmarked', isBookmarked(article.url));
    $('modalBmBtn').innerHTML = bookmarkIcon(isBookmarked(article.url));
  };
  modalIframe.src = article.url;
  articleModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeArticle() {
  articleModal.classList.remove('open');
  modalIframe.src = '';
  document.body.style.overflow = '';
}

// ── Bookmarks Panel ───────────────────────────────────────────────────────────
function openBookmarks() {
  loadBookmarks();
  if (State.bookmarks.length === 0) {
    bookmarksFeed.innerHTML = `<div class="state-msg">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
      <h3>No Bookmarks Yet</h3><p>Save articles to read them later.</p></div>`;
  } else {
    bookmarksFeed.innerHTML = State.bookmarks.map((a, i) => cardHTML(a, i)).join('');
  }
  bookmarksPanel.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeBookmarks() {
  bookmarksPanel.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Share ─────────────────────────────────────────────────────────────────────
async function shareArticle(url, title) {
  if (navigator.share) {
    try { await navigator.share({ title, url }); return; } catch { }
  }
  try { await navigator.clipboard.writeText(url); showToast('Link copied!'); }
  catch { showToast('Copy: ' + url); }
}

// ── Tab Navigation ────────────────────────────────────────────────────────────
tabHome.addEventListener('click', () => {
  closeBookmarks();
  [tabHome, tabSearch, tabBookmarks].forEach((t, i) => t.classList.toggle('active', i === 0));
});
tabSearch.addEventListener('click', () => {
  closeBookmarks();
  searchInput.focus();
  [tabHome, tabSearch, tabBookmarks].forEach((t, i) => t.classList.toggle('active', i === 1));
});
tabBookmarks.addEventListener('click', () => {
  openBookmarks();
  [tabHome, tabSearch, tabBookmarks].forEach((t, i) => t.classList.toggle('active', i === 2));
});

// ── Event wiring ──────────────────────────────────────────────────────────────
themeToggle.addEventListener('click', toggleTheme);
searchInput.addEventListener('input', (e) => handleSearchInput(e.target.value));
searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitSearch(); });
$('clearSearch').addEventListener('click', clearSearch);
$('searchBtn').addEventListener('click', submitSearch);
$('closeModal').addEventListener('click', closeArticle);
$('closeBookmarks').addEventListener('click', closeBookmarks);
sortSelect.addEventListener('change', (e) => onSortChange(e.target.value));

// Keyboard: Escape closes modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeArticle(); closeBookmarks(); }
});

// ── Init ──────────────────────────────────────────────────────────────────────
(function init() {
  initTheme();
  loadBookmarks();
  loadBreaking();
  loadNews(false);
})();

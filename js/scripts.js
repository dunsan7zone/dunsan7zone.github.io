/*!
* Start Bootstrap - New Age v6.0.7 (https://startbootstrap.com/theme/new-age)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-new-age/blob/master/LICENSE)
*/
//
// Scripts
// 


const APP_VERSION = window.APP_VERSION || 'dev';

function appendVersion(url) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(APP_VERSION)}`;
}

function appendVersionForLocalAsset(url) {
  if (!url) return url;

  const normalized = String(url).trim();
  if (!normalized) return normalized;

  // Keep external/data/blob URLs untouched.
  if (/^(https?:)?\/\//i.test(normalized) || /^data:|^blob:/i.test(normalized)) {
    return normalized;
  }

  return appendVersion(normalized);
}

function showSection(targetId) {
    // collect all sections each time in case DOM changes
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(sec => {
      sec.classList.remove('active');
    });

    const target = document.getElementById(targetId);
    if (target) {
      target.classList.add('active');
      // Scroll to the top of the target section
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // clear search input when entering notice section
    if (targetId === 'notice') {
      const searchInput = document.getElementById('boardSearch');
      if (searchInput) {
        searchInput.value = '';
        renderBoard('', 'title');
      }
    }
  }

function resolveSectionRequest(targetId) {
  const fallbackId = 'home';
  const blockedSections = new Set(['agreementrate']);
  const normalizedId = String(targetId || '').trim();

  if (!normalizedId) {
    return { resolvedId: fallbackId, blocked: false, missing: false };
  }

  if (blockedSections.has(normalizedId)) {
    return { resolvedId: fallbackId, blocked: true, missing: false };
  }

  if (!document.getElementById(normalizedId)) {
    return { resolvedId: fallbackId, blocked: false, missing: true };
  }

  return { resolvedId: normalizedId, blocked: false, missing: false };
}

const NOTICE_MODAL_CONFIG_PATH = 'data/modal-notice.json';

function parseNoticeDate(dateText) {
  if (typeof dateText !== 'string' || !dateText.trim()) return null;
  const parsed = new Date(dateText);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function normalizeNoticeModalConfig(rawConfig) {
  if (!rawConfig || typeof rawConfig !== 'object') return null;

  const sessionKey =
    typeof rawConfig.sessionKey === 'string' && rawConfig.sessionKey.trim()
      ? rawConfig.sessionKey.trim()
      : 'time-notice-modal-shown';

  return {
    enabled: rawConfig.enabled !== false,
    title:
      typeof rawConfig.title === 'string' && rawConfig.title.trim()
        ? rawConfig.title.trim()
        : '안내',
    message: typeof rawConfig.message === 'string' ? rawConfig.message : '',
    startAt: typeof rawConfig.startAt === 'string' ? rawConfig.startAt : '',
    endAt: typeof rawConfig.endAt === 'string' ? rawConfig.endAt : '',
    showOncePerSession: rawConfig.showOncePerSession === true,
    sessionKey
  };
}

function canShowNoticeModalInDateRange(config, now = new Date()) {
  const startAt = parseNoticeDate(config.startAt);
  const endAt = parseNoticeDate(config.endAt);

  if (startAt && now < startAt) return false;
  if (endAt && now > endAt) return false;
  return true;
}

function canShowNoticeModalInSession(config) {
  if (!config.showOncePerSession) return true;

  try {
    return sessionStorage.getItem(config.sessionKey) !== '1';
  } catch (err) {
    return true;
  }
}

function markNoticeModalShownInSession(config) {
  if (!config.showOncePerSession) return;

  try {
    sessionStorage.setItem(config.sessionKey, '1');
  } catch (err) {
    // ignore sessionStorage failures and keep modal behavior intact
  }
}

function applyNoticeModalContent(config) {
  const titleElement = document.getElementById('timeNoticeModalLabel');
  const bodyElement = document.getElementById('timeNoticeModalBody');

  if (titleElement) {
    titleElement.textContent = config.title;
  }

  if (bodyElement) {
    bodyElement.style.whiteSpace = 'pre-line';
    bodyElement.textContent = config.message;
  }
}

async function loadNoticeModalConfig(configPath = NOTICE_MODAL_CONFIG_PATH) {
  try {
    const response = await fetch(appendVersion(configPath), { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Failed to load modal config: ${response.status}`);
    }

    const rawConfig = await response.json();
    return normalizeNoticeModalConfig(rawConfig);
  } catch (err) {
    console.warn('Notice modal config load failed:', err);
    return null;
  }
}

async function showTimeNoticeModalIfNeeded(configPath = NOTICE_MODAL_CONFIG_PATH) {
  const modalElement = document.getElementById('timeNoticeModal');
  if (!modalElement || !window.bootstrap || !bootstrap.Modal) return;

  const config = await loadNoticeModalConfig(configPath);
  if (!config || !config.enabled) return;
  if (!canShowNoticeModalInDateRange(config)) return;
  if (!canShowNoticeModalInSession(config)) return;

  applyNoticeModalContent(config);

  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  modalElement.addEventListener('hidden.bs.modal', () => {
    markNoticeModalShownInSession(config);
  }, { once: true });
  modal.show();
}

window.addEventListener('DOMContentLoaded', event => {

  // Activate Bootstrap scrollspy on the main nav element
  const mainNav = document.body.querySelector('#mainNav');
  if (mainNav) {
      new bootstrap.ScrollSpy(document.body, {
          target: '#mainNav',
          offset: 74,
      });
  };

  // Enable smooth horizontal scrolling for mobile menu
  const navbarResponsive = document.querySelector('#navbarResponsive');
  const navbarNav = document.querySelector('#navbarResponsive .navbar-nav');
  
  if (navbarResponsive && navbarNav) {
    // Force scrollable state when menu is shown
    navbarResponsive.addEventListener('shown.bs.collapse', function () {
      // Force horizontal scroll
      navbarNav.style.overflowX = 'scroll';
      navbarNav.style.flexWrap = 'nowrap';
      navbarNav.style.display = 'flex';
    });
    
    // Also apply immediately if already shown
    if (navbarResponsive.classList.contains('show')) {
      navbarNav.style.overflowX = 'scroll';
      navbarNav.style.flexWrap = 'nowrap';
      navbarNav.style.display = 'flex';
    }
  }

  // Collapse responsive navbar when toggler is visible
  const navbarToggler = document.body.querySelector('.navbar-toggler');
  const responsiveNavItems = [].slice.call(
      document.querySelectorAll('#navbarResponsive .nav-link')
  );
  responsiveNavItems.map(function (responsiveNavItem) {
      responsiveNavItem.addEventListener('click', () => {
          if (window.getComputedStyle(navbarToggler).display !== 'none') {
              navbarToggler.click();
          }
      });
  });

  // attach showSection to navigation links and manage their active state
  const navLinks = document.querySelectorAll('#navbarResponsive .nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      // get target id from data-val, href hash, or empty fallback
      let targetId = link.dataset.val || link.getAttribute('href').substring(1);
      if (!targetId) {
        targetId = '';
      }
      if (targetId) {
        const { resolvedId } = resolveSectionRequest(targetId);
        showSection(resolvedId);
        // update hash so it persists across refresh
        history.pushState(null, '', '#' + resolvedId);
      }
      // update active class on links
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  const homeItem = document.querySelector('.navbar-brand');
  if (homeItem) {
    homeItem.addEventListener('click', e => {
      e.preventDefault();
      showSection('home');
      navLinks.forEach(l => l.classList.remove('active'));
      history.pushState(null, '', '#home');
    });
  }
  
  // attach click handlers to other data-val buttons/links (outside navbar)
  const otherDataValLinks = document.querySelectorAll('[data-val]:not(#navbarResponsive [data-val])');
  otherDataValLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetId = link.dataset.val;
      if (targetId) {
        const { resolvedId } = resolveSectionRequest(targetId);
        showSection(resolvedId);
        history.pushState(null, '', '#' + resolvedId);
        // update active class on nav links if applicable
        navLinks.forEach(l => l.classList.remove('active'));
        navLinks.forEach(l => {
          const val = l.dataset.val || l.getAttribute('href').substring(1);
          if (val === resolvedId) l.classList.add('active');
        });
      }
    });
  });
  
  // on initial load, check for a hash to restore section
  let initial = 'home';
  if (location.hash) {
    initial = location.hash.substring(1);
  }
  const initialRequest = resolveSectionRequest(initial);
  initial = initialRequest.resolvedId;

  if ((initialRequest.blocked || initialRequest.missing) && location.hash) {
    alert('존재하지 않습니다.');
  }

  showSection(initial);
  // record initial state in history
  history.replaceState(null, '', '#' + initial);
  // highlight link if any
  navLinks.forEach(l => {
    const val = l.dataset.val || l.getAttribute('href').substring(1);
    if (val === initial) l.classList.add('active');
  });
  
  // handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    const request = resolveSectionRequest(location.hash ? location.hash.substring(1) : 'home');

    if ((request.blocked || request.missing) && location.hash) {
      alert('존재하지 않습니다.');
      history.replaceState(null, '', '#home');
    }

    const targetId = request.resolvedId;
    showSection(targetId);
    // update active class on nav links
    navLinks.forEach(l => l.classList.remove('active'));
    navLinks.forEach(l => {
      const val = l.dataset.val || l.getAttribute('href').substring(1);
      if (val === targetId) l.classList.add('active');
    });
  });

  // handle direct hash edits in the address bar without full reload
  window.addEventListener('hashchange', () => {
    const request = resolveSectionRequest(location.hash ? location.hash.substring(1) : 'home');

    if (request.blocked || request.missing) {
      alert('존재하지 않습니다.');
      showSection('home');
      navLinks.forEach(l => l.classList.remove('active'));
      history.replaceState(null, '', '#home');
      return;
    }

    showSection(request.resolvedId);
    navLinks.forEach(l => l.classList.remove('active'));
    navLinks.forEach(l => {
      const val = l.dataset.val || l.getAttribute('href').substring(1);
      if (val === request.resolvedId) l.classList.add('active');
    });
  });

  // initialize masthead carousel if present (auto sliding)
  const carouselEl = document.getElementById('mastheadCarousel');
  if (carouselEl) {
      const isMobile = window.matchMedia('(max-width: 767.98px)').matches;
      const carouselInner = carouselEl.querySelector('.carousel-inner');

      if (isMobile && carouselInner) {
        let mobileLogoItem = carouselInner.querySelector('.mobile-logo-slide');

        if (!mobileLogoItem) {
          mobileLogoItem = document.createElement('div');
          mobileLogoItem.className = 'carousel-item mobile-logo-slide';
          mobileLogoItem.innerHTML = '<img class="img-fluid" src="assets/img/main_logo_tmp.png" alt="메인 로고" />';
          carouselInner.prepend(mobileLogoItem);
        }

        const items = carouselInner.querySelectorAll('.carousel-item');
        items.forEach(item => item.classList.remove('active'));
        mobileLogoItem.classList.add('active');
      }

      new bootstrap.Carousel(carouselEl, {
          interval: 3000,    // change slide every 3 seconds
          ride: 'carousel'
      });
  }

  showTimeNoticeModalIfNeeded();

  // load board data from CSV
  loadBoard();
  
  // load agreement rate data
  loadAgreementRate();
  
  // load activities data
  loadActivities();
});

/**
 * Simple CSV parser and table builder
 * @param {string} csvPath path to the CSV file relative to site root
 */
function loadBoard(csvPath = 'data/notice.csv') {
  // load CSV, cache parsed rows to window.boardData and render via renderBoard
  fetch(appendVersion(csvPath), { cache: 'no-store' })
    .then(resp => {
      if (!resp.ok) {
        throw new Error('Network response was not ok');
      }
      return resp.text();
    })
    .then(text => {
      // parse CSV with proper handling of quoted fields including line breaks
      const lines = parseCSV(text.trim());
      // drop header if exists
      if (lines.length > 0) lines.shift();
      // store parsed rows
      window.boardData = lines;
      renderBoard();
      renderRecentNotices();

      // attach search handlers once
      const searchInput = document.getElementById('boardSearch');
      const searchField = document.getElementById('boardSearchField');
      if (searchInput && !searchInput._attached) {
        let timer = null;
        searchInput.addEventListener('input', () => {
          clearTimeout(timer);
          timer = setTimeout(() => renderBoard(searchInput.value, searchField ? searchField.value : 'title'), 200);
        });
        if (searchField) {
          searchField.addEventListener('change', () => renderBoard(searchInput.value, searchField.value));
        }
        searchInput._attached = true;
      }
    })
    .catch(err => {
      console.error('Failed to load board CSV:', err);
      console.info('If you are opening via file://, fetching local files is blocked. Use a local web server (e.g. Live Server extension).');
      const tbody = document.querySelector('#boardTable tbody');
      if (tbody && tbody.children.length === 0) {
        const trErr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 3;
        td.textContent = '공지사항 데이터를 불러오는 중 오류가 발생했습니다.';
        td.style.textAlign = 'center';
        trErr.appendChild(td);
        tbody.appendChild(trErr);
      }
    });
}

/**
 * Render board rows from window.boardData with optional filter
 * @param {string} filterText
 * @param {string} field (ignored - search title only)
 */
function renderBoard(filterText = '', field = 'title') {
  const tbody = document.querySelector('#boardTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const data = window.boardData || [];
  const q = (filterText || '').trim().toLowerCase();
  const results = data.filter(cols => {
    if (!q) return true;
    // search only title (col[1])
    const title = (cols[1]||'').toLowerCase();
    return title.indexOf(q) !== -1;
  });

  // sort by number (col[0]) in descending order (newest first)
  results.sort((a, b) => {
    const numA = parseInt(a[0]) || 0;
    const numB = parseInt(b[0]) || 0;
    return numB - numA;
  });

  // render matched rows
  results.forEach(cols => {
    const tr = document.createElement('tr');
    tr.dataset.id = cols[0] || '';
    tr.style.cursor = 'pointer';

    const tdNum = document.createElement('td');
    tdNum.className = 'td-number';
    tdNum.textContent = cols[0] || '';
    tr.appendChild(tdNum);

    const tdTitle = document.createElement('td');
    tdTitle.className = 'td-title';
    let titleText = cols[1] || '';
    // apply truncation only on mobile (≤576px)
    if (window.innerWidth <= 576 && titleText.length > 27) {
      titleText = titleText.substring(0, 27) + '...';
    }
    tdTitle.textContent = titleText;
    tr.appendChild(tdTitle);

    const tdDate = document.createElement('td');
    tdDate.className = 'td-date';
    tdDate.textContent = cols[3] || '';
    tr.appendChild(tdDate);

    tr.addEventListener('click', () => {
      if (tr.dataset.id) {
        location.href = `detail.html?id=${encodeURIComponent(tr.dataset.id)}`;
      }
    });
    tbody.appendChild(tr);
  });

  // if no results, show message
  if (results.length === 0) {
    const trEmpty = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 3;
    td.textContent = '검색 결과가 없습니다.';
    td.style.textAlign = 'center';
    trEmpty.appendChild(td);
    tbody.appendChild(trEmpty);
  }

  // no padding rows: show exactly available items
}

/**
 * Render recent 3 notices on home section
 */
function renderRecentNotices() {
  const container = document.getElementById('recentNotices');
  if (!container) return;
  container.innerHTML = '';
  
  const data = window.boardData || [];
  if (data.length === 0) return;
  
  // sort by number (col[0]) in descending order, take top 3
  const sorted = [...data].sort((a, b) => {
    const numA = parseInt(a[0]) || 0;
    const numB = parseInt(b[0]) || 0;
    return numB - numA;
  });
  
  const recent = sorted.slice(0, 3);
  
  recent.forEach((cols, index) => {
    const noticeCard = document.createElement('a');
    noticeCard.href = `detail.html?id=${encodeURIComponent(cols[0])}`;
    noticeCard.className = 'notice-card';
    
    // Create card content
    const cardContent = `
      <div class="notice-card-number">${cols[0]}</div>
      <div class="notice-card-body">
        <div class="notice-card-title">${cols[1]}</div>
        <div class="notice-card-date">
          <i class="bi bi-calendar3"></i>
          ${cols[3]}
        </div>
      </div>
      <div class="notice-card-arrow">
        <i class="bi bi-chevron-right"></i>
      </div>
    `;
    
    noticeCard.innerHTML = cardContent;
    container.appendChild(noticeCard);
  });
}

// utility: parse entire CSV text with support for line breaks in quoted fields
function parseCSV(text) {
  const rows = [];
  let currentRow = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    
    if (ch === '"') {
      currentRow += ch;
      // check for escaped quote
      if (inQuotes && text[i + 1] === '"') {
        currentRow += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((ch === '\n' || ch === '\r') && inQuotes) {
      // preserve line breaks inside quoted fields
      currentRow += ch;
      if (ch === '\r' && text[i + 1] === '\n') {
        i++; // skip \n in \r\n
      }
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      // end of row
      if (currentRow.trim()) {
        rows.push(parseCSVLine(currentRow));
      }
      currentRow = '';
      if (ch === '\r' && text[i + 1] === '\n') {
        i++; // skip \n in \r\n
      }
    } else {
      currentRow += ch;
    }
  }
  
  // add last row if exists
  if (currentRow.trim()) {
    rows.push(parseCSVLine(currentRow));
  }
  
  return rows;
}

// utility: parse a CSV line supporting quoted fields and commas inside quotes
function parseCSVLine(line) {
  const cols = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { // escaped quote
        cur += '"';
        i++; // skip next
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      cols.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  cols.push(cur);
  // trim surrounding whitespace but preserve internal formatting
  return cols.map(s => s.trim());
}

/**
 * Load agreement rate data from JSON
 */
function loadAgreementRate(jsonPath = 'data/agreementrate.json') {
  fetch(appendVersion(jsonPath), { cache: 'no-store' })
    .then(resp => {
      if (!resp.ok) {
        throw new Error('Network response was not ok');
      }
      return resp.json();
    })
    .then(data => {
      window.agreementRateData = data;
      renderAgreementRate();
    })
    .catch(err => {
      console.error('Failed to load agreement rate data:', err);
      const container = document.getElementById('agreementrate');
      if (container) {
        container.innerHTML += '<div class="alert alert-danger" role="alert">동의율 데이터를 불러오는 중 오류가 발생했습니다.</div>';
      }
    });
}

/**
 * Render agreement rate display with chart and table
 */
function renderAgreementRate() {
  const data = window.agreementRateData;
  if (!data) return;

  // Update overall rate display in agreementrate section
  const overallDisplay = document.getElementById('overallRateDisplay');
  const overallProgress = document.getElementById('overallRateProgress');
  if (overallDisplay && overallProgress) {
    overallDisplay.textContent = data.overallRate.toFixed(1) + '%';
    overallDisplay.style.color = '#E12727';
    overallDisplay.style.textShadow = 'none';
    overallDisplay.style.webkitTextStroke = '4px #ffffff';
    overallDisplay.style.paintOrder = 'stroke fill';
    overallDisplay.style.zIndex = '10';
    overallDisplay.style.fontWeight = '900';

    overallProgress.style.width = data.overallRate + '%';
    overallProgress.setAttribute('aria-valuenow', data.overallRate);
    overallProgress.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-primary', 'bg-secondary');
    overallProgress.style.backgroundColor = getAgreementChartColor(data.overallRate);
  }

  // Update home button agreement rate display with progress bar
  const homeAgreementRateDisplay = document.getElementById('homeAgreementRateDisplay');
  const homeAgreementRateProgressBar = document.getElementById('homeAgreementRateProgressBar');
  const homeAgreementRateDate = document.getElementById('homeAgreementRateDate');
  if (homeAgreementRateDisplay) {
    homeAgreementRateDisplay.textContent = data.overallRate.toFixed(1) + '%';
    homeAgreementRateDisplay.style.color = '#E12727';
    homeAgreementRateDisplay.style.textShadow = 'none';
    homeAgreementRateDisplay.style.webkitTextStroke = '4px #ffffff';
    homeAgreementRateDisplay.style.paintOrder = 'stroke fill';
    homeAgreementRateDisplay.style.zIndex = '10';
    homeAgreementRateDisplay.style.fontWeight = '900';
  }
  if (homeAgreementRateDate) {
    const dateText = data.lastUpdated ? data.lastUpdated : '--';
    homeAgreementRateDate.textContent = `기준날짜: ${dateText}`;
  }
  if (homeAgreementRateProgressBar) {
    homeAgreementRateProgressBar.style.width = data.overallRate + '%';
    homeAgreementRateProgressBar.setAttribute('aria-valuenow', data.overallRate);
    // Apply color based on agreement rate
    homeAgreementRateProgressBar.style.backgroundColor = getAgreementChartColor(data.overallRate);
    // Remove all bootstrap color classes and apply appropriate one
    homeAgreementRateProgressBar.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-primary', 'bg-secondary');
    homeAgreementRateProgressBar.classList.add(getAgreementProgressClass(data.overallRate));
  }

  const buildingUnitSummary = document.getElementById('buildingUnitSummary');
  if (buildingUnitSummary && data.buildings) {
    const hyangchon = data.buildings.find(b => b.name === '향촌 아파트');
    const parangsae = data.buildings.find(b => b.name === '파랑새 아파트');

    const hyangchonText = hyangchon
      ? `향촌 아파트: ${hyangchon.agreedUnits}/${hyangchon.totalUnits}`
      : '향촌 아파트: -/-';
    const parangsaeText = parangsae
      ? `파랑새 아파트: ${parangsae.agreedUnits}/${parangsae.totalUnits}`
      : '파랑새 아파트: -/-';

    buildingUnitSummary.innerHTML = `${hyangchonText}<br>${parangsaeText}`;
  }

  // Render chart
  renderAgreementChart();
  
  // Render dong charts
  renderHyangchonDongChart();
  renderParangsaeDongChart();

  // Render table
  renderAgreementTable();
}

function getAgreementChartColor(rate) {
  if (rate === -1) return '#6c757d';
  if (rate <= 30) return '#dc3545';
  if (rate <= 80) return '#fd7e14';
  return '#28a745';
}

function getAgreementProgressClass(rate) {
  if (rate === -1) return 'bg-secondary';
  if (rate <= 30) return 'bg-danger';
  if (rate <= 80) return 'bg-warning';
  return 'bg-primary';
}

/**
 * Render bar chart for building-wise agreement rates
 */
function renderAgreementChart() {
  const data = window.agreementRateData;
  if (!data || !data.buildings) return;

  const ctx = document.getElementById('agreementChart');
  if (!ctx) return;

  // Destroy existing chart if any
  if (window.agreementChartInstance) {
    window.agreementChartInstance.destroy();
    window.agreementChartInstance = null;
  }

  const labels = data.buildings.map(b => b.name);
  const rates = data.buildings.map(b => b.agreedRate === -1 ? 0 : b.agreedRate);
  const colors = data.buildings.map(b => getAgreementChartColor(b.agreedRate));

  const originalRates = data.buildings.map(b => b.agreedRate);

  window.agreementChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '동의율 (%)',
        data: rates,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 1,
        barPercentage: 0.5,
        categoryPercentage: 0.5
      }]
    },
    plugins: [ChartDataLabels],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        datalabels: {
          anchor: 'end',
          align: 'top',
          offset: function(context) {
            const rate = originalRates[context.dataIndex];
            return rate === -1 ? 10 : 4;
          },
          color: function(context) {
            const rate = originalRates[context.dataIndex];
            return rate === -1 ? '#2937f0' : '#111827';
          },
          font: function(context) {
            const rate = originalRates[context.dataIndex];
            return {
              size: rate === -1 ? 30 : 12,
              weight: 'bold'
            };
          },
          formatter: function(value, context) {
            const rate = originalRates[context.dataIndex];
            return rate === -1 ? '?' : rate.toFixed(1) + '%';
          }
        },
        annotation: {
          annotations: {
            line1: {
              type: 'line',
              yMin: 90,
              yMax: 90,
              borderColor: '#dc3545',
              borderWidth: 2,
              borderDash: [5, 5],
              label: {
                display: false
              }
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: true,
            drawOnChartArea: true,
            drawTicks: true
          }
        },
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      }
    }
  });
}

/**
 * Render bar chart for Hyangchon dong-wise agreement rates
 */
function renderHyangchonDongChart() {
  const data = window.agreementRateData;
  if (!data || !data.buildings) return;

  const ctx = document.getElementById('hyangchonDongChart');
  if (!ctx) return;

  // Find Hyangchon building
  const hyangchon = data.buildings.find(b => b.name === '향촌 아파트');
  if (!hyangchon || !hyangchon.dongs) return;

  // Destroy existing chart if any
  if (window.hyangchonDongChartInstance) {
    window.hyangchonDongChartInstance.destroy();
    window.hyangchonDongChartInstance = null;
  }

  const dongLabels = hyangchon.dongs.map(d => d.name.replace('향촌 ', ''));
  const dongRates = hyangchon.dongs.map(d => d.agreedRate === -1 ? 0 : d.agreedRate);
  const originalDongRates = hyangchon.dongs.map(d => d.agreedRate);
  const dongColors = hyangchon.dongs.map(d => getAgreementChartColor(d.agreedRate));

  // Use same style as Parangsae chart
  const barPercentage = 0.8;
  const categoryPercentage = 0.9;

  window.hyangchonDongChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dongLabels,
      datasets: [{
        label: '동의율 (%)',
        data: dongRates,
        backgroundColor: dongColors,
        borderColor: dongColors,
        borderWidth: 1,
        barPercentage: barPercentage,
        categoryPercentage: categoryPercentage
      }]
    },
    plugins: [ChartDataLabels],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        datalabels: {
          anchor: 'end',
          align: 'top',
          offset: function(context) {
            const rate = originalDongRates[context.dataIndex];
            return rate === -1 ? 10 : 4;
          },
          color: function(context) {
            const rate = originalDongRates[context.dataIndex];
            return rate === -1 ? '#2937f0' : '#111827';
          },
          font: function(context) {
            const rate = originalDongRates[context.dataIndex];
            return {
              size: rate === -1 ? 30 : 12,
              weight: 'bold'
            };
          },
          formatter: function(value, context) {
            const rate = originalDongRates[context.dataIndex];
            return rate === -1 ? '?' : rate.toFixed(1) + '%';
          }
        },
        annotation: {
          annotations: {
            line1: {
              type: 'line',
              yMin: 90,
              yMax: 90,
              borderColor: '#dc3545',
              borderWidth: 2,
              borderDash: [5, 5],
              label: {
                display: false
              }
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: true,
            drawOnChartArea: true,
            drawTicks: true
          }
        },
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      }
    }
  });
}

/**
 * Render bar chart for Parangsae dong-wise agreement rates
 */
function renderParangsaeDongChart() {
  const data = window.agreementRateData;
  if (!data || !data.buildings) return;

  const ctx = document.getElementById('parangsaeDongChart');
  if (!ctx) return;

  // Find Parangsae building
  const parangsae = data.buildings.find(b => b.name === '파랑새 아파트');
  if (!parangsae || !parangsae.dongs) return;

  // Destroy existing chart if any
  if (window.parangsaeDongChartInstance) {
    window.parangsaeDongChartInstance.destroy();
    window.parangsaeDongChartInstance = null;
  }

  const dongLabels = parangsae.dongs.map(d => d.name.replace('파랑새 ', ''));
  const dongRates = parangsae.dongs.map(d => d.agreedRate === -1 ? 0 : d.agreedRate);
  const originalDongRates = parangsae.dongs.map(d => d.agreedRate);
  const dongColors = parangsae.dongs.map(d => getAgreementChartColor(d.agreedRate));

  window.parangsaeDongChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dongLabels,
      datasets: [{
        label: '동의율 (%)',
        data: dongRates,
        backgroundColor: dongColors,
        borderColor: dongColors,
        borderWidth: 1,
        barPercentage: 0.8,
        categoryPercentage: 0.9
      }]
    },
    plugins: [ChartDataLabels],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        datalabels: {
          anchor: 'end',
          align: 'top',
          offset: function(context) {
            const rate = originalDongRates[context.dataIndex];
            return rate === -1 ? 10 : 4;
          },
          color: function(context) {
            const rate = originalDongRates[context.dataIndex];
            return rate === -1 ? '#2937f0' : '#111827';
          },
          font: function(context) {
            const rate = originalDongRates[context.dataIndex];
            return {
              size: rate === -1 ? 30 : 12,
              weight: 'bold'
            };
          },
          formatter: function(value, context) {
            const rate = originalDongRates[context.dataIndex];
            return rate === -1 ? '?' : rate.toFixed(1) + '%';
          }
        },
        annotation: {
          annotations: {
            line1: {
              type: 'line',
              yMin: 90,
              yMax: 90,
              borderColor: '#dc3545',
              borderWidth: 2,
              borderDash: [5, 5],
              label: {
                display: false
              }
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: true,
            drawOnChartArea: true,
            drawTicks: true
          }
        },
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      }
    }
  });
}


/**
 * Render agreement rate details table
 */
function renderAgreementTable() {
  const data = window.agreementRateData;
  if (!data || !data.buildings) return;

  const hyangchonTbody = document.getElementById('hyangchonAgreementTableBody');
  const parangsaeTbody = document.getElementById('parangsaeAgreementTableBody');
  if (!hyangchonTbody || !parangsaeTbody) return;

  hyangchonTbody.innerHTML = '';
  parangsaeTbody.innerHTML = '';

  function appendDongRows(tbody, dongs) {
    if (!dongs) return;

    dongs.forEach(dong => {
      const tr = document.createElement('tr');

      const isUnknown = dong.agreedRate === -1;
      const displayRate = isUnknown ? 0 : dong.agreedRate;
      const displayText = isUnknown ? '? %' : dong.agreedRate.toFixed(1) + '%';

      let barColor = 'bg-secondary';
      let textColor = '#212529';

      if (!isUnknown) {
        if (displayRate <= 30) {
          barColor = 'bg-danger';
          textColor = '#212529';
        } else if (displayRate <= 80) {
          barColor = 'bg-warning';
          textColor = '#fff';
        } else {
          barColor = 'bg-primary';
          textColor = '#fff';
        }
      }

      tr.innerHTML = `
        <td>${dong.name}</td>
        <td>${dong.totalUnits}</td>
        <td>${isUnknown ? '?' : dong.agreedUnits}</td>
        <td>
          <div class="progress" style="height: 24px; position: relative; background-color: #dee2e6;">
            <div class="progress-bar ${barColor}" role="progressbar" style="width: ${displayRate}%;" aria-valuenow="${displayRate}" aria-valuemin="0" aria-valuemax="100"></div>
            <span class="position-absolute w-100 text-center fw-bold" style="line-height: 24px; color: ${textColor};">${displayText}</span>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  const hyangchon = data.buildings.find(b => b.name === '향촌 아파트');
  const parangsae = data.buildings.find(b => b.name === '파랑새 아파트');

  appendDongRows(hyangchonTbody, hyangchon && hyangchon.dongs);
  appendDongRows(parangsaeTbody, parangsae && parangsae.dongs);
}

/**
 * Load and display activities from CSV
 */
function getYouTubeVideoId(url) {
  if (!url) return null;

  const normalized = String(url).trim();
  if (!/^https?:\/\//i.test(normalized)) return null;

  const shortsMatch = normalized.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/i);
  if (shortsMatch) return shortsMatch[1];

  const shortLinkMatch = normalized.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/i);
  if (shortLinkMatch) return shortLinkMatch[1];

  try {
    const parsed = new URL(normalized);
    const watchId = parsed.searchParams.get('v');
    if (watchId) return watchId;
  } catch (err) {
    return null;
  }

  return null;
}

function parseActivityMedia(rawMediaField) {
  return rawMediaField
    .split('|')
    .map(item => item.trim())
    .filter(item => item.length > 0)
    .map(item => {
      const youtubeId = getYouTubeVideoId(item);
      if (youtubeId) {
        return {
          type: 'youtube',
          source: item,
          videoId: youtubeId,
          embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
          thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
        };
      }

      return {
        type: 'image',
        source: (item.includes('/') || item.includes('\\')) ? item : `activity_img/${item}`
      };
    });
}

function buildYouTubeEmbedUrl(baseEmbedUrl, options = {}) {
  const autoplay = options.autoplay ? '1' : '0';
  const mute = options.mute ? '1' : '0';
  return `${baseEmbedUrl}?rel=0&autoplay=${autoplay}&mute=${mute}&playsinline=1&enablejsapi=1`;
}

function setYouTubeIframeVolume(iframe, volume = 50) {
  if (!iframe || iframe.tagName !== 'IFRAME') return;

  const applyVolume = () => {
    iframe.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: 'unMute', args: [] }),
      'https://www.youtube.com'
    );
    iframe.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: 'setVolume', args: [volume] }),
      'https://www.youtube.com'
    );
  };

  // Retry briefly because player readiness timing varies by browser/network.
  setTimeout(applyVolume, 300);
  setTimeout(applyVolume, 900);
}

function syncGalleryYouTubePlayback() {
  const mediaItems = document.querySelectorAll('.gallery-media-item');

  mediaItems.forEach((item, index) => {
    if (item.tagName !== 'IFRAME') return;

    const baseEmbedUrl = item.dataset.embedBase;
    if (!baseEmbedUrl) return;

    const shouldAutoplay = index === currentImageIndex;
      const desiredSrc = buildYouTubeEmbedUrl(baseEmbedUrl, {
        autoplay: shouldAutoplay,
        mute: false
    });

    if (item.src !== desiredSrc) {
      item.src = desiredSrc;
      if (shouldAutoplay) {
        setYouTubeIframeVolume(item, 50);
      }
    } else if (shouldAutoplay) {
      setYouTubeIframeVolume(item, 50);
    }
  });
}

function loadActivities(csvPath = 'data/activities.csv') {
  const container = document.getElementById('activitiesContainer');
  if (!container) return;

  fetch(appendVersion(csvPath), { cache: 'no-store' })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then(csvData => {
      const rows = csvData.trim().split('\n').map(r => r.trim()).filter(r => r);
      if (rows.length === 0) return;

      // Skip header row
      const dataRows = rows.slice(1);
      
      // Clear container
      container.innerHTML = '';

      // Show empty state message if no data
      if (dataRows.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;"><i class="bi bi-inbox" style="font-size: 3rem; color: #999; display: block; margin-bottom: 15px;"></i><p style="color: #999; font-size: 1rem;">등록된 활동 내역이 없습니다.</p></div>';
        return;
      }

      const sortedRows = [...dataRows].sort((a, b) => {
        const aId = Number((a.split(',')[0] || '').trim());
        const bId = Number((b.split(',')[0] || '').trim());
        return bId - aId;
      });

      // Parse and render each activity (latest first)
      sortedRows.forEach((row, index) => {
        const cols = row.split(',').map(c => c.trim());
        const rawMediaField = cols[3] || '';
        const activityMedia = parseActivityMedia(rawMediaField);
        const activityImages = activityMedia
          .filter(media => media.type === 'image')
          .map(media => media.source);

        const activityData = {
          id: cols[0] || index + 1,
          title: cols[1] || '',
          date: cols[2] || '',
          media: activityMedia,
          images: activityImages
        };

        if (!activityData.title) return;

        // Create card
        const cardCol = document.createElement('div');
        cardCol.className = 'col-12 col-sm-6 col-md-4 col-lg-3';

        const card = document.createElement('div');
        card.className = 'activity-card';
        card.onclick = () => openActivityModal(activityData);

        // Card image
        const cardImg = document.createElement('div');
        cardImg.className = 'activity-card-img';
        const primaryMedia = activityData.media[0];
        if (primaryMedia) {
          if (primaryMedia.type === 'youtube') {
            cardImg.style.backgroundImage = `url('${primaryMedia.thumbnailUrl}')`;
            cardImg.innerHTML = '<i class="bi bi-play-circle-fill" style="font-size: 3.5rem; color: #ffffff; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);"></i>';
          } else {
            const imageUrl = appendVersionForLocalAsset(primaryMedia.source);
            cardImg.style.backgroundImage = `url('${imageUrl}')`;
          }
        } else {
          cardImg.style.backgroundColor = '#e9ecef';
          cardImg.innerHTML = '<i class="bi bi-image" style="font-size: 3rem; color: #6c757d;"></i>';
        }
        card.appendChild(cardImg);

        // Card body
        const cardBody = document.createElement('div');
        cardBody.className = 'activity-card-body';

        const cardTitle = document.createElement('h5');
        cardTitle.className = 'activity-card-title';
        cardTitle.textContent = activityData.title;
        cardBody.appendChild(cardTitle);

        const cardDate = document.createElement('p');
        cardDate.className = 'activity-card-date';
        cardDate.textContent = activityData.date;
        cardBody.appendChild(cardDate);

        if (activityData.media.length > 1) {
          const cardBadge = document.createElement('span');
          cardBadge.className = 'activity-card-badge';
          cardBadge.innerHTML = `<i class="bi bi-collection-play"></i> ${activityData.media.length}`;
          cardBody.appendChild(cardBadge);
        }

        card.appendChild(cardBody);
        cardCol.appendChild(card);
        container.appendChild(cardCol);
      });
    })
    .catch(err => {
      console.error('Error loading activities:', err);
      container.innerHTML = '<p class="text-center text-muted">활동 내역을 불러올 수 없습니다.</p>';
    });
}

/**
 * Open activity modal with details
 */
let currentActivityImages = [];
let currentImageIndex = 0;

function openActivityModal(activityData) {
  const modal = document.getElementById('activityModal');
  const modalTitle = document.getElementById('activityModalTitle');
  const modalDate = document.getElementById('activityModalDate');
  const modalDescription = document.getElementById('activityModalDescription');
  const galleryImages = document.getElementById('galleryImages');
  const galleryIndicators = document.getElementById('galleryIndicators');

  if (!modal) return;

  // Set data
  modalTitle.textContent = activityData.title;
  modalDate.textContent = activityData.date;
  modalDescription.textContent = activityData.title; // CSV has only title, using it as description

  // Setup media
  currentActivityImages = (activityData.media && activityData.media.length > 0)
    ? activityData.media
    : (activityData.images || []).map(img => ({ type: 'image', source: img }));
  currentImageIndex = 0;

  // Clear and render gallery
  galleryImages.innerHTML = '';
  galleryIndicators.innerHTML = '';

  if (currentActivityImages.length > 0) {
    currentActivityImages.forEach((media, index) => {
      if (media.type === 'youtube') {
        const iframe = document.createElement('iframe');
        iframe.dataset.embedBase = media.embedUrl;
        iframe.src = buildYouTubeEmbedUrl(media.embedUrl, {
          autoplay: index === 0,
          mute: false
        });
        iframe.title = `${activityData.title} 영상 ${index + 1}`;
        iframe.className = 'gallery-media-item gallery-video' + (index === 0 ? ' active' : '');
        iframe.loading = 'lazy';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;
        iframe.addEventListener('load', () => setYouTubeIframeVolume(iframe, 50));
        galleryImages.appendChild(iframe);
      } else {
        const img = document.createElement('img');
        img.src = appendVersionForLocalAsset(media.source);
        img.alt = `${activityData.title} 이미지 ${index + 1}`;
        img.className = 'gallery-media-item gallery-image' + (index === 0 ? ' active' : '');
        galleryImages.appendChild(img);
      }

      // Indicator
      const indicator = document.createElement('span');
      indicator.className = 'gallery-indicator' + (index === 0 ? ' active' : '');
      indicator.onclick = () => showImage(index);
      galleryIndicators.appendChild(indicator);
    });

    // Show/hide navigation buttons
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');
    if (currentActivityImages.length > 1) {
      prevBtn.style.display = 'flex';
      nextBtn.style.display = 'flex';
    } else {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    }

    // Ensure only the current item is playing.
    syncGalleryYouTubePlayback();
  }

  // Show modal
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeActivityModal() {
  const modal = document.getElementById('activityModal');
  const galleryImages = document.getElementById('galleryImages');
  const galleryIndicators = document.getElementById('galleryIndicators');

  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  // Clear media so embedded videos stop when modal closes
  if (galleryImages) {
    galleryImages.innerHTML = '';
  }
  if (galleryIndicators) {
    galleryIndicators.innerHTML = '';
  }
}

function showImage(index) {
  if (index < 0 || index >= currentActivityImages.length) return;

  const images = document.querySelectorAll('.gallery-media-item');
  const indicators = document.querySelectorAll('.gallery-indicator');

  images[currentImageIndex]?.classList.remove('active');
  indicators[currentImageIndex]?.classList.remove('active');

  currentImageIndex = index;

  images[currentImageIndex]?.classList.add('active');
  indicators[currentImageIndex]?.classList.add('active');
  syncGalleryYouTubePlayback();
}

function nextImage() {
  if (currentActivityImages.length === 0) return;
  const nextIndex = (currentImageIndex + 1) % currentActivityImages.length;
  showImage(nextIndex);
}

function prevImage() {
  if (currentActivityImages.length === 0) return;
  const prevIndex = (currentImageIndex - 1 + currentActivityImages.length) % currentActivityImages.length;
  showImage(prevIndex);
}

// Setup modal event listeners
window.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('activityModal');
  const closeBtn = document.querySelector('.activity-modal-close');
  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');

  if (closeBtn) {
    closeBtn.onclick = closeActivityModal;
  }

  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) {
        closeActivityModal();
      }
    };
  }

  if (prevBtn) {
    prevBtn.onclick = prevImage;
  }

  if (nextBtn) {
    nextBtn.onclick = nextImage;
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (modal && modal.style.display === 'flex') {
      if (e.key === 'Escape') {
        closeActivityModal();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      }
    }
  });
});


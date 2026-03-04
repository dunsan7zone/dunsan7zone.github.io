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

function showSection(targetId) {
    // collect all sections each time in case DOM changes
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(sec => {
      sec.classList.remove('active');
    });

    const target = document.getElementById(targetId);
    if (target) {
      target.classList.add('active');
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

window.addEventListener('DOMContentLoaded', event => {

  // Activate Bootstrap scrollspy on the main nav element
  const mainNav = document.body.querySelector('#mainNav');
  if (mainNav) {
      new bootstrap.ScrollSpy(document.body, {
          target: '#mainNav',
          offset: 74,
      });
  };

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
        showSection(targetId);
        // update hash so it persists across refresh
        history.pushState(null, '', '#' + targetId);
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
        showSection(targetId);
        history.pushState(null, '', '#' + targetId);
        // update active class on nav links if applicable
        navLinks.forEach(l => l.classList.remove('active'));
        navLinks.forEach(l => {
          const val = l.dataset.val || l.getAttribute('href').substring(1);
          if (val === targetId) l.classList.add('active');
        });
      }
    });
  });
  
  // on initial load, check for a hash to restore section
  let initial = 'home';
  if (location.hash) {
    initial = location.hash.substring(1);
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
    const targetId = location.hash ? location.hash.substring(1) : 'home';
    showSection(targetId);
    // update active class on nav links
    navLinks.forEach(l => l.classList.remove('active'));
    navLinks.forEach(l => {
      const val = l.dataset.val || l.getAttribute('href').substring(1);
      if (val === targetId) l.classList.add('active');
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

  // load board data from CSV
  loadBoard();
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
    if (window.innerWidth <= 576 && titleText.length > 19) {
      titleText = titleText.substring(0, 19) + '...';
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

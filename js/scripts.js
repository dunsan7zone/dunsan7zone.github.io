/*!
* Start Bootstrap - New Age v6.0.7 (https://startbootstrap.com/theme/new-age)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-new-age/blob/master/LICENSE)
*/
//
// Scripts
// 


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
        history.replaceState(null, '', '#' + targetId);
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
      history.replaceState(null, '', '#home');
    });
  }
  // on initial load, check for a hash to restore section
  let initial = 'home';
  if (location.hash) {
    initial = location.hash.substring(1);
  }
  showSection(initial);
  // highlight link if any
  navLinks.forEach(l => {
    const val = l.dataset.val || l.getAttribute('href').substring(1);
    if (val === initial) l.classList.add('active');
  });

  // initialize masthead carousel if present (auto sliding)
  const carouselEl = document.getElementById('mastheadCarousel');
  if (carouselEl) {
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
  fetch(csvPath)
    .then(resp => {
      if (!resp.ok) {
        throw new Error('Network response was not ok');
      }
      return resp.text();
    })
    .then(text => {
      const lines = text.trim().split(/\r?\n/);
      // drop header if exists
      if (lines.length > 0) lines.shift();
      // parse CSV rows (support quoted fields)
      window.boardData = lines.map(l => parseCSVLine(l));
      renderBoard();

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
 * @param {string} field one of 'title','number','date','all'
 */
function renderBoard(filterText = '', field = 'title') {
  const tbody = document.querySelector('#boardTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const data = window.boardData || [];
  const q = (filterText || '').trim().toLowerCase();
  const results = data.filter(cols => {
    if (!q) return true;
    const num = (cols[0]||'').toLowerCase();
    const title = (cols[1]||'').toLowerCase();
    const date = (cols[3]||'').toLowerCase();
    if (field === 'number') return num.indexOf(q) !== -1;
    if (field === 'date') return date.indexOf(q) !== -1;
    if (field === 'title') return title.indexOf(q) !== -1;
    // all
    return (num + ' ' + title + ' ' + date).indexOf(q) !== -1;
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
    tdTitle.textContent = cols[1] || '';
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
  // trim surrounding whitespace
  return cols.map(s => s.trim());
}

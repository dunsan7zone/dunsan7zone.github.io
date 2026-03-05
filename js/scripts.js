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
  
  // load agreement rate data
  loadAgreementRate();
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
  if (homeAgreementRateDisplay) {
    homeAgreementRateDisplay.textContent = data.overallRate.toFixed(1) + '%';
  }
  if (homeAgreementRateProgressBar) {
    homeAgreementRateProgressBar.style.width = data.overallRate + '%';
    homeAgreementRateProgressBar.setAttribute('aria-valuenow', data.overallRate);
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


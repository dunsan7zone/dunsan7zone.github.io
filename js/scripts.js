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
    fetch(csvPath)
        .then(resp => {
            if (!resp.ok) {
                throw new Error('Network response was not ok');
            }
            return resp.text();
        })
        .then(text => {
            const lines = text.trim().split(/\r?\n/);
            const tbody = document.querySelector('#boardTable tbody');
            if (!tbody) return;

            // assume first line is header, remove it
            if (lines.length > 0) {
                lines.shift();
            }

            lines.forEach(line => {
                const cols = line.split(',');
                const tr = document.createElement('tr');
                tr.style.cursor = 'pointer';
                tr.dataset.id = cols[0] || '';
                // only show first four columns in the list (번호,제목,작성자,날짜)
                cols.slice(0,4).forEach(col => {
                    const td = document.createElement('td');
                    td.textContent = col;
                    tr.appendChild(td);
                });
                tr.addEventListener('click', () => {
                    if (tr.dataset.id) {
                        location.href = `detail.html?id=${encodeURIComponent(tr.dataset.id)}`;
                    }
                });
                tbody.appendChild(tr);
            });

            // ensure at least 20 rows (empty placeholders)
            const current = tbody.querySelectorAll('tr').length;
            for (let i = current; i < 20; i++) {
                const tr = document.createElement('tr');
                tr.classList.add('empty-row');
                for (let j = 0; j < 4; j++) {
                    const td = document.createElement('td');
                    td.innerHTML = '&nbsp;';
                    tr.appendChild(td);
                }
                tbody.appendChild(tr);
            }

            if (current === 0) {
                console.warn('loadBoard: no data rows found (check CSV path or server environment)');
            }
        })
        .catch(err => {
            console.error('Failed to load board CSV:', err);
            console.info('If you are opening via file://, fetching local files is blocked. Use a local web server (e.g. Live Server extension).');
        });
}

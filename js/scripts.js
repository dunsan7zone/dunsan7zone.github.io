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

  // attach showSection to navigation items
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const link = item.querySelector('.nav-link');
      if (link) {
        const targetId = link.getAttribute('data-val');
        showSection(targetId);
      }
    });
  });

  const homeItem = document.querySelector('.navbar-brand');
  if (homeItem) {
    homeItem.addEventListener('click', e => {
      e.preventDefault();
      showSection('home');
    });
  }
  showSection('home');

  // initialize masthead carousel if present (auto sliding)
  const carouselEl = document.getElementById('mastheadCarousel');
  if (carouselEl) {
      new bootstrap.Carousel(carouselEl, {
          interval: 3000,    // change slide every 3 seconds
          ride: 'carousel'
      });
  }
});

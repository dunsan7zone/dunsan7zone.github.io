/*!
* Start Bootstrap - New Age v6.0.7 (https://startbootstrap.com/theme/new-age)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-new-age/blob/master/LICENSE)
*/
//
// Tabs (instead of scroll/rolling)
//

window.addEventListener('DOMContentLoaded', () => {
    // 1) Activate tab from URL hash on first load
    const hash = window.location.hash;
    const tabSelector = (h) => `#mainNav a[data-bs-toggle="tab"][href="${h}"]`;

    const showTabByHash = (h) => {
        const trigger = document.querySelector(tabSelector(h));
        if (trigger) {
            bootstrap.Tab.getOrCreateInstance(trigger).show();
            return true;
        }
        return false;
    };

    if (!hash || !showTabByHash(hash)) {
        // Default to Home tab
        showTabByHash('#home');
    }

    // 2) Keep URL hash in sync when user changes tabs
    document.querySelectorAll('#mainNav a[data-bs-toggle="tab"]').forEach((el) => {
        el.addEventListener('shown.bs.tab', (e) => {
            const href = e.target.getAttribute('href');
            if (href && href.startsWith('#')) {
                history.replaceState(null, '', href);
            }
        });
    });

    // 3) Collapse responsive navbar when a tab is selected (mobile)
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const clickableItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link, #mainNav .navbar-brand')
    );

    clickableItems.forEach((item) => {
        item.addEventListener('click', () => {
            if (!navbarToggler) return;
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });
});

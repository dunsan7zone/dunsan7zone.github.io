window.addEventListener('DOMContentLoaded', () => {
  const BS = window.bootstrap; // ✅ 전역 bootstrap 이름충돌 방지

  // 탭 링크는 href가 #으로 시작하는 것만
  const TAB_LINKS = '#mainNav a[data-bs-toggle="tab"][href^="#"]';

  // 1) Activate tab from URL hash on first load
  const hash = window.location.hash;

  const showTabByHash = (h) => {
    if (!BS?.Tab) return false;
    const trigger = document.querySelector(`#mainNav a[data-bs-toggle="tab"][href="${h}"]`);
    if (!trigger) return false;

    BS.Tab.getOrCreateInstance(trigger).show();
    return true;
  };

  if (!hash || !showTabByHash(hash)) {
    showTabByHash('#home');
  }

  // 2) Keep URL hash in sync when user changes tabs
  document.querySelectorAll(TAB_LINKS).forEach((el) => {
    el.addEventListener('shown.bs.tab', (e) => {
      const href = e.target.getAttribute('href');
      if (href) history.replaceState(null, '', href);
    });
  });

  // 3) Collapse responsive navbar when a tab/link is selected (mobile)
  const navbarCollapseEl = document.querySelector('#navbarResponsive');
  const navbarToggler = document.body.querySelector('.navbar-toggler');

  const shouldCollapse = () =>
    navbarToggler && window.getComputedStyle(navbarToggler).display !== 'none';

  const hideNavbar = () => {
    if (!navbarCollapseEl || !shouldCollapse() || !BS?.Collapse) return;

    // ✅ 이미 닫혀있으면 굳이 hide 호출 안 함(불필요 호출 방지)
    if (!navbarCollapseEl.classList.contains('show')) return;

    BS.Collapse.getOrCreateInstance(navbarCollapseEl, { toggle: false }).hide();
  };

  // ✅ 메뉴 클릭은 전체 a + brand로 (탭 전용으로 묶지 말고)
  document.querySelectorAll('#mainNav a, #mainNav .navbar-brand').forEach((item) => {
    item.addEventListener('click', hideNavbar);
  });
});
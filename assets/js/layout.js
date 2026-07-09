/*
 * 모든 페이지가 공유하는 아이콘 스프라이트 / 헤더 / 푸터.
 *
 * fetch 기반 인클루드는 file:// 로 직접 열 때 CORS 로 막히므로,
 * 마크업을 이 파일에 담아 커스텀 엘리먼트로 렌더링한다. (네트워크 요청 없음)
 *
 * 사용법
 *   <site-header data-active="korean|foreign|companies|support"></site-header>
 *   <site-footer></site-footer>            기본(한/영 4단)
 *   <site-footer data-variant="en"></site-footer>   외국인 페이지용 영문 4단
 *
 * layout.js 는 <head> 에서 defer 없이 불러야 파서가 태그를 만나는 즉시
 * 업그레이드되어 깜빡임이 없다. 아이콘 스프라이트는 <site-header> 가
 * 함께 출력하므로, 페이지 뒤쪽의 <use> 들도 문제없이 참조한다.
 */
(function () {
  'use strict';

  var SPRITE = [
    '<svg class="sprite" aria-hidden="true" focusable="false">',
    '<symbol id="ic-car" viewBox="0 0 24 24"><path d="M5 11l1.6-4A2 2 0 019.5 6h5a2 2 0 011.9 1L18 11"/><path d="M4 11h16v5H4z"/><circle cx="7.5" cy="18" r="1.3"/><circle cx="16.5" cy="18" r="1.3"/></symbol>',
    '<symbol id="ic-income" viewBox="0 0 24 24"><path d="M4 15l5-5 4 4 7-8"/><path d="M17 6h3v3"/></symbol>',
    '<symbol id="ic-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></symbol>',
    '<symbol id="ic-edu" viewBox="0 0 24 24"><path d="M12 6l9 4-9 4-9-4 9-4z"/><path d="M6 11v4c0 1.6 3 3 6 3s6-1.4 6-3v-4"/></symbol>',
    '<symbol id="ic-shield" viewBox="0 0 24 24"><path d="M12 4l7 3v5c0 4-3 6.3-7 8-4-1.7-7-4-7-8V7l7-3z"/><path d="M9.3 12l2 2 3.4-4"/></symbol>',
    '<symbol id="ic-shield-check" viewBox="0 0 24 24"><path d="M12 4l7 3v5c0 4-3 6.3-7 8-4-1.7-7-4-7-8V7l7-3z"/><path d="M9 12l2 2 4-4.5"/></symbol>',
    '<symbol id="ic-match" viewBox="0 0 24 24"><circle cx="9" cy="9" r="3"/><path d="M3.5 19c0-3.2 2.5-5 5.5-5s5.5 1.8 5.5 5"/><path d="M16 6.5a3 3 0 010 6"/><path d="M15.5 14.2c2.6 0 4 1.9 4 4.8"/></symbol>',
    '<symbol id="ic-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><line x1="4" y1="12" x2="20" y2="12"/><path d="M12 4c2.6 2.6 2.6 13.4 0 16"/><path d="M12 4c-2.6 2.6-2.6 13.4 0 16"/></symbol>',
    '<symbol id="ic-phone" viewBox="0 0 24 24"><path d="M6 4h3l1.6 4.5-2 1.4a11 11 0 004.9 4.9l1.4-2L20 15v3a1.5 1.5 0 01-1.6 1.5A15.5 15.5 0 014.5 5.6 1.5 1.5 0 016 4z"/></symbol>',
    '<symbol id="ic-chat-users" viewBox="0 0 24 24"><circle cx="9" cy="9" r="3"/><path d="M3.5 19c0-3.2 2.5-5 5.5-5s5.5 1.8 5.5 5"/><path d="M15 5.5a3 3 0 010 6"/><path d="M16 14c2.4 0 3.8 1.8 3.8 4.6"/></symbol>',
    '<symbol id="ic-headset" viewBox="0 0 24 24"><path d="M5 13v-1a7 7 0 0114 0v1"/><path d="M4.5 13.5A1.5 1.5 0 016 12h1v6H6a1.5 1.5 0 01-1.5-1.5z"/><path d="M19.5 13.5A1.5 1.5 0 0018 12h-1v6h1a1.5 1.5 0 001.5-1.5z"/></symbol>',
    '<symbol id="ic-camera" viewBox="0 0 24 24"><path d="M4 8.5h3L8.4 6h7.2L17 8.5h3a1 1 0 011 1V18a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5a1 1 0 011-1z"/><circle cx="12" cy="13" r="3.4"/></symbol>',
    '<symbol id="ic-check" viewBox="0 0 24 24"><path d="M5 12.5l4 4 10-10.5"/></symbol>',
    '<symbol id="ic-check-circle" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 12l2.5 2.5L16 9"/></symbol>',
    '<symbol id="ic-arrow" viewBox="0 0 24 24"><path d="M5 12h13"/><path d="M12 6l6 6-6 6"/></symbol>',
    '<symbol id="ic-won" viewBox="0 0 24 24"><path d="M4 7l3.5 10L12 8l4.5 9L20 7"/><line x1="3.5" y1="11.5" x2="20.5" y2="11.5"/></symbol>',
    '<symbol id="ic-hand" viewBox="0 0 24 24"><path d="M4 12l4-3 4 2 4-2 4 3"/><path d="M4 12v3a2 2 0 002 2h12a2 2 0 002-2v-3"/></symbol>',
    '<symbol id="ic-lock" viewBox="0 0 24 24"><path d="M7 10V8a5 5 0 0110 0v2"/><path d="M5 10h14v9a1 1 0 01-1 1H6a1 1 0 01-1-1z"/><circle cx="12" cy="15" r="1.4"/></symbol>',
    '<symbol id="ic-close" viewBox="0 0 24 24"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></symbol>',
    '<symbol id="ic-form" viewBox="0 0 24 24"><path d="M7 4h7l4 4v12a1 1 0 01-1 1H7a1 1 0 01-1-1V5a1 1 0 011-1z"/><path d="M14 4v4h4"/><path d="M9 13l1.5 1.5L14 11"/></symbol>',
    '<symbol id="ic-send" viewBox="0 0 24 24"><path d="M21 4L3 11l7 3 3 7 8-17z"/><line x1="10" y1="14" x2="21" y2="4"/></symbol>',
    '<symbol id="ic-doc" viewBox="0 0 24 24"><path d="M7 4h7l4 4v12a1 1 0 01-1 1H7a1 1 0 01-1-1V5a1 1 0 011-1z"/><path d="M14 4v4h4"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="16" x2="13" y2="16"/></symbol>',
    '<symbol id="ic-building" viewBox="0 0 24 24"><path d="M5 20V6a1 1 0 011-1h6a1 1 0 011 1v14"/><path d="M13 20v-8h5a1 1 0 011 1v7"/><line x1="8" y1="8" x2="10" y2="8"/><line x1="8" y1="11" x2="10" y2="11"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="3" y1="20" x2="21" y2="20"/></symbol>',
    '<symbol id="ic-thumb" viewBox="0 0 24 24"><path d="M7 11l4-6a2 2 0 013 1.5V10h4a2 2 0 012 2.3l-1 5A2 2 0 0118 19H7z"/><path d="M7 11H4v8h3z"/></symbol>',
    '<symbol id="ic-id" viewBox="0 0 24 24"><path d="M4 6h16v12H4z"/><circle cx="8.5" cy="11" r="1.8"/><path d="M6 15.5c0-1.4 1.1-2.2 2.5-2.2s2.5.8 2.5 2.2"/><line x1="13" y1="10" x2="18" y2="10"/><line x1="13" y1="13" x2="17" y2="13"/></symbol>',
    '<symbol id="ic-visa" viewBox="0 0 24 24"><path d="M6 4h8l4 4v12H6z"/><path d="M14 4v4h4"/><path d="M9 15l2 2 4-4"/></symbol>',
    '<symbol id="ic-book" viewBox="0 0 24 24"><path d="M4 5a2 2 0 012-2h5v16H6a2 2 0 00-2 2z"/><path d="M20 5a2 2 0 00-2-2h-5v16h5a2 2 0 012 2z"/></symbol>',
    '<symbol id="ic-aptitude" viewBox="0 0 24 24"><path d="M8 4h8a1 1 0 011 1v14a1 1 0 01-1 1H8a1 1 0 01-1-1V5a1 1 0 011-1z"/><path d="M10 9l1.2 1.2L14 7.5"/><line x1="10" y1="14" x2="15" y2="14"/><line x1="10" y1="17" x2="14" y2="17"/></symbol>',
    '<symbol id="ic-grad" viewBox="0 0 24 24"><path d="M12 5l9 4-9 4-9-4 9-4z"/><path d="M6 10.5V15c0 1.6 2.7 3 6 3s6-1.4 6-3v-4.5"/></symbol>',
    '<symbol id="ic-wheel" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.4"/><line x1="12" y1="4" x2="12" y2="9.6"/><line x1="5" y1="16" x2="9.8" y2="13.2"/><line x1="19" y1="16" x2="14.2" y2="13.2"/></symbol>',
    '<symbol id="ic-calendar" viewBox="0 0 24 24"><path d="M4 6h16v14H4z"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="8" y1="4" x2="8" y2="7"/><line x1="16" y1="4" x2="16" y2="7"/></symbol>',
    '<symbol id="ic-cal-star" viewBox="0 0 24 24"><path d="M4 6h16v14H4z"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="8" y1="4" x2="8" y2="7"/><line x1="16" y1="4" x2="16" y2="7"/><path d="M12 12.5l.9 1.8 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z"/></symbol>',
    '<symbol id="ic-heart-hands" viewBox="0 0 24 24"><path d="M12 8.5c-.9-1.8-3.6-1.9-4.6 0-.7 1.3.1 2.8 1.2 3.8L12 15l3.4-2.7c1.1-1 1.9-2.5 1.2-3.8-1-1.9-3.7-1.8-4.6 0z"/><path d="M4 14l4 4h8l4-4"/></symbol>',
    '<symbol id="ic-star" viewBox="0 0 24 24"><path d="M12 3l2.6 5.6 6.1.6-4.6 4 1.4 6-5.5-3.2L6 19.8l1.4-6-4.6-4 6.1-.6z"/></symbol>',
    '</svg>'
  ].join('');

  var NAV = [
    { key: 'korean',    href: 'korean.html',          ko: '한국인 기사 모집', en: 'KOREAN DRIVERS' },
    { key: 'foreign',   href: 'foreign.html',         ko: '외국인 기사 모집', en: 'FOREIGN DRIVERS' },
    { key: 'companies', href: 'companies.html',     ko: '택시회사 채용관',  en: 'TAXI COMPANIES' },
    { key: 'support',   href: 'support.html',         ko: '고객센터',        en: 'CUSTOMER CENTER' }
  ];

  var FOOTER_KO = [
    { icon: 'ic-hand',    ko: '신뢰할 수 있는 파트너', en: 'Trusted Partner', d1: '전국 우수 법인택시회사와 함께합니다.', d2: 'We partner with trusted taxi companies nationwide.' },
    { icon: 'ic-shield',  ko: '안전한 취업 지원',     en: 'Safe Placement',  d1: '안전하고 안정적인 취업을 지원합니다.', d2: 'We support safe and stable employment.' },
    { icon: 'ic-lock',    ko: '개인정보 보호',        en: 'Your Privacy',    d1: '개인정보는 안전하게 보호됩니다.',     d2: 'Your privacy is protected.' },
    { icon: 'ic-headset', ko: '무료 상담·무료 지원',  en: 'Free Consultation &amp; Support', d1: '취업에 성공할 때까지 최선을 다해 지원합니다.', d2: 'All services are free from consultation to employment.' }
  ];

  var FOOTER_EN = [
    { icon: 'ic-shield',  ko: 'SAFE &amp; RELIABLE',       d1: 'We work with trusted taxi companies and guarantee safe employment.' },
    { icon: 'ic-lock',    ko: 'PRIVACY PROTECTION',        d1: 'Your personal information is strictly protected and kept confidential.' },
    { icon: 'ic-headset', ko: 'AFTERCARE SUPPORT',         d1: 'We provide continuous support even after you start working.' },
    { icon: 'ic-thumb',   ko: 'YOUR SUCCESS IS OUR GOAL!', d1: 'Your success and stability are our top priority. We’re here for you!' }
  ];

  function icon(id, cls) {
    return '<svg class="' + (cls || 'ico') + '"><use href="#' + id + '"/></svg>';
  }

  function brandHTML() {
    return '<a class="brand" href="index.html">' +
      '  <div class="brand-mark">' + icon('ic-car') + '</div>' +
      '  <div>' +
      '    <div class="brand-ko">전국 택시기사 모집센터</div>' +
      '    <div class="brand-en">TAXI DRIVER RECRUITMENT CENTER</div>' +
      '  </div>' +
      '</a>';
  }

  // 전화번호는 tel: 링크로 감싼다. 모바일에서 탭하면 바로 통화로 이어진다.
  function contactHTML(cls) {
    return '<div class="' + cls + '">' +
      '  <a class="header-tel" href="tel:01048389417">' +
      '    <span class="tel-icon">' + icon('ic-phone') + '</span>' +
      '    <span class="tel-nums"><span>010-4838-9417</span><span>010-4443-9233</span></span>' +
      '  </a>' +
      '  <div class="header-hours">상담시간 09:00 ~ 18:00 (평일)</div>' +
      '  <div class="header-today">당일 상담 가능! <span>전화 주시면 바로 상담해 드립니다.</span></div>' +
      '</div>';
  }

  function headerHTML(active) {
    var nav = NAV.map(function (n) {
      return '<a href="' + n.href + '"' + (n.key === active ? ' class="is-active"' : '') + '>' +
        '<span class="nav-ko">' + n.ko + '</span>' +
        '<span class="nav-en">' + n.en + '</span></a>';
    }).join('');

    // 드로어 상단: 로고(→ index) + 닫기 버튼. 데스크톱에서는 .nav-head 가 숨겨진다.
    var navHead = '<div class="nav-head">' + brandHTML() +
      '  <button class="nav-close" type="button" aria-label="메뉴 닫기">' + icon('ic-close') + '</button>' +
      '</div>';

    return SPRITE +
      '<header class="site-header">' +
      '  <div class="wrap header-inner">' +
      brandHTML() +
      '    <div class="header-actions">' +
      '      <a class="nav-call" href="tel:01048389417" aria-label="전화 상담">' + icon('ic-phone') + '</a>' +
      '      <button class="nav-toggle" type="button" aria-label="메뉴 열기" aria-expanded="false" aria-controls="siteNav">' +
      '        <span class="nav-toggle-bars"><span></span><span></span><span></span></span>' +
      '      </button>' +
      '    </div>' +
      '    <nav class="site-nav" id="siteNav">' + navHead + nav + contactHTML('nav-contact') + '</nav>' +
      contactHTML('header-contact') +
      '  </div>' +
      '  <div class="nav-backdrop" hidden></div>' +
      '</header>';
  }

  // 모바일 햄버거 메뉴: 열림/닫힘, 스크롤 잠금, Esc·백드롭·링크 클릭으로 닫기
  function wireNav(root) {
    var toggle = root.querySelector('.nav-toggle');
    var nav = root.querySelector('.site-nav');
    var backdrop = root.querySelector('.nav-backdrop');
    if (!toggle || !nav || !backdrop) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      backdrop.hidden = !open;
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
      document.body.classList.toggle('nav-open', open);
    }

    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });
    backdrop.addEventListener('click', function () { setOpen(false); });
    var close = nav.querySelector('.nav-close');
    if (close) close.addEventListener('click', function () { setOpen(false); });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) setOpen(false);
    });
    // 데스크톱 폭으로 넓어지면 열린 상태가 남지 않도록 되돌린다.
    window.matchMedia('(min-width: 901px)').addEventListener('change', function (e) {
      if (e.matches) setOpen(false);
    });
  }

  function footerHTML(variant) {
    var cols = (variant === 'en' ? FOOTER_EN : FOOTER_KO).map(function (f) {
      return '<div class="footer-col">' +
        '<span class="footer-icon">' + icon(f.icon) + '</span>' +
        '<div>' +
        '<div class="footer-ko">' + f.ko + '</div>' +
        (f.en ? '<div class="footer-en">' + f.en + '</div>' : '') +
        '<div class="footer-d1">' + f.d1 + '</div>' +
        (f.d2 ? '<div class="footer-d2">' + f.d2 + '</div>' : '') +
        '</div></div>';
    }).join('');

    return '<footer class="site-footer"><div class="wrap footer-inner">' + cols + '</div></footer>';
  }

  // 커스텀 엘리먼트 자체는 레이아웃에 관여하지 않도록 display:contents 로 둔다.
  var style = document.createElement('style');
  style.textContent = 'site-header,site-footer{display:contents}';
  document.head.appendChild(style);

  customElements.define('site-header', class extends HTMLElement {
    connectedCallback() {
      this.innerHTML = headerHTML(this.dataset.active || '');
      wireNav(this);
    }
  });

  customElements.define('site-footer', class extends HTMLElement {
    connectedCallback() {
      this.innerHTML = footerHTML(this.dataset.variant || '');
    }
  });
})();

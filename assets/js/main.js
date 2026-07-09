(function () {
  'use strict';

  // FormSubmit AJAX 엔드포인트. 최초 1회는 수신함으로 온 확인 메일을 눌러 활성화해야 한다.
  // AJAX 제출에서는 reCAPTCHA 를 쓸 수 없으므로 _captcha:false + 허니팟(_honey)으로 막는다.
  var APPLY_ENDPOINT = 'https://formsubmit.co/ajax/phil3410@naver.com';

  // 지원 모달은 4개 페이지가 공유하므로 마크업을 여기서 한 번만 정의해 주입한다.
  // 필요한 아이콘(ic-close, ic-match, ic-headset, ic-form, ic-send, ic-check)은
  // 각 페이지의 SVG 스프라이트에 포함되어 있어야 한다.
  var MODAL_HTML = [
    '<div class="modal-overlay" id="applyModal" hidden>',
    '  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="applyModalTitle">',
    '    <button class="modal-close" type="button" aria-label="close" data-apply-close><svg class="ico"><use href="#ic-close"/></svg></button>',
    '    <div class="modal-hero">',
    '      <div>',
    '        <div class="modal-hero-title" id="applyModalTitle"><span>30초</span> 지원하기!</div>',
    '        <div class="modal-hero-title-en">QUICK APPLY NOW!</div>',
    '        <div class="modal-hero-rule"></div>',
    '        <div class="modal-hero-ko">택시기사로 새로운 시작을 지금 바로!</div>',
    '        <div class="modal-hero-en">Start your taxi driver career in Korea today!</div>',
    '      </div>',
    '      <div class="modal-hero-badge-box">',
    '        <div class="modal-hero-badge">',
    '          <div class="modal-hero-badge-tab"></div>',
    '          <div><div class="modal-hero-badge-n">30</div><div class="modal-hero-badge-sec">SEC</div></div>',
    '        </div>',
    '      </div>',
    '    </div>',
    '    <div class="modal-chips">',
    '      <div class="modal-chip"><div class="modal-chip-icon"><svg class="ico"><use href="#ic-match"/></svg></div><div><div class="modal-chip-ko">한국인 &amp; 외국인 기사 모두 지원 가능!</div><div class="modal-chip-en">Open to Korean &amp; Foreign Drivers!</div></div></div>',
    '      <div class="modal-chip"><div class="modal-chip-icon"><svg class="ico"><use href="#ic-headset"/></svg></div><div><div class="modal-chip-ko">무료 상담 &amp; 빠른 매칭!</div><div class="modal-chip-en">Free Consultation &amp; Fast Matching!</div></div></div>',
    '    </div>',
    '    <div class="modal-body">',
    '      <div class="modal-form-head">',
    '        <div class="modal-form-head-icon"><svg class="ico"><use href="#ic-form"/></svg></div>',
    '        <div><div class="modal-form-ko">택시기사 취업신청</div><div class="modal-form-en">Taxi Driver Job Application</div></div>',
    '      </div>',
    '      <div class="modal-divider"></div>',
    '      <form class="apply-form" id="applyForm" novalidate>',
    '        <input type="text" name="_honey" class="apply-honey" tabindex="-1" autocomplete="off" aria-hidden="true">',
    '        <div class="field-label"><span class="field-n">1</span><span class="field-text">성명 / Name in Full <span class="req">*</span></span></div>',
    '        <input id="applyName" name="name" class="field-input" placeholder="이름을 입력하세요 / Please enter your full name" autocomplete="name">',
    '        <div class="field-label"><span class="field-n">2</span><span class="field-text">휴대폰번호 / Mobile Phone Number <span class="req">*</span></span></div>',
    '        <input id="applyPhone" name="phone" class="field-input field-input-tight" inputmode="tel" placeholder="휴대폰번호를 입력하세요 / Please enter your mobile phone number" autocomplete="tel">',
    '        <div class="field-error-slot"><span class="field-error" id="applyError" role="alert"></span></div>',
    '        <button type="submit" class="apply-submit">',
    '          <span class="apply-submit-left"><span class="apply-submit-icon"><svg class="ico"><use href="#ic-send"/></svg></span><span class="apply-submit-ko">무료 상담신청, Apply</span></span>',
    '          <span class="apply-submit-sep"></span>',
    '          <span class="apply-submit-en">APPLY</span>',
    '        </button>',
    '      </form>',
    '      <div class="apply-done" id="applyDone" hidden>',
    '        <div class="apply-done-row">',
    '          <div class="apply-done-icon"><svg class="ico"><use href="#ic-check"/></svg></div>',
    '          <div><div class="apply-done-ko">지원이 완료되었습니다.</div><div class="apply-done-en">Your job application has been successfully received.</div></div>',
    '        </div>',
    '        <div class="apply-done-divider"></div>',
    '        <div class="apply-done-row">',
    '          <div class="apply-done-icon2"><svg class="ico"><use href="#ic-headset"/></svg></div>',
    '          <div><div class="apply-done-ko2">담당자가 곧 연락 드리겠습니다.</div><div class="apply-done-en2">We will contact you within <span>20 minutes</span>.</div></div>',
    '        </div>',
    '        <button type="button" class="apply-done-close" data-apply-close>확인 / Close</button>',
    '      </div>',
    '    </div>',
    '  </div>',
    '</div>'
  ].join('\n');

  var openers = document.querySelectorAll('[data-apply-open]');
  if (!openers.length) return;

  var host = document.createElement('div');
  host.innerHTML = MODAL_HTML;
  var modal = host.firstElementChild;
  document.body.appendChild(modal);

  var form = modal.querySelector('#applyForm');
  var done = modal.querySelector('#applyDone');
  var nameInput = modal.querySelector('#applyName');
  var phoneInput = modal.querySelector('#applyPhone');
  var errorEl = modal.querySelector('#applyError');
  var honeyInput = form.querySelector('[name="_honey"]');
  var submitBtn = form.querySelector('.apply-submit');
  var submitLabel = form.querySelector('.apply-submit-ko');
  var submitLabelText = submitLabel.textContent;
  var sending = false;

  function showError(msg) {
    errorEl.textContent = msg;
  }

  function reset() {
    form.reset();
    form.hidden = false;
    done.hidden = true;
    showError('');
    setSending(false);
  }

  function setSending(on) {
    sending = on;
    submitBtn.disabled = on;
    submitLabel.textContent = on ? '전송 중… / Sending…' : submitLabelText;
  }

  function send(payload) {
    return fetch(APPLY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        // FormSubmit 은 성공 시 {"success":"true"} 를 준다. 문자열/불리언 모두 대응한다.
        if (!res.ok || String(data.success) !== 'true') {
          throw new Error(data.message || ('HTTP ' + res.status));
        }
        return data;
      });
    });
  }

  function open(e) {
    if (e) e.preventDefault();
    reset();
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    nameInput.focus();
  }

  function close() {
    modal.hidden = true;
    document.body.style.overflow = '';
    reset();
  }

  openers.forEach(function (el) {
    el.addEventListener('click', open);
  });
  modal.querySelectorAll('[data-apply-close]').forEach(function (el) {
    el.addEventListener('click', close);
  });

  modal.addEventListener('click', function (e) {
    if (e.target === modal) close();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) close();
  });

  [nameInput, phoneInput].forEach(function (input) {
    input.addEventListener('input', function () {
      showError('');
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sending) return;

    var name = nameInput.value.trim();
    var phone = phoneInput.value.trim();

    if (!name) {
      showError('성명을 입력해 주세요. / Please enter your name.');
      nameInput.focus();
      return;
    }
    if (phone.replace(/[^0-9]/g, '').length < 9) {
      showError('올바른 휴대폰번호를 입력해 주세요. / Please enter a valid phone number.');
      phoneInput.focus();
      return;
    }
    // 봇이 채운 허니팟. 사람에게는 보이지 않으므로 조용히 성공한 척한다.
    if (honeyInput.value) {
      form.hidden = true;
      done.hidden = false;
      return;
    }

    showError('');
    setSending(true);

    send({
      성명: name,
      휴대폰번호: phone,
      지원경로: document.title,
      _subject: '[택시기사 지원] ' + name + ' / ' + phone,
      _template: 'table',
      _captcha: 'false'
    }).then(function () {
      form.hidden = true;
      done.hidden = false;
    }).catch(function (err) {
      setSending(false);
      showError('전송에 실패했습니다. 잠시 후 다시 시도하시거나 010-4838-9417로 전화 주세요. / Submission failed. Please call us.');
      if (window.console) console.error('[apply] submit failed:', err);
    });
  });
})();

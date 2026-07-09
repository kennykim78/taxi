(function () {
  'use strict';

  // FormSubmit AJAX 엔드포인트. 최초 1회는 수신함으로 온 확인 메일을 눌러 활성화해야 한다.
  // AJAX 제출에서는 reCAPTCHA 를 쓸 수 없으므로 _captcha:false + 허니팟(_honey)으로 막는다.
  // TODO: 테스트용 수신 주소. 운영 전환 시 phil3410@naver.com 으로 되돌린다.
  var APPLY_ENDPOINT = 'https://formsubmit.co/ajax/kenny@rza.co.kr';

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

  // ---------- 입력값 검증 ----------

  // 한글(완성형), 영문, 공백, 가운뎃점/하이픈/마침표만 허용한다.
  // ㄱ~ㅎ, ㅏ~ㅣ 같은 낱자는 오타이므로 막는다.
  var NAME_ALLOWED = /^[가-힣a-zA-Z][가-힣a-zA-Z\s.\-·]*$/;
  var NAME_JAMO = /[ㄱ-ㅎㅏ-ㅣ]/;
  // 국내 휴대폰: 010/011/016/017/018/019 + 7~8자리
  var PHONE_RE = /^01[016789][0-9]{7,8}$/;

  function digits(v) {
    return v.replace(/[^0-9]/g, '');
  }

  // 010-1234-5678 / 011-123-4567 형태로 하이픈을 넣는다.
  function formatPhone(v) {
    var d = digits(v).slice(0, 11);
    if (d.length < 4) return d;
    if (d.length < 8) return d.slice(0, 3) + '-' + d.slice(3);
    if (d.length === 10) return d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6);
    return d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7);
  }

  function validateName(v) {
    if (!v) return '성명을 입력해 주세요. / Please enter your name.';
    if (NAME_JAMO.test(v)) return '성명이 올바르지 않습니다. 한글 낱자를 확인해 주세요. / Please check your name.';
    if (/[0-9]/.test(v)) return '성명에 숫자를 넣을 수 없습니다. / Name cannot contain numbers.';
    if (!NAME_ALLOWED.test(v)) return '성명에 사용할 수 없는 문자가 있습니다. / Name contains invalid characters.';
    if (v.replace(/\s/g, '').length < 2) return '성명을 2자 이상 입력해 주세요. / Name must be at least 2 characters.';
    if (v.length > 30) return '성명은 30자 이내로 입력해 주세요. / Name must be 30 characters or fewer.';
    return '';
  }

  function validatePhone(v) {
    var d = digits(v);
    if (!d) return '휴대폰번호를 입력해 주세요. / Please enter your phone number.';
    if (d.length < 10) return '휴대폰번호가 너무 짧습니다. 10~11자리로 입력해 주세요. / Phone number is too short.';
    if (d.length > 11) return '휴대폰번호가 너무 깁니다. 10~11자리로 입력해 주세요. / Phone number is too long.';
    if (!/^01/.test(d)) return '휴대폰번호는 010 등 01로 시작해야 합니다. / Phone number must start with 01.';
    if (!PHONE_RE.test(d)) return '올바른 휴대폰번호가 아닙니다. / Please enter a valid mobile number.';
    if (/^(\d)\1+$/.test(d.slice(3))) return '휴대폰번호를 다시 확인해 주세요. / Please check your phone number.';
    return '';
  }

  function showError(msg, field) {
    errorEl.textContent = msg;
    [nameInput, phoneInput].forEach(function (el) {
      el.classList.remove('is-invalid');
      el.removeAttribute('aria-invalid');
    });
    if (field) {
      field.classList.add('is-invalid');
      field.setAttribute('aria-invalid', 'true');
      field.focus();
    }
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

  // 사용자에게는 같은 안내를 보이되, 개발자 콘솔에는 실제 원인을 남긴다.
  // FormSubmit 은 Referer 헤더가 없으면 거부하므로 file:// 로 열면 항상 실패한다.
  function explainFailure(err) {
    if (!window.console) return;
    var msg = String(err && err.message || err);
    console.error('[apply] 전송 실패:', msg);
    if (location.protocol === 'file:') {
      console.error('[apply] file:// 로 열면 FormSubmit 이 Referer 를 받지 못해 항상 실패합니다. `npx serve .` 로 띄우세요.');
    } else if (/Activation/i.test(msg)) {
      console.error('[apply] 폼이 아직 활성화되지 않았습니다. phil3410@naver.com 으로 온 "Activate Form" 메일의 링크를 눌러주세요.');
    } else if (/web server/i.test(msg)) {
      console.error('[apply] FormSubmit 이 Referer 를 인식하지 못했습니다. referrerPolicy 설정을 확인하세요.');
    }
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

  nameInput.setAttribute('maxlength', '30');
  phoneInput.setAttribute('maxlength', '13'); // 010-1234-5678

  [nameInput, phoneInput].forEach(function (input) {
    input.addEventListener('input', function () {
      showError('');
    });
  });

  // 커서가 끝에 있을 때만 다시 포맷한다. 중간을 수정하는 중이면 건드리지 않는다.
  phoneInput.addEventListener('input', function () {
    var atEnd = phoneInput.selectionStart === phoneInput.value.length;
    var formatted = formatPhone(phoneInput.value);
    if (atEnd && formatted !== phoneInput.value) {
      phoneInput.value = formatted;
      phoneInput.setSelectionRange(formatted.length, formatted.length);
    }
  });

  // 붙여넣기·자동완성 등으로 들어온 값도 마지막에 정리한다.
  phoneInput.addEventListener('blur', function () {
    if (phoneInput.value) phoneInput.value = formatPhone(phoneInput.value);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sending) return;

    var name = nameInput.value.trim().replace(/\s+/g, ' ');
    var phone = formatPhone(phoneInput.value);

    var nameErr = validateName(name);
    if (nameErr) return showError(nameErr, nameInput);

    var phoneErr = validatePhone(phone);
    if (phoneErr) return showError(phoneErr, phoneInput);

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
      explainFailure(err);
    });
  });
})();

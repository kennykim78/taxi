# 택시기사 모집 랜딩페이지

정적 프론트엔드 랜딩페이지. 백엔드/API 없음, 모든 동작은 브라우저에서만 처리한다.

## 디자인 원본

Claude Design 프로젝트에서 가져온다. 임의로 새로 디자인하지 말고 원본을 그대로 재현할 것.

- projectId: `bbf759b3-849e-4408-bd3e-432fa960daa0`
- files: `택시기사 모집 랜딩.dc.html`, `한국인 기사 모집.dc.html`, `외국인 기사 모집.dc.html`, `고객센터.dc.html`

MCP 서버 `claude_design`(user 스코프, `https://api.anthropic.com/v1/design/mcp`)으로 읽는다.
연결이 끊겼으면 `/mcp`에서 재인증한다.

이미지는 원본 프로젝트의 `.image-slots.state.json`(base64 data URL)에서 추출해 `assets/img/`에 둔다.

## 구조

- `index.html` — 랜딩페이지
- `korean.html` — 한국인 기사 모집
- `foreign.html` — 외국인 기사 모집
- `support.html` — 고객센터
- `companies.html` — 택시회사 채용관 (준비 중 안내 이미지 한 장. 실제 채용관이 생기면 이 파일을 대체한다)
- `assets/css/base.css` — 공통(리셋·아이콘·헤더·푸터·모달), 페이지별 CSS는 `landing/korean/foreign/support.css`
- `assets/js/layout.js` — 아이콘 스프라이트 + `<site-header>` / `<site-footer>` 커스텀 엘리먼트
- `assets/js/main.js` — 지원 모달 마크업 주입 + 폼 검증
- `assets/img/` — 이미지

### 공통 요소를 고칠 때

헤더·푸터·아이콘은 `layout.js`, 지원 모달은 `main.js` 한 곳에만 있다. HTML 쪽엔 복제본이 없으니
`<site-header data-active="korean|foreign|support">` / `<site-footer data-variant="en">` 속성만 쓴다.

`fetch` 기반 인클루드는 `file://`로 직접 열 때 CORS로 막히므로 쓰지 않는다.
`layout.js`는 `<head>`에서 `defer` 없이 불러야 깜빡임이 없고, 스프라이트를 `<site-header>`가
함께 출력하므로 페이지 뒤쪽의 `<use>`도 참조할 수 있다.

## 지원 폼 전송

30초 지원 모달은 FormSubmit AJAX 엔드포인트로 메일을 보낸다.
엔드포인트는 `assets/js/main.js` 상단 `APPLY_ENDPOINT` 한 곳에만 있다.
현재 수신 주소는 운영용 `phil3410@naver.com`.

- **`file://` 로 열면 항상 실패한다.** FormSubmit 은 `Referer` 헤더를 요구하는데 file 스킴은 보내지 않는다.
  ("Make sure you open this page through a web server" 응답) 폼 테스트는 반드시 `npx serve .` 로 띄운다.
- **수신 주소를 바꾸면 최초 1회 활성화가 필요하다.** 한 번 제출하면 확인 메일이 오고 그 링크를 눌러야 한다.
  (미활성 상태의 응답: `{"success":"false","message":"This form needs Activation..."}`)
- AJAX 제출에서는 reCAPTCHA 를 못 쓴다(`_captcha:false`). 대신 허니팟(`_honey`)으로 봇을 거른다.
- 전송 실패 시 성공 화면 대신 오류 문구를 띄우고 버튼을 되살린다. 성공 화면을 무조건 보여주면 안 된다.
  실패 원인은 `explainFailure()` 가 콘솔에 구분해 남긴다(file://, 미활성, Referer 문제).
- FormSubmit 은 대시보드가 없어 **메일이 유실되면 지원자 데이터도 사라진다.** 스팸함 확인이 필요하다.

### 입력 검증

성명은 한글 완성형·영문·공백·`.`·`-`·`·` 만 허용하고 2~30자. 한글 낱자(ㄱ~ㅎ, ㅏ~ㅣ)와 숫자는 오타로 보고 막는다.
휴대폰번호는 `01[016789]` + 7~8자리. 입력 중 하이픈을 자동으로 넣고(`010-1234-5678`), 뒷자리가 모두 같은 숫자면 막는다.

### 아직 남은 일

이름·휴대폰번호는 개인정보다. 실제 운영 전에 **개인정보 수집·이용 동의 체크박스**(수집 항목·목적·보유기간)와
처리방침 링크를 모달에 추가해야 한다. FormSubmit 은 해외 서비스이므로 국외이전 고지도 함께 검토한다.

## 반응형

브레이크포인트는 **900px**(데스크톱 ↔ 모바일)와 **560px**(소형) 두 개다.
900px 이하에서 내비게이션은 우측 햄버거 드로어로 바뀌고, 데스크톱 연락처 블록(`.header-contact`)은
드로어 안의 사본(`.nav-contact`)으로 대체된다. 드로어 동작은 `layout.js`의 `wireNav()`.

`repeat(auto-fit, minmax(Npx, 1fr))`는 N이 뷰포트보다 크면 문서를 가로로 넘치게 한다.
반드시 `minmax(min(100%, Npx), 1fr)` 형태로 쓴다.

### 헤드리스 크롬으로 모바일 확인 시

`--window-size`는 창 최소 폭/DPI 배율에 걸려 실제 CSS 폭과 다르다(390 요청 → 478px).
정확한 폭이 필요하면 원하는 폭의 `<iframe>`에 페이지를 띄워 촬영한다.
또 가상시간에서는 CSS 트랜지션이 진행되지 않으므로, 드로어 열린 상태를 찍으려면
`nav.style.transition='none'`으로 최종 상태를 강제한다.

## 확인 방법

브라우저로 `index.html`을 직접 열거나 `npx serve .` 로 띄워서 확인한다.

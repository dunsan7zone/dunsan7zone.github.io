# 둔산지구7구역 사이트 운영 가이드

## 1) 변경사항이 폰에서 바로 안 보일 때 (핵심)
이 프로젝트는 캐시 무효화를 위해 버전 값을 사용합니다.

버전 파일:
- `js/version.js`

현재 형식:
```js
window.APP_VERSION = '20260304-1';
```

사이트를 수정해서 배포할 때마다 위 값을 올려주세요.
예:
- `20260304-1` -> `20260304-2`
- `20260304-2` -> `20260304-3`

> 버전 값을 올리면 CSS/JS/CSV 요청 URL이 바뀌어서, 모바일 브라우저 캐시가 강하게 남아 있어도 최신 파일을 다시 받게 됩니다.

---

## 2) 배포 순서
1. 코드 수정
2. `js/version.js`의 `window.APP_VERSION` 값 증가
3. Git 커밋/푸시
4. GitHub Pages 반영 대기 (보통 1~2분)
5. 폰에서 새로고침

---

## 3) 왜 이 방식이 필요한가?
모바일 브라우저(특히 iOS Safari)는 정적 파일 캐시를 강하게 유지할 수 있습니다.
단순 새로고침만으로는 이전 CSS/JS/데이터가 보일 수 있어, 파일 URL에 버전을 붙여 강제로 새 요청을 만들고 있습니다.

---

## 4) 현재 버전 적용 위치
버전 값 원본:
- `js/version.js`

이 값을 읽어 캐시 무효화에 사용:
- `index.html` (styles.css, scripts.js)
- `detail.html` (styles.css, notice.csv)
- `js/scripts.js` (notice.csv fetch 시 version 쿼리 추가)

---

## 5) 자주 하는 질문
### Q. 매번 여러 파일을 수정해야 하나요?
아니요. 이제는 `js/version.js` 한 파일만 수정하면 됩니다.

### Q. 그래도 반영이 느릴 수 있나요?
네. GitHub Pages 배포 자체가 1~2분 정도 지연될 수 있습니다.
배포 완료 후에는 버전 갱신 덕분에 모바일에서도 최신 파일이 잘 반영됩니다.

---

## 6) 새 HTML/JS/데이터 파일 추가할 때

### 가장 쉬운 방법 (권장)
- `new-page-template.html`을 복사해서 새 페이지를 만드세요.
- 이 템플릿에는 아래가 이미 포함되어 있습니다.
  - `js/version.js` 선로드
  - `css/styles.css?v=...` 자동 버전 부착
  - `js/scripts.js?v=...` 자동 버전 부착
  - `fetch(..., { cache: 'no-store' })` + 버전 쿼리 예시

### 규칙
1. 새 HTML 파일
	- 반드시 `js/version.js`를 먼저 로드
	- CSS/JS 파일은 `?v=APP_VERSION` 붙여서 로드
2. 새 데이터 fetch (csv/json 등)
	- `appendVersion(url)` 사용
	- `fetch(..., { cache: 'no-store' })` 사용
3. 배포 직전
	- `js/version.js` 버전 1 증가 후 푸시

### 빠른 체크리스트
- [ ] 새 페이지가 `js/version.js`를 읽는가?
- [ ] 새 CSS/JS URL에 버전 쿼리가 붙는가?
- [ ] 새 fetch 요청에 버전 + `no-store`가 있는가?
- [ ] 배포 전 `js/version.js` 값 올렸는가?

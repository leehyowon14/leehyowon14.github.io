# Lee Hyowon — Portfolio

정보의 마찰을 줄이는 백엔드 · AI 개발자 이효원의 포트폴리오 사이트입니다.
에디토리얼 레이아웃과 인터랙티브 요소가 적용된 순수 HTML/CSS/JS 정적 사이트로, 빌드 과정 없이 GitHub Pages에 바로 배포됩니다. 이전 할프톤 디자인은 `/old/`에서 확인할 수 있습니다.

## 로컬에서 보기

```bash
python3 -m http.server 4317
# 현재 버전: http://localhost:4317/
# 이전 버전: http://localhost:4317/old/
```

## 변경 검증

검사 도구는 Node.js 24 이상을 권장합니다. 의존성은 개발용이며, 사이트를 보는 데에는 설치가 필요하지 않습니다.

```bash
npm ci
npm run check
```

- `npm test`: Node 기본 테스트 실행기로 Hero의 픽셀 계산 한도, 비활성 상태, 모션 감소 설정 변경, 메뉴·내부 링크의 키보드 포커스 검증
- `npm run lint`: 현재 사이트 JavaScript와 테스트 코드의 ESLint 검사
- `npm run typecheck`: `main.js`, `hero-texture.js`의 JSDoc 기반 strict 타입 검사 (파일 생성 없음)

자동 테스트는 DOM·Canvas·애니메이션 환경을 모사하므로 실제 렌더링은 브라우저에서 별도로 확인합니다.

1. 데스크톱 1100×800, 모바일 390×844, 낮은 모바일 320×500에서 제목 겹침·가로 넘침·Experience 본문 잘림 확인
2. Tab과 Enter로 메뉴·프로젝트 목록·구현 근거 펼치기 사용, Escape로 메뉴를 닫고 버튼으로 포커스 복귀 확인
3. 내부 링크를 선택한 뒤 도착 섹션으로 포커스 이동 확인
4. OS의 모션 감소 설정을 켜고 끌 때 Hero와 내부 이동 동작 확인
5. 현재 버전 `/`와 보관 버전 `/old/`의 로드 확인 (`/old/`는 lint·타입 검사 대상 제외)

## GitHub Pages 배포 방법

1. GitHub에서 새 저장소를 만듭니다. (예: `portfolio` — 또는 `<username>.github.io`로 만들면 루트 도메인으로 서비스됩니다)
2. 이 프로젝트를 푸시합니다.

   ```bash
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main
   ```

3. 저장소의 **Settings → Pages**로 이동합니다.
4. **Source**를 `Deploy from a branch`로, **Branch**를 `main` / `/ (root)`로 설정하고 저장합니다.
5. 잠시 후 `https://<username>.github.io/<repo>/` 에서 사이트가 열립니다.

모든 경로가 상대 경로라서 저장소 이름이 무엇이든 그대로 동작합니다.

## 구조

```
index.html       # 현재 포트폴리오 마크업
style.css        # 현재 포트폴리오 스타일
main.js          # 현재 포트폴리오 인터랙션
hero-texture.js  # 히어로 canvas 텍스처
tests/          # Hero와 탐색 회귀 테스트 및 브라우저 환경 모사
package.json    # 개발용 검사 명령과 의존성
eslint.config.mjs # 현재 사이트 JavaScript와 테스트 lint 설정
tsconfig.json   # 브라우저 JavaScript strict 타입 검사 설정
old/             # 이전 할프톤 포트폴리오
.nojekyll        # GitHub Pages에서 Jekyll 처리 비활성화
```

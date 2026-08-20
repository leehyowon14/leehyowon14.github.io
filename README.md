# Lee Hyowon — Portfolio

정보의 마찰을 줄이는 백엔드 · AI 개발자 이효원의 포트폴리오 사이트입니다.
에디토리얼 레이아웃과 인터랙티브 요소가 적용된 순수 HTML/CSS/JS 정적 사이트로, 빌드 과정 없이 GitHub Pages에 바로 배포됩니다. 이전 할프톤 디자인은 `/old/`에서 확인할 수 있습니다.

## 로컬에서 보기

```bash
python3 -m http.server 4317
# 현재 버전: http://localhost:4317/
# 이전 버전: http://localhost:4317/old/
```

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
old/             # 이전 할프톤 포트폴리오
.nojekyll        # GitHub Pages에서 Jekyll 처리 비활성화
```

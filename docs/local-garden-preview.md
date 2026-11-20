# 물의 정원 · 로컬 3D 첫 장면

이 미리보기는 첫 정원 접근만 검토합니다. 기존 나만의 힐링스테이 2D 시제품은 루트에 그대로 남습니다. 첨부 JPEG 네 장은 참고 표준으로만 사용하고 웹 번들에 포함하지 않습니다.

## Mac 실행

아래 명령은 프로젝트 루트 기준입니다. [로컬 Astro 실행](local-astro.md)의 프로젝트 내부 Node 24 실행 방법을 사용합니다.

```sh
export ASTRO_TELEMETRY_DISABLED=1
export npm_config_cache="$PWD/output/astro-npm-cache"
npm exec --package=node@24 -- npm run build
npm exec --package=node@24 -- npm run dev
```

http://127.0.0.1:4321/garden/ 에서 확인합니다. 기존 시제품은 / 에 있습니다. 정원 파일 `public/models/garden-entrance-v01.glb`가 정적 출력의 `dist/models/`로 복제됩니다. 이는 로컬 미리보기의 파일 경로일 뿐, 공개되었다는 뜻이 아닙니다. 권리·내용 검토 및 사용자 승인 전에는 전송하거나 배포하지 않습니다. 제작 원본 `.blend`는 Git 제외 `private/blender/`에 둡니다.

기본 상태는 정지입니다. 움직임은 버튼을 눌러 선택하며 중지 가능합니다. 브라우저 탭을 벗어나거나 기기의 움직임 줄이기를 켜면 멈춥니다. WebGL이나 모델을 읽지 못하면 기존 오리지널 벡터 정원 그림으로 대신 보여 드립니다. 시제품에 로그인, 분석·추적, 소리, 필수 인터랙션을 넣지 않았습니다.

## 로컬 검증

```sh
npm exec --package=node@24 -- npm test
npm exec --package=node@24 -- node tests/garden-browser-test.mjs
npm exec --package=node@24 -- node tests/garden-browser-test.mjs --missing-model
```

브라우저 검사는 설치된 Mac Chrome의 별도 테스트 프로필에서 실제 390×844 CSS 픽셀 화면을 엽니다. 파일을 복제하거나 지우지 않고 테스트 서버만 의도적으로 GLB 요청에 404를 돌려줄 수 있습니다. 서버는 루프백에만 열리며 테스트 종료와 함께 닫힙니다. 실물 iPhone Safari 및 이용자 평가는 별도입니다.

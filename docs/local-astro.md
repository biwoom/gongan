# 공간 · 로컬 Astro 실행

기존 독립형 시제품 HTML을 원본 그대로 읽어 정적 첫 페이지를 만듭니다. 별도 디자인 전환, 서버 연동 또는 공개가 아닙니다.

이 Mac에서는 전역 Node의 버전을 바꾸지 않습니다. 프로젝트 루트에서 아래 명령으로 작업합니다. 호환 Node가 이미 있다면 각 명령에서 `npm exec --package=node@24 --`를 생략할 수 있습니다.

```sh
export ASTRO_TELEMETRY_DISABLED=1
export npm_config_cache="$PWD/output/astro-npm-cache"
npm exec --package=node@24 -- npm ci --no-fund --no-audit
npm exec --package=node@24 -- npm run build
npm exec --package=node@24 -- npm test
npm exec --package=node@24 -- npm run dev
```

개발 화면: http://127.0.0.1:4321/ . 빌드 결과는 Git에서 제외되는 `dist/`에 놓입니다. 첨부 참고 원본은 번들에 넣지 않습니다. Blender와 Three.js는 설치하지 않습니다.

필요할 때 Blender 작업 원본은 공개하지 않는 `private/blender/`에, 웹 검토를 위해 내보낸 GLB는 `assets/models/`에 따로 둡니다. 모델이 아직 없으므로 빈 폴더나 시험 모델을 억지로 만들지 않습니다. 모델을 실제로 빌드에 넣기 전 용량·권리·승인과 경로를 확인합니다.

[Astro 공식 설치 안내](https://docs.astro.build/en/install-and-setup/)

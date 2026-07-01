# 새벽 소나무 팬아카이브 Hugo

일반 HTML보다 글 관리가 편한 Hugo 버전입니다. 기록은 `content/archive/*.md`로 추가하고, GitHub Pages는 Actions로 자동 배포합니다.

## GitHub에 올리는 법

`fan-archive-hugo` 폴더 안의 내용물을 GitHub 저장소 루트에 올립니다.

```text
hugo.toml
content/
layouts/
static/
archetypes/
.github/workflows/hugo.yml
.gitignore
```

GitHub 저장소에서 `Settings` -> `Pages` -> `Build and deployment` -> `Source`를 `GitHub Actions`로 선택합니다.

주소는 Actions가 자동으로 맞춥니다. 저장소명 때문에 `baseURL`을 직접 수정할 필요가 없게 해뒀습니다.

## 새 기록 추가

작성실에서 `MD 저장`을 누르면 Hugo front matter가 포함된 Markdown 파일이 만들어집니다. 그 파일을 아래 폴더에 넣으면 됩니다.

```text
content/archive/
```

직접 새 글을 만들 때는 이런 형태로 저장하세요.

```md
+++
title = "새 기록 제목"
date = "2026-07-02T00:00:00+09:00"
draft = false
tags = ["무대", "감상"]
categories = ["팬아카이브"]
+++

## 기록

내용을 적습니다.
```

## 로컬 실행

Hugo가 설치된 터미널에서:

```powershell
hugo server --open
```

빌드는:

```powershell
hugo --gc --minify
```

결과물은 `public/` 폴더에 생성됩니다.

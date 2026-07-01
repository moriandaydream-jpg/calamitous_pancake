(function () {
  const $ = (selector) => document.querySelector(selector);

  const quickNote = $("#quick-note");
  if (quickNote) {
    quickNote.value = localStorage.getItem("fanArchiveHugoQuickNote") || "";
    quickNote.addEventListener("input", () => {
      localStorage.setItem("fanArchiveHugoQuickNote", quickNote.value);
    });
  }

  const editor = {
    title: $("#note-title"),
    date: $("#note-date"),
    file: $("#note-file"),
    tags: $("#note-tags"),
    body: $("#note-body"),
    rendered: $("#rendered-note"),
    markdown: $("#markdown-output"),
    status: $("#editor-status")
  };

  if (!editor.title) {
    return;
  }

  const draftKey = "fanArchiveHugoDraft";
  const today = new Date().toISOString().slice(0, 10);
  const savedDraft = JSON.parse(localStorage.getItem(draftKey) || "null");

  if (savedDraft) {
    editor.title.value = savedDraft.title || editor.title.value;
    editor.date.value = savedDraft.date || today;
    editor.file.value = savedDraft.file || editor.file.value;
    editor.tags.value = savedDraft.tags || editor.tags.value;
    editor.body.value = savedDraft.body || editor.body.value;
  } else {
    editor.date.value = today;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeToml(value) {
    return String(value).replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
  }

  function safeFileName(value) {
    const cleaned = value.trim()
      .toLowerCase()
      .replace(/[\s_]+/g, "-")
      .replace(/[^a-z0-9가-힣.-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    return cleaned.endsWith(".md") ? cleaned : `${cleaned || "archive-note"}.md`;
  }

  function values() {
    return {
      title: editor.title.value.trim() || "Untitled",
      date: editor.date.value || today,
      file: safeFileName(editor.file.value),
      tags: editor.tags.value.trim() || "fan archive",
      body: editor.body.value.trim()
    };
  }

  function tagArray(tags) {
    return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  }

  function buildMarkdown() {
    const note = values();
    return `# ${note.title}

> ${note.date} · ${note.tags}

## 기록

${note.body}

## 출처

- 링크:
- 이미지:
- 메모:
`;
  }

  function buildHugoMarkdown() {
    const note = values();
    const tags = tagArray(note.tags).map((tag) => `"${escapeToml(tag)}"`).join(", ");
    return `++++
title = "${escapeToml(note.title)}"
date = "${note.date}T00:00:00+09:00"
draft = false
tags = [${tags}]
categories = ["팬아카이브"]
+++

## 기록

${note.body}

## 출처

- 링크:
- 이미지:
- 메모:
`;
  }

  function renderBody(markdown) {
    const lines = markdown.split(/\r?\n/);
    let html = "";
    let inList = false;

    function closeList() {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
    }

    lines.forEach((line) => {
      if (/^-\s+/.test(line)) {
        if (!inList) {
          html += "<ul>";
          inList = true;
        }
        html += `<li>${escapeHtml(line.replace(/^-\s+/, ""))}</li>`;
        return;
      }

      closeList();

      if (/^##\s+/.test(line)) {
        html += `<h3>${escapeHtml(line.replace(/^##\s+/, ""))}</h3>`;
      } else if (/^>\s+/.test(line)) {
        html += `<blockquote>${escapeHtml(line.replace(/^>\s+/, ""))}</blockquote>`;
      } else if (line.trim()) {
        html += `<p>${escapeHtml(line)}</p>`;
      }
    });

    closeList();
    return html;
  }

  function setStatus(text) {
    editor.status.textContent = text;
  }

  function update() {
    editor.file.value = safeFileName(editor.file.value);
    const note = values();
    const markdown = buildHugoMarkdown();
    const tags = tagArray(note.tags)
      .map((tag) => `<span>${escapeHtml(tag)}</span>`)
      .join("");

    editor.markdown.textContent = markdown;
    editor.rendered.innerHTML = `
      <p class="card-date">${escapeHtml(note.date)}</p>
      <h2>${escapeHtml(note.title)}</h2>
      <blockquote>${escapeHtml(note.tags)}</blockquote>
      ${renderBody(note.body)}
      <div class="tags">${tags}</div>
    `;

    localStorage.setItem(draftKey, JSON.stringify(note));
  }

  function downloadFile(filename, content) {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function copyText(text, doneMessage) {
    navigator.clipboard.writeText(text)
      .then(() => setStatus(doneMessage))
      .catch(() => setStatus("복사 권한이 막혀 있습니다. 내용을 직접 선택해서 복사해주세요."));
  }

  [editor.title, editor.date, editor.file, editor.tags, editor.body].forEach((field) => {
    field.addEventListener("input", update);
    field.addEventListener("change", update);
  });

  $("#download-md").addEventListener("click", () => {
    const note = values();
    downloadFile(note.file, buildHugoMarkdown());
    setStatus("Hugo용 Markdown 파일을 저장했습니다. content/archive/ 폴더에 넣어주세요.");
  });

  $("#copy-md").addEventListener("click", () => {
    copyText(buildMarkdown(), "일반 Markdown 본문을 복사했습니다.");
  });

  $("#copy-hugo").addEventListener("click", () => {
    copyText(buildHugoMarkdown(), "Hugo 글 전체를 복사했습니다.");
  });

  $("#clear-draft").addEventListener("click", () => {
    localStorage.removeItem(draftKey);
    editor.title.value = "오늘의 기록";
    editor.date.value = today;
    editor.file.value = "today-note.md";
    editor.tags.value = "새벽, 별, 소나무";
    editor.body.value = "오늘 남기고 싶은 순간을 적어보세요.\n\n- 장면:\n- 말:\n- 감정:\n- 다시 보고 싶은 이유:";
    update();
    setStatus("초안을 비웠습니다.");
  });

  update();
})();

(function () {
  const MANUAL_PATHS = {
    es: "../reference/user/manual.md",
    en: "../reference/user/manual.en.md",
    ca: "../reference/user/manual.ca.md"
  };

  const TEXT = {
    es: { title: "Ayuda", kicker: "EdEX", loading: "Cargando ayuda...", error: "No se pudo cargar la ayuda." },
    en: { title: "Help", kicker: "EdEX", loading: "Loading help...", error: "Could not load help." },
    ca: { title: "Ajuda", kicker: "EdEX", loading: "Carregant ajuda...", error: "No s'ha pogut carregar l'ajuda." }
  };

  const TAB_CONFIG = {
    es: [
      { label: "Inicio",     icon: "home" },
      { label: "Editar",     icon: "edit" },
      { label: "Exportar",   icon: "download" },
      { label: "Referencia", icon: "menu_book" }
    ],
    en: [
      { label: "Start",     icon: "home" },
      { label: "Edit",      icon: "edit" },
      { label: "Export",    icon: "download" },
      { label: "Reference", icon: "menu_book" }
    ],
    ca: [
      { label: "Inici",      icon: "home" },
      { label: "Editar",     icon: "edit" },
      { label: "Exportar",   icon: "download" },
      { label: "Referència", icon: "menu_book" }
    ]
  };

  // Which H2 section indices (0-based) belong to each tab
  const TAB_SECTIONS = [
    [0, 1, 2],       // Inicio:    Para qué sirve · Flujo · Modos de trabajo
    [3, 4, 5, 6],    // Editar:    Ajustes · Barra preview · Edición clic · Archivos
    [8, 9, 10],      // Exportar:  Exportar · Información · Favicon
    [7, 11, 12, 13]  // Referencia: Legacy · Cuándo usar · Limitaciones · Recomendaciones
  ];

  const SECTION_ICONS = [
    "info",           // 0  Para qué sirve
    "route",          // 1  Flujo recomendado
    "folder_open",    // 2  Modos de trabajo
    "tune",           // 3  Pestaña Ajustes
    "preview",        // 4  Barra de previsualización
    "ads_click",      // 5  Edición por clic
    "folder",         // 6  Pestaña Archivos
    "history",        // 7  Importación legacy
    "download",       // 8  Exportar ZIP o ELPX
    "badge",          // 9  Información y exportación
    "web",            // 10 Favicon
    "help_outline",   // 11 Cuándo usar
    "warning_amber",  // 12 Limitaciones
    "lightbulb"       // 13 Recomendaciones
  ];

  function normalizeLang(lang) {
    const clean = String(lang || "").trim().toLowerCase().split("-")[0];
    return MANUAL_PATHS[clean] ? clean : "es";
  }

  function getLang() {
    try {
      const params = new URLSearchParams(window.location.search || "");
      return normalizeLang(params.get("lang") || "");
    } catch {
      return "es";
    }
  }

  function escapeHtml(text) {
    return String(text || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function renderInline(text) {
    let html = escapeHtml(text);
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return html;
  }

  function flushParagraph(paragraph, out) {
    if (!paragraph.length) return;
    out.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
    paragraph.length = 0;
  }

  function flushList(list, out) {
    if (!list.items.length) return;
    const tag = list.type === "ol" ? "ol" : "ul";
    out.push(`<${tag}>${list.items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</${tag}>`);
    list.type = "";
    list.items = [];
  }

  function renderMarkdown(md) {
    const out = [];
    const paragraph = [];
    const list = { type: "", items: [] };
    const lines = String(md || "").replace(/\r/g, "").split("\n");

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      const trimmed = line.trim();

      if (!trimmed) {
        flushParagraph(paragraph, out);
        flushList(list, out);
        continue;
      }

      const heading = trimmed.match(/^(#{1,3})\s+(.*)$/);
      if (heading) {
        flushParagraph(paragraph, out);
        flushList(list, out);
        const level = heading[1].length;
        out.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
        continue;
      }

      const ordered = trimmed.match(/^\d+\.\s+(.*)$/);
      if (ordered) {
        flushParagraph(paragraph, out);
        if (list.type && list.type !== "ol") flushList(list, out);
        list.type = "ol";
        list.items.push(ordered[1]);
        continue;
      }

      const bullet = trimmed.match(/^-\s+(.*)$/);
      if (bullet) {
        flushParagraph(paragraph, out);
        if (list.type && list.type !== "ul") flushList(list, out);
        list.type = "ul";
        list.items.push(bullet[1]);
        continue;
      }

      flushList(list, out);
      paragraph.push(trimmed);
    }

    flushParagraph(paragraph, out);
    flushList(list, out);
    return out.join("\n");
  }

  function buildTabs(html, lang) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<body>${html}</body>`, "text/html");
    const body = doc.body;

    // Split content into sections by H2
    const sections = [];
    let current = null;

    for (const node of Array.from(body.childNodes)) {
      if (node.nodeType === 1 && node.tagName === "H2") {
        current = { headingNode: node, contentNodes: [] };
        sections.push(current);
      } else if (current) {
        current.contentNodes.push(node);
      }
      // Nodes before first H2 (H1, etc.) are skipped — already shown in help-header
    }

    // Add icon to each H2 heading
    sections.forEach((section, i) => {
      const icon = SECTION_ICONS[i] || "circle";
      const iconSpan = doc.createElement("span");
      iconSpan.className = "ms";
      iconSpan.setAttribute("aria-hidden", "true");
      iconSpan.textContent = icon;
      section.headingNode.insertBefore(doc.createTextNode(" "), section.headingNode.firstChild);
      section.headingNode.insertBefore(iconSpan, section.headingNode.firstChild);
    });

    // Serialize each section to HTML
    sections.forEach(section => {
      let sHtml = section.headingNode.outerHTML;
      section.contentNodes.forEach(n => {
        sHtml += n.nodeType === 1 ? n.outerHTML : (n.textContent || "");
      });
      section.html = sHtml;
    });

    const tabs = TAB_CONFIG[lang] || TAB_CONFIG.es;
    let out = "";

    // Tab bar
    out += '<nav class="help-tabs" role="tablist">';
    tabs.forEach((tab, i) => {
      out += `<button class="help-tab${i === 0 ? " help-tab-active" : ""}" role="tab" type="button" aria-selected="${i === 0}" data-tab="${i}">`;
      out += `<span class="ms" aria-hidden="true">${tab.icon}</span><span>${tab.label}</span>`;
      out += "</button>";
    });
    out += "</nav>";

    // Tab panels
    tabs.forEach((tab, i) => {
      out += `<div class="help-panel" role="tabpanel" data-panel="${i}"${i > 0 ? " hidden" : ""}>`;
      TAB_SECTIONS[i].forEach(sectionIdx => {
        if (sections[sectionIdx]) out += sections[sectionIdx].html;
      });
      out += "</div>";
    });

    return out;
  }

  function attachTabHandlers(contentEl) {
    contentEl.querySelectorAll(".help-tab").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = btn.dataset.tab;
        contentEl.querySelectorAll(".help-tab").forEach(b => {
          b.classList.toggle("help-tab-active", b === btn);
          b.setAttribute("aria-selected", b === btn ? "true" : "false");
        });
        contentEl.querySelectorAll(".help-panel").forEach(p => {
          p.hidden = p.dataset.panel !== idx;
        });
      });
    });
  }

  async function boot() {
    const lang = getLang();
    const text = TEXT[lang] || TEXT.es;
    const titleEl = document.getElementById("helpTitle");
    const kickerEl = document.getElementById("helpKicker");
    const contentEl = document.getElementById("helpContent");
    document.documentElement.lang = lang;
    document.title = `${text.title} · EdEX`;
    if (titleEl) titleEl.textContent = text.title;
    if (kickerEl) kickerEl.textContent = text.kicker;
    if (contentEl) contentEl.innerHTML = `<p class="help-status">${text.loading}</p>`;

    try {
      const response = await fetch(MANUAL_PATHS[lang], { cache: "no-store" });
      if (!response.ok) throw new Error(String(response.status));
      const markdown = await response.text();
      if (!contentEl) return;
      contentEl.innerHTML = buildTabs(renderMarkdown(markdown), lang);
      attachTabHandlers(contentEl);
      const firstHeading = contentEl.querySelector("h1, h2");
      if (firstHeading instanceof HTMLElement) {
        document.title = `${text.title} · EdEX`;
      }
    } catch (error) {
      if (!contentEl) return;
      contentEl.innerHTML = `<p class="help-error">${text.error}</p>`;
      console.error(error);
    }
  }

  boot();
})();

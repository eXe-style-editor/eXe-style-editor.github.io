const RUNTIME_ROOT = new URL("./", import.meta.url);
const EDEX_CURRENT_THEME = "__edex_current_theme__";
const SCRIPT_LOADS = new Map();
const TEXT_DECODER = new TextDecoder();

const IDEVICE_ALIASES = new Map([
  ["freetextidevice", "text"],
  ["freetext", "text"],
  ["textidevice", "text"],
  ["text", "text"],
  ["jsidevice", "text"],
  ["js", "text"],
  ["multichoiceidevice", "multichoice"],
  ["multiselectidevice", "multiselect"],
  ["truefalseidevice", "truefalse"],
  ["casestudyidevice", "casestudy"],
  ["clozeidevice", "cloze"],
  ["galleryidevice", "image-gallery"],
  ["galleryimages", "image-gallery"],
  ["fileattachidevice", "fileattach"],
  ["externalurlidevice", "externalurl"],
  ["scormquizidevice", "scormquiz"],
  ["scormtestidevice", "scormquiz"],
  ["adivina", "guess"],
  ["adivinaactivity", "guess"],
  ["listacotejo", "checklist"],
  ["listacotejoactivity", "checklist"],
  ["ordena", "sort"],
  ["clasifica", "classify"],
  ["relaciona", "relate"],
  ["completa", "complete"],
  ["rubrics", "rubric"],
  ["downloadpackage", "download-source-file"],
  ["pbltools", "udl-content"],
  ["selecciona", "quick-questions-multiple-choice"],
  ["seleccionaactivity", "quick-questions-multiple-choice"],
  ["quiz", "quick-questions"],
  ["quizactivity", "quick-questions"],
  ["quizgame", "az-quiz-game"],
  ["trivialquiz", "trivial"],
  ["beforeafter", "beforeafter"],
  ["imagemagnifier", "magnifier"],
  ["wordpuzzle", "word-search"],
  ["palabraspuzzle", "word-search"],
  ["sopadeletras", "word-search"],
  ["casestudy", "casestudy"],
  ["estudiodecaso", "casestudy"],
  ["ejemplo", "example"],
  ["modelo", "example"],
  ["reto", "challenge"],
  ["desafio", "challenge"],
  ["sitioexterno", "external-website"],
  ["webexterna", "external-website"],
  ["formulario", "form"],
  ["tarjetas", "flipcards"],
  ["flashcards", "flipcards"],
  ["galeria", "image-gallery"],
  ["galeriaimagenes", "image-gallery"],
  ["crucigrama", "crossword"],
  ["rompecabezas", "puzzle"]
]);

function runtimeUrl(path) {
  return new URL(path, RUNTIME_ROOT).href;
}

function loadScript(path) {
  const url = runtimeUrl(path);
  if (SCRIPT_LOADS.has(url)) return SCRIPT_LOADS.get(url);
  const promise = new Promise((resolve, reject) => {
    const existing = Array.from(document.scripts).find((script) => script.src === url);
    if (existing) {
      if (existing.dataset.loaded === "true") resolve();
      else if (!existing.hasAttribute("data-loaded")) {
        // Script loaded via static <script> tag — already executed, no event will fire
        resolve();
      } else {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error(`No se pudo cargar ${url}`)), { once: true });
      }
      return;
    }
    const script = document.createElement("script");
    script.src = url;
    script.async = false;
    script.dataset.loaded = "false";
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    }, { once: true });
    script.addEventListener("error", () => reject(new Error(`No se pudo cargar ${url}`)), { once: true });
    document.head.appendChild(script);
  });
  SCRIPT_LOADS.set(url, promise);
  return promise;
}

function ensureGlobal(name, label = name) {
  const value = window[name];
  if (!value) throw new Error(`Runtime eXeLearning no disponible: falta window.${label}`);
  return value;
}

function normalizeIdeviceType(type) {
  const raw = String(type || "text").trim();
  const key = raw.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (IDEVICE_ALIASES.has(key)) return IDEVICE_ALIASES.get(key);
  return raw.toLowerCase().replace(/-?idevice$/i, "") || "text";
}

function bytesToArrayBuffer(bytes) {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

function mimeFromPath(path) {
  const ext = String(path || "").split("?")[0].split("#")[0].split(".").pop()?.toLowerCase() || "";
  const types = {
    css: "text/css",
    js: "text/javascript",
    html: "text/html",
    htm: "text/html",
    xml: "application/xml",
    json: "application/json",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    ico: "image/x-icon",
    webp: "image/webp",
    mp3: "audio/mpeg",
    mp4: "video/mp4",
    webm: "video/webm",
    pdf: "application/pdf",
    woff: "font/woff",
    woff2: "font/woff2",
    ttf: "font/ttf",
    otf: "font/otf"
  };
  return types[ext] || "application/octet-stream";
}

function blobFromBytes(bytes, path) {
  return new Blob([bytesToArrayBuffer(bytes)], { type: mimeFromPath(path) });
}

function assetUrlFor(assetId, filename = "") {
  const ext = String(filename || "").split(".").pop();
  return ext && ext !== filename ? `asset://${assetId}.${ext}` : `asset://${assetId}`;
}

async function sha256Hex(blob) {
  if (crypto?.subtle) {
    const hash = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
    return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

function hashToUuid(hash) {
  const clean = String(hash || "").replace(/[^a-f0-9]/gi, "").padEnd(32, "0").slice(0, 32);
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20, 32)}`;
}

function isSystemZipPath(path) {
  return path.endsWith("/") ||
    path.startsWith("__MACOSX") ||
    path.endsWith(".xml") ||
    path.endsWith(".xsd") ||
    path.endsWith(".data") ||
    path.startsWith("idevices/") ||
    path.startsWith("libs/") ||
    path.startsWith("theme/") ||
    path.startsWith("content/css/") ||
    path.startsWith("content/img/") ||
    path.startsWith("html/") ||
    path === "index.html" ||
    path === "base.css" ||
    path === "common_i18n.js" ||
    path === "common.js";
}

function shouldImportAsset(path, isLegacyFormat) {
  if (isSystemZipPath(path)) return false;
  if (isLegacyFormat) return !path.includes("/");
  if (path.startsWith("resources/") || path.startsWith("content/resources/") || path.includes("/resources/")) return true;
  if (path.startsWith("custom/") && !path.split("/").pop()?.startsWith(".")) return true;
  const firstFolder = path.split("/")[0] || "";
  return /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(firstFolder) ||
    /^(idevice|block|page)-[a-z0-9]+-[a-z0-9]+$/i.test(firstFolder);
}

function extractFolderPathFromImport(path, assetId) {
  const parts = String(path || "").split("/");
  parts.pop();
  let folder = parts.join("/");
  folder = folder.replace(/^content\/resources\/?/, "").replace(/^resources\/?/, "");
  if (folder === assetId) return "";
  if (folder.startsWith(`${assetId}/`)) return folder.slice(assetId.length + 1);
  return folder;
}

function findAssetUrl(assetPath, assetMap) {
  const cleanPath = String(assetPath || "").replace(/[\\\s]+$/, "").trim();
  if (!cleanPath) return null;
  if (assetMap.has(cleanPath)) return assetUrlFor(assetMap.get(cleanPath), cleanPath.split("/").pop());
  for (const prefix of ["", "content/", "content/resources/", "resources/"]) {
    const fullPath = `${prefix}${cleanPath}`;
    if (assetMap.has(fullPath)) return assetUrlFor(assetMap.get(fullPath), cleanPath.split("/").pop());
  }
  const filename = cleanPath.split("/").pop();
  for (const [path, assetId] of assetMap.entries()) {
    if (path.endsWith(`/${filename}`) || path === filename) return assetUrlFor(assetId, filename);
  }
  const customPath = `custom/${filename}`;
  if (assetMap.has(customPath)) return assetUrlFor(assetMap.get(customPath), filename);
  return null;
}

class LocalDocumentManager {
  constructor(projectId = `edex-${Date.now().toString(36)}`) {
    this.projectId = projectId;
    this.reset();
  }

  reset() {
    const Y = ensureGlobal("Y");
    this.ydoc = new Y.Doc();
  }

  getDoc() {
    return this.ydoc;
  }

  getMetadata() {
    return this.ydoc.getMap("metadata");
  }

  getNavigation() {
    return this.ydoc.getArray("navigation");
  }
}

class LocalAssetManager {
  constructor(projectId) {
    this.projectId = projectId;
    this.assets = new Map();
    this.metadata = new Map();
  }

  async init() {}

  clear() {
    this.assets.clear();
    this.metadata.clear();
  }

  async storeBlob(assetId, blob) {
    this.assets.set(assetId, blob);
    return assetId;
  }

  setAssetMetadata(assetId, metadata) {
    this.metadata.set(assetId, { id: assetId, ...metadata });
  }

  getAssetUrl(assetId, filename = "") {
    return assetUrlFor(assetId, filename);
  }

  async calculateHash(blob) {
    return sha256Hex(blob);
  }

  hashToUUID(hash) {
    return hashToUuid(hash);
  }

  async getAsset(assetId) {
    const blob = this.assets.get(assetId);
    const metadata = this.metadata.get(assetId) || {};
    return blob ? { id: assetId, blob, mime: metadata.mime || blob.type || "application/octet-stream", ...metadata } : null;
  }

  async getAssetByHash(hash) {
    for (const [id, metadata] of this.metadata.entries()) {
      if (metadata.hash === hash) return this.getAsset(id);
    }
    return null;
  }

  async getBlob(assetId) {
    return this.assets.get(assetId) || null;
  }

  async getBlobForExport(assetId) {
    return this.getBlob(assetId);
  }

  getAssetMetadata(assetId) {
    return this.metadata.get(assetId) || null;
  }

  getAllAssetsMetadata() {
    return Array.from(this.metadata.values());
  }

  async getProjectAssets() {
    const result = [];
    for (const [id, blob] of this.assets.entries()) {
      const metadata = this.metadata.get(id) || {};
      result.push({ id, blob, mime: metadata.mime || blob.type || "application/octet-stream", ...metadata });
    }
    return result;
  }

  async extractAssetsFromZip(zip, onAssetProgress = null) {
    const isLegacyFormat = Object.keys(zip).some((path) => path === "contentv3.xml" || path.endsWith("/contentv3.xml"));
    const files = Object.entries(zip).filter(([path]) => shouldImportAsset(path, isLegacyFormat));
    const assetMap = new Map();
    let index = 0;
    for (const [path, fileData] of files) {
      index += 1;
      if (onAssetProgress) onAssetProgress(index, files.length, path.split("/").pop());
      const blob = blobFromBytes(fileData, path);
      const hash = await this.calculateHash(blob);
      const id = this.hashToUUID(hash);
      const filename = path.split("/").pop() || id;
      const folderPath = extractFolderPathFromImport(path, id);
      await this.storeBlob(id, blob);
      this.setAssetMetadata(id, {
        filename,
        originalPath: path,
        folderPath,
        mime: blob.type || mimeFromPath(path),
        size: blob.size,
        hash,
        projectId: this.projectId
      });
      assetMap.set(path, id);
      if (path.startsWith("custom/") && path.includes(" ")) assetMap.set(path.replace(/ /g, "_"), id);
    }
    return assetMap;
  }

  convertContextPathToAssetRefs(html, assetMap) {
    if (!html) return html;
    let converted = String(html);
    converted = converted.replace(/\{\{context_path\}\}\/([^"'<>]+)/g, (fullMatch, assetPath) => {
      return findAssetUrl(assetPath, assetMap) || fullMatch;
    });
    converted = converted.replace(/(src|href)=(["'])resources\/([^"']+)\2/gi, (fullMatch, attr, quote, assetPath) => {
      const url = findAssetUrl(`resources/${assetPath}`, assetMap) || findAssetUrl(assetPath, assetMap);
      return url ? `${attr}=${quote}${url}${quote}` : fullMatch;
    });
    return converted;
  }

  async preloadAllAssets() {
    return this.assets.size;
  }

  async resolveAssetURL(assetUrl) {
    const id = String(assetUrl || "").replace(/^asset:\/\//, "").split(/[/.]/)[0];
    const blob = this.assets.get(id);
    return blob ? URL.createObjectURL(blob) : null;
  }
}

class LocalResourceFetcher {
  constructor() {
    this.zipCache = new Map();
    this.themeFiles = null;
  }

  setThemeFiles(themeFiles) {
    if (!themeFiles) {
      this.themeFiles = null;
      return;
    }
    const next = new Map();
    for (const [path, value] of themeFiles.entries()) {
      if (!path) continue;
      if (value instanceof Blob) next.set(path, value);
      else if (value instanceof Uint8Array) next.set(path, blobFromBytes(value, path));
      else if (value instanceof ArrayBuffer) next.set(path, blobFromBytes(new Uint8Array(value), path));
      else if (typeof value === "string") next.set(path, new Blob([value], { type: mimeFromPath(path) }));
    }
    this.themeFiles = next;
  }

  async loadZip(path) {
    await loadScript("../../vendor/jszip.min.js");
    const JSZip = ensureGlobal("JSZip");
    const url = runtimeUrl(path);
    if (!this.zipCache.has(url)) {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`No se pudo cargar ${path} (${response.status})`);
      this.zipCache.set(url, await JSZip.loadAsync(await response.arrayBuffer()));
    }
    return this.zipCache.get(url);
  }

  async zipEntries(path, { filter = () => true, mapPath = (entryPath) => entryPath } = {}) {
    const zip = await this.loadZip(path);
    const result = new Map();
    const jobs = [];
    zip.forEach((entryPath, entry) => {
      if (entry.dir || !filter(entryPath)) return;
      jobs.push(entry.async("uint8array").then((bytes) => {
        const outputPath = mapPath(entryPath);
        result.set(outputPath, blobFromBytes(bytes, outputPath));
      }));
    });
    await Promise.all(jobs);
    return result;
  }

  async zipDirectory(path, directoryName) {
    const cleanName = String(directoryName || "").replace(/^\/+|\/+$/g, "");
    if (!cleanName) return new Map();
    const prefix = `${cleanName}/`;
    return this.zipEntries(path, {
      filter: (entryPath) => entryPath.startsWith(prefix),
      mapPath: (entryPath) => entryPath.slice(prefix.length)
    });
  }

  async mergeZipFiles(path, filePaths) {
    const wanted = new Set(filePaths);
    if (!wanted.size) return new Map();
    return this.zipEntries(path, {
      filter: (entryPath) => wanted.has(entryPath)
    });
  }

  async fetchFileMap(paths) {
    const result = new Map();
    await Promise.all(paths.map(async ([path, outputPath = path]) => {
      const response = await fetch(runtimeUrl(path));
      if (response.ok) result.set(outputPath, await response.blob());
    }));
    return result;
  }

  async fetchTheme(themeName) {
    if (themeName === EDEX_CURRENT_THEME && this.themeFiles) {
      return new Map(this.themeFiles);
    }
    return this.zipEntries(`resources/bundles/themes/${encodeURIComponent(themeName || "base")}.zip`);
  }

  async fetchIdevice(ideviceType) {
    const normalized = normalizeIdeviceType(ideviceType);
    return this.zipDirectory("resources/bundles/idevices.zip", normalized);
  }

  async fetchBaseLibraries() {
    return this.zipEntries("resources/bundles/libs.zip");
  }

  async fetchScormFiles() {
    return this.fetchFileMap([
      ["resources/common/scorm/SCORM_API_wrapper.js", "SCORM_API_wrapper.js"],
      ["resources/common/scorm/SCOFunctions.js", "SCOFunctions.js"]
    ]);
  }

  async fetchLibraryFiles(paths = []) {
    const cleanPaths = Array.from(new Set(paths.map((path) => String(path || "").replace(/^libs\//, "")).filter(Boolean)));
    const result = await this.mergeZipFiles("resources/bundles/libs.zip", cleanPaths);
    const missing = cleanPaths.filter((path) => !result.has(path));
    if (missing.length) {
      const commonFiles = await this.mergeZipFiles("resources/bundles/common.zip", missing);
      for (const [path, blob] of commonFiles) result.set(path, blob);
    }
    return result;
  }

  async fetchLibraryDirectory(libraryName) {
    const cleanName = String(libraryName || "").replace(/^libs\//, "").replace(/^\/+|\/+$/g, "");
    if (!cleanName) return new Map();
    const fromCommon = await this.zipDirectory("resources/bundles/common.zip", cleanName);
    if (fromCommon.size) {
      const result = new Map();
      for (const [path, blob] of fromCommon) result.set(`${cleanName}/${path}`, blob);
      return result;
    }
    return this.zipDirectory("resources/bundles/libs.zip", cleanName);
  }

  async fetchExeLogo() {
    const files = await this.mergeZipFiles("resources/bundles/common.zip", ["exe_powered_logo/exe_powered_logo.png"]);
    return files.get("exe_powered_logo/exe_powered_logo.png") || null;
  }

  async fetchContentCss() {
    return this.zipEntries("resources/bundles/content-css.zip");
  }

  async fetchGlobalFontFiles() {
    return new Map();
  }

  async fetchI18nFile() {
    return null;
  }

  async fetchI18nTranslations() {
    return {};
  }
}

/*
 * The code below is intentionally absent: ResourceFetcher must not inflate the
 * full common/iDevice bundles for each preview. Large ZIPs are opened once and
 * only matching entries are materialized as Blob objects.
 */

export class EdexExeRuntime {
  constructor() {
    this.initialized = false;
    this.documentManager = null;
    this.assetManager = null;
    this.resourceFetcher = new LocalResourceFetcher();
    this.lastImportResult = null;
  }

  async init() {
    if (this.initialized) return this;
    await loadScript("vendor/yjs/yjs.min.js");
    await loadScript("bundles/importers.bundle.js");
    await loadScript("bundles/exporters.bundle.js");
    ensureGlobal("Y");
    ensureGlobal("SharedImporters");
    ensureGlobal("SharedExporters");
    this.documentManager = new LocalDocumentManager();
    this.assetManager = new LocalAssetManager(this.documentManager.projectId);
    this.initialized = true;
    return this;
  }

  assertReady() {
    if (!this.initialized || !this.documentManager || !this.assetManager) {
      throw new Error("Runtime eXeLearning no inicializado. Llama primero a init().");
    }
  }

  resetDocument() {
    this.assertReady();
    this.documentManager.reset();
    this.assetManager.clear();
    this.resourceFetcher.setThemeFiles(null);
    this.lastImportResult = null;
  }

  setThemeFiles(themeFilesMap) {
    this.assertReady();
    this.resourceFetcher.setThemeFiles(themeFilesMap);
  }

  async loadElpx(fileOrBytes, options = {}) {
    await this.init();
    this.resetDocument();
    const importer = window.SharedImporters.createBrowserImporter(this.documentManager, this.assetManager);
    let file = fileOrBytes;
    if (!(file instanceof File)) {
      const bytes = fileOrBytes instanceof Uint8Array ? fileOrBytes : new Uint8Array(fileOrBytes);
      file = new File([bytesToArrayBuffer(bytes)], options.filename || "project.elpx", { type: "application/zip" });
    }
    this.lastImportResult = await importer.importFromFile(file, {
      clearExisting: true,
      clearIndexedDB: false,
      onProgress: options.onProgress || null
    });
    return this.lastImportResult;
  }

  getMetadata() {
    this.assertReady();
    return this.documentManager.getMetadata().toJSON();
  }

  setMetadata(values = {}) {
    this.assertReady();
    const metadata = this.documentManager.getMetadata();
    for (const [key, value] of Object.entries(values)) {
      metadata.set(key, value);
    }
  }

  getPages() {
    this.assertReady();
    return this.documentManager.getNavigation().toArray().map((page) => page.toJSON());
  }

  async exportPackage({ format = "html5", theme = null, themeFiles = null, metadata = null, filename = "edex-preview" } = {}) {
    await this.init();
    const exportTheme = themeFiles ? EDEX_CURRENT_THEME : theme;
    if (themeFiles) this.setThemeFiles(themeFiles);
    if (metadata) this.setMetadata(metadata);
    const exporter = window.SharedExporters.createExporter(
      format,
      this.documentManager,
      null,
      this.resourceFetcher,
      this.assetManager
    );
    const result = await exporter.export({ filename, theme: exportTheme || undefined });
    if (!result?.success) throw new Error(result?.error || `No se pudo exportar ${format}`);
    return result;
  }

  async exportPreview(options = {}) {
    await this.init();
    const format = String(options.format || "html5");
    const theme = options.themeFiles ? EDEX_CURRENT_THEME : options.theme;
    if (options.themeFiles) this.setThemeFiles(options.themeFiles);
    if (format !== "html5") {
      const result = await this.exportPackage({ ...options, theme });
      const files = await this.unzipPackage(result.data);
      return {
        format,
        filename: result.filename,
        zipBytes: result.data,
        files,
        entryPath: files.has("index.html") ? "index.html" : Array.from(files.keys()).find((path) => path.endsWith(".html")) || ""
      };
    }
    const exporter = window.SharedExporters.createExporter(
      "html5",
      this.documentManager,
      null,
      this.resourceFetcher,
      this.assetManager
    );
    const previewFiles = await exporter.generateForPreview({ theme: theme || undefined });
    const files = new Map();
    for (const [path, content] of previewFiles.entries()) {
      if (content instanceof Uint8Array) files.set(path, content);
      else if (content instanceof ArrayBuffer) files.set(path, new Uint8Array(content));
      else if (typeof content === "string") files.set(path, new TextEncoder().encode(content));
    }
    return {
      format,
      filename: options.filename || "edex-preview",
      zipBytes: null,
      files,
      entryPath: files.has("index.html") ? "index.html" : Array.from(files.keys()).find((path) => path.endsWith(".html")) || ""
    };
  }

  async unzipPackage(bytes) {
    await loadScript("../../vendor/jszip.min.js");
    const JSZip = ensureGlobal("JSZip");
    const zip = await JSZip.loadAsync(bytes);
    const files = new Map();
    const jobs = [];
    zip.forEach((path, entry) => {
      if (!entry.dir) jobs.push(entry.async("uint8array").then((data) => files.set(path, data)));
    });
    await Promise.all(jobs);
    return files;
  }

  diagnostics() {
    return {
      initialized: this.initialized,
      hasYjs: Boolean(window.Y),
      hasImporters: Boolean(window.SharedImporters),
      hasExporters: Boolean(window.SharedExporters),
      projectId: this.documentManager?.projectId || "",
      lastImportResult: this.lastImportResult,
      metadata: this.initialized ? this.getMetadata() : null,
      pageCount: this.initialized ? this.documentManager.getNavigation().length : 0,
      assetCount: this.assetManager?.assets?.size || 0
    };
  }
}

export function createExeRuntime() {
  return new EdexExeRuntime();
}

window.EdexExeRuntime = {
  create: createExeRuntime,
  Runtime: EdexExeRuntime
};

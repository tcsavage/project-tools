// Mock Obsidian API for testing

export class App {
  vault = new Vault();
  metadataCache = new MetadataCache();
  workspace = new Workspace();
  fileManager = new FileManager();
}

export class Vault {
  getAbstractFileByPath(path: string): TFile | null {
    return new TFile();
  }

  async read(file: TFile): Promise<string> {
    return file.content || '';
  }

  async modify(file: TFile, content: string): Promise<void> {
    file.content = content;
  }
}

export class MetadataCache {
  getFileCache(file: TFile) {
    return file.cache || null;
  }
}

export class Workspace {
  getActiveViewOfType(viewType: any) {
    return null;
  }
  
  getActiveFile(): TFile | null {
    return null;
  }
  
  trigger(eventName: string): void {
    // Mock implementation
  }
}

export class FileManager {
  async processFrontMatter(file: TFile, fn: (frontmatter: any) => void): Promise<void> {
    // Mock implementation that applies the function to a frontmatter object
    const frontmatter = file.cache?.frontmatter || {};
    fn(frontmatter);
    // Update the file's cache with the modified frontmatter
    if (!file.cache) {
      file.cache = {};
    }
    file.cache.frontmatter = frontmatter;
  }
}

export class TFile {
  content?: string;
  cache?: any;
  path: string;
  basename: string;
  extension: string;
  stat: any;
  
  constructor(content?: string, cache?: any, path: string = 'test.md') {
    this.content = content;
    this.cache = cache;
    this.path = path;
    this.basename = path.replace(/\.md$/, '');
    this.extension = 'md';
    this.stat = { mtime: Date.now(), ctime: Date.now(), size: 0 };
  }
}

export class Plugin {
  app: App;
  
  constructor(app: App) {
    this.app = app;
  }

  async loadData(): Promise<any> {
    return {};
  }

  async saveData(data: any): Promise<void> {
    // Mock implementation
  }

  registerMarkdownCodeBlockProcessor(language: string, handler: Function): void {
    // Mock implementation
  }

  addRibbonIcon(icon: string, title: string, callback: Function): HTMLElement {
    return document.createElement('div');
  }

  addStatusBarItem(): HTMLElement {
    return document.createElement('div');
  }

  addCommand(command: any): void {
    // Mock implementation
  }

  addSettingTab(tab: any): void {
    // Mock implementation
  }

  registerDomEvent(element: Element, type: string, handler: Function): void {
    // Mock implementation
  }

  registerInterval(intervalId: number): void {
    // Mock implementation
  }
}

export class Modal {
  app: App;
  titleEl = document.createElement('div');
  contentEl = document.createElement('div');

  constructor(app: App) {
    this.app = app;
  }

  open(): void {
    // Mock implementation
  }

  close(): void {
    // Mock implementation
  }
}

export class Notice {
  constructor(message: string) {
    // Mock implementation
  }
}

export class PluginSettingTab {
  app: App;
  plugin: Plugin;

  constructor(app: App, plugin: Plugin) {
    this.app = app;
    this.plugin = plugin;
  }

  display(): void {
    // Mock implementation
  }
}

export class Setting {
  constructor(containerEl: HTMLElement) {
    // Mock implementation
  }

  setName(name: string): Setting {
    return this;
  }

  setDesc(desc: string): Setting {
    return this;
  }

  addText(cb: Function): Setting {
    return this;
  }
}

export class Editor {
  getSelection(): string {
    return '';
  }

  replaceSelection(text: string): void {
    // Mock implementation
  }
}

export class MarkdownView {
  // Mock implementation
}
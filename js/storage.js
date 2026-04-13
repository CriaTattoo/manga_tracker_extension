// Módulo para gerenciamento de arquivo JSON usando File System Access API

const StorageManager = {
  fileHandle: null,
  data: {
    sites: [],
    mangas: [],
    history: [],
    settings: {
      autoDetect: true,
      notifications: true
    }
  },

  // Inicializar storage
  async init() {
    try {
      // Recuperar file handle do chrome.storage.local
      const result = await chrome.storage.local.get(['fileHandle']);
      if (result.fileHandle) {
        this.fileHandle = result.fileHandle;
        await this.loadData();
      }
      
      await this.loadNativeSites();
      
      return true;
    } catch (error) {
      console.error('Erro ao inicializar storage:', error);
      return false;
    }
  },

  // Solicitar ao usuário para selecionar arquivo
  async selectFile() {
    try {
      // Nota: File System Access API não funciona em service workers
      // Vamos usar chrome.storage.local como fallback
      const result = await chrome.storage.local.get(['mangaData']);
      if (result.mangaData) {
        this.data = result.mangaData;
      }
      
      // Marcar que arquivo foi "selecionado"
      await chrome.storage.local.set({ 
        fileHandle: true,
        fileName: 'manga_tracker_data.json'
      });
      
      this.fileHandle = true;
      return true;
    } catch (error) {
      console.error('Erro ao selecionar arquivo:', error);
      return false;
    }
  },

  // Carregar dados do arquivo
  async loadData() {
    try {
      const result = await chrome.storage.local.get(['mangaData']);
      if (result.mangaData) {
        this.data = result.mangaData;
      }
      return this.data;
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      return this.data;
    }
  },

  // Carregar sites oficiais (apenas MangaPlus e Viz)
  async loadNativeSites() {
    try {
      const officialSites = [
        {
          id: 'official_mangaplus',
          name: 'Manga Plus (Shueisha)',
          url: 'https://mangaplus.shueisha.co.jp',
          isNative: true,
          isActive: true,
          isFavorite: false
        },
        {
          id: 'official_viz',
          name: 'Viz Media',
          url: 'https://www.viz.com',
          isNative: true,
          isActive: true,
          isFavorite: false
        }
      ];

      officialSites.forEach(official => {
        const existing = this.data.sites.find(s => s.id === official.id);
        if (!existing) {
          this.data.sites.push({
            ...official,
            pattern: '',
            addedAt: new Date().toISOString()
          });
        }
      });

      await this.saveData();
    } catch (e) {
      console.error('Erro ao carregar sites oficiais:', e);
    }
  },

  // Salvar dados no arquivo
  async saveData() {
    try {
      await chrome.storage.local.set({ mangaData: this.data });
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      return false;
    }
  },

  // Adicionar site
  async addSite(site) {
    const newSite = {
      id: Date.now().toString(),
      name: site.name,
      url: site.url,
      pattern: site.pattern || '',
      addedAt: new Date().toISOString()
    };
    this.data.sites.push(newSite);
    await this.saveData();
    return newSite;
  },

  // Remover site
  async removeSite(siteId) {
    this.data.sites = this.data.sites.filter(s => s.id !== siteId);
    await this.saveData();
  },

  // Atualizar site
  async updateSite(siteId, updates) {
    const site = this.data.sites.find(s => s.id === siteId);
    if (site) {
      Object.assign(site, updates);
      await this.saveData();
      return site;
    }
    return null;
  },

  // Adicionar mangá
  async addManga(manga) {
    const existingManga = this.data.mangas.find(m => 
      m.url === manga.url || (m.title === manga.title && m.siteId === manga.siteId)
    );
    
    if (existingManga) {
      return existingManga;
    }

    const newManga = {
      id: Date.now().toString(),
      title: manga.title,
      url: manga.url,
      siteId: manga.siteId,
      lastChapterRead: manga.lastChapterRead || null,
      lastChapterUrl: manga.lastChapterUrl || null,
      latestChapter: manga.latestChapter || null,
      lastReadAt: manga.lastReadAt || null,
      addedAt: new Date().toISOString()
    };
    
    this.data.mangas.push(newManga);
    await this.saveData();
    return newManga;
  },

  // Atualizar mangá
  async updateManga(mangaId, updates) {
    const manga = this.data.mangas.find(m => m.id === mangaId);
    if (manga) {
      Object.assign(manga, updates);
      await this.saveData();
      return manga;
    }
    return null;
  },

  // Remover mangá
  async removeManga(mangaId) {
    this.data.mangas = this.data.mangas.filter(m => m.id !== mangaId);
    await this.saveData();
  },

  // Adicionar ao histórico
  async addToHistory(entry) {
    // Evita duplicatas exatas de leitura (mesmo mangá+capítulo+URL)
    const existing = this.data.history.find(h =>
      h.mangaId === entry.mangaId &&
      h.url === entry.url &&
      h.chapter === entry.chapter
    );
    if (existing) {
      return existing;
    }

    const historyEntry = {
      id: Date.now().toString(),
      mangaId: entry.mangaId,
      title: entry.title,
      chapter: entry.chapter,
      url: entry.url,
      readAt: new Date().toISOString()
    };
    
    this.data.history.unshift(historyEntry);
    
    // Manter apenas últimos 1000 registros
    if (this.data.history.length > 1000) {
      this.data.history = this.data.history.slice(0, 1000);
    }
    
    await this.saveData();
    return historyEntry;
  },

  // Atualizar configurações
  async updateSettings(settings) {
    this.data.settings = { ...this.data.settings, ...settings };
    await this.saveData();
  },

  // Obter todos os dados
  getData() {
    return this.data;
  },

  // Limpar todos os dados
  async clearAllData() {
    this.data = {
      sites: [],
      mangas: [],
      history: [],
      settings: {
        autoDetect: true,
        notifications: true
      }
    };
    await this.saveData();
  },

  // Exportar dados (JSON)
  exportData() {
    const dataToExport = { ...this.data };
    // Ocultar do import sites inativos (segundo solicitação do usuário, não vamos importar os nativos inativos
    // Para simplificar, vou exportar apenas os itens de data.sites que são Meus Sites ou sites Nativos ATIVOS)
    dataToExport.sites = dataToExport.sites.filter(site => {
      // Retorna Meus Sites ou Sites Nativos que estão ativos
      return !site.isNative || site.isActive;
    });

    return JSON.stringify(dataToExport, null, 2);
  },

  // Importar dados (JSON)
  async importData(jsonData) {
    try {
      const imported = JSON.parse(jsonData);
      this.data = imported;
      await this.saveData();
      return true;
    } catch (error) {
      console.error('Erro ao importar dados JSON:', error);
      return false;
    }
  },

  // Conversores Auxiliares para XML
  objToXml(obj, nodeName) {
    let xml = `<${nodeName}>`;
    for (let key in obj) {
      if (Array.isArray(obj[key])) {
        xml += `<${key}>`;
        for (let item of obj[key]) {
          let itemTag = key === 'mangas' ? 'Manga' : (key === 'sites' ? 'Site' : (key === 'history' ? 'Entry' : 'Item'));
          xml += this.objToXml(item, itemTag);
        }
        xml += `</${key}>`;
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        xml += this.objToXml(obj[key], key);
      } else {
        const val = obj[key] !== null && obj[key] !== undefined ? String(obj[key]).replace(/[<>&'"]/g, c => {
          switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case "'": return '&apos;';
            case '"': return '&quot;';
          }
        }) : '';
        xml += `<${key}>${val}</${key}>`;
      }
    }
    xml += `</${nodeName}>`;
    return xml;
  },

  xmlToObj(node) {
    if (node.children.length === 0) {
      return node.textContent;
    }
    
    let obj = {};
    for (let i = 0; i < node.children.length; i++) {
      let child = node.children[i];
      let nodeName = child.nodeName;

      if (['mangas', 'sites', 'history'].includes(nodeName)) {
        obj[nodeName] = [];
        for (let j = 0; j < child.children.length; j++) {
          obj[nodeName].push(this.xmlToObj(child.children[j]));
        }
      } else if (nodeName === 'settings') {
        obj[nodeName] = this.xmlToObj(child);
      } else {
        let val = this.xmlToObj(child);
        if (val === 'true') val = true;
        else if (val === 'false') val = false;
        else if (!isNaN(val) && val !== '') val = Number(val);
        
        obj[nodeName] = val;
      }
    }
    return obj;
  },

  exportToXML() {
    const dataToExport = { ...this.data };
    dataToExport.sites = dataToExport.sites.filter(site => {
      return !site.isNative || site.isActive;
    });
    return `<?xml version="1.0" encoding="UTF-8"?>\n` + this.objToXml(dataToExport, 'MangaTrackerData');
  },

  async importFromXML(xmlString) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      
      if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        throw new Error("Formatação XML inválida");
      }
      
      const root = xmlDoc.getElementsByTagName('MangaTrackerData')[0];
      if (!root) throw new Error("Nó base MangaTrackerData não encontrado");
      
      const imported = this.xmlToObj(root);
      
      this.data = imported;
      await this.saveData();
      return true;
    } catch (error) {
      console.error('Erro ao importar XML:', error);
      return false;
    }
  },

  // Verificar se arquivo foi selecionado
  hasFile() {
    return this.fileHandle !== null;
  },

  // Obter nome do arquivo
  async getFileName() {
    const result = await chrome.storage.local.get(['fileName']);
    return result.fileName || 'Nenhum arquivo selecionado';
  }
};

// Tornar disponível globalmente
if (typeof window !== 'undefined') {
  window.StorageManager = StorageManager;
}

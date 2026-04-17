// Content script - Manga Tracker Personal Library Journal
// Injetado dinamicamente apenas em sites com permissão do usuário

(function () {
  // Executar apenas uma vez
  if (window.mangaTrackerInjected) return;
  window.mangaTrackerInjected = true;

  // Padrões comuns de URLs de mangá
  const MANGA_PATTERNS = [
    /\/manga\//i,
    /\/mangas\//i,
    /\/titulo\//i,
    /\/title\//i,
    /\/read\//i,
    /\/ler\//i,
    /\/capitulo\//i,
    /\/chapter\//i,
    /\/cap\//i,
    /\/ch\//i,
    /\/obra\//i,
    /\/obras\//i,
    /\/series\//i,
    /\/comics\//i
  ];

  // Palavras-chave comuns em sites de mangá
  const MANGA_KEYWORDS = [
    'manga',
    'manhua',
    'manhwa',
    'capítulo',
    'chapter',
    'ler online',
    'read online'
  ];

  // Verificar se a página atual é uma página de mangá
  function isMangaPage() {
    const url = window.location.href;
    const title = document.title.toLowerCase();
    const bodyText = document.body.innerText.toLowerCase().substring(0, 500);

    const hasPattern = MANGA_PATTERNS.some(pattern => pattern.test(url));
    const hasKeyword = MANGA_KEYWORDS.some(keyword =>
      title.includes(keyword) || bodyText.includes(keyword)
    );

    return hasPattern || hasKeyword;
  }

  // Limpar título do mangá removendo ruídos (capítulos, nomes de sites, etc)
  function cleanTitle(title) {
    if (!title) return '';
    
    let clean = title;

    // 0. Remover prefixos de capítulo tipo [#001] (Comum no MangaPlus)
    clean = clean.replace(/\[#\d+\]\s*/i, '');
    
    // 1. Remover sufixos de sites comuns
    const siteSuffixes = [
      '| MANGA Plus by SHUEISHA',
      '| MANGA Plus',
      '| VIZ',
      '- Shonen Jump',
      '| MangaDex',
      '| Manga Host',
      '| Ler Mangás',
      '| Yomu',
      '| Sakura Mangás'
    ];
    
    siteSuffixes.forEach(suffix => {
      if (clean.includes(suffix)) {
        clean = clean.replace(suffix, '');
      }
    });

    // 2. Remover padrões de capítulo (Ex: "Capítulo 01", "Chapter 10", "Ch. 5")
    const chapterPatterns = [
      /\s*-\s*Capitulo\s*\d+.*/i,
      /\s*-\s*Chapter\s*\d+.*/i,
      /\s*-\s*Cap\s*\d+.*/i,
      /\s*-\s*Ch\s*\d+.*/i,
      /,\s*Chapter\s*\d+.*/i,
      /\s*\|\s*.*/ // Remove tudo após um pipe se não for o nome do mangá
    ];
    
    chapterPatterns.forEach(pattern => {
      clean = clean.replace(pattern, '');
    });

    // 3. Remover termos genéricos
    clean = clean.replace(/Ler Online/gi, '');
    clean = clean.replace(/Read Online/gi, '');
    clean = clean.replace(/Manga/gi, '');

    return clean.trim();
  }

  // Tentar extrair informações do mangá da página
  function extractMangaInfo() {
    const url = window.location.href;
    const rawDocumentTitle = document.title;
    
    // Tentar pegar o título dos metadados OG primeiro (mais estável)
    let mangaTitle = '';
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && ogTitle.content) {
      mangaTitle = cleanTitle(ogTitle.content);
    }
    
    // Fallback para seletores comuns se o OG falhar ou for muito longo
    if (!mangaTitle || mangaTitle.length > 100) {
      const titleSelectors = [
        'h1.manga-title',
        'h1.title',
        '.manga-name',
        '.series-title',
        'h1',
        'h2'
      ];

      for (const selector of titleSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
          mangaTitle = cleanTitle(element.textContent.trim());
          break;
        }
      }
    }

    // Último recurso: Título da página
    if (!mangaTitle) {
      mangaTitle = cleanTitle(rawDocumentTitle);
    }

    // --- Extrair número do capítulo ---
    let chapter = null;

    // 1. Tentar extrair do título da página (ex: [#001]) - MUITO CONFIÁVEL para MangaPlus
    const titleChapterMatch = rawDocumentTitle.match(/\[#(\d+(?:\.\d+)?)\]/);
    if (titleChapterMatch) {
      chapter = titleChapterMatch[1];
      console.log('Manga Tracker: Capítulo detectado no título:', chapter);
    }

    // 2. Se não encontrou no título, tenta na URL
    if (!chapter) {
      const numMatch = url.match(/(?:capitulo|chapter|cap|ch|ler|read|episode|ep|viewer|viewer\/)(?:[-_]?|.*?\/)(\d+(?:\.\d+)?)(?:\/|$|\?)/i);
      if (numMatch) {
        chapter = numMatch[1];
      } else {
        const hashMatch = url.match(/(?:chapter|read|ler)\/([a-z0-9-]+)(?:\/|$|\?)/i);
        if (hashMatch) {
          chapter = hashMatch[1];
        } else {
          const endNumMatch = url.match(/\/(\d+(?:\.\d+)?)(?:\/|$|\?)/);
          if (endNumMatch) {
             // Evitar pegar IDs longos de sites como mangaplus se já tivermos o título limpo
             if (endNumMatch[1].length < 6) {
                chapter = endNumMatch[1];
             }
          }
        }
      }
    }

    return {
      title: mangaTitle,
      url: url,
      chapter: chapter,
      isMangaPage: isMangaPage()
    };
  }

  // Notificar background script sobre detecção
  async function notifyDetection() {
    const info = extractMangaInfo();

    if (info.isMangaPage) {
      try {
        await chrome.runtime.sendMessage({
          action: 'mangaDetected',
          data: info
        });
      } catch (error) {
        console.log('Manga Tracker: Erro ao notificar detecção:', error);
      }
    }
  }

  // Criar overlay de notificação na página
  function showPageNotification(message, type = 'info', manga = null, chapter = null, url = null) {
    let notification = document.getElementById('manga-tracker-notification');

    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'manga-tracker-notification';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #667eea;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        z-index: 999999;
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        max-width: 300px;
        cursor: pointer;
        animation: slideIn 0.3s ease;
      `;
      document.body.appendChild(notification);
    }

    const colors = {
      info: '#667eea',
      success: '#48bb78',
      warning: '#f6ad55',
      error: '#f56565'
    };

    notification.style.background = colors[type] || colors.info;

    // Aplicar mensagem de forma segura (sem HTML injetado)
    notification.textContent = '';

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '12px';

    const icon = document.createElement('span');
    icon.style.fontSize = '20px';
    icon.textContent = '📚';

    const text = document.createElement('div');
    text.textContent = message;

    wrapper.appendChild(icon);
    wrapper.appendChild(text);
    notification.appendChild(wrapper);

    if (manga && chapter) {
      const hint = document.createElement('div');
      hint.style.fontSize = '12px';
      hint.style.marginTop = '8px';
      hint.style.opacity = '0.85';
      hint.textContent = 'Clique para marcar como lido';
      notification.appendChild(hint);
    }

    notification.onclick = async () => {
      if (manga && chapter && url) {
        try {
          await markChapterAsRead(manga, chapter, url);
          notification.textContent = 'Capítulo marcado como lido!';
          notification.style.background = colors.success;
        } catch (error) {
          console.warn('Erro ao marcar capítulo como lido:', error);
          notification.textContent = 'Erro ao marcar capítulo';
          notification.style.background = colors.error;
        }
      }
    };

    // Remover após 5 segundos
    setTimeout(() => {
      if (notification && notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }

  // Adicionar animações
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(400px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // Escutar mensagens do background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'showNotification') {
      showPageNotification(message.text, message.type, message.manga, message.chapter, message.url);
      sendResponse({ success: true });
    }
    return true;
  });

  async function markChapterAsRead(manga, chapter, pageUrl) {
    if (!manga || !chapter) return;

    const storage = await chrome.storage.local.get(['mangaData']);
    const mangaData = storage.mangaData || {
      sites: [], mangas: [], history: [], settings: { autoDetect: true, notifications: true }
    };

    let existingManga = mangaData.mangas.find(m => m.id === manga.id || (m.url && pageUrl && pageUrl.includes(m.url)));

    if (!existingManga) {
      existingManga = {
        id: manga.id || Date.now().toString(),
        title: manga.title || document.title || 'Mangá desconhecido',
        url: pageUrl,
        siteId: manga.siteId || null,
        lastChapterRead: chapter,
        lastChapterUrl: pageUrl,
        latestChapter: chapter,
        lastReadAt: new Date().toISOString(),
        addedAt: new Date().toISOString(),
        status: 'lendo',
        rating: ''
      };
      mangaData.mangas.push(existingManga);
    } else {
      existingManga.lastChapterRead = chapter;
      existingManga.lastChapterUrl = pageUrl;
      existingManga.lastReadAt = new Date().toISOString();
      if (!existingManga.latestChapter || parseFloat(chapter) > parseFloat(existingManga.latestChapter)) {
        existingManga.latestChapter = chapter;
      }
      if (!existingManga.status || existingManga.status === 'vou ler') {
        existingManga.status = 'lendo';
      }
    }

    const existingHistory = mangaData.history.find(h =>
      h.mangaId === existingManga.id &&
      h.url === pageUrl &&
      h.chapter === chapter
    );

    if (!existingHistory) {
      mangaData.history.unshift({
        id: Date.now().toString(),
        mangaId: existingManga.id,
        title: existingManga.title,
        chapter: chapter,
        url: pageUrl,
        readAt: new Date().toISOString()
      });
    }

    if (mangaData.history.length > 1000) {
      mangaData.history = mangaData.history.slice(0, 1000);
    }

    await chrome.storage.local.set({ mangaData });
    await chrome.runtime.sendMessage({ action: 'mangaMarkedAsRead', data: { manga: existingManga, chapter, url: pageUrl } });
  }

  // Detectar quando a página carregar completamente
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(notifyDetection, 1000);
    });
  } else {
    setTimeout(notifyDetection, 1000);
  }

  // Detectar navegação em SPAs (Single Page Applications)
  let lastUrl = window.location.href;
  new MutationObserver(() => {
    const url = window.location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(notifyDetection, 1000);
    }
  }).observe(document.body, { childList: true, subtree: true });

  console.log('Manga Tracker - Personal Library Journal: Content script carregado');
})();

// Background service worker - Manga Tracker Personal Library Journal
// Gerencia registro dinâmico de scripts e notificações

// Estado global
let storageInitialized = false;

// Inicializar quando a extensão for instalada
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Manga Tracker - Personal Library Journal instalado!');

  // Registrar scripts para sites oficiais (MangaPlus e Viz)
  await registerOfficialSites();

  // Re-registrar scripts de sites personalizados do usuário
  await reRegisterUserSites();

  // Mostrar notificação de boas-vindas
  if (details.reason === 'install') {
    showNotification(
      'Manga Tracker instalado!',
      'Clique no ícone da extensão para começar a organizar sua biblioteca.'
    );
  }
});

// Ao iniciar o service worker, garantir que os scripts estejam registrados
chrome.runtime.onStartup.addListener(async () => {
  await reRegisterUserSites();
});

// Registrar scripts para sites oficiais (MangaPlus e Viz)
async function registerOfficialSites() {
  const officialPatterns = [
    { id: 'official_mangaplus', matches: ['https://*.mangaplus.shueisha.co.jp/*'] },
    { id: 'official_viz', matches: ['https://*.viz.com/*'] }
  ];

  for (const pattern of officialPatterns) {
    try {
      // Tentar desregistrar antes para evitar duplicidade
      await chrome.scripting.unregisterContentScripts({ ids: [pattern.id] }).catch(() => {});

      await chrome.scripting.registerContentScripts([{
        id: pattern.id,
        js: ['js/content.js'],
        matches: pattern.matches,
        runAt: 'document_idle'
      }]);
      console.log(`Script registrado para: ${pattern.id}`);
    } catch (e) {
      console.log(`Erro ao registrar script oficial ${pattern.id}:`, e);
    }
  }
}

// Re-registrar scripts de sites personalizados salvos pelo usuário
async function reRegisterUserSites() {
  try {
    const result = await chrome.storage.local.get(['mangaData']);
    if (!result.mangaData || !result.mangaData.sites) return;

    const sites = result.mangaData.sites.filter(s => !s.isNative && s.url);

    for (const site of sites) {
      try {
        const parsedUrl = new URL(site.url);
        const origin = `https://*.${parsedUrl.hostname.replace(/^www\./, '')}/*`;
        const scriptId = `site_${site.id}`;

        // Verificar se já temos permissão
        const hasPermission = await chrome.permissions.contains({ origins: [origin] });
        if (!hasPermission) continue;

        // Tentar desregistrar antes
        await chrome.scripting.unregisterContentScripts({ ids: [scriptId] }).catch(() => {});

        await chrome.scripting.registerContentScripts([{
          id: scriptId,
          js: ['js/content.js'],
          matches: [origin],
          runAt: 'document_idle'
        }]);
        console.log(`Script re-registrado para site do usuário: ${site.name}`);
      } catch (e) {
        console.log(`Erro ao re-registrar site ${site.name}:`, e);
      }
    }
  } catch (error) {
    console.error('Erro ao re-registrar sites do usuário:', error);
  }
}

// Inicializar storage quando necessário
async function initStorage() {
  if (!storageInitialized) {
    try {
      const result = await chrome.storage.local.get(['mangaData']);
      if (!result.mangaData) {
        await chrome.storage.local.set({
          mangaData: {
            sites: [],
            mangas: [],
            history: [],
            settings: {
              autoDetect: true,
              notifications: true
            }
          }
        });
      }
      storageInitialized = true;
    } catch (error) {
      console.error('Erro ao inicializar storage:', error);
    }
  }
}

// Mostrar notificação do navegador
function showNotification(title, message) {
  try {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon128.png'),
      title: title,
      message: message,
      priority: 2
    }).catch(error => {
      console.error('Erro ao criar notificação com ícone:', error);
      chrome.notifications.create({
        type: 'basic',
        title: title,
        message: message,
        priority: 2
      }).catch(error2 => {
        console.error('Erro ao criar notificação sem ícone:', error2);
      });
    });
  } catch (error) {
    console.error('Erro geral ao criar notificação:', error);
  }
}

// Escutar mensagens de outras partes da extensão
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // Mantém o canal aberto para resposta assíncrona
});

async function handleMessage(message, sender, sendResponse) {
  try {
    await initStorage();

    switch (message.action) {
      case 'mangaDetected':
        await handleMangaDetection(message.data, sender);
        sendResponse({ success: true });
        break;

      case 'enableSite':
        // Registrar script dinamicamente para um novo site
        await registerDynamicSite(message.data);
        sendResponse({ success: true });
        break;

      case 'disableSite':
        // Desregistrar script de um site
        await unregisterDynamicSite(message.data.siteId);
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ success: false, error: 'Ação desconhecida' });
    }
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Registrar script dinâmico para um site
async function registerDynamicSite(data) {
  try {
    const scriptId = `site_${data.siteId}`;
    const origin = data.origin;

    // Desregistrar antes para evitar erro de duplicidade
    await chrome.scripting.unregisterContentScripts({ ids: [scriptId] }).catch(() => {});

    await chrome.scripting.registerContentScripts([{
      id: scriptId,
      js: ['js/content.js'],
      matches: [origin],
      runAt: 'document_idle'
    }]);

    console.log(`Script dinâmico registrado: ${scriptId} para ${origin}`);
  } catch (error) {
    console.error('Erro ao registrar script dinâmico:', error);
  }
}

// Desregistrar script dinâmico de um site
async function unregisterDynamicSite(siteId) {
  try {
    const scriptId = `site_${siteId}`;
    await chrome.scripting.unregisterContentScripts({ ids: [scriptId] });
    console.log(`Script dinâmico desregistrado: ${scriptId}`);
  } catch (error) {
    console.log('Erro ao desregistrar script dinâmico:', error);
  }
}

// Lidar com detecção de mangá
async function handleMangaDetection(data, sender) {
  try {
    const result = await chrome.storage.local.get(['mangaData']);
    const mangaData = result.mangaData;

    if (!mangaData || !mangaData.settings.autoDetect) {
      return;
    }

    // Verificar se a URL do site está cadastrada
    const site = mangaData.sites.find(s => data.url.includes(s.url));

    if (!site) {
      console.log('Site não cadastrado, conteúdo detectado mas ignorado');
      return;
    }

    // Verificar se o mangá já está na lista
    let existingManga = mangaData.mangas.find(m =>
      (m.url && data.url.includes(m.url)) || m.lastChapterUrl === data.url
    );

    // Fallback: Busca por Título + Hostname (Útil para sites como MangaPlus onde IDs não batem)
    if (!existingManga && data.title) {
      try {
        const currentHost = new URL(data.url).hostname;
        existingManga = mangaData.mangas.find(m => {
          try {
            const mHost = new URL(m.url).hostname;
            // Mesmo site e mesmo título (ignora case)
            return mHost === currentHost && m.title.toLowerCase().trim() === data.title.toLowerCase().trim();
          } catch (e) { return false; }
        });
        
        if (existingManga) console.log('Mangá recuperado por busca de título:', existingManga.title);
      } catch (e) {
        console.error('Erro ao comparar por hostname:', e);
      }
    }

    if (existingManga) {
      console.log('Mangá já cadastrado:', existingManga.title);

      // Se for uma página de capítulo, sugerir marcar como lido
      if (data.chapter && sender.tab) {
        await chrome.tabs.sendMessage(sender.tab.id, {
          action: 'showNotification',
          text: `${existingManga.title} - Deseja marcar o capítulo ${data.chapter} como lido?`,
          type: 'info',
          manga: {
            id: existingManga.id,
            title: existingManga.title,
            url: existingManga.url,
            siteId: existingManga.siteId
          },
          chapter: data.chapter,
          url: data.url
        });
      }
    } else {
      // Novo mangá detectado
      console.log('Novo mangá detectado:', data.title);

      if (sender.tab) {
        await chrome.tabs.sendMessage(sender.tab.id, {
          action: 'showNotification',
          text: `Novo mangá detectado: ${data.title}. Abra a extensão para adicionar.`,
          type: 'success'
        });
      }
    }
  } catch (error) {
    console.error('Erro ao processar detecção de mangá:', error);
  }
}

// Escutar cliques nas notificações
chrome.notifications.onClicked.addListener((notificationId) => {
  chrome.tabs.create({ url: 'manager.html' });
});

console.log('Manga Tracker - Personal Library Journal: Background service worker iniciado');

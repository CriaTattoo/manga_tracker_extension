// Popup script - Manga Tracker Personal Library Journal
document.addEventListener('DOMContentLoaded', async () => {
  // Elementos
  const selectFileBtn = document.getElementById('selectFileBtn');
  const fileName = document.getElementById('fileName');
  const openManagerBtn = document.getElementById('openManagerBtn');
  const helpBtn = document.getElementById('helpBtn');
  const helpModal = document.getElementById('helpModal');
  const closeHelpBtn = document.getElementById('closeHelpBtn');
  // Verificar se elementos existem
  if (!helpBtn || !helpModal || !closeHelpBtn) {
    console.error('Elementos do modal de ajuda não encontrados!');
    return;
  }
  const currentPageSection = document.getElementById('currentPageSection');
  const currentUrl = document.getElementById('currentUrl');
  const detectionStatus = document.getElementById('detectionStatus');
  const addManuallyBtn = document.getElementById('addManuallyBtn');
  const markAsReadBtn = document.getElementById('markAsReadBtn');
  const enableSiteBtn = document.getElementById('enableSiteBtn');
  const statsSection = document.getElementById('statsSection');
  const totalMangas = document.getElementById('totalMangas');
  const totalSites = document.getElementById('totalSites');
  const totalReadings = document.getElementById('totalReadings');

  let currentTab = null;

  // Inicializar
  await init();

  async function init() {
    await StorageManager.init();
    await updateUI();
    await checkCurrentPage();
  }

  // Atualizar interface
  async function updateUI() {
    // Atualizar nome do arquivo
    const fileNameText = await StorageManager.getFileName();
    fileName.textContent = fileNameText;

    // Mostrar estatísticas e ocultar a seleção de arquivo se um arquivo estiver selecionado
    if (StorageManager.hasFile()) {
      document.querySelector('.status-section').style.display = 'none';

      const data = StorageManager.getData();
      statsSection.style.display = 'block';
      
      const totalMangasCount = (data.mangas && Array.isArray(data.mangas)) ? data.mangas.length : 0;
      const totalSitesCount = (data.sites && Array.isArray(data.sites)) ? data.sites.length : 0;
      const totalReadingsCount = (data.history && Array.isArray(data.history)) ? data.history.length : 0;

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfWeek.getDate() - 6); // Últimos 7 dias incluindo hoje

      let dailyCount = 0;
      let weeklyCount = 0;

      for (const entry of data.history) {
        if (!entry.readAt) continue;
        const readAtDate = new Date(entry.readAt);
        if (isNaN(readAtDate)) continue;

        if (readAtDate >= startOfToday) {
          dailyCount += 1;
        }
        if (readAtDate >= startOfWeek) {
          weeklyCount += 1;
        }
      }

      totalMangas.textContent = totalMangasCount;
      totalSites.textContent = totalSitesCount;
      totalReadings.textContent = totalReadingsCount;
      document.getElementById('dailyReadings').textContent = dailyCount;
      document.getElementById('weeklyReadings').textContent = weeklyCount;

      // Atualizar Nick e Patente
      const nickname = (data.settings && data.settings.nickname) ? data.settings.nickname : 'Leitor Anônimo';
      const rank = RankManager.getRank(weeklyCount);
      
      const userRankContainer = document.getElementById('userRankContainer');
      const userNickname = document.getElementById('userNickname');
      const rankIcon = document.getElementById('rankIcon');
      const rankName = document.getElementById('rankName');

      if (userRankContainer && userNickname && rankIcon && rankName) {
        userNickname.textContent = nickname;
        rankIcon.src = `icons/patentes_icons/${rank.icon}`;
        rankName.textContent = rank.patente;
        userRankContainer.style.display = 'flex';
      }
    }
  }

  // Limpar título para comparação (Mesma lógica do content script)
  function cleanTitle(title) {
    if (!title) return '';
    let clean = title;
    
    // Remover prefixos de capítulo tipo [#001]
    clean = clean.replace(/\[#\d+\]\s*/i, '');

    const siteSuffixes = ['| MANGA Plus by SHUEISHA', '| MANGA Plus', '| VIZ', '- Shonen Jump', '| MangaDex', '| Manga Host', '| Ler Mangás', '| Yomu', '| Sakura Mangás'];
    siteSuffixes.forEach(suffix => { if (clean.includes(suffix)) clean = clean.replace(suffix, ''); });
    const chapterPatterns = [/\s*-\s*Capitulo\s*\d+.*/i, /\s*-\s*Chapter\s*\d+.*/i, /\s*-\s*Cap\s*\d+.*/i, /\s*-\s*Ch\s*\d+.*/i, /,\s*Chapter\s*\d+.*/i, /\s*\|\s*.*/];
    chapterPatterns.forEach(pattern => { clean = clean.replace(pattern, ''); });
    clean = clean.replace(/Ler Online/gi, '').replace(/Read Online/gi, '').replace(/Manga/gi, '');
    return clean.trim();
  }

  // Verificar página atual
  async function checkCurrentPage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      currentTab = tab;

      if (!tab || !tab.url) return;

      currentPageSection.style.display = 'block';
      currentUrl.textContent = tab.url;

      // Verificar se é uma página de mangá
      const data = StorageManager.getData();
      const site = data.sites.find(s => tab.url.includes(s.url));

      if (site) {
        // Site já habilitado — verificar se mangá já está na lista
        enableSiteBtn.style.display = 'none';
        
        // 1. Tentar por URL/Slug
        let manga = data.mangas.find(m => {
          if (tab.url.includes(m.url) || m.lastChapterUrl === tab.url) return true;

          try {
            const mParts = new URL(m.url).pathname.split('/').filter(s => s.length > 3);
            return mParts.some(seg => {
              if (seg.match(/^(?:mangas?|obras?|titles?|series|comics?|read|ler|chapters?|caps?|capitulos?|episode)$/i)) return false;
              return tab.url.includes(seg);
            });
          } catch(e) { return false; }
        });

        // 2. Fallback por Título + Hostname (Sincroniza com Background)
        if (!manga && tab.title) {
          const cleanTabTitle = cleanTitle(tab.title);
          const currentHost = new URL(tab.url).hostname;
          
          manga = data.mangas.find(m => {
            try {
              const mHost = new URL(m.url).hostname;
              return mHost === currentHost && m.title.toLowerCase().trim() === cleanTabTitle.toLowerCase().trim();
            } catch(e) { return false; }
          });
        }
        
        if (manga) {
          detectionStatus.textContent = `✓ ${manga.title} - Já está na biblioteca`;
          detectionStatus.style.color = '#48bb78';
          
          const chapterOnUrl = extractChapterFromUrl(tab.url, tab.title);
          if (chapterOnUrl) {
            markAsReadBtn.style.display = 'block';
            
            if (manga.lastChapterRead && (parseFloat(manga.lastChapterRead) >= parseFloat(chapterOnUrl) || manga.lastChapterRead === chapterOnUrl)) {
              markAsReadBtn.className = 'btn btn-success';
              markAsReadBtn.innerHTML = '✓ Capítulo Já Lido';
              markAsReadBtn.style.opacity = '0.7';
            } else {
              markAsReadBtn.className = 'btn btn-info'; 
              markAsReadBtn.innerHTML = '✓ Marcar como Lido';
              markAsReadBtn.style.opacity = '1';
            }
          } else {
             markAsReadBtn.style.display = 'none';
          }
        } else {
          detectionStatus.textContent = `⚠ Site habilitado: ${site.name}`;
          detectionStatus.style.color = '#f6ad55';
          markAsReadBtn.style.display = 'none';
        }
      } else {
        // Site não cadastrado — mostrar botão de habilitar
        detectionStatus.textContent = '🔒 Site não habilitado';
        detectionStatus.style.color = '#cbd5e0';
        enableSiteBtn.style.display = 'block';
      }
    } catch (error) {
      console.error('Erro ao verificar página atual:', error);
    }
  }

  // Função auxiliar para tentar extrair capítulo de URL ou Título
  function extractChapterFromUrl(url, title = '') {
    let chapter = null;

    // 1. Tentar extrair do Título (ex: [#001] MangaPlus)
    if (title) {
      const titleMatch = title.match(/\[#(\d+(?:\.\d+)?)\]/);
      if (titleMatch) return titleMatch[1];
    }

    const patterns = [
      /(?:capitulo|chapter|cap|ch|ler|read|episode|ep|viewer|viewer\/)(?:[-_]?|.*?\/)(\d+(?:[.,]\d+)?)(?:\/|$|\?)/i,
      /\/(\d+(?:[.,]\d+)?)(?:\/|$|\?)/,  // Fallback para último número
      /\?(?:cap|ch(?:apter)?|capitulo)=(\d+(?:[.,]\d+)?)/i,  // Parâmetros de query
      /(?:chapter|read|ler)\/([a-z0-9-]+)(?:\/|$|\?)/i  // Fallback para UUIDs (ex. MangaDex)
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        // Se for um link do mangaplus (viewer/12345), ignore se o ID for muito longo
        if (url.includes('mangaplus') && url.includes('viewer') && match[1].length > 5) continue;

        chapter = match[1].replace(',', '.');  // Normalizar separador decimal
        break;
      }
    }
    return chapter;
  }

  // Event Listeners
  selectFileBtn.addEventListener('click', async () => {
    try {
      const success = await StorageManager.selectFile();
      if (success) {
        await updateUI();
        showNotification('Arquivo configurado com sucesso!');
      }
    } catch (error) {
      showNotification('Erro ao configurar arquivo', true);
    }
  });

  openManagerBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'manager.html' });
  });

  const donatePixPopupBtn = document.getElementById('donatePixPopupBtn');
  let donationPopupHoverShown = false;

  donatePixPopupBtn.addEventListener('mouseenter', () => {
    if (donationPopupHoverShown) return;
    donationPopupHoverShown = true;
    alert('Para proteger sua leitura de sites que caem e links que somem, eu trago ate você o MangaTracker. 📖\n\n' +
      'E para que o projeto continue existindo, ele precisa de energia — e essa energia vem de você!  o que \n' +
	    'É o que chamamos de troca equivalente! \n\n' +
      'Uma doação simbólica de R$5 via PIX é o sacrifício ideal para mantermos essa ferramenta viva e livre e sem anúncios para todos. ⚙️🔥\n\n' +
      'Vamos manter esse projeto de pé juntos? 🙏');
  });

  donatePixPopupBtn.addEventListener('click', () => {
    const confirmMsg = 'Você será redirecionado para pagar R$5 via PIX ao projeto MangaTracker. Deseja continuar?';
    if (confirm(confirmMsg)) {
      window.open('https://nubank.com.br/cobrar/eb2qm/69c29c86-3e66-4a9f-9cee-801db91b8c47', '_blank');
    }
  });

  // Event listener: Habilitar site
  enableSiteBtn.addEventListener('click', async () => {
    try {
      if (!currentTab || !currentTab.url) return;

      const parsedUrl = new URL(currentTab.url);
      const hostname = parsedUrl.hostname.replace(/^www\./, '');
      const origin = `https://*.${hostname}/*`;

      // Solicitar permissão ao usuário
      const granted = await chrome.permissions.request({ origins: [origin] });

      if (!granted) {
        showNotification('Permissão negada pelo usuário.', true);
        return;
      }

      // Pedir nome do site
      const siteName = prompt('Nome do site:', hostname);
      if (!siteName) return;

      // Salvar no storage
      const newSite = await StorageManager.addSite({
        name: siteName,
        url: parsedUrl.origin,
        pattern: ''
      });

      // Registrar script dinâmico via background
      await chrome.runtime.sendMessage({
        action: 'enableSite',
        data: { siteId: newSite.id, origin: origin }
      });

      showNotification(`Site "${siteName}" habilitado com sucesso!`);
      enableSiteBtn.style.display = 'none';
      await checkCurrentPage();
    } catch (error) {
      console.error('Erro ao habilitar site:', error);
      showNotification('Erro ao habilitar site', true);
    }
  });

  addManuallyBtn.addEventListener('click', async () => {
    try {
      if (!currentTab) return;

      const title = prompt('Digite o título do mangá:');
      if (!title) return;

      const data = StorageManager.getData();
      const site = data.sites.find(s => currentTab.url.includes(s.url));

      if (!site) {
        showNotification('Site não cadastrado. Adicione o site primeiro.', true);
        return;
      }

      // Adicionar mangá
      await StorageManager.addManga({
        title: title,
        url: currentTab.url,
        siteId: site.id,
        status: 'vou ler'
      });

      showNotification('Mangá adicionado com sucesso!');
      await checkCurrentPage();
    } catch (error) {
      showNotification('Erro ao adicionar mangá', true);
    }
  });

  markAsReadBtn.addEventListener('click', async () => {
    try {
      if (!currentTab) return;

      const data = StorageManager.getData();
      const manga = data.mangas.find(m => {
        if (currentTab.url.includes(m.url) || m.lastChapterUrl === currentTab.url) return true;

        try {
          const mParts = new URL(m.url).pathname.split('/').filter(s => s.length > 3);
          return mParts.some(seg => {
            if (seg.match(/^(?:mangas?|obras?|titles?|series|comics?|read|ler|chapters?|caps?|capitulos?|episode)$/i)) return false;
            return currentTab.url.includes(seg);
          });
        } catch(e) { return false; }
      });

      if (!manga) return;

      // Tentar extrair número do capítulo da URL com a função que criamos
      let chapter = extractChapterFromUrl(currentTab.url);

      // Se não conseguiu extrair, pedir ao usuário
      if (!chapter) {
        chapter = prompt('Coloque o número do capítulo que você leu (ex: 46 ou 46.5):');
        if (!chapter) {
          showNotification('Operação cancelada', true);
          return;
        }
        chapter = chapter.trim();
      }

      // Validar se é um número válido
      if (isNaN(parseFloat(chapter))) {
        showNotification('Número de capítulo inválido', true);
        return;
      }

      // Atualizar mangá
      const updates = {
        lastChapterRead: chapter,
        lastChapterUrl: currentTab.url,
        lastReadAt: new Date().toISOString()
      };

      if (!manga.status || manga.status === 'vou ler') {
        updates.status = 'lendo';
      }

      await StorageManager.updateManga(manga.id, updates);

      // Adicionar ao histórico
      await StorageManager.addToHistory({
        mangaId: manga.id,
        title: manga.title,
        chapter: chapter,
        url: currentTab.url
      });

      showNotification(`Capítulo ${chapter} marcado como lido!`);
    } catch (error) {
      showNotification('Erro ao marcar como lido', true);
    }
  });

  // Função auxiliar para mostrar notificações
  function showNotification(message, isError = false) {
    const color = isError ? '#f56565' : '#48bb78';
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: ${color};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 13px;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Event listeners para modal de ajuda
  helpBtn.addEventListener('click', () => {
    helpModal.style.display = 'block';
  });

  closeHelpBtn.addEventListener('click', () => {
    helpModal.style.display = 'none';
  });

  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
      helpModal.style.display = 'none';
    }
  });

  // Assinatura e versão dinâmicas
  const appSignatures = document.querySelectorAll('.app-signature');
  appSignatures.forEach(signature => {
    if (signature) {
      signature.textContent = `${APP_SIGNATURE} v${APP_VERSION}`;
    }
  });
});

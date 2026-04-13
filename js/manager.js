// Manager script - Manga Tracker Personal Library Journal
document.addEventListener('DOMContentLoaded', async () => {
  // Assinatura e versão dinâmicas imediatas
  const appSignatures = document.querySelectorAll('.app-signature');
  appSignatures.forEach(signature => {
    if (signature) {
      signature.textContent = `${APP_SIGNATURE} v${APP_VERSION}`;
    }
  });

  // Elementos das tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // Elementos gerais
  const exportDataBtn = document.getElementById('exportDataBtn');
  const importDataBtn = document.getElementById('importDataBtn');
  const importFileInput = document.getElementById('importFileInput');
  const helpBtn = document.getElementById('helpBtn');
  const helpModal = document.getElementById('helpModal');
  const closeHelpBtn = document.getElementById('closeHelpBtn');

  // Elementos da tab Mangás
  const searchMangaInput = document.getElementById('searchMangaInput');
  const mangasList = document.getElementById('mangasList');
  const addMangaBtn = document.getElementById('addMangaBtn');

  // Filtros de Mangás
  const statusFilter = document.getElementById('statusFilter');
  const periodFilter = document.getElementById('periodFilter');
  const startDateFilter = document.getElementById('startDateFilter');
  const endDateFilter = document.getElementById('endDateFilter');
  const dateRangeGroup = document.getElementById('dateRangeGroup');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');

  // Elementos da tab Sites
  const addSiteBtn = document.getElementById('addSiteBtn');
  const sitesList = document.getElementById('sitesList');
  const addSiteModal = document.getElementById('addSiteModal');
  const siteNameInput = document.getElementById('siteNameInput');
  const siteUrlInput = document.getElementById('siteUrlInput');
  const sitePatternInput = document.getElementById('sitePatternInput');
  const saveSiteBtn = document.getElementById('saveSiteBtn');
  const cancelSiteBtn = document.getElementById('cancelSiteBtn');

  // Elementos da tab Histórico
  const historyPeriodFilter = document.getElementById('historyPeriodFilter');
  const historyStartDate = document.getElementById('historyStartDate');
  const historyEndDate = document.getElementById('historyEndDate');
  const historyDateRangeGroup = document.getElementById('historyDateRangeGroup');
  const clearHistoryFiltersBtn = document.getElementById('clearHistoryFiltersBtn');
  const historyList = document.getElementById('historyList');

  // Elementos da tab Configurações
  const autoDetectCheckbox = document.getElementById('autoDetectCheckbox');
  const currentFileName = document.getElementById('currentFileName');
  const selectFileBtn = document.getElementById('selectFileBtn');
  const clearAllDataBtn = document.getElementById('clearAllDataBtn');

  // Modals
  const addMangaModal = document.getElementById('addMangaModal');
  const mangaTitleInput = document.getElementById('mangaTitleInput');
  const mangaUrlInput = document.getElementById('mangaUrlInput');
  const mangaSiteSelect = document.getElementById('mangaSiteSelect');
  const saveMangaBtn = document.getElementById('saveMangaBtn');
  const cancelMangaBtn = document.getElementById('cancelMangaBtn');

  // Modal de editar título
  const editTitleModal = document.getElementById('editTitleModal');
  const editTitleInput = document.getElementById('editTitleInput');
  const saveTitleBtn = document.getElementById('saveTitleBtn');
  const cancelTitleBtn = document.getElementById('cancelTitleBtn');

  let editingMangaId = null;

  console.log('Manager: Elementos carregados');

  // Inicializar
  await init();

  async function init() {
    console.log('Manager: Iniciando...');
    await StorageManager.init();
    console.log('Manager: Storage inicializado');
    await loadAllData();
    console.log('Manager: Dados carregados');
    setupEventListeners();
    console.log('Manager: Event listeners configurados');
    loadSettings();
    console.log('Manager: Inicialização completa');
  }

  // Carregar todos os dados
  async function loadAllData() {
    console.log('Manager: Carregando todos os dados...');
    await loadMangas();
    console.log('Manager: Mangás carregados');
    await loadSites();
    console.log('Manager: Sites carregados');
    await loadHistory();
    console.log('Manager: Histórico carregado');
    await updateFileName();
    console.log('Manager: Nome do arquivo atualizado');
    await loadStatistics();
    console.log('Manager: Estatísticas carregadas');
  }

  // Configurar event listeners
  function setupEventListeners() {
    // Tabs
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        switchTab(tabName);
      });
    });

    // Ações gerais
    exportDataBtn.addEventListener('click', exportData);
    importDataBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', importData);

    // Mangás
    searchMangaInput.addEventListener('input', filterMangas);
    addMangaBtn.addEventListener('click', () => openModal(addMangaModal));

    // Sites
    addSiteBtn.addEventListener('click', () => openModal(addSiteModal));
    saveSiteBtn.addEventListener('click', saveSite);
    cancelSiteBtn.addEventListener('click', () => closeModal(addSiteModal));

    // Filtros de Sites
    window.currentSiteFilter = 'all';
    document.querySelectorAll('.site-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.site-filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        window.currentSiteFilter = e.target.dataset.filter;
        loadSites();
      });
    });

    // Histórico
    // historyFilter.addEventListener('change', loadHistory); // Removido - agora usa historyPeriodFilter

    // Configurações e Backup
    autoDetectCheckbox.addEventListener('change', saveSettings);
    selectFileBtn.addEventListener('click', selectFile);
    clearAllDataBtn.addEventListener('click', clearAllData);
    
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    const exportXmlBtn = document.getElementById('exportXmlBtn');
    const importBackupBtn = document.getElementById('importBackupBtn');
    const importBackupInput = document.getElementById('importBackupInput');

    exportJsonBtn?.addEventListener('click', () => {
      const dataStr = StorageManager.exportData();
      downloadStringAsFile(dataStr, `MangaTracker_Backup_${new Date().toISOString().slice(0,10)}.json`, 'application/json');
    });

    exportXmlBtn?.addEventListener('click', () => {
      const dataStr = StorageManager.exportToXML();
      downloadStringAsFile(dataStr, `MangaTracker_Backup_${new Date().toISOString().slice(0,10)}.xml`, 'application/xml');
    });

    importBackupBtn?.addEventListener('click', () => {
      importBackupInput.click();
    });

    importBackupInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target.result;
        let success = false;
        if (file.name.endsWith('.xml')) {
           success = await StorageManager.importFromXML(content);
        } else {
           success = await StorageManager.importData(content);
        }

        if (success) {
          showNotification('Backup restaurado com sucesso!');
          location.reload(); // Recarrega para popular todas as abas perfeitamente
        } else {
          showNotification('Falha ao restaurar backup. Verifique o formato.', true);
        }
      };
      reader.readAsText(file);
      importBackupInput.value = '';
    });

    const donatePixManagerBtn = document.getElementById('donatePixManagerBtn');
    let donationManagerHoverShown = false;
    donatePixManagerBtn?.addEventListener('mouseenter', () => {
      if (donationManagerHoverShown) return;
      donationManagerHoverShown = true;
      alert('Para proteger sua leitura de sites que caem e links que somem, eu trago ate você o MangaTracker. 📖\n\n' +
      'E para que o projeto continue existindo, ele precisa de energia — e essa energia vem de você!  o que \n' +
	    'É o que chamamos de troca equivalente! \n\n' +
      'Uma doação simbólica de R$5 via PIX é o sacrifício ideal para mantermos essa ferramenta viva e livre e sem anúncios para todos. ⚙️🔥\n\n' +
      'Vamos manter esse projeto de pé juntos? 🙏');
    });
    donatePixManagerBtn?.addEventListener('click', () => {
      const confirmMsg = 'Você será redirecionado para pagar R$5 via PIX ao projeto MangaTracker. Deseja continuar?';
      if (confirm(confirmMsg)) {
        window.open('https://nubank.com.br/cobrar/eb2qm/69c29c86-3e66-4a9f-9cee-801db91b8c47', '_blank');
      }
    });

    // Modal de adicionar mangá

    // Modal de adicionar mangá
    saveMangaBtn.addEventListener('click', saveManga);
    cancelMangaBtn.addEventListener('click', () => closeModal(addMangaModal));

    // Modal de editar título
    saveTitleBtn.addEventListener('click', saveTitle);
    cancelTitleBtn.addEventListener('click', () => closeModal(editTitleModal));

    // Fechar modais ao clicar no X
    document.querySelectorAll('.close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        closeModal(btn.closest('.modal'));
      });
    });

    // Fechar modais ao clicar fora
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    });
  }

  // Trocar tab
  async function switchTab(tabName) {
    tabBtns.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    const activeContent = document.getElementById(`${tabName}Tab`);

    if (activeBtn) activeBtn.classList.add('active');
    if (activeContent) activeContent.classList.add('active');

    // Re-carregar dados ao trocar de aba para manter tudo sincronizado sem F5
    console.log(`Manager: Trocando para aba ${tabName}, recarregando dados...`);
    await StorageManager.loadData();
    await loadAllData();
  }

  // ===== MANGÁS =====
  async function loadMangas(filter = '') {
    console.log('Manager: Carregando mangás...');
    const data = StorageManager.getData();
    console.log('Manager: Dados do storage:', data);
    let mangas = data.mangas;

    // Aplicar filtro de busca por texto
    if (filter) {
      mangas = mangas.filter(m => 
        m.title.toLowerCase().includes(filter.toLowerCase())
      );
    }

    // Aplicar filtro de status (lido/não lido)
    const statusFilterValue = statusFilter.value;
    if (statusFilterValue === 'read') {
      mangas = mangas.filter(m => m.lastChapterRead);
    } else if (statusFilterValue === 'unread') {
      mangas = mangas.filter(m => !m.lastChapterRead);
    }

    // Aplicar filtro de período
    const periodFilterValue = periodFilter.value;
    if (periodFilterValue !== 'all') {
      const now = new Date();
      let startDate, endDate;

      if (periodFilterValue === 'custom') {
        startDate = startDateFilter.value ? new Date(startDateFilter.value) : null;
        endDate = endDateFilter.value ? new Date(endDateFilter.value) : null;
      } else {
        if (periodFilterValue === 'today') {
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        } else if (periodFilterValue === 'week') {
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          endDate = now;
        } else if (periodFilterValue === 'month') {
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          endDate = now;
        }
      }

      if (startDate || endDate) {
        mangas = mangas.filter(manga => {
          if (!manga.lastReadAt) return false;
          const readDate = new Date(manga.lastReadAt);
          if (startDate && readDate < startDate) return false;
          if (endDate && readDate > endDate) return false;
          return true;
        });
      }
    }

    if (mangas.length === 0) {
      mangasList.textContent = '';
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Nenhum mangá encontrado.';
      mangasList.appendChild(empty);
      return;
    }

    mangasList.textContent = '';
    mangas.forEach(manga => {
      const mangaCard = document.createElement('div');
      mangaCard.className = 'manga-card';
      mangaCard.dataset.id = manga.id;

      const mangaHeader = document.createElement('div');
      mangaHeader.className = 'manga-header';
      const title = document.createElement('h3');
      title.className = 'manga-title';
      title.textContent = manga.title;
      
      const site = data.sites.find(s => s.id === manga.siteId);
      const siteTag = document.createElement('span');
      siteTag.className = 'manga-site';
      siteTag.textContent = site ? site.name : 'Desconhecido';
      
      mangaHeader.append(title, siteTag);

      const mangaInfo = document.createElement('div');
      mangaInfo.className = 'manga-info';

      const urlInfo = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = 'URL:';
      urlInfo.appendChild(strong);
      urlInfo.appendChild(document.createTextNode(' '));
      
      const urlText = document.createElement('span');
      urlText.style.fontSize = '11px';
      urlText.style.color = '#888';
      urlText.style.wordBreak = 'break-all';
      urlText.textContent = manga.url || 'URL inválida';
      urlInfo.appendChild(urlText);
      mangaInfo.appendChild(urlInfo);

      const lastChapter = document.createElement('p');
      if (manga.lastChapterRead) {
        lastChapter.innerHTML = '<strong>Último capítulo lido:</strong> ' + escapeHtml(manga.lastChapterRead);
      } else {
        lastChapter.className = 'info-missing';
        lastChapter.innerHTML = '<strong>Último capítulo lido:</strong> Não informado';
      }
      mangaInfo.appendChild(lastChapter);

      if (manga.lastReadAt) {
        const lastRead = document.createElement('p');
        lastRead.innerHTML = '<strong>Última leitura:</strong> ' + escapeHtml(formatDate(manga.lastReadAt));
        mangaInfo.appendChild(lastRead);
      }

      const mangaActions = document.createElement('div');
      mangaActions.className = 'manga-actions';

      const openBtn = document.createElement('button');
      openBtn.className = 'btn btn-primary btn-view';
      openBtn.dataset.id = manga.id;
      openBtn.textContent = 'Abrir';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-secondary btn-edit-title';
      editBtn.dataset.id = manga.id;
      editBtn.textContent = 'Editar Título';

      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn btn-danger btn-remove';
      removeBtn.dataset.id = manga.id;
      removeBtn.textContent = 'Remover';

      mangaActions.append(openBtn, editBtn, removeBtn);

      mangaCard.append(mangaHeader, mangaInfo, mangaActions);
      mangasList.appendChild(mangaCard);
    });

    // Event listeners para ações dos mangás
    mangasList.querySelectorAll('.btn-view').forEach(btn => {
      btn.addEventListener('click', () => viewManga(btn.dataset.id));
    });

    mangasList.querySelectorAll('.btn-edit-title').forEach(btn => {
      btn.addEventListener('click', () => openEditTitleModal(btn.dataset.id));
    });

    mangasList.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', () => removeManga(btn.dataset.id));
    });
  }

  function filterMangas() {
    loadMangas(searchMangaInput.value);
  }

  function renderMangas() {
    loadMangas(searchMangaInput.value);
  }

  function viewManga(mangaId) {
    const data = StorageManager.getData();
    const manga = data.mangas.find(m => m.id === mangaId);
    if (manga) {
      if (!isSafeUrl(manga.url)) {
        showNotification('URL inválida ou insegura: ' + manga.url, true);
        return;
      }
      window.open(manga.url, '_blank', 'noopener');
    }
  }

  async function checkMangaUpdates(mangaId) {
    const data = StorageManager.getData();
    const manga = data.mangas.find(m => m.id === mangaId);
    if (!manga) {
      showNotification('Mangá não encontrado!', true);
      return;
    }

    console.log('checkMangaUpdates: Iniciando para', manga.title, manga.url);
    showNotification('Verificando atualizações...');

    try {
      // Buscar a página do mangá
      if (!isSafeUrl(manga.url)) {
      showNotification('URL inválida ou insegura: ' + manga.url, true);
      return;
    }

      const response = await fetch(manga.url, { method: 'GET', mode: 'cors' });
      console.log('checkMangaUpdates: resposta HTTP', response.status);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Procurar por links de capítulos
      const chapterLinks = doc.querySelectorAll('a[href]');
      const chapterNumbers = [];

      chapterLinks.forEach(link => {
        const href = link.href;
        const url = new URL(href, manga.url); // Resolver URL relativa

        // Padrões comuns para capítulos
        const patterns = [
          /(?:capitulo|chapter|cap|ch|ler|read|episode|ep)(?:[-_]?|.*?\/)(\d+(?:\.\d+)?)(?:\/|$|\?)/i,
          /\/(\d+(?:\.\d+)?)(?:\/|$)/  // Para URLs como /123/
        ];

        for (const pattern of patterns) {
          const match = url.pathname.match(pattern);
          if (match) {
            const num = parseFloat(match[1]);
            if (!isNaN(num)) {
              chapterNumbers.push(num);
            }
          }
        }
      });

      console.log('checkMangaUpdates: capítulos detectados', chapterNumbers);

      if (chapterNumbers.length === 0) {
        showNotification('Nenhum capítulo encontrado na página.', true);
        return;
      }

      // Encontrar o capítulo mais alto
      const latestChapter = Math.max(...chapterNumbers);
      const previousLatest = manga.latestChapter || 0;
      const lastRead = parseFloat(manga.lastChapterRead) || 0;

      // Atualizar latestChapter
      await StorageManager.updateManga(mangaId, { latestChapter });

      // Calcular novos capítulos
      const newChapters = latestChapter - lastRead;
      const newSinceLastCheck = latestChapter - previousLatest;

      if (newChapters > 0) {
        showNotification(`Encontrados ${newChapters} novos capítulos! (até ${latestChapter})`);
      } else if (newSinceLastCheck > 0) {
        showNotification(`Atualização: capítulo ${latestChapter} disponível.`);
      } else {
        showNotification('Nenhuma atualização encontrada.');
      }

      // Recarregar lista para mostrar atualização
      await loadMangas(searchMangaInput.value);

    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
      showNotification('Erro ao verificar atualizações. Tente novamente.', true);
    }
  }

  async function removeManga(mangaId) {
    if (!confirm('Tem certeza que deseja remover este mangá?')) return;
    
    await StorageManager.removeManga(mangaId);
    await loadMangas();
    showNotification('Mangá removido!');
  }

  function openEditTitleModal(mangaId) {
    const data = StorageManager.getData();
    const manga = data.mangas.find(m => m.id === mangaId);
    if (!manga) return;

    editingMangaId = mangaId;
    editTitleInput.value = manga.title;
    openModal(editTitleModal);
  }

  async function saveTitle() {
    if (!editingMangaId) return;

    const newTitle = editTitleInput.value.trim();
    if (!newTitle) {
      showNotification('Digite um título válido!', true);
      return;
    }

    await StorageManager.updateManga(editingMangaId, { title: newTitle });
    closeModal(editTitleModal);
    await loadMangas();
    showNotification('Título atualizado com sucesso!');
    editingMangaId = null;
  }

  function openEditMangaModal(mangaId) {

    editingMangaId = mangaId;
    editMangaTitleInput.value = manga.title;
    editMangaUrlInput.value = manga.url;
    editLastChapterReadInput.value = manga.lastChapterRead || '';
    editLatestChapterInput.value = manga.latestChapter || '';
    
    openModal(editMangaModal);
  }

  async function saveEditManga() {
    if (!editingMangaId) return;

    const lastChapterRead = editLastChapterReadInput.value.trim();
    const latestChapter = editLatestChapterInput.value.trim();

    // Validar se valores são números válidos
    if (lastChapterRead && isNaN(parseFloat(lastChapterRead))) {
      showNotification('Último capítulo lido deve ser um número válido!', true);
      return;
    }

    if (latestChapter && isNaN(parseFloat(latestChapter))) {
      showNotification('Capítulo mais recente deve ser um número válido!', true);
      return;
    }

    // Preparar objeto de atualização
    const updates = {};
    if (lastChapterRead) {
      updates.lastChapterRead = parseFloat(lastChapterRead);
    }
    if (latestChapter) {
      updates.latestChapter = parseFloat(latestChapter);
    }

    if (Object.keys(updates).length === 0) {
      showNotification('Preencha pelo menos um campo!', true);
      return;
    }

    await StorageManager.updateManga(editingMangaId, updates);
    closeModal(editMangaModal);
    await loadMangas(searchMangaInput.value);
    showNotification('Mangá atualizado com sucesso!');
    editingMangaId = null;
  }

  async function saveManga() {
    const title = mangaTitleInput.value.trim();
    const url = mangaUrlInput.value.trim();
    const siteId = mangaSiteSelect.value;

    if (!title || !url || !siteId) {
      showNotification('Preencha todos os campos!', true);
      return;
    }

    await StorageManager.addManga({ title, url, siteId });
    closeModal(addMangaModal);
    await loadMangas();
    showNotification('Mangá adicionado!');
    
    // Limpar form
    mangaTitleInput.value = '';
    mangaUrlInput.value = '';
    mangaSiteSelect.value = '';
  }

  // ===== SITES =====
  async function loadSites() {
    const data = StorageManager.getData();
    let sites = data.sites;

    // Atualizar select de sites no modal de mangás
    mangaSiteSelect.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Selecione um site';
    mangaSiteSelect.appendChild(defaultOption);

    data.sites.forEach(site => {
      const option = document.createElement('option');
      option.value = site.id;
      option.textContent = site.name;
      mangaSiteSelect.appendChild(option);
    });

    // Filtros
    if (window.currentSiteFilter === 'native') sites = sites.filter(s => s.isNative);
    if (window.currentSiteFilter === 'custom') sites = sites.filter(s => !s.isNative);
    if (window.currentSiteFilter === 'favorites') sites = sites.filter(s => s.isFavorite);

    // Ordenar (Favoritos primeiro, depois por nome)
    sites.sort((a,b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0) || a.name.localeCompare(b.name));

    if (sites.length === 0) {
      sitesList.textContent = '';
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Nenhum site encontrado para o filtro atual.';
      sitesList.appendChild(empty);
      return;
    }

    sitesList.textContent = '';
    sites.forEach(site => {
      const siteCard = document.createElement('div');
      siteCard.className = 'site-card';
      siteCard.dataset.id = site.id;
      if (site.isNative) siteCard.style.borderLeft = '4px solid #667eea';

      const siteInfo = document.createElement('div');
      siteInfo.className = 'site-info';

      const heading = document.createElement('h3');
      heading.textContent = site.name + (site.isNative ? ' (Oficial)' : '');
      siteInfo.appendChild(heading);

      const url = document.createElement('p');
      const link = document.createElement('a');
      link.href = site.home || (site.url.startsWith('http') ? site.url : `https://${site.url}`);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = site.url;
      link.style.color = '#4299e1';
      link.style.textDecoration = 'none';
      
      link.addEventListener('mouseover', () => link.style.textDecoration = 'underline');
      link.addEventListener('mouseout', () => link.style.textDecoration = 'none');
      
      url.appendChild(link);
      siteInfo.appendChild(url);

      if (site.pattern) {
        const pattern = document.createElement('p');
        const small = document.createElement('small');
        small.textContent = `Padrão: ${site.pattern}`;
        pattern.appendChild(small);
        siteInfo.appendChild(pattern);
      }

      siteCard.appendChild(siteInfo);

      const siteActions = document.createElement('div');
      siteActions.className = 'site-actions';

      // Favorite btn
      const favBtn = document.createElement('button');
      favBtn.className = 'btn btn-secondary btn-fav-site';
      favBtn.dataset.id = site.id;
      favBtn.textContent = site.isFavorite ? '⭐' : '☆';
      siteActions.appendChild(favBtn);

      if (site.isNative) {
        // Toggle btn para nativos
        const toggleBtn = document.createElement('button');
        toggleBtn.className = site.isActive ? 'btn btn-primary btn-toggle-site' : 'btn btn-secondary btn-toggle-site';
        toggleBtn.dataset.id = site.id;
        toggleBtn.textContent = site.isActive ? 'Desativar Rastreamento' : 'Ativar Rastreamento';
        siteActions.appendChild(toggleBtn);
      } else {
        // Remove btn para sites fechados
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn btn-danger btn-remove-site';
        removeBtn.dataset.id = site.id;
        removeBtn.textContent = 'Remover';
        siteActions.appendChild(removeBtn);
      }

      siteCard.appendChild(siteActions);
      sitesList.appendChild(siteCard);
    });

    // Event listeners
    sitesList.querySelectorAll('.btn-remove-site').forEach(btn => {
      btn.addEventListener('click', () => removeSite(btn.dataset.id));
    });
    
    sitesList.querySelectorAll('.btn-fav-site').forEach(btn => {
      btn.addEventListener('click', async () => {
        const site = data.sites.find(s => s.id === btn.dataset.id);
        await StorageManager.updateSite(site.id, { isFavorite: !site.isFavorite });
        loadSites();
      });
    });

    sitesList.querySelectorAll('.btn-toggle-site').forEach(btn => {
      btn.addEventListener('click', async () => {
        const site = data.sites.find(s => s.id === btn.dataset.id);
        await StorageManager.updateSite(site.id, { isActive: !site.isActive });
        loadSites();
      });
    });
  }

  async function saveSite() {
    const name = siteNameInput.value.trim();
    const url = siteUrlInput.value.trim();
    const pattern = sitePatternInput.value.trim();

    if (!name || !url) {
      showNotification('Preencha o nome e URL do site!', true);
      return;
    }

    try {
      const parsedUrl = new URL(url);
      const origin = `${parsedUrl.protocol}//*.${parsedUrl.hostname.replace(/^www\./, '')}/*`;
      
      const granted = await new Promise(resolve => {
        chrome.permissions.request({
          origins: [origin]
        }, resolve);
      });

      if (!granted) {
        showNotification('Permissão negada! Não foi possível adicionar.', true);
        return;
      }

      const newSite = await StorageManager.addSite({ name, url, pattern });
      
      try {
        await chrome.scripting.registerContentScripts([{
          id: `site_${newSite.id}`,
          js: ["js/content.js"],
          matches: [origin],
          runAt: "document_idle"
        }]);
      } catch(e) {
        console.log('Script dinâmico já registrado ou erro:', e);
      }
    } catch(e) {
      showNotification('URL inválida!', true);
      return;
    }

    closeModal(addSiteModal);
    await loadSites();
    showNotification('Site adicionado com permissões ativas!');

    // Limpar form
    siteNameInput.value = '';
    siteUrlInput.value = '';
    sitePatternInput.value = '';
  }

  async function removeSite(siteId) {
    if (!confirm('Tem certeza que deseja remover este site?')) return;
    
    await StorageManager.removeSite(siteId);
    
    try {
      await chrome.scripting.unregisterContentScripts({ ids: [`site_${siteId}`] });
    } catch(e) { 
      console.log('Erro ao desregistrar script:', e);
    }
    
    await loadSites();
    showNotification('Site removido!');
  }

  // ===== HISTÓRICO =====
  async function loadHistory() {
    const data = StorageManager.getData();
    console.log('loadHistory: dados de histórico brutos', data.history);
    let history = [...data.history];

    // Filtrar por período
    const periodFilterValue = historyPeriodFilter.value;
    const now = new Date();
    
    if (periodFilterValue === 'custom') {
      const startDate = historyStartDate.value ? new Date(historyStartDate.value) : null;
      const endDate = historyEndDate.value ? new Date(historyEndDate.value) : null;
      
      if (startDate || endDate) {
        history = history.filter(h => {
          const readDate = new Date(h.readAt);
          if (startDate && readDate < startDate) return false;
          if (endDate && readDate > endDate) return false;
          return true;
        });
      }
    } else if (periodFilterValue === 'today') {
      const today = now.toDateString();
      history = history.filter(h => new Date(h.readAt).toDateString() === today);
    } else if (periodFilterValue === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      history = history.filter(h => new Date(h.readAt) >= weekAgo);
    } else if (periodFilterValue === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      history = history.filter(h => new Date(h.readAt) >= monthAgo);
    }

    if (history.length === 0) {
      historyList.textContent = '';
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Nenhuma leitura no período selecionado.';
      historyList.appendChild(empty);
      return;
    }

    historyList.textContent = '';
    history.forEach(item => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';

      const historyInfo = document.createElement('div');
      historyInfo.className = 'history-info';

      const title = document.createElement('h4');
      title.textContent = item.title;
      historyInfo.appendChild(title);

      const chapter = document.createElement('p');
      chapter.textContent = `Capítulo: ${item.chapter}`;
      historyInfo.appendChild(chapter);

      const linkP = document.createElement('p');
      const link = document.createElement('a');
      if (isSafeUrl(item.url)) {
        link.href = item.url;
      } else {
        link.href = '#';
      }
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Abrir capítulo';
      linkP.appendChild(link);
      historyInfo.appendChild(linkP);

      historyItem.appendChild(historyInfo);

      const historyDate = document.createElement('div');
      historyDate.className = 'history-date';
      historyDate.textContent = formatDate(item.readAt);
      historyItem.appendChild(historyDate);

      historyList.appendChild(historyItem);
    });
  }

  function renderHistory() {
    loadHistory();
  }

  // ===== ESTATÍSTICAS =====
  async function loadStatistics() {
    console.log('Manager: Carregando estatísticas...');
    const data = StorageManager.getData();
    const history = data.history || [];
    const mangas = data.mangas || [];

    // 1. Total de Mangás
    document.getElementById('totalMangasCount').textContent = mangas.length;

    // 2. Leituras (Diário, Semanal, Semana Anterior, Total)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Início da semana (Segunda-feira)
    const dayOfWeek = now.getDay();
    const diffToMonday = now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    const startOfThisWeek = new Date(now.getFullYear(), now.getMonth(), diffToMonday).getTime();
    
    const startOfLastWeek = startOfThisWeek - (7 * 24 * 60 * 60 * 1000);
    const endOfLastWeek = startOfThisWeek - 1;

    let todayCount = 0;
    let weekCount = 0;
    let lastWeekCount = 0;
    
    history.forEach(item => {
      const readAt = new Date(item.readAt).getTime();
      
      if (readAt >= today) todayCount++;
      if (readAt >= startOfThisWeek) weekCount++;
      if (readAt >= startOfLastWeek && readAt <= endOfLastWeek) lastWeekCount++;
    });

    document.getElementById('todayReadsCount').textContent = todayCount;
    document.getElementById('weekReadsCount').textContent = weekCount;
    document.getElementById('lastWeekReadsCount').textContent = lastWeekCount;
    document.getElementById('totalReadsCount').textContent = history.length;

    // 3. Top 10 Mangás Mais Lidos
    const counts = {};
    history.forEach(item => {
      counts[item.title] = (counts[item.title] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const rankingList = document.getElementById('topMangasRanking');
    rankingList.innerHTML = '';

    if (sorted.length === 0) {
      rankingList.innerHTML = '<p class="empty-state">Sem dados de leitura.</p>';
    } else {
      sorted.forEach(([title, count], index) => {
        const item = document.createElement('div');
        item.className = 'ranking-item';
        
        // Calcular porcentagem para a barra de progresso (baseado no #1)
        const maxCount = sorted[0][1];
        const percent = (count / maxCount) * 100;

        item.innerHTML = `
          <div class="ranking-info">
            <span class="ranking-pos">${index + 1}º</span>
            <span class="ranking-title">${title}</span>
            <span class="ranking-count">${count} <small>leituras</small></span>
          </div>
          <div class="ranking-bar-container">
            <div class="ranking-bar" style="width: ${percent}%"></div>
          </div>
        `;
        rankingList.appendChild(item);
      });
    }
  }

  // ===== CONFIGURAÇÕES =====
  function loadSettings() {
    const data = StorageManager.getData();
    const settings = data.settings;

    autoDetectCheckbox.checked = settings.autoDetect;
  }

  async function saveSettings() {
    const settings = {
      autoDetect: autoDetectCheckbox.checked
    };

    await StorageManager.updateSettings(settings);
    showNotification('Configurações salvas!');
  }

  async function selectFile() {
    const success = await StorageManager.selectFile();
    if (success) {
      await updateFileName();
      showNotification('Arquivo configurado!');
    }
  }

  async function updateFileName() {
    const fileName = await StorageManager.getFileName();
    currentFileName.textContent = fileName;
  }

  async function clearAllData() {
    if (!confirm('ATENÇÃO: Isso irá remover TODOS os dados (mangás, sites, histórico). Esta ação é irreversível. Deseja continuar?')) {
      return;
    }

    if (!confirm('Tem certeza absoluta? Digite SIM para confirmar:') || 
        prompt('Digite SIM em maiúsculas:') !== 'SIM') {
      return;
    }

    await StorageManager.clearAllData();
    await loadAllData();
    showNotification('Todos os dados foram removidos!');
  }

  // ===== EXPORTAR/IMPORTAR =====
  function exportData() {
    const data = StorageManager.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manga-tracker-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Dados exportados!');
  }

  async function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const success = await StorageManager.importData(text);
      
      if (success) {
        await loadAllData();
        showNotification('Dados importados com sucesso!');
      } else {
        showNotification('Erro ao importar dados!', true);
      }
    } catch (error) {
      showNotification('Erro ao ler arquivo!', true);
    }

    importFileInput.value = '';
  }

  // ===== UTILITÁRIOS =====
  function openModal(modal) {
    modal.classList.add('active');
  }

  function closeModal(modal) {
    modal.classList.remove('active');
  }

  function showNotification(message, isError = false) {
    const color = isError ? '#f56565' : '#48bb78';
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${color};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function downloadStringAsFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function isSafeUrl(url) {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch (e) {
      return false;
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Inicializar animações CSS
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

  // Event listeners para filtros de mangás
  statusFilter.addEventListener('change', () => renderMangas());
  periodFilter.addEventListener('change', () => {
    const isCustom = periodFilter.value === 'custom';
    dateRangeGroup.style.display = isCustom ? 'flex' : 'none';
    renderMangas();
  });
  startDateFilter.addEventListener('change', () => renderMangas());
  endDateFilter.addEventListener('change', () => renderMangas());
  clearFiltersBtn.addEventListener('click', () => {
    statusFilter.value = 'all';
    periodFilter.value = 'all';
    startDateFilter.value = '';
    endDateFilter.value = '';
    dateRangeGroup.style.display = 'none';
    renderMangas();
  });

  // Event listeners para filtros de histórico
  historyPeriodFilter.addEventListener('change', () => {
    const isCustom = historyPeriodFilter.value === 'custom';
    historyDateRangeGroup.style.display = isCustom ? 'flex' : 'none';
    renderHistory();
  });
  historyStartDate.addEventListener('change', () => renderHistory());
  historyEndDate.addEventListener('change', () => renderHistory());
  clearHistoryFiltersBtn.addEventListener('click', () => {
    historyPeriodFilter.value = 'all';
    historyStartDate.value = '';
    historyEndDate.value = '';
    historyDateRangeGroup.style.display = 'none';
    renderHistory();
  });

  // Event listeners para modal de ajuda
  helpBtn.addEventListener('click', () => {
    openModal(helpModal);
  });

  closeHelpBtn.addEventListener('click', () => {
    closeModal(helpModal);
  });

  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
      closeModal(helpModal);
    }
  });
});

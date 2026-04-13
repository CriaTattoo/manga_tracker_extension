# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [3.0.1] - 2026-04-13

### Adicionado
- **Manga Tracker CARD**: Nova funcionalidade premium para exportar estatísticas em formato de card colecionável (Super Trunfo).
- Geração de imagem PNG de alta resolução via Canvas API.
- Personalização de nome do leitor para o card.
- Logotipo oficial integrado no cabeçalho dos cards exportados.

### Modificado
- Atualização da identidade visual para a versão 3.0.1 "Aparência Premium".
- Melhoria no layout do Gerenciador com novos botões e gradientes.

## [1.0.0] - 2026-03-18

### Adicionado

#### Estrutura Core
- Manifest V3 configurado corretamente
- Sistema de armazenamento local usando Chrome Storage API
- Módulo `storage.js` para gerenciamento centralizado de dados

#### Interface do Usuário
- **Popup** (popup.html/css/js):
  - Ações rápidas e status do mangá atual
  - Botão para selecionar arquivo de dados
  - Estatísticas resumidas (total de mangás, sites, leituras)
  - Botão para marcar capítulo como lido
  - Botão para verificar atualizações
  - Acesso rápido ao gerenciador completo

- **Gerenciador** (manager.html/css/js):
  - Interface completa com 4 abas (Mangás, Sites, Histórico, Configurações)
  - Lista de mangás com busca/filtro
  - Gerenciamento de sites de leitura
  - Histórico de leitura com filtros por data
  - Configurações personalizadas
  - Modais para adicionar sites e mangás
  - Funções de exportar/importar dados

#### Funcionalidades Principais
- **Detecção Automática** (content.js):
  - Detecta automaticamente páginas de mangá ao navegar
  - Padrões de URL comuns (/manga/, /chapter/, etc.)
  - Detecção por palavras-chave
  - Extração automática de título e capítulo
  - Notificações in-page estilizadas
  - Suporte a SPAs (Single Page Applications)

- **Background Service Worker** (background.js):
  - Verificações periódicas com Chrome Alarms API
  - Sistema de notificações nativas do navegador
  - Processamento de mensagens entre componentes
  - Inicialização automática do storage
  - Gerenciamento de intervalo de verificação configurável

#### Gerenciamento de Dados
- Adicionar/remover sites de leitura
- Adicionar/remover mangás
- Marcar capítulos como lidos
- Histórico detalhado de leitura
- Exportar dados para JSON
- Importar dados de JSON
- Limpar todos os dados

#### Configurações
- Ativar/desativar detecção automática
- Ativar/desativar notificações
- Configurar intervalo de verificação (15-1440 minutos)

#### Design e UX
- Interface moderna com gradientes roxos
- Design responsivo e limpo
- Animações suaves (slide in/out)
- Ícones personalizados em 3 tamanhos (16x16, 48x48, 128x128)
- Feedback visual para todas as ações
- Modais elegantes para entrada de dados
- Estatísticas visuais

#### Segurança e Privacidade
- Armazenamento 100% local
- Sem comunicação com servidores externos
- Permissões mínimas necessárias
- Código aberto e auditável

#### Documentação
- README.md completo com instruções detalhadas
- INSTALL.md com guia rápido de instalação
- CHANGELOG.md para rastreamento de versões
- Comentários inline no código
- Estrutura de dados documentada

### Estrutura Técnica

#### Arquivos
- `manifest.json`: Configuração Manifest V3
- `popup.html/css/js`: Interface do popup
- `manager.html/css/js`: Interface do gerenciador
- `js/storage.js`: Módulo de armazenamento
- `js/content.js`: Script de conteúdo
- `js/background.js`: Service worker
- `icons/*`: Ícones da extensão
- `.gitignore`: Configuração do Git

#### Tecnologias
- JavaScript Vanilla (sem dependências)
- Chrome Extension APIs:
  - Storage API
  - Notifications API
  - Alarms API
  - Tabs API
  - Runtime API
- CSS3 com animações e gradientes
- HTML5 semântico

### Notas de Desenvolvimento

#### Limitações Conhecidas
- Verificação de novos capítulos requer implementação específica por site
- Detecção automática pode não funcionar em todos os sites
- File System Access API não funciona em service workers (usando Chrome Storage)

#### Próximas Versões Planejadas
- Implementar web scraping real para verificação de capítulos
- Adicionar sincronização com nuvem
- Sites pré-configurados populares
- Estatísticas avançadas
- Sistema de categorias e tags
- Modo escuro
- Suporte multilingual

---

**Legenda:**
- `Adicionado`: Novas funcionalidades
- `Modificado`: Alterações em funcionalidades existentes
- `Depreciado`: Funcionalidades que serão removidas
- `Removido`: Funcionalidades removidas
- `Corrigido`: Correções de bugs
- `Segurança`: Correções de vulnerabilidades

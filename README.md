# 📚 Manga Tracker - Extensão para Chrome

Uma extensão completa para gerenciamento de leitura de mangás no navegador Chrome (e outros navegadores baseados em Chromium).

## ✨ Funcionalidades

- 🔍 **Detecção Automática**: Detecta automaticamente quando você visita páginas de mangás
- 📝 **Gerenciamento Completo**: Adicione mangás, sites e gerencie sua lista de leitura
- ⏱️ **Histórico de Leitura**: Mantenha registro de todos os capítulos que você leu
- 🔔 **Notificações**: Receba alertas sobre novos capítulos disponíveis
- 💾 **Armazenamento Local**: Todos os dados são salvos localmente no seu navegador
- 📤 **Exportar/Importar**: Faça backup dos seus dados em formato JSON
- 🎯 **Marcar como Lido**: Marque capítulos como lidos automaticamente
- 🔄 **Verificação de Atualizações**: Botão para verificar novos capítulos
- 🌐 **Múltiplos Sites**: Compare mangás entre diferentes sites de leitura

## 📦 Instalação

### Método 1: Instalação Manual (Desenvolvimento)

1. **Clone ou baixe este repositório**
   ```bash
   git clone <url-do-repositorio>
   cd manga_tracker_extension
   ```

2. **Abra o Chrome e acesse as extensões**
   - Digite `chrome://extensions/` na barra de endereços
   - Ou vá em Menu → Mais ferramentas → Extensões

3. **Ative o Modo de Desenvolvedor**
   - No canto superior direito, ative a chave "Modo de desenvolvedor"

4. **Carregue a extensão**
   - Clique em "Carregar sem compactação"
   - Selecione a pasta `manga_tracker_extension`

5. **Pronto!**
   - O ícone da extensão aparecerá na barra de ferramentas
   - Clique nele para começar a usar

### Método 2: Instalação via .crx (Futuro)

_Em desenvolvimento: futuramente a extensão poderá ser instalada diretamente da Chrome Web Store._

## 🚀 Como Usar

### Primeira Configuração

1. **Clique no ícone da extensão** na barra de ferramentas
2. **Clique em "Selecionar Arquivo"** para configurar o armazenamento de dados
3. **Clique em "⚙️ Abrir Gerenciador"** para acessar a página completa

### Adicionando Sites

1. Abra o **Gerenciador** (botão na popup ou clique com botão direito → Gerenciador)
2. Vá para a aba **"Sites"**
3. Clique em **"+ Adicionar Site"**
4. Preencha:
   - **Nome do Site**: Ex: "MangaLivre"
   - **URL do Site**: Ex: "https://mangalivre.to"
   - **Padrão de URL** (opcional): Ex: "/manga/"
5. Clique em **"Salvar"**

### Adicionando Mangás

#### Método 1: Detecção Automática
1. Navegue até um site de mangá cadastrado
2. A extensão detectará automaticamente
3. Uma notificação aparecerá na página
4. Clique no ícone da extensão e em "➕ Adicionar Manualmente"

#### Método 2: Manual
1. Abra o **Gerenciador**
2. Vá para a aba **"Mangás"**
3. Clique em **"+ Adicionar Mangá"** (no modal que aparece ao adicionar site)
4. Preencha o título, URL e selecione o site
5. Clique em **"Salvar"**

### Marcando Capítulos como Lidos

1. Enquanto lê um capítulo, clique no ícone da extensão
2. Clique em **"✓ Marcar como Lido"**
3. O capítulo será registrado no histórico

### Verificando Novos Capítulos

1. Clique no ícone da extensão
2. Clique em **"🔄 Verificar Atualizações"**
3. A extensão verificará todos os mangás cadastrados
4. Você receberá notificações sobre novos capítulos

### Exportando e Importando Dados

#### Exportar
1. Abra o **Gerenciador**
2. Clique em **"💾 Exportar"** no cabeçalho
3. Um arquivo JSON será baixado com todos os seus dados

#### Importar
1. Abra o **Gerenciador**
2. Clique em **"📥 Importar"** no cabeçalho
3. Selecione o arquivo JSON exportado anteriormente
4. Seus dados serão restaurados

## ⚙️ Configurações

Acesse as configurações no **Gerenciador → Aba "Configurações"**:

- **Detecção Automática de Mangás**: Ative/desative a detecção automática
- **Notificações de Novos Capítulos**: Ative/desative notificações
- **Intervalo de Verificação**: Defina a frequência de verificação (em minutos)

## 📂 Estrutura de Dados

Os dados são armazenados localmente no formato JSON com a seguinte estrutura:

```json
{
  "sites": [
    {
      "id": "1234567890",
      "name": "MangaLivre",
      "url": "https://mangalivre.to",
      "pattern": "/manga/",
      "addedAt": "2026-03-18T12:00:00.000Z"
    }
  ],
  "mangas": [
    {
      "id": "1234567891",
      "title": "One Piece",
      "url": "https://mangalivre.to/manga/one-piece",
      "siteId": "1234567890",
      "lastChapterRead": "1176",
      "lastChapterUrl": "https://mangalivre.to/manga/one-piece/capitulo-1176",
      "lastReadAt": "2026-03-18T14:30:00.000Z",
      "addedAt": "2026-03-18T12:30:00.000Z"
    }
  ],
  "history": [
    {
      "id": "1234567892",
      "mangaId": "1234567891",
      "title": "One Piece",
      "chapter": "1176",
      "url": "https://mangalivre.to/manga/one-piece/capitulo-1176",
      "readAt": "2026-03-18T14:30:00.000Z"
    }
  ],
  "settings": {
    "autoDetect": true,
    "notifications": true,
    "checkInterval": 60
  }
}
```

## 🔒 Segurança e Privacidade

- ✅ **Armazenamento Local**: Todos os dados são salvos localmente no navegador
- ✅ **Sem Servidor Externo**: Não há comunicação com servidores externos
- ✅ **Sem Coleta de Dados**: Nenhum dado pessoal é coletado ou compartilhado
- ✅ **Código Aberto**: Todo o código está disponível para auditoria
- ✅ **Permissões Mínimas**: Usa apenas as permissões necessárias

### Permissões Utilizadas

- **storage**: Para salvar dados localmente
- **notifications**: Para exibir notificações de novos capítulos
- **activeTab**: Para detectar a página atual ao clicar na extensão
- **alarms**: Para verificações periódicas de atualizações
- **host_permissions (<all_urls>)**: Para acessar sites de mangá cadastrados

## 🛠️ Tecnologias

- **Manifest V3**: Versão mais recente do formato de extensões do Chrome
- **JavaScript Vanilla**: Sem dependências externas
- **Chrome Storage API**: Armazenamento local persistente
- **Chrome Notifications API**: Notificações nativas do navegador
- **Chrome Alarms API**: Verificações periódicas

## 📝 Estrutura de Arquivos

```
manga_tracker_extension/
├── manifest.json           # Configuração da extensão (Manifest V3)
├── popup.html             # Interface do popup
├── manager.html           # Página completa de gerenciamento
├── css/
│   ├── popup.css          # Estilos do popup
│   └── manager.css        # Estilos do gerenciador
├── js/
│   ├── storage.js         # Módulo de gerenciamento de dados
│   ├── popup.js           # Lógica do popup
│   ├── manager.js         # Lógica do gerenciador
│   ├── content.js         # Script de detecção em páginas
│   └── background.js      # Service worker (verificações e notificações)
├── icons/
│   ├── icon16.png         # Ícone 16x16
│   ├── icon48.png         # Ícone 48x48
│   └── icon128.png        # Ícone 128x128
└── README.md              # Este arquivo
```

## 🐛 Problemas Conhecidos

- A detecção automática pode não funcionar em todos os sites (depende da estrutura HTML)
- Verificação de novos capítulos requer implementação de web scraping específico para cada site
- Alguns sites com proteção anti-bot podem não funcionar corretamente

## 🚧 Futuras Melhorias

- [ ] Implementar web scraping para verificação real de novos capítulos
- [ ] Adicionar sincronização com Google Drive ou Dropbox
- [ ] Criar lista de sites pré-configurados populares
- [ ] Adicionar estatísticas detalhadas (mangás lidos por semana, etc.)
- [ ] Implementar categorias e tags para organização
- [ ] Adicionar modo escuro
- [ ] Criar sistema de avaliação de mangás
- [ ] Adicionar suporte a outros idiomas

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Reportar bugs
2. Sugerir novas funcionalidades
3. Enviar pull requests
4. Melhorar a documentação

## 📄 Licença

Este projeto é livre para uso pessoal e educacional.

## 📧 Suporte

Se você encontrar problemas ou tiver dúvidas:

1. Verifique se os sites estão corretamente cadastrados
2. Certifique-se de que as permissões foram concedidas
3. Verifique o console do navegador (F12) para erros
4. Tente recarregar a extensão em `chrome://extensions/`

## ⭐ Agradecimentos

Obrigado por usar o Manga Tracker! Se você gostou, considere dar uma estrela no repositório.

---

**Desenvolvido com ❤️ para leitores de mangá**

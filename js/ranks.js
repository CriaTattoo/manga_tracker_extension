const RANKS_DATA = [
    {
        "nivel": "00",
        "patente": "Sarapão",
        "cap_semana": "0",
        "descricao": "O vacilão que não lê manga!",
        "icon": "trash-can-solid-full.svg"
    },
    {
        "nivel": "01",
        "patente": "Olheiro de Quadrin",
        "cap_semana": "1-10",
        "descricao": "Só de visão, monitorando a atividade de longe.",
        "icon": "eye-solid-full.svg"
    },
    {
        "nivel": "02",
        "patente": "Nóia de Lançamentos",
        "cap_semana": "11-20",
        "descricao": "Vive na fissura, implorando cap novo pros ADMs.",
        "icon": "face-dizzy-solid-full.svg"
    },
    {
        "nivel": "03",
        "patente": "Fogueteiro de Scan",
        "cap_semana": "21-35",
        "descricao": "O primeiro a avisar quando tem cap. novo!",
        "icon": "bullhorn-solid-full.svg"
    },
    {
        "nivel": "04",
        "patente": "Leitor de Radin",
        "cap_semana": "36-50",
        "descricao": "Sintonizado na frequência, não perde um detalhe.",
        "icon": "walkie-talkie-solid-full.svg"
    },
    {
        "nivel": "05",
        "patente": "Vapor da Scan",
        "cap_semana": "51-70",
        "descricao": "O que faz a mercadoria circular, distribuindo opinião pros amigos.",
        "icon": "wind-solid-full.svg"
    },
    {
        "nivel": "06",
        "patente": "Soldado do Bookmark",
        "cap_semana": "71-90",
        "descricao": "Doutrinado! Mantém a lista organizada e a salvo de quedas.",
        "icon": "shield-halved-solid-full.svg"
    },
    {
        "nivel": "07",
        "patente": "Cheira Linhas",
        "cap_semana": "91-115",
        "descricao": "O cara é um raio. Lê tão rápido que nem lembra do inicio da obra!",
        "icon": "bolt-lightning-solid-full.svg"
    },
    {
        "nivel": "08",
        "patente": "Sarna do PDF",
        "cap_semana": "116-140",
        "descricao": "Viciado em download. O terror do 4G no busão.",
        "icon": "file-arrow-down-solid-full.svg"
    },
    {
        "nivel": "09",
        "patente": "Contenção de Spoiler",
        "cap_semana": "141-170",
        "descricao": "Segurança do futuro. Não deixa vazar informação pro inocente!",
        "icon": "user-lock-solid-full.svg"
    },
    {
        "nivel": "10",
        "patente": "Atirador de Skip",
        "cap_semana": "171-200",
        "descricao": "Precisão cirúrgica pra identificar e pular os fillers e flashbacks inúteis.",
        "icon": "crosshairs-solid-full.svg"
    },
    {
        "nivel": "11",
        "patente": "Fumador de Páginas",
        "cap_semana": "201-235",
        "descricao": "Vai só de HOT. Só consome os lançamentos do momento.",
        "icon": "fire-solid-full.svg"
    },
    {
        "nivel": "12",
        "patente": "Gerente das Obras",
        "cap_semana": "236-270",
        "descricao": "Organiza a escala. Manda na própria estante. Gestão inteligente.",
        "icon": "briefcase-solid-full.svg"
    },
    {
        "nivel": "13",
        "patente": "Frente da Scanlator",
        "cap_semana": "271-310",
        "descricao": "Na linha de frente do corre das tradução, edição, revisão!",
        "icon": "skull-solid-full.svg"
    },
    {
        "nivel": "14",
        "patente": "Braço Direito do Mano",
        "cap_semana": "311-350",
        "descricao": "Só nas obras raras e underground de confiança. Visão de águia!",
        "icon": "hand-fist-solid-full.svg"
    },
    {
        "nivel": "15",
        "patente": "Brabão da Pirataria",
        "cap_semana": "351-395",
        "descricao": "Mais velho do morrão. Sobreviveu à queda de todos os sites.",
        "icon": "coins-solid-full.svg"
    },
    {
        "nivel": "16",
        "patente": "O Mano das Scans",
        "cap_semana": "396-440",
        "descricao": "Dono da p**** toda. Já previu o final no cap 1.",
        "icon": "crown-solid-full.svg"
    },
    {
        "nivel": "17",
        "patente": "Traficante de Mangás",
        "cap_semana": "441-490",
        "descricao": "Da palavra final. Indica o mangá certo pro ganso curtir a onda.",
        "icon": "brain-solid-full.svg"
    },
    {
        "nivel": "18",
        "patente": "Relíquia de Madureira",
        "cap_semana": "491+",
        "descricao": "Nível Deus. Lê na gringa e ainda traduz para os reles mortais.",
        "icon": "gem-regular-full.svg"
    }
];

const RankManager = {
    getRank(weeklyReads) {
        for (let i = RANKS_DATA.length - 1; i >= 0; i--) {
            const rank = RANKS_DATA[i];
            const range = rank.cap_semana;
            
            if (range.endsWith('+')) {
                const min = parseInt(range.replace('+', ''));
                if (weeklyReads >= min) return rank;
            } else if (range.includes('-')) {
                const [min, max] = range.split('-').map(n => parseInt(n.trim()));
                if (weeklyReads >= min && weeklyReads <= max) return rank;
            } else if (range.includes('—')) { // Suporte para o caractere do JSON original se necessário
                const [min, max] = range.split('—').map(n => parseInt(n.trim()));
                if (weeklyReads >= min && weeklyReads <= max) return rank;
            } else {
                const val = parseInt(range);
                if (weeklyReads === val) return rank;
            }
        }
        return RANKS_DATA[0]; // Fallback
    }
};

if (typeof window !== 'undefined') {
    window.RankManager = RankManager;
    window.RANKS_DATA = RANKS_DATA;
}

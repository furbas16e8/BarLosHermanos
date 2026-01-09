/**
 * Dados do cardápio para o sistema de pedidos
 * Bar Los Hermanos
 * 
 * Fonte: cardapio-completo.pdf
 * Última atualização: 2026-01-09
 */

// =============================================================================
// CATEGORIAS
// =============================================================================
const CATEGORIAS = [
    { id: "porcoes", nome: "Porções", icone: "🍖" },
    { id: "churrasquinhos", nome: "Churrasquinhos", icone: "🥩" },
    { id: "batatas", nome: "Batatas", icone: "🥔" },
    { id: "carne-boi", nome: "Carne de Boi", icone: "🥩" },
    { id: "frango", nome: "Frango", icone: "🍗" },
    { id: "frutos-mar", nome: "Frutos do Mar", icone: "🦐" },
    { id: "especiais", nome: "Especiais", icone: "⭐" },
    { id: "mexicanos", nome: "Mexicanos", icone: "🌮" },
    { id: "caldos", nome: "Caldos", icone: "🍲" },
    { id: "hamburguer", nome: "Hambúrguer", icone: "🍔" },
    { id: "bebidas", nome: "Bebidas", icone: "🥤" }
];

// =============================================================================
// PORÇÕES (Página 1)
// =============================================================================
const PORCOES = [
    {
        id: 1,
        nome: "Mussarela Los Hermanos",
        descricao: "Bolinha de queijo mussarela frita, acompanha molho da casa.",
        imagem: null,
        preco: 36.00,
        categoria: "porcoes",
        avaliacao: 4.5,
        numAvaliacoes: 89
    },
    {
        id: 2,
        nome: "Bolinho de Bacalhau (6un)",
        descricao: "Bolinho empanado com farinha panko, acompanha molho da casa.",
        imagem: null,
        preco: 48.90,
        categoria: "porcoes",
        avaliacao: 4.7,
        numAvaliacoes: 156
    },
    {
        id: 3,
        nome: "Jiló Especial",
        descricao: "Jiló empanado com calabresa, cebola e queijo. Molho de pimenta.",
        imagem: "assets/img/menu/jilo_especial.jpg",
        precoMeia: 25.00,
        precoInteira: 43.00,
        serveMeia: "1-2 pessoas",
        serveInteira: "2-3 pessoas",
        categoria: "porcoes",
        avaliacao: 4.8,
        numAvaliacoes: 203
    },
    {
        id: 4,
        nome: "Jiló Solteiro",
        descricao: "Jiló empanado salpicado de parmesão. Molho de pimenta.",
        imagem: null,
        preco: 42.00,
        categoria: "porcoes",
        avaliacao: 4.5,
        numAvaliacoes: 127
    },
    {
        id: 5,
        nome: "Jiló Recheado c/ Carne de Sol",
        descricao: "Jiló gratinado com molho especial, carne de sol e mussarela.",
        imagem: null,
        preco: 48.90,
        categoria: "porcoes",
        avaliacao: 4.9,
        numAvaliacoes: 178
    },
    {
        id: 6,
        nome: "Fígado Acebolado",
        descricao: "Fígado de boi acebolado na manteiga.",
        imagem: null,
        preco: 42.00,
        categoria: "porcoes",
        avaliacao: 4.4,
        numAvaliacoes: 98
    },
    {
        id: 7,
        nome: "Fígado com Jiló",
        descricao: "Fígado de boi acebolado acompanhado de jiló.",
        imagem: null,
        preco: 51.00,
        categoria: "porcoes",
        avaliacao: 4.6,
        numAvaliacoes: 112
    },
    {
        id: 8,
        nome: "Torresmo de Barriga",
        descricao: "Torresmo de barriga super crocante, temperado com alho.",
        imagem: "assets/img/menu/torresmo_barriga.jpg",
        preco: 35.90,
        categoria: "porcoes",
        avaliacao: 4.7,
        numAvaliacoes: 189
    },
    {
        id: 9,
        nome: "Torresmo c/ Mandioca",
        descricao: "Torresmo de barriga acompanhado de mandioca frita.",
        imagem: null,
        preco: 55.00,
        categoria: "porcoes",
        avaliacao: 4.8,
        numAvaliacoes: 145
    },
    {
        id: 10,
        nome: "Torresminho",
        descricao: "Porção de torresminho crocante, perfeito para petiscar.",
        imagem: null,
        preco: 19.90,
        categoria: "porcoes",
        avaliacao: 4.5,
        numAvaliacoes: 167
    },
    {
        id: 11,
        nome: "Coxinha de Costelinha Defumada",
        descricao: "Coxinha sem massa de costelinha defumada, molho barbecue.",
        imagem: null,
        preco: 44.00,
        categoria: "porcoes",
        avaliacao: 4.9,
        numAvaliacoes: 134
    },
    {
        id: 12,
        nome: "Coxinha de Frango c/ Catupiry",
        descricao: "Coxinha sem massa de frango c/ catupiry, molho mostarda e mel.",
        imagem: null,
        preco: 44.00,
        categoria: "porcoes",
        avaliacao: 4.7,
        numAvaliacoes: 156
    }
];

// =============================================================================
// CHURRASQUINHOS (Página 1)
// =============================================================================
const CHURRASQUINHOS = [
    {
        id: 20,
        nome: "Churrasquinho de Frango (160gr)",
        descricao: "Espetinho de frango grelhado. Acompanha farofa e vinagrete.",
        imagem: null,
        preco: 17.00,
        categoria: "churrasquinhos",
        avaliacao: 4.5,
        numAvaliacoes: 89
    },
    {
        id: 21,
        nome: "Churrasquinho de Alcatra (160gr)",
        descricao: "Espetinho de alcatra grelhado. Acompanha farofa e vinagrete.",
        imagem: null,
        preco: 23.00,
        categoria: "churrasquinhos",
        avaliacao: 4.7,
        numAvaliacoes: 112
    },
    {
        id: 22,
        nome: "Filé na Manteiga (160gr)",
        descricao: "Espetinho de filé na manteiga. Acompanha farofa e vinagrete.",
        imagem: null,
        preco: 29.90,
        categoria: "churrasquinhos",
        avaliacao: 4.8,
        numAvaliacoes: 145
    },
    {
        id: 23,
        nome: "Filé Especial c/ Catupiry (100gr)",
        descricao: "Filé com catupiry e batata palha caseira.",
        imagem: null,
        preco: 30.90,
        categoria: "churrasquinhos",
        avaliacao: 4.9,
        numAvaliacoes: 167
    },
    {
        id: 24,
        nome: "Filé Super Especial c/ Gorgonzola (100gr)",
        descricao: "Filé com gorgonzola e batata palha caseira.",
        imagem: null,
        preco: 32.90,
        categoria: "churrasquinhos",
        avaliacao: 4.8,
        numAvaliacoes: 134
    },
    {
        id: 25,
        nome: "Frango Especial c/ Catupiry (100gr)",
        descricao: "Frango com catupiry e batata palha caseira.",
        imagem: null,
        preco: 19.90,
        categoria: "churrasquinhos",
        avaliacao: 4.6,
        numAvaliacoes: 98
    },
    {
        id: 26,
        nome: "Frango Super Especial c/ Gorgonzola (100gr)",
        descricao: "Frango com gorgonzola e batata palha caseira.",
        imagem: null,
        preco: 24.90,
        categoria: "churrasquinhos",
        avaliacao: 4.7,
        numAvaliacoes: 112
    }
];

// =============================================================================
// BATATAS ROSTI (Página 2)
// =============================================================================
const BATATAS = [
    // Batatas Simples
    {
        id: 30,
        nome: "Batata Chips c/ Parmesão",
        descricao: "Batata chips caseira com parmesão, ketchup e maionese do Los.",
        imagem: null,
        preco: 32.00,
        categoria: "batatas",
        avaliacao: 4.6,
        numAvaliacoes: 134
    },
    {
        id: 31,
        nome: "Batata Frita",
        descricao: "Porção de batata frita crocante.",
        imagem: null,
        preco: 28.00,
        categoria: "batatas",
        avaliacao: 4.5,
        numAvaliacoes: 178
    },
    {
        id: 32,
        nome: "Batata Frita c/ Catupiry e Bacon",
        descricao: "Batata frita com catupiry cremoso e bacon crocante.",
        imagem: null,
        preco: 39.90,
        categoria: "batatas",
        avaliacao: 4.8,
        numAvaliacoes: 198
    },
    {
        id: 33,
        nome: "Batata Palha 100gr",
        descricao: "Porção de batata palha caseira.",
        imagem: null,
        preco: 17.00,
        categoria: "batatas",
        avaliacao: 4.4,
        numAvaliacoes: 89
    },
    // Batatas Rosti - Vegetariana
    {
        id: 34,
        nome: "Rosti Vegetariana - Espinafre e Palmito",
        descricao: "Batata rosti com espinafre, palmito, alho e cheiro verde.",
        imagem: null,
        preco: 44.00,
        categoria: "batatas",
        avaliacao: 4.5,
        numAvaliacoes: 67
    },
    {
        id: 35,
        nome: "Rosti Vegetariana Completa",
        descricao: "Espinafre, palmito, alho, tomate, cebola, azeitona e champignon.",
        imagem: null,
        preco: 44.00,
        categoria: "batatas",
        avaliacao: 4.6,
        numAvaliacoes: 78
    },
    {
        id: 36,
        nome: "Rosti de Palmito",
        descricao: "Batata rosti com palmito, alho, cebola, tomate e cheiro verde.",
        imagem: null,
        preco: 46.00,
        categoria: "batatas",
        avaliacao: 4.7,
        numAvaliacoes: 89
    },
    // Batatas Rosti - Filé Mignon
    {
        id: 37,
        nome: "Rosti com Filé na Chapa",
        descricao: "Batata rosti com filé na chapa, mussarela e catupiry.",
        imagem: null,
        preco: 42.00,
        categoria: "batatas",
        avaliacao: 4.8,
        numAvaliacoes: 156
    },
    {
        id: 38,
        nome: "Rosti com Filé e Palmito",
        descricao: "Batata rosti com filé na chapa e palmito.",
        imagem: null,
        preco: 44.00,
        categoria: "batatas",
        avaliacao: 4.8,
        numAvaliacoes: 134
    },
    {
        id: 39,
        nome: "Rosti com Filé e Bacon",
        descricao: "Batata rosti com filé na chapa e bacon crocante.",
        imagem: null,
        preco: 44.00,
        categoria: "batatas",
        avaliacao: 4.9,
        numAvaliacoes: 167
    },
    {
        id: 40,
        nome: "Rosti com Filé, Palmito e Bacon",
        descricao: "Batata rosti completa com filé, palmito e bacon.",
        imagem: null,
        preco: 46.00,
        categoria: "batatas",
        avaliacao: 4.9,
        numAvaliacoes: 145
    },
    // Batatas Rosti - Frango
    {
        id: 41,
        nome: "Rosti com Frango",
        descricao: "Batata rosti com frango desfiado, mussarela e catupiry.",
        imagem: null,
        preco: 40.00,
        categoria: "batatas",
        avaliacao: 4.6,
        numAvaliacoes: 123
    },
    {
        id: 42,
        nome: "Rosti com Frango e Bacon",
        descricao: "Batata rosti com frango desfiado e bacon crocante.",
        imagem: null,
        preco: 42.00,
        categoria: "batatas",
        avaliacao: 4.7,
        numAvaliacoes: 134
    },
    {
        id: 43,
        nome: "Rosti com Frango e Palmito",
        descricao: "Batata rosti com frango desfiado e palmito.",
        imagem: null,
        preco: 42.00,
        categoria: "batatas",
        avaliacao: 4.7,
        numAvaliacoes: 112
    },
    // Batatas Rosti - Bacon/Carne de Sol
    {
        id: 44,
        nome: "Rosti com Bacon e Cream Cheese",
        descricao: "Batata rosti com bacon crocante e cream cheese.",
        imagem: null,
        preco: 42.00,
        categoria: "batatas",
        avaliacao: 4.8,
        numAvaliacoes: 145
    },
    {
        id: 45,
        nome: "Rosti com Carne de Sol",
        descricao: "Batata rosti com carne de sol desfiada.",
        imagem: null,
        preco: 42.00,
        categoria: "batatas",
        avaliacao: 4.9,
        numAvaliacoes: 178
    },
    {
        id: 46,
        nome: "Rosti com Carne de Sol e Bacon",
        descricao: "Batata rosti com carne de sol e bacon crocante.",
        imagem: null,
        preco: 44.00,
        categoria: "batatas",
        avaliacao: 4.9,
        numAvaliacoes: 156
    },
    // Batatas Rosti - Frutos do Mar
    {
        id: 47,
        nome: "Rosti com Bacalhau",
        descricao: "Batata rosti com bacalhau desfiado, mussarela e catupiry.",
        imagem: null,
        preco: 46.00,
        categoria: "batatas",
        avaliacao: 4.7,
        numAvaliacoes: 89
    },
    {
        id: 48,
        nome: "Rosti com Bacalhau e Palmito",
        descricao: "Batata rosti com bacalhau desfiado e palmito.",
        imagem: null,
        preco: 48.00,
        categoria: "batatas",
        avaliacao: 4.8,
        numAvaliacoes: 78
    },
    {
        id: 49,
        nome: "Rosti com Camarão",
        descricao: "Batata rosti com camarão, mussarela e catupiry.",
        imagem: null,
        preco: 46.00,
        categoria: "batatas",
        avaliacao: 4.9,
        numAvaliacoes: 112
    },
    {
        id: 50,
        nome: "Rosti com Camarão e Palmito",
        descricao: "Batata rosti com camarão e palmito.",
        imagem: null,
        preco: 48.00,
        categoria: "batatas",
        avaliacao: 4.9,
        numAvaliacoes: 98
    }
];

// =============================================================================
// CARNE DE BOI (Página 3)
// =============================================================================
const CARNE_BOI = [
    {
        id: 60,
        nome: "Filé Mignon Acebolado",
        descricao: "Filé na manteiga acebolado, temperado com flor de sal.",
        imagem: null,
        preco: 92.00,
        categoria: "carne-boi",
        avaliacao: 4.9,
        numAvaliacoes: 234
    },
    {
        id: 61,
        nome: "Filé c/ Fritas ou Mandioca",
        descricao: "Filé na manteiga c/ sal grosso, cebola e batata frita ou mandioca.",
        imagem: null,
        preco: 115.00,
        categoria: "carne-boi",
        avaliacao: 4.9,
        numAvaliacoes: 198
    },
    {
        id: 62,
        nome: "Filé com Catupiry",
        descricao: "Filé flambado na manteiga c/ catupiry. Batata palha caseira.",
        imagem: null,
        preco: 117.90,
        categoria: "carne-boi",
        avaliacao: 4.8,
        numAvaliacoes: 167
    },
    {
        id: 63,
        nome: "Filé com Gorgonzola",
        descricao: "Filé flambado na manteiga c/ gorgonzola. Batata palha caseira.",
        imagem: null,
        preco: 126.00,
        categoria: "carne-boi",
        avaliacao: 4.9,
        numAvaliacoes: 145
    },
    {
        id: 64,
        nome: "Filé à Moda Nordestina",
        descricao: "Filé c/ flor de sal, mandioca, bananinha, vinagrete e farofa.",
        imagem: null,
        preco: 119.00,
        categoria: "carne-boi",
        avaliacao: 4.9,
        numAvaliacoes: 178
    },
    {
        id: 65,
        nome: "Alcatra Acebolada",
        descricao: "Alcatra flambada na manteiga, temperada com flor de sal.",
        imagem: null,
        preco: 82.90,
        categoria: "carne-boi",
        avaliacao: 4.7,
        numAvaliacoes: 156
    },
    {
        id: 66,
        nome: "Alcatra Acebolada c/ Jiló",
        descricao: "Alcatra flambada na manteiga acompanhada de jiló empanado.",
        imagem: null,
        preco: 92.00,
        categoria: "carne-boi",
        avaliacao: 4.8,
        numAvaliacoes: 134
    },
    {
        id: 67,
        nome: "Alcatra c/ Fritas ou Mandioca",
        descricao: "Alcatra acebolada com batata frita ou mandioca.",
        imagem: null,
        preco: 100.00,
        categoria: "carne-boi",
        avaliacao: 4.8,
        numAvaliacoes: 145
    }
];

// =============================================================================
// FRANGO (Página 3)
// =============================================================================
const FRANGO = [
    {
        id: 70,
        nome: "Frango Arrepiado",
        descricao: "Isca de frango empanada super crocante, polvilhada c/ parmesão.",
        imagem: null,
        preco: 56.90,
        categoria: "frango",
        avaliacao: 4.8,
        numAvaliacoes: 189
    },
    {
        id: 71,
        nome: "Frango Acebolado",
        descricao: "Filé de frango na manteiga acebolado.",
        imagem: null,
        preco: 52.00,
        categoria: "frango",
        avaliacao: 4.6,
        numAvaliacoes: 145
    },
    {
        id: 72,
        nome: "Frango c/ Fritas ou Mandioca",
        descricao: "Filé de frango na manteiga c/ cebola e batata frita ou mandioca.",
        imagem: null,
        preco: 65.00,
        categoria: "frango",
        avaliacao: 4.7,
        numAvaliacoes: 167
    },
    {
        id: 73,
        nome: "Frango com Catupiry",
        descricao: "Filé de frango na manteiga c/ catupiry. Batata palha caseira.",
        imagem: null,
        preco: 68.00,
        categoria: "frango",
        avaliacao: 4.8,
        numAvaliacoes: 156
    },
    {
        id: 74,
        nome: "Frango com Gorgonzola",
        descricao: "Filé de frango na manteiga c/ gorgonzola. Batata palha caseira.",
        imagem: null,
        preco: 72.00,
        categoria: "frango",
        avaliacao: 4.9,
        numAvaliacoes: 134
    }
];

// =============================================================================
// FRUTOS DO MAR (Página 3)
// =============================================================================
const FRUTOS_MAR = [
    {
        id: 80,
        nome: "Filé de Tilápia",
        descricao: "Isca de tilápia empanada e frita bem sequinha.",
        imagem: null,
        preco: 56.90,
        categoria: "frutos-mar",
        avaliacao: 4.6,
        numAvaliacoes: 112
    },
    {
        id: 81,
        nome: "Filé de Tilápia Especial",
        descricao: "Isca de tilápia empanada, acompanha batata frita.",
        imagem: null,
        preco: 82.00,
        categoria: "frutos-mar",
        avaliacao: 4.7,
        numAvaliacoes: 98
    },
    {
        id: 82,
        nome: "Oásis do Mar",
        descricao: "Filé de tilápia com ervas finas, arroz e salada da casa.",
        imagem: null,
        preco: 59.00,
        categoria: "frutos-mar",
        avaliacao: 4.5,
        numAvaliacoes: 89
    },
    {
        id: 83,
        nome: "Oásis do Mar com Camarão",
        descricao: "Filé de tilápia com ervas finas, arroz, salada e camarões.",
        imagem: null,
        preco: 69.00,
        categoria: "frutos-mar",
        avaliacao: 4.8,
        numAvaliacoes: 112
    },
    {
        id: 84,
        nome: "Camarão Alho e Óleo",
        descricao: "Camarão VM flambado no azeite com alho e ervas finas.",
        imagem: null,
        preco: 109.90,
        categoria: "frutos-mar",
        avaliacao: 4.9,
        numAvaliacoes: 145
    },
    {
        id: 85,
        nome: "Camarão Empanado",
        descricao: "Camarão VM empanado e frito na farinha panko, super crocante.",
        imagem: null,
        preco: 119.90,
        categoria: "frutos-mar",
        avaliacao: 4.9,
        numAvaliacoes: 134
    },
    {
        id: 86,
        nome: "Bobó de Camarão",
        descricao: "Feito com mandioca e temperos finos, levemente apimentado.",
        imagem: null,
        preco: 33.00,
        categoria: "frutos-mar",
        avaliacao: 4.7,
        numAvaliacoes: 167
    }
];

// =============================================================================
// PORÇÕES ESPECIAIS (Página 4)
// =============================================================================
const ESPECIAIS = [
    {
        id: 90,
        nome: "Escondidinho de Camarão",
        descricao: "Recheio de camarão entre camadas de purê de mandioca. Serve 2.",
        imagem: null,
        preco: 68.00,
        categoria: "especiais",
        avaliacao: 4.9,
        numAvaliacoes: 178
    },
    {
        id: 91,
        nome: "Escondidinho de Carne de Sol",
        descricao: "Recheio de carne de sol entre camadas de purê. Serve 2.",
        imagem: null,
        preco: 68.00,
        categoria: "especiais",
        avaliacao: 4.9,
        numAvaliacoes: 198
    },
    {
        id: 92,
        nome: "Escondidinho Individual",
        descricao: "Escondidinho de camarão ou carne de sol, porção individual.",
        imagem: null,
        preco: 37.00,
        categoria: "especiais",
        avaliacao: 4.8,
        numAvaliacoes: 145
    },
    {
        id: 93,
        nome: "Carne de Sol à Moda Nordestina",
        descricao: "Carne de sol c/ mandioca, tomate, cebola, farofa e banana.",
        imagem: null,
        preco: 106.90,
        categoria: "especiais",
        avaliacao: 4.9,
        numAvaliacoes: 189
    },
    {
        id: 94,
        nome: "Carne de Sol c/ Fritas ou Mandioca",
        descricao: "Suculenta carne de sol na manteiga com batata frita ou mandioca.",
        imagem: null,
        preco: 95.90,
        categoria: "especiais",
        avaliacao: 4.8,
        numAvaliacoes: 167
    },
    {
        id: 95,
        nome: "Mexidão do Los",
        descricao: "Arroz, feijão, bacon, 3 ovos, linguicinha, cebola e carne.",
        imagem: null,
        preco: 42.00,
        categoria: "especiais",
        avaliacao: 4.7,
        numAvaliacoes: 156
    },
    {
        id: 96,
        nome: "Carne de Panela",
        descricao: "Suculenta costela de boi ou maçã de peito na panela.",
        imagem: null,
        preco: 50.00,
        categoria: "especiais",
        avaliacao: 4.6,
        numAvaliacoes: 134
    },
    {
        id: 97,
        nome: "Carne de Panela com Batata",
        descricao: "Costela de boi ou maçã de peito na panela com batata.",
        imagem: null,
        preco: 60.00,
        categoria: "especiais",
        avaliacao: 4.7,
        numAvaliacoes: 145
    },
    {
        id: 98,
        nome: "Costelinha Outback de Porco",
        descricao: "Costelinha defumada c/ barbecue, mandioca ou batata rústica.",
        imagem: null,
        preco: 89.90,
        categoria: "especiais",
        avaliacao: 4.9,
        numAvaliacoes: 178
    }
];

// =============================================================================
// MEXICANOS (Página 5)
// =============================================================================
const MEXICANOS = [
    // Quesadillas
    {
        id: 100,
        nome: "Quesadilla com Filé",
        descricao: "Tortilha de trigo c/ filé, salada, mussarela e bacon.",
        imagem: null,
        preco1un: 38.00,
        preco2un: 68.00,
        categoria: "mexicanos",
        avaliacao: 4.8,
        numAvaliacoes: 145
    },
    {
        id: 101,
        nome: "Quesadilla com Camarão",
        descricao: "Tortilha de trigo c/ camarão, salada, mussarela e bacon.",
        imagem: null,
        preco1un: 38.00,
        preco2un: 68.00,
        categoria: "mexicanos",
        avaliacao: 4.9,
        numAvaliacoes: 134
    },
    {
        id: 102,
        nome: "Quesadilla com Frango",
        descricao: "Tortilha de trigo c/ frango, salada, mussarela e bacon.",
        imagem: null,
        preco1un: 38.00,
        preco2un: 55.00,
        categoria: "mexicanos",
        avaliacao: 4.7,
        numAvaliacoes: 156
    },
    // Burritos
    {
        id: 103,
        nome: "Burrito com Filé",
        descricao: "Tortilha de trigo c/ filé, salada, mussarela e bacon.",
        imagem: null,
        preco1un: 38.00,
        preco2un: 68.00,
        categoria: "mexicanos",
        avaliacao: 4.8,
        numAvaliacoes: 123
    },
    {
        id: 104,
        nome: "Burrito com Camarão",
        descricao: "Tortilha de trigo c/ camarão, salada, mussarela e bacon.",
        imagem: null,
        preco1un: 38.00,
        preco2un: 68.00,
        categoria: "mexicanos",
        avaliacao: 4.9,
        numAvaliacoes: 112
    },
    {
        id: 105,
        nome: "Burrito com Frango",
        descricao: "Tortilha de trigo c/ frango, salada, mussarela e bacon.",
        imagem: null,
        preco1un: 38.00,
        preco2un: 55.00,
        categoria: "mexicanos",
        avaliacao: 4.7,
        numAvaliacoes: 134
    },
    // La Vitta
    {
        id: 106,
        nome: "La Vitta Bacon",
        descricao: "Massa fina crocante c/ bacon, cream cheese, levemente picante.",
        imagem: null,
        preco1un: 30.00,
        preco2un: 49.00,
        categoria: "mexicanos",
        avaliacao: 4.8,
        numAvaliacoes: 167
    }
];

// =============================================================================
// CALDOS (Página 4)
// =============================================================================
const CALDOS = [
    {
        id: 110,
        nome: "Caldo de Feijão",
        descricao: "Caldo de feijão tradicional, perfeito para dias frios.",
        imagem: null,
        preco: 23.90,
        categoria: "caldos",
        avaliacao: 4.6,
        numAvaliacoes: 98
    },
    {
        id: 111,
        nome: "Angu à Baiana",
        descricao: "Angu cremoso à moda baiana com temperos especiais.",
        imagem: null,
        preco: 23.90,
        categoria: "caldos",
        avaliacao: 4.5,
        numAvaliacoes: 89
    },
    {
        id: 112,
        nome: "Bobó de Camarão (Caldo)",
        descricao: "Caldo de bobó cremoso com camarão, levemente apimentado.",
        imagem: null,
        preco: 33.00,
        categoria: "caldos",
        avaliacao: 4.8,
        numAvaliacoes: 134
    },
    {
        id: 113,
        nome: "Caldo de Pinto",
        descricao: "Caldo tradicional de galinha caipira.",
        imagem: null,
        preco: 23.90,
        categoria: "caldos",
        avaliacao: 4.5,
        numAvaliacoes: 112
    }
];

// =============================================================================
// HAMBÚRGUER (Página 4)
// =============================================================================
const HAMBURGUER = [
    {
        id: 120,
        nome: "The Beatles Hamburguer",
        descricao: "Blend bovino 130gr, bacon, queijo, cebola caramelizada, alface.",
        imagem: null,
        preco: 32.00,
        categoria: "hamburguer",
        avaliacao: 4.8,
        numAvaliacoes: 178
    },
    {
        id: 121,
        nome: "Combo The Beatles",
        descricao: "Hamburguer + refrigerante mini + batata frita ou chips.",
        imagem: null,
        preco: 39.00,
        categoria: "hamburguer",
        avaliacao: 4.9,
        numAvaliacoes: 198
    }
];

// =============================================================================
// BEBIDAS (Página 7)
// =============================================================================
const BEBIDAS = [
    // Refrigerantes
    {
        id: 200,
        nome: "Refrigerante Lata",
        descricao: "Coca, Coca Zero, Fanta, Guaraná, Sprite (350ml)",
        imagem: null,
        preco: 7.50,
        categoria: "bebidas",
        avaliacao: 4.5,
        numAvaliacoes: 89
    },
    {
        id: 201,
        nome: "Refrigerante KS",
        descricao: "Coca-Cola, Guaraná ou Sprite (290ml)",
        imagem: null,
        preco: 7.50,
        categoria: "bebidas",
        avaliacao: 4.5,
        numAvaliacoes: 78
    },
    {
        id: 202,
        nome: "H2O, Citrus ou Tônica",
        descricao: "Água saborizada H2O, Citrus ou Água Tônica.",
        imagem: null,
        preco: 8.50,
        categoria: "bebidas",
        avaliacao: 4.4,
        numAvaliacoes: 67
    },
    // Águas
    {
        id: 203,
        nome: "Água Mineral s/ Gás",
        descricao: "Água mineral sem gás (500ml)",
        imagem: null,
        preco: 5.00,
        categoria: "bebidas",
        avaliacao: 4.8,
        numAvaliacoes: 56
    },
    {
        id: 204,
        nome: "Água Mineral c/ Gás",
        descricao: "Água mineral com gás (500ml)",
        imagem: null,
        preco: 5.00,
        categoria: "bebidas",
        avaliacao: 4.7,
        numAvaliacoes: 45
    },
    // Energéticos
    {
        id: 205,
        nome: "Energético",
        descricao: "Energético tradicional ou tropical (250ml)",
        imagem: null,
        preco: 14.00,
        categoria: "bebidas",
        avaliacao: 4.6,
        numAvaliacoes: 89
    },
    // Sucos Naturais
    {
        id: 210,
        nome: "Suco Natural de Limão",
        descricao: "Suco natural de limão fresquinho (300ml)",
        imagem: null,
        preco: 12.00,
        categoria: "bebidas",
        avaliacao: 4.7,
        numAvaliacoes: 98
    },
    {
        id: 211,
        nome: "Suco Natural de Laranja",
        descricao: "Suco natural de laranja fresquinho (300ml)",
        imagem: null,
        preco: 12.00,
        categoria: "bebidas",
        avaliacao: 4.8,
        numAvaliacoes: 112
    },
    {
        id: 212,
        nome: "Suco Natural de Abacaxi",
        descricao: "Suco natural de abacaxi fresquinho (300ml)",
        imagem: null,
        preco: 14.00,
        categoria: "bebidas",
        avaliacao: 4.7,
        numAvaliacoes: 89
    },
    {
        id: 213,
        nome: "Suco Natural de Morango",
        descricao: "Suco natural de morango fresquinho (300ml)",
        imagem: null,
        preco: 14.00,
        categoria: "bebidas",
        avaliacao: 4.8,
        numAvaliacoes: 98
    },
    {
        id: 214,
        nome: "Suco Natural de Maracujá",
        descricao: "Suco natural de maracujá fresquinho (300ml)",
        imagem: null,
        preco: 14.00,
        categoria: "bebidas",
        avaliacao: 4.7,
        numAvaliacoes: 78
    },
    {
        id: 215,
        nome: "Limonada Suíça c/ Gás",
        descricao: "Limonada suíça refrescante com água com gás (400ml)",
        imagem: null,
        preco: 14.00,
        categoria: "bebidas",
        avaliacao: 4.8,
        numAvaliacoes: 134
    },
    {
        id: 216,
        nome: "Limonada Suíça Cremosa",
        descricao: "Limonada suíça cremosa especial (400ml)",
        imagem: null,
        preco: 14.00,
        categoria: "bebidas",
        avaliacao: 4.9,
        numAvaliacoes: 145
    },
    {
        id: 217,
        nome: "Suco Combinado",
        descricao: "Combinação de 2 frutas: laranja c/ morango, maracujá, etc.",
        imagem: null,
        preco: 16.00,
        categoria: "bebidas",
        avaliacao: 4.8,
        numAvaliacoes: 112
    },
    // Sucos Del Vale
    {
        id: 218,
        nome: "Suco Del Vale",
        descricao: "Suco Del Vale pronto (uva ou pêssego)",
        imagem: null,
        preco: 8.00,
        categoria: "bebidas",
        avaliacao: 4.4,
        numAvaliacoes: 67
    }
];

// =============================================================================
// ADICIONAIS
// =============================================================================
const ADICIONAIS = [
    // Molhos
    { id: 1, nome: "Molho Verde", preco: 3.00 },
    { id: 2, nome: "Molho Mostarda e Mel", preco: 3.00 },
    { id: 3, nome: "Molho Barbecue", preco: 3.00 },
    { id: 4, nome: "Molho Pimenta do Los", preco: 3.00 },
    { id: 5, nome: "Molho Blue Cheese", preco: 5.00 },
    { id: 6, nome: "Molho Sour Cream", preco: 5.00 },
    { id: 7, nome: "Guacamole", preco: 5.00 },
    // Acompanhamentos
    { id: 10, nome: "Arroz", preco: 14.00 },
    { id: 11, nome: "Farofa ou Vinagrete", preco: 5.00 },
    { id: 12, nome: "Salada da Casa", preco: 10.00 },
    { id: 13, nome: "Mandioca Frita ou na Manteiga", preco: 28.00 },
    { id: 14, nome: "Bananinha Empanada", preco: 28.00 },
    // Adicionais do Hambúrguer
    { id: 20, nome: "Bife Extra (hambúrguer)", preco: 9.00 },
    { id: 21, nome: "Ovo (hambúrguer)", preco: 3.00 },
    { id: 22, nome: "Batata Frita (hambúrguer)", preco: 8.00 },
    { id: 23, nome: "Batata Chips (hambúrguer)", preco: 8.00 },
    { id: 24, nome: "Banana da Terra (hambúrguer)", preco: 4.00 },
    { id: 25, nome: "Catupiry (hambúrguer)", preco: 6.00 }
];

// =============================================================================
// FILIAIS E TAXAS DE ENTREGA
// =============================================================================
const FILIAIS = {
    "los-bairro": {
        nome: "Los Bairro",
        endereco: "Rua Exemplo, 123 - Grã Duquesa",
        bairros: [
            { nome: "Grã Duquesa", taxa: 7.00 },
            { nome: "Lagoa Santa", taxa: 8.00 },
            { nome: "Santa Helena", taxa: 9.00 },
            { nome: "Centro", taxa: 9.00 },
            { nome: "N. Sra. das Graças", taxa: 10.00 },
            { nome: "Ilha dos Araújos", taxa: 10.00 },
            { nome: "Lourdes", taxa: 11.00 },
            { nome: "Esplanada", taxa: 11.00 },
            { nome: "Esplanadinha", taxa: 12.00 },
            { nome: "São Pedro", taxa: 12.00 }
        ]
    },
    "los-centro": {
        nome: "Los Centro",
        endereco: "Av. Principal, 456 - Centro",
        bairros: [
            { nome: "Centro", taxa: 7.00 },
            { nome: "Esplanada", taxa: 8.00 },
            { nome: "Lourdes", taxa: 8.00 },
            { nome: "Esplanadinha", taxa: 9.00 },
            { nome: "São Pedro", taxa: 9.00 },
            { nome: "Grã Duquesa", taxa: 10.00 },
            { nome: "Lagoa Santa", taxa: 10.00 },
            { nome: "Santa Helena", taxa: 11.00 },
            { nome: "Ilha dos Araújos", taxa: 11.00 },
            { nome: "São Paulo", taxa: 12.00 }
        ]
    }
};

// =============================================================================
// AGRUPAMENTO DE TODOS OS PRATOS
// Combina todas as categorias em um único array para facilitar buscas
// =============================================================================
const PRATOS = [
    ...PORCOES,
    ...CHURRASQUINHOS,
    ...BATATAS,
    ...CARNE_BOI,
    ...FRANGO,
    ...FRUTOS_MAR,
    ...ESPECIAIS,
    ...MEXICANOS,
    ...CALDOS,
    ...HAMBURGUER,
    ...BEBIDAS
];

// =============================================================================
// FUNÇÕES AUXILIARES
// =============================================================================

/**
 * Busca um prato pelo ID
 * @param {number} id - ID do prato
 * @returns {Object|null} - Prato encontrado ou null
 */
function getPratoById(id) {
    return PRATOS.find(prato => prato.id === id) || null;
}

/**
 * Filtra pratos por categoria
 * @param {string} categoria - ID da categoria
 * @returns {Array} - Lista de pratos da categoria
 */
function getPratosByCategoria(categoria) {
    return PRATOS.filter(prato => prato.categoria === categoria);
}

/**
 * Busca pratos por nome (busca parcial)
 * @param {string} termo - Termo de busca
 * @returns {Array} - Lista de pratos que contêm o termo
 */
function buscarPratos(termo) {
    const termoLower = termo.toLowerCase();
    return PRATOS.filter(prato =>
        prato.nome.toLowerCase().includes(termoLower) ||
        prato.descricao.toLowerCase().includes(termoLower)
    );
}

/**
 * Formata preço para exibição (R$ XX,XX)
 * @param {number} valor - Valor numérico
 * @returns {string} - Valor formatado
 */
function formatarPreco(valor) {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

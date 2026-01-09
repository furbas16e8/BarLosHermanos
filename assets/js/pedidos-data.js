/**
 * Dados mockados para o sistema de pedidos
 * Bar Los Hermanos
 */

// Pratos/Porções disponíveis
const PRATOS = [
    {
        id: 1,
        nome: "Jiló Especial",
        descricao: "Jiló crocante com tempero especial da casa, servido com molho artesanal. Uma explosão de sabor que conquistou os clientes do Los Hermanos.",
        imagem: "assets/img/menu/jilo_especial.jpg",
        precoMeia: 35.00,
        precoInteira: 55.00,
        peso: "400g",
        serveMeia: "1-2 pessoas",
        serveInteira: "2-3 pessoas",
        tempoPreparo: "~25min",
        categoria: "porcoes",
        avaliacao: 4.5,
        numAvaliacoes: 127
    },
    {
        id: 2,
        nome: "Costela na Brasa",
        descricao: "Costela suína assada lentamente por horas, com crosta crocante e carne macia que desmancha na boca. Acompanha farofa especial.",
        imagem: "assets/img/menu/costela.jpg",
        precoMeia: 45.00,
        precoInteira: 75.00,
        peso: "400g",
        serveMeia: "1-2 pessoas",
        serveInteira: "2-3 pessoas",
        tempoPreparo: "~30min",
        categoria: "porcoes",
        avaliacao: 4.8,
        numAvaliacoes: 203
    },
    {
        id: 3,
        nome: "Torresmo de Barriga",
        descricao: "Barriga suína super crocante, temperada com alho e ervas finas. Perfeita para compartilhar com os amigos.",
        imagem: "assets/img/menu/torresmo_barriga.jpg",
        precoMeia: 30.00,
        precoInteira: 50.00,
        peso: "400g",
        serveMeia: "1-2 pessoas",
        serveInteira: "2-3 pessoas",
        tempoPreparo: "~20min",
        categoria: "porcoes",
        avaliacao: 4.6,
        numAvaliacoes: 156
    },
    {
        id: 4,
        nome: "Acarajé Baiano",
        descricao: "Acarajé tradicional recheado com vatapá cremoso e camarão seco. Uma viagem ao sabor da Bahia.",
        imagem: "assets/img/menu/acaraje.jpg",
        precoMeia: 25.00,
        precoInteira: 40.00,
        peso: "400g",
        serveMeia: "1-2 pessoas",
        serveInteira: "2-3 pessoas",
        tempoPreparo: "~20min",
        categoria: "porcoes",
        avaliacao: 4.4,
        numAvaliacoes: 89
    },
    {
        id: 5,
        nome: "Batata Rústica",
        descricao: "Batatas com casca, fritas e temperadas com mix de ervas e páprica defumada. Crocante por fora, macia por dentro.",
        imagem: "assets/img/menu/batata.jpg",
        precoMeia: 20.00,
        precoInteira: 35.00,
        peso: "400g",
        serveMeia: "1-2 pessoas",
        serveInteira: "2-3 pessoas",
        tempoPreparo: "~15min",
        categoria: "porcoes",
        avaliacao: 4.3,
        numAvaliacoes: 178
    },
    {
        id: 6,
        nome: "Mexicano Especial",
        descricao: "Mix de petiscos apimentados com nachos, guacamole, pico de gallo e jalapeños. Para quem gosta de aventura.",
        imagem: "assets/img/menu/mexicano.jpg",
        precoMeia: 38.00,
        precoInteira: 60.00,
        peso: "400g",
        serveMeia: "1-2 pessoas",
        serveInteira: "2-3 pessoas",
        tempoPreparo: "~25min",
        categoria: "porcoes",
        avaliacao: 4.7,
        numAvaliacoes: 142
    }
];

// Bebidas disponíveis
const BEBIDAS = [
    {
        id: 101,
        nome: "Refrigerante Lata",
        descricao: "Coca-Cola, Guaraná ou Sprite (350ml)",
        imagem: null,
        preco: 6.00,
        categoria: "bebidas",
        avaliacao: 4.5,
        numAvaliacoes: 50
    },
    {
        id: 102,
        nome: "Água Mineral",
        descricao: "Água mineral sem gás (500ml)",
        imagem: null,
        preco: 4.00,
        categoria: "bebidas",
        avaliacao: 4.8,
        numAvaliacoes: 30
    },
    {
        id: 103,
        nome: "Suco Natural",
        descricao: "Suco natural de laranja, limão ou maracujá (300ml)",
        imagem: null,
        preco: 10.00,
        categoria: "bebidas",
        avaliacao: 4.6,
        numAvaliacoes: 45
    }
];

// Adicionais disponíveis
const ADICIONAIS = [
    { id: 1, nome: "Molho extra", preco: 3.00 },
    { id: 2, nome: "Porção de arroz", preco: 8.00 },
    { id: 3, nome: "Farofa especial", preco: 5.00 },
    { id: 4, nome: "Pimenta da casa", preco: 2.00 }
];

// Filiais e seus bairros com taxas de entrega
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

// Categorias para os pills
const CATEGORIAS = [
    { id: "porcoes", nome: "Porções", icone: "🍖" },
    { id: "bebidas", nome: "Bebidas", icone: "🥤" }
];

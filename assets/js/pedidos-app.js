/**
 * Sistema de Pedidos Online - Bar Los Hermanos
 * Lógica de navegação, carrinho e interações
 */

// ===== ESTADO DA APLICAÇÃO =====
let estadoApp = {
  usuario: {
    nome: "",
    email: "",
    telefone: "",
  },
  carrinho: [],
  filialSelecionada: "los-bairro",
  bairroSelecionado: null,
  taxaEntrega: 0,
  endereco: {
    rua: "",
    numero: "",
    referencia: "",
  },
  pratoAtual: null,
  tamanhoSelecionado: "meia",
  quantidade: 1,
  adicionaisSelecionados: [],
  categoriaAtual: "porcoes",
};

// ===== INICIALIZAÇÃO =====
document.addEventListener("DOMContentLoaded", () => {
  // Máscara de celular
  const celularInput = document.getElementById("loginCelular");
  if (celularInput) {
    celularInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length > 11) value = value.slice(0, 11);

      if (value.length > 0) {
        value = "(" + value;
      }
      if (value.length > 3) {
        value = value.slice(0, 3) + ") " + value.slice(3);
      }
      if (value.length > 10) {
        value = value.slice(0, 10) + "-" + value.slice(10);
      }

      e.target.value = value;
    });
  }

  // Carregar carrinho do localStorage
  const carrinhoSalvo = localStorage.getItem("losHermanosCarrinho");
  if (carrinhoSalvo) {
    estadoApp.carrinho = JSON.parse(carrinhoSalvo);
    atualizarHeaderCarrinho();
  }
});

// ===== NAVEGAÇÃO ENTRE TELAS =====
function mostrarTela(telaId) {
  // Esconde todas as telas
  document.querySelectorAll(".tela").forEach((tela) => {
    tela.classList.remove("active");
  });

  // Mostra a tela solicitada
  document.getElementById(telaId).classList.add("active");

  // Controla visibilidade do header e categorias
  const isCardapio = telaId === "telaCardapio";
  const isLogado = estadoApp.usuario.email !== "";
  const telasAuth = ["telaInicial", "telaLogin", "telaCadastro"];

  document.getElementById("mainHeader").style.display =
    isLogado && !telasAuth.includes(telaId) ? "block" : "none";
  document.getElementById("searchBar").style.display = isCardapio
    ? "block"
    : "none";
  document.getElementById("categoriesBar").style.display = isCardapio
    ? "flex"
    : "none";

  // Scroll para o topo
  window.scrollTo(0, 0);
}

// ===== LOGIN =====
function fazerLogin(event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const senha = document.getElementById("loginSenha").value.trim();

  if (email && senha) {
    // TODO: Validar com backend real
    estadoApp.usuario.email = email;
    estadoApp.usuario.nome = email.split("@")[0]; // Nome temporário

    // Atualiza o header
    document.getElementById("headerNome").textContent = estadoApp.usuario.nome;

    // Carrega o cardápio e mostra
    carregarCardapio();
    mostrarTela("telaCardapio");
  }
}

// ===== CADASTRO =====
function fazerCadastro(event) {
  event.preventDefault();

  const nome = document.getElementById("cadastroNome").value.trim();
  const telefone = document.getElementById("cadastroTelefone").value.trim();
  const email = document.getElementById("cadastroEmail").value.trim();
  const senha = document.getElementById("cadastroSenha").value.trim();
  const senhaConfirma = document
    .getElementById("cadastroSenhaConfirma")
    .value.trim();

  // Validações
  if (!nome || !telefone || !email || !senha || !senhaConfirma) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  if (senha !== senhaConfirma) {
    alert("As senhas não coincidem.");
    return;
  }

  if (senha.length < 6) {
    alert("A senha deve ter pelo menos 6 caracteres.");
    return;
  }

  // TODO: Enviar para backend real
  estadoApp.usuario.nome = nome;
  estadoApp.usuario.email = email;
  estadoApp.usuario.telefone = telefone;

  // Atualiza o header
  document.getElementById("headerNome").textContent = nome.split(" ")[0];

  // Carrega o cardápio e mostra
  carregarCardapio();
  mostrarTela("telaCardapio");
}

// ===== CARDÁPIO =====
function carregarCardapio() {
  const grid = document.getElementById("pratosGrid");
  grid.innerHTML = "";

  // Gera os pills de categoria dinamicamente
  gerarCategoriasPills();

  // Filtra por categoria usando a função getPratosByCategoria
  let itens = getPratosByCategoria(estadoApp.categoriaAtual);

  // Filtra por busca
  const busca =
    document.getElementById("searchInput")?.value.toLowerCase() || "";
  if (busca) {
    // Se houver busca, procura em todas as categorias
    itens = buscarPratos(busca);
  }

  // Renderiza os cards
  itens.forEach((item) => {
    const card = criarCardPrato(item);
    grid.appendChild(card);
  });
}

/**
 * Gera os pills de categoria dinamicamente a partir do array CATEGORIAS
 */
function gerarCategoriasPills() {
  const container = document.getElementById("categoriesBar");
  if (!container || container.dataset.gerado === "true") return;

  container.innerHTML = "";

  CATEGORIAS.forEach((cat) => {
    const pill = document.createElement("button");
    pill.className = `category-pill${cat.id === estadoApp.categoriaAtual ? " active" : ""}`;
    pill.dataset.categoria = cat.id;
    pill.onclick = () => filtrarCategoria(cat.id);
    pill.innerHTML = `${cat.icone} ${cat.nome}`;
    container.appendChild(pill);
  });

  container.dataset.gerado = "true";
}

function criarCardPrato(prato) {
  const card = document.createElement("div");
  card.className = `prato-card ${prato.categoria === "bebidas" ? "bebida" : ""}`;
  card.onclick = () => abrirDetalhePrato(prato);

  // Determina o preço a exibir (suporta múltiplos formatos)
  let preco = 0;
  let precoTexto = "";

  if (prato.precoMeia) {
    // Porções com meia/inteira
    preco = prato.precoMeia;
    precoTexto = "a partir de ";
  } else if (prato.preco1un) {
    // Mexicanos com 1un/2un
    preco = prato.preco1un;
    precoTexto = "a partir de ";
  } else {
    // Preço único
    preco = prato.preco;
  }

  // Gera as estrelas
  const stars = gerarEstrelas(prato.avaliacao);

  // Ícone para itens sem imagem baseado na categoria
  const iconesPorCategoria = {
    porcoes: "🍖",
    churrasquinhos: "🥩",
    batatas: "🥔",
    "carne-boi": "🥩",
    frango: "🍗",
    "frutos-mar": "🦐",
    especiais: "⭐",
    mexicanos: "🌮",
    caldos: "🍲",
    hamburguer: "🍔",
    bebidas: "🥤",
  };

  if (prato.imagem) {
    card.innerHTML = `
            <img src="${prato.imagem}" alt="${prato.nome}" class="prato-imagem">
            <div class="prato-info">
                <h3 class="prato-nome">${prato.nome}</h3>
                <div class="prato-avaliacao">
                    <span class="stars">${stars}</span>
                    <span>${prato.avaliacao}</span>
                </div>
                <div class="prato-preco">${precoTexto}<span>${formatarPreco(preco)}</span></div>
            </div>
        `;
  } else {
    const icone = iconesPorCategoria[prato.categoria] || "🍽️";

    card.innerHTML = `
            <div class="prato-imagem-placeholder">${icone}</div>
            <div class="prato-info">
                <h3 class="prato-nome">${prato.nome}</h3>
                <div class="prato-avaliacao">
                    <span class="stars">${stars}</span>
                    <span>${prato.avaliacao}</span>
                </div>
                <div class="prato-preco">${precoTexto}<span>${formatarPreco(preco)}</span></div>
            </div>
        `;
  }

  return card;
}

function gerarEstrelas(nota) {
  const cheias = Math.floor(nota);
  const meia = nota % 1 >= 0.5 ? 1 : 0;
  const vazias = 5 - cheias - meia;

  return "★".repeat(cheias) + (meia ? "★" : "") + "☆".repeat(vazias);
}

function filtrarCategoria(categoria) {
  estadoApp.categoriaAtual = categoria;

  // Atualiza pills ativas
  document.querySelectorAll(".category-pill").forEach((pill) => {
    pill.classList.remove("active");
    if (pill.dataset.categoria === categoria) {
      pill.classList.add("active");
    }
  });

  carregarCardapio();
}

function filtrarPratos() {
  carregarCardapio();
}

// ===== DETALHE DO PRATO =====
function abrirDetalhePrato(prato) {
  estadoApp.pratoAtual = prato;
  estadoApp.tamanhoSelecionado = "meia";
  estadoApp.quantidade = 1;
  estadoApp.adicionaisSelecionados = [];

  // Atualiza a tela de detalhe
  const img = document.getElementById("detalheImagem");
  if (prato.imagem) {
    img.src = prato.imagem;
    img.alt = prato.nome;
    img.style.display = "block";
  } else {
    // Placeholder para bebidas
    img.style.display = "none";
  }

  document.getElementById("detalheNome").textContent = prato.nome;
  document.getElementById("detalheStars").textContent = gerarEstrelas(
    prato.avaliacao,
  );
  document.getElementById("detalheAvaliacao").textContent = prato.avaliacao;
  document.getElementById("detalheNumAvaliacoes").textContent =
    `${prato.numAvaliacoes} avaliações`;
  document.getElementById("detalheDescricao").textContent = prato.descricao;

  // Seletor de tamanho (só para porções com meia/inteira)
  const tamanhoSelector = document.getElementById("tamanhoSelector");
  const infoGrid = document.getElementById("infoGrid");

  if (prato.precoMeia) {
    // Porções com meia/inteira
    tamanhoSelector.style.display = "block";
    infoGrid.style.display = "flex";

    // Atualiza labels para meia/inteira
    const optMeia = document.querySelector(
      '.tamanho-option[data-tamanho="meia"]',
    );
    const optInteira = document.querySelector(
      '.tamanho-option[data-tamanho="inteira"]',
    );
    if (optMeia) optMeia.querySelector(".tamanho-nome").textContent = "Meia";
    if (optInteira)
      optInteira.querySelector(".tamanho-nome").textContent = "Inteira";

    document.getElementById("precoMeia").textContent = formatarPreco(
      prato.precoMeia,
    );
    document.getElementById("precoInteira").textContent = formatarPreco(
      prato.precoInteira,
    );
    document.getElementById("infoPeso").textContent = prato.peso || "-";
    document.getElementById("infoServe").textContent = prato.serveMeia || "-";
    document.getElementById("infoTempo").textContent =
      prato.tempoPreparo || "~20min";

    // Reset seleção de tamanho
    document.querySelectorAll(".tamanho-option").forEach((opt) => {
      opt.classList.remove("active");
      if (opt.dataset.tamanho === "meia") opt.classList.add("active");
    });
    estadoApp.tamanhoSelecionado = "meia";
  } else if (prato.preco1un) {
    // Mexicanos com 1 unidade / 2 unidades
    tamanhoSelector.style.display = "block";
    infoGrid.style.display = "none";

    // Atualiza labels para 1un/2un
    const optMeia = document.querySelector(
      '.tamanho-option[data-tamanho="meia"]',
    );
    const optInteira = document.querySelector(
      '.tamanho-option[data-tamanho="inteira"]',
    );
    if (optMeia)
      optMeia.querySelector(".tamanho-nome").textContent = "1 Unidade";
    if (optInteira)
      optInteira.querySelector(".tamanho-nome").textContent = "2 Unidades";

    document.getElementById("precoMeia").textContent = formatarPreco(
      prato.preco1un,
    );
    document.getElementById("precoInteira").textContent = formatarPreco(
      prato.preco2un,
    );

    // Reset seleção
    document.querySelectorAll(".tamanho-option").forEach((opt) => {
      opt.classList.remove("active");
      if (opt.dataset.tamanho === "meia") opt.classList.add("active");
    });
    estadoApp.tamanhoSelecionado = "meia";
  } else {
    tamanhoSelector.style.display = "none";
    infoGrid.style.display = "none";
  }

  // Adicionais (só para porções)
  const adicionaisSection = document.getElementById("adicionaisSection");
  if (prato.categoria === "porcoes") {
    adicionaisSection.style.display = "block";
    carregarAdicionais();
  } else {
    adicionaisSection.style.display = "none";
  }

  // Quantidade
  document.getElementById("quantidadeValor").textContent = 1;

  // Atualiza total
  atualizarTotalItem();

  mostrarTela("telaDetalhe");
}

function carregarAdicionais() {
  const container = document.getElementById("adicionaisList");
  container.innerHTML = "";

  ADICIONAIS.forEach((adicional) => {
    const div = document.createElement("div");
    div.className = "adicional-item";
    div.innerHTML = `
            <div class="adicional-info">
                <input type="checkbox" id="adicional-${adicional.id}" onchange="toggleAdicional(${adicional.id})">
                <label for="adicional-${adicional.id}">${adicional.nome}</label>
            </div>
            <span class="adicional-preco">+ R$ ${adicional.preco.toFixed(2).replace(".", ",")}</span>
        `;
    container.appendChild(div);
  });
}

function selecionarTamanho(tamanho) {
  estadoApp.tamanhoSelecionado = tamanho;

  document.querySelectorAll(".tamanho-option").forEach((opt) => {
    opt.classList.remove("active");
    if (opt.dataset.tamanho === tamanho) {
      opt.classList.add("active");
    }
  });

  // Atualiza info de "serve"
  if (estadoApp.pratoAtual) {
    const serve =
      tamanho === "meia"
        ? estadoApp.pratoAtual.serveMeia
        : estadoApp.pratoAtual.serveInteira;
    document.getElementById("infoServe").textContent = serve;
  }

  atualizarTotalItem();
}

function alterarQuantidade(delta) {
  estadoApp.quantidade = Math.max(1, estadoApp.quantidade + delta);
  document.getElementById("quantidadeValor").textContent = estadoApp.quantidade;
  atualizarTotalItem();
}

function toggleAdicional(id) {
  const index = estadoApp.adicionaisSelecionados.indexOf(id);
  if (index === -1) {
    estadoApp.adicionaisSelecionados.push(id);
  } else {
    estadoApp.adicionaisSelecionados.splice(index, 1);
  }
  atualizarTotalItem();
}

function atualizarTotalItem() {
  const prato = estadoApp.pratoAtual;
  if (!prato) return;

  let preco = 0;

  if (prato.precoMeia) {
    // Porções meia/inteira
    preco =
      estadoApp.tamanhoSelecionado === "meia"
        ? prato.precoMeia
        : prato.precoInteira;
  } else if (prato.preco1un) {
    // Mexicanos 1un/2un
    preco =
      estadoApp.tamanhoSelecionado === "meia" ? prato.preco1un : prato.preco2un;
  } else {
    preco = prato.preco;
  }

  // Adiciona os adicionais
  estadoApp.adicionaisSelecionados.forEach((id) => {
    const adicional = ADICIONAIS.find((a) => a.id === id);
    if (adicional) preco += adicional.preco;
  });

  // Multiplica pela quantidade
  const total = preco * estadoApp.quantidade;

  document.getElementById("totalItem").textContent = formatarPreco(total);
}

// ===== CARRINHO =====
function adicionarAoCarrinho() {
  const prato = estadoApp.pratoAtual;
  if (!prato) return;

  let preco = 0;
  let nome = prato.nome;

  if (prato.precoMeia) {
    // Porções meia/inteira
    preco =
      estadoApp.tamanhoSelecionado === "meia"
        ? prato.precoMeia
        : prato.precoInteira;
    nome += estadoApp.tamanhoSelecionado === "meia" ? " (Meia)" : " (Inteira)";
  } else if (prato.preco1un) {
    // Mexicanos 1un/2un
    preco =
      estadoApp.tamanhoSelecionado === "meia" ? prato.preco1un : prato.preco2un;
    nome += estadoApp.tamanhoSelecionado === "meia" ? " (1 Un)" : " (2 Un)";
  } else {
    preco = prato.preco;
  }

  // Adicionais
  const adicionaisNomes = [];
  estadoApp.adicionaisSelecionados.forEach((id) => {
    const adicional = ADICIONAIS.find((a) => a.id === id);
    if (adicional) {
      preco += adicional.preco;
      adicionaisNomes.push(adicional.nome);
    }
  });

  const item = {
    id: Date.now(),
    pratoId: prato.id,
    nome: nome,
    preco: preco,
    quantidade: estadoApp.quantidade,
    adicionais: adicionaisNomes,
  };

  estadoApp.carrinho.push(item);
  salvarCarrinho();
  atualizarHeaderCarrinho();

  // Mostra modal de decisão
  document.getElementById("modalDecisao").classList.add("active");
}

function salvarCarrinho() {
  localStorage.setItem(
    "losHermanosCarrinho",
    JSON.stringify(estadoApp.carrinho),
  );
}

function atualizarHeaderCarrinho() {
  const total = estadoApp.carrinho.reduce(
    (sum, item) => sum + item.preco * item.quantidade,
    0,
  );
  document.getElementById("headerCartTotal").textContent =
    `R$ ${total.toFixed(2).replace(".", ",")}`;
}

function continuarComprando() {
  document.getElementById("modalDecisao").classList.remove("active");
  voltarParaCardapio();
}

function voltarParaCardapio() {
  mostrarTela("telaCardapio");
}

function abrirCarrinho() {
  irParaEndereco();
}

// ===== ENDEREÇO =====
function irParaEndereco() {
  document.getElementById("modalDecisao").classList.remove("active");

  // Carrega bairros da filial selecionada
  carregarBairros();

  // Carrega resumo do pedido
  carregarResumoPedido();

  mostrarTela("telaEndereco");
}

function selecionarFilial(filial) {
  estadoApp.filialSelecionada = filial;
  estadoApp.bairroSelecionado = null;
  estadoApp.taxaEntrega = 0;

  // Atualiza visual das opções
  document.querySelectorAll(".filial-option").forEach((opt) => {
    opt.classList.remove("active");
    if (opt.dataset.filial === filial) {
      opt.classList.add("active");
    }
  });

  carregarBairros();
  carregarResumoPedido();
}

function carregarBairros() {
  const select = document.getElementById("bairroSelect");
  const filial = FILIAIS[estadoApp.filialSelecionada];

  select.innerHTML = '<option value="">Escolha um bairro...</option>';

  filial.bairros.forEach((bairro, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${bairro.nome} - R$ ${bairro.taxa.toFixed(2).replace(".", ",")}`;
    select.appendChild(option);
  });
}

function selecionarBairro() {
  const select = document.getElementById("bairroSelect");
  const index = select.value;

  if (index !== "") {
    const filial = FILIAIS[estadoApp.filialSelecionada];
    const bairro = filial.bairros[index];

    estadoApp.bairroSelecionado = bairro.nome;
    estadoApp.taxaEntrega = bairro.taxa;

    // Atualiza header
    document.getElementById("headerBairro").textContent = bairro.nome;
  } else {
    estadoApp.bairroSelecionado = null;
    estadoApp.taxaEntrega = 0;
  }

  carregarResumoPedido();
}

function carregarResumoPedido() {
  const container = document.getElementById("resumoItens");
  container.innerHTML = "";

  let subtotal = 0;

  estadoApp.carrinho.forEach((item) => {
    const itemTotal = item.preco * item.quantidade;
    subtotal += itemTotal;

    const div = document.createElement("div");
    div.className = "resumo-item";
    div.innerHTML = `
            <span>${item.quantidade}x ${item.nome}</span>
            <span>R$ ${itemTotal.toFixed(2).replace(".", ",")}</span>
        `;
    container.appendChild(div);
  });

  document.getElementById("resumoSubtotal").textContent =
    `R$ ${subtotal.toFixed(2).replace(".", ",")}`;
  document.getElementById("resumoTaxa").textContent =
    `R$ ${estadoApp.taxaEntrega.toFixed(2).replace(".", ",")}`;

  const total = subtotal + estadoApp.taxaEntrega;
  document.getElementById("resumoTotal").textContent =
    `R$ ${total.toFixed(2).replace(".", ",")}`;
}

// ===== CONFIRMAÇÃO =====
function confirmarPedido() {
  // Validações básicas
  if (estadoApp.carrinho.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }

  if (!estadoApp.bairroSelecionado) {
    alert("Por favor, selecione um bairro.");
    return;
  }

  // Gera número do pedido aleatório
  const numeroPedido = Math.floor(1000 + Math.random() * 9000);
  document.getElementById("numeroPedido").textContent = `#${numeroPedido}`;

  // Limpa o carrinho
  estadoApp.carrinho = [];
  salvarCarrinho();
  atualizarHeaderCarrinho();

  mostrarTela("telaConfirmacao");
}

function novoPedido() {
  // Reseta estado
  estadoApp.bairroSelecionado = null;
  estadoApp.taxaEntrega = 0;
  estadoApp.endereco = { rua: "", numero: "", referencia: "" };

  document.getElementById("headerBairro").textContent =
    "Selecione seu endereço";

  mostrarTela("telaCardapio");
}

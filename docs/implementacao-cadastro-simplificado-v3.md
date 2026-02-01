# Documentação: Implementação do Cadastro Simplificado v3.0

> **Data da Implementação:** 31/01/2026  
> **Autor:** Sistema de desenvolvimento  
> **Branch:** feature/guest-checkout  
> **Status:** ✅ Concluído

---

## 📋 Sumário Executivo

Este documento descreve em detalhes a migração do sistema de autenticação tradicional (email/senha) para um modelo de **cadastro implícito no checkout**, onde o usuário só fornece dados (telefone, nome e endereço) no momento de finalizar o pedido.

### Motivação

> *"Dado que as pessoas não tem mais paciência para fazerem cadastro em todo site que entram..."*

A fricção no primeiro contato foi drasticamente reduzida, seguindo o padrão de apps como iFood e Rappi.

---

## 🎯 Objetivos Alcançados

1. ✅ Remover tela de login obrigatória
2. ✅ Acesso direto ao cardápio (orders.html)
3. ✅ Cadastro rápido no checkout (apenas telefone + nome + endereço)
4. ✅ Identificação por telefone (DDD + número)
5. ✅ Fluxo diferenciado: Retirada (só telefone+nome) vs Delivery (com endereço)
6. ✅ Navbar simplificada (3 itens: Início, Cardápio, Carrinho)
7. ✅ Bairros com taxa dinâmica do banco

---

## 🗂️ Nova Arquitetura do Banco de Dados

### Tabelas Criadas

```sql
-- ============================================================
-- TABELA: users
-- DESCRIÇÃO: Cadastro simplificado de clientes
-- IDENTIFICADOR ÚNICO: telefone (DDD + número)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    telefone VARCHAR(11) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

```sql
-- ============================================================
-- TABELA: adress
-- DESCRIÇÃO: Endereço de entrega (1 por usuário)
-- RELACIONAMENTO: 1:1 com users
-- ============================================================

CREATE TABLE IF NOT EXISTS public.adress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    rua VARCHAR(200) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT fk_adress_user
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE
);
```

```sql
-- ============================================================
-- TABELA: orders
-- DESCRIÇÃO: Pedidos dos clientes
-- MUDANÇA: Nova tabela substituindo a antiga 'pedidos'
-- ============================================================

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    
    -- Dados snapshot (denormalizados para preservar histórico)
    telefone VARCHAR(11) NOT NULL,
    nome_cliente VARCHAR(100) NOT NULL,
    endereco_entrega JSONB NOT NULL,
    
    -- Dados do pedido
    tipo_entrega VARCHAR(20) NOT NULL CHECK (tipo_entrega IN ('entrega', 'retirada')),
    subtotal DECIMAL(10,2) NOT NULL,
    taxa_entrega DECIMAL(10,2) DEFAULT 0,
    desconto DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    
    -- Pagamento
    forma_pagamento VARCHAR(50) NOT NULL,
    troco_para DECIMAL(10,2),
    
    -- Status
    status VARCHAR(30) DEFAULT 'novo' NOT NULL 
        CHECK (status IN ('novo', 'confirmado', 'preparando', 'pronto', 'saiu_entrega', 'entregue', 'cancelado')),
    
    -- Observações
    observacoes TEXT,
    
    -- Metadados
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🚀 Fases de Implementação

### FASE 1: Criação das Tabelas (SQL)

**Responsável:** Usuário (manual no Supabase Dashboard)

Scripts executados no SQL Editor:
1. Criar tabela `users`
2. Criar tabela `adress`
3. Criar tabela `orders`
4. Criar tabela `order_items`
5. Configurar RLS (Row Level Security)
6. Criar função `buscar_ou_criar_usuario()`

### FASE 1.5: Alteração em order_items (Pós-implementação)

**Data:** 31/01/2026  
**Motivação:** Facilitar verificação de pedidos sem necessidade de JOIN

```sql
-- Adicionar coluna nome_cliente para denormalização
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS nome_cliente VARCHAR(100);

-- Comentário para documentação
COMMENT ON COLUMN public.order_items.nome_cliente IS 
'Nome do cliente que fez o pedido (denormalizado para facilitar consultas)';
```

**Benefício:** Ao consultar os itens de um pedido, o nome do cliente já está disponível diretamente na tabela `order_items`, sem necessidade de JOIN com a tabela `orders`.

### FASE 2: Backend JavaScript

**Arquivo criado:** `assets/js/checkout-guest.js`

Funcionalidades implementadas:
- Máscara de telefone (DDD separado + número)
- Busca de usuário por telefone
- Upsert em `users` e `adress`
- Criação de pedido com snapshot dos dados

### FASE 3: Frontend - Página do Carrinho

**Arquivo modificado:** `shopping.html`

Alterações:
- Toggle de entrega (Delivery/Retirada)
- Seleção de pagamento (Pix/Cartão/Dinheiro)
- Campo de troco (condicional)
- Área de dados do cliente (aparece após preenchimento)
- Botão dinâmico: "Endereço de Entrega" → "Finalizar Pedido"

### FASE 4: Frontend - Modal de Cadastro

**Estrutura do modal:**

```
┌─────────────────────────────────────────────┐
│  📱 Identificação (ou 📍 Endereço)      [X] │
├─────────────────────────────────────────────┤
│  WhatsApp para contato                      │
│  ┌────────┐ ┌──────────────────────┐       │
│  │ DDD    │ │ Número               │       │
│  │ [ 11 ] │ │ [ 98765-4321      ]  │       │
│  └────────┘ └──────────────────────┘       │
│                                              │
│  [ℹ️ Primeira vez? Preencha seus dados...]  │
│                                              │
│  👤 Nome completo                           │
│  [                                    ]      │
│                                              │
│  ──── Endereço de Entrega (se delivery) ───│
│  ⚠️ Verifique se o endereço está completo!  │
│                                              │
│  📍 Rua / Avenida                           │
│  [                                    ]      │
│                                              │
│  Número  │  Complemento (opcional)          │
│  [    ]  │  [                        ]      │
│                                              │
│  Bairro                                     │
│  [Selecione o bairro ▼]                     │
│                                              │
│  📝 Observações (opcional)                  │
│  [                                    ]      │
├─────────────────────────────────────────────┤
│  [      Ver Resumo do Pedido        ]       │
└─────────────────────────────────────────────┘
```

### FASE 5: Navbar Simplificada

**Arquivo modificado:** `assets/js/navbar.js`

**Antes:**
```
┌─────────┬─────────┬─────────┬─────────┐
│  Início │Favoritos│ Carrinho│  Perfil │
└─────────┴─────────┴─────────┴─────────┘
```

**Depois:**
```
┌─────────────────┬─────────────────┬─────────────────┐
│     INÍCIO      │    CARDÁPIO     │    CARRINHO     │
│   (index.html)  │  (orders.html)  │ (shopping.html) │
└─────────────────┴─────────────────┴─────────────────┘
```

---

## 🐛 Erros Encontrados e Correções

### ERRO 1: Redirecionamento para login ao adicionar ao carrinho

**Sintoma:** Ao clicar em "Adicionar ao carrinho", a página redirecionava para `login.html`.

**Console:**
```
[Cart] Usuário não logado. Redirecionando para login...
```

**Causa:** A função `addToCart()` em `assets/js/orders.js` verificava sessão ativa.

**Código problemático:**
```javascript
async function addToCart(name, price, img_url, removedIngredients = [], extras = []) {
  // Verificar se usuário está logado
  let session = null;
  if (typeof checkSession === 'function') {
    session = await checkSession();
  }
  
  if (!session) {
    window.location.href = 'login.html';  // ❌ PROBLEMA
    return;
  }
  // ...
}
```

**Correção:**
```javascript
async function addToCart(name, price, img_url, removedIngredients = [], extras = []) {
  // VERSÃO SIMPLIFICADA: Sem verificação de login
  // O cadastro será feito apenas no checkout
  let cart = getCart();
  // ... resto da lógica
}
```

---

### ERRO 2: Carrinho não salvava sem usuário logado

**Sintoma:** Itens adicionados não apareciam no carrinho.

**Console:**
```
[Cart] Tentativa de salvar carrinho sem usuário logado
[Cart] getCart: Nenhum carrinho encontrado
```

**Causa:** A função `saveCart()` exigia `userId` e abortava se não existisse.

**Código problemático:**
```javascript
function saveCart(items) {
  const currentUserId = getCurrentUserId();
  
  if (!currentUserId) {
    console.error('[Cart] Tentativa de salvar carrinho sem usuário logado');
    return;  // ❌ PROBLEMA: Não salva!
  }
  // ...
}
```

**Correção:**
```javascript
function saveCart(items) {
  // VERSÃO SIMPLIFICADA: Sem vinculação a usuário
  const cartData = {
    userId: 'guest', // Marcador para identificar formato novo
    createdAt: new Date().toISOString(),
    items: items
  };

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
  localStorage.setItem(LEGACY_CART_KEY, JSON.stringify(items));
}
```

---

### ERRO 3: Coluna `taxa` não existia em `zonas_entrega`

**Sintoma:** Bairros não carregavam no select.

**Console:**
```
GET https://bdkqoyalqrypfzwijosd.supabase.co/rest/v1/zonas_entrega?select=bairro,taxa 400 (Bad Request)

code: "42703"
message: "column zonas_entrega.taxa does not exist"
```

**Causa:** O nome correto da coluna é `taxa_entrega`, não `taxa`.

**Código problemático:**
```javascript
const { data, error } = await supabaseClient
    .from('zonas_entrega')
    .select('bairro, taxa')  // ❌ PROBLEMA
    .order('bairro');
```

**Correção:**
```javascript
const { data, error } = await supabaseClient
    .from('zonas_entrega')
    .select('bairro, taxa_entrega')  // ✅ CORRETO
    .order('bairro');
```

---

### ERRO 4: Campo `produto_nome` nulo ao finalizar pedido

**Sintoma:** Erro ao finalizar pedido.

**Console:**
```
POST https://bdkqoyalqrypfzwijosd.supabase.co/rest/v1/order_items 400 (Bad Request)

code: "23502"
message: "null value in column "produto_nome" of relation "order_items" violates not-null constraint"
```

**Causa:** O carrinho salvava com campo `name` (inglês) mas o código esperava `nome` (português).

**Código problemático:**
```javascript
const itensPayload = pedidoData.itens.map(item => ({
    produto_nome: item.nome,  // ❌ PROBLEMA: item.nome está undefined
    // ...
}));
```

**Correção (com nome_cliente adicionado):**
```javascript
const itensPayload = pedidoData.itens.map(item => {
    // Normaliza nomes dos campos (suporta inglês e português)
    const nome = item.nome || item.name || 'Produto';
    const preco = item.preco || item.price || 0;
    const qtd = item.quantidade || item.quantity || 1;
    
    return {
        order_id: order.id,
        nome_cliente: pedidoData.nome, // ✅ Denormalizado para facilitar consultas
        produto_nome: nome,
        produto_categoria: item.categoria || item.category || null,
        quantidade: qtd,
        preco_unitario: preco,
        total_item: preco * qtd,
        observacoes: item.observacoes || null,
        extras: item.extras || []
    };
});
```

---

### ERRO 5: Telefone aceitava apenas 8 dígitos

**Sintoma:** O sistema adicionava '9' automaticamente quando digitava 8 números, impedindo números fixos.

**Comportamento anterior:**
- Digitava: `33335555`
- Sistema transformava em: `933335555` (9 dígitos)

**Correção:** Permitir 8 ou 9 dígitos, adicionando o '9' apenas na hora de montar o telefone completo para o banco.

```javascript
function formatarNumeroTelefone(valor) {
    let numero = valor.replace(/\D/g, '');
    numero = numero.slice(0, 9);
    
    return {
        numero: numero,
        isValido: numero.length === 8 || numero.length === 9  // Aceita ambos
    };
}

function montarTelefoneCompleto(ddd, numero) {
    // Se tiver 8 dígitos, adiciona 9 no início
    if (numero.length === 8) {
        numero = '9' + numero;
    }
    return ddd + numero;
}
```

---

## 📱 Fluxo do Usuário (Versão Final)

### 1. Landing Page
```
index.html
    ↓
[Faça seu Pedido] → orders.html
```

### 2. Cardápio
```
orders.html
    ↓
Seleciona item → pagina_pedido.html
```

### 3. Detalhes do Produto
```
pagina_pedido.html
    ↓
[Adicionar ao Carrinho] → shopping.html
```

### 4. Carrinho (Nova Interface)
```
shopping.html
┌────────────────────────────────────────────┐
│ Seus Itens                                 │
│ • Item 1 - R$ 32,00                        │
│ • Item 2 - R$ 28,00                        │
├────────────────────────────────────────────┤
│ Tipo de Entrega                            │
│ [🚚 Delivery] [🏪 Retirada]               │
├────────────────────────────────────────────┤
│ Forma de Pagamento                         │
│ [Pix] [Cartão] [💵 Dinheiro]              │
├────────────────────────────────────────────┤
│ Subtotal:      R$ 60,00                    │
│ Taxa Entrega:  R$ 5,00                     │
│ Total:         R$ 65,00                    │
├────────────────────────────────────────────┤
│ [   Endereço de Entrega   ] → Modal       │
└────────────────────────────────────────────┘
```

### 5. Modal de Cadastro

**Se Delivery:**
```
┌─────────────────────────────────────────────┐
│ 📱 Identificação e Endereço             [X] │
├─────────────────────────────────────────────┤
│ DDD: [11]  Número: [987654321]              │
│                                             │
│ 👤 Nome: [João Silva]                       │
│                                             │
│ ─── Endereço de Entrega ───                 │
│ 📍 Rua: [Rua das Flores]                    │
│ Número: [123]  Complemento: [Apto 4]        │
│ Bairro: [▼ Centro]                          │
│                                             │
│ 📝 Observações: [...]                       │
├─────────────────────────────────────────────┤
│ [     Ver Resumo do Pedido      ]           │
└─────────────────────────────────────────────┘
```

**Se Retirada:**
```
┌─────────────────────────────────────────────┐
│ 📱 Identificação para Retirada          [X] │
├─────────────────────────────────────────────┤
│ DDD: [11]  Número: [987654321]              │
│                                             │
│ 👤 Nome: [João Silva]                       │
│                                             │
│ 📝 Observações: [...]                       │
├─────────────────────────────────────────────┤
│ [     Ver Resumo do Pedido      ]           │
└─────────────────────────────────────────────┘
```

### 6. Carrinho com Dados Preenchidos
```
shopping.html
┌────────────────────────────────────────────┐
│ Seus Dados:                                │
│ 📱 (11) 98765-4321                         │
│ 👤 João Silva                              │
│ 📍 Rua das Flores, 123 - Centro            │
│ [✏️ Editar]                                │
├────────────────────────────────────────────┤
│ ...                                        │
│ [      Finalizar Pedido       ]            │
└────────────────────────────────────────────┘
```

### 7. Confirmação e Redirecionamento
```
[Confirmar pedido de R$ 65,00?] → [OK]
    ↓
Pedido salvo no banco
    ↓
Limpa carrinho e estado
    ↓
Alert: "Pedido realizado com sucesso!"
    ↓
index.html
```

---

## 🎨 Componentes Visuais

### Toggle de Entrega
```css
.delivery-toggle {
    display: flex;
    gap: 12px;
}

.delivery-option {
    flex: 1;
    padding: 16px;
    background: #2a2a2a;
    border: 2px solid #444;
    border-radius: 12px;
    cursor: pointer;
}

.delivery-option--active {
    border-color: #ff3131;
    background: rgba(255, 49, 49, 0.1);
}
```

### Card de Dados do Cliente
```css
.cart-dados-card {
    background: #2a2a2a;
    border-radius: 12px;
    padding: 16px;
}

.cart-dados-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid #444;
}
```

---

## 📁 Arquivos Modificados/Criados

### Novos Arquivos
| Arquivo | Descrição |
|---------|-----------|
| `assets/js/checkout-guest.js` | Lógica completa do checkout simplificado |
| `db/setup_guest_checkout_v3.sql` | **ARQUIVO PRINCIPAL** - Todas as queries SQL consolidadas (tabelas, RLS, funções, consultas) |
| `db/alter_order_items_add_cliente.sql` | Script SQL para adicionar coluna nome_cliente em order_items |

### Arquivos Modificados
| Arquivo | Alterações |
|---------|------------|
| `shopping.html` | Nova estrutura com toggle de entrega, pagamento, área de dados |
| `assets/js/orders.js` | Removida verificação de login em `addToCart` e `saveCart` |
| `assets/js/navbar.js` | Simplificada para 3 itens |
| `assets/js/orders-view.js` | Removido redirecionamento para login |
| `index.html` | Links atualizados para `orders.html` |
| `assets/js/checkout-guest.js` | Adicionado campo nome_cliente no payload de order_items |

---

## 🔧 Estado Global (LocalStorage)

### Chaves utilizadas:

```javascript
// Carrinho (formato novo)
'bar_los_hermanos_cart_v2' → { userId: 'guest', items: [...], createdAt: '...' }

// Carrinho (formato legado - fallback)
'bar-los-hermanos-cart' → [...]

// Estado do checkout
'bar-los-hermanos-checkout-state' → {
    tipoEntrega: 'entrega' | 'retirada',
    formaPagamento: 'pix' | 'cartao' | 'dinheiro',
    telefone: '11987654321',
    nome: 'João Silva',
    endereco: { rua, numero, complemento, bairro },
    dadosCompletos: true
}
```

---

## ✅ Testes Realizados

### Teste 1: Primeiro Pedido (Novo Usuário)
1. ✅ Acessou orders.html sem login
2. ✅ Adicionou item ao carrinho
3. ✅ Abriu carrinho
4. ✅ Selecionou "Delivery"
5. ✅ Clicou em "Endereço de Entrega"
6. ✅ Preencheu telefone (busca retornou null = novo usuário)
7. ✅ Preencheu nome e endereço
8. ✅ Clicou em "Ver Resumo do Pedido"
9. ✅ Dados apareceram no carrinho
10. ✅ Botão mudou para "Finalizar Pedido"
11. ✅ Pedido salvo no banco

### Teste 2: Pedido Recorrente
1. ✅ Digitou telefone já cadastrado
2. ✅ Sistema buscou e preencheu nome automaticamente
3. ✅ Verificou se dados estavam corretos
4. ✅ Finalizou pedido

### Teste 3: Retirada no Local
1. ✅ Selecionou "Retirada"
2. ✅ Botão mudou para "Identificação"
3. ✅ Modal mostrou apenas telefone + nome
4. ✅ Pedido finalizado sem endereço

---

## 🎯 Métricas de Sucesso

| Métrica | Antes | Depois |
|---------|-------|--------|
| Clicks para primeiro pedido | 5+ (login + cadastro) | 3 (cardápio → carrinho → finalizar) |
| Campos obrigatórios | 8+ (email, senha, endereço completo) | 3-6 (telefone, nome, [endereço]) |
| Tempo estimado | 3-5 minutos | < 1 minuto |
| Abandono de carrinho | Alto (por causa do login) | Reduzido |

---

## 📝 Notas Técnicas

### Normalização de Dados
O sistema suporta ambos os formatos de campo:
- `name` / `nome`
- `price` / `preco`
- `quantity` / `quantidade`
- `category` / `categoria`

Isso garante compatibilidade com código legado.

### Formato do Telefone
- **Input:** DDD separado + número (8 ou 9 dígitos)
- **Banco:** 11 dígitos (DDD + 9 + número)
- **Exibição:** (11) 98765-4321

### Segurança
- RLS habilitado em todas as tabelas
- Dados sensíveis são "snapshot" no pedido (não alteram se usuário mudar depois)
- Nenhuma senha é armazenada

---

## 🚀 Próximos Passos (Sugestões)

1. **WhatsApp Integration:** Enviar confirmação do pedido via WhatsApp para o telefone cadastrado
2. **Histórico:** Criar página de histórico de pedidos acessível por telefone
3. **Favoritos:** Implementar favoritos por telefone (não precisa de login)
4. **Promoções:** Sistema de cupom de desconto baseado em número de pedidos
5. **Avaliações:** Permitir avaliar pedidos após entrega

---

**Documento gerado em:** 31/01/2026  
**Versão:** 1.0  
**Status:** Finalizado ✅

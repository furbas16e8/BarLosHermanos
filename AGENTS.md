# Documentação para Agentes de IA (`AGENTS.md`)

> **Atualizado em:** 31/01/2026  
> **Versão da Documentação:** 2.1  
> **Versão do Projeto:** 1.3.0

Este documento destina-se a orientar agentes de codificação de IA sobre a estrutura, arquitetura e convenções do projeto **Bar Los Hermanos**.

---

## 1. Visão Geral do Projeto

O **Bar Los Hermanos** é uma aplicação web **estática (Client-Side)** construída com tecnologias web fundamentais (HTML5, CSS3, JavaScript ES6+), integrada ao **Supabase** para backend as a service (BaaS). O sistema permite aos clientes navegar pelo cardápio, customizar pedidos, gerenciar carrinho e realizar pedidos para entrega ou retirada.

### 1.1 Funcionalidades Principais

- **Cardápio Digital Interativo:** Navegação por categorias (Comidas, Drinks, Cervejas, etc.)
- **Carrinho de Compras:** Adição de itens, cálculo de total e gestão de pedidos com isolamento por usuário
- **Autenticação de Clientes:** Cadastro e login via Supabase Auth
- **Sistema de Múltiplos Endereços:** Gerenciamento de até 3 endereços por usuário (com endereço padrão)
- **Sistema de Favoritos:** Clientes logados podem salvar itens preferidos
- **Checkout Completo:** Finalização com cálculo de taxa de entrega por bairro, cupom de desconto (fidelidade), pagamento online ou em dinheiro
- **Delivery e Retirada:** Modalidades de entrega com zonas configuráveis
- **Design Responsivo:** Otimizado para celulares e desktops

### 1.2 Tecnologias Principais

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | HTML5 Semântico, CSS3 (Vanilla + Variáveis CSS), JavaScript (ES6+, Módulos ES) |
| **Backend/Banco** | Supabase (PostgreSQL, Auth, Realtime) |
| **Ícones** | Material Symbols (Google), FontAwesome 6 |
| **Fontes** | Bebas Neue (títulos), Poppins (corpo), Plus Jakarta Sans (dashboard) |
| **Supabase Client** | CDN: `@supabase/supabase-js@2` |

### 1.3 Estrutura de Páginas HTML

| Página | Descrição |
|--------|-----------|
| `index.html` | Landing page institucional com Hero Slider, Menu e Eventos |
| `orders.html` | Dashboard do cardápio (área logada) - destaques e categorias |
| `pagina_pedido.html` | Detalhes do produto com extras e observações |
| `shopping.html` | Carrinho de compras e checkout |
| `login.html` | Tela de login com integração Supabase Auth |
| `cadastro.html` | Cadastro de novos clientes |
| `perfil.html` | Perfil do usuário e histórico de pedidos |
| `favoritos.html` | Lista de itens favoritos do cliente |
| `address.html` | Gerenciamento de múltiplos endereços de entrega |
| `historia.html` | Página institucional sobre o bar |

---

## 2. Estrutura de Diretórios

```bash
/
├── .gitignore           # Arquivos ignorados pelo Git
├── AGENTS.md            # [DEV] Este arquivo
├── README.md            # Documentação pública do projeto
├── CHANGELOG.md         # Histórico de mudanças (SemVer)
├── *.html               # Páginas da aplicação
│
├── assets/              # Recursos estáticos (Público)
│   ├── css/             # Estilos CSS
│   │   ├── base/        # Reset e variáveis CSS
│   │   ├── components/  # Componentes reutilizáveis (BEM)
│   │   ├── pages/       # Estilos específicos de páginas
│   │   ├── utils/       # Utilitários CSS
│   │   ├── style.css    # Estilos principais (Landing)
│   │   ├── main.css     # Estilos do dashboard/app
│   │   └── orders.css   # Estilos específicos do carrinho
│   │
│   ├── js/              # Lógica Client-side
│   │   ├── supabase-client.js    # Cliente singleton + funções Auth
│   │   ├── dom-helpers.js        # Utilitários DOM (el, $, $$)
│   │   ├── navbar.js             # Navbar global inferior
│   │   ├── menu-service.js       # Serviço de dados do cardápio
│   │   ├── orders.js             # Lógica do Carrinho (LocalStorage) V2
│   │   ├── orders-view.js        # Renderização do cardápio
│   │   ├── details-view.js       # Página de detalhes do produto
│   │   ├── checkout.js           # Fluxo de finalização
│   │   ├── addresses.js          # API de gerenciamento de endereços
│   │   └── gallery.js            # Galeria de fotos da Home
│   │
│   ├── img/             # Imagens otimizadas
│   │   ├── events/      # Fotos de eventos/artistas
│   │   └── sobre/       # Fotos do ambiente/história
│   │
│   ├── menu/            # PDFs do cardápio físico
│   └── video/           # Vídeos de background (Hero)
│
├── db/                  # [DEV] Scripts SQL e Schema
│   ├── migrations/      # Scripts de migração do banco
│   ├── schema_tables.sql         # DDL das tabelas
│   ├── setup_delivery.sql        # Setup de zonas de entrega
│   └── *.sql                     # Queries exploratórias
│
├── docs/                # [DEV] Documentação detalhada
│   ├── doc_tables.md             # Documentação do schema
│   ├── doc_menu.md               # Documentação do cardápio
│   └── doc_*.md                  # Outras documentações
│
└── plans/               # [DEV] Planos de implementação
    └── implementation-plan_*.md  # Histórico de planejamentos
```

---

## 3. Arquitetura e Fluxo de Dados

### 3.1 Padrão de Arquitetura

O projeto segue um padrão **MVC Simplificado no Cliente**:

- **Model:** Supabase (PostgreSQL remoto) + LocalStorage (Carrinho local)
- **View:** Arquivos HTML (Estrutura) + `*-view.js` (Renderização Dinâmica via DOM)
- **Controller:** `orders.js`, `checkout.js`, `addresses.js` (Regras de Negócio e Event Listeners)

### 3.2 Gerenciamento de Estado

| Estado | Persistência | Local/Chave |
|--------|--------------|-------------|
| Sessão do Usuário | Supabase Auth | Cookies/Local (gerenciado pelo SDK) |
| Carrinho de Compras | LocalStorage | `bar_los_hermanos_cart_v2` |
| Favoritos | Supabase (persistente) + Memória (cache) | `currentUserFavs` (variável) |
| Perfil do Usuário | Supabase | Tabela `clientes` |
| Endereços | Supabase | Tabela `enderecos` |

### 3.3 Comunicação entre Módulos

A arquitetura não usa um state manager formal. A comunicação ocorre via:

1. **Funções globais no `window`:** `window.updateNavbarCartCount`, `window.toggleFavorite`, `window.addressesAPI`
2. **Eventos customizados:** Não utilizados extensivamente
3. **LocalStorage:** Sincronização de estado do carrinho entre páginas
4. **Callbacks:** Passagem de funções entre módulos

### 3.4 Banco de Dados (Supabase)

**Tabelas Principais:**

| Tabela | Propósito |
|--------|-----------|
| `cardapio` | Itens do menu com códigos SKU automáticos |
| `clientes` | Perfil dos usuários (vinculado ao Auth) |
| `enderecos` | Endereços de entrega (1:N com clientes) |
| `pedidos` | Cabeçalho das transações de compra |
| `itens_pedido` | Linhas de itens de cada pedido (snapshot) |
| `zonas_entrega` | Configuração de bairros, taxas e tempo |
| `favoritos` | Relacionamento N:N clientes × cardápio |

**Segurança (RLS):**
- Leitura pública para `cardapio`
- Escrita em `pedidos` apenas para usuários autenticados (dono do recurso)
- Triggers automáticos para geração de SKU (`cod`)
- Trigger para garantir apenas um endereço padrão por cliente

---

## 4. Convenções de Código

### 4.1 JavaScript

**Módulos:**
- Arquivos modernos usam ES Modules (`import/export`)
- Compatibilidade com scripts tradicionais via exposição no `window`

```javascript
// Exportação (ES Modules)
export const el = (tag, props, children) => { ... };

// Importação
import { el, $, $$ } from './dom-helpers.js';

// Exposição global (quando necessário)
window.updateNavbarCartCount = function() { ... };
```

**APIs globais expostas:**
- `window.supabaseClient` - Cliente Supabase inicializado
- `window.addressesAPI` - API de endereços (CRUD completo)
- `window.addToCart`, `window.getCart`, `window.saveCart` - Funções do carrinho

**Async/Await:** Obrigatório para chamadas ao Supabase:
```javascript
async function loadData() {
    const { data, error } = await supabaseClient.from('cardapio').select('*');
    if (error) throw error;
    return data;
}
```

**DOM Manipulation:** Preferência por `document.createElement` via `dom-helpers.js` ao invés de `innerHTML` complexo:
```javascript
// ✅ Correto
const card = el('div', { class: 'card' }, [
    el('h3', {}, 'Título'),
    el('p', {}, 'Descrição')
]);

// ❌ Evitar (exceto para conteúdo dinâmico simples)
container.innerHTML = `<div class="card"><h3>Título</h3>...</div>`;
```

**Logging:** Usar prefixos nos consoles para facilitar debug:
```javascript
console.log('[Cart] Mensagem do carrinho');
console.log('[Auth] Evento:', event);
```

### 4.2 CSS

**Arquitetura:**
- **Mobile-First:** Media queries para telas maiores (`min-width`)
- **CSS Variables:** Definidas em `:root` para consistência (ver `assets/css/base/variables.css`)
- **BEM (Block Element Modifier):** Convenção de nomenclatura

```css
/* Variáveis */
:root {
    --color-primary: #ff3131;
    --color-bg-dark: #000000;
    --color-surface-dark: #1a130c;
    --font-display: "Plus Jakarta Sans", sans-serif;
}

/* BEM */
.cart-item { }                    /* Block */
.cart-item__image { }             /* Element */
.cart-item__qty-btn--add { }      /* Modifier */
```

**Organização dos arquivos CSS:**
- `style.css` - Estilos da landing page (index.html)
- `main.css` - Estilos base do aplicativo (dashboard, login, etc.)
- `orders.css` - Estilos específicos do carrinho/checkout
- `components/*.css` - Componentes reutilizáveis (botões, cards, formulários)

### 4.3 HTML

**Semântica e Acessibilidade:**
- Tags semânticas (`<header>`, `<section>`, `<footer>`)
- Atributos `aria-label` em formulários
- Classes `.sr-only` para labels invisíveis (screen readers)
- `loading="lazy"` em imagens pesadas

---

## 5. Build e Deploy

### 5.1 Pré-requisitos

**NÃO requer Node.js/npm** para rodar. É uma aplicação estática pura.

Para desenvolvimento local:
- Extensão "Live Server" (VS Code) ou qualquer servidor HTTP estático
- Navegador moderno com suporte a ES Modules

### 5.2 Configuração do Supabase

As credenciais do Supabase estão hardcoded em `assets/js/supabase-client.js`:

```javascript
const SUPABASE_URL = 'https://bdkqoyalqrypfzwijosd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIs...'; // Anon key pública
```

**Segurança:** A chave é a `anon key` (pública). A segurança real vem do Row Level Security (RLS) configurado no PostgreSQL.

### 5.3 Deploy

A aplicação pode ser hospedada em qualquer serviço de hosting estático:
- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting

**Processo:**
1. Fazer push do código para o repositório
2. Conectar o serviço de hosting à pasta raiz
3. Configurar SPA fallback (se necessário para rotas)

---

## 6. Fluxos Principais

### 6.1 Autenticação

```
login.html → supabase-client.js (loginUser)
    → Sucesso: orders.html
    → Falha: Mensagem de erro
```

Cadastro cria registro em duas tabelas:
1. `auth.users` (Supabase Auth)
2. `public.clientes` (perfil estendido)

### 6.2 Adicionar ao Carrinho

```
pagina_pedido.html → orders.js (addToCart)
    → Verifica sessão (redireciona para login se não logado)
    → Atualiza LocalStorage (bar_los_hermanos_cart_v2)
    → Atualiza Badge na Navbar
    → Redireciona para shopping.html
```

**Isolamento do Carrinho (V2):**
- Carrinho é vinculado ao `userId` do usuário logado
- Expira ao final do dia (após 23:00 ou mudança de dia)
- Limpado automaticamente no logout

### 6.3 Checkout

```
shopping.html → checkout.js
    1. Verifica sessão
    2. Carrega dados do usuário
    3. Carrega endereços do usuário (addresses.js)
    4. Busca zona de entrega pelo bairro
    5. Calcula totais (subtotal + taxa - desconto)
    6. submitOrder() → cria registro em `pedidos`
    7. Cria registros em `itens_pedido`
    8. Limpa carrinho → Redireciona para perfil.html
```

### 6.4 Gerenciamento de Endereços

```
address.html → addresses.js
    1. Lista endereços do usuário (máximo 3 na UI)
    2. Permite criar, editar, excluir
    3. Define endereço padrão (trigger atualiza outros)
    4. Integração automática no checkout
```

---

## 7. Desenvolvimento

### 7.1 Adicionar Nova Página

1. Criar arquivo HTML na raiz
2. Incluir scripts necessários:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <script src="assets/js/supabase-client.js"></script>
   <script type="module" src="assets/js/navbar.js"></script>
   ```
3. Adicionar mapeamento em `navbar.js` → `highlightActiveLink()`
4. Seguir estrutura CSS existente

### 7.2 Adicionar Nova Categoria ao Cardápio

1. Inserir itens no banco com a nova categoria
2. Adicionar ícone em `orders-view.js` → objeto `icons`
3. Adicionar à ordenação `CATEGORY_ORDER` se necessário

### 7.3 Debug

- Usar `debug-connection.html` para testar conexão com Supabase
- Console do navegador mostra logs de erros das chamadas
- Dados do carrinho disponíveis em `localStorage.getItem('bar_los_hermanos_cart_v2')`

### 7.4 Chaves de LocalStorage

| Chave | Propósito | Formato |
|-------|-----------|---------|
| `bar_los_hermanos_cart_v2` | Carrinho V2 com isolamento | `{ userId, createdAt, items[] }` |
| `bar-los-hermanos-cart` | Carrinho legado (migrado) | `items[]` |

---

## 8. Limites e Regras de Negócio

| Funcionalidade | Limite/Regra |
|----------------|--------------|
| Endereços por usuário | Máximo 3 na UI (ilimitado no banco) |
| Expiração do carrinho | Fim do dia (23:00) ou troca de usuário |
| Desconto fidelidade | Após 5 pedidos concluídos (10% off) |
| Modos de entrega | Delivery / Retirada |
| Formas de pagamento | Cartão/Pix / Dinheiro |

---

## 9. Referências

- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript/installing)
- [Material Symbols](https://fonts.google.com/icons)
- [BEM Methodology](https://en.bem.info/methodology/)

---

**Desenvolvido por:** Douglas Furbino  
**Contato:** (Ver README.md)

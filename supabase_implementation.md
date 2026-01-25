# 🚀 Plano de Implementação: Integração Supabase & Cardápio Dinâmico

Este plano detalha a migração dos dados hardcoded (HTML) para o Banco de Dados (Supabase) e a refatoração do Front-end para consumir esses dados dinamicamente.

## 📦 1. Banco de Dados (Schema & Dados)

### 1.1 Modificação da Tabela (Schema)

Precisamos adicionar a coluna `destaque` para controlar o carrossel de "Combos em Destaque".

```sql
-- Adicionar coluna de destaque
ALTER TABLE cardapio
ADD COLUMN destaque BOOLEAN DEFAULT false;

-- Atualizar policies para permitir leitura pública da nova coluna (se necessário, geralmente é automático no SELECT *)
```

## 💻 2. Integração Front-end

### 2.1 Configuração (`assets/js/supabase-client.js`)

Arquivo central para inicializar a conexão.

- **Ação:** Criar arquivo novo.
- **Conteúdo:** Inicialização do `createClient` com variáveis (você precisará preencher a URL e Key).

### 2.2 Camada de Serviço (`assets/js/menu-service.js`)

Funções para buscar dados, abstraindo a query do Supabase dos arquivos de view.

- `getFeaturedItems()`: Busca onde `destaque = true` e `img_url IS NOT NULL`.
- `getItemsByCategory(category)`: Busca por categoria.
- `getItemById(id)`: Busca item único para página de detalhes.
- `getAllItems()`: Para listagem geral/popular.

### 2.3 Página Principal (`orders.html`)

- **Remoção:** Apagar os cards hardcoded dentro de `<!-- Featured Section -->` e `<!-- Popular Items Grid -->`.
- **Adição de Containers:** Adicionar `id="featured-container"` e `id="popular-container"`.
- **Script:**
  - Carregar `menu-service.js`.
  - Mapear categorias do banco (`burguers`, `bebidas`) para ícones (`lunch_dining`, `local_bar`).
  - Renderizar HTML dinamicamente.
  - Links dos cards devem apontar para `pagina_pedido.html?id={id}`.

### 2.4 Página de Detalhes (`pagina_pedido.html`)

- **Lógica de URL:** Ler `window.location.search` para pegar o `id`.
- **Fetch:** Chamar `getItemById(id)`.
- **Renderização:**
  - Atualizar Imagem de fundo.
  - Atualizar Título, Preço, Descrição.
  - (Opcional) Ingredientes dinâmicos se tivermos essa estrutura no futuro (por enquanto manter estático ou adaptar descrição).
  - Botão "Adicionar ao Carrinho" deve usar os dados do banco.

---

## 📅 Roadmap de Execução

1.  **BANCO**: Rodar script SQL de alteração de tabela e inserção de dados.
2.  **JS BASE**: Criar `supabase-client.js` e `menu-service.js`.
3.  **ORDERS**: Refatorar `orders.html` para limpar estáticos e consumir serviço.
4.  **DETAILS**: Refatorar `pagina_pedido.html` para carregar dados via ID.
5.  **TEST**: Verificar fluxo Pedidos -> Detalhes -> Carrinho.

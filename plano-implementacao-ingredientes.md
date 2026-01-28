# Plano de Implementação - Ingredientes Dinâmicos (Atualizado)

## Objetivo

Implementar sistema de ingredientes dinâmicos que permite ao cliente remover itens do pedido. A personalização deve refletir no carrinho, no checkout e na impressão do pedido.
**Status:** A coluna `ingredientes` já foi criada no banco de dados.

## Decisões Técnicas

1.  **Dados:** Coluna `ingredientes` (JSONB Array) na tabela `cardapio` já existe. Conteúdo: Array de strings dos itens removíveis (ex: `["Alface", "Tomate"]`).
2.  **Visual:** Ícones mapeados localmente no JS (`details-view.js`). Item removido fica cinza e riscado.
3.  **Carrinho:** Agrupamento por comparação profunda. Itens com as mesmas exclusões são somados; exclusões diferentes geram linhas novas.
4.  **Impressão:** Destaque para exclusões: "X-Burger (SEM: CEBOLA)" em caixa alta.

## Roteiro de Implementação

### 1. Frontend - Detalhes (`details-view.js` & `pagina_pedido.html`)

- [ ] **Mapeamento de Ícones:** Criar dicionário constante `INGREDIENT_ICONS` com ícones Material Symbols e cores.
- [ ] **Renderização:** Consumir array `ingredientes` do Supabase e gerar HTML dos cards dinamicamente.
- [ ] **Interatividade:** Implementar clique para "toggle" (adicionar/remover do Set de excluídos).
- [ ] **Botão Adicionar:** Modificar chamada `addToCart` para passar a lista de exclusões.

### 2. Lógica de Carrinho (`orders.js`)

- [ ] **Atualizar `addToCart`:**
  - Aceitar argumento extra `removedIngredients`.
  - Implementar lógica de comparação deep equal para agrupar ou criar novo item.
  - Estrutura do item: `{ ..., removed: ["Cebola"] }`.
- [ ] **Atualizar `updateCartUI`:**
  - Exibir lista de removidos abaixo do nome do item (ex: <small class="text-red-500">SEM: CEBOLA</small>).

### 3. Ajustes Finais

- [ ] **Verificação:** Testar fluxo completo (Adicionar -> Carrinho -> Verificação visual).

## Arquivos Afetados

#### [MODIFY] [details-view.js](file:///c:/Users/dougf/OneDrive/Documentos/GitHub/BarLosHermanos/assets/js/details-view.js)

- Adicionar mapa de ícones e lógica de renderização/interação.

#### [MODIFY] [orders.js](file:///c:/Users/dougf/OneDrive/Documentos/GitHub/BarLosHermanos/assets/js/orders.js)

- Adaptar funções de cart para suportar variações de ingredientes.

#### [MODIFY] [pagina_pedido.html](file:///c:/Users/dougf/OneDrive/Documentos/GitHub/BarLosHermanos/pagina_pedido.html)

- Garantir container vazio com ID correto para injeção.

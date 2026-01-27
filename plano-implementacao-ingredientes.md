# Plano de Implementação - Ingredientes Dinâmicos

## Objetivo

Tornar os cards de ingredientes na página de detalhes do produto (`pagina_pedido.html`) dinâmicos, buscando os dados da nova coluna `ingredientes` na tabela `cardapio`.

## Mudanças Propostas

### 1. Banco de Dados (Supabase)

- **SQL:** Adicionar coluna `ingredientes` do tipo `JSONB` à tabela `cardapio`.
- **Exemplo de valor:** `["Carne", "Queijo", "Bacon", "Cebola"]`.

### 2. Mapeamento de Ícones (Frontend)

- **Arquivo:** `assets/js/details-view.js`
- **Lógica:** Criar um dicionário (mapeamento) no JavaScript que associa nomes de ingredientes a ícones do Material Symbols e cores específicas.
  - Ex: `"Carne"` -> `lunch_dining`
  - Ex: `"Queijo"` -> `circle`
  - Ex: `"Bacon"` -> `kebab_dining`

### 3. Renderização Dinâmica

- **Arquivo:** `assets/js/details-view.js`
- **Mudança:** Ao carregar os detalhes do produto, iterar sobre o array `ingredientes`.
- **Ação:** Gerar o HTML dos cards de ingredientes e injetar no container `#ingredients-container`.

## Arquivos Afetados

#### [MODIFY] [details-view.js](file:///c:/Users/dougf/OneDrive/Documentos/GitHub/BarLosHermanos/assets/js/details-view.js)

- Adicionar lógica de mapeamento e renderização.

#### [MODIFY] [pagina_pedido.html](file:///c:/Users/dougf/OneDrive/Documentos/GitHub/BarLosHermanos/pagina_pedido.html)

- Adicionar ID ao container de ingredientes para permitir a injeção via JS.

## Plano de Verificação

### Testes Manuais

1. Inserir um array de ingredientes num item via painel do Supabase.
2. Abrir a página do produto.
3. Verificar se os ícones e nomes aparecem corretamente conforme o mapeamento.
4. Verificar se ingredientes não mapeados aparecem com um ícone padrão (ex: `restaurant`).

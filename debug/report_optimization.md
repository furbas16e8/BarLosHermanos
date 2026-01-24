# Relatório de Debug e Otimização - Bar Los Hermanos

**Data:** 24/01/2026
**Responsável:** Antigravity (IA)

## 1. Problemas Identificados

### 🔴 CRÍTICO

1.  **Link "Cadastro Rápido" Quebrado (`login.html`)**
    - **Arquivo/Linha:** `login.html:86`
    - **Erro:** `<a href="#">` não aponta para a página de cadastro.
    - **Causa:** O arquivo `cadastro.html` não existe na raiz do projeto (apenas em `new_order_layout/` como referência).
    - **Correção:** Criar `cadastro.html` traduzido na raiz e apontar o link corretamente.

2.  **Inconsistência de IDs no Carrinho (`shopping.html` vs `orders.js`)**
    - **Arquivo:** `assets/js/orders.js` e `shopping.html`
    - **Erro:** O script `orders.js` tenta atualizar elementos que não possuem os IDs esperados no novo layout de `shopping.html`.
    - **Detalhe:** `updateCartUI` busca por ID `checkout-total`, mas `shopping.html` não tem esse ID no elemento de total.
    - **Correção:** Adicionar IDs `cart-subtotal`, `cart-total`, `checkout-total` e `cart-items-container` nos locais corretos de `shopping.html`.

### 🟠 ALTA PRIORIDADE

3.  **Botões de Ação sem Funcionalidade (`index.html`)**
    - **Arquivo:** `index.html`
    - **Erro:** Itens do menu são apenas visuais e não adicionam ao carrinho.
    - **Impacto:** Usuário não consegue iniciar um pedido diretamente da landing page (exceto pelos botões "Faça um Pedido" que levam ao login).
    - **Correção:** Manter como está se for design intencional (landing page apenas informativa), ou conectar ao `orders.html`.

4.  **Feedback de Usuário Intrusivo (`orders.js`)**
    - **Arquivo:** `assets/js/orders.js:48`
    - **Erro:** Uso de `alert()` para confirmar adição ao carrinho.
    - **Impacto:** Interrompe o fluxo do usuário de forma pobre.
    - **Otimização:** Substituir por um toast notification ou feedback visual no botão.

### 🟡 MÉDIA PRIORIDADE

5.  **Hardcoded Values em `shopping.html`**
    - **Arquivo:** `shopping.html`
    - **Erro:** Valores monetários (R$ 74,50) estão fixos no HTML estático.
    - **Impacto:** Se o JS falhar ou demorar, o usuário vê valores incorretos.
    - **Correção:** Iniciar com valores zerados ou placeholder, e deixar `orders.js` popular tudo.

## 2. Plano de Ação (Debug e Correção)

1.  **Criar `cadastro.html`**: Baseado em `new_order_layout/cadastro.html`, traduzido para PT-BR e integrado com `styles_new.css` e `navbar.js` (opcional no cadastro, mas bom para consistência).
2.  **Corrigir `login.html`**: Atualizar link para `cadastro.html`.
3.  **Compatibilizar `shopping.html`**: Adicionar IDs necessários para `orders.js` funcionar.
4.  **Otimizar `orders.js`**: Melhorar feedback visual e garantir que `checkout-total` seja atualizado.
5.  **Revisão Geral**: Garantir que botões de voltar (`history.back()`) e links de navegação estejam funcionais em todas as páginas.

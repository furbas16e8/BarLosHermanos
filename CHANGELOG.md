# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2026-01-31

### Added

- **Guest Checkout v3.0 - Cadastro Simplificado**: Implementação completa de checkout sem necessidade de login prévio.
  - Nova tabela `users` com identificação por telefone (DDD + número) como chave única
  - Nova tabela `adress` para armazenar 1 endereço por usuário
  - Nova tabela `orders` com estrutura otimizada para pedidos sem autenticação
  - Nova tabela `order_items` com campo `nome_cliente` denormalizado para facilitar consultas
  - Arquivo SQL consolidado `db/setup_guest_checkout_v3.sql` com todas as queries
  - Script de alteração `db/alter_order_items_add_cliente.sql` para adicionar campo de nome

- **Fluxo Diferenciado de Entrega**:
  - **Delivery**: Solicita telefone, nome e endereço completo (rua, número, complemento, bairro)
  - **Retirada**: Solicita apenas telefone e nome (endereço não necessário)
  - Toggle de seleção no carrinho com atualização dinâmica de taxa de entrega

- **Nova Página de Carrinho (`shopping.html`)**:
  - Seleção de tipo de entrega (Delivery/Retirada) com toggle visual
  - Seleção de forma de pagamento (Pix/Cartão/Dinheiro) com cards interativos
  - Campo de troco condicional (apenas para pagamento em dinheiro)
  - Área de "Seus Dados" que aparece após preenchimento no modal
  - Botão dinâmico: "Endereço de Entrega" → "Finalizar Pedido"

- **Modal de Cadastro Rápido**:
  - Campos de telefone separados (DDD + número)
  - Aceita números com 8 ou 9 dígitos (adiciona '9' automaticamente quando necessário)
  - Busca automática de usuário por telefone (preenche dados se já cadastrado)
  - Mensagem contextual para primeira vez vs. usuário recorrente
  - Campos de endereço condicionais (apenas para delivery)
  - Select de bairros carregado dinamicamente do banco (`zonas_entrega`)

- **Sistema de Estado Persistente**:
  - Estado do checkout salvo em `localStorage` (`bar-los-hermanos-checkout-state`)
  - Recuperação automática de dados ao recarregar página
  - Sincronização entre página do carrinho e modal

- **Documentação Completa**:
  - Plano de implementação detalhado (`plans/implementation-plan-v3.md`)
  - Documentação técnica completa (`docs/implementacao-cadastro-simplificado-v3.md`)
  - Queries SQL documentadas e organizadas na pasta `db/`

### Changed

- **Navbar Simplificada**: Reduzida de 4 para 3 itens (Início, Cardápio, Carrinho)
  - Removidos: Favoritos e Perfil (não necessários sem autenticação)
  - Ícones atualizados: `home`, `restaurant_menu`, `shopping_cart`

- **Remoção de Login Obrigatório**:
  - Links da landing page (`index.html`) direcionam para `orders.html` (não `login.html`)
  - Função `addToCart()` em `orders.js` não verifica mais sessão ativa
  - Função `saveCart()` aceita usuário 'guest' sem necessidade de autenticação
  - Página `orders.html` acessível sem redirecionamento para login

- **Módulo de Checkout (`assets/js/checkout-guest.js`)**:
  - Nova lógica de carregamento de carrinho (suporta formatos novo e legado)
  - Normalização de campos (name→nome, price→preco, quantity→quantidade)
  - Integração com tabelas `users`, `adress`, `orders`, `order_items`
  - Cálculo dinâmico de taxa de entrega por bairro

### Fixed

- **Bug**: Redirecionamento forçado para `login.html` ao adicionar item ao carrinho
  - Solução: Removida verificação de sessão em `addToCart()`

- **Bug**: Carrinho não persistia sem usuário logado
  - Solução: Modificada `saveCart()` para usar userId 'guest' e salvar em múltiplas chaves do localStorage

- **Bug**: Erro 42703 - Coluna `taxa` inexistente em `zonas_entrega`
  - Solução: Corrigido nome da coluna para `taxa_entrega` em todas as queries

- **Bug**: Erro 23502 - Campo `produto_nome` nulo ao finalizar pedido
  - Solução: Implementada normalização de campos para compatibilidade com dados legados (inglês→português)

- **Bug**: Telefone aceitava apenas 8 dígitos (adicionava '9' automaticamente)
  - Solução: Validador modificado para aceitar 8 ou 9 dígitos, adicionando '9' apenas no envio ao banco

- **Bug**: Valores do carrinho não apareciam no modal de checkout
  - Solução: Corrigida função `carregarCarrinho()` para ler de ambas as chaves do localStorage

- **Bug**: Bairros não carregavam no select do modal
  - Solução: Corrigida query do Supabase e implementado preenchimento dinâmico do select

## [1.3.0] - 2026-01-31

### Added

- **Sistema de Múltiplos Endereços**: Implementação completa de gerenciamento de endereços de entrega.
  - Nova tabela `enderecos` no banco (1:N com clientes)
  - Limite de 3 endereços por usuário na UI (ilimitado na estrutura do banco)
  - Campo `apelido` opcional para identificação (Casa, Trabalho, etc)
  - Sistema de endereço padrão (`is_padrao`) com trigger de unicidade
  - Nova API em `assets/js/addresses.js` com funções CRUD completas
  - Página `address.html` refatorada com cards, modal e validações
  - Integração no checkout (`shopping.html`) com cálculo de taxa por bairro
  - Salvamento de `endereco_id` na tabela `pedidos` para auditoria

### Changed

- **Perfil**: Exibição do apelido do endereço padrão na página de perfil
- **Checkout**: Simplificação da seleção de endereço - botão "ALTERAR" redireciona para gerenciamento centralizado

### Fixed

- **Bug**: `addressesAPI is not defined` no checkout - adicionado import do script em `shopping.html`

## [1.2.0] - 2026-01-30

### Added

- **Smart Phone Logic**: Implementação de lógica inteligente no frontend (`cadastro.html`) para preenchimento automático de prefixos telefônicos (Governador Valadares e Brasil) e remoção de zeros à esquerda.

### Changed

- **Banco de Dados (Clientes)**: Alteração da coluna `telefone` para `VARCHAR(16)` e adição de restriction check (`^[0-9]+$`) para garantir armazenamento apenas numérico.
- **Documentação**: Atualização do diagrama de tabelas (`docs/doc_tables.md`) refletindo a nova tipagem segura.

## [1.1.0] - 2026-01-30

### Added

- Sistema de extras dinâmicos com cálculo de preço em tempo real na página de detalhes do produto (`pagina_pedido.html`).
- Botões interativos de quantidade (+/-) para itens no carrinho de compras (`shopping.html`).
- Fallback automático para imagens de produtos (usando `placeholder_food.png`) quando a URL estiver ausente.
- Tags visuais para identificação de extras adicionados e ingredientes removidos no checkout.

### Changed

- Migração completa de Tailwind CSS para Vanilla CSS nas páginas de produto (`pagina_pedido.html`) e checkout (`shopping.html`).
- Refatoração do sistema de design utilizando variáveis CSS (`:root`) para cores, fontes e espaçamentos padronizados.
- Otimização da lógica de comparação de itens no carrinho para considerar variações de extras e ingredientes.
- Remoção do seletor de filiais para simplificar a experiência do usuário (UX).

### Fixed

- Correção de sobreposição de botões flutuantes fixos em relação à navbar global (ajuste de `z-index` e `bottom`).
- Correção do carregamento de imagens oriundas do Supabase com tratamento de campos nulos.
- Ajuste na responsividade dos botões de ação principal, garantindo o arredondamento de `50px`.

## [1.0.0] - 2025-12-31

### Added

- **SEO Completo**: Meta tags para buscadores e redes sociais (Open Graph, Twitter Cards).
- **Acessibilidade (A11y)**: Melhorias nos formulários com `aria-label`, IDs únicos e classes `.sr-only`.
- **Performance**: Implementação de `loading="lazy"` em imagens pesadas.

### Changed

- **Padronização de Botões**: Aplicação global de `border-radius: 50px` em botões de reserva e eventos.
- **Cores CSS Variáveis**: Substituição definitiva de hexadecimais por variáveis CSS em todos os componentes.
- **Localização pt-BR**: Tradução e padronização de todos os comentários técnicos no CSS.

## [0.9.0] - 2025-12-30

### Added

- **Redesign da Seção Menu**: Implementação de grade assimétrica e nova barra lateral fixa.
- **Padronização de Títulos**: Unificação visual de kickers e títulos principais (H2) seguindo o guia de estilo.
- **Lista de Cervejas**: Atualização da lista de bebidas disponíveis na barra lateral.

### Changed

- **Paleta de Cores**: Atualização dos fundos das seções de Menu e Reserva para consistência visual (`#081211`).
- **Ativos**: Reorganização dos vídeos da seção Hero.

### Fixed

- Inconsistências no arredondamento de botões na seção de menu.

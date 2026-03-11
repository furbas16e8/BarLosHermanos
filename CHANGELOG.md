# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.2.0] - 2026-03-11

### Added

- **Seção Agenda no Painel Administrativo (`painel.html`)**:
  - Calendário semanal com timeline de horas (16h–23h) e visão mensal alternável
  - Eventos exibidos como blocos flutuantes na timeline com miniatura da atração (3:4)
  - CRUD completo de eventos: criar, editar e excluir com campos de data, horário de início/término e descrição
  - Botão "Agenda" na sidebar do painel com integração ao sistema de navegação existente
  - 4 modais: Evento, Galeria de Atrações, Nova Atração e Eventos do Dia

- **Galeria de Atrações com Upload e Recorte**:
  - Catálogo de artistas/bandas reutilizável para evitar uploads repetidos
  - Upload de imagem com recorte em ratio fixo 3:4 via Cropper.js (CDN)
  - Conversão automática para WebP e upload direto ao Supabase Storage (bucket `atracoes`)
  - Busca por nome na galeria para seleção rápida

- **Time Picker Customizado**:
  - Seletor visual de hora (16h–23h) e minutos (00, 15, 30, 45) por clique
  - Campos de horário de início e término lado a lado no modal

- **Eventos Dinâmicos na Landing Page (`index.html`)**:
  - Novo módulo `assets/js/eventos-home.js` para renderização dinâmica
  - Tabs por semana (semana atual + próximas 3 semanas) com navegação
  - Cards de evento com foto da atração (ratio 3:4), nome, descrição, horário e data
  - Substituição completa do conteúdo estático de eventos por dados do Supabase

- **Banco de Dados — Schema de Agenda**:
  - Nova tabela `atracoes` (id, nome, foto_url)
  - Nova tabela `eventos` (id, atracao_id, data, horario, horario_fim, descricao, ativo)
  - Índice `idx_eventos_data` para consultas por intervalo de data
  - Políticas RLS com roles `anon` e `authenticated` explícitos
  - Políticas de Storage para bucket `atracoes` (SELECT, INSERT, UPDATE, DELETE)
  - Script consolidado `db/setup_agenda.sql`

### Changed

- **Landing Page — Seção de Eventos**: Conteúdo estático hardcoded substituído por renderização dinâmica via Supabase com tabs de semanas e cards com foto
- **CSS de Eventos (`assets/css/style.css`)**: Estilos antigos (`.event-card`, `.events-grid`, `.events-image`) substituídos por novos (`.events-tabs`, `.event-card-new` com foto 3:4)

### Fixed

- **RLS**: Erro "new row violates row-level security policy" ao cadastrar atrações — corrigido adicionando `TO anon, authenticated` nas políticas e criando políticas de Storage para `storage.objects`

## [2.1.0] - 2026-02-12

### Added

- **Painel Administrativo (`painel.html`)**: Interface completa para gestão do cardápio com layout sidebar + main content.
  - Sidebar fixa com navegação entre seções (Produtos, Métricas, Configurações)
  - Sidebar responsiva com toggle hamburger em mobile
  - 3 sub-tabs na seção Produtos: **Pratos**, **Insumos** e **Bebidas**

- **Gestão de Pratos (Sub-tab Pratos)**:
  - Cards visuais com imagem, nome, preço e badge de status colorido (Ativo/Desativado/Insumo/Override)
  - Clique contextual: ativar, desativar, aplicar override ou remover override
  - Filtro por categoria via pills horizontais (geradas dinamicamente dos dados)
  - Busca por nome em tempo real com debounce

- **Gestão de Bebidas (Sub-tab Bebidas)**:
  - Aba independente com cards visuais e busca própria
  - Separação de bebidas da lista de pratos para gestão diferenciada

- **Gestão de Insumos (Sub-tab Insumos)**:
  - Grid de 4 colunas por categoria: Carnes, Pescados, Queijos, Vegetais
  - Sub-grid de 2 cards por linha em cada coluna
  - Cards clicáveis para toggle ativo/inativo com indicador visual (dot verde/vermelho)
  - Painel de pratos afetados por insumos inativos

- **Sistema de Insumos (Backend)**:
  - Nova tabela `insumos` no Supabase com categorias e flag `ativo`
  - Novas colunas `insumos_chave` (JSONB) e `override_insumo` (boolean) na tabela `cardapio`
  - Script SQL consolidado `db/setup_insumos.sql` com schema, dados iniciais e verificações

- **Filtro de Insumos no Frontend Público (`orders-view.js`)**:
  - Função `getInsumosInativos()` com cache de nomes inativos
  - Função `filterByInsumos()` remove automaticamente pratos com insumos indisponíveis
  - Respeita flag `override_insumo` para manter pratos forçados como disponíveis
  - Filtro aplicado em `getFeaturedItems()`, `getAllItems()` e `getItemsByCategory()`

- **CSS do Painel (`assets/css/pages/painel.css`)**:
  - Estilos para sidebar, sub-tabs, category pills, cards de produto, cards de insumo
  - Layout responsivo (sidebar collapsa em mobile, grids adaptam)

### Changed

- **Separação de Bebidas**: Bebidas removidas da aba Pratos e movidas para aba própria no painel

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

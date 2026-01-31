# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

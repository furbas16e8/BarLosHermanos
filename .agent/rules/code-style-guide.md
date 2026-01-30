---
trigger: always_on
---

1. **Uso de Variáveis de Cor:** Nunca use códigos hexadecimais soltos. Sempre utilize as variáveis do `:root`, como `--accent-color` (`#ff3131`) para destaques e `--bg-color` (`#000000`) para fundos.
2. **Padronização de Tipografia:** Títulos e chamadas devem obrigatoriamente usar a fonte `Bebas Neue` (`var(--font-title)`), enquanto parágrafos e descrições usam `Poppins` (`var(--font-body)`).
3. **Estilo de Títulos de Seção:** Todos os `h2` de seções devem ter o tamanho de `4rem` e cor branca, precedidos por um `span` (kicker) na cor `--accent-color`.
4. **Arredondamento de Botões:** Todo botão de ação principal deve ter `border-radius: 50px` para manter a consistência com o estilo global definido no CSS.
5. **Idioma e Localização:** Todo conteúdo textual, comentários de código e mensagens de erro devem ser escritos em **Português do Brasil (pt-BR)**.
6. **Layout Mobile-First:** Priorize a responsividade. Ao criar novos elementos, garanta que funcionem em telas de `768px` e `900px`, conforme as media queries existentes.
7. **Semântica HTML5:** Utilize tags semânticas como `<section>`, `<article>` e `<nav>` em vez de `<div>` genéricas para melhorar o SEO e a acessibilidade.
8. **Tratamento de Imagens:** Imagens de pratos e eventos devem sempre utilizar `object-fit: cover` para evitar distorções nas grades de exibição.
9. **Acessibilidade de Imagens:** Todo elemento `<img>` deve conter um atributo `alt` descritivo focado no contexto do bar (ex: "Prato de Jiló Especial do Bar Los Hermanos").
10. **Padronização de Transições:** Use sempre o tempo de transição de `0.3s` para efeitos de hover em links e botões, mantendo a suavidade da navegação.
11. **Stack Tecnológica (Vanilla):** Este projeto está em processo de transição para **HTML, CSS e JavaScript puros (Vanilla)**. Não utilize frameworks como React, Vue ou bibliotecas de build como Webpack/Vite. O design existente deve ser preservado identicamente durante essa migração.

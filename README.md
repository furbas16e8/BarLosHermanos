# Bar Los Hermanos 🍻

Site institucional e cardápio digital do **Bar Los Hermanos**, tradicional ponto de encontro em Governador Valadares/MG.

O projeto combina uma landing page moderna com funcionalidades de cardápio digital, permitindo aos clientes explorar pratos, drinks e fazer pedidos online (Delivery ou Retirada).

## 🚀 Funcionalidades

- **Cardápio Digital Interativo:** Navegação por categorias (Comidas, Drinks, Cervejas).
- **Personalização de Pedidos:** Remoção de ingredientes e adição de extras com cálculo em tempo real.
- **Carrinho de Compras:** Adição de itens, cálculo de total e gestão de pedidos.
- **Checkout Simplificado:** Pedido via telefone, sem login prévio (Guest Checkout).
- **Sistema de Entrega:** Taxa calculada dinamicamente por bairro.
- **Painel Administrativo:** Gestão de pratos, bebidas e insumos com controle de disponibilidade.
- **Galeria e Eventos:** Exibição de fotos do ambiente e agenda de shows.
- **Design Responsivo:** Otimizado para celulares e desktops.

## 🛠️ Tecnologias Utilizadas

O projeto foi construído com a filosofia "Keep It Simple", utilizando tecnologias web nativas sem a complexidade de frameworks SPA.

- **Frontend:** HTML5, CSS3 (Vanilla + Variáveis CSS), JavaScript (ES6+).
- **Backend (BaaS):** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime).
- **Estilização:** CSS puro com arquitetura BEM e design responsivo mobile-first.
- **Ícones:** Material Symbols (Google), FontAwesome 6, Phosphor Icons.
- **Fontes:** Bebas Neue, Poppins, Plus Jakarta Sans (Google Fonts).

## 📂 Estrutura do Projeto

```bash
/
├── assets/              # Recursos estáticos
│   ├── css/             # Estilos (base, components, pages, utils)
│   ├── img/             # Imagens otimizadas
│   └── js/              # Lógica da aplicação (12 módulos)
└── *.html               # Páginas da aplicação
```

## 🔐 Configuração do Backend

O projeto já vem configurado com as chaves públicas do Supabase em `assets/js/supabase-client.js`.
A segurança dos dados é garantida através de **Row Level Security (RLS)** no banco de dados, permitindo leitura pública do cardápio mas restringindo a escrita.

## 📄 Licença

Todos os direitos reservados ao Bar Los Hermanos. Desenvolvido por Douglas Furbino.

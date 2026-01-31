# Bar Los Hermanos 🍻

Site institucional e cardápio digital do **Bar Los Hermanos**, tradicional ponto de encontro em Governador Valadares/MG.

O projeto combina uma landing page moderna com funcionalidades de cardápio digital, permitindo aos clientes explorar pratos, drinks e fazer pedidos online (Delivery ou Retirada).

## 🚀 Funcionalidades

- **Cardápio Digital Interativo:** Navegação por categorias (Comidas, Drinks, Cervejas).
- **Carrinho de Compras:** Adição de itens, cálculo de total e gestão de pedidos.
- **Integração com Backend:** Dados dinâmicos carregados via **Supabase**.
- **Autenticação de Clientes:** Cadastro e Login para realizar pedidos.
- **Galeria e Eventos:** Exibição de fotos do ambiente e agenda de shows.
- **Design Responsivo:** Otimizado para funcionar perfeitamente em celulares e desktops.

## 🛠️ Tecnologias Utilizadas

O projeto foi construído com a filosofia "Keep It Simple", utilizando tecnologias web nativas sem a complexidade de frameworks SPA.

- **Frontend:** HTML5, CSS3 (Vanilla + Variáveis), JavaScript (ES6+).
- **Backend (BaaS):** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime).
- **Estilização:** CSS puro com arquitetura baseada em variáveis e design responsivo.
- **Assets:** Ícones FontAwesome e Fontes Google (Bebas Neue & Poppins).

## 📂 Estrutura do Projeto

```bash
/
├── assets/              # Recursos estáticos
│   ├── css/             # Estilos (style.css principal e modularização em andamento)
│   ├── img/             # Imagens (otimizadas, formato webp/jpeg/png)
│   └── js/              # Lógica da aplicação (Modular)
└── *.html               # Páginas da aplicação (index, login, perfil, etc.)
```

## 🔐 Configuração do Backend

O projeto já vem configurado com as chaves públicas do Supabase em `assets/js/supabase-client.js`.
A segurança dos dados é garantida através de **Row Level Security (RLS)** no banco de dados, permitindo leitura pública do cardápio mas restringindo a escrita.

## 📄 Licença

Todos os direitos reservados ao Bar Los Hermanos. Desenvolvido por Douglas Furbino.

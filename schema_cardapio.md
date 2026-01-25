# Schema Database: Cardápio Inteligente

Este documento descreve a estrutura de banco de dados para o sistema de cardápio, incluindo a tabela principal, função de geração de códigos (SKU), gatilhos de automação e políticas de segurança.

## 1. Tabela: `cardapio`

Tabela principal para armazenamento dos itens. Utiliza `INTEGER` com identidade estrita para o ID numérico e uma coluna `cod` textual para o código visual (ex: `btts-001`).

```sql
CREATE TABLE cardapio (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  cod TEXT UNIQUE,   -- Código visual (SKU) gerado automaticamente pelo Trigger
  nome TEXT NOT NULL,
  descricao TEXT,
  valor NUMERIC(10,2) NOT NULL, -- Suporte a centavos
  categoria TEXT NOT NULL,      -- Base para a geração do código (ex: Batatas)
  img_url TEXT,     -- link da imagem
  ativo BOOLEAN DEFAULT true,   -- Para ativar ou desativar sem adicionar/excluir
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 2. Índices de Performance

Índices para otimizar consultas frequentes no sistema.

```sql
-- Índice para buscas por categoria (muito usado no site)
CREATE INDEX idx_cardapio_categoria ON cardapio(categoria);

-- Índice para buscas por código (útil para área administrativa)
CREATE INDEX idx_cardapio_cod ON cardapio(cod);

-- Índice parcial para filtrar apenas itens ativos (otimiza a query principal do site)
CREATE INDEX idx_cardapio_ativo ON cardapio(ativo) WHERE ativo = true;
```

---

## 3. Função: `gerar_cod_cardapio`

Função PL/pgSQL responsável pela lógica de negócio da geração do código. Ela intercepta a inserção, verifica a categoria e calcula o próximo número sequencial **apenas dentro daquela categoria**.

A função utiliza `MAX()` + extração de número via regex para evitar problemas caso algum item seja deletado.

```sql
CREATE OR REPLACE FUNCTION gerar_cod_cardapio()
RETURNS TRIGGER AS $$
DECLARE
  prefixo TEXT;
  proximo_numero INT;
BEGIN
  -- 1. Normalização e Definição de Prefixos
  -- Transforma a categoria recebida em um prefixo de 3 ou 4 letras
  CASE LOWER(NEW.categoria)
    WHEN 'entradas' THEN prefixo := 'entd';
    WHEN 'churrasquinhos' THEN prefixo := 'churr';
    WHEN 'coxinhas' THEN prefixo := 'cxhs';
    WHEN 'porcoes'  THEN prefixo := 'prcs';
    WHEN 'batatas'  THEN prefixo := 'btts';
    WHEN 'especiais' THEN prefixo := 'espc';
    WHEN 'caldos' THEN prefixo := 'cald';
    WHEN 'burguers' THEN prefixo := 'burg';
    WHEN 'mexicanos' THEN prefixo := 'mexc';
    WHEN 'cervejas' THEN prefixo := 'beer';
    WHEN 'drinks'   THEN prefixo := 'drks';      -- Bebidas alcoólicas
    WHEN 'bebidas'  THEN prefixo := 'bebs';      -- Bebidas não alcoólicas (sucos etc)
    WHEN 'lanches'  THEN prefixo := 'lnch';
    WHEN 'sobremesas' THEN prefixo := 'sbrs';
    -- Fallback: Se não mapeado, pega as 4 primeiras letras da categoria
    ELSE prefixo := SUBSTRING(LOWER(NEW.categoria) FROM 1 FOR 4);
  END CASE;

  -- 2. Cálculo Sequencial por Categoria
  -- Pega o MAIOR número existente + 1 (evita conflitos se houver deleções)
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(cod FROM '[0-9]+$') AS INTEGER)
  ), 0) + 1 INTO proximo_numero
  FROM cardapio
  WHERE categoria = NEW.categoria;

  -- 3. Formatação Final
  -- Concatena prefixo + hífen + número preenchido com zeros à esquerda (pad 3)
  -- Resultado: btts-001, drks-015
  NEW.cod := prefixo || '-' || lpad(proximo_numero::text, 3, '0');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 4. Trigger: `trigger_auto_cod`

Gatilho que executa a função acima **antes** de qualquer inserção na tabela. Isso garante que o código seja gerado sem intervenção do usuário ou da aplicação frontend.

```sql
CREATE TRIGGER trigger_auto_cod
BEFORE INSERT ON cardapio
FOR EACH ROW
EXECUTE FUNCTION gerar_cod_cardapio();
```

---

## 5. Row Level Security (RLS)

Políticas de segurança que protegem os dados mesmo quando acessados via API pública do Supabase.

### 5.1. Ativar RLS na tabela

```sql
ALTER TABLE cardapio ENABLE ROW LEVEL SECURITY;
```

### 5.2. Política de Leitura Pública

Permite que qualquer pessoa (incluindo visitantes não autenticados do site) possa **visualizar** os itens do cardápio.

```sql
CREATE POLICY "Cardapio publico para leitura"
  ON cardapio
  FOR SELECT
  USING (true);
```

### 5.3. Política de Modificação Restrita

Apenas usuários **autenticados** (administradores logados no sistema) podem inserir, atualizar ou deletar itens do cardápio.

```sql
CREATE POLICY "Apenas admin modifica cardapio"
  ON cardapio
  FOR ALL
  USING (auth.role() = 'authenticated');
```

---

## 6. Exemplo de Uso

Ao inserir dados, a aplicação deve ignorar as colunas `id` e `cod`, pois são geradas automaticamente.

### 6.1. Inserção via SQL (no painel do Supabase, APENAS EXEMPLO)

```sql
INSERT INTO cardapio (nome, descricao, valor, categoria, img_url) VALUES
('Batata Rústica', 'Batatas com alecrim e parmesão', 25.00, 'batatas', 'https://exemplo.com/batata.jpg'),
('Mojito', 'Rum branco, hortelã, limão e açúcar', 18.00, 'drinks', 'https://exemplo.com/mojito.jpg'),
('Caipirinha de Limão', 'Cachaça premium, limão siciliano', 16.00, 'drinks', null),
('Hambúrguer Artesanal', 'Pão brioche, blend 180g, queijo cheddar', 32.90, 'burguers', null);
```

**Resultado automático:**

- `batatas` → `btts-001`
- `drinks` → `drks-001`, `drks-002`
- `burguers` → `burg-001`

### 6.2. Inserção via JavaScript (no código do site)

```javascript
const { data, error } = await supabase
  .from("cardapio")
  .insert([
    {
      nome: "Porção de Fritas",
      descricao: "Batatas fritas crocantes 500g",
      valor: 22.0,
      categoria: "batatas",
    },
  ])
  .select(); // Retorna o item criado com id e cod

if (error) console.error("Erro:", error);
else console.log("Item criado:", data);
```

### 6.3. Consulta de itens ativos por categoria

```sql
-- Via SQL
SELECT * FROM cardapio
WHERE categoria = 'drinks'
  AND ativo = true
ORDER BY nome;
```

```javascript
// Via JavaScript
const { data } = await supabase
  .from("cardapio")
  .select("*")
  .eq("categoria", "drinks")
  .eq("ativo", true)
  .order("nome");
```

---

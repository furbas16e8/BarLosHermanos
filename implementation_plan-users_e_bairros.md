# 📋 Plano de Implementação - Sistema de Pedidos com Delivery

> **IMPORTANTE:** Todas as implementações no Banco de Dados do Supabase serão feitas pelo usuário.
>
> Este documento contém todas as queries SQL, índices, funções e código JavaScript necessários para implementação completa do sistema.

---

## 📑 Índice

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Estrutura do Banco de Dados](#2-estrutura-do-banco-de-dados)
3. [Funções e Triggers](#3-funções-e-triggers)
4. [Queries Úteis](#4-queries-úteis)
5. [Integração Frontend](#5-integração-frontend)
6. [Fluxo de Pedidos](#6-fluxo-de-pedidos)
7. [Checklist de Implementação](#7-checklist-de-implementação)

---

## 1. Visão Geral do Sistema

### 1.1 Funcionalidades Principais

- ✅ Cardápio com sistema de códigos SKU automáticos
- ✅ Cadastro e autenticação de clientes
- ✅ Sistema de favoritos
- ✅ Zonas de entrega com taxas diferenciadas
- ✅ Cálculo automático de tempo de entrega por bairro
- ✅ Histórico de pedidos
- ✅ Múltiplas formas de pagamento

### 1.2 Lógica de Tempo de Entrega

**Regra:** O tempo de preparo de um pedido é sempre baseado no item com **MAIOR** tempo de preparo.

**Exemplo:**

```
Carrinho:
- 2x Hambúrguer (25 minutos cada) = 25 min
- 1x Batata Rústica (15 minutos) = 15 min
- 3x Coca-Cola (0 minutos) = 0 min

Tempo base = 25 minutos (o maior)
Bairro: Lourdes (multiplicador 1.20)
Tempo final = 25 × 1.20 = 30 minutos
```

---

## 2. Estrutura do Banco de Dados

### 2.1 Tabela: `cardapio` (Atualização)

**Adicionar coluna de tempo de preparo:**

```sql
ALTER TABLE cardapio
ADD COLUMN tempo_preparo INTEGER DEFAULT 0;

COMMENT ON COLUMN cardapio.tempo_preparo IS 'Tempo de preparo do item em minutos';
```

**Atualizar itens existentes com tempos padrão:**

```sql
-- Definir tempos padrão por categoria
UPDATE cardapio SET tempo_preparo = 25 WHERE categoria = 'burguers';
UPDATE cardapio SET tempo_preparo = 30 WHERE categoria = 'churrasquinhos';
UPDATE cardapio SET tempo_preparo = 20 WHERE categoria = 'porcoes';
UPDATE cardapio SET tempo_preparo = 15 WHERE categoria = 'batatas';
UPDATE cardapio SET tempo_preparo = 35 WHERE categoria = 'especiais';
UPDATE cardapio SET tempo_preparo = 20 WHERE categoria = 'caldos';
UPDATE cardapio SET tempo_preparo = 25 WHERE categoria = 'mexicanos';
UPDATE cardapio SET tempo_preparo = 15 WHERE categoria = 'entradas';
UPDATE cardapio SET tempo_preparo = 20 WHERE categoria = 'coxinhas';
UPDATE cardapio SET tempo_preparo = 20 WHERE categoria = 'lanches';
UPDATE cardapio SET tempo_preparo = 10 WHERE categoria = 'sobremesas';

-- Bebidas não têm tempo de preparo (ou muito baixo)
UPDATE cardapio SET tempo_preparo = 0 WHERE categoria = 'bebidas';
UPDATE cardapio SET tempo_preparo = 3 WHERE categoria = 'drinks';
```

---

### 2.2 Tabela: `zonas_entrega`

**Armazena bairros atendidos, taxas de entrega e multiplicador de tempo.**

```sql
CREATE TABLE zonas_entrega (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  bairro TEXT NOT NULL UNIQUE,
  cidade TEXT NOT NULL DEFAULT 'Governador Valadares',
  estado TEXT NOT NULL DEFAULT 'MG',
  taxa_entrega NUMERIC(10,2) NOT NULL,
  multiplicador_tempo NUMERIC(3,2) NOT NULL DEFAULT 1.00,
  -- Exemplos: 1.00 (base), 1.20 (+20%), 1.50 (+50%), 2.00 (dobro)
  ativo BOOLEAN DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Índices:**

```sql
CREATE INDEX idx_zonas_bairro ON zonas_entrega(bairro);
CREATE INDEX idx_zonas_ativo ON zonas_entrega(ativo);
```

**Row Level Security:**

```sql
ALTER TABLE zonas_entrega ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver bairros atendidos"
  ON zonas_entrega
  FOR SELECT
  USING (ativo = true);

CREATE POLICY "Apenas admin modifica zonas"
  ON zonas_entrega
  FOR ALL
  USING (auth.role() = 'authenticated');
```

**Dados de exemplo:**

```sql
INSERT INTO zonas_entrega (bairro, taxa_entrega, multiplicador_tempo, observacoes) VALUES
-- Centro (base, sem multiplicação adicional)
('Centro', 5.00, 1.00, 'Região central - entrega rápida'),
('Ilha dos Araújos', 5.00, 1.00, NULL),
('Esplanada', 6.00, 1.10, 'Próximo ao centro'),

-- Bairros intermediários (+20% a +50% no tempo)
('Lourdes', 7.00, 1.20, 'Região nobre'),
('Grã-Duquesa', 7.00, 1.20, NULL),
('Santa Helena', 7.00, 1.30, NULL),
('Lagoa Santa', 8.00, 1.40, NULL),
('Vila Bretas', 8.00, 1.40, NULL),

-- Bairros mais distantes (+50% a +100% no tempo)
('Jardim Pérola', 10.00, 1.50, 'Região mais distante'),
('Turmalina', 10.00, 1.60, NULL),
('São Pedro', 12.00, 1.70, NULL),
('Village do Lago', 12.00, 1.80, NULL),

-- Bairros periféricos (dobro do tempo ou mais)
('Bela Vista', 15.00, 2.00, 'Entrega mais demorada'),
('Altinópolis', 15.00, 2.20, 'Região periférica');
```

---

### 2.3 Tabela: `clientes`

**Armazena dados dos clientes.**

```sql
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT,
  cpf TEXT UNIQUE,
  data_nascimento DATE,

  -- Endereço padrão para entrega
  endereco_rua TEXT,
  endereco_numero TEXT,
  endereco_complemento TEXT,
  endereco_bairro TEXT,
  endereco_cidade TEXT DEFAULT 'Governador Valadares',
  endereco_estado TEXT DEFAULT 'MG',
  endereco_cep TEXT,

  -- Metadados
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Índices:**

```sql
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_telefone ON clientes(telefone);
CREATE INDEX idx_clientes_cpf ON clientes(cpf);
```

**Row Level Security:**

```sql
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clientes veem apenas seus dados"
  ON clientes
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Clientes editam apenas seus dados"
  ON clientes
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Qualquer um pode criar cliente"
  ON clientes
  FOR INSERT
  WITH CHECK (true);
```

---

### 2.4 Tabela: `pedidos`

**Armazena pedidos realizados.**

```sql
CREATE TABLE pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,

  -- Status do pedido
  status TEXT NOT NULL DEFAULT 'pendente',
  -- Valores possíveis: 'pendente', 'confirmado', 'preparando', 'saiu_entrega', 'entregue', 'cancelado'

  tipo_pedido TEXT NOT NULL DEFAULT 'delivery',
  -- Valores possíveis: 'delivery', 'retirada', 'consumo_local'

  -- Valores financeiros
  subtotal NUMERIC(10,2) NOT NULL,
  taxa_entrega NUMERIC(10,2) DEFAULT 0,
  desconto NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,

  -- Informações de entrega
  bairro_entrega TEXT,
  zona_entrega_id INTEGER REFERENCES zonas_entrega(id),
  endereco_entrega JSONB,

  -- Tempo estimado
  tempo_preparo_total INTEGER, -- Tempo do item com MAIOR preparo (minutos)
  tempo_entrega_estimado INTEGER, -- Tempo após aplicar multiplicador (minutos)

  -- Pagamento
  forma_pagamento TEXT,
  -- Valores possíveis: 'dinheiro', 'pix', 'cartao_debito', 'cartao_credito'
  troco_para NUMERIC(10,2),

  -- Observações
  observacoes TEXT,

  -- Metadados
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Índices:**

```sql
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_pedidos_data ON pedidos(created_at DESC);
CREATE INDEX idx_pedidos_zona ON pedidos(zona_entrega_id);
```

**Row Level Security:**

```sql
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clientes veem apenas seus pedidos"
  ON pedidos
  FOR SELECT
  USING (cliente_id = auth.uid());

CREATE POLICY "Clientes podem criar pedidos"
  ON pedidos
  FOR INSERT
  WITH CHECK (cliente_id = auth.uid());
```

---

### 2.5 Tabela: `itens_pedido`

**Relaciona itens do cardápio com pedidos.**

```sql
CREATE TABLE itens_pedido (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  item_id INTEGER REFERENCES cardapio(id) ON DELETE RESTRICT,

  -- Snapshot do item no momento do pedido (preços podem mudar depois)
  item_cod TEXT NOT NULL,
  item_nome TEXT NOT NULL,
  item_valor NUMERIC(10,2) NOT NULL,
  item_tempo_preparo INTEGER DEFAULT 0, -- Tempo no momento do pedido

  -- Quantidade e customizações
  quantidade INTEGER NOT NULL DEFAULT 1,
  observacoes TEXT, -- Ex: "sem cebola", "ponto mal passado"

  -- Subtotal deste item
  subtotal NUMERIC(10,2) NOT NULL,

  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Índices:**

```sql
CREATE INDEX idx_itens_pedido_pedido ON itens_pedido(pedido_id);
CREATE INDEX idx_itens_pedido_item ON itens_pedido(item_id);
```

**Row Level Security:**

```sql
ALTER TABLE itens_pedido ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver itens dos próprios pedidos"
  ON itens_pedido
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pedidos
      WHERE pedidos.id = itens_pedido.pedido_id
      AND pedidos.cliente_id = auth.uid()
    )
  );

CREATE POLICY "Inserir itens nos próprios pedidos"
  ON itens_pedido
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pedidos
      WHERE pedidos.id = itens_pedido.pedido_id
      AND pedidos.cliente_id = auth.uid()
    )
  );
```

---

### 2.6 Tabela: `favoritos`

**Itens favoritados pelos clientes.**

```sql
CREATE TABLE favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  item_id INTEGER REFERENCES cardapio(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Garantir que cliente não favorite o mesmo item 2x
  UNIQUE(cliente_id, item_id)
);
```

**Índices:**

```sql
CREATE INDEX idx_favoritos_cliente ON favoritos(cliente_id);
CREATE INDEX idx_favoritos_item ON favoritos(item_id);
```

**Row Level Security:**

```sql
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver próprios favoritos"
  ON favoritos
  FOR SELECT
  USING (cliente_id = auth.uid());

CREATE POLICY "Adicionar favoritos"
  ON favoritos
  FOR INSERT
  WITH CHECK (cliente_id = auth.uid());

CREATE POLICY "Remover favoritos"
  ON favoritos
  FOR DELETE
  USING (cliente_id = auth.uid());
```

---

## 3. Funções e Triggers

### 3.1 Função: Calcular Tempo de Entrega

```sql
CREATE OR REPLACE FUNCTION calcular_tempo_entrega(
  p_tempo_preparo_total INTEGER,
  p_multiplicador_tempo NUMERIC
)
RETURNS INTEGER AS $$
BEGIN
  -- Arredonda para cima (ceiling)
  RETURN CEIL(p_tempo_preparo_total * p_multiplicador_tempo);
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

**Exemplo de uso:**

```sql
-- Pedido com 25min de preparo + bairro com multiplicador 1.20
SELECT calcular_tempo_entrega(25, 1.20) as tempo_estimado;
-- Retorna: 30 minutos
```

---

### 3.2 Função: Obter Zona de Entrega

```sql
CREATE OR REPLACE FUNCTION obter_zona_entrega(p_bairro TEXT)
RETURNS TABLE (
  zona_id INTEGER,
  taxa NUMERIC,
  multiplicador NUMERIC,
  atendido BOOLEAN,
  mensagem TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    z.id,
    z.taxa_entrega,
    z.multiplicador_tempo,
    true::BOOLEAN,
    'Bairro atendido'::TEXT
  FROM zonas_entrega z
  WHERE LOWER(z.bairro) = LOWER(p_bairro)
    AND z.ativo = true
  LIMIT 1;

  -- Se não encontrou resultado
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT
      NULL::INTEGER,
      0::NUMERIC,
      0::NUMERIC,
      false::BOOLEAN,
      'Desculpe, não entregamos neste bairro ainda.'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

**Exemplo de uso:**

```sql
SELECT * FROM obter_zona_entrega('Lourdes');
-- Retorna: zona_id, taxa, multiplicador, atendido, mensagem
```

---

### 3.3 Trigger: Atualizar `updated_at`

````sql
CREATE OR REPLACE FUNCTION atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em clientes
CREATE TRIGGER trigger_clientes_updated_at
BEFORE UPDATE ON clientes
FOR EACH ROW
EXECUTE FUNCTION atualizar_updated_at();

-- Aplicar em pedidos
EXECUTE FUNCTION atualizar_updated_at();

-- Aplicar em pedidos
CREATE TRIGGER trigger_pedidos_updated_at
BEFORE UPDATE ON pedidos
FOR EACH ROW
EXECUTE FUNCTION atualizar_updated_at();

### 3.4 Função e Trigger: Validar Horário de Funcionamento
**Regra:** Pedidos permitidos apenas de Segunda a Sábado, das 18:00 às 23:00.

```sql
CREATE OR REPLACE FUNCTION validar_horario_funcionamento()
RETURNS TRIGGER AS $$
DECLARE
  v_hora_atual TIMESTAMPTZ := NOW() AT TIME ZONE 'America/Sao_Paulo';
  v_dia_semana INTEGER := EXTRACT(DOW FROM v_hora_atual); -- 0=Domingo, 6=Sábado
  v_hora INTEGER := EXTRACT(HOUR FROM v_hora_atual);
BEGIN
  -- Bloquear Domingos (0)
  IF v_dia_semana = 0 THEN
    RAISE EXCEPTION 'O bar está fechado aos domingos. Horário: Seg-Sáb 18h às 23h.';
  END IF;

  -- Bloquear fora do horário 18h - 23h
  -- Consideramos até 23:59 como "dentro das 23h" ou estrito até 23:00?
  -- Regra: 18h as 23h (Permite pedidos até 23:59 ou encerra estritamente as 23:00?)
  -- Assumindo encerramento as 23:00 estrito (então < 23) ou inclusivo (<= 23)?
  -- Usually "das 18 as 23" means operational until 23:00. Let's start stric: >= 18 AND < 23.
  -- Se for até as 23h *fechar*, então 22:59 passa, 23:00 não.
  -- Se for funcionamento *durante* as 23h, então < 24.
  -- Ajuste conforme preferência: aqui usarei >= 18 e <= 23 (vai até 23:59:59)

  IF v_hora < 18 OR v_hora > 23 THEN
    RAISE EXCEPTION 'Estamos fechados. Horário de funcionamento: Seg-Sáb das 18h às 23h.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validar_horario
BEFORE INSERT ON pedidos
FOR EACH ROW
EXECUTE FUNCTION validar_horario_funcionamento();
````

````

---

## 4. Queries Úteis

### 4.1 Consultas Operacionais

**Listar bairros atendidos:**

```sql
SELECT
  id,
  bairro,
  taxa_entrega,
  multiplicador_tempo,
  CONCAT(
    'Taxa: R$ ',
    taxa_entrega::TEXT,
    ' | Tempo: +',
    ((multiplicador_tempo - 1) * 100)::INTEGER,
    '%'
  ) as info
FROM zonas_entrega
WHERE ativo = true
ORDER BY bairro;
````

**Verificar se bairro é atendido:**

```sql
SELECT * FROM obter_zona_entrega('Centro');
```

**Ver pedidos pendentes:**

```sql
SELECT
  p.id,
  c.nome as cliente,
  p.total,
  p.tempo_entrega_estimado,
  p.bairro_entrega,
  p.created_at
FROM pedidos p
JOIN clientes c ON c.id = p.cliente_id
WHERE p.status = 'pendente'
ORDER BY p.created_at DESC;
```

**Relatório de entregas por bairro:**

```sql
SELECT
  z.bairro,
  z.taxa_entrega,
  z.multiplicador_tempo,
  COUNT(p.id) as total_pedidos,
  SUM(p.total) as valor_total_pedidos,
  SUM(p.taxa_entrega) as total_taxas_entrega,
  ROUND(AVG(p.tempo_entrega_estimado)) as tempo_medio_entrega
FROM zonas_entrega z
LEFT JOIN pedidos p ON p.zona_entrega_id = z.id AND p.status != 'cancelado'
WHERE z.ativo = true
GROUP BY z.id, z.bairro, z.taxa_entrega, z.multiplicador_tempo
ORDER BY total_pedidos DESC NULLS LAST;
```

**Ver detalhes de um pedido:**

```sql
SELECT
  p.*,
  c.nome as cliente_nome,
  c.telefone as cliente_telefone,
  z.bairro as zona_bairro,
  z.multiplicador_tempo
FROM pedidos p
JOIN clientes c ON c.id = p.cliente_id
LEFT JOIN zonas_entrega z ON z.id = p.zona_entrega_id
WHERE p.id = 'SEU_PEDIDO_ID_AQUI';
```

**Ver itens de um pedido:**

```sql
SELECT
  ip.item_nome,
  ip.quantidade,
  ip.item_valor,
  ip.item_tempo_preparo,
  ip.subtotal,
  ip.observacoes
FROM itens_pedido ip
WHERE ip.pedido_id = 'SEU_PEDIDO_ID_AQUI'
ORDER BY ip.item_tempo_preparo DESC;
```

---

### 4.2 Queries de Administração

**Atualizar multiplicador de tempo:**

```sql
UPDATE zonas_entrega
SET multiplicador_tempo = 1.30
WHERE bairro = 'Lourdes';
```

**Atualizar taxa de entrega:**

```sql
UPDATE zonas_entrega
SET taxa_entrega = 9.00,
    observacoes = 'Taxa aumentada devido à distância'
WHERE bairro = 'São Pedro';
```

**Desativar bairro temporariamente:**

```sql
UPDATE zonas_entrega
SET ativo = false,
    observacoes = 'Sem motoboys disponíveis no momento'
WHERE bairro = 'Altinópolis';
```

**Reativar bairro:**

```sql
UPDATE zonas_entrega
SET ativo = true,
    observacoes = NULL
WHERE bairro = 'Altinópolis';
```

**Atualizar tempo de preparo de um item:**

```sql
UPDATE cardapio
SET tempo_preparo = 30
WHERE cod = 'burg-001';
```

**Atualizar status de pedido:**

```sql
UPDATE pedidos
SET status = 'preparando'
WHERE id = 'SEU_PEDIDO_ID_AQUI';
```

---

## 5. Integração Frontend

### 5.1 Configuração Inicial

**Instalar cliente Supabase:**

```bash
npm install @supabase/supabase-js
```

**Criar cliente:**

```javascript
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://seu-projeto.supabase.co";
const SUPABASE_ANON_KEY = "sua-chave-publica-anon";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

---

### 5.2 Autenticação

**Cadastrar cliente:**

```javascript
async function cadastrarCliente(email, senha, dadosCliente) {
  // 1. Criar usuário na autenticação
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: email,
    password: senha,
  });

  if (authError) {
    console.error("Erro ao criar autenticação:", authError);
    return { error: authError };
  }

  // 2. Criar registro na tabela clientes
  const { data, error } = await supabase
    .from("clientes")
    .insert([
      {
        id: authData.user.id, // Usar o mesmo ID da autenticação
        email: email,
        nome: dadosCliente.nome,
        telefone: dadosCliente.telefone,
        cpf: dadosCliente.cpf,
        endereco_rua: dadosCliente.endereco_rua,
        endereco_numero: dadosCliente.endereco_numero,
        endereco_bairro: dadosCliente.endereco_bairro,
        endereco_cep: dadosCliente.endereco_cep,
      },
    ])
    .select();

  return { data, error };
}
```

**Login:**

```javascript
async function fazerLogin(email, senha) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: senha,
  });

  return { data, error };
}
```

**Logout:**

```javascript
async function fazerLogout() {
  const { error } = await supabase.auth.signOut();
  return { error };
}
```

**Verificar sessão:**

```javascript
async function verificarSessao() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}
```

---

### 5.3 Gerenciar Zonas de Entrega

**Buscar bairros atendidos:**

```javascript
async function buscarBairrosAtendidos() {
  const { data, error } = await supabase
    .from("zonas_entrega")
    .select("*")
    .eq("ativo", true)
    .order("bairro", { ascending: true });

  if (error) {
    console.error("Erro ao buscar bairros:", error);
    return [];
  }

  return data;
}
```

**Verificar se bairro é atendido:**

```javascript
async function verificarBairro(nomeBairro) {
  const { data, error } = await supabase.rpc("obter_zona_entrega", {
    p_bairro: nomeBairro,
  });

  if (error) {
    console.error("Erro:", error);
    return {
      atendido: false,
      mensagem: "Erro ao verificar bairro",
    };
  }

  const resultado = data[0];

  return {
    atendido: resultado.atendido,
    zona_id: resultado.zona_id,
    taxa: resultado.taxa,
    multiplicador: resultado.multiplicador,
    mensagem: resultado.mensagem,
  };
}
```

---

### 5.4 Cálculo de Tempo de Entrega

**Calcular tempo de preparo máximo (REGRA PRINCIPAL):**

```javascript
function calcularTempoPreparoMaximo(itensCarrinho) {
  // Pega o MAIOR tempo de preparo entre todos os itens
  // (assumindo que vários itens podem ser preparados simultaneamente)

  const tempos = itensCarrinho.map((item) => item.tempo_preparo || 0);
  return Math.max(...tempos, 0);
}
```

**Calcular tempo total de entrega:**

```javascript
async function calcularTempoEntrega(itensCarrinho, bairro) {
  // 1. Verificar bairro
  const zona = await verificarBairro(bairro);

  if (!zona.atendido) {
    return {
      sucesso: false,
      mensagem: zona.mensagem,
    };
  }

  // 2. Calcular tempo de preparo (o MAIOR item)
  const tempoPreparo = calcularTempoPreparoMaximo(itensCarrinho);

  // 3. Aplicar multiplicador
  const tempoTotal = Math.ceil(tempoPreparo * zona.multiplicador);

  return {
    sucesso: true,
    tempo_preparo: tempoPreparo,
    multiplicador: zona.multiplicador,
    tempo_total: tempoTotal,
    taxa: zona.taxa,
    zona_id: zona.zona_id,
    mensagem: `Tempo estimado: ${tempoTotal} minutos`,
  };
}
```

---

### 5.5 Criar Pedido Completo

```javascript
async function criarPedidoCompleto(carrinho, dadosPedido) {
  const { data: session } = await supabase.auth.getSession();

  if (!session.session) {
    return { error: "Faça login para fazer pedidos" };
  }

  // 1. Calcular tempo de entrega
  const tempoInfo = await calcularTempoEntrega(carrinho, dadosPedido.bairro);

  if (!tempoInfo.sucesso) {
    return { error: tempoInfo.mensagem };
  }

  // 2. Calcular totais
  const subtotal = carrinho.reduce(
    (sum, item) => sum + item.valor * item.quantidade,
    0,
  );
  const total = subtotal + tempoInfo.taxa - (dadosPedido.desconto || 0);

  // 3. Criar o pedido
  const { data: pedido, error: erroPedido } = await supabase
    .from("pedidos")
    .insert([
      {
        cliente_id: session.session.user.id,
        status: "pendente",
        tipo_pedido: dadosPedido.tipo_pedido || "delivery",

        // Valores
        subtotal: subtotal,
        taxa_entrega: tempoInfo.taxa,
        desconto: dadosPedido.desconto || 0,
        total: total,

        // Tempo
        tempo_preparo_total: tempoInfo.tempo_preparo,
        tempo_entrega_estimado: tempoInfo.tempo_total,

        // Entrega
        bairro_entrega: dadosPedido.bairro,
        zona_entrega_id: tempoInfo.zona_id,
        endereco_entrega: {
          rua: dadosPedido.rua,
          numero: dadosPedido.numero,
          complemento: dadosPedido.complemento,
          bairro: dadosPedido.bairro,
          cep: dadosPedido.cep,
        },

        // Pagamento
        forma_pagamento: dadosPedido.forma_pagamento,
        troco_para: dadosPedido.troco_para,
        observacoes: dadosPedido.observacoes,
      },
    ])
    .select()
    .single();

  if (erroPedido) {
    console.error("Erro ao criar pedido:", erroPedido);
    return { error: erroPedido.message };
  }

  // 4. Adicionar itens do pedido
  const itens = carrinho.map((item) => ({
    pedido_id: pedido.id,
    item_id: item.id,
    item_cod: item.cod,
    item_nome: item.nome,
    item_valor: item.valor,
    item_tempo_preparo: item.tempo_preparo || 0,
    quantidade: item.quantidade,
    observacoes: item.observacoes || null,
    subtotal: item.valor * item.quantidade,
  }));

  const { error: erroItens } = await supabase
    .from("itens_pedido")
    .insert(itens);

  if (erroItens) {
    console.error("Erro ao adicionar itens:", erroItens);
    return { error: erroItens.message };
  }

  return {
    data: pedido,
    error: null,
    tempo_estimado: tempoInfo.tempo_total,
    mensagem: `Pedido criado com sucesso! Tempo estimado: ${tempoInfo.tempo_total} minutos`,
  };
}
```

---

### 5.6 Sistema de Favoritos

**Adicionar favorito:**

```javascript
async function adicionarFavorito(itemId) {
  const { data: session } = await supabase.auth.getSession();

  if (!session.session) {
    return { error: "Faça login para favoritar" };
  }

  const { data, error } = await supabase.from("favoritos").insert([
    {
      cliente_id: session.session.user.id,
      item_id: itemId,
    },
  ]);

  if (error && error.code === "23505") {
    return { error: "Item já está nos favoritos" };
  }

  return { data, error };
}
```

**Remover favorito:**

```javascript
async function removerFavorito(itemId) {
  const { data: session } = await supabase.auth.getSession();

  const { error } = await supabase
    .from("favoritos")
    .delete()
    .eq("cliente_id", session.session.user.id)
    .eq("item_id", itemId);

  return { error };
}
```

**Buscar favoritos:**

```javascript
async function buscarFavoritos() {
  const { data, error } = await su
```

pabase
.from('favoritos')
.select(`       *,
      item:cardapio!item_id (
        id,
        cod,
        nome,
        descricao,
        valor,
        img_url,
        categoria,
        tempo_preparo
      )
    `)

return { data, error }
}

````

**Verificar se está favoritado:**

```javascript
async function estaFavoritado(itemId) {
  const { data: session } = await supabase.auth.getSession()

  if (!session.session) return false

  const { data } = await supabase
    .from('favoritos')
    .select('id')
    .eq('cliente_id', session.session.user.id)
    .eq('item_id', itemId)
    .single()

  return data !== null
}
````

---

### 5.7 Histórico de Pedidos

**Buscar histórico:**

```javascript
async function buscarHistoricoPedidos(limite = 20) {
  const { data, error } = await supabase
    .from("pedidos")
    .select(
      `
      *,
      itens:itens_pedido (*)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(limite);

  return { data, error };
}
```

**Buscar pedido específico:**

```javascript
async function buscarPedidoPorId(pedidoId) {
  const { data, error } = await supabase
    .from("pedidos")
    .select(
      `
      *,
      cliente:clientes (*),
      zona:zonas_entrega (*),
      itens:itens_pedido (*)
    `,
    )
    .eq("id", pedidoId)
    .single();

  return { data, error };
}
```

---

## 6. Fluxo de Pedidos

### 6.1 Exemplo Completo

```javascript
// 1. Cliente adiciona itens ao carrinho
const carrinho = [
  {
    id: 1,
    cod: "burg-001",
    nome: "Hambúrguer Artesanal",
    valor: 32.9,
    tempo_preparo: 25,
    quantidade: 2,
    observacoes: "Sem cebola",
  },
  {
    id: 5,
    cod: "btts-001",
    nome: "Batata Rústica",
    valor: 25.0,
    tempo_preparo: 15,
    quantidade: 1,
  },
  {
    id: 12,
    cod: "bebs-001",
    nome: "Coca-Cola 350ml",
    valor: 6.0,
    tempo_preparo: 0,
    quantidade: 2,
  },
];

// 2. Cliente informa endereço
const endereco = {
  bairro: "Lourdes",
  rua: "Rua das Flores",
  numero: "123",
  complemento: "Apto 202",
  cep: "35020-000",
};

// 3. Sistema calcula tempo e taxa
const tempoInfo = await calcularTempoEntrega(carrinho, endereco.bairro);
console.log(tempoInfo);
/*
{
  sucesso: true,
  tempo_preparo: 25,      // MAIOR entre 25, 15 e 0
  multiplicador: 1.20,    // Multiplicador do bairro Lourdes
  tempo_total: 30,        // 25 × 1.20 = 30
  taxa: 7.00,
  zona_id: 4,
  mensagem: "Tempo estimado: 30 minutos"
}
*/

// 4. Cliente confirma e cria pedido
const resultado = await criarPedidoCompleto(carrinho, {
  bairro: endereco.bairro,
  rua: endereco.rua,
  numero: endereco.numero,
  complemento: endereco.complemento,
  cep: endereco.cep,
  tipo_pedido: "delivery",
  forma_pagamento: "pix",
  observacoes: "Tocar interfone do apto 202",
});

console.log(resultado.mensagem);
// "Pedido criado com sucesso! Tempo estimado: 30 minutos"
```

### 6.2 Cálculo Detalhado do Tempo

```
Itens no carrinho:
- 2x Hambúrguer (25 min cada)
- 1x Batata (15 min)
- 2x Coca-Cola (0 min)

Passo 1: Identificar o MAIOR tempo de preparo
  tempos = [25, 15, 0]
  tempo_preparo_base = max(25, 15, 0) = 25 minutos

Passo 2: Aplicar multiplicador do bairro
  bairro = "Lourdes"
  multiplicador = 1.20
  tempo_total = 25 × 1.20 = 30 minutos

Resultado: 30 minutos de entrega estimada
```

---

## 7. Checklist de Implementação

### 7.1 Banco de Dados (SQL Editor do Supabase)

**Tabela `cardapio`:**

- [ ] Adicionar coluna `tempo_preparo`
- [ ] Atualizar tempos de preparo dos itens existentes

**Tabela `zonas_entrega`:**

- [ ] Criar tabela
- [ ] Criar índices
- [ ] Configurar RLS
- [ ] Inserir bairros atendidos

**Tabela `clientes`:**

- [ ] Criar tabela
- [ ] Criar índices
- [ ] Configurar RLS

**Tabela `pedidos`:**

- [ ] Criar tabela
- [ ] Criar índices
- [ ] Configurar RLS

**Tabela `itens_pedido`:**

- [ ] Criar tabela
- [ ] Criar índices
- [ ] Configurar RLS

**Tabela `favoritos`:**

- [ ] Criar tabela
- [ ] Criar índices
- [ ] Configurar RLS

**Funções:**

- [ ] Criar função `calcular_tempo_entrega`
- [ ] Criar função `obter_zona_entrega`
- [ ] Criar função `atualizar_updated_at`

**Triggers:**

- [ ] Criar trigger `trigger_clientes_updated_at`
- [ ] Criar trigger `trigger_pedidos_updated_at`

---

### 7.2 Frontend (JavaScript)

**Configuração:**

- [ ] Instalar `@supabase/supabase-js`
- [ ] Criar cliente Supabase
- [ ] Configurar autenticação

**Autenticação:**

- [ ] Implementar cadastro
- [ ] Implementar login
- [ ] Implementar logout
- [ ] Implementar verificação de sessão

**Zonas de Entrega:**

- [ ] Implementar busca de bairros
- [ ] Implementar validação de bairro
- [ ] Criar seletor/autocomplete de bairros

**Cálculo de Tempo:**

- [ ] Implementar `calcularTempoPreparoMaximo`
- [ ] Implementar `calcularTempoEntrega`
- [ ] Exibir tempo estimado ao cliente

**Pedidos:**

- [ ] Implementar criação de pedido
- [ ] Implementar histórico de pedidos
- [ ] Implementar visualização de pedido específico

**Favoritos:**

- [ ] Implementar adicionar favorito
- [ ] Implementar remover favorito
- [ ] Implementar listagem de favoritos
- [ ] Implementar verificação se está favoritado

**Interface:**

- [ ] Criar carrinho de compras
- [ ] Criar formulário de endereço
- [ ] Criar seleção de pagamento
- [ ] Criar página de confirmação
- [ ] Criar página de acompanhamento de pedido

---

### 7.3 Testes

**Banco de Dados:**

- [ ] Testar criação de cliente
- [ ] Testar criação de pedido
- [ ] Testar validação de bairro
- [ ] Testar cálculo de tempo
- [ ] Testar RLS (segurança)

**Frontend:**

- [ ] Testar fluxo completo de pedido
- [ ] Testar cálculo de tempo com diferentes combinações
- [ ] Testar favoritos
- [ ] Testar histórico
- [ ] Testar validações de formulário

---

## 📚 Notas Finais

### Tempo de Preparo - Regra Principal

> ⚠️ **IMPORTANTE:** O tempo de preparo de um pedido é **SEMPRE** o maior tempo entre todos os itens, independente da quantidade.

**Exemplos:**

- 5x Hambúrguer (25 min) = 25 min total
- 1x Hambúrguer (25 min) + 3x Batata (15 min) = 25 min total
- 10x Coca-Cola (0 min) = 0 min total

### Multiplicador de Tempo

O multiplicador é aplicado **após** identificar o tempo máximo de preparo:

```
Tempo Final = tempo_preparo_maximo × multiplicador_bairro
```

### Suporte

Para dúvidas sobre Supabase:

- Documentação: https://supabase.com/docs
- Support: https://support.claude.com

---

**Documento criado em:** 25/01/2026
**Versão:** 1.0

```

```

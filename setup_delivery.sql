-- ==============================================================================
-- SCRIPT DE CONFIGURAÇÃO - SISTEMA DE DELIVERY BAR LOS HERMANOS
-- ==============================================================================

-- 1. ATUALIZAÇÃO DA TABELA CARDAPIO
-- Adiciona coluna de tempo de preparo se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cardapio' AND column_name = 'tempo_preparo') THEN
        ALTER TABLE cardapio ADD COLUMN tempo_preparo INTEGER DEFAULT 0;
        COMMENT ON COLUMN cardapio.tempo_preparo IS 'Tempo de preparo do item em minutos';
    END IF;
END $$;

-- Atualizar tempos padrão por categoria
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
UPDATE cardapio SET tempo_preparo = 0 WHERE categoria = 'bebidas';
UPDATE cardapio SET tempo_preparo = 3 WHERE categoria = 'drinks';

-- 2. TABELA ZONAS DE ENTREGA
CREATE TABLE IF NOT EXISTS zonas_entrega (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  bairro TEXT NOT NULL UNIQUE,
  cidade TEXT NOT NULL DEFAULT 'Governador Valadares',
  estado TEXT NOT NULL DEFAULT 'MG',
  taxa_entrega NUMERIC(10,2) NOT NULL,
  multiplicador_tempo NUMERIC(3,2) NOT NULL DEFAULT 1.00,
  ativo BOOLEAN DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_zonas_bairro ON zonas_entrega(bairro);
CREATE INDEX IF NOT EXISTS idx_zonas_ativo ON zonas_entrega(ativo);

ALTER TABLE zonas_entrega ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para zonas_entrega
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'zonas_entrega' AND policyname = 'Ver bairros atendidos') THEN
        CREATE POLICY "Ver bairros atendidos" ON zonas_entrega FOR SELECT USING (ativo = true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'zonas_entrega' AND policyname = 'Apenas admin modifica zonas') THEN
        CREATE POLICY "Apenas admin modifica zonas" ON zonas_entrega FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Dados iniciais de zonas
INSERT INTO zonas_entrega (bairro, taxa_entrega, multiplicador_tempo, observacoes) VALUES
('Centro', 10.00, 1.20, 'Região central - entrega rápida'),
('Ilha dos Araújos', 12.00, 1.20, NULL),
('Esplanada', 6.00, 1.20, 'Próximo ao centro'),
('Lourdes', 7.00, 1.20, 'Região nobre'),
('Grã-Duquesa', 7.00, 1.0, NULL),
('Santa Helena', 7.00, 1.30, NULL),
('Lagoa Santa', 8.00, 1.10, NULL),
('Vila Bretas', 8.00, 1.20, NULL),
('São Pedro', 12.00, 1.70, NULL),
('Altinópolis', 8.00, 1.20, 'Região periférica')
ON CONFLICT (bairro) DO NOTHING;

-- 3. TABELA CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY, -- Será o mesmo ID da tabela auth.users
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT,
  cpf TEXT UNIQUE,
  data_nascimento DATE,
  endereco_rua TEXT,
  endereco_numero TEXT,
  endereco_complemento TEXT,
  endereco_bairro TEXT,
  endereco_cidade TEXT DEFAULT 'Governador Valadares',
  endereco_estado TEXT DEFAULT 'MG',
  endereco_cep TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_telefone ON clientes(telefone);

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para clientes
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clientes' AND policyname = 'Clientes veem apenas seus dados') THEN
        CREATE POLICY "Clientes veem apenas seus dados" ON clientes FOR SELECT USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clientes' AND policyname = 'Clientes editam apenas seus dados') THEN
        CREATE POLICY "Clientes editam apenas seus dados" ON clientes FOR UPDATE USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clientes' AND policyname = 'Qualquer um pode criar cliente') THEN
        CREATE POLICY "Qualquer um pode criar cliente" ON clientes FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- 4. TABELA PEDIDOS
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pendente',
  tipo_pedido TEXT NOT NULL DEFAULT 'delivery',
  subtotal NUMERIC(10,2) NOT NULL,
  taxa_entrega NUMERIC(10,2) DEFAULT 0,
  desconto NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  bairro_entrega TEXT,
  zona_entrega_id INTEGER REFERENCES zonas_entrega(id),
  endereco_entrega JSONB,
  tempo_preparo_total INTEGER,
  tempo_entrega_estimado INTEGER,
  forma_pagamento TEXT,
  troco_para NUMERIC(10,2),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_data ON pedidos(created_at DESC);

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pedidos' AND policyname = 'Clientes veem apenas seus pedidos') THEN
        CREATE POLICY "Clientes veem apenas seus pedidos" ON pedidos FOR SELECT USING (cliente_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pedidos' AND policyname = 'Clientes podem criar pedidos') THEN
        CREATE POLICY "Clientes podem criar pedidos" ON pedidos FOR INSERT WITH CHECK (cliente_id = auth.uid());
    END IF;
END $$;

-- 5. TABELA ITENS_PEDIDO
CREATE TABLE IF NOT EXISTS itens_pedido (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  item_id INTEGER REFERENCES cardapio(id) ON DELETE RESTRICT,
  item_cod TEXT NOT NULL,
  item_nome TEXT NOT NULL,
  item_valor NUMERIC(10,2) NOT NULL,
  item_tempo_preparo INTEGER DEFAULT 0,
  quantidade INTEGER NOT NULL DEFAULT 1,
  observacoes TEXT,
  subtotal NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_itens_pedido_pedido ON itens_pedido(pedido_id);

ALTER TABLE itens_pedido ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'itens_pedido' AND policyname = 'Ver itens dos próprios pedidos') THEN
        CREATE POLICY "Ver itens dos próprios pedidos" ON itens_pedido FOR SELECT USING (
            EXISTS (SELECT 1 FROM pedidos WHERE pedidos.id = itens_pedido.pedido_id AND pedidos.cliente_id = auth.uid())
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'itens_pedido' AND policyname = 'Inserir itens nos próprios pedidos') THEN
        CREATE POLICY "Inserir itens nos próprios pedidos" ON itens_pedido FOR INSERT WITH CHECK (
            EXISTS (SELECT 1 FROM pedidos WHERE pedidos.id = itens_pedido.pedido_id AND pedidos.cliente_id = auth.uid())
        );
    END IF;
END $$;

-- 6. TABELA FAVORITOS
CREATE TABLE IF NOT EXISTS favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  item_id INTEGER REFERENCES cardapio(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(cliente_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_favoritos_cliente ON favoritos(cliente_id);

ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'favoritos' AND policyname = 'Ver próprios favoritos') THEN
        CREATE POLICY "Ver próprios favoritos" ON favoritos FOR SELECT USING (cliente_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'favoritos' AND policyname = 'Gerenciar favoritos') THEN
        CREATE POLICY "Gerenciar favoritos" ON favoritos FOR ALL USING (cliente_id = auth.uid());
    END IF;
END $$;

-- 7. FUNÇÕES E TRIGGERS

-- Atualizar updated_at
CREATE OR REPLACE FUNCTION atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_clientes_updated_at ON clientes;
CREATE TRIGGER trigger_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

DROP TRIGGER IF EXISTS trigger_pedidos_updated_at ON pedidos;
CREATE TRIGGER trigger_pedidos_updated_at BEFORE UPDATE ON pedidos FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

-- Calcular Tempo de Entrega
CREATE OR REPLACE FUNCTION calcular_tempo_entrega(p_tempo_preparo_total INTEGER, p_multiplicador_tempo NUMERIC)
RETURNS INTEGER AS $$
BEGIN
  RETURN CEIL(p_tempo_preparo_total * p_multiplicador_tempo);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Obter Zona de Entrega
CREATE OR REPLACE FUNCTION obter_zona_entrega(p_bairro TEXT)
RETURNS TABLE (zona_id INTEGER, taxa NUMERIC, multiplicador NUMERIC, atendido BOOLEAN, mensagem TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT z.id, z.taxa_entrega, z.multiplicador_tempo, true::BOOLEAN, 'Bairro atendido'::TEXT
  FROM zonas_entrega z WHERE LOWER(z.bairro) = LOWER(p_bairro) AND z.ativo = true LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::INTEGER, 0::NUMERIC, 0::NUMERIC, false::BOOLEAN, 'Desculpe, não entregamos neste bairro ainda.'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Validar Horário de Funcionamento (Seg-Sáb, 18h-23h)
CREATE OR REPLACE FUNCTION validar_horario_funcionamento()
RETURNS TRIGGER AS $$
DECLARE
  v_hora_atual TIMESTAMPTZ := NOW() AT TIME ZONE 'America/Sao_Paulo';
  v_dia_semana INTEGER := EXTRACT(DOW FROM v_hora_atual); -- 0=Domingo, 6=Sábado
  v_hora INTEGER := EXTRACT(HOUR FROM v_hora_atual);
BEGIN
  -- Bloqueio Estrito: Domingos
  IF v_dia_semana = 0 THEN
    RAISE EXCEPTION 'O bar está fechado aos domingos. Horário: Seg-Sáb 18h às 23h.';
  END IF;

  -- Bloqueio Estrito: Fora de 18h-23h
  IF v_hora < 18 OR v_hora > 23 THEN
    RAISE EXCEPTION 'Estamos fechados. Horário de funcionamento: Seg-Sáb das 18h às 23h.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validar_horario ON pedidos;
CREATE TRIGGER trigger_validar_horario BEFORE INSERT ON pedidos FOR EACH ROW EXECUTE FUNCTION validar_horario_funcionamento();

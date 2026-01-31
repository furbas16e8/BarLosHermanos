# Plano de Implementação: Múltiplos Endereços por Usuário

**Data:** 31/01/2026  
**Versão:** 1.0  
**Status:** Planejado  

---

## 📋 Resumo

Implementação de sistema para suportar múltiplos endereços de entrega por cliente, com limite de 3 endereços na UI.

---

## 🗄️ Mudanças no Banco de Dados

### 1. Nova Tabela: `enderecos`

```sql
-- Criar tabela de endereços
CREATE TABLE enderecos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    apelido VARCHAR(50), -- "Casa", "Trabalho", "Casa da Mãe"
    rua VARCHAR(200) NOT NULL,
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) DEFAULT 'Governador Valadares',
    estado VARCHAR(2) DEFAULT 'MG',
    cep VARCHAR(9),
    is_padrao BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_enderecos_cliente_id ON enderecos(cliente_id);
CREATE INDEX idx_enderecos_is_padrao ON enderecos(cliente_id, is_padrao) WHERE is_padrao = true;

-- Garantir apenas 1 endereço padrão por cliente
CREATE UNIQUE INDEX idx_endereco_unico_padrao 
ON enderecos(cliente_id) 
WHERE is_padrao = true;

-- Comentários para documentação
COMMENT ON TABLE enderecos IS 'Endereços de entrega dos clientes';
COMMENT ON COLUMN enderecos.apelido IS 'Nome amigável: Casa, Trabalho, etc';
COMMENT ON COLUMN enderecos.is_padrao IS 'Endereço padrão para novos pedidos';
```

### 2. Alterar Tabela: `pedidos`

```sql
-- Adicionar referência ao endereço usado no pedido
ALTER TABLE pedidos ADD COLUMN endereco_id UUID REFERENCES enderecos(id);

-- Comentário
COMMENT ON COLUMN pedidos.endereco_id IS 'Referência ao endereço de entrega escolhido';
```

### 3. Migrar Dados Existentes

```sql
-- Migrar endereços atuais da tabela clientes para enderecos
INSERT INTO enderecos (
    cliente_id,
    apelido,
    rua,
    numero,
    complemento,
    bairro,
    is_padrao
)
SELECT 
    id as cliente_id,
    'Principal' as apelido,
    endereco_rua,
    endereco_numero,
    endereco_complemento,
    endereco_bairro,
    true as is_padrao
FROM clientes 
WHERE endereco_rua IS NOT NULL;

-- Atualizar pedidos existentes para referenciar o endereço migrado
-- (se houver pedidos de teste, podemos apagá-los ou fazer essa vinculação)
-- Opcional: DELETE FROM pedidos WHERE created_at < '2026-02-01';
```

### 4. (Opcional) Remover Colunas Antigas

> ⚠️ **Executar APÓS validação completa do novo sistema**

```sql
-- Após confirmar que tudo funciona corretamente
ALTER TABLE clientes DROP COLUMN IF EXISTS endereco_rua;
ALTER TABLE clientes DROP COLUMN IF EXISTS endereco_numero;
ALTER TABLE clientes DROP COLUMN IF EXISTS endereco_complemento;
ALTER TABLE clientes DROP COLUMN IF EXISTS endereco_bairro;
```

---

## ⚡ Functions e Triggers

### Trigger para garantir apenas 1 endereço padrão

```sql
-- Function para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger
CREATE TRIGGER update_enderecos_updated_at
    BEFORE UPDATE ON enderecos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function para garantir apenas 1 endereço padrão por cliente
CREATE OR REPLACE FUNCTION garantir_unico_endereco_padrao()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_padrao = true THEN
        UPDATE enderecos 
        SET is_padrao = false 
        WHERE cliente_id = NEW.cliente_id 
        AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_unico_endereco_padrao
    BEFORE INSERT OR UPDATE ON enderecos
    FOR EACH ROW
    EXECUTE FUNCTION garantir_unico_endereco_padrao();
```

---

## 📱 Mudanças no Frontend

### 1. Página: `address.html`

#### Novos elementos UI:
- Lista de cards mostrando até 3 endereços
- Cada card mostra: apelido (se houver), rua, número, bairro
- Badge "Padrão" no endereço principal
- Botões de ação por endereço:
  - "Definir como padrão" (se não for o padrão)
  - "Editar"
  - "Excluir" (com confirmação)
- Botão "Novo Endereço" (desabilitado se já tiver 3)
- Modal para adicionar/editar endereço

#### Validações:
- Máximo 3 endereços por usuário
- Campos obrigatórios: rua, número, bairro
- Apelido opcional (máx 50 caracteres)

### 2. Página: `perfil.html`

#### Alterações:
- Mostrar apelido do endereço padrão (ou "Principal" se não tiver apelido)
- Link "Gerenciar Endereços" → `address.html`

### 3. Página: `checkout.js` / Fluxo de Pedido

#### Alterações:
- Selecionar endereço de entrega (dropdown ou lista)
- Mostrar taxa de entrega baseada no bairro do endereço selecionado
- Salvar `endereco_id` ao criar pedido
- Fallback: se não selecionar, usar o endereço padrão

### 4. Novo arquivo: `assets/js/addresses.js`

```javascript
// API de endereços
const addressesAPI = {
    // Buscar todos os endereços do usuário
    async getByUser(userId) { ... },
    
    // Buscar endereço padrão
    async getDefault(userId) { ... },
    
    // Criar novo endereço
    async create(addressData) { ... },
    
    // Atualizar endereço
    async update(id, addressData) { ... },
    
    // Definir como padrão
    async setAsDefault(id) { ... },
    
    // Excluir endereço
    async delete(id) { ... },
    
    // Verificar limite (3 endereços)
    async canAddMore(userId) { ... }
};
```

---

## 🔄 Fluxos de Usuário

### Fluxo 1: Primeiro Acesso (Migração)

```
Usuário faz login
  ↓
Sistema detecta que tem endereço na tabela antiga
  ↓
Migra automaticamente para nova tabela com apelido "Principal"
  ↓
Marca como endereço padrão
```

### Fluxo 2: Adicionar Novo Endereço

```
Usuário clica "Novo Endereço"
  ↓
Sistema verifica: já tem 3 endereços?
  ├── Sim → Mostra mensagem "Limite de 3 endereços atingido"
  └── Não → Abre modal/formulário
              ↓
              Usuário preenche (apelido opcional)
              ↓
              Salva no Supabase
              ↓
              Atualiza lista na tela
```

### Fluxo 3: Fazer Pedido

```
Usuário no checkout
  ↓
Sistema carrega endereços do usuário
  ↓
Mostra dropdown: "Selecione o endereço de entrega"
  ↓
Endereço padrão já vem selecionado
  ↓
Usuário pode trocar → Recalcula taxa de entrega
  ↓
Ao confirmar pedido, salva endereco_id
```

### Fluxo 4: Editar/Excluir

```
Usuário clica "Editar" em um endereço
  ↓
Abre modal com dados preenchidos
  ↓
Salva alterações
  ↓
Se era o padrão e mudou o bairro → Recalcula taxas em pedidos em aberto

Usuário clica "Excluir"
  ↓
Confirmação: "Tem certeza?"
  ↓
Se for o único endereço → Aviso "Você precisa ter pelo menos 1 endereço"
  ↓
Se for o padrão → Define outro como padrão (o mais antigo)
  ↓
Remove do banco e atualiza UI
```

---

## 📋 Checklist de Implementação

### Fase 1: Banco de Dados
- [ ] Criar tabela `enderecos`
- [ ] Criar índices
- [ ] Criar functions e triggers
- [ ] Alterar tabela `pedidos` (adicionar `endereco_id`)
- [ ] Migrar dados existentes
- [ ] Configurar RLS (Row Level Security) - usuários só veem seus endereços

### Fase 2: Backend (Supabase)
- [ ] Criar policies de segurança:
  ```sql
  -- Usuários só podem ver/editar seus próprios endereços
  CREATE POLICY "Users can view own addresses" ON enderecos
      FOR SELECT USING (auth.uid() = cliente_id);
  
  CREATE POLICY "Users can insert own addresses" ON enderecos
      FOR INSERT WITH CHECK (auth.uid() = cliente_id);
  
  CREATE POLICY "Users can update own addresses" ON enderecos
      FOR UPDATE USING (auth.uid() = cliente_id);
  
  CREATE POLICY "Users can delete own addresses" ON enderecos
      FOR DELETE USING (auth.uid() = cliente_id);
  ```
- [ ] Testar migrations

### Fase 3: Frontend - Core
- [ ] Criar `assets/js/addresses.js` com API
- [ ] Criar funções de validação
- [ ] Testar integração com Supabase

### Fase 4: Frontend - Páginas
- [ ] Refatorar `address.html`
  - [ ] Listar múltiplos endereços
  - [ ] Card de endereço com ações
  - [ ] Modal add/edit
  - [ ] Validação limite de 3
- [ ] Atualizar `perfil.html`
  - [ ] Mostrar apelido do endereço padrão
- [ ] Atualizar checkout
  - [ ] Seleção de endereço
  - [ ] Cálculo dinâmico de taxa
  - [ ] Salvar `endereco_id` no pedido

### Fase 5: Testes
- [ ] Adicionar primeiro endereço
- [ ] Adicionar até 3 endereços
- [ ] Tentar adicionar 4º (deve bloquear)
- [ ] Definir endereço como padrão
- [ ] Editar endereço
- [ ] Excluir endereço
- [ ] Tentar excluir único endereço (deve avisar)
- [ ] Fazer pedido com endereço selecionado
- [ ] Verificar se `endereco_id` foi salvo no pedido
- [ ] Verificar se taxa corresponde ao bairro do endereço escolhido

### Fase 6: Limpeza (Opcional)
- [ ] Remover colunas antigas de `clientes`
- [ ] Atualizar documentação

---

## 🔐 Regras de Negócio

| Regra | Implementação |
|-------|---------------|
| Máximo 3 endereços | Validação no frontend + constraint na UI |
| Apenas 1 endereço padrão | Trigger no banco garante unicidade |
| Apelido opcional | Campo nullable no banco |
| Campos obrigatórios | rua, numero, bairro (NOT NULL) |
| Proteção de dados | RLS - usuário só vê seus endereços |
| Histórico de pedidos | `pedidos.endereco_id` mantém referência mesmo se endereço for editado |

---

## 📁 Arquivos a Criar/Modificar

### Novos arquivos:
- `assets/js/addresses.js` - API e lógica de endereços

### Arquivos a modificar:
- `address.html` - Interface completa de gerenciamento
- `perfil.html` - Mostrar endereço padrão
- `checkout.js` - Seleção de endereço no pedido
- `db/schema.sql` - Adicionar nova tabela (se houver)

---

## 📝 Notas

- **Limite de 3**: Implementado apenas no frontend. O banco permite ilimitado (para futuro).
- **Migração automática**: Idealmente fazer via script SQL único antes do deploy.
- **Pedidos de teste**: Como autorizou, podemos apagar pedidos antigos para simplificar.
- **Cálculo de taxa**: Continua usando `zonas_entrega` pelo bairro, agora do endereço selecionado.

---

## 🚀 Próximos Passos

1. **Revisar** este plano com stakeholders
2. **Aprovar** estrutura do banco
3. **Implementar** Fase 1 (banco)
4. **Testar** migrations
5. **Implementar** Fase 3 e 4 (frontend)
6. **Deploy** e validação

---

**Criado em:** 31/01/2026  
**Autor:** Agent  
**Status:** Aguardando aprovação para implementação

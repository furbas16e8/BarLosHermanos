# Registro de Implementação: Múltiplos Endereços por Usuário

**Data:** 31/01/2026  
**Sessão:** Implementação do Sistema de Endereços  
**Autor:** Agent  

---

## Resumo

Implementação completa do sistema de múltiplos endereços de entrega por cliente, com limite de 3 endereços na UI e estrutura ilimitada no banco de dados.

---

## 🗄️ Estrutura do Banco (Implementada pelo Usuário)

### Nova Tabela: `enderecos`

```sql
CREATE TABLE enderecos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    apelido VARCHAR(50),                 -- "Casa", "Trabalho", etc
    rua VARCHAR(200) NOT NULL,
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) DEFAULT 'Governador Valadares',
    estado VARCHAR(2) DEFAULT 'MG',
    cep VARCHAR(9),
    is_padrao BOOLEAN DEFAULT false,     -- Flag de endereço padrão
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_enderecos_cliente_id ON enderecos(cliente_id);
CREATE INDEX idx_enderecos_is_padrao ON enderecos(cliente_id, is_padrao) WHERE is_padrao = true;

-- Constraint única: apenas 1 endereço padrão por cliente
CREATE UNIQUE INDEX idx_endereco_unico_padrao 
ON enderecos(cliente_id) 
WHERE is_padrao = true;
```

### Alteração Tabela: `pedidos`

```sql
ALTER TABLE pedidos ADD COLUMN endereco_id UUID REFERENCES enderecos(id);
```

### Functions e Triggers

```sql
-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_enderecos_updated_at
    BEFORE UPDATE ON enderecos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Garantir apenas 1 endereço padrão por cliente
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

## 🐛 Erro Encontrado e Corrigido

### Erro: `addressesAPI is not defined`

**Log do Console:**
```
checkout.js:182 Erro ao carregar endereços: ReferenceError: addressesAPI is not defined
    at loadUserAddresses (checkout.js:163:44)
    at HTMLDocument.initCheckout (checkout.js:32:11)
```

**Causa:**  
O arquivo `assets/js/addresses.js` não estava sendo carregado em `shopping.html` (página de checkout). O `checkout.js` depende da API `addressesAPI` que é exposta pelo `addresses.js`.

**Arquivo Afetado:** `shopping.html`

**Antes:**
```html
<script src="assets/js/supabase-client.js"></script>
<script src="assets/js/checkout.js"></script>
```

**Depois:**
```html
<script src="assets/js/supabase-client.js"></script>
<script src="assets/js/addresses.js"></script>
<script src="assets/js/checkout.js"></script>
```

**Resultado:** ✅ Checkout carrega endereços corretamente

---

## 🔄 Mudanças no Frontend

### 1. Novo Arquivo: `assets/js/addresses.js`

API completa para gerenciamento de endereços:

```javascript
window.addressesAPI = {
    getUserAddresses,       // Buscar todos os endereços
    getDefaultAddress,      // Buscar endereço padrão
    getAddressById,         // Buscar por ID
    canAddMoreAddresses,    // Verificar limite (3)
    createAddress,          // Criar novo
    updateAddress,          // Atualizar
    setDefaultAddress,      // Definir como padrão
    deleteAddress,          // Excluir
    formatAddress,          // Formatar para exibição
    formatAddressShort,     // Formato curto
    MAX_ADDRESSES           // Constante: 3
};
```

### 2. Atualização: `address.html`

**Funcionalidades implementadas:**
- Lista de cards mostrando até 3 endereços
- Cada card exibe: apelido (se houver), rua, número, bairro
- Badge "Padrão" no endereço principal
- Botões por endereço:
  - "Tornar Padrão" (se não for o padrão)
  - "Editar" (abre modal)
  - "Excluir" (com confirmação)
- Modal add/edit com campos:
  - Apelido (opcional)
  - Rua (obrigatório)
  - Número (obrigatório)
  - Complemento
  - Bairro (select populado de zonas_entrega)
  - Cidade/Estado (readonly, default GV/MG)
  - Checkbox "Definir como padrão"
- Bloqueio de novo endereço quando atinge 3
- Contador "X/3" no header

### 3. Atualização: `perfil.html`

**Mudança:** Exibe apelido do endereço padrão

```javascript
// Antes: Mostrava endereco_rua, endereco_numero da tabela clientes
// Depois: Usa addressesAPI.getDefaultAddress() e mostra apelido

// Exibição:
// "Casa: Rua A, 123 - Centro"
// ou sem apelido:
// "Rua A, 123 - Centro"
```

### 4. Atualização: `assets/js/checkout.js`

**Mudanças:**
- Integração com `addressesAPI`
- Carrega endereço padrão automaticamente
- Exibe endereço com botão "ALTERAR"
- Remove dropdown de seleção (simplificado)
- Botão "ALTERAR" redireciona para `address.html`
- Cálculo de taxa de entrega baseado no bairro do endereço selecionado
- Salva `endereco_id` no pedido (auditoria)

**Fluxo simplificado:**
```
Checkout carrega
  ↓
Busca endereço padrão
  ↓
Exibe endereço + botão [ALTERAR]
  ↓
Usuário clica ALTERAR → vai para address.html
  ↓
Define novo padrão lá → volta para checkout
  ↓
Checkout mostra novo endereço padrão
```

---

## 📊 Fluxo Completo do Sistema

### Fluxo 1: Cadastrar Primeiro Endereço

```
Usuário novo → address.html
  ↓
"Nenhum endereço cadastrado"
  ↓
Clica "Novo Endereço"
  ↓
Preenche formulário
  ↓
Marca "Definir como padrão" (marcado automaticamente se for o único)
  ↓
Salva
  ↓
Card aparece na lista com badge "Padrão"
```

### Fluxo 2: Adicionar Segundo/Terceiro Endereço

```
address.html mostra contador "1/3"
  ↓
Clica "Novo Endereço"
  ↓
Preenche formulário
  ↓
Pode ou não marcar como padrão
  ↓
Salva
  ↓
Novo card aparece
  ↓
Contador atualiza "2/3"
```

### Fluxo 3: Limite de Endereços

```
address.html mostra "3/3"
  ↓
Botão "Novo Endereço" é escondido
  ↓
Aparece mensagem "Limite de 3 endereços atingido"
  ↓
Para adicionar novo, precisa excluir um existente
```

### Fluxo 4: Fazer Pedido

```
Usuário adiciona itens ao carrinho
  ↓
Vai para shopping.html (checkout)
  ↓
Sistema carrega endereço padrão
  ↓
Exibe: Apelido, Rua, Número, Bairro
  ↓
Botão [ALTERAR] disponível
  ↓
Calcula taxa de entrega pelo bairro
  ↓
Usuário confirma pedido
  ↓
Sistema salva:
  - pedidos.endereco_id = id do endereço
  - pedidos.endereco_entrega = {rua, numero, complemento, bairro...}
```

### Fluxo 5: Trocar Endereço Padrão

```
Usuário em address.html
  ↓
Clica "Tornar Padrão" em um endereço não-padrão
  ↓
Sistema atualiza via trigger
  ↓
Antigo padrão perde badge
  ↓
Novo padrão ganha badge
  ↓
Próximo pedido usará este endereço
```

---

## 🎯 Decisões de Arquitetura

### 1. Tabela Separada vs Colunas na tabela `clientes`

**Escolhido:** Tabela separada `enderecos`

**Justificativa:**
- ✅ Escalável (pode ter N endereços no futuro)
- ✅ Normalização (1NF) - não repete dados
- ✅ Auditoria - `pedidos.endereco_id` referencia endereço exato usado
- ✅ CRUD limpo - operações por ID

### 2. Limite de 3 Endereços

**Implementação:** Validação apenas no frontend

```javascript
// addresses.js
const MAX_ADDRESSES = 3;

// UI bloqueia quando atinge 3
// Banco permite ilimitado (flexibilidade futura)
```

### 3. Endereço Padrão

**Implementação:** Flag `is_padrao` + trigger no banco

```sql
-- Trigger garante apenas 1 padrão por cliente
-- Quando marca um como padrão, desmarca os outros automaticamente
```

### 4. Apelido Opcional

**UX:** Usuário pode identificar endereços por nome amigável

```
"Casa" → Rua das Flores, 123
"Trabalho" → Av. Principal, 456
(null) → Rua das Flores, 123
```

### 5. Checkout Simplificado

**Decisão:** Remover dropdown, manter apenas botão "ALTERAR"

**Justificativa:**
- Fluxo mais simples e direto
- Gerenciamento centralizado em address.html
- Evita confusão de qual endereço está selecionado
- Padrão é sempre o escolhido automaticamente

---

## 📁 Arquivos Modificados/Criados

### Novos Arquivos:
| Arquivo | Descrição |
|---------|-----------|
| `assets/js/addresses.js` | API completa de endereços (14KB) |

### Arquivos Modificados:
| Arquivo | Mudanças |
|---------|----------|
| `address.html` | Refatorado para suportar múltiplos endereços (cards, modal, limite 3) |
| `perfil.html` | +import addresses.js, mostra apelido do endereço padrão |
| `shopping.html` | +import addresses.js (correção do bug) |
| `assets/js/checkout.js` | Integração com addressesAPI, exibição simplificada |

---

## ✅ Checklist de Funcionalidades

### address.html
- [x] Lista até 3 endereços em cards
- [x] Badge "Padrão" no endereço principal
- [x] Botão "Tornar Padrão" para endereços secundários
- [x] Botão "Editar" (abre modal)
- [x] Botão "Excluir" com confirmação
- [x] Modal add/edit com validações
- [x] Select de bairros populado de zonas_entrega
- [x] Limite de 3 endereços (bloqueia botão novo)
- [x] Contador X/3 no header
- [x] Estado vazio quando não tem endereço
- [x] Toast notifications para feedback

### perfil.html
- [x] Mostra apelido do endereço padrão
- [x] Link para address.html

### checkout.js
- [x] Carrega endereço padrão automaticamente
- [x] Exibe endereço completo
- [x] Botão "ALTERAR" redireciona para address.html
- [x] Calcula taxa de entrega pelo bairro
- [x] Salva endereco_id no pedido
- [x] Estado sem endereço com botão "CADASTRAR"

### addresses.js (API)
- [x] getUserAddresses()
- [x] getDefaultAddress()
- [x] getAddressById()
- [x] canAddMoreAddresses()
- [x] createAddress() com validações
- [x] updateAddress()
- [x] setDefaultAddress()
- [x] deleteAddress() (protege último endereço)
- [x] formatAddress() e formatAddressShort()
- [x] Todas as funções verificam autenticação

---

## 🧪 Logs de Teste

### Teste Manual Realizado pelo Usuário

**Log de navegação bem-sucedida:**
```
orders.js:154 [Cart] getCart: Carrinho encontrado, validando... {userId: '7f2a4aab-d0a0-4857-a875-2deb389c398b'}
orders.js:109 [Cart] isCartValid: Cart userId: 7f2a4aab-d0a0-4857-a875-2deb389c398b Current userId: 7f2a4aab-d0a0-4857-a875-2deb389c398b
orders.js:161 [Cart] getCart: Carrinho válido, items: 2
supabase-client.js:176 [Auth] Evento: SIGNED_IN
supabase-client.js:181 [Auth] Usuário logado: 7f2a4aab-d0a0-4857-a875-2deb389c398b
...
checkout.js:182 Erro ao carregar endereços: ReferenceError: addressesAPI is not defined
```

**Resolução:** Adicionado `<script src="assets/js/addresses.js">` em shopping.html

---

## 📌 Próximos Passos (Futuro)

- [ ] Remover colunas antigas de `clientes` (após validação completa)
- [ ] Adicionar máscara de CEP no formulário
- [ ] Validação de CEP via API dos Correios (opcional)
- [ ] Permitir ordenar endereços (drag & drop)
- [ ] Histórico de alterações de endereço

---

## 📝 Notas

- **Sistema está funcional** conforme validação do usuário
- **Todos os bugs corrigidos** durante a sessão
- **Arquitetura escalável** permite evoluções futuras
- **Código documentado** e seguindo padrões do projeto

---

**Documento criado em:** 31/01/2026  
**Última atualização:** 31/01/2026  
**Status:** ✅ Implementação Concluída e Validada

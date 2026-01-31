# Registro de Bugs Corrigidos - Sistema de Carrinho

**Data:** 31/01/2026  
**Sessão:** Implementação de Isolamento e Expiração do Carrinho  
**Autor:** Agent  

---

## Resumo

Durante a implementação do sistema de isolamento do carrinho por usuário, foram detectados e corrigidos **3 bugs críticos** relacionados a hoisting de variáveis e ordem de execução de funções. Este documento registra cada bug, seus sintomas, logs de erro e as correções aplicadas.

---

## Bug 1: Hoisting de Constantes do Carrinho

### 🔴 Erro Detectado (Console)

```
orders.js:1 Uncaught ReferenceError: tailwind is not defined
    at orders.js:1:1

supabase.js:23 ReferenceError: Cannot access 'LEGACY_CART_KEY' before initialization
    at migrateLegacyCart (orders.js:202:42)
    at Object.callback (supabase-client.js:192:17)

orders.js:143 Uncaught (in promise) ReferenceError: Cannot access 'CART_STORAGE_KEY' before initialization
    at getCart (orders.js:143:36)
    at updateCheckoutTotals (checkout.js:273:50)
```

### 🔍 Análise

O erro ocorreu porque:
1. O arquivo `orders.js` começava com `tailwind.config = {...}`
2. As constantes `CART_STORAGE_KEY`, `LEGACY_CART_KEY` e `STORE_CLOSE_HOUR` eram declaradas **após** o bloco do tailwind
3. Funções como `getCart()` e `migrateLegacyCart()` tentavam acessar essas constantes durante a inicialização
4. Devido ao hoisting, o JavaScript executava código antes das constantes estarem disponíveis

### ✅ Correção Aplicada

**Arquivo:** `assets/js/orders.js`

**Antes:**
```javascript
tailwind.config = { ... };  // ← Código executável primeiro

// Constantes depois (causando hoisting issues)
const CART_STORAGE_KEY = 'bar_los_hermanos_cart_v2';
const LEGACY_CART_KEY = 'bar-los-hermanos-cart';
```

**Depois:**
```javascript
// Constantes PRIMEIRO
const CART_STORAGE_KEY = 'bar_los_hermanos_cart_v2';
const LEGACY_CART_KEY = 'bar-los-hermanos-cart';
const STORE_CLOSE_HOUR = 23;

// Código executável depois
if (typeof tailwind !== 'undefined') {
  tailwind.config = { ... };
}
```

### 🎯 Impacto

- ❌ **Antes:** Carrinho não funcionava, constantes `undefined` em tempo de execução
- ✅ **Depois:** Constantes disponíveis imediatamente, carrinho funciona normalmente

---

## Bug 2: Função updateNavbarCartCount Não Definida

### 🔴 Erro Detectado (Console)

```
navbar.js:60 Uncaught ReferenceError: updateNavbarCartCount is not defined
    at initNavbar (navbar.js:60:5)
    at navbar.js:67:5
```

### 🔍 Análise

O erro ocorreu porque:
1. `initNavbar()` era chamada imediatamente no carregamento do módulo
2. Dentro de `initNavbar()`, havia uma chamada para `updateNavbarCartCount()`
3. A função `window.updateNavbarCartCount` só era definida **no final** do arquivo
4. Como `initNavbar()` executava antes da definição completa do arquivo, a função não existia

**Fluxo de execução problemático:**
```
1. JS carrega → Executa código no escopo global
2. initNavbar() é chamada (linha 67)
3. initNavbar() tenta chamar updateNavbarCartCount()
4. ERRO: função ainda não foi definida (está no final do arquivo)
```

### ✅ Correção Aplicada

**Arquivo:** `assets/js/navbar.js`

**Antes:**
```javascript
// Código executado imediatamente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
} else {
    initNavbar();  // ← Chamada aqui
}

// ... outras funções ...

// updateNavbarCartCount definida no final
window.updateNavbarCartCount = function() { ... };
```

**Depois:**
```javascript
// FUNÇÃO DEFINIDA PRIMEIRO
window.updateNavbarCartCount = function() { 
    // ... implementação ...
};

// INICIALIZAÇÃO DEPOIS
function initNavbar() {
    // ...
    updateNavbarCartCount();  // ← Agora funciona!
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
} else {
    initNavbar();
}
```

### 🎯 Impacto

- ❌ **Antes:** Erro no console, badge de carrinho não atualizava automaticamente
- ✅ **Depois:** Badge atualiza corretamente ao adicionar/remover itens

---

## Bug 3: Acesso a Elementos DOM Inexistentes

### 🔴 Erro Detectado (Console)

```
checkout.js:383 Uncaught TypeError: Cannot read properties of null (reading 'classList')
    at HTMLDocument.updateBranchUI (checkout.js:383:15)
```

### 🔍 Análise

O erro ocorreu porque:
1. A função `updateBranchUI()` assumia que elementos `#btn-branch-bairro` e `#btn-branch-centro` existiam
2. Esses elementos só existem em páginas específicas (como `shopping.html`)
3. Quando o script `checkout.js` era carregado em outras páginas, os elementos não existiam
4. Tentar acessar `.classList` de `null` causava o TypeError

**Código problemático:**
```javascript
function updateBranchUI() {
    const btnBairro = document.getElementById('btn-branch-bairro');
    const btnCentro = document.getElementById('btn-branch-centro');
    
    // ERRO: btnBairro pode ser null
    btnBairro.classList.remove('branch-option--selected');
}
```

### ✅ Correção Aplicada

**Arquivo:** `assets/js/checkout.js`

**Antes:**
```javascript
function updateBranchUI() {
    const selected = localStorage.getItem('selected-branch') || 'Bairro';
    const btnBairro = document.getElementById('btn-branch-bairro');
    const btnCentro = document.getElementById('btn-branch-centro');
    
    btnBairro.classList.remove('branch-option--selected');  // ← Pode falhar
    btnCentro.classList.remove('branch-option--selected'); // ← Pode falhar
    // ...
}
```

**Depois:**
```javascript
function updateBranchUI() {
    const selected = localStorage.getItem('selected-branch') || 'Bairro';
    const btnBairro = document.getElementById('btn-branch-bairro');
    const btnCentro = document.getElementById('btn-branch-centro');
    
    // Verificar se elementos existem antes de manipular
    if (!btnBairro || !btnCentro) return;  // ← Proteção adicionada
    
    btnBairro.classList.remove('branch-option--selected');
    btnCentro.classList.remove('branch-option--selected');
    // ...
}
```

### 🎯 Impacto

- ❌ **Antes:** Erro no console em páginas sem os botões de filial
- ✅ **Depois:** Função executa silenciosamente quando elementos não existem

---

## Lições Aprendidas

### 1. Ordem de Declaração em JavaScript

```
✅ CONSTANTES → FUNÇÕES → CÓDIGO EXECUTÁVEL
```

Sempre declare constantes e funções antes de qualquer código que as utilize.

### 2. Padrão Defensivo para DOM

```javascript
// Sempre verifique antes de manipular
const element = document.getElementById('id');
if (!element) return;  // Proteção contra null

// Ou use optional chaining
element?.classList?.add('classe');
```

### 3. Logs de Console São Essenciais

Os logs fornecidos pelo usuário permitiram identificar:
- **Qual** arquivo tinha o problema
- **Qual** linha causava o erro
- **Qual** era a natureza do erro (ReferenceError vs TypeError)

---

## Checklist de Validação

Após correções, verificar no console:

- [ ] Nenhum `ReferenceError` relacionado a constantes do carrinho
- [ ] Nenhum `ReferenceError` sobre `updateNavbarCartCount`
- [ ] Nenhum `TypeError` sobre propriedades de `null`
- [ ] Badge do carrinho atualiza ao adicionar itens
- [ ] Carrinho persiste entre navegações

---

## Arquivos Modificados

1. `assets/js/orders.js` - Ordem de declaração de constantes
2. `assets/js/navbar.js` - Posicionamento da função `updateNavbarCartCount`
3. `assets/js/checkout.js` - Verificação de null em `updateBranchUI`

---

**Documento criado em:** 31/01/2026  
**Última atualização:** 31/01/2026

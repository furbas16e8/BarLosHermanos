-- =============================================================================
-- QUERIES EXPLORATÓRIAS PARA CLICKATENDE (SQLite)
-- Bar Los Hermanos - Dashboard de Gestão
-- 
-- Uso: Execute estas queries após obter acesso ao banco SQLite do ClickAtende
--      para mapear a estrutura e validar os dados disponíveis.
-- =============================================================================

-- #############################################################################
-- SEÇÃO 1: DESCOBERTA DE ESTRUTURA
-- Execute primeiro para entender o banco
-- #############################################################################

-- 1.1 Listar todas as tabelas do banco
SELECT name AS tabela 
FROM sqlite_master 
WHERE type = 'table' 
ORDER BY name;

-- 1.2 Ver estrutura de uma tabela específica
-- Substitua 'NOME_TABELA' pelo nome real da tabela
PRAGMA table_info(NOME_TABELA);

-- 1.3 Listar todas as colunas de todas as tabelas (visão geral)
SELECT 
    m.name AS tabela,
    p.name AS coluna,
    p.type AS tipo,
    p.pk AS chave_primaria
FROM sqlite_master m
JOIN pragma_table_info(m.name) p
WHERE m.type = 'table'
ORDER BY m.name, p.cid;

-- #############################################################################
-- SEÇÃO 2: EXPLORAÇÃO DE VENDAS/PEDIDOS
-- Adapte os nomes das tabelas e colunas conforme descoberto na Seção 1
-- #############################################################################

-- 2.1 Visualizar amostra de vendas (últimos 20 registros)
-- Substitua 'vendas' e 'data_hora' pelos nomes reais
SELECT * 
FROM vendas 
ORDER BY data_hora DESC 
LIMIT 20;

-- 2.2 Contar total de registros de vendas
SELECT COUNT(*) AS total_vendas FROM vendas;

-- 2.3 Verificar intervalo de datas disponível
SELECT 
    MIN(data_hora) AS primeira_venda,
    MAX(data_hora) AS ultima_venda
FROM vendas;

-- 2.4 Total de vendas por dia (últimos 30 dias)
SELECT 
    DATE(data_hora) AS dia, 
    COUNT(*) AS quantidade_vendas, 
    SUM(valor_total) AS faturamento_dia
FROM vendas
WHERE data_hora >= DATE('now', '-30 days')
GROUP BY DATE(data_hora)
ORDER BY dia DESC;

-- 2.5 Faturamento por mês
SELECT 
    strftime('%Y-%m', data_hora) AS mes,
    COUNT(*) AS quantidade_vendas,
    SUM(valor_total) AS faturamento_mes,
    AVG(valor_total) AS ticket_medio
FROM vendas
GROUP BY strftime('%Y-%m', data_hora)
ORDER BY mes DESC;

-- 2.6 Vendas por hora do dia (identificar horários de pico)
SELECT 
    strftime('%H', data_hora) AS hora,
    COUNT(*) AS quantidade_vendas,
    SUM(valor_total) AS faturamento
FROM vendas
GROUP BY strftime('%H', data_hora)
ORDER BY hora;

-- 2.7 Vendas por dia da semana
SELECT 
    CASE strftime('%w', data_hora)
        WHEN '0' THEN 'Domingo'
        WHEN '1' THEN 'Segunda'
        WHEN '2' THEN 'Terça'
        WHEN '3' THEN 'Quarta'
        WHEN '4' THEN 'Quinta'
        WHEN '5' THEN 'Sexta'
        WHEN '6' THEN 'Sábado'
    END AS dia_semana,
    COUNT(*) AS quantidade_vendas,
    SUM(valor_total) AS faturamento
FROM vendas
GROUP BY strftime('%w', data_hora)
ORDER BY strftime('%w', data_hora);

-- #############################################################################
-- SEÇÃO 3: EXPLORAÇÃO DE PRODUTOS
-- Identifique a tabela de itens/produtos vendidos
-- #############################################################################

-- 3.1 Visualizar amostra de itens vendidos
SELECT * FROM itens_venda LIMIT 20;

-- 3.2 Produtos mais vendidos (por quantidade)
SELECT 
    produto_id,
    -- produto_nome, -- Descomente se houver coluna de nome
    COUNT(*) AS vezes_vendido,
    SUM(quantidade) AS total_unidades,
    SUM(valor_item) AS faturamento_produto
FROM itens_venda
GROUP BY produto_id
ORDER BY total_unidades DESC
LIMIT 20;

-- 3.3 Verificar se existe tabela de produtos
SELECT * FROM produtos LIMIT 10;

-- 3.4 Produtos com nome (se houver JOIN possível)
SELECT 
    p.nome AS produto,
    COUNT(i.id) AS vezes_vendido,
    SUM(i.quantidade) AS total_unidades,
    SUM(i.valor_item) AS faturamento
FROM itens_venda i
JOIN produtos p ON i.produto_id = p.id
GROUP BY p.id, p.nome
ORDER BY total_unidades DESC
LIMIT 20;

-- #############################################################################
-- SEÇÃO 4: EXPLORAÇÃO DE FORMAS DE PAGAMENTO
-- #############################################################################

-- 4.1 Verificar formas de pagamento registradas
SELECT DISTINCT forma_pagamento FROM vendas;

-- 4.2 Distribuição por forma de pagamento
SELECT 
    forma_pagamento,
    COUNT(*) AS quantidade,
    SUM(valor_total) AS faturamento,
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM vendas), 2) AS percentual
FROM vendas
GROUP BY forma_pagamento
ORDER BY faturamento DESC;

-- #############################################################################
-- SEÇÃO 5: EXPLORAÇÃO DE COLABORADORES/OPERADORES
-- #############################################################################

-- 5.1 Listar operadores únicos
SELECT DISTINCT operador FROM vendas;

-- 5.2 Atendimentos por operador
SELECT 
    operador,
    COUNT(*) AS total_atendimentos,
    SUM(valor_total) AS faturamento_gerado,
    AVG(valor_total) AS ticket_medio
FROM vendas
GROUP BY operador
ORDER BY total_atendimentos DESC;

-- 5.3 Performance por operador nos últimos 30 dias
SELECT 
    operador,
    COUNT(*) AS atendimentos,
    SUM(valor_total) AS faturamento,
    AVG(valor_total) AS ticket_medio
FROM vendas
WHERE data_hora >= DATE('now', '-30 days')
GROUP BY operador
ORDER BY faturamento DESC;

-- 5.4 Atendimentos por operador por dia da semana
SELECT 
    operador,
    CASE strftime('%w', data_hora)
        WHEN '0' THEN 'Dom'
        WHEN '1' THEN 'Seg'
        WHEN '2' THEN 'Ter'
        WHEN '3' THEN 'Qua'
        WHEN '4' THEN 'Qui'
        WHEN '5' THEN 'Sex'
        WHEN '6' THEN 'Sab'
    END AS dia,
    COUNT(*) AS atendimentos
FROM vendas
GROUP BY operador, strftime('%w', data_hora)
ORDER BY operador, strftime('%w', data_hora);

-- #############################################################################
-- SEÇÃO 6: VALIDAÇÕES E QUALIDADE DE DADOS
-- #############################################################################

-- 6.1 Verificar registros sem valor
SELECT COUNT(*) AS vendas_sem_valor 
FROM vendas 
WHERE valor_total IS NULL OR valor_total = 0;

-- 6.2 Verificar registros sem operador
SELECT COUNT(*) AS vendas_sem_operador 
FROM vendas 
WHERE operador IS NULL OR operador = '';

-- 6.3 Verificar cancelamentos/estornos (se houver campo de status)
SELECT status, COUNT(*) AS quantidade
FROM vendas
GROUP BY status;

-- 6.4 Registros duplicados potenciais
SELECT 
    data_hora, 
    valor_total, 
    operador, 
    COUNT(*) AS ocorrencias
FROM vendas
GROUP BY data_hora, valor_total, operador
HAVING COUNT(*) > 1;

-- #############################################################################
-- NOTAS PARA A REUNIÃO COM DESENVOLVEDOR
-- #############################################################################
-- 
-- IMPORTANTE: Anote os nomes reais das tabelas e colunas encontrados:
-- 
-- Tabela de vendas: ___________________
--   - Coluna de data/hora: ___________________
--   - Coluna de valor: ___________________
--   - Coluna de operador: ___________________
--   - Coluna de status: ___________________
-- 
-- Tabela de itens: ___________________
--   - Coluna de produto: ___________________
--   - Coluna de quantidade: ___________________
--   - Coluna de valor unitário: ___________________
-- 
-- Tabela de produtos: ___________________
--   - Coluna de nome: ___________________
--   - Coluna de categoria: ___________________
-- 
-- =============================================================================

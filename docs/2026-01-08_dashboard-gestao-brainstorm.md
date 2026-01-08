# Dashboard de Gestão - Análise Técnica

> Brainstorm realizado em 08/01/2026 para definição de arquitetura do sistema de dashboard administrativo do Bar Los Hermanos.

---

## Objetivo

Implementar área administrativa (`/admin`) no site com:

- Login exclusivo para gestores
- Dashboard de análise de vendas
- Dashboard de análise de colaboradores
- Preparação para modelos de Machine Learning futuros

---

## Arquitetura do Sistema

```mermaid
flowchart TB
    subgraph BAR["Máquina do Bar (Windows)"]
        CA[ClickAtende]
        DB[(SQLite .db)]
        ETL[Script Python ETL]
        SCHED[Task Scheduler<br/>1x/dia]

        CA --> DB
        DB --> ETL
        SCHED -.-> ETL
    end

    subgraph VPS["VPS Hostinger/Locaweb"]
        MYSQL[(MySQL)]
        API[FastAPI<br/>Backend Python]
        SITE[Site Los Hermanos]

        subgraph DASH["Área Administrativa"]
            LOGIN[🔒 Login]
            DV[Dashboard Vendas]
            DC[Dashboard Colaboradores]
        end

        API <--> MYSQL
        SITE --> DASH
        DASH --> API
    end

    ETL -->|POST dados via API| API
```

---

## Fluxo de Dados

```mermaid
sequenceDiagram
    participant CA as ClickAtende
    participant DB as SQLite
    participant ETL as Script ETL
    participant API as FastAPI
    participant MySQL as MySQL
    participant Dash as Dashboard

    Note over ETL: Executa 1x/dia (fechamento)

    ETL->>DB: Lê novos registros
    DB-->>ETL: Dados de vendas e atendimentos
    ETL->>ETL: Transforma/limpa dados
    ETL->>API: POST /sync (dados JSON)
    API->>MySQL: INSERT/UPDATE
    MySQL-->>API: Confirmação
    API-->>ETL: 200 OK

    Note over Dash: Gestor acessa dashboard

    Dash->>API: GET /vendas/resumo
    API->>MySQL: SELECT
    MySQL-->>API: Dados
    API-->>Dash: JSON
    Dash->>Dash: Renderiza gráficos ECharts
```

---

## Stack Tecnológica

| Camada            | Tecnologia           | Justificativa                                 |
| ----------------- | -------------------- | --------------------------------------------- |
| **Origem**        | SQLite               | Banco nativo do ClickAtende                   |
| **ETL**           | Python + requests    | Leitura SQLite + envio HTTP                   |
| **Agendamento**   | Task Scheduler (Win) | Nativo do Windows                             |
| **Backend**       | FastAPI              | Leve, async, tipado, ideal para ML            |
| **Banco destino** | MySQL                | Incluso no VPS, robusto                       |
| **Frontend**      | HTML + CSS + JS      | Integrado ao site existente                   |
| **Gráficos**      | Apache ECharts       | Performance, temas, suporte a grandes volumes |
| **Autenticação**  | Usuário/senha config | Simples para 1-2 gestores                     |

---

## Estrutura de Páginas

```mermaid
graph LR
    subgraph PUB["Páginas Públicas"]
        HOME["/"]
        CARD["/cardapio"]
        EVT["/eventos"]
        CONT["/contato"]
    end

    subgraph ADM["Área Restrita"]
        LOGIN["/admin<br/>🔒 Login"]
        DASH["/admin/dashboard"]
        VEND["/admin/vendas"]
        COLAB["/admin/colaboradores"]
    end

    HOME --> LOGIN
    LOGIN -->|autenticado| DASH
    DASH --> VEND
    DASH --> COLAB
```

---

## Decisões Técnicas

### Escolhidas

| Decisão        | Opção             | Motivo                                         |
| -------------- | ----------------- | ---------------------------------------------- |
| Arquitetura    | ETL → API → MySQL | Isolamento, escalabilidade, ML-ready           |
| Frequência ETL | 1x/dia            | Dados de fechamento são suficientes            |
| Backend        | Python (FastAPI)  | Unifica linguagem ETL + API + ML               |
| Gráficos       | Apache ECharts    | Performance com grandes volumes, temas prontos |
| Tema visual    | Dark Admin        | Diferenciado do site público                   |
| Hospedagem     | VPS               | Controle total, suporte a Python               |

### Descartadas

| Opção                 | Motivo do descarte                       |
| --------------------- | ---------------------------------------- |
| Leitura direta SQLite | Risco de lock, não escalável             |
| GitHub Pages          | Não suporta backend                      |
| Chart.js              | Menos recursos para analytics pesado     |
| D3.js                 | Complexidade desnecessária para o escopo |
| Multi-tenant auth     | Apenas 1-2 gestores                      |

---

## Métricas do Dashboard

### Vendas

```mermaid
mindmap
  root((Dashboard<br/>Vendas))
    Faturamento
      Diário
      Semanal
      Mensal
      Comparativo
    Produtos
      Mais vendidos
      Por categoria
      Ticket médio
    Temporal
      Por hora do dia
      Por dia da semana
      Tendências
    Pagamentos
      Por forma
      Distribuição %
```

### Colaboradores

```mermaid
mindmap
  root((Dashboard<br/>Colaboradores))
    Atendimentos
      Total por operador
      Ranking
    Faturamento
      Por operador
      Ticket médio
    Temporal
      Por dia da semana
      Horários de pico
```

---

## Próximos Passos

```mermaid
gantt
    title Roadmap de Implementação
    dateFormat  YYYY-MM-DD

    section Preparação
    Reunião com dev ClickAtende    :prep1, 2026-01-10, 3d
    Mapear estrutura SQLite        :prep2, after prep1, 2d

    section Backend
    Configurar VPS                 :back1, after prep2, 3d
    Criar API FastAPI              :back2, after back1, 5d
    Configurar MySQL               :back3, after back1, 2d

    section ETL
    Desenvolver script ETL         :etl1, after prep2, 4d
    Configurar Task Scheduler      :etl2, after etl1, 1d

    section Frontend
    Criar página de login          :front1, after back2, 2d
    Dashboard de vendas            :front2, after front1, 5d
    Dashboard de colaboradores     :front3, after front2, 3d

    section ML (Futuro)
    Modelos de previsão            :ml1, after front3, 14d
```

---

## Checklist para Reunião com ClickAtende

- [ ] Obter caminho do arquivo `.db`
- [ ] Verificar se banco é único ou múltiplos
- [ ] Solicitar acesso de leitura seguro
- [ ] Identificar tabelas de vendas/pedidos
- [ ] Identificar tabela de produtos
- [ ] Verificar campo de operador/colaborador
- [ ] Confirmar campos de data/hora
- [ ] Verificar formas de pagamento
- [ ] Identificar status de cancelamentos
- [ ] Solicitar cópia do banco para testes

---

## Arquivos Relacionados

| Arquivo                                                    | Descrição                                     |
| ---------------------------------------------------------- | --------------------------------------------- |
| [`queries_exploratorias.sql`](./queries_exploratorias.sql) | Queries SQL para explorar o banco ClickAtende |

---

## Pendências

- [ ] Configuração do VPS (aguardando momento certo)
- [ ] Discussão de layout do dashboard (próximo brainstorm)
- [ ] Definição de métricas específicas de ML

# ScrollStory - Visualização Interativa com Scroll

## Estrutura do Repositório

```{}
├─ data/ ← Dados originais do projeto
│  ├─ housing_limpo.csv ← Dataset de habitação processado
│  ├─ housing.csv ← Dataset original
│  └─ arquivos de shapefile (tl_2023_06_place.*)
├─ trees/ ← Árvores de decisão em formato JSON
│  ├─ cortes_2d.json ← Dados dos cortes bidimensionais
│  ├─ cortes_completa.json ← Cortes da árvore completa
│  ├─ cortes_poda.json ← Cortes das árvores podadas
│  ├─ housing_original.json ← Árvore original
│  ├─ housing_profundidade_*.json ← Árvores com diferentes profundidades
│  ├─ housing_custo_complexidade_*.json ← Árvores com diferentes alphas
│  └─ outros arquivos de árvores processadas
├─ src/ ← Código fonte da aplicação SvelteKit
│  ├─ lib/
│  │  ├─ components/ ← Componentes Svelte
│  │  │  ├─ Introduction.svelte ← Bloco de introdução visual
│  │  │  ├─ ScrollStory1.svelte ← Lógica do primeiro storytelling
│  │  │  ├─ ScrollStory2.svelte ← Lógica do segundo storytelling
│  │  │  ├─ Viz1.svelte ← Visualização do primeiro storytelling
│  │  │  ├─ Viz2.svelte ← Visualização do segundo storytelling
│  │  │  ├─ Step1.svelte ← Conteúdo textual do ScrollStory1
│  │  │  └─ Step2.svelte ← Conteúdo textual do ScrollStory2
│  │  ├─ data/ ← Utilitários para manipulação de dados
│  │  └─ utils.js ← Funções utilitárias
│  ├─ locales/ ← Arquivos de tradução
│  │  ├─ pt.json ← Traduções em português
│  │  ├─ en.json ← Traduções em inglês
│  │  └─ es.json ← Traduções em espanhol
│  ├─ routes/
│  │  ├─ +layout.svelte ← Layout principal
│  │  ├─ +page.svelte ← Página principal
│  │  └─ about/ ← Página sobre o projeto
│  ├─ i18n.js ← Configuração de internacionalização
│  └─ app.html ← Template HTML principal
├─ static/ ← Arquivos estáticos
│  ├─ css/ ← Estilos CSS globais
│  ├─ data/ ← Cópia dos dados para servir estaticamente
│  ├─ trees/ ← Cópia das árvores para servir estaticamente
│  ├─ fonts/ ← Fontes customizadas
│  └─ favicons e outros assets
├─ Artigo/ ← Documentação acadêmica
│  ├─ relatorio.pdf ← Relatório final
│  ├─ relatorio.tex ← Código fonte LaTeX
│  └─ logo_fgv.png ← Logo institucional
├─ decisionTree.ipynb ← Notebook Jupyter para análise de dados
├─ analise_podas_housing.csv ← Análise das podas
├─ resumo_podas_housing.json ← Resumo das podas em JSON
└─ arquivos de configuração (package.json, svelte.config.js, etc.)
```



## Como Funciona a Visualização

### ScrollStory1 e ScrollStory2

- São dois componentes independentes que apresentam diferentes partes da explicação de árvores, com texto e visualizações associadas.
- Cada um controla sua própria lógica de scroll usando `IntersectionObserver` para detectar qual passo está ativo.
- Ambos compartilham a mesma ideia de manter a visualização gráfica fixa no centro da tela enquanto o usuário rola o conteúdo textual.


### Lógica e Layout

- O container principal (`ScrollStory1` ou `ScrollStory2`) organiza o layout em duas colunas:
  - Coluna de texto com os passos (Step1 ou Step2)
  - Coluna da visualização (`Viz.svelte`), fixada verticalmente no centro via `position: sticky`
- O passo ativo é atualizado conforme o usuário rola e é usado para atualizar a visualização.

---

## Processo de Desenvolvimento

O desenvolvimento deste projeto seguiu uma metodologia estruturada em cinco etapas principais:

### 1. Conceituação e Planejamento

Inicialmente, foram conduzidas discussões exploratórias sobre as possibilidades de datasets a serem implementados no projeto. Durante esta fase, delimitaram-se os diferentes tipos de gráficos e interações que seriam incorporados, estabelecendo-se as bases conceituais para a visualização interativa de árvores de decisão.

### 2. Processamento e Preparação dos Dados

Paralelamente ao desenvolvimento da disposição geral da página, foram realizadas atividades de processamento de dados, incluindo exploração exploratória, treinamento do modelo de árvore de decisão e obtenção dos cortes necessários em formato apropriado para as visualizações. Esta etapa foi fundamental para garantir a qualidade e adequação dos dados às necessidades do projeto.

### 3. Implementação Isolada das Visualizações

As diferentes visualizações foram implementadas de forma modular e independente, permitindo o desenvolvimento e teste individual de cada componente gráfico antes da integração ao sistema principal.

### 4. Integração Iterativa e Feedback

Durante sucessivas iterações, procedeu-se à integração gradual das diferentes visualizações ao projeto principal. Este processo culminou com a apresentação parcial, durante a qual foram recebidas observações e sugestões relevantes para o aprimoramento do trabalho.

### 5. Refinamento e Melhoria Contínua

Posteriormente à apresentação parcial, foram implementadas as observações recebidas e realizadas melhorias nas visualizações existentes. Esta fase demandou processamento adicional dos dados para atender aos requisitos de aprimoramento identificados, resultando na versão final do projeto.

---

## Como Rodar

Este projeto foi criado usando SvelteKit. Para rodar localmente:

1. Clone o repositório
2. Instale as dependências com `npm install`
3. Rode o servidor de desenvolvimento com `npm run dev`
4. Acesse no navegador `http://localhost:5173` (ou a porta informada no terminal)

---

## Contribuidores

### Paula Eduarda de Lima

- 

### Mariana Fernandes Rocha

- 

### Joel Perca

- Implementação parcial da visualização do storytelling sobre os cortes individuais dos diferentes features.
- Implementação da lógica das traduções.
- Análise e exploração de dados para a geração das árvores com diferentes podas.
- Integração das podas na vista da árvore completa.

---

## Personalização

- Adicione, remova ou altere passos editando os componentes `Step1.svelte` e `Step2.svelte`.
- Modifique a visualização em `Viz1.svelte`  e `Viz1.svelte` para adaptar gráficos e animações.

---


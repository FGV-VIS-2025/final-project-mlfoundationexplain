# ScrollStory - Visualização Interativa com Scroll

## Estrutura do Repositório

src/
├─ lib/
│  └─ components/
│     ├─ Introduction.svelte ← Bloco de introdução visual com título
│     ├─ ScrollStory1.svelte ← lógica de scroll + visualização para o primeiro storytelling
│     ├─ ScrollStory2.svelte ← lógica de scroll + visualização para o segundo storytelling
│     ├─ Viz1.svelte ← Componente de visualização gráfica do primeiro storytelling
│     ├─ Viz2.svelte ← Componente de visualização gráfica do segundo storytelling
│     ├─ Step1.svelte ← Componente para exibir o conteúdo textual do ScrollStory1
│     └─ Step2.svelte ← Componente para exibir o conteúdo textual do ScrollStory2
├─ routes/
│  └─ +page.svelte ← Página principal que importa e usa Introduction, ScrollStory1 e ScrollStory2




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

## Como Rodar

Este projeto foi criado usando SvelteKit. Para rodar localmente:

1. Clone o repositório
2. Instale as dependências com `npm install`
3. Rode o servidor de desenvolvimento com `npm run dev`
4. Acesse no navegador `http://localhost:5173` (ou a porta informada no terminal)

---

## Personalização

- Adicione, remova ou altere passos editando os componentes `Step1.svelte` e `Step2.svelte`.
- Modifique a visualização em `Viz1.svelte`  e `Viz1.svelte` para adaptar gráficos e animações.

---


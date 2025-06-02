<script>
  export let stepIndex;

  const steps = [
    {
      title: "Profundidade 0 – Raiz da Árvore",
      content: `No topo da árvore, temos a primeira decisão baseada na condição 
      <code>feature 1 ≤ 185300</code>. Esta divisão separa os dados em dois grandes grupos...`
    },
    {
      title: "Profundidade 1 – Primeira Divisão dos Ramos",
      content: `A árvore agora se divide em dois caminhos principais. No lado esquerdo...`
    },
    {
      title: "Profundidade 2 – Ramificações Detalhadas",
      content: `Na sequência, surgem novas divisões, como <code>feature 1 ≤ 72600</code>...`
    },
    {
      title: "Profundidade 3 – Condições Muito Específicas",
      content: `Neste nível, temos divisões mais específicas, como <code>feature 0 ≤ 448</code>...`
    },
    {
      title: "Profundidade 4 – Folhas da Árvore",
      content: `As folhas da árvore representam as previsões finais: "Sacramento" ou "San Francisco"...`
    }
  ];
</script>

{#if steps[stepIndex]}
    <h3 class="text-xl font-semibold">{steps[stepIndex].title}</h3>
    <p>{@html steps[stepIndex].content}</p>
{:else}
  <p>Etapa {stepIndex + 1} não disponível.</p>
{/if}

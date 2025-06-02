<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { _ } from "svelte-i18n";

  let el;
  let svg;

  const width = 650;
  const height = 400;

  // Dados simples para a árvore
  const data = {
    name: "Raiz",
    children: [
      {
        name: "Sim",
        children: [
          { name: "Classe A" },
          { name: "Classe B" }
        ]
      },
      { name: "Não" }
    ]
  };

  onMount(() => {
    const root = d3.hierarchy(data);

    const treeLayout = d3.tree().size([width - 40, height - 40]);
    treeLayout(root);

    const svgEl = d3.select(svg);
    svgEl.selectAll("*").remove();

    // Links
    svgEl.selectAll('line.link')
      .data(root.links())
      .enter()
      .append('line')
      .classed('link', true)
      .attr('x1', d => d.source.x + 20)
      .attr('y1', d => d.source.y + 20)
      .attr('x2', d => d.target.x + 20)
      .attr('y2', d => d.target.y + 20)
      .attr('stroke', 'var(--color-secondary2)')
      .attr('stroke-width', 7);

    // Nós
    const nodes = svgEl.selectAll('g.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .classed('node', true)
      .attr('transform', d => `translate(${d.x + 20},${d.y + 20})`);

    nodes.append('circle')
      .attr('r', 25)
      .attr('fill', 'var(--color-primary)');
  });
</script>

<div class="cover-container" bind:this={el}>
  <div class="text">
    <h1>{$_('hero.title')}</h1>
    <p>{$_('hero.subtitle')}</p>
  </div>

  <div class="viz">
    <svg
      bind:this={svg}
      width={width}
      height={height}
      role="img"
      aria-label="Árvore de decisão ilustrativa"
    ></svg>
  </div>
</div>

<style>
  .cover-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    min-height: 100vh;
    padding: 4rem 2rem;
    background-color: var(--color-background-intro);
    gap: 4rem;
  }

  .text {
    width: 50%;
    padding: 2rem;
  }

  .text h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    font-weight: 600;
    color: var(--color-primary2);
  }

  .text p {
    font-size: 1.25rem;
    color: var(--color-text-inverse);
  }

  .viz {
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  svg {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    background-color: var(---color-background-intro);
    overflow: visible;
  }
</style>

<script>
  import { onMount, afterUpdate } from 'svelte';
  import * as d3 from 'd3';

  export let treeData;
  export let step = 0;
  let svg;
  const width = 900;
  const height = 700;

  function renderTree() {
    if (!treeData) return;

    const margin = { top: 40, right: 120, bottom: 40, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const root = d3.hierarchy(treeData);
    // const treeLayout = d3.tree().size([innerWidth, innerHeight]);
    const treeLayout = d3.tree()
  .size([innerWidth, innerHeight])
  .separation((a, b) => (a.parent === b.parent ? 2 : 3));

    treeLayout(root);
    

    const allNodes = root.descendants();
    const allLinks = root.links();

    const visibleNodes = allNodes.slice(0, step + 1); // Exibe até `step` nós
    const visibleLinks = allLinks.slice(0, step);     // Exibe `step` conexões

    d3.select(svg).selectAll("*").remove();

    const svgEl = d3.select(svg)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("background-color", "var(--color-background)") // Background geral da árvore
      .style("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const defs = svgEl.append("defs");

    // Filtro de sombra para as linhas (links) usando variável específica
    const filter = defs.append("filter")
      .attr("id", "dropShadow")
      .attr("height", "130%");
    filter.append("feDropShadow")
      .attr("dx", 2)
      .attr("dy", 2)
      .attr("stdDeviation", 2)
      .attr("flood-color", "var(--color-shadow-link)")  // sombra dos links
      .attr("flood-opacity", 0.4);

    // Gradiente para o preenchimento dos nós
    const gradientId = "nodeGradient";
    const grad = defs.append("radialGradient")
      .attr("id", gradientId)
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");

    grad.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "var(--color-node-fill)"); // cor inicial do nó

    grad.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "var(--color-node-stroke)"); // cor final do nó

    // Linhas entre nós (links)
    svgEl.selectAll(".link")
      .data(visibleLinks)
      .join("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "var(--color-link-stroke)") // cor das linhas
      .attr("stroke-width", 2.5)
      .attr("filter", "url(#dropShadow)")
      .attr("d", d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y)
      );

    // Nós (grupos)
    const node = svgEl.selectAll(".node")
      .data(visibleNodes)
      .join("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .style("cursor", "pointer");

    // Círculos dos nós com gradiente e borda personalizada
    node.append("circle")
      .attr("r", 12)
      .attr("fill", `url(#${gradientId})`)               // preenchimento do nó com gradiente
      .attr("stroke", "var(--color-node-stroke)")       // borda do nó
      .attr("stroke-width", 2)
      .on("mouseover", function () {
        d3.select(this)
          .attr("fill", "var(--color-node-hover-fill)")  // cor do nó no hover
          .attr("r", 16);
      })
      .on("mouseout", function () {
        d3.select(this)
          .attr("fill", `url(#${gradientId})`)           // volta ao gradiente padrão
          .attr("r", 12);
      });

    // Texto dentro dos nós
    node.append("text")
//   .attr("dy", "0.35em")
  .attr("y", d => {
    return d.children ? -16 : 16;
    })
  .attr("x", d => d.children ? 20 : -20)  // maior distância do círculo
  .attr("text-anchor", d => d.children ? "start" : "end")
  .style("font-size", "14px")
  .style("fill", "var(--color-text-node)")
  .style("text-shadow", "0 0 2px var(--color-text-shadow)")
  .text(d => d.data.name);

  }

  onMount(renderTree);
  afterUpdate(renderTree);
</script>

<style>
  circle {
    transition: r 0.2s ease, fill 0.2s ease;
  }
</style>

<svg bind:this={svg}></svg>

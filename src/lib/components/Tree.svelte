
<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  export let treeData;
  let svg;
  const width = 900;
  const height = 700;

  export let step = 0;


  onMount(() => {
    if (!treeData) return;

    const margin = { top: 40, right: 120, bottom: 40, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const root = d3.hierarchy(treeData);

    const treeLayout = d3.tree().size([innerWidth, innerHeight]);
    treeLayout(root);

    // Limpa conteúdo anterior (se houver re-render)
    d3.select(svg).selectAll("*").remove();

    const svgEl = d3.select(svg)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("background-color", "var(--color-background)")  // fundo do svg
      .style("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Definição para sombra com cor de destaque
    const defs = svgEl.append("defs");

    const filter = defs.append("filter")
      .attr("id", "dropShadow")
      .attr("height", "130%");
    filter.append("feDropShadow")
      .attr("dx", 2)
      .attr("dy", 2)
      .attr("stdDeviation", 2)
      .attr("flood-color", "var(--color-accent)")
      .attr("flood-opacity", 0.4);

    // Gradiente para os círculos usando primary colors
    const gradientId = "nodeGradient";

    const grad = defs.append("radialGradient")
      .attr("id", gradientId)
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");

    grad.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "var(--color-primary)");

    grad.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "var(--color-primary2)");

    // Links (linhas)
    svgEl.selectAll(".link")
      .data(root.links())
      .join("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "var(--color-secondary2)")
      .attr("stroke-width", 2.5)
      .attr("filter", "url(#dropShadow)")
      .attr("d", d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y)
      );

    // Nós
    const node = svgEl.selectAll(".node")
      .data(root.descendants())
      .join("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .style("cursor", "pointer");

    // Círculo com gradiente e hover que usa cor de destaque
    node.append("circle")
      .attr("r", 12)
      .attr("fill", `url(#${gradientId})`)
      .attr("stroke", "var(--color-primary2)")
      .attr("stroke-width", 2)
      .on("mouseover", function() {
        d3.select(this)
          .attr("fill", "var(--color-text-auxiliary)")
          .attr("r", 16);
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("fill", `url(#${gradientId})`)
          .attr("r", 12);
      });

    // Texto
    node.append("text")
      .attr("dy", "0.35em")
      .attr("x", d => d.children ? 18 : -18)
      .attr("text-anchor", d => d.children ? "start" : "end")
      .style("font-size", "14px")
      .style("fill", "var(--color-text)")
      .style("text-shadow", "0 0 2px var(--color-background-intro)")
      .text(d => d.data.name);
  });
</script>

<style>
  /* Opcional: animação suave na transição do círculo */
  circle {
    transition: r 0.2s ease, fill 0.2s ease;
  }
</style>

<svg bind:this={svg}></svg>

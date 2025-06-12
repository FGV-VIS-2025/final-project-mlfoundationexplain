<script>
  import { onMount, afterUpdate } from 'svelte';
  import * as d3 from 'd3';

  export let treeData;
  export let step = 0;
  let svg;
  let width = 0;
  const height = 700;

  function renderTree() {
    if (!treeData || !svg) return;

    // Calcula a largura com base no elemento SVG ou na janela
    width = svg.clientWidth || window.innerWidth;

    const margin = { top: 48, right: 120, bottom: 40, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const root = d3.hierarchy(treeData);
    const treeLayout = d3.tree()
      .size([innerWidth, innerHeight])
      .separation((a, b) => (a.parent === b.parent ? 1: 1));

    treeLayout(root);

    const allNodes = root.descendants();
    const allLinks = root.links();

    const visibleNodes = allNodes.slice(0, step + 1);
    const visibleLinks = allLinks.slice(0, step);

    d3.select(svg).selectAll("*").remove();

    const svgEl = d3.select(svg)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("background-color", "var(--color-background)")
      .style("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const defs = svgEl.append("defs");

    const filter = defs.append("filter")
      .attr("id", "dropShadow")
      .attr("height", "130%");
    filter.append("feDropShadow")
      .attr("dx", 2)
      .attr("dy", 2)
      .attr("stdDeviation", 2)
      .attr("flood-color", "var(--color-shadow-link)")
      .attr("flood-opacity", 0.4);

    const gradientId = "nodeGradient";
    const grad = defs.append("radialGradient")
      .attr("id", gradientId)
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");
    grad.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "var(--color-node-fill)");
    grad.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "var(--color-node-stroke)");

    svgEl.selectAll(".link")
      .data(visibleLinks)
      .join("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "var(--color-link-stroke)")
      .attr("stroke-width", 3)
      .attr("filter", "url(#dropShadow)")
      .attr("d", d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y)
      );

    const node = svgEl.selectAll(".node")
      .data(visibleNodes)
      .join("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .style("cursor", "pointer");

    node.append("circle")
      .attr("r", 12)
      .attr("fill", `url(#${gradientId})`)
      .attr("stroke", "var(--color-node-stroke)")
      .attr("stroke-width", 2)
      .on("mouseover", function () {
        d3.select(this)
          .attr("fill", "var(--color-node-hover-fill)")
          .attr("r", 16);
      })
      .on("mouseout", function () {
        d3.select(this)
          .attr("fill", `url(#${gradientId})`)
          .attr("r", 12);
      });

    const text = node.append("text")
      .attr("dy", "0.35em")
      // .attr("y", d => d.children ? -20 : 28)
      // .attr("x", d => d.children ? 10 : -10)

      .attr("y", (d, i) => {
        if (d.children) return -35;
        return i % 2 === 0 ? 26 : 38;
      })

      // .attr("y", d => d.children ? -30 : 28)
      .attr("text-anchor", "middle")
      // .attr("x", 0)
      .style("font-size", "14px")
      .style("fill", "var(--color-text-node)")
      .style("text-shadow", "0 0 2px var(--color-text-shadow)");

    text.selectAll("tspan")
      .data(d => d.data.name.split("\n"))
      .join("tspan")
      .attr("x", 0)
      .attr("dy", (d, i) => i === 0 ? "0" : "1.5em")
      .text(d => d);
  }

  onMount(() => {
    renderTree();
    window.addEventListener('resize', renderTree);
    return () => window.removeEventListener('resize', renderTree);
  });

  afterUpdate(renderTree);
</script>

<style>
  circle {
    transition: r 0.2s ease, fill 0.2s ease;
  }
</style>

<svg bind:this={svg} style="width: 100%; height: auto;"></svg>

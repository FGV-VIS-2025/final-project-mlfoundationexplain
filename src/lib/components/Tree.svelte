<script>
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';

  export let treeData;
  let svg;
  const height = 700;

  const leafColorScale = d3.scaleOrdinal()
    .domain(["San Francisco", "Sacramento"]) // Ajuste para suas classes
    .range(["var(--color-classe0-node)", "var(--color-classe1-node)"]);

  function drawTree() {
    if (!treeData || !svg) return;

    const margin = { top: 45, right: 40, bottom: 55, left: 40 };
    const containerWidth = svg.parentElement.clientWidth || 800;
    const width = Math.max(containerWidth, 300);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const root = d3.hierarchy(treeData);
    const treeLayout = d3.tree()
      .size([innerWidth, innerHeight])
      .separation((a, b) => (a.parent === b.parent ? 2 : 3));

    treeLayout(root);

    const allNodes = root.descendants();
    const allLinks = root.links();

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

    // Sombra
    const filter = defs.append("filter")
      .attr("id", "dropShadow")
      .attr("height", "130%");
    filter.append("feDropShadow")
      .attr("dx", 2)
      .attr("dy", 2)
      .attr("stdDeviation", 2)
      .attr("flood-color", "var(--color-shadow-link)")
      .attr("flood-opacity", 0.4);

    // Gradiente padrão
    const gradientId = "nodeGradient";
    const grad = defs.append("radialGradient")
      .attr("id", gradientId)
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");
    grad.append("stop").attr("offset", "0%").attr("stop-color", "var(--color-node-fill)");
    grad.append("stop").attr("offset", "100%").attr("stop-color", "var(--color-node-stroke)");

    // Gradientes personalizados para folhas
    leafColorScale.domain().forEach((label, i) => {
      const fillColor = leafColorScale(label);
      const strokeColor = `var(--color-classe${i}-stroke)`;
      const gradLeaf = defs.append("radialGradient")
        .attr("id", `leafGradient-${label.replace(/\s+/g, '')}`)
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%");
      gradLeaf.append("stop").attr("offset", "0%").attr("stop-color", fillColor);
      gradLeaf.append("stop").attr("offset", "100%").attr("stop-color", strokeColor);
    });

    // Links
    svgEl.selectAll(".link")
      .data(allLinks)
      .join("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "var(--color-link-stroke)")
      .attr("stroke-width", 3)
      .attr("filter", "url(#dropShadow)")
      .attr("d", d3.linkVertical().x(d => d.x).y(d => d.y));

    // Nós
    const node = svgEl.selectAll(".node")
      .data(allNodes)
      .join("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .style("cursor", "default");

    node.append("circle")
      .attr("r", 10)
      .attr("fill", d => {
        if (!d.children) {
          const label = d.data.name.split(":").pop().trim();
          return `url(#leafGradient-${label.replace(/\s+/g, '')})`;
        }
        return `url(#${gradientId})`;
      })
      .attr("stroke", d => {
        if (!d.children) {
          const label = d.data.name.split(":").pop().trim();
          const index = leafColorScale.domain().indexOf(label);
          return `var(--color-classe${index}-stroke)`;
        }
        return "var(--color-node-stroke)";
      })
      .attr("stroke-width", 2);

    // Texto ////////////////////////////////////////////////////
    const text = node.append("text")
      .attr("dy", "0.35em")
      .attr("y", (d, i) => d.children ? -33 : (i % 2 === 0 ? 40 : 20))
      .attr("x", (d, i) => d.children ? -25 : (i % 2 === 0 ? -10 : -55))
      .style("font-size", "14px")
      .style("fill", d => {
        if (!d.children) {
          const label = d.data.name.split(":").pop().trim();
          const index = leafColorScale.domain().indexOf(label);
          return `var(--color-classe${index}-stroke)`;
        }
        return "var(--color-text-node)";
      })
      .style("text-shadow", "0 0 2px var(--color-prediction-glow)");

    text.selectAll("tspan")
      .data(d => d.data.name.split("\n"))
      .join("tspan")
      .attr("x", function(_, i, nodes) {
        return d3.select(nodes[i].parentNode).attr("x");
      })
      .attr("dy", (d, i) => i === 0 ? "0" : "1em")
      .text(d => d);
  }

  onMount(() => {
    drawTree();
    window.addEventListener('resize', drawTree);
  });

  onDestroy(() => {
    window.removeEventListener('resize', drawTree);
  });
</script>


<style>
  svg {
    width: 100%;
    height: 700px;
    display: block;
  }

  circle {
    transition: r 0.2s ease, fill 0.2s ease;
  }
</style>

<svg bind:this={svg}></svg>

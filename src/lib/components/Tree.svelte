<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  export let treeData;
  let svg;
  const height = 700;
  const nodeSpacingX = 40;
  const nodeSpacingY = 100;

  onMount(() => {
    if (!treeData) return;

    const margin = { top: 40, right: 120, bottom: 40, left: 120 };
    const root = d3.hierarchy(treeData);
    const leaves = root.leaves();
    const width = leaves.length * nodeSpacingX + margin.left + margin.right;

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

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

    // Links
    svgEl.selectAll(".link")
      .data(allLinks)
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

    // Nós
    const node = svgEl.selectAll(".node")
      .data(allNodes)
      .join("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .style("cursor", "pointer");

    node.append("circle")
      .attr("r", 10)
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

    // Texto estilizado com múltiplas linhas
    const text = node.append("text")
      .attr("dy", "0.35em")
      .attr("y", d => d.children ? -20 : 28)
      .attr("x", d => d.children ? 10 : 40)
      .style("font-size", "14px")
      .style("fill", "var(--color-text-node)")
      .style("text-shadow", "0 0 2px var(--color-text-shadow)");

    text.selectAll("tspan")
      .data(d => d.data.name.split("\n"))
      .join("tspan")
      .attr("x", 0)
      .attr("dy", (d, i) => i === 0 ? "0" : "1.5em")
      .text(d => d);
  });
</script>

<style>
  circle {
    transition: r 0.2s ease, fill 0.2s ease;
  }
</style>

<svg bind:this={svg}></svg>

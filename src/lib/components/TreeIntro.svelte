<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  let svg;
  const height = 400;
  const nodeSpacingX = 200;
  const nodeSpacingY = 100;

  const treeData = {
    name: "Chuva?",
    children: [
      {
        name: "Frio?",
        children: [
          { name: "Jogar" },
          { name: "Não jogar" }
        ]
      },
      { name: "Não jogar" }
    ]
  };

  onMount(() => {
    const margin = { top: 40, right: 80, bottom: 40, left: 80 };
    const root = d3.hierarchy(treeData);
    const leaves = root.leaves();
    const width = leaves.length * nodeSpacingX + margin.left + margin.right;

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const treeLayout = d3.tree()
      .size([innerWidth, innerHeight])
      .separation((a, b) => (a.parent === b.parent ? 1.5 : 2.5));

    treeLayout(root);

    const allNodes = root.descendants();
    const allLinks = root.links();

    const svgEl = d3.select(svg);
    svgEl.selectAll('*').remove();

    const base = svgEl
      .attr('width', width)
      .attr('height', height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("background-color", "var(--color-background-intro)")
      .style("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif");

    const g = base.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const defs = g.append("defs");

    const filter = defs.append("filter")
      .attr("id", "dropShadow")
      .attr("height", "130%");

    filter.append("feDropShadow")
      .attr("dx", 2)
      .attr("dy", 2)
      .attr("stdDeviation", 2)
      .attr("flood-color", "var(--viz-shadow)")
      .attr("flood-opacity", 0.4);

    const gradientId = "nodeGradient";
    const grad = defs.append("radialGradient")
      .attr("id", gradientId)
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");

    grad.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "var(--viz-node-fill)");

    grad.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "var(--viz-node-stroke)");

    const linkPath = d3.linkVertical()
      .x(d => d.x)
      .y(d => d.y);

    g.selectAll('.link')
      .data(allLinks)
      .join('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', 'var(--viz-link)')
      .attr('stroke-width', 5)
      .attr('filter', 'url(#dropShadow)')
      .attr('d', d => {
        const o = { x: d.source.x, y: d.source.y };
        return linkPath({ source: o, target: o });
      })
      .transition()
      .duration(800)
      .delay(d => d.target.depth * 300)
      .ease(d3.easeCubicOut)
      .attr('d', d => linkPath(d));

    const node = g.selectAll('.node')
      .data(allNodes)
      .join('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y}) scale(0.5)`)
      .style('opacity', 0);

    node.transition()
      .duration(600)
      .delay(d => d.depth * 300)
      .ease(d3.easeCubicOut)
      .style('opacity', 1)
      .attr('transform', d => `translate(${d.x},${d.y}) scale(1)`);

    node.append('circle')
      .attr('r', 25)
      .attr('fill', `url(#${gradientId})`)
      .attr('stroke', 'var(--viz-node-stroke)')
      .attr('stroke-width', 2)
      .on("mouseover", function () {
        d3.select(this)
          .attr("fill", "var(--viz-node-hover)")
          .attr("r", 27);
      })
      .on("mouseout", function () {
        d3.select(this)
          .attr("fill", `url(#${gradientId})`)
          .attr("r", 25);
      });

    const text = node.append("text")
      .attr("dy", "0.35em")
      .attr("y", d => d.children ? -30: 39)
    //   .attr("x", d => d.children ? -10 : 80).attr("x", 0)
  .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("fill", "var(--viz-text)")
      .style("text-shadow", "0 0 2px var(--viz-text-shadow)");

//     const text = node.append("text")
//   .attr("dy", "0.35em")
//   .attr("y", 39) // ou ajuste como preferir
//   .attr("x", 0)
//   .attr("text-anchor", "middle")
//   .style("font-size", "16px")
//   .style("fill", "var(--viz-text)")
//   .style("text-shadow", "0 0 2px var(--viz-text-shadow)");


    text.selectAll("tspan")
      .data(d => d.data.name.split("\n"))
      .join("tspan")
      .attr("x", 0)
      .attr("dy", (d, i) => i === 0 ? "0" : "1.5em")
      .text(d => d);
  });
</script>

<div class="intro-tree-wrapper">
  <svg bind:this={svg} role="img" aria-label="Árvore de decisão estilizada"></svg>
</div>

<style>
  .intro-tree-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--color-background-intro);
    padding: 2rem;
    border-radius: 12px;
  }

  svg {
    border-radius: 8px;
  }

  circle {
    transition: r 0.2s ease, fill 0.2s ease;
  }
</style>

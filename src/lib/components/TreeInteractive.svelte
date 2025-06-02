<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  export let treeData;

  let svg;
  const height = 650;
  const nodeSpacingX = 70;
  const nodeSpacingY = 100;

  let currentPath = [];
  let feature0 = 0;
  let feature1 = 0;

  // Função que extrai feature e threshold do nome do nó
  function preprocessTree(root) {
    root.each(d => {
      const match = d.data.name.match(/feature (\d+) ≤ ([\d\.]+)/);
      if (match) {
        d.data.feature = `feature ${match[1]}`;
        d.data.threshold = Number(match[2]);
        d.data.isLeaf = false;
      } else {
        d.data.isLeaf = true;
      }
    });
  }

  function traverseTree(node, input) {
    if (node.data.isLeaf || !node.children) {
      currentPath.push(node);
      return;
    }

    currentPath.push(node);

    const featureIndex = Number(node.data.feature.split(" ")[1]);
    const featureKey = featureIndex === 0 ? "feature0" : "feature1";
    const featureValue = input[featureKey];

    const [left, right] = node.children;
    if (featureValue <= node.data.threshold) {
      traverseTree(left, input);
    } else {
      traverseTree(right, input);
    }
  }

  function highlightPath(nodes) {
    const delay = 800;

    d3.select(svg).selectAll("circle")
      .transition()
      .duration(300)
      .attr("fill", `url(#nodeGradient)`)
      .attr("r", 12);

    nodes.forEach((node, i) => {
      setTimeout(() => {
        d3.select(`#node-${node.id} circle`)
          .transition()
          .duration(300)
          .attr("fill", "orange")
          .attr("r", 20);
      }, i * delay);
    });
  }

  function simulatePrediction() {
    if (!treeData) return;

    currentPath = [];
    const input = {
      feature0: Number(feature0),
      feature1: Number(feature1)
    };
    const root = d3.hierarchy(treeData);
    root.each((d, i) => d.id = i);

    preprocessTree(root);
    traverseTree(root, input);
    highlightPath(currentPath);
  }

  onMount(() => {
    if (!treeData) return;

    const margin = { top: 40, right: 120, bottom: 40, left: 120 };
    const root = d3.hierarchy(treeData);
    root.each((d, i) => d.id = i);

    preprocessTree(root);

    const leaves = root.leaves();
    const width = Math.max(leaves.length * nodeSpacingX + margin.left + margin.right, 500);
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

    defs.append("filter")
      .attr("id", "dropShadow")
      .attr("height", "130%")
      .append("feDropShadow")
      .attr("dx", 2)
      .attr("dy", 2)
      .attr("stdDeviation", 2)
      .attr("flood-color", "var(--color-shadow-link)")
      .attr("flood-opacity", 0.4);

    const grad = defs.append("radialGradient")
      .attr("id", "nodeGradient")
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
      .data(allLinks)
      .join("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "var(--color-link-stroke)")
      .attr("stroke-width", 3)
      .attr("filter", "url(#dropShadow)")
      .attr("d", d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y));

    const node = svgEl.selectAll(".node")
      .data(allNodes)
      .join("g")
      .attr("class", "node")
      .attr("id", d => `node-${d.id}`)
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .style("cursor", "pointer");

    node.append("circle")
      .attr("r", 12)
      .attr("fill", `url(#nodeGradient)`)
      .attr("stroke", "var(--color-node-stroke)")
      .attr("stroke-width", 2)
      .on("mouseover", function () {
        d3.select(this)
          .attr("fill", "var(--color-node-hover-fill)")
          .attr("r", 16);
      })
      .on("mouseout", function () {
        d3.select(this)
          .attr("fill", `url(#nodeGradient)`)
          .attr("r", 12);
      });

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
  .control-panel {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    color: #333;
  }

  .input-group {
    display: flex;
    flex-direction: column;
  }

  .input-group label {
    font-size: 0.9rem;
    margin-bottom: 0.2rem;
    color: var(--color-label, #333);
  }

  .input-group input {
    padding: 0.4rem 0.6rem;
    border: 1px solid #ccc;
    border-radius: 0.4rem;
    width: 140px;
    font-size: 1.1rem;
  }

  button.predict-button {
    background: linear-gradient(to right, #4f46e5, #3b82f6);
    color: white;
    padding: 0.5rem 1.2rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  button.predict-button:hover {
    background: linear-gradient(to right, #4338ca, #2563eb);
  }
</style>

<div class="control-panel">
  <div class="input-group">
    <label for="feature0">feature 0:</label>
    <input id="feature0" type="number" bind:value={feature0} />
  </div>
  <div class="input-group">
    <label for="feature1">feature 1:</label>
    <input id="feature1" type="number" bind:value={feature1} />
  </div>
  <button class="predict-button" on:click={simulatePrediction}>
    Prever ponto
  </button>
</div>

<svg bind:this={svg}></svg>

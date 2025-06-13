<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  export let treeData;

  let svg;
  const height = 650;
  const nodeSpacingX = 90;
  const nodeSpacingY = 100;

  

  let currentPath = [];
  let feature0 = 0;
  let feature1 = 0;
  let finalPrediction = null;

  // function preprocessTree(root) {
  //   root.each(d => {
  //     const match = d.data.name.match(/feature (\d+) ≤ ([\d\.]+)/);
  //     if (match) {
  //       d.data.feature = `feature ${match[1]}`;
  //       d.data.threshold = Number(match[2]);
  //       d.data.isLeaf = false;
  //     } else {
  //       d.data.isLeaf = true;
  //     }
  //   });
  // }

  function preprocessTree(root) {
  root.each(d => {
    const match = d.data.name.match(/^([^\n]+)\s+≤\s+([\d.]+)/);
    if (match) {
      d.data.feature = match[1].trim();     // "median_house_value" ou "total_bedrooms"
      d.data.threshold = Number(match[2]);
      d.data.isLeaf = false;
    } else {
      d.data.isLeaf = true;
    }
  });
}


  // function traverseTree(node, input) {
  //   if (node.data.isLeaf || !node.children) {
  //     currentPath.push(node);
  //     return node;
  //   }

  //   currentPath.push(node);

  //   const featureIndex = Number(node.data.feature.split(" ")[1]);
  //   const featureKey = featureIndex === 0 ? "feature0" : "feature1";
  //   const featureValue = input[featureKey];

  //   const [left, right] = node.children;
  //   if (featureValue <= node.data.threshold) {
  //     return traverseTree(left, input);
  //   } else {
  //     return traverseTree(right, input);
  //   }
  // }
  function traverseTree(node, input) {
  if (node.data.isLeaf || !node.children) {
    currentPath.push(node);
    return node;
  }

  currentPath.push(node);

  const featureKey = node.data.feature;
  const featureValue = input[featureKey];

  const [left, right] = node.children;
  if (featureValue <= node.data.threshold) {
    return traverseTree(left, input);
  } else {
    return traverseTree(right, input);
  }
}


  // function highlightPath(nodes) {
  //   const delay = 800;

  //   d3.select(svg).selectAll("circle")
  //     .transition()
  //     .duration(300)
  //     .attr("fill", `url(#nodeGradient)`)
  //     .attr("r", 12);

  //   nodes.forEach((node, i) => {
  //     setTimeout(() => {
  //       d3.select(`#node-${node.id} circle`)
  //         .transition()
  //         .duration(300)
  //         // .attr("fill", "orange")
  //         // .attr("fill", "#f5a65b")
  //         // .attr("fill", "#1a936f")
  //         .attr("fill", "var(--color-node-active)")
  //         .attr("r", 20);
  //     }, i * delay);
  //   });
  // }
  function highlightPath(nodes) {
  const delay = 800;

  // Resetar círculos e links
  d3.select(svg).selectAll("circle")
    .transition()
    .duration(300)
    .attr("fill", `url(#nodeGradient)`)
    .attr("r", 12);

  d3.select(svg).selectAll(".link")
    .transition()
    .duration(300)
    .attr("stroke", "var(--color-link-stroke)") // cor padrão
    .attr("stroke-width", 3);

  nodes.forEach((node, i) => {
    setTimeout(() => {
      // Destacar o nó
      d3.select(`#node-${node.id} circle`)
        .transition()
        .duration(300)
        .attr("fill", "var(--color-node-active)")
        .attr("r", 20);

      // Destacar o link para o próximo nó do caminho (se houver)
      if (i < nodes.length - 1) {
        const current = nodes[i];
        const next = nodes[i + 1];

        // Os links são paths com a classe .link, e conectam current -> next
        d3.select(svg).selectAll(".link")
          .filter(d => d.source.id === current.id && d.target.id === next.id)
          .transition()
          .duration(300)
          .attr("stroke", "var(--color-link-active)")  // cor customizada para link ativo
          .attr("stroke-width", 5);
      }

    }, i * delay);
  });
}


  // function simulatePrediction() {
  //   if (!treeData) return;

  //   finalPrediction = null;
  //   currentPath = [];
  //   const input = {
  //     feature0: Number(feature0),
  //     feature1: Number(feature1)
  //   };
  //   const root = d3.hierarchy(treeData);
  //   root.each((d, i) => d.id = i);

  //   preprocessTree(root);
  //   const finalNode = traverseTree(root, input);
  //   highlightPath(currentPath);

  //   if (finalNode?.data?.name) {
  //     finalPrediction = finalNode.data.name;
  //   }
  // }
  function simulatePrediction() {
  if (!treeData) return;

  finalPrediction = null;
  currentPath = [];
  const input = {
    total_bedrooms: Number(feature0),
    median_house_value: Number(feature1)
  };
  const root = d3.hierarchy(treeData);
  root.each((d, i) => d.id = i);

  preprocessTree(root);
  const finalNode = traverseTree(root, input);
  highlightPath(currentPath);

  if (finalNode?.data?.name) {
    finalPrediction = finalNode.data.name;
  }
}


  onMount(() => {
    if (!treeData) return;

    const margin = { top: 50, right: 120, bottom: 40, left: 0 };
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
      .style("background-color", "var(--color-background-section)")
      .style("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif")
      .append("g")
      .attr("transform", `translate(${margin.left -30},${margin.top})`);

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
      .style("cursor", "default");

    node.append("circle")
      .attr("r", 12)
      .attr("fill", `url(#nodeGradient)`)
      .attr("stroke", "var(--color-node-stroke)")
      .attr("stroke-width", 2);
      // .on("mouseover", function () {
      //   d3.select(this)
      //     // .attr("fill", "var(--color-node-hover-fill)")
      //     .attr("r", 16);
      // })
      // .on("mouseout", function () {
      //   d3.select(this)
      //     // .attr("fill", `url(#nodeGradient)`)
      //     .attr("r", 12);
      // });

    const text = node.append("text")
      .attr("dy", "0.35em")
      .attr("y", d => d.children ? -35 : 28)
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

  /* .tree-layout-container {
    display: flex;
    gap: 2rem;
    align-items: flex-start;
    justify-content: center;
    padding: 1rem;
    flex-wrap: wrap;
  }

  .tree-container {
    flex: 1 1 auto;
    min-width: 500px;
    max-width: 1000px;
  }

  .side-panel {
    flex: 0 0 280px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  } */

  .tree-layout-container {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  justify-content: center;
  padding: 1rem;
  flex-wrap: nowrap; /* IMPERATIVO para evitar quebra para baixo */
  overflow-x: auto;  /* permite scroll horizontal se necessário */
  width: 100%;
  box-sizing: border-box;
}

@media (max-width: 700px) {
  .tree-layout-container {
    flex-wrap: wrap;
    justify-content: center;
  }

  .side-panel {
    flex: 1 1 100%;
    max-width: 500px;
    margin-top: 1rem;
  }
}

.tree-container {
  flex: 1 1 auto;
  min-width: 500px;
  max-width: 1000px;
}

.side-panel {
  flex: 0 0 280px;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;

  justify-content: flex-start; /* já deve estar */
  align-items: stretch;        /* novo */
}


  .control-panel {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 1.5rem;
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
    color: var(--color-text);
  }

 .input-group input {
  padding: 0.6rem 0.8rem;
  border: 1px solid #ccc;
  border-radius: 0.4rem;
  width: 100%;               /* ocupar toda a largura disponível */
  font-size: 1.1rem;
  box-sizing: border-box;
}

  button.predict-button {

    
    transition: background-color 0.3s;
    /* background: linear-gradient(to right, var(--color-primary), #166842); */
    background: var(--color-button-previsão);
    color: white;
    padding: 0.5rem 1.2rem;
    margin-top: 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;
    align-self: stretch;
  }

  button.predict-button:hover {
    background: linear-gradient(to right, #4338ca, #2563eb);
    
  }

  .prediction-result {
    margin-top: 1rem;
    /* background: #fef3c7; */
    background: var(--color-background-previsão);
    /* color: #92400e; */
    color:  var(--color-text-previsão);
    padding: 0.8rem 1rem;
    border-left: 5px solid var(--color-node-active);
    border-radius: 0.4rem;
    font-size: 1.1rem;
    max-width: 100%;
  }
</style>

<div class="tree-layout-container">
  <div class="tree-container">
    <svg bind:this={svg}></svg>
  </div>

  <div class="side-panel">
    <div class="control-panel">
  <!-- <div class="input-group">
    <label for="feature0">feature 0:</label>
    <input id="feature0" type="number" bind:value={feature0} />
  </div>
  <div class="input-group">
    <label for="feature1">feature 1:</label>
    <input id="feature1" type="number" bind:value={feature1} />
  </div> -->

  <div class="input-group">
  <label for="feature0">total_bedrooms:</label>
  <input id="feature0" type="number" bind:value={feature0} />
</div>
<div class="input-group">
  <label for="feature1">median_house_value:</label>
  <input id="feature1" type="number" bind:value={feature1} />
</div>


  <div class="button-group">
    <button class="predict-button" on:click={simulatePrediction}>
      Prever ponto
    </button>
  </div>
</div>


    {#if finalPrediction}
      <div class="prediction-result">
        A previsão final foi: <strong>{finalPrediction}</strong>
      </div>
    {/if}
  </div>
</div>


<!-- <svg bind:this={svg}></svg> -->

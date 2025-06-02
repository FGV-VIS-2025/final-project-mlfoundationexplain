<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";

  // Propriedades do componente
  export let data = null;
  export let width = 1000;
  export let height = 700;
  export let nodeRadius = 15;
  export let levelHeight = 120;
  export let animationDuration = 750;
  export let decisionColor = "#4CAF50";
  export let outcomeColor = "#FF9800";
  export let linkColor = "#555";
  export let onNodeClick = null;
  export let showTooltips = true;

  // Referências do DOM
  let svgElement;
  let tooltip;

  // Variáveis internas
  let root;
  let tree;
  let g;
  let svg;

  // Configuração
  const margin = { top: 40, right: 40, bottom: 40, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  onMount(() => {
    if (!data) return;

    initializeTree();
    render();
    // Componente inicializa já expandido
    expandAll();
  });

  // Watchers para propriedades
  $: if (data && svgElement) {
    initializeTree();
    render();
    expandAll(); // Mantém expandido ao atualizar dados
  }

  function initializeTree() {
    // Limpar SVG anterior
    d3.select(svgElement).selectAll("*").remove();

    // Configurar SVG
    svg = d3.select(svgElement).attr("width", width).attr("height", height);

    g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Configurar layout da árvore
    tree = d3.tree().size([innerWidth, innerHeight]);

    // Criar hierarquia
    root = d3.hierarchy(data);
    root.x0 = innerWidth / 2;
    root.y0 = 0;

    // Inicializar com todos os nós expandidos
    expandAll();
  }

  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }

  function render() {
    if (!root) return;
    update(root);
  }

  function update(source) {
    const treeData = tree(root);
    const nodes = treeData.descendants();
    const links = treeData.descendants().slice(1);

    // Normalizar profundidade
    nodes.forEach((d) => {
      d.y = d.depth * levelHeight;
    });

    // Atualizar nós
    const node = g
      .selectAll("g.node")
      .data(nodes, (d) => d.id || (d.id = Math.random()));

    const nodeEnter = node
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${source.x0},${source.y0})`)
      .style("cursor", "default"); // Remover cursor de clique

    if (showTooltips) {
      nodeEnter.on("mouseover", handleMouseOver).on("mouseout", handleMouseOut);
    }

    // Círculos
    nodeEnter
      .append("circle")
      .attr("r", 1e-6)
      .style("fill", (d) =>
        d.data.type === "decision" ? decisionColor : outcomeColor
      )
      .style("stroke", "#333")
      .style("stroke-width", "2px");

    // Texto
    nodeEnter
      .append("text")
      .attr("dy", "1.5em")
      .attr("x", 0)
      .attr("text-anchor", "middle")
      .style("fill", "black") // Texto em preto
      .style("font-weight", "medium")
      .style("font-size", "11px")
      .style("fill-opacity", 1e-6)
      .text((d) => d.data.name);

    // Transição dos nós
    const nodeUpdate = nodeEnter.merge(node);

    nodeUpdate
      .transition()
      .duration(animationDuration)
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    nodeUpdate
      .select("circle")
      .transition()
      .duration(animationDuration)
      .attr("r", nodeRadius)
      .style("fill", (d) => {
        if (d.data.type === "decision") {
          return decisionColor; // Sempre a mesma cor, sem hover effect
        }
        return outcomeColor;
      });

    nodeUpdate
      .select("text")
      .transition()
      .duration(animationDuration)
      .style("fill-opacity", 1);

    // Remover nós
    const nodeExit = node
      .exit()
      .transition()
      .duration(animationDuration)
      .attr("transform", (d) => `translate(${source.x},${source.y})`)
      .remove();

    nodeExit
      .select("circle")
      .transition()
      .duration(animationDuration)
      .attr("r", 1e-6);

    nodeExit
      .select("text")
      .transition()
      .duration(animationDuration)
      .style("fill-opacity", 1e-6);

    // Links/Ligações
    const link = g.selectAll("path.link").data(links, (d) => d.id);

    const linkEnter = link
      .enter()
      .insert("path", "g")
      .attr("class", "link")
      .style("fill", "none")
      .style("stroke", linkColor)
      .style("stroke-width", "2px")
      .style("stroke-opacity", 0.6)
      .attr("d", (d) => {
        const o = { x: source.x0, y: source.y0 };
        return diagonal(o, o);
      });

    const linkUpdate = linkEnter.merge(link);

    linkUpdate
      .transition()
      .duration(animationDuration)
      .attr("d", (d) => diagonal(d, d.parent));

    const linkExit = link
      .exit()
      .transition()
      .duration(animationDuration)
      .attr("d", (d) => {
        const o = { x: source.x, y: source.y };
        return diagonal(o, o);
      })
      .remove();

    // Salvar posições
    nodes.forEach((d) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  function diagonal(s, d) {
    return `M ${s.x} ${s.y}
            C ${s.x} ${(s.y + d.y) / 2},
              ${d.x} ${(s.y + d.y) / 2},
              ${d.x} ${d.y}`;
  }

  // Função de clique removida - não é mais necessária
  // Manter apenas callback personalizado para compatibilidade
  function handleNodeClick(event, d) {
    if (onNodeClick) {
      onNodeClick(d.data, d);
    }
  }

  function handleMouseOver(event, d) {
    if (!showTooltips || !tooltip) return;

    tooltip.style.opacity = "1";
    tooltip.innerHTML = `<strong>${d.data.name}</strong>${d.data.description ? `<br/>${d.data.description}` : ""}`;
    tooltip.style.left = event.pageX + 10 + "px";
    tooltip.style.top = event.pageY - 10 + "px";
  }

  function handleMouseOut() {
    if (!showTooltips || !tooltip) return;
    tooltip.style.opacity = "0";
  }

  // Métodos públicos
  export function expandAll() {
    function expand(d) {
      if (d._children) {
        d.children = d._children;
        d._children = null;
      }
      if (d.children) {
        d.children.forEach(expand);
      }
    }
    if (root) {
      expand(root);
      update(root);
    }
  }

  export function collapseAll() {
    function collapseNode(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapseNode);
        d.children = null;
      }
    }
    if (root && root.children) {
      root.children.forEach(collapseNode);
    }
    update(root);
  }

  export function resetTree() {
    // Resetar para estado expandido ao invés de colapsado
    expandAll();
  }
</script>

<div class="relative">
  <svg
    bind:this={svgElement}
    class="bg-white rounded-lg shadow-lg"
  ></svg>

  {#if showTooltips}
    <div
      bind:this={tooltip}
      class="absolute bg-gray-800 text-white px-3 py-2 rounded-md text-sm pointer-events-none opacity-0 transition-opacity duration-300 z-10"
      style="transform: translateZ(0);"
    ></div>
  {/if}
</div>

<style>
  :global(.node) {
    cursor: default; /* Removido cursor de pointer */
  }

  :global(.node circle) {
    transition: fill 0.3s ease;
  }

  /* Removido hover effect nos círculos */

  :global(.link) {
    transition: stroke-opacity 0.3s ease;
  }

  :global(.link:hover) {
    stroke-opacity: 1 !important;
  }
</style>

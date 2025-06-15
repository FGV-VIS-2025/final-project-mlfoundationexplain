<script>
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';

  export let treeData;
  let svg;
  const height = 700;

  const leafColorScale = d3.scaleOrdinal()
    .domain(["San \nFrancisco", "Sacramento"]) // Ajuste para suas classes
    .range(["var(--color-classe0-node)", "var(--color-classe1-node)"]);

  let observer;

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

    const svgEl = d3.select(svg);
    svgEl.selectAll("*").remove();

    svgEl
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("background-color", "var(--color-background)")
      .style("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif");

    const g = svgEl.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const defs = g.append("defs");

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

    // Função link vertical para animar os links
    const linkPath = d3.linkVertical()
      .x(d => d.x)
      .y(d => d.y);

    // Links: desenhar inicialmente do source para o source (linha zerada)
    const links = g.selectAll(".link")
      .data(allLinks)
      .join("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "var(--color-link-stroke)")
      .attr("stroke-width", 3)
      .attr("filter", "url(#dropShadow)")
      .attr("d", d => {
        const o = { x: d.source.x, y: d.source.y };
        return linkPath({ source: o, target: o });
      });

    // Anima links para o caminho correto
    links.transition()
      .duration(200)
      .delay(d => d.target.depth * 300)
      .ease(d3.easeCubicOut)
      .attr("d", d => linkPath(d));

    // Nós: desenhar com escala menor e opacidade 0
    const nodes = g.selectAll(".node")
      .data(allNodes)
      .join("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y}) scale(0.5)`)
      .style("opacity", 0)
      .style("cursor", "default");

    // Transição para scale 1 e opacidade 1
    nodes.transition()
      .duration(600)
      .delay(d => d.depth * 300)
      .ease(d3.easeCubicOut)
      .style("opacity", 1)
      .attr("transform", d => `translate(${d.x},${d.y}) scale(1)`);

    // Círculos
    nodes.append("circle")
      .attr("r", 8)
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
      .attr("stroke-width", 2)
      .on("mouseover", function () {
        d3.select(this)
          .attr("fill", "var(--viz-node-hover)")
          .attr("r", 10);
      })
      .on("mouseout", function (d) {
        d3.select(this)
          .attr("fill", d => {
            if (!d.children) {
              const label = d.data.name.split(":").pop().trim();
              return `url(#leafGradient-${label.replace(/\s+/g, '')})`;
            }
            return `url(#${gradientId})`;
          })
          .attr("r", 8);
      });

    // Texto
    const text = nodes.append("text")
      .attr("dy", "0.35em")
      .attr("y", (d, i) => d.children ? -28 : 18)
      .attr("x", (d, i) => d.children ? -30 : -25)
      .style("font-size", "14px")
      .style("fill", d => {
        if (!d.children) {
          const label = d.data.name.split(":").pop().trim();
          const index = leafColorScale.domain().indexOf(label);
          return `var(--color-classe${index}-text)`;
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
    // Criar o IntersectionObserver para disparar animação quando SVG aparecer na viewport
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          drawTree();
        }
      });
    }, {
      root: null,        // viewport
      threshold: 0.1,    // ao menos 10% do elemento visível
    });

    if (svg) {
      observer.observe(svg);
    }

    window.addEventListener('resize', drawTree);
  });

  onDestroy(() => {
    if (observer && svg) {
      observer.unobserve(svg);
    }
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
    transition: r 0.5s ease, fill 0.1s ease;
  }
</style>

<svg bind:this={svg}></svg>

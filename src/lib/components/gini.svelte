<script>
  import * as d3 from 'd3';
  import { onMount } from 'svelte';
  import { _, locale, locales } from "svelte-i18n";
  import { changeLocale } from "../../i18n.js";

  let svgContainer;
  let samples = [];
  let maxSamples = 30;
  let positiveLine;

  const width = 600;
  const height = 600;
  const margin = { top: 30, right: 150, bottom: 70, left: 100 };

  const classes = ["Entropia", "Gini"];
  let colorScale;

  let svg, xScale, yScale;
  let hoverTooltip, hoverLine, hoverBox, hoverText, hoverText2;
  let sampleText1, sampleText2;
  let dotGroup;
  let dots = [];

  const entropy = p => (p === 0 || p === 1) ? 0 : -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
  const gini = p => 2 * p * (1 - p);

  const addSample = (label) => {
    if (samples.length >= maxSamples) return;
    samples = [...samples, { label, id: crypto.randomUUID() }];
    updateSample();
  };

  const removeClass = (label) => {
  const index = samples.findIndex(s => s.label === label);
  if (index !== -1) {
    samples = [...samples.slice(0, index), ...samples.slice(index + 1)];
    updateSample();
  }
};

  function updateSample() {
    const total = samples.length;
    if (total === 0) {
      sampleText1.text(`Entropia: -`);
      sampleText2.text(`Gini: -`);
      dotGroup.selectAll('circle').remove();
      updateDots(1); // tudo vermelho
      return;
    }

    const positives = samples.filter(d => d.label === 1).length;
    const p = positives / total;

        if (total > 0) {
      positiveLine
        .attr('x1', xScale(p))
        .attr('x2', xScale(p))
        .attr('stroke-dasharray', '4 2')
        .attr('opacity', 1);
    } else {
      positiveLine.attr('opacity', 0);
    }

    sampleText1.text(`Entropia: ${entropy(p).toFixed(3)}`);
    sampleText2.text(`Gini: ${gini(p).toFixed(3)}`);
    updateDots(p);

    // Bolinhas à direita
    const spacing = 12;
    const startXGreen = width - 60;
    const startXRed = width - 75;
    const startY = height - margin.bottom - 10;

    dotGroup.selectAll('circle').remove();
    let posIndex = 0, negIndex = 0;
    samples.forEach(val => {
      const isPositive = val.label === 1;
      const colIndex = isPositive ? posIndex++ : negIndex++;
      const x = isPositive ? startXGreen : startXRed;
      const y = startY - colIndex * spacing;

      dotGroup.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 6)
        .attr('fill', isPositive ? 'var(--color-classe0)' : 'var(--color-classe1)')
        .attr('opacity', 1);
    });
  }

  function updateDots(p) {
    const numDots = 50;
    const threshold = Math.round(p * numDots);
    dots.forEach((dot, i) => {
      dot.attr('fill', i < threshold ? 'var(--color-classe0)' : 'var(--color-classe1)').attr('opacity', 0.7);
    });
  }

  onMount(() => {

    const script = document.createElement('script');
    script.id = 'MathJax-script';
    script.async = true;
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
    document.head.appendChild(script);
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg = d3.select(svgContainer).html('').append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', 'transparent');

    xScale = d3.scaleLinear().domain([0, 1]).range([0, innerWidth]);
    yScale = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0]);



    //PALETA PERSONALIZADA
    const coresPersonalizadas = {
    'Entropia': 'var(--color-entropy)', // ou '#006400'
    'Gini': 'var(--color-gini)'      // ou '#4B0082'
  };


    colorScale = d3.scaleOrdinal()
      .domain(classes)
      .range(classes.map(c => coresPersonalizadas[c] || '#999')); // cor fallback se cidade não estiver no dicionário


    // colorScale = d3.scaleOrdinal()
    //   .domain(classes)
    //   .range(d3.schemeCategory10);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format(".0%")));

    g.append('g').call(d3.axisLeft(yScale).ticks(5));

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 40)
      .attr('text-anchor', 'middle')
      .attr('font-size', 13)
      .attr('fill', 'var(--color-text)')
      .text('Proporção da classe positiva (p)');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 18)
      .attr('text-anchor', 'middle')
      .attr('font-size', 13)
      .attr('fill', 'var(--color-text)')
      .text('Pureza (Entropia ou Gini)');

    const values = d3.range(0, 1.001, 0.01);
    g.append('path')
      .datum(values)
      .attr('fill', 'none')
      .attr('stroke', colorScale("Entropia"))
      .attr('stroke-width', 2)
      .attr('d', d3.line().x(d => xScale(d)).y(d => yScale(entropy(d))));

    g.append('path')
      .datum(values)
      .attr('fill', 'none')
      .attr('stroke', colorScale("Gini"))
      .attr('stroke-width', 2)
      .attr('d', d3.line().x(d => xScale(d)).y(d => yScale(gini(d))));

    positiveLine = g.append('line')
      .attr('y1', 0)
      .attr('y2', height - margin.top - margin.bottom)
      .attr('stroke', 'var(--color-text)')
      .attr('stroke-width', 4)
      .attr('opacity', 0);  // Inicialmente invisível

    const legend = svg.append('g').attr('transform', `translate(${width - 130},${margin.top})`);
    legend.append('rect').attr('width', 12).attr('height', 12).attr('fill', colorScale("Entropia"));
    legend.append('text').attr('x', 18).attr('y', 10).text('Entropia').attr('fill', 'var(--color-text)').attr('font-size', 12);
    legend.append('rect').attr('y', 20).attr('width', 12).attr('height', 12).attr('fill', colorScale("Gini"));
    legend.append('text').attr('x', 18).attr('y', 30).text('Gini').attr('fill', 'var(--color-text)').attr('font-size', 12);

    // Hover Tooltip
    hoverTooltip = svg.append('g').style('display', 'none');
    hoverLine = hoverTooltip.append('line')
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .attr('stroke', '#aaa')
      .attr('stroke-dasharray', '4 2');

    hoverBox = hoverTooltip.append('rect')
      .attr('width', 140)
      .attr('height', 40)
      .attr('fill', '#fefefe')
      .attr('stroke', '#ccc')
      .attr('rx', 5);

    hoverText = hoverTooltip.append('text').attr('font-size', 12).attr('fill', '#333');
    hoverText2 = hoverTooltip.append('text').attr('font-size', 12).attr('fill', '#333');

    svg.append('rect')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .on('mousemove', (event) => {
        const [mouseX] = d3.pointer(event);
        const px = Math.min(1, Math.max(0, xScale.invert(mouseX - margin.left)));
        const ent = entropy(px).toFixed(3);
        const gin = gini(px).toFixed(3);

        hoverTooltip.style('display', null);
        hoverLine.attr('x1', margin.left + xScale(px)).attr('x2', margin.left + xScale(px));
        hoverBox.attr('x', margin.left + xScale(px) + 10).attr('y', margin.top + 10);
        hoverText.attr('x', margin.left + xScale(px) + 18).attr('y', margin.top + 28).text(`Entropia: ${ent}`);
        hoverText2.attr('x', margin.left + xScale(px) + 18).attr('y', margin.top + 44).text(`Gini: ${gin}`);
        updateDots(px);
      })
      .on('mouseleave', () => {
        hoverTooltip.style('display', 'none');
        updateDots(1);
      });

    // Métricas fixas
    const fixedGroup = svg.append('g')
      .attr('transform', `translate(${width - margin.right + 10}, ${height / 2 - 180})`);
    fixedGroup.append('text').attr('y', 0).attr('font-weight', 'bold').text('Amostra atual').attr('fill', 'var(--color-text)');
    sampleText1 = fixedGroup.append('text').attr('y', 20).text(`Entropia: -`).attr('fill', 'var(--color-text)');
    sampleText2 = fixedGroup.append('text').attr('y', 40).text(`Gini: -`).attr('fill', 'var(--color-text)');

    dotGroup = svg.append('g');
    updateSample();
  });
</script>

<div class="button-container">
  <div class="positive-buttons">
    <button class = "sf" on:click={() => addSample(1)}>Adicionar San Francisco</button>
    <button class = "sf" on:click={() => removeClass(1)}>Remover San Francisco</button>
  </div>
  <div class="negative-buttons">
    <button class = "sac" on:click={() => addSample(0)}>Adicionar Sacramento</button>
    <button class = "sac" on:click={() => removeClass(0)}>Remover Sacramento</button>
  </div>
</div>

<div class="container">
  <div bind:this={svgContainer}></div>
  <div class="descricao">
  
    <h3>{$_('section-gini.title')}</h3>
    <p>

      {@html $_('section-gini.description', {
        values: {
          purity: `<strong>${$_('section-gini.purity')}</strong>`
        }
      })}
      <br>
      
        
      {@html $_('section-gini.purity_explanation', {
        values: {
          entropy: `<strong>${$_('section-gini.entropy')}</strong>`,
          gini_index: `<strong>${$_('section-gini.gini_index')}</strong>`
        }
      })}
     
      <br>
    </p>
    <div style="text-align: center; margin: 1em 0;">
      <!-- Imagem para tema claro -->
      <img src="https://quicklatex.com/cache3/09/ql_b5c2bb07b8b36054bbfb8e1292eee109_l3.png"
          alt="Fórmulas (claro)"
          class="block dark:hidden max-w-full h-auto" />

      <!-- Imagem para tema escuro -->
      <img src="https://quicklatex.com/cache3/b0/ql_000f9ccebd75a364a83019b889ef72b0_l3.png"
          alt="Fórmulas (escuro)"
          class="hidden dark:block max-w-full h-auto" />
    </div>

    <p>
    {@html $_('section-gini.metrics_behavior', {
      values: {
        information_gain: `<strong>${$_('section-gini.information_gain')}</strong>`,
        gini_gain: `<strong>${$_('section-gini.gini_gain')}</strong>`
      }
    })}
          
          
          <!-- {$_('section-gini.process_conclusion')} -->
      <br>
      <strong>{$_('section-gini.interaction_hint')}</strong>
    </p>
    </div>
</div>


<style>
  div {
    display: flex;
    justify-content: center;
    align-items: center;
  }

   .container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 40px;
    margin-top: 20px;
  }

  .descricao {
    display: flex;
    flex-direction: column;
    max-width: 500px;
    font-size: 16px;
    color: var(--color-text);
    line-height: 1.4;
  }

  .descricao h3 {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
    color: var(--color-text);
  }

    button {
  margin: 0.3em;
  padding: 0.3em 0.7em;
  font-weight: bold;
  font-size: 0.85rem;
  border: none;
  border-radius: 4px;
    background: var(--color-button-previsão);
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
  }
  button:hover {
    background: #7e22ce;
  }

  
.button-container {
  display: flex;
  gap: 1em;
  justify-content: flex-start; 
    margin-left: 170px;
}

.positive-buttons,
.negative-buttons {
  display: flex;
  flex-direction: column;
}

.sf {
  background-color: #0c5e27;
}

.sac {
  background-color: #4B0082;
}

.sf:hover {
  background-color: #278a42;
}

.sac:hover {
  background-color: #7e22ce;
}

</style>

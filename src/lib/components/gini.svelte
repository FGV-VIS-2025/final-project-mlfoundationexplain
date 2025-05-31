<script>
  import * as d3 from 'd3';
  import { onMount } from 'svelte';

  let svgContainer;

  const width = 600;
  const height = 500;
  const margin = { top: 30, right: 30, bottom: 70, left: 60 };

  let colorScale;
  let classes = [];


  onMount(() => {
    const svg = d3.select(svgContainer)
      .html('')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', 'transparent');

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleLinear().domain([0, 1]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0]);

    // escala de cores
    classes = ["Entropia", "Gini"];
    colorScale = d3.scaleOrdinal()
      .domain(classes)
      .range(d3.schemeCategory10);

    // inicializa o svg
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Eixos
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format(".0%")));

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5));

    // Rótulos dos eixos
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 40 )
      .attr('text-anchor', 'middle')
      .attr('font-size', 13)
      .attr("fill", "white")
      .text('Proporção da classe positiva (p)');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 18)
      .attr('text-anchor', 'middle')
      .attr('font-size', 13)
      .attr("fill", "white")
      .text('Pureza (Entropia ou Gini)');

    // Funções de pureza
    const entropy = p => (p === 0 || p === 1) ? 0 : -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
    const gini = p => 2 * p * (1 - p);
    const values = d3.range(0, 1.001, 0.01);

    const lineEntropy = d3.line()
      .x(d => xScale(d))
      .y(d => yScale(entropy(d)));

    const lineGini = d3.line()
      .x(d => xScale(d))
      .y(d => yScale(gini(d)));

    g.append('path')
      .datum(values)
      .attr('fill', 'none')
      .attr('stroke', colorScale("Entropia"))
      .attr('stroke-width', 2)
      .attr('d', lineEntropy);

    g.append('path')
      .datum(values)
      .attr('fill', 'none')
      .attr('stroke', colorScale("Gini"))
      .attr('stroke-width', 2)
      .attr('d', lineGini);

    // Legenda
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 130},${margin.top})`);

    legend.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', colorScale("Entropia"));

    legend.append('text')
      .attr('x', 18)
      .attr('y', 10)
      .text('Entropia')
      .attr("fill", "white")
      .attr('font-size', 12);

    legend.append('rect')
      .attr('y', 20)
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', colorScale("Gini"));

    legend.append('text')
      .attr('x', 18)
      .attr('y', 30)
      .text('Gini')
      .attr("fill", "white")
      .attr('font-size', 12);

    // Tooltip e linha vertical
    const tooltip = svg.append('g')
      .style('display', 'none');

    tooltip.append('line')
      .attr('class', 'hover-line')
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .attr('stroke', '#aaa')
      .attr('stroke-dasharray', '4 2');

    const tooltipBox = tooltip.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 140)
      .attr('height', 40)
      .attr('fill', '#fefefe')
      .attr('stroke', '#ccc')
      .attr('rx', 5);

    const tooltipText = tooltip.append('text')
      .attr('x', 10)
      .attr('y', 18)
      .attr('font-size', 12)
      .attr('fill', '#333');

    const tooltipText2 = tooltip.append('text')
      .attr('x', 10)
      .attr('y', 34)
      .attr('font-size', 12)
      .attr('fill', '#333');

    // Área sensível para mousemove
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

        tooltip.style('display', null);
        tooltip.select('.hover-line')
          .attr('x1', margin.left + xScale(px))
          .attr('x2', margin.left + xScale(px));

        tooltipBox.attr('x', margin.left + xScale(px) + 10)
                  .attr('y', margin.top + 10);

        tooltipText
          .attr('x', margin.left + xScale(px) + 18)
          .attr('y', margin.top + 28)
          .text(`Entropia: ${ent}`);

        tooltipText2
          .attr('x', margin.left + xScale(px) + 18)
          .attr('y', margin.top + 44)
          .text(`Gini: ${gin}`);
        
          updateDots(px);
      })
      .on('mouseleave', () => {
        tooltip.style('display', 'none');
        updateDots(1);
      });

    // desenhando as bolinhas abaixo
    const numDots = 50;
    const dotRadius = 3;
    const dotSpacing = 7;
    const dotAreaWidth = numDots * dotSpacing;
    // centraliza
    const dotStartX = margin.left + (innerWidth / 2) - (dotAreaWidth / 2);

    // duas fileiras de bolinhas
    const firstRowY = height - margin.bottom + 50; 
    const secondRowY = height - margin.bottom + 40;        
    const dotsGroup = svg.append('g');

    // Cria duas fileiras
    const dots = ['row1', 'row2'].flatMap((row, rowIndex) => {
      const y = rowIndex === 0 ? firstRowY : secondRowY;
      return d3.range(numDots).map((i) =>
        dotsGroup.append('circle')
          .attr('cx', dotStartX + i * dotSpacing)
          .attr('cy', y)
          .attr('r', dotRadius)
          .attr('fill', 'green')
          .attr('opacity', 0.7)

      );
    });

    // colori as bolinhas de acordo com o mouse
    function updateDots(p) {
      const threshold = Math.round(p * numDots);
      dots.forEach((dot, i) => {
        dot.attr('fill', i % numDots < threshold ? 'green' : "red")
        .attr('opacity', 0.7);

      });
  }
});
</script>

<div class="container">
  <div bind:this={svgContainer}></div>
  <div class="descricao">
    <h3>Pureza de um corte</h3>
    <p>
      Este gráfico compara duas medidas de pureza usadas em árvores de decisão:
      <strong>Entropia</strong> e <strong>Índice de Gini</strong>. Ambas são funções que medem o quão "pura" está uma divisão entre classes,
      sendo 0 a pureza máxima (apenas uma classe) e o máximo quando há mistura total.
 
      Passe o mouse sobre o gráfico para ver os valores específicos de entropia e Gini para cada proporção de classe positiva.
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
    max-width: 300px;
    font-size: 14px;
    color: white;
    line-height: 1.4;
  }

  .descricao h3 {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
    color: white;
  }

</style>

<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  // variáveis de scroll
  // Armazena as referências dos elementos DOM de cada etapa (step)
  let currentStep = 0;
  let stepRefs = [];

  // dimensões do gráfico
  const width = 700;
  const height = 650;
  const margin = { top: 100, right: 70, bottom: 100, left: 70 };

  // colunas para os cortes em 2d
  const xKey = 'total_rooms';
  const yKey = 'median_house_value';
  const cityKey = 'city';

  // função auxiliar para calcular a densidade
  function kernelDensityEstimator(kernel, xValues) {
    return function (sample) {
      return xValues.map(x => [
        x,
        d3.mean(sample, v => kernel(x - v))
      ]);
    };
  }

  function kernelEpanechnikov(bandwidth) {
    return function (u) {
      u /= bandwidth;
      return Math.abs(u) <= 1 ? 0.75 * (1 - u * u) / bandwidth : 0;
    };
  }
  
  // gráfico de scatter e densidade
  export async function scatterDensity() {
  // inicialização
  let xScale, yScale;
  let xTicks = [], yTicks = [];
  let data = [];
  let error = null;
  let colorScale;
  let cities = [];

  let xDensity = {};
  let yDensity = {};
  
  // selecionar o svg de visualização
  const svg = d3.select('.viz svg')
    .html('') // limpa conteúdo
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background', 'transparent');

  try {
    // Carrega e processa CSV
    const res = await fetch('/data/housing_limpo.csv');
    const text = await res.text();

    const lines = text.trim().split('\n');
    const headers = lines[0].trim().split(',');

    const xIndex = headers.indexOf(xKey);
    const yIndex = headers.indexOf(yKey);
    const cityIndex = headers.indexOf(cityKey);

    if (xIndex === -1 || yIndex === -1 || cityIndex === -1) {
      throw new Error(`Colunas "${xKey}", "${yKey}" ou "${cityKey}" não encontradas`);
    }

    data = lines.slice(1).map(line => {
      const cols = line.split(',');
      return {
        x: parseFloat(cols[xIndex]),
        y: parseFloat(cols[yIndex]),
        city: cols[cityIndex]?.trim()
      };
    }).filter(d => !isNaN(d.x) && !isNaN(d.y) && d.city);

    // valores horizontal e vertical
    const xValues = data.map(d => d.x);
    const yValues = data.map(d => d.y);

    // extremos das escalas
    const xMin = d3.min(xValues);
    const xMax = d3.max(xValues);
    const yMin = d3.min(yValues);
    const yMax = d3.max(yValues);

    xScale = d3.scaleLinear()
      .domain([xMin, xMax])
      .range([margin.left, width - margin.right]);

    yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([height - margin.bottom, margin.top]);

    xTicks = xScale.ticks(5);
    yTicks = yScale.ticks(5);

    cities = [...new Set(data.map(d => d.city))];
    colorScale = d3.scaleOrdinal()
      .domain(cities)
      .range(d3.schemeCategory10);

    // Densidade dos dados
    const kde = kernelDensityEstimator(kernelEpanechnikov(500), xScale.ticks(40));
    const kdeY = kernelDensityEstimator(kernelEpanechnikov(10000), yScale.ticks(40));
    cities.forEach(city => {
      const subset = data.filter(d => d.city === city);
      xDensity[city] = kde(subset.map(d => d.x));
      yDensity[city] = kdeY(subset.map(d => d.y));
    });

    // Pontos scatterplot
    svg.selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 3)
      .attr('fill', d => colorScale(d.city))
      .attr('opacity', 0.4);

    // Eixo X
    svg.append('line')
      .attr('x1', margin.left)
      .attr('y1', height - margin.bottom)
      .attr('x2', width - margin.right)
      .attr('y2', height - margin.bottom)
      .attr('stroke', 'black');

    svg.selectAll('xTicks')
      .data(xTicks)
      .join('line')
      .attr('x1', d => xScale(d))
      .attr('y1', height - margin.bottom)
      .attr('x2', d => xScale(d))
      .attr('y2', height - margin.bottom + 6)
      .attr('stroke', 'black');

    svg.selectAll('xTickLabels')
      .data(xTicks)
      .join('text')
      .attr('x', d => xScale(d))
      .attr('y', height - margin.bottom + 20)
      .attr('font-size', 10)
      .attr('text-anchor', 'middle')
      .text(d => Math.round(d));

    // Eixo Y
    svg.append('line')
      .attr('x1', margin.left)
      .attr('y1', margin.top)
      .attr('x2', margin.left)
      .attr('y2', height - margin.bottom)
      .attr('stroke', 'black');

    svg.selectAll('yTicks')
      .data(yTicks)
      .join('line')
      .attr('x1', margin.left)
      .attr('y1', d => yScale(d))
      .attr('x2', margin.left - 6)
      .attr('y2', d => yScale(d))
      .attr('stroke', 'black');

    svg.selectAll('yTickLabels')
      .data(yTicks)
      .join('text')
      .attr('x', margin.left - 10)
      .attr('y', d => yScale(d) + 3)
      .attr('font-size', 10)
      .attr('text-anchor', 'end')
      .text(d => Math.round(d));

    // Legendas dos eixos
    svg.append('text')
      .attr('x', (width + margin.left - margin.right) / 2)
      .attr('y', height - 50)
      .attr('font-size', 12)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .text('Total rooms');

    svg.append('text')
      .attr('transform', `translate(15, ${(height - margin.bottom + margin.top) / 2}) rotate(-90)`)
      .attr('font-size', 12)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .text('Median house value');

    // Legenda cores por cidade
    const legendX = width - margin.right - 150;
    const legendY = margin.top + 20;

    const legend = svg.append('g')
      .attr('transform', `translate(${legendX},${legendY})`);

    cities.forEach((city, i) => {
      const g = legend.append('g')
        .attr('transform', `translate(0,${i * 20})`);

      g.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', colorScale(city));

      g.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .attr('font-size', 12)
        .text(city);
    });

    // Densidade no topo (X)
    cities.forEach((city, i) => {
      svg.append('path')
        .attr('d', d3.line()
          .x(d => xScale(d[0]))
          .y(d => margin.top - d[1] * 200000)(xDensity[city])
        )
        .attr('fill', 'none')
        .attr('stroke', i === 0 ? 'steelblue' : 'coral')
        .attr('stroke-width', 2);
    });

    // Densidade na direita (Y)
    cities.forEach((city, i) => {
      svg.append('path')
        .attr('d', d3.line()
          .x(d => width - margin.right + d[1] * 5000000)
          .y(d => yScale(d[0]))(yDensity[city])
        )
        .attr('fill', 'none')
        .attr('stroke', i === 0 ? 'steelblue' : 'coral')
        .attr('stroke-width', 2);
    });

  // interatividade 
  // Criação do tooltip SVG
  const tooltip = svg.append('g')
    .style('display', 'none');

  const tooltipBox = tooltip.append('rect')
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

  // tooltip dos pontos
  svg.selectAll('circle')
    .on('mouseover', (event, d) => {
      // mostra tooltip
      tooltip.style('display', null); 
      d3.select(event.currentTarget)
        .attr('stroke', 'black')
        .attr('stroke-width', 1.5);
    })
    .on('mousemove', (event, d) => {
      const [mouseX, mouseY] = d3.pointer(event);

      tooltip
        .attr('transform', `translate(${mouseX + 10},${mouseY - 20})`);

      tooltip.select('.hover-line')
        .attr('x1', mouseX)
        .attr('x2', mouseX);

      tooltipText.text(`Median: ${d.y}`);
      tooltipText2.text(`Total rooms: ${d.x}`);

      tooltipBox
        .attr('x', 0)
        .attr('y', 0);
    })
    .on('mouseout', (event, d) => {
      tooltip.style('display', 'none');
      d3.select(event.currentTarget)
        .attr('stroke', null);
    });

  // Tooltip para densidade
  const densityTooltip = svg.append('g')
    .style('display', 'none');

  const densityBox = densityTooltip.append('rect')
    .attr('width', 160)
    .attr('height', cities.length * 20 + 10)
    .attr('fill', '#fefefe')
    .attr('stroke', '#ccc')
    .attr('rx', 5);

  const densityLines = cities.map((city, i) =>
    densityTooltip.append('text')
      .attr('x', 10)
      .attr('y', 20 + i * 18)
      .attr('font-size', 12)
      .attr('fill', colorScale(city))
  );
    //  Interação com curva de densidade no eixo X
    svg.append('rect')
    .attr('x', margin.left)
    .attr('y', margin.top - 60)
    .attr('width', width - margin.left - margin.right)
    .attr('height', 60)
    .attr('fill', 'transparent')
    .on('mousemove', event => {
      const [mouseX] = d3.pointer(event);
      const xVal = xScale.invert(mouseX);

      densityTooltip.style('display', null)
        .attr('transform', `translate(${mouseX + 10},${margin.top - 80})`);

      cities.forEach((city, i) => {
        const density = xDensity[city];
        const closest = density.reduce((a, b) =>
          Math.abs(b[0] - xVal) < Math.abs(a[0] - xVal) ? b : a
        );

        densityLines[i].text(`${city}: ${closest[1].toFixed(5)}`);
      });
    })
    .on('mouseout', () => {
      densityTooltip.style('display', 'none');
    });

  // Interação com curva de densidade no eixo Y
  svg.append('rect')
  .attr('x', width - margin.right)
  .attr('y', margin.top)
  .attr('width', 60)
  .attr('height', height - margin.top - margin.bottom)
  .attr('fill', 'transparent')
  .on('mousemove', event => {
    const [, mouseY] = d3.pointer(event);
    const yVal = yScale.invert(mouseY);

    densityTooltip.style('display', null)
      .attr('transform', `translate(${width - margin.right -100},${mouseY - 20})`);

    cities.forEach((city, i) => {
      const density = yDensity[city];
    const closest = density.reduce((a, b) =>
      Math.abs(b[0] - yVal) < Math.abs(a[0] - yVal) ? b : a
    );

    densityLines[i].text(`${city}: ${closest[1].toFixed(6)}`);
        });
      })
      .on('mouseout', () => {
        densityTooltip.style('display', 'none');
  });


  } catch (e) {
    error = e.message;
  }
  }

  export async function corte1() {
    
    // inicialização
    let xScale, yScale;
    let xTicks = [], yTicks = [];
    let data = [];
    let error = null;
    let colorScale;
    let cities = [];

    let xDensity = {};
    let yDensity = {};

    // selecionar o svg de visualização
    const svg = d3.select('.viz svg')
      .html('') // limpa conteúdo
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', 'transparent');

    // camada de fundo
    const backgroundLayer = svg.append('g').lower();

    try {
      // Carrega e processa CSV
      const res = await fetch('/data/housing_limpo.csv');
      const text = await res.text();

      const lines = text.trim().split('\n');
      const headers = lines[0].trim().split(',');

      const xIndex = headers.indexOf(xKey);
      const yIndex = headers.indexOf(yKey);
      const cityIndex = headers.indexOf(cityKey);

      if (xIndex === -1 || yIndex === -1 || cityIndex === -1) {
        throw new Error(`Colunas "${xKey}", "${yKey}" ou "${cityKey}" não encontradas`);
      }

      data = lines.slice(1).map(line => {
        const cols = line.split(',');
        return {
          x: parseFloat(cols[xIndex]),
          y: parseFloat(cols[yIndex]),
          city: cols[cityIndex]?.trim()
        };
      }).filter(d => !isNaN(d.x) && !isNaN(d.y) && d.city);

      // valores horizontal e vertical
      const xValues = data.map(d => d.x);
      const yValues = data.map(d => d.y);

      // extremos das escalas
      const xMin = d3.min(xValues);
      const xMax = d3.max(xValues);
      const yMin = d3.min(yValues);
      const yMax = d3.max(yValues);

      xScale = d3.scaleLinear()
        .domain([xMin, xMax])
        .range([margin.left, width - margin.right]);

      yScale = d3.scaleLinear()
        .domain([yMin, yMax])
        .range([height - margin.bottom, margin.top]);

      xTicks = xScale.ticks(5);
      yTicks = yScale.ticks(5);

      cities = [...new Set(data.map(d => d.city))];
      colorScale = d3.scaleOrdinal()
        .domain(cities)
        .range(d3.schemeCategory10);

      // Densidade dos dados
      const kde = kernelDensityEstimator(kernelEpanechnikov(500), xScale.ticks(40));
      const kdeY = kernelDensityEstimator(kernelEpanechnikov(10000), yScale.ticks(40));
      cities.forEach(city => {
        const subset = data.filter(d => d.city === city);
        xDensity[city] = kde(subset.map(d => d.x));
        yDensity[city] = kdeY(subset.map(d => d.y));
      });

      // desenha pontos scatterplot
      svg.selectAll('circle')
        .data(data)
        .join('circle')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 3)
        .attr('fill', d => colorScale(d.city))
        .attr('opacity', 0.4);

      // Eixo X
      svg.append('line')
        .attr('x1', margin.left)
        .attr('y1', height - margin.bottom)
        .attr('x2', width - margin.right)
        .attr('y2', height - margin.bottom)
        .attr('stroke', 'black');

      svg.selectAll('xTicks')
        .data(xTicks)
        .join('line')
        .attr('x1', d => xScale(d))
        .attr('y1', height - margin.bottom)
        .attr('x2', d => xScale(d))
        .attr('y2', height - margin.bottom + 6)
        .attr('stroke', 'black');

      svg.selectAll('xTickLabels')
        .data(xTicks)
        .join('text')
        .attr('x', d => xScale(d))
        .attr('y', height - margin.bottom + 20)
        .attr('font-size', 10)
        .attr('text-anchor', 'middle')
        .text(d => Math.round(d));

      // Eixo Y
      svg.append('line')
        .attr('x1', margin.left)
        .attr('y1', margin.top)
        .attr('x2', margin.left)
        .attr('y2', height - margin.bottom)
        .attr('stroke', 'black');

      svg.selectAll('yTicks')
        .data(yTicks)
        .join('line')
        .attr('x1', margin.left)
        .attr('y1', d => yScale(d))
        .attr('x2', margin.left - 6)
        .attr('y2', d => yScale(d))
        .attr('stroke', 'black');

      svg.selectAll('yTickLabels')
        .data(yTicks)
        .join('text')
        .attr('x', margin.left - 10)
        .attr('y', d => yScale(d) + 3)
        .attr('font-size', 10)
        .attr('text-anchor', 'end')
        .text(d => Math.round(d));

      // Legendas dos eixos
      svg.append('text')
        .attr('x', (width + margin.left - margin.right) / 2)
        .attr('y', height - 50)
        .attr('font-size', 12)
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .text('Total rooms');

      svg.append('text')
        .attr('transform', `translate(15, ${(height - margin.bottom + margin.top) / 2}) rotate(-90)`)
        .attr('font-size', 12)
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .text('Median house value');

      // Legenda cores por cidade
      const legendX = width - margin.right - 150;
      const legendY = margin.top + 20;

      const legend = svg.append('g')
        .attr('transform', `translate(${legendX},${legendY})`);

      cities.forEach((city, i) => {
        const g = legend.append('g')
          .attr('transform', `translate(0,${i * 20})`);

        g.append('rect')
          .attr('width', 15)
          .attr('height', 15)
          .attr('fill', colorScale(city));

        g.append('text')
          .attr('x', 20)
          .attr('y', 12)
          .attr('font-size', 12)
          .text(city);
      });

      // Densidade no topo (X)
      cities.forEach((city, i) => {
        svg.append('path')
          .attr('d', d3.line()
            .x(d => xScale(d[0]))
            .y(d => margin.top - d[1] * 200000)(xDensity[city])
          )
          .attr('fill', 'none')
          .attr('stroke', i === 0 ? 'steelblue' : 'coral')
          .attr('stroke-width', 2);
      });

      // Densidade na direita (Y)
      cities.forEach((city, i) => {
        svg.append('path')
          .attr('d', d3.line()
            .x(d => width - margin.right + d[1] * 5000000)
            .y(d => yScale(d[0]))(yDensity[city])
          )
          .attr('fill', 'none')
          .attr('stroke', i === 0 ? 'steelblue' : 'coral')
          .attr('stroke-width', 2);
      });

    // interatividade 
    // Criação do tooltip SVG
    const tooltip = svg.append('g')
      .style('display', 'none');

    const tooltipBox = tooltip.append('rect')
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

    // tooltip dos pontos
    svg.selectAll('circle')
      .on('mouseover', (event, d) => {
        // mostra tooltip
        tooltip.style('display', null); 
        d3.select(event.currentTarget)
          .attr('stroke', 'black')
          .attr('stroke-width', 1.5);
      })
      .on('mousemove', (event, d) => {
        const [mouseX, mouseY] = d3.pointer(event);
        tooltip.attr('transform', `translate(${mouseX + 10},${mouseY - 20})`);

        tooltip.select('.hover-line')
          .attr('x1', mouseX)
          .attr('x2', mouseX);

        tooltipText.text(`Median: ${d.y}`);
        tooltipText2.text(`Total rooms: ${d.x}`);

        tooltipBox
          .attr('x', 0)
          .attr('y', 0);
      })
      .on('mouseout', (event, d) => {
        tooltip.style('display', 'none');
        d3.select(event.currentTarget)
          .attr('stroke', null);
      });

    // Tooltip para densidade
    const densityTooltip = svg.append('g')
      .style('display', 'none');

    const densityBox = densityTooltip.append('rect')
      .attr('width', 160)
      .attr('height', cities.length * 20 + 10)
      .attr('fill', '#fefefe')
      .attr('stroke', '#ccc')
      .attr('rx', 5);

    const densityLines = cities.map((city, i) =>
      densityTooltip.append('text')
        .attr('x', 10)
        .attr('y', 20 + i * 18)
        .attr('font-size', 12)
        .attr('fill', colorScale(city))
    );
    //  Interação com curva de densidade no eixo X
    svg.append('rect')
    .attr('x', margin.left)
    .attr('y', margin.top - 60)
    .attr('width', width - margin.left - margin.right)
    .attr('height', 60)
    .attr('fill', 'transparent')
    .on('mousemove', event => {
      const [mouseX] = d3.pointer(event);
      const xVal = xScale.invert(mouseX);

      densityTooltip.style('display', null)
        .attr('transform', `translate(${mouseX + 10},${margin.top - 80})`);

      cities.forEach((city, i) => {
        const density = xDensity[city];
        const closest = density.reduce((a, b) =>
          Math.abs(b[0] - xVal) < Math.abs(a[0] - xVal) ? b : a
        );

        densityLines[i].text(`${city}: ${closest[1].toFixed(5)}`);
      });
    })
    .on('mouseout', () => {
      densityTooltip.style('display', 'none');
    });

    // Interação com curva de densidade no eixo Y
    svg.append('rect')
    .attr('x', width - margin.right)
    .attr('y', margin.top)
    .attr('width', 60)
    .attr('height', height - margin.top - margin.bottom)
    .attr('fill', 'transparent')
    .on('mousemove', event => {
      const [, mouseY] = d3.pointer(event);
      const yVal = yScale.invert(mouseY);

      densityTooltip.style('display', null)
        .attr('transform', `translate(${width - margin.right -100},${mouseY - 20})`);

      cities.forEach((city, i) => {
        const density = yDensity[city];
      const closest = density.reduce((a, b) =>
        Math.abs(b[0] - yVal) < Math.abs(a[0] - yVal) ? b : a
      );

      densityLines[i].text(`${city}: ${closest[1].toFixed(6)}`);
          });
        })
        .on('mouseout', () => {
          densityTooltip.style('display', 'none');
    });


    } catch (e) {
      error = e.message;
    }
    // Carrega a árvore
    const treeRes = await fetch('/trees/cortes_2d.json');
    const tree = await treeRes.json();

    const { feature, threshold } = tree;

    // traça o primeiro corte com mairo pureza
    if (feature === 'feature 0') {
      const thresholdX = threshold;

      // Divide os dados em dois grupos pela coordenada x
      const esquerda = data.filter(d => d.x <= thresholdX);
      const direita = data.filter(d => d.x > thresholdX);

      // Classe majoritária de cada lado
      const majorEsquerda = d3.rollups(esquerda, v => v.length, d => d.city)
                              .sort((a, b) => d3.descending(a[1], b[1]))[0][0];

      const majorDireita = d3.rollups(direita, v => v.length, d => d.city)
                              .sort((a, b) => d3.descending(a[1], b[1]))[0][0];

      const x = xScale(thresholdX);

      // Retângulo da esquerda
      backgroundLayer.append('rect')
        .attr('x', margin.left)
        .attr('y', margin.top)
        .attr('width', x - margin.left)
        .attr('height', height - margin.bottom - margin.top)
        .attr('fill', colorScale(majorEsquerda))
        .attr('opacity', 0.3);

      // Retângulo da direita
      backgroundLayer.append('rect')
        .attr('x', x)
        .attr('y', margin.top)
        .attr('width', width - margin.right - x)
        .attr('height', height - margin.bottom - margin.top)
        .attr('fill', colorScale(majorDireita))
        .attr('opacity', 0.3);

      // Linha de corte
      backgroundLayer.append('line')
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', margin.top)
        .attr('y2', height - margin.bottom)
        .attr('stroke', 'black')
        .attr('stroke-width', 2);
    }

  if (feature === 'feature 1') {
    const thresholdY = threshold;

    // Divide os dados em dois grupos pela coordenada y
    const abaixo = data.filter(d => d.y <= thresholdY);
    const acima = data.filter(d => d.y > thresholdY);

    const majorAbaixo = d3.rollups(abaixo, v => v.length, d => d.city)
                          .sort((a, b) => d3.descending(a[1], b[1]))[0][0];

    const majorAcima = d3.rollups(acima, v => v.length, d => d.city)
                          .sort((a, b) => d3.descending(a[1], b[1]))[0][0];

    const y = yScale(thresholdY);

    // Retângulo de cima
    backgroundLayer.append('rect')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', width - margin.left - margin.right)
      .attr('height', y - margin.top)
      .attr('fill', colorScale(majorAcima))
      .attr('opacity', 0.3);

    // Retângulo de baixo
    backgroundLayer.append('rect')
      .attr('x', margin.left)
      .attr('y', y)
      .attr('width', width - margin.left - margin.right)
      .attr('height', height - y - margin.bottom)
      .attr('fill', colorScale(majorAbaixo))
      .attr('opacity', 0.3);

    // Linha de corte
    backgroundLayer.append('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', y)
      .attr('y2', y)
      .attr('stroke', 'black')
      .attr('stroke-width', 2);
    }
    // Tooltip para a linha de corte
  const cutLineTooltip = svg.append('g')
    .style('display', 'none');

  const tooltipBox = cutLineTooltip.append('rect')
    .attr('width', 170)
    .attr('height', 24)
    .attr('fill', '#f9f9f9')
    .attr('stroke', '#999')
    .attr('rx', 4);

  const tooltipText = cutLineTooltip.append('text')
    .attr('x', 6)
    .attr('y', 16)
    .attr('font-size', 12)
    .attr('fill', '#333');

    svg.append('rect')
    .attr('x', margin.left)
    .attr('y', yScale(threshold) - 5)
    .attr('width', width - margin.left - margin.right)
    .attr('height', 10)
    .attr('fill', 'transparent')
    .on('mouseover', () => {
      cutLineTooltip.style('display', null);
    })
    .on('mousemove', event => {
      const [mouseX, mouseY] = d3.pointer(event);
      cutLineTooltip.attr('transform', `translate(${mouseX + 10},${mouseY - 20})`);
      tooltipText.text(`Median house value: ${threshold}`);
    })
    .on('mouseout', () => {
      cutLineTooltip.style('display', 'none');
    });
  }

  export async function corte2() {
    // inicialização
    let xScale, yScale;
    let xTicks = [], yTicks = [];
    let data = [];
    let error = null;
    let colorScale;
    let cities = [];

    let xDensity = {};
    let yDensity = {};

    
    // selecionar o svg de visualização
    const svg = d3.select('.viz svg')
      .html('') // limpa conteúdo
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', 'transparent');

    // camada de fundo
    const backgroundLayer = svg.append('g').lower();

    try {
      // Carrega e processa CSV
      const res = await fetch('/data/housing_limpo.csv');
      const text = await res.text();

      const lines = text.trim().split('\n');
      const headers = lines[0].trim().split(',');

      const xIndex = headers.indexOf(xKey);
      const yIndex = headers.indexOf(yKey);
      const cityIndex = headers.indexOf(cityKey);

      if (xIndex === -1 || yIndex === -1 || cityIndex === -1) {
        throw new Error(`Colunas "${xKey}", "${yKey}" ou "${cityKey}" não encontradas`);
      }

      data = lines.slice(1).map(line => {
        const cols = line.split(',');
        return {
          x: parseFloat(cols[xIndex]),
          y: parseFloat(cols[yIndex]),
          city: cols[cityIndex]?.trim()
        };
      }).filter(d => !isNaN(d.x) && !isNaN(d.y) && d.city);

      // valores horizontal e vertical
      const xValues = data.map(d => d.x);
      const yValues = data.map(d => d.y);

      // extremos das escalas
      const xMin = d3.min(xValues);
      const xMax = d3.max(xValues);
      const yMin = d3.min(yValues);
      const yMax = d3.max(yValues);

      xScale = d3.scaleLinear()
        .domain([xMin, xMax])
        .range([margin.left, width - margin.right]);

      yScale = d3.scaleLinear()
        .domain([yMin, yMax])
        .range([height - margin.bottom, margin.top]);

      xTicks = xScale.ticks(5);
      yTicks = yScale.ticks(5);

      cities = [...new Set(data.map(d => d.city))];
      colorScale = d3.scaleOrdinal()
        .domain(cities)
        .range(d3.schemeCategory10);

      // Densidade dos dados
      const kde = kernelDensityEstimator(kernelEpanechnikov(500), xScale.ticks(40));
      const kdeY = kernelDensityEstimator(kernelEpanechnikov(10000), yScale.ticks(40));
      cities.forEach(city => {
        const subset = data.filter(d => d.city === city);
        xDensity[city] = kde(subset.map(d => d.x));
        yDensity[city] = kdeY(subset.map(d => d.y));
      });

      // Pontos scatterplot
      svg.selectAll('circle')
        .data(data)
        .join('circle')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 3)
        .attr('fill', d => colorScale(d.city))
        .attr('opacity', 0.4);

      // Eixo X
      svg.append('line')
        .attr('x1', margin.left)
        .attr('y1', height - margin.bottom)
        .attr('x2', width - margin.right)
        .attr('y2', height - margin.bottom)
        .attr('stroke', 'black');

      svg.selectAll('xTicks')
        .data(xTicks)
        .join('line')
        .attr('x1', d => xScale(d))
        .attr('y1', height - margin.bottom)
        .attr('x2', d => xScale(d))
        .attr('y2', height - margin.bottom + 6)
        .attr('stroke', 'black');

      svg.selectAll('xTickLabels')
        .data(xTicks)
        .join('text')
        .attr('x', d => xScale(d))
        .attr('y', height - margin.bottom + 20)
        .attr('font-size', 10)
        .attr('text-anchor', 'middle')
        .text(d => Math.round(d));

      // Eixo Y
      svg.append('line')
        .attr('x1', margin.left)
        .attr('y1', margin.top)
        .attr('x2', margin.left)
        .attr('y2', height - margin.bottom)
        .attr('stroke', 'black');

      svg.selectAll('yTicks')
        .data(yTicks)
        .join('line')
        .attr('x1', margin.left)
        .attr('y1', d => yScale(d))
        .attr('x2', margin.left - 6)
        .attr('y2', d => yScale(d))
        .attr('stroke', 'black');

      svg.selectAll('yTickLabels')
        .data(yTicks)
        .join('text')
        .attr('x', margin.left - 10)
        .attr('y', d => yScale(d) + 3)
        .attr('font-size', 10)
        .attr('text-anchor', 'end')
        .text(d => Math.round(d));

      // Legendas dos eixos
      svg.append('text')
        .attr('x', (width + margin.left - margin.right) / 2)
        .attr('y', height - 50)
        .attr('font-size', 12)
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .text('Total rooms');

      svg.append('text')
        .attr('transform', `translate(15, ${(height - margin.bottom + margin.top) / 2}) rotate(-90)`)
        .attr('font-size', 12)
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .text('Median house value');

      // Legenda cores por cidade
      const legendX = width - margin.right - 150;
      const legendY = margin.top + 20;

      const legend = svg.append('g')
        .attr('transform', `translate(${legendX},${legendY})`);

      cities.forEach((city, i) => {
        const g = legend.append('g')
          .attr('transform', `translate(0,${i * 20})`);

        g.append('rect')
          .attr('width', 15)
          .attr('height', 15)
          .attr('fill', colorScale(city));

        g.append('text')
          .attr('x', 20)
          .attr('y', 12)
          .attr('font-size', 12)
          .text(city);
      });

      // Densidade no topo (X)
      cities.forEach((city, i) => {
        svg.append('path')
          .attr('d', d3.line()
            .x(d => xScale(d[0]))
            .y(d => margin.top - d[1] * 200000)(xDensity[city])
          )
          .attr('fill', 'none')
          .attr('stroke', i === 0 ? 'steelblue' : 'coral')
          .attr('stroke-width', 2);
      });

      // Densidade na direita (Y)
      cities.forEach((city, i) => {
        svg.append('path')
          .attr('d', d3.line()
            .x(d => width - margin.right + d[1] * 5000000)
            .y(d => yScale(d[0]))(yDensity[city])
          )
          .attr('fill', 'none')
          .attr('stroke', i === 0 ? 'steelblue' : 'coral')
          .attr('stroke-width', 2);
      });

    } catch (e) {
      error = e.message;
    }
    // Carrega a árvore
    const treeRes = await fetch('/trees/cortes_2d.json');
    const tree = await treeRes.json();

    // Pega o primeiro corte
    // 1º corte (nível raiz)
    const { feature, threshold, left, right } = tree;

    let area = {
      xMin: margin.left,
      xMax: width - margin.right,
      yMin: margin.top,
      yMax: height - margin.bottom
    };
    

    if (feature === 'feature 0') {
      const x = xScale(threshold);
      svg.append('line')
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', area.yMin)
        .attr('y2', area.yMax)
        .attr('stroke', 'red')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

      // 2º corte no lado esquerdo (aninhado)
      if (left.feature === 'feature 1') {
        const y2 = yScale(left.threshold);
        svg.append('line')
          .attr('x1', area.xMin)
          .attr('x2', x)
          .attr('y1', y2)
          .attr('y2', y2)
          .attr('stroke', 'blue')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '4,4');
      }

    } else if (feature === 'feature 1') {
      const y = yScale(threshold);
      svg.append('line')
        .attr('x1', area.xMin)
        .attr('x2', area.xMax)
        .attr('y1', y)
        .attr('y2', y)
        .attr('stroke', 'black')
        .attr('stroke-width', 2);

      // Tooltip para a linha de corte
    const cutLineTooltip = svg.append('g')
      .style('display', 'none');

    const tooltipBox = cutLineTooltip.append('rect')
      .attr('width', 170)
      .attr('height', 24)
      .attr('fill', '#f9f9f9')
      .attr('stroke', '#999')
      .attr('rx', 4);

    const tooltipText = cutLineTooltip.append('text')
      .attr('x', 6)
      .attr('y', 16)
      .attr('font-size', 12)
      .attr('fill', '#333');

      svg.append('rect')
      .attr('x', margin.left)
      .attr('y', yScale(threshold) - 5)
      .attr('width', width - margin.left - margin.right)
      .attr('height', 10)
      .attr('fill', 'transparent')
      .on('mouseover', () => {
        cutLineTooltip.style('display', null);
      })
      .on('mousemove', event => {
        const [mouseX, mouseY] = d3.pointer(event);
        cutLineTooltip.attr('transform', `translate(${mouseX + 10},${mouseY - 20})`);
        tooltipText.text(`Median house value: ${threshold}`);
      })
      .on('mouseout', () => {
        cutLineTooltip.style('display', 'none');
      });

      // 2º corte no lado inferior (y < threshold)
      if (left.feature === 'feature 1') {
        const y2 = yScale(left.threshold);
        svg.append('line')
        .attr('x1', area.xMin)
        .attr('x2', area.xMax)
        .attr('y1', y2)
        .attr('y2', y2)
        .attr('stroke', 'black')
        .attr('stroke-width', 2);

        // Tooltip para a linha de corte
        const cutLineTooltip = svg.append('g')
          .style('display', 'none');

        const tooltipBox = cutLineTooltip.append('rect')
          .attr('width', 170)
          .attr('height', 24)
          .attr('fill', '#f9f9f9')
          .attr('stroke', '#999')
          .attr('rx', 4);

        const tooltipText = cutLineTooltip.append('text')
          .attr('x', 6)
          .attr('y', 16)
          .attr('font-size', 12)
          .attr('fill', '#333');

          svg.append('rect')
          .attr('x', margin.left)
          .attr('y', yScale(left.threshold) - 5)
          .attr('width', width - margin.left - margin.right)
          .attr('height', 10)
          .attr('fill', 'transparent')
          .on('mouseover', () => {
            cutLineTooltip.style('display', null);
          })
          .on('mousemove', event => {
            const [mouseX, mouseY] = d3.pointer(event);
            cutLineTooltip.attr('transform', `translate(${mouseX + 10},${mouseY - 20})`);
            tooltipText.text(`Median house value: ${left.threshold}`);
          })
          .on('mouseout', () => {
            cutLineTooltip.style('display', 'none');
          });
      }

    }
  
  // para saber a classe mais prevista  
  function moda(arr) {
    if (!arr || arr.length === 0) return null;
    const counts = {};
    arr.forEach(v => {
      counts[v] = (counts[v] || 0) + 1;
    });
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }

  const yTop = yScale(threshold);
  const yMid = yScale(left.threshold);

  // definindo as regiões no domínio dos dados
  const reg_cima = data.filter(d => d.y > threshold);
  const reg_meio = data.filter(d => d.y <= threshold && d.y >= left.threshold);
  const reg_baixo = data.filter(d => d.y < left.threshold);

  const city_cima = moda(reg_cima.map(d => d.city));
  const city_meio = moda(reg_meio.map(d => d.city));
  const city_baixo = moda(reg_baixo.map(d => d.city));

  // retângulo da parte de cima (y > threshold)
  backgroundLayer.append('rect')
    .attr('x', area.xMin)
    .attr('y', area.yMin)
    .attr('width', area.xMax - area.xMin)
    .attr('height', yTop - area.yMin)
    .attr('fill', colorScale(city_cima))
    .attr('opacity', 0.3);

  // retângulo da parte do meio (left.threshold ≤ y ≤ threshold)
  backgroundLayer.append('rect')
    .attr('x', area.xMin)
    .attr('y', yTop)
    .attr('width', area.xMax - area.xMin)
    .attr('height', yMid - yTop)
    .attr('fill', colorScale(city_meio))
    .attr('opacity', 0.3);

  // retângulo da parte de baixo (y < left.threshold)
  backgroundLayer.append('rect')
    .attr('x', area.xMin)
    .attr('y', yMid)
    .attr('width', area.xMax - area.xMin)
    .attr('height', area.yMax - yMid)
    .attr('fill', colorScale(city_baixo))
    .attr('opacity', 0.3);

    // interatividade 
  // Criação do tooltip SVG
  const tooltip = svg.append('g')
    .style('display', 'none');


  const tooltipBox = tooltip.append('rect')
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

  // tooltip dos pontos
  svg.selectAll('circle')
    .on('mouseover', (event, d) => {
      // mostra tooltip
      tooltip.style('display', null); 
      d3.select(event.currentTarget)
        .attr('stroke', 'black')
        .attr('stroke-width', 1.5);
    })
    .on('mousemove', (event, d) => {
      const [mouseX, mouseY] = d3.pointer(event);

      tooltip
        .attr('transform', `translate(${mouseX + 10},${mouseY - 20})`);

      tooltip.select('.hover-line')
        .attr('x1', mouseX)
        .attr('x2', mouseX);

      tooltipText.text(`Median: ${d.y}`);
      tooltipText2.text(`Total rooms: ${d.x}`);

      tooltipBox
        .attr('x', 0)
        .attr('y', 0);
    })
    .on('mouseout', (event, d) => {
      tooltip.style('display', 'none');
      d3.select(event.currentTarget)
        .attr('stroke', null);
    });

  // Tooltip para densidade
  const densityTooltip = svg.append('g')
    .style('display', 'none');

  const densityBox = densityTooltip.append('rect')
    .attr('width', 160)
    .attr('height', cities.length * 20 + 10)
    .attr('fill', '#fefefe')
    .attr('stroke', '#ccc')
    .attr('rx', 5);

  const densityLines = cities.map((city, i) =>
    densityTooltip.append('text')
      .attr('x', 10)
      .attr('y', 20 + i * 18)
      .attr('font-size', 12)
      .attr('fill', colorScale(city))
  );
    //  Interação com curva de densidade no eixo X
    svg.append('rect')
    .attr('x', margin.left)
    .attr('y', margin.top - 60)
    .attr('width', width - margin.left - margin.right)
    .attr('height', 60)
    .attr('fill', 'transparent')
    .on('mousemove', event => {
      const [mouseX] = d3.pointer(event);
      const xVal = xScale.invert(mouseX);

      densityTooltip.style('display', null)
        .attr('transform', `translate(${mouseX + 10},${margin.top - 80})`);

      cities.forEach((city, i) => {
        const density = xDensity[city];
        const closest = density.reduce((a, b) =>
          Math.abs(b[0] - xVal) < Math.abs(a[0] - xVal) ? b : a
        );

        densityLines[i].text(`${city}: ${closest[1].toFixed(5)}`);
      });
    })
    .on('mouseout', () => {
      densityTooltip.style('display', 'none');
    });

  // Interação com curva de densidade no eixo Y
  svg.append('rect')
  .attr('x', width - margin.right)
  .attr('y', margin.top)
  .attr('width', 60)
  .attr('height', height - margin.top - margin.bottom)
  .attr('fill', 'transparent')
  .on('mousemove', event => {
    const [, mouseY] = d3.pointer(event);
    const yVal = yScale.invert(mouseY);

    densityTooltip.style('display', null)
      .attr('transform', `translate(${width - margin.right -100},${mouseY - 20})`);

    cities.forEach((city, i) => {
      const density = yDensity[city];
    const closest = density.reduce((a, b) =>
      Math.abs(b[0] - yVal) < Math.abs(a[0] - yVal) ? b : a
    );

    densityLines[i].text(`${city}: ${closest[1].toFixed(6)}`);
        });
      })
      .on('mouseout', () => {
        densityTooltip.style('display', 'none');
  });

  }

  export async function todosCortes() {
    // inicialização
    let xScale, yScale;
    let xTicks = [], yTicks = [];
    let data = [];
    let error = null;
    let colorScale;
    let cities = [];

    let xDensity = {};
    let yDensity = {};

  
  // selecionar o svg de visualização
  const svg = d3.select('.viz svg')
    .html('') // limpa conteúdo
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background', 'transparent');

  // camada de fundo
  const backgroundLayer = svg.append('g').lower();

  try {
    // Carrega e processa CSV
    const res = await fetch('/data/housing_limpo.csv');
    const text = await res.text();

    const lines = text.trim().split('\n');
    const headers = lines[0].trim().split(',');

    const xIndex = headers.indexOf(xKey);
    const yIndex = headers.indexOf(yKey);
    const cityIndex = headers.indexOf(cityKey);

    if (xIndex === -1 || yIndex === -1 || cityIndex === -1) {
      throw new Error(`Colunas "${xKey}", "${yKey}" ou "${cityKey}" não encontradas`);
    }

    data = lines.slice(1).map(line => {
      const cols = line.split(',');
      return {
        x: parseFloat(cols[xIndex]),
        y: parseFloat(cols[yIndex]),
        city: cols[cityIndex]?.trim()
      };
    }).filter(d => !isNaN(d.x) && !isNaN(d.y) && d.city);

    // valores horizontal e vertical
    const xValues = data.map(d => d.x);
    const yValues = data.map(d => d.y);

    // extremos das escalas
    const xMin = d3.min(xValues);
    const xMax = d3.max(xValues);
    const yMin = d3.min(yValues);
    const yMax = d3.max(yValues);

    xScale = d3.scaleLinear()
      .domain([xMin, xMax])
      .range([margin.left, width - margin.right]);

    yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([height - margin.bottom, margin.top]);

    xTicks = xScale.ticks(5);
    yTicks = yScale.ticks(5);

    cities = [...new Set(data.map(d => d.city))];
    colorScale = d3.scaleOrdinal()
      .domain(cities)
      .range(d3.schemeCategory10);

    // Densidade dos dados
    const kde = kernelDensityEstimator(kernelEpanechnikov(500), xScale.ticks(40));
    const kdeY = kernelDensityEstimator(kernelEpanechnikov(10000), yScale.ticks(40));
    cities.forEach(city => {
      const subset = data.filter(d => d.city === city);
      xDensity[city] = kde(subset.map(d => d.x));
      yDensity[city] = kdeY(subset.map(d => d.y));
    });

    // Pontos scatterplot
    svg.selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 3)
      .attr('fill', d => colorScale(d.city))
      .attr('opacity', 0.4);

    // Eixo X
    svg.append('line')
      .attr('x1', margin.left)
      .attr('y1', height - margin.bottom)
      .attr('x2', width - margin.right)
      .attr('y2', height - margin.bottom)
      .attr('stroke', 'black');

    svg.selectAll('xTicks')
      .data(xTicks)
      .join('line')
      .attr('x1', d => xScale(d))
      .attr('y1', height - margin.bottom)
      .attr('x2', d => xScale(d))
      .attr('y2', height - margin.bottom + 6)
      .attr('stroke', 'black');

    svg.selectAll('xTickLabels')
      .data(xTicks)
      .join('text')
      .attr('x', d => xScale(d))
      .attr('y', height - margin.bottom + 20)
      .attr('font-size', 10)
      .attr('text-anchor', 'middle')
      .text(d => Math.round(d));

    // Eixo Y
    svg.append('line')
      .attr('x1', margin.left)
      .attr('y1', margin.top)
      .attr('x2', margin.left)
      .attr('y2', height - margin.bottom)
      .attr('stroke', 'black');

    svg.selectAll('yTicks')
      .data(yTicks)
      .join('line')
      .attr('x1', margin.left)
      .attr('y1', d => yScale(d))
      .attr('x2', margin.left - 6)
      .attr('y2', d => yScale(d))
      .attr('stroke', 'black');

    svg.selectAll('yTickLabels')
      .data(yTicks)
      .join('text')
      .attr('x', margin.left - 10)
      .attr('y', d => yScale(d) + 3)
      .attr('font-size', 10)
      .attr('text-anchor', 'end')
      .text(d => Math.round(d));

    // Legendas dos eixos
    svg.append('text')
      .attr('x', (width + margin.left - margin.right) / 2)
      .attr('y', height - 50)
      .attr('font-size', 12)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .text('Total rooms');

    svg.append('text')
      .attr('transform', `translate(15, ${(height - margin.bottom + margin.top) / 2}) rotate(-90)`)
      .attr('font-size', 12)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .text('Median house value');

    // Legenda cores por cidade
    const legendX = width - margin.right - 150;
    const legendY = margin.top + 20;

    const legend = svg.append('g')
      .attr('transform', `translate(${legendX},${legendY})`);

    cities.forEach((city, i) => {
      const g = legend.append('g')
        .attr('transform', `translate(0,${i * 20})`);

      g.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', colorScale(city));

      g.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .attr('font-size', 12)
        .text(city);
    });

    // Densidade no topo (X)
    cities.forEach((city, i) => {
      svg.append('path')
        .attr('d', d3.line()
          .x(d => xScale(d[0]))
          .y(d => margin.top - d[1] * 200000)(xDensity[city])
        )
        .attr('fill', 'none')
        .attr('stroke', i === 0 ? 'steelblue' : 'coral')
        .attr('stroke-width', 2);
    });

    // Densidade na direita (Y)
    cities.forEach((city, i) => {
      svg.append('path')
        .attr('d', d3.line()
          .x(d => width - margin.right + d[1] * 5000000)
          .y(d => yScale(d[0]))(yDensity[city])
        )
        .attr('fill', 'none')
        .attr('stroke', i === 0 ? 'steelblue' : 'coral')
        .attr('stroke-width', 2);
    });

    // Carrega a árvore de cortes
    const treeRes = await fetch('/trees/cortes_2d.json');
    const cortes = await treeRes.json();

    // Domínio dos dados
    const bbox = {
      x0: xMin,
      y0: yMin,
      x1: xMax,
      y1: yMax
    };
  
  // desenhar os cortes recursivamente e destaca a classe mais prevista
  function desenharCortes(bbox, node) {
    if (!node) return;

    const feature = node.feature;
    const threshold = +node.threshold;

    // Se for folha
    if (!node.left && !node.right) {
      const dadosNaRegiao = data.filter(d =>
        d.x >= bbox.x0 && d.x <= bbox.x1 &&
        d.y >= bbox.y0 && d.y <= bbox.y1
      );

      if (dadosNaRegiao.length > 0) {
        // Conta quantos pontos de cada cidade
        const contagem = {};
        dadosNaRegiao.forEach(d => {
          contagem[d.city] = (contagem[d.city] || 0) + 1;
        });

        // Determina cidade majoritária
        const cidadeMajoritaria = Object.entries(contagem)
          .sort((a, b) => b[1] - a[1])[0][0];

        // Desenha retângulo da região com cor da cidade
        backgroundLayer.append("rect")
          .attr("x", xScale(bbox.x0))
          .attr("y", yScale(bbox.y1)) // y1 é o topo
          .attr("width", xScale(bbox.x1) - xScale(bbox.x0))
          .attr("height", yScale(bbox.y0) - yScale(bbox.y1)) // y0 é o fundo
          .attr("fill", colorScale(cidadeMajoritaria))
          .attr("opacity", 0.3); // transparência para não apagar pontos
      }
    return;
  }

    // corte vertical
    if (feature === "feature 0") { 
    if (!(bbox.x0 < threshold && threshold < bbox.x1)) return;

    const x = xScale(threshold);

    // Linha de corte
    svg.append("line")
      .attr("class", "cut-line")
      .attr("x1", x).attr("x2", x)
      .attr("y1", yScale(bbox.y0))
      .attr("y2", yScale(bbox.y1))
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    // Grupo do tooltip
    const cutLineTooltip = svg.append('g')
      .style('display', 'none');

    const tooltipBox = cutLineTooltip.append('rect')
      .attr('width', 180)
      .attr('height', 24)
      .attr('fill', '#f9f9f9')
      .attr('stroke', '#999')
      .attr('rx', 4)
      .attr('ry', 4);

    const tooltipText = cutLineTooltip.append('text')
      .attr('x', 8)
      .attr('y', 16)
      .attr('font-size', 12)
      .attr('fill', '#333');

    // Área sensível ao mouse (estreita, sobre a linha de corte)
    svg.append('rect')
    .attr('x', x - 5)
    .attr('y', Math.min(yScale(bbox.y0), yScale(bbox.y1)))
    .attr('width', 10)
    .attr('height', Math.abs(yScale(bbox.y1) - yScale(bbox.y0)))
    .attr('fill', 'transparent')
    .on('mouseover', () => {
      cutLineTooltip.style('display', null);
    })
    .on('mousemove', event => {
      const [mouseX, mouseY] = d3.pointer(event);
      cutLineTooltip
        .attr('transform', `translate(${mouseX + 10},${mouseY - 30})`);
      tooltipText.text(`Median house value: ${threshold.toFixed(2)}`);
    })
    .on('mouseout', () => {
      cutLineTooltip.style('display', 'none');
    });


  desenharCortes({ x0: bbox.x0, y0: bbox.y0, x1: threshold, y1: bbox.y1 }, node.left);
  desenharCortes({ x0: threshold, y0: bbox.y0, x1: bbox.x1, y1: bbox.y1 }, node.right);
}
// corte horizontal
 else if (feature === "feature 1") { 
      if (!(bbox.y0 < threshold && threshold < bbox.y1)) return;

      const y = yScale(threshold);
      svg.append("line")
        .attr("class", "cut-line")
        .attr("x1", xScale(bbox.x0)).attr("x2", xScale(bbox.x1))
        .attr("y1", y).attr("y2", y)
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    // Tooltip para a linha de corte
    const cutLineTooltip = svg.append('g')
      .style('display', 'none');

    const tooltipBox = cutLineTooltip.append('rect')
      .attr('width', 170)
      .attr('height', 24)
      .attr('fill', '#f9f9f9')
      .attr('stroke', '#999')
      .attr('rx', 4);

    const tooltipText = cutLineTooltip.append('text')
      .attr('x', 6)
      .attr('y', 16)
      .attr('font-size', 12)
      .attr('fill', '#333');

      svg.append('rect')
      .attr('x', margin.left)
      .attr('y', yScale(threshold) - 5)
      .attr('width', width - margin.left - margin.right)
      .attr('height', 10)
      .attr('fill', 'transparent')
      .on('mouseover', () => {
        cutLineTooltip.style('display', null);
      })
      .on('mousemove', event => {
        const [mouseX, mouseY] = d3.pointer(event);
        cutLineTooltip.attr('transform', `translate(${mouseX + 10},${mouseY - 20})`);
        tooltipText.text(`Median house value: ${threshold}`);
      })
      .on('mouseout', () => {
        cutLineTooltip.style('display', 'none');
      });

      desenharCortes({ x0: bbox.x0, y0: bbox.y0, x1: bbox.x1, y1: threshold }, node.left);
      desenharCortes({ x0: bbox.x0, y0: threshold, x1: bbox.x1, y1: bbox.y1 }, node.right);
    }
  }

  desenharCortes(bbox, cortes);


  } catch (e) {
    error = e.message;
  }

  // interatividade 
  // Criação do tooltip SVG
  const tooltip = svg.append('g')
    .style('display', 'none');


  const tooltipBox = tooltip.append('rect')
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

  // tooltip dos pontos
  svg.selectAll('circle')
    .on('mouseover', (event, d) => {
      // mostra tooltip
      tooltip.style('display', null); 
      d3.select(event.currentTarget)
        .attr('stroke', 'black')
        .attr('stroke-width', 1.5);
    })
    .on('mousemove', (event, d) => {
      const [mouseX, mouseY] = d3.pointer(event);

      tooltip
        .attr('transform', `translate(${mouseX + 10},${mouseY - 20})`);

      tooltip.select('.hover-line')
        .attr('x1', mouseX)
        .attr('x2', mouseX);

      tooltipText.text(`Median: ${d.y}`);
      tooltipText2.text(`Total rooms: ${d.x}`);

      tooltipBox
        .attr('x', 0)
        .attr('y', 0);
    })
    .on('mouseout', (event, d) => {
      tooltip.style('display', 'none');
      d3.select(event.currentTarget)
        .attr('stroke', null);
    });

  // Tooltip para densidade
  const densityTooltip = svg.append('g')
    .style('display', 'none');

  const densityBox = densityTooltip.append('rect')
    .attr('width', 160)
    .attr('height', cities.length * 20 + 10)
    .attr('fill', '#fefefe')
    .attr('stroke', '#ccc')
    .attr('rx', 5);

  const densityLines = cities.map((city, i) =>
    densityTooltip.append('text')
      .attr('x', 10)
      .attr('y', 20 + i * 18)
      .attr('font-size', 12)
      .attr('fill', colorScale(city))
  );
    //  Interação com curva de densidade no eixo X
    svg.append('rect')
    .attr('x', margin.left)
    .attr('y', margin.top - 60)
    .attr('width', width - margin.left - margin.right)
    .attr('height', 60)
    .attr('fill', 'transparent')
    .on('mousemove', event => {
      const [mouseX] = d3.pointer(event);
      const xVal = xScale.invert(mouseX);

      densityTooltip.style('display', null)
        .attr('transform', `translate(${mouseX + 10},${margin.top - 80})`);

      cities.forEach((city, i) => {
        const density = xDensity[city];
        const closest = density.reduce((a, b) =>
          Math.abs(b[0] - xVal) < Math.abs(a[0] - xVal) ? b : a
        );

        densityLines[i].text(`${city}: ${closest[1].toFixed(5)}`);
      });
    })
    .on('mouseout', () => {
      densityTooltip.style('display', 'none');
    });

  // Interação com curva de densidade no eixo Y
  svg.append('rect')
  .attr('x', width - margin.right)
  .attr('y', margin.top)
  .attr('width', 60)
  .attr('height', height - margin.top - margin.bottom)
  .attr('fill', 'transparent')
  .on('mousemove', event => {
    const [, mouseY] = d3.pointer(event);
    const yVal = yScale.invert(mouseY);

    densityTooltip.style('display', null)
      .attr('transform', `translate(${width - margin.right -100},${mouseY - 20})`);

    cities.forEach((city, i) => {
      const density = yDensity[city];
    const closest = density.reduce((a, b) =>
      Math.abs(b[0] - yVal) < Math.abs(a[0] - yVal) ? b : a
    );

    densityLines[i].text(`${city}: ${closest[1].toFixed(6)}`);
        });
      })
      .on('mouseout', () => {
        densityTooltip.style('display', 'none');
  });
  }


  const renderFunctions = [
    scatterDensity,         // Gráfico 0: com densidade
    corte1,     // Gráfico 1: um corte
    corte2,     // Gráfico 2: dois cortes
    todosCortes      // Gráfico 3: todos os cortes preenchidos
  ];

  let containerEl;

  onMount(() => {
    renderFunctions[currentStep](containerEl);

    const observer = new IntersectionObserver(
      (entries) => {
         // Callback chamado sempre que um "step" entra ou sai da viewport
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Verifica se o elemento está visível na tela
            const index = stepRefs.findIndex((el) => el === entry.target);
            if (index !== -1 && index !== currentStep) {
              // Atualiza o step atual para mudar a visualização
              currentStep = index;
              renderFunctions[currentStep](containerEl);
            }
          }
        });
      },
      { 
        // Define o quanto do elemento precisa estar visível (50%) para ser considerado "visível"
        threshold: 0.7,  
      }
    );

    stepRefs.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  });
</script>

<div class="scroll-container">
  <!-- Coluna com o conteúdo textual rolável -->
  <div class="steps">
    {#each [0, 1, 2, 3] as stepIndex}
      <div
        class="step"
        bind:this={stepRefs[stepIndex]}
        class:active={stepIndex === currentStep}
      >
        <h3>Etapa {stepIndex + 1}</h3>
        <p>Texto para a etapa Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus delectus aliquid voluptates commodi maxime iure, quam aut consectetur voluptatum, porro laborum voluptas incidunt illum earum pariatur repellat numquam debitis eum? {stepIndex + 1}.</p>
      <p>Texto para a etapa Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus delectus aliquid voluptates commodi maxime iure, quam aut consectetur voluptatum, porro laborum voluptas incidunt illum earum pariatur repellat numquam debitis eum? {stepIndex + 1}.</p>
      <p>Texto para a etapa Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus delectus aliquid voluptates commodi maxime iure, quam aut consectetur voluptatum, porro laborum voluptas incidunt illum earum pariatur repellat numquam debitis eum? {stepIndex + 1}.</p>
      <p>Texto para a etapa Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus delectus aliquid voluptates commodi maxime iure, quam aut consectetur voluptatum, porro laborum voluptas incidunt illum earum pariatur repellat numquam debitis eum? {stepIndex + 1}.</p>
      
      </div>
    {/each}
  </div>

  <div class="viz">
    <div bind:this={containerEl}></div>
    <svg width=700 height=650></svg>
  </div>
</div>

<style>
  .scroll-container {
    display: flex;
    position: relative;
    gap: 2rem;
    margin-bottom: 10rem; 
    margin-top: 10rem;   
  }

  .steps {
    width: 40%;
    padding: 2rem;
    /* overflow-y: auto; */
  }

  .viz {
    width: 60%;
    position: sticky;
    top: 72px;
    height: calc(100vh - 72px);
    background: var(--color-background-viz-light);      /* ← cor de fundo do site inteiro */
;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .step {
    margin: 3rem 0;
    padding: 1rem;
    border-left: 4px solid #ccc;
    transition: border-color 0.3s ease;
  }

  .step.active {
    border-color: #7b2291;
    font-weight: bold;
  } 
</style>

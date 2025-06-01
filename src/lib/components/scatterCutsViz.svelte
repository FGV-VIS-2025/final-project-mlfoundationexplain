<script>
  import * as d3 from 'd3';
  export async function todosCortes(maxCortes, svgElem, width, height, margin) {
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
const svg = d3.select(svgElem)
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
    .attr('stroke', 'var(--color-text)');

  svg.selectAll('xTicks')
    .data(xTicks)
    .join('line')
    .attr('x1', d => xScale(d))
    .attr('y1', height - margin.bottom)
    .attr('x2', d => xScale(d))
    .attr('y2', height - margin.bottom + 6)
    .attr('stroke', 'var(--color-text)');

  svg.selectAll('xTickLabels')
    .data(xTicks)
    .join('text')
    .attr('fill', 'var(--color-text)')
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
    .attr('stroke', 'var(--color-text)');

  svg.selectAll('yTicks')
    .data(yTicks)
    .join('line')
    .attr('x1', margin.left)
    .attr('y1', d => yScale(d))
    .attr('x2', margin.left - 6)
    .attr('y2', d => yScale(d))
    .attr('stroke', 'var(--color-text)');

  svg.selectAll('yTickLabels')
    .data(yTicks)
    .join('text')
    .attr('fill', 'var(--color-text)')
    .attr('x', margin.left - 10)
    .attr('y', d => yScale(d) + 3)
    .attr('font-size', 10)
    .attr('text-anchor', 'end')
    .text(d => Math.round(d));

  // Legendas dos eixos
  svg.append('text')
    .attr('fill', 'var(--color-text)')
    .attr('x', (width + margin.left - margin.right) / 2)
    .attr('y', height - 50)
    .attr('font-size', 12)
    .attr('text-anchor', 'middle')
    .attr('font-weight', 'bold')
    .text('Total rooms');

  svg.append('text')
    .attr('fill', 'var(--color-text)')
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
      .attr('fill', 'var(--color-text)')
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

  // const maxCortes = 7
   const treeRes = await fetch('/trees/cortes_2d.json');
const cortes = await treeRes.json();

const bboxInicial = {
  x0: xMin,
  y0: yMin,
  x1: xMax,
  y1: yMax
};

// NOVA versão da função que desenha os cortes em ordem BFS
function desenharCortesBFS(bboxInicial, root, maxCortes) {
  const fila = [{ bbox: bboxInicial, node: root }];
  let cortesFeitos = 0;

  // Grupo do tooltip
  const cutLineTooltip = svg.append('g')
    .style('display', 'none');

  const tooltipBox = cutLineTooltip.append('rect')
    .attr('width', 200)
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

  while (fila.length > 0 && cortesFeitos < maxCortes) {
    const { bbox, node } = fila.shift();
    if (!node) continue;

    const feature = node.feature;
    const threshold = +node.threshold;

    // Se for folha, desenhar retângulo com a classe majoritária
    if (!node.left && !node.right) {
      const dadosNaRegiao = data.filter(d =>
        d.x >= bbox.x0 && d.x <= bbox.x1 &&
        d.y >= bbox.y0 && d.y <= bbox.y1
      );

      if (dadosNaRegiao.length > 0) {
        const contagem = {};
        dadosNaRegiao.forEach(d => {
          contagem[d.city] = (contagem[d.city] || 0) + 1;
        });

        const cidadeMajoritaria = Object.entries(contagem)
          .sort((a, b) => b[1] - a[1])[0][0];

        backgroundLayer.append("rect")
          .attr("x", xScale(bbox.x0))
          .attr("y", yScale(bbox.y1))
          .attr("width", xScale(bbox.x1) - xScale(bbox.x0))
          .attr("height", yScale(bbox.y0) - yScale(bbox.y1))
          .attr("fill", colorScale(cidadeMajoritaria))
          .attr("opacity", 0.3);
      }

      continue;
    }

    // Cortes internos
    if (feature === "feature 0") {
      if (!(bbox.x0 < threshold && threshold < bbox.x1)) continue;
      const x = xScale(threshold);
      svg.append("line")
        .attr("x1", x).attr("x2", x)
        .attr("y1", yScale(bbox.y0))
        .attr("y2", yScale(bbox.y1))
        .attr("stroke", "var(--color-text)")
        .attr("stroke-width", 2);

      // Área sensível ao mouse
      svg.append('rect')
        .attr('x', x - 5)
        .attr('y', yScale(Math.max(bbox.y0, bbox.y1)))
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
          tooltipText.text(`${xKey}: ${threshold.toFixed(2)}`);
        })
        .on('mouseout', () => {
          cutLineTooltip.style('display', 'none');
        });
      cortesFeitos++;

      fila.push({
        bbox: { x0: bbox.x0, x1: threshold, y0: bbox.y0, y1: bbox.y1 },
        node: node.left
      });
      fila.push({
        bbox: { x0: threshold, x1: bbox.x1, y0: bbox.y0, y1: bbox.y1 },
        node: node.right
      });
    } else if (feature === "feature 1") {
      if (!(bbox.y0 < threshold && threshold < bbox.y1)) continue;
      const y = yScale(threshold);
      svg.append("line")
        .attr("x1", xScale(bbox.x0)).attr("x2", xScale(bbox.x1))
        .attr("y1", y).attr("y2", y)
        .attr("stroke", "var(--color-text)")
        .attr("stroke-width", 2);
        // Área sensível ao mouse
      svg.append('rect')
        .attr('x', xScale(bbox.x0))
        .attr('y', y - 5)
        .attr('width', Math.abs(xScale(bbox.x1) - xScale(bbox.x0)))
        .attr('height', 10)
        .attr('fill', 'transparent')
        .on('mouseover', () => {
          cutLineTooltip.style('display', null);
        })
        .on('mousemove', event => {
          const [mouseX, mouseY] = d3.pointer(event);
          cutLineTooltip
            .attr('transform', `translate(${mouseX + 10},${mouseY - 30})`);
          tooltipText.text(`${yKey}: ${threshold.toFixed(2)}`);
        })
        .on('mouseout', () => {
          cutLineTooltip.style('display', 'none');
        });
      cortesFeitos++;

      fila.push({
        bbox: { x0: bbox.x0, x1: bbox.x1, y0: bbox.y0, y1: threshold },
        node: node.left
      });
      fila.push({
        bbox: { x0: bbox.x0, x1: bbox.x1, y0: threshold, y1: bbox.y1 },
        node: node.right
      });
    }
  }

  // Após parar por limite de cortes, pintar todas regiões restantes com a classe majoritária
fila.forEach(({ bbox, node }) => {
if (!node) return;

const dadosNaRegiao = data.filter(d =>
  d.x >= bbox.x0 && d.x <= bbox.x1 &&
  d.y >= bbox.y0 && d.y <= bbox.y1
);

if (dadosNaRegiao.length === 0) return;

const contagem = {};
dadosNaRegiao.forEach(d => {
  contagem[d.city] = (contagem[d.city] || 0) + 1;
});

const cidadeMajoritaria = Object.entries(contagem)
  .sort((a, b) => b[1] - a[1])[0][0];

backgroundLayer.append("rect")
  .attr("x", xScale(bbox.x0))
  .attr("y", yScale(bbox.y1))
  .attr("width", xScale(bbox.x1) - xScale(bbox.x0))
  .attr("height", yScale(bbox.y0) - yScale(bbox.y1))
  .attr("fill", colorScale(cidadeMajoritaria))
  .attr("opacity", 0.3);
});
}

desenharCortesBFS(bboxInicial, cortes, maxCortes);


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
</script>
<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  // Propriedades do componente
  export let width = 800;
  export let height = 400;
  export let minPrice = 187518;
  export let maxPrice = 27500000;
  export let dotRadius = 4;
  export let initialCutoff = 3145000;
  export let dataCount = 200;

  let svg;
  let data = [];
  let cutoffPrice = initialCutoff;
  let formattedPrice = '';

  const margin = { top: 40, right: 40, bottom: 80, left: 100 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Escalas
  const xScale = d3.scaleLinear()
    .domain([minPrice, maxPrice])
    .range([0, chartWidth]);

  const yScale = d3.scaleLinear()
    .range([chartHeight, 0]);

  // Gerar dados
  function generateData() {
    data = [];
    
    // Gerar dados com distribuição variada
    for (let i = 0; i < dataCount; i++) {
      let price;
      if (i < dataCount * 0.3) {
        // 30% em faixa baixa
        price = minPrice + (maxPrice - minPrice) * 0.3 * Math.random();
      } else if (i < dataCount * 0.7) {
        // 40% em faixa média
        price = minPrice + (maxPrice - minPrice) * (0.3 + 0.4 * Math.random());
      } else {
        // 30% em faixa alta
        price = minPrice + (maxPrice - minPrice) * (0.7 + 0.3 * Math.random());
      }
      
      data.push({
        price: price,
        id: i
      });
    }
  }

  function getPlotPoints() {
    if (!data || data.length === 0) {
      return [];
    }
    
    const points = data.map((d, i) => {
      // Posição X baseada no preço
      const x = xScale(d.price);
      
      // Posição Y aleatória com certa distribuição
      const randomY = Math.random() * (chartHeight - 20) + 10;
      
      return {
        ...d,
        x: x,
        y: randomY,
        belowCutoff: d.price < cutoffPrice
      };
    });
    
    return points;
  }

  let isDragging = false;

  function handleMouseDown(event) {
    isDragging = true;
    handleDrag(event);
    
    function handleMouseMove(event) {
      if (isDragging) {
        handleDrag(event);
      }
    }
    
    function handleMouseUp() {
      isDragging = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  function handleDrag(event) {
    if (!svg) return;
    
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left - margin.left;
    const constrainedX = Math.max(0, Math.min(chartWidth, x));
    const newPrice = xScale.invert(constrainedX);
    cutoffPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));
    updateFormattedPrice();
  }

  function updateFormattedPrice() {
    formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(cutoffPrice);
  }

  // Eixos
  function getXTicks() {
    return xScale.ticks(8).map(tick => ({
      value: tick,
      x: xScale(tick),
      label: `$${(tick / 1000000).toFixed(1)}M`
    }));
  }

  function getYTicks() {
    return yScale.ticks(6).map(tick => ({
      value: tick,
      y: yScale(tick),
      label: tick.toString()
    }));
  }

  // Variáveis reativas
  let plotPoints = [];
  
  // Reativos
  $: cutoffX = xScale(cutoffPrice);
  $: xTicks = getXTicks();
  $: yTicks = getYTicks();
  $: plotPoints = data.length > 0 ? getPlotPoints() : [];
  
  // Calcular posição do tooltip para que apareça à esquerda ou direita
  $: tooltipOnRight = cutoffX < chartWidth / 2;
  $: tooltipX = tooltipOnRight ? cutoffX + 15 : cutoffX - 15;
  $: tooltipAnchor = tooltipOnRight ? "start" : "end";

  onMount(() => {
    generateData();
    updateFormattedPrice();
  });
</script>

<div class="chart-container">
  <svg bind:this={svg} {width} {height}>
    <g transform="translate({margin.left},{margin.top})">
      <!-- Eixos -->
      <!-- Eixo X -->
      <g class="axis" transform="translate(0,{chartHeight})">
        <line x1="0" y1="0" x2={chartWidth} y2="0" stroke="#666" stroke-width="1"/>
        {#each xTicks as tick}
          <g transform="translate({tick.x},0)">
            <line y1="0" y2="6" stroke="#666"/>
            <text y="20" text-anchor="middle" class="tick-label">{tick.label}</text>
          </g>
        {/each}
      </g>
      
      <!-- Eixo Y -->
      <g class="axis">
        <line x1="0" y1="0" x2="0" y2={chartHeight} stroke="#666" stroke-width="1"/>
        {#each yTicks as tick}
          <g transform="translate(0,{tick.y})">
            <line x1="-6" x2="0" stroke="#666"/>
            <text x="-10" dy="0.35em" text-anchor="end" class="tick-label">{tick.label}</text>
          </g>
        {/each}
      </g>
      
      <!-- Etiquetas de ejes -->
      <text 
        x={chartWidth / 2} 
        y={chartHeight + 50} 
        text-anchor="middle" 
        class="axis-label"
      >
        Precio
      </text>
      
      <text 
        x={-chartHeight / 2} 
        y="-60" 
        text-anchor="middle" 
        class="axis-label"
        transform="rotate(-90)"
      >
        Frecuencia
      </text>
      
      <!-- Puntos del scatter plot -->
      {#each plotPoints as point, i}
        <circle
          cx={point.x}
          cy={point.y}
          r={dotRadius}
          fill={point.belowCutoff ? '#007bff' : '#28a745'}
          stroke="white"
          stroke-width="1"
          class="dot"
          opacity="0.8"
        />
      {/each}
      
      <!-- Línea de corte -->
      <line
        x1={cutoffX}
        y1="0"
        x2={cutoffX}
        y2={chartHeight}
        stroke="#28a745"
        stroke-width="2"
        stroke-dasharray="5,5"
        class="cutoff-line"
      />
      
      <!-- Handle de la línea de corte -->
      <circle
        cx={cutoffX}
        cy="-15"
        r="8"
        fill="#28a745"
        stroke="white"
        stroke-width="2"
        class="cutoff-handle"
        on:mousedown={handleMouseDown}
      />
      
      <!-- Tooltip del precio -->
      <g class="price-tooltip" transform="translate({tooltipX}, -35)">
        <rect
          x={tooltipOnRight ? "5" : "-95"}
          y="-15"
          width="90"
          height="20"
          rx="3"
          fill="rgba(40, 167, 69, 0.9)"
          stroke="white"
          stroke-width="1"
        />
        <text
          x={tooltipOnRight ? "50" : "-50"}
          y="-1"
          text-anchor={tooltipAnchor}
          fill="white"
          font-size="12"
          font-weight="bold"
        >
          price &lt; {formattedPrice}
        </text>
        <!-- Flecha que apunta al cutoff -->
        <polygon
          points={tooltipOnRight ? "0,-1 6,-1 3,5" : "0,-1 -6,-1 -3,5"}
          fill="rgba(40, 167, 69, 0.9)"
        />
      </g>
    </g>
  </svg>
</div>

<style>
  .chart-container {
    font-family: Arial, sans-serif;
    margin: 20px 0;
    user-select: none;
  }

  .axis {
    font-size: 12px;
  }

  .tick-label {
    font-size: 12px;
    fill: #666;
  }

  .axis-label {
    font-size: 14px;
    fill: #333;
  }

  .dot {
    cursor: pointer;
    transition: r 0.2s ease;
  }

  .dot:hover {
    r: 6;
  }

  .cutoff-line {
    pointer-events: none;
  }

  .cutoff-handle {
    cursor: ew-resize;
    transition: r 0.2s ease;
  }

  .cutoff-handle:hover {
    r: 10;
  }

  .price-tooltip {
    pointer-events: none;
  }
</style>
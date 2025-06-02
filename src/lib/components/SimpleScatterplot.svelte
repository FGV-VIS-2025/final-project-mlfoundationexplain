<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  // Propriedades do componente
  export let width = 800;
  export let height = 400;
  export let dotRadius = 4;
  export let data = []; // Array de valores numéricos
  export let bins = 20; // Número de bins para cálculo de frequência
  export let initialCutoffPercentile = 0.5; // Cutoff inicial como percentil (0-1)

  let svg;
  let cutoffValue = 0;
  let formattedCutoff = '';

  const margin = { top: 40, right: 40, bottom: 80, left: 100 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Variáveis reativas para escalas
  let xScale, yScale;
  let plotPoints = [];
  let minValue = 0, maxValue = 0;

  // Calcular dados de frequência a partir do array numérico
  function calculateFrequencies() {
    if (!data || data.length === 0) return [];

    minValue = d3.min(data);
    maxValue = d3.max(data);
    
    // Criar bins do histograma
    const histogram = d3.histogram()
      .domain([minValue, maxValue])
      .thresholds(bins);
    
    const binData = histogram(data);
    
    // Converter bins em pontos do scatter plot
    const points = [];
    binData.forEach((bin, binIndex) => {
      const binCenter = (bin.x0 + bin.x1) / 2;
      const frequency = bin.length;
      
      // Criar múltiplos pontos para cada bin baseado na frequência
      for (let i = 0; i < frequency; i++) {
        points.push({
          value: binCenter,
          frequency: frequency,
          binIndex: binIndex,
          pointIndex: i,
          id: `${binIndex}-${i}`
        });
      }
    });
    
    return points;
  }

  // Atualizar escalas e pontos do gráfico
  function updateVisualization() {
    if (!data || data.length === 0) return;

    const frequencies = calculateFrequencies();
    const maxFrequency = d3.max(frequencies, d => d.frequency) || 1;

    // Atualizar escalas
    xScale = d3.scaleLinear()
      .domain([minValue, maxValue])
      .range([0, chartWidth]);

    yScale = d3.scaleLinear()
      .domain([0, maxFrequency + 1])
      .range([chartHeight, 0]);

    // Calcular posições dos pontos
    plotPoints = frequencies.map(d => {
      const x = xScale(d.value);
      // Empilhar pontos verticalmente baseado no índice dentro do bin
      // Começar do y = 1 para evitar sobreposição com o eixo
      const baseY = d.pointIndex + 1;
      const y = yScale(baseY) + (Math.random() - 0.5) * 2; // Pequeno jitter para visibilidade
      
      return {
        ...d,
        x: x,
        y: y,
        belowCutoff: d.value < cutoffValue
      };
    });

    // Definir cutoff inicial se não estiver definido
    if (cutoffValue === 0) {
      const sortedData = [...data].sort((a, b) => a - b);
      cutoffValue = sortedData[Math.floor(sortedData.length * initialCutoffPercentile)];
      updateFormattedCutoff();
    }

    // Força a atualização dos ticks após as escalas estarem prontas
    xTicks = getXTicks();
    yTicks = getYTicks();
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
    if (!svg || !xScale) return;
    
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left - margin.left;
    const constrainedX = Math.max(0, Math.min(chartWidth, x));
    const newValue = xScale.invert(constrainedX);
    cutoffValue = Math.max(minValue, Math.min(maxValue, newValue));
    updateFormattedCutoff();
  }

  function updateFormattedCutoff() {
    formattedCutoff = cutoffValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  // Função para formatar valores com K quando > 10000
  function formatValue(value) {
    if (value >= 10000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  }

  // Eixos
  function getXTicks() {
    if (!xScale) return [];
    return xScale.ticks(8).map(tick => ({
      value: tick,
      x: xScale(tick),
      label: formatValue(tick)
    }));
  }

  function getYTicks() {
    if (!yScale) return [];
    return yScale.ticks(6).map(tick => ({
      value: tick,
      y: yScale(tick),
      label: tick.toString()
    }));
  }

  // Variáveis reativas
  let xTicks = [];
  let yTicks = [];
  
  // Reativos
  $: if (data && data.length > 0) {
    updateVisualization();
  }
  $: cutoffX = xScale ? xScale(cutoffValue) : 0;
  $: if (xScale) {
    xTicks = getXTicks();
  }
  $: if (yScale) {
    yTicks = getYTicks();
  }
  
  // Calcular posição do tooltip para que apareça à esquerda ou direita
  $: tooltipOnRight = cutoffX < chartWidth / 2;
  $: tooltipX = tooltipOnRight ? cutoffX + 15 : cutoffX - 15;
  $: tooltipAnchor = tooltipOnRight ? "start" : "end";

  onMount(() => {
    if (data && data.length > 0) {
      updateVisualization();
    }
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
      
      <!-- Etiquetas de eixos -->
      <text 
        x={chartWidth / 2} 
        y={chartHeight + 50} 
        text-anchor="middle" 
        class="axis-label"
      >
        Valor
      </text>
      
      <text 
        x={-chartHeight / 2} 
        y="-60" 
        text-anchor="middle" 
        class="axis-label"
        transform="rotate(-90)"
      >
        Frequência
      </text>
      
      <!-- Pontos do scatter plot -->
      {#each plotPoints as point}
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
      
      <!-- Linha de corte -->
      {#if xScale}
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
        
        <!-- Handle da linha de corte -->
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
        
        <!-- Tooltip do valor de corte -->
        <g class="price-tooltip" transform="translate({tooltipX}, -35)">
          <rect
            x={tooltipOnRight ? "5" : "-120"}
            width="115"
            height="20"
            y="-15"
            rx="3"
            fill="rgba(40, 167, 69, 0.9)"
            stroke="white"
            stroke-width="1"
          />
          <text
            x={tooltipOnRight ? "62" : "-62"}
            y="-1"
            text-anchor="middle"
            fill="white"
            font-size="12"
            font-weight="bold"
          >
            valor &lt; {formattedCutoff}
          </text>
          <!-- Seta que aponta para o cutoff -->
          <polygon
            points={tooltipOnRight ? "0,-1 6,-1 3,5" : "0,-1 -6,-1 -3,5"}
            fill="rgba(40, 167, 69, 0.9)"
          />
        </g>
      {/if}
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
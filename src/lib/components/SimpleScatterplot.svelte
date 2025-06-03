<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";

  // Propriedades do componente
  export let width = 800;
  export let height = 400;
  export let dotRadius = 4;
  export let data = []; // Array de objetos completos do CSV
  export let feature = ""; // Feature a visualizar
  export let axisLabel = "";
  export let bins = 20;
  export let initialCutoffPercentile = 0.5;
  export let initialCutoffValue = null; // Valor específico de corte inicial

  let svg;
  let cutoffValue = 0;
  let formattedCutoff = "";
  let hoveredPoint = null;
  let mousePosition = { x: 0, y: 0 };

  const margin = { top: 40, right: 40, bottom: 80, left: 100 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Variáveis reativas
  let xScale, yScale;
  let plotPoints = [];
  let minValue = 0,
    maxValue = 0;

  // Processar dados por feature
  function processDataPoints() {
    if (!data || data.length === 0 || !feature) return [];

    // Filtrar dados válidos
    const validData = data.filter(
      (d) => d[feature] && !isNaN(Number(d[feature]))
    );

    // Extrair valores da feature
    const featureValues = validData.map((d) => Number(d[feature]));
    minValue = d3.min(featureValues);
    maxValue = d3.max(featureValues);

    // Criar bins para frequência
    const histogram = d3
      .histogram()
      .domain([minValue, maxValue])
      .thresholds(bins);

    const binData = histogram(featureValues);

    // Mapear cada registro original para um ponto
    const points = [];
    validData.forEach((record, index) => {
      const value = Number(record[feature]);
      // Encontrar bin correspondente
      const binIndex =
        binData.findIndex((bin) => value >= bin.x0 && value < bin.x1) || 0;
      const bin = binData[binIndex];

      points.push({
        originalData: record,
        value: value,
        city: record.city,
        binIndex: binIndex,
        frequency: bin ? bin.length : 1,
        id: record.id || index,
      });
    });

    return points;
  }

  // Atualizar escalas e pontos do gráfico
  function updateVisualization() {
    if (!data || data.length === 0) return;

    const frequencies = processDataPoints();
    const maxFrequency = d3.max(frequencies, (d) => d.frequency) || 1;

    // Atualizar escalas
    xScale = d3
      .scaleLinear()
      .domain([minValue, maxValue])
      .range([0, chartWidth]);

    yScale = d3
      .scaleLinear()
      .domain([0, maxFrequency + 1])
      .range([chartHeight, 0]);

    // Calcular posições dos pontos
    plotPoints = frequencies.map((d, index) => {
      const x = xScale(d.value);
      // Empilhar pontos verticalmente baseado no índice dentro do bin
      const sameValueCount = frequencies.filter(
        (p) => p.binIndex === d.binIndex
      ).length;
      const indexInBin = frequencies.filter(
        (p, i) => p.binIndex === d.binIndex && i <= index
      ).length;
      const baseY = indexInBin;
      const y = yScale(baseY) + (Math.random() - 0.5) * 2; // Pequeno jitter

      return {
        ...d,
        x: x,
        y: y,
        belowCutoff: d.value < cutoffValue,
      };
    });

    // Sempre definir cutoff quando recalcular (para garantir que mude com a feature)
    if (initialCutoffValue !== null) {
      // Usar valor específico se fornecido
      cutoffValue = Math.max(minValue, Math.min(maxValue, initialCutoffValue));
    } else {
      // Usar percentil se não houver valor específico
      const sortedValues = frequencies
        .map((d) => d.value)
        .sort((a, b) => a - b);
      cutoffValue =
        sortedValues[Math.floor(sortedValues.length * initialCutoffPercentile)];
    }
    updateFormattedCutoff();

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
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
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
    formattedCutoff = cutoffValue.toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  function handlePointHover(point, event) {
    hoveredPoint = point;
    const rect = svg.getBoundingClientRect();
    mousePosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  function handlePointLeave() {
    hoveredPoint = null;
  }

  // Função para formatar valores com K quando > 10000
  function formatValue(value) {
    if (value >= 10000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  }

  // Eixos
  function getXTicks() {
    if (!xScale) return [];
    return xScale.ticks(8).map((tick) => ({
      value: tick,
      x: xScale(tick),
      label: formatValue(tick),
    }));
  }

  function getYTicks() {
    if (!yScale) return [];
    return yScale.ticks(6).map((tick) => ({
      value: tick,
      y: yScale(tick),
      label: tick.toString(),
    }));
  }

  // Variáveis reativas
  let xTicks = [];
  let yTicks = [];

  // Reativos - quando dados ou feature mudarem, recalcular tudo
  $: if (data && data.length > 0 && feature) {
    updateVisualization();
  }
  
  // Forçar reinício do cutoff quando a feature mudar
  $: if (feature) {
    // Resetar cutoff para que seja recalculado na próxima atualização
    cutoffValue = 0;
    if (data && data.length > 0) {
      updateVisualization();
    }
  }
  
  $: cutoffX = xScale ? xScale(cutoffValue) : 0;
  $: if (xScale) {
    xTicks = getXTicks();
  }
  $: if (yScale) {
    yTicks = getYTicks();
  }
  // Calcular posición del tooltip para que apareça à esquerda ou direita
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
        <line
          x1="0"
          y1="0"
          x2={chartWidth}
          y2="0"
          stroke="#666"
          stroke-width="1"
        />
        {#each xTicks as tick}
          <g transform="translate({tick.x},0)">
            <line y1="0" y2="6" stroke="#666" />
            <text y="20" text-anchor="middle" class="tick-label"
              >{tick.label}</text
            >
          </g>
        {/each}
      </g>

      <!-- Eixo Y -->
      <g class="axis">
        <line
          x1="0"
          y1="0"
          x2="0"
          y2={chartHeight}
          stroke="#666"
          stroke-width="1"
        />
        {#each yTicks as tick}
          <g transform="translate(0,{tick.y})">
            <line x1="-6" x2="0" stroke="#666" />
            <text x="-10" dy="0.35em" text-anchor="end" class="tick-label"
              >{tick.label}</text
            >
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
        {axisLabel || "Valor"}
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
          fill={point.city === "Sacramento" ? "#007bff" : "#ff6b35"}
          stroke="white"
          stroke-width="1"
          class="dot"
          opacity="0.8"
          on:mouseenter={(e) => handlePointHover(point, e)}
          on:mouseleave={handlePointLeave}
          on:mousemove={(e) => handlePointHover(point, e)}
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
        <g class="cutoff-tooltip" transform="translate({chartWidth - 120}, 20)">
          <rect
            x="0"
            width="115"
            height="25"
            y="0"
            rx="4"
            fill="rgba(40, 167, 69, 0.95)"
            stroke="rgba(255, 255, 255, 0.8)"
            stroke-width="1"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
          />
          <text
            x="57.5"
            y="16"
            text-anchor="middle"
            fill="white"
            font-size="12"
            font-weight="600"
          >
            valor &lt; {formattedCutoff}
          </text>
        </g>
      {/if}
    </g>

    <!-- Tooltip para pontos -->
    {#if hoveredPoint}
      <g transform="translate({mousePosition.x + 10}, {mousePosition.y - 10})">
        <rect
          x="0"
          y="0"
          width="280"
          height="85"
          rx="6"
          fill="rgba(0, 0, 0, 0.9)"
          stroke="rgba(255, 255, 255, 0.2)"
          stroke-width="1"
          filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
        />
        <text x="10" y="18" fill="white" font-size="12" font-weight="bold">
          Propriedade de {hoveredPoint.city}
        </text>
        <text x="10" y="35" fill="#ccc" font-size="11">
          Valor: {hoveredPoint.value.toLocaleString()}
        </text>
        <text x="10" y="50" fill="#ccc" font-size="11">
          Frequência: ~{hoveredPoint.frequency} propriedades similares
        </text>
        <text x="10" y="65" fill="#ccc" font-size="11">
          {hoveredPoint.value < cutoffValue ? 'Abaixo' : 'Acima'} do ponto de corte
        </text>
      </g>
    {/if}
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

  @media (prefers-color-scheme: dark) {
    .tick-label {
      fill: #cbd5e0;
    }
    .axis-label {
      fill: #e2e8f0;
    }
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

  .cutoff-tooltip {
    pointer-events: none;
  }
</style>

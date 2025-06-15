<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import { _ } from "svelte-i18n";
  import { locale } from "svelte-i18n";

  // Propriedades do componente
  export let width = 800;
  export let height = 400;
  export let dotRadius = 4;
  export let data = []; // Array de objetos completos do CSV
  export let feature = ""; // Feature a visualizar
  export let axisLabel = ""; // Label do eixo
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
  const fullHeight = height - margin.top - margin.bottom;
  const proportionHeight = (fullHeight * 0.5); // ou outro fator, ex: 0.6
  const histogramHeight = fullHeight - proportionHeight;

  // Variáveis reativas
  let xScale, yScale;
  let plotPoints = [];
  let minValue = 0,
    maxValue = 0;


  let proportionBelow = [];
  let proportionAbove = [];
  let proportionLineLeft, proportionLineRight, ganhoLine;
  let proportionYScale;
  let ganho, melhorCorte;

  let proportionBelowCut,  proportionAboveCut;//= proportionBelow.find(p => Math.abs(p.x - cutoffValue) < 1e-6);
  // $: proportionAboveCut = proportionAbove.find(p => Math.abs(p.x - cutoffValue) < 1e-6);

  // calcular a entropia das duas regiões que foram divididas
  function weightedEntropy(e1, size1, e2, size2, total) {
    return (size1 / total) * e1 + (size2 / total) * e2;
  }

  // Calcula a proporção da classe SF para cada região
  function computeProportionCurve(points, cidadeAlvo = "San Francisco", numCortes = 20) {
    if (!points || points.length === 0) return [];

    const values = points.map(d => d.value);
    const minValue = d3.min(values);
    const maxValue = d3.max(values);
    const total = points.length;

    // Gera cortes apenas entre valores distintos
    const cortes = Array.from(new Set(
      d3.range(numCortes).map(i =>
        minValue + (i * (maxValue - minValue)) / (numCortes - 1)
      )
    ));

    function entropy(p) {
      if (p === 0 || p === 1) return 0; // evita -0 * log2(0)
      const e = -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
      return isNaN(e) ? 0 : e;
    }

    const result = cortes.map(corte => {
      const abaixo = points.filter(d => d.value < corte);
      const acima = points.filter(d => d.value >= corte);

      const numAbaixo = abaixo.length;
      const numAcima = acima.length;

      const sfAbaixo = abaixo.filter(d => d.city === cidadeAlvo).length;
      const sfAcima = acima.filter(d => d.city === cidadeAlvo).length;

      const pAbaixo = numAbaixo > 0 ? sfAbaixo / numAbaixo : 0;
      const pAcima = numAcima > 0 ? sfAcima / numAcima : 0;

      const entBelow = entropy(pAbaixo);
      const entAbove = entropy(pAcima);
      const weighted = weightedEntropy(entBelow, numAbaixo, entAbove, numAcima, total);

      return {
        cut: corte,
        proportionBelow: entropy(pAbaixo),
        proportionAbove: entropy(pAcima),
        weightedEntropy: weighted,
      };
    });

    return result;
}

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

      // Encontrar bin correspondente de forma mais robusta
      let binIndex = binData.findIndex((bin) => {
        if (!bin || typeof bin.x0 !== "number" || typeof bin.x1 !== "number") {
          return false;
        }
        // Para o último bin, incluir também o valor máximo
        return (
          value >= bin.x0 &&
          (value < bin.x1 ||
            (value === bin.x1 && bin === binData[binData.length - 1]))
        );
      });

      // Se não encontrou um bin válido, usar o primeiro ou último bin
      if (binIndex === -1) {
        if (value <= minValue) {
          binIndex = 0;
        } else if (value >= maxValue) {
          binIndex = binData.length - 1;
        } else {
          // Encontrar o bin mais próximo
          binIndex =
            binData.findIndex((bin) => bin && bin.x0 !== undefined) || 0;
        }
      }

      // Garantir que o binIndex está dentro dos limites válidos
      binIndex = Math.max(0, Math.min(binData.length - 1, binIndex));
      const bin = binData[binIndex];

      points.push({
        originalData: record,
        value: value,
        city: record.city,
        binIndex: binIndex,
        frequency: bin && bin.length ? bin.length : 1,
        id: record.id || index,
      });
    });

    return points;
  }

  
  // Atualizar escalas e pontos do gráfico
  function updateVisualization() {
    if (!data || data.length === 0) return;

    const frequencies = processDataPoints();
    // Calcular curvas de proporção abaixo e acima do corte
    const proporcao = computeProportionCurve(frequencies, "San Francisco", 20);
    proportionBelow = proporcao.map(d => ({ x: d.cut, y: d.proportionBelow }));
    proportionAbove = proporcao.map(d => ({ x: d.cut, y: d.proportionAbove }));
    ganho = proporcao.map(d => ({ x: d.cut, y: d.weightedEntropy - 0.1 }));
    melhorCorte = proporcao.reduce((min, r) => r.weightedEntropy < min.weightedEntropy ? r : min);
    console.log(melhorCorte)

    // Calcular frequência máxima real por bin
    const binCounts = {};
    frequencies.forEach((d) => {
      binCounts[d.binIndex] = (binCounts[d.binIndex] || 0) + 1;
    });
    const maxFrequency = Math.max(...Object.values(binCounts));

    // Atualizar escalas
    xScale = d3
      .scaleLinear()
      .domain([minValue, maxValue])
      .range([0, chartWidth]);

    yScale = d3
      .scaleLinear()
      .domain([0, maxFrequency + 1])
      .range([histogramHeight, 0]);

    // Criar escala para proporção (de 0 a 1) no eixo Y, usando o mesmo chartHeight
    proportionYScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([proportionHeight, 0]);

    // Gerar path para a curva de proporção
    proportionLineLeft = d3
      .line()
      .x((d) => xScale(d.x))
      .y((d) => proportionYScale(d.y))
      .curve(d3.curveMonotoneX)(proportionBelow);

    proportionLineRight = d3
      .line()
      .x((d) => xScale(d.x))
      .y((d) => proportionYScale(d.y))
      .curve(d3.curveMonotoneX)(proportionAbove);

    ganhoLine = d3
      .line()
      .x((d) => xScale(d.x))
      .y((d) => proportionYScale(d.y))
      .curve(d3.curveMonotoneX)(ganho);

    // Criar histograma uma vez para todos os pontos
    const histogram = d3
      .histogram()
      .domain([minValue, maxValue])
      .thresholds(bins);

    const binData = histogram(frequencies.map((f) => f.value));

    // Calcular posições dos pontos
    plotPoints = frequencies.map((d, index) => {
      // Verificar se o bin existe e é válido
      const bin = binData[d.binIndex];
      let binCenter, x;

      if (
        bin &&
        typeof bin === "object" &&
        typeof bin.x0 === "number" &&
        typeof bin.x1 === "number" &&
        !isNaN(bin.x0) &&
        !isNaN(bin.x1)
      ) {
        binCenter = (bin.x0 + bin.x1) / 2;
        x = xScale(binCenter);
      } else {
        // Fallback: usar o valor original se o bin não for válido
        console.warn(`Bin inválido para índice ${d.binIndex}:`, bin);
        binCenter = d.value;
        x = xScale(d.value);
      }

      // Agrupar pontos por bin e posicionar verticalmente
      const pointsInSameBin = frequencies.filter(
        (p) => p.binIndex === d.binIndex
      );
      const indexInBin = pointsInSameBin.findIndex((p) => p.id === d.id);
      const y = yScale(indexInBin + 1); // +1 para começar do 1 em vez de 0

      return {
        ...d,
        x: x,
        y: y,
        belowCutoff: binCenter < cutoffValue,
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
    // Get locale mapping for toLocaleString
    const localeMap = {
      pt: "pt-BR",
      en: "en-US",
      es: "es-ES",
    };
    const currentLocale = localeMap[$locale] || "en-US";

    formattedCutoff = cutoffValue.toLocaleString(currentLocale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    proportionBelowCut = proportionBelow.reduce((prev, curr) =>
      Math.abs(curr.x - cutoffValue) < Math.abs(prev.x - cutoffValue) ? curr : prev
    );

    proportionAboveCut = proportionAbove.reduce((prev, curr) =>
      Math.abs(curr.x - cutoffValue) < Math.abs(prev.x - cutoffValue) ? curr : prev
    );
  }

  function handlePointHover(point, event) {
    hoveredPoint = point;
    const rect = svg.getBoundingClientRect();
    mousePosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function handlePointLeave() {
    hoveredPoint = null;
  }

  // Função para formatar valores com K quando > 10000
  function formatValue(value) {
    const localeMap = {
      pt: "pt-BR",
      en: "en-US",
      es: "es-ES",
    };
    const currentLocale = localeMap[$locale] || "en-US";

    if (value >= 10000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toLocaleString(currentLocale, { maximumFractionDigits: 1 });
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


      <!-- Fundo colorido do histograma -->
      <rect
        x="0"
        y="-10"
        width={cutoffX}
        height={histogramHeight +10}
        fill="var(--color--gini--left)"
        opacity="0.18"
      />
      <rect
        x={cutoffX}
        y="-10"
        width={chartWidth - cutoffX + 5}
        height={histogramHeight +10}
        fill="var(--color--gini--right)"
        opacity="0.18"
      />


      <!-- Grupo da curva de proporção -->
      <g transform="translate(0, {histogramHeight + 65})">  <!-- adiciona espaçamento entre os blocos -->
        {#if proportionLineLeft}
          <path
            d={proportionLineLeft}
            fill="none"
            stroke="var(--color--gini--left)"
            stroke-width="2.3"
            opacity="0.6"
            class="proportion-line"
          />
        {/if}
        {#if proportionLineRight}
          <path
            d={proportionLineRight}
            fill="none"
            stroke= "var(--color--gini--right)"
            stroke-width="2.3"
            opacity="0.6"
            class="proportion-line"
          />
        {/if}
        {#if ganhoLine}
          <path
            d={ganhoLine}
            fill="none"
            stroke="var(--color--gini--prop)"
            stroke-width="3.5"
            opacity="0.9"
            class="proportion-line"
          />
        {/if}
        {#if melhorCorte}
        <line
          x1={xScale(melhorCorte.cut)}
          x2={xScale(melhorCorte.cut)}
          y1={0}
          y2={proportionHeight}
          stroke="gray"
          stroke-width="1.5"
          stroke-dasharray="4,3"
          opacity="0.7"
        />
      {/if}
          <!-- Eixo Y para a proporção -->
          <g class="axis">
            <line
              x1="0"
              y1="0"
              x2="0"
              y2={proportionHeight}
              stroke="currentColor"
              stroke-width="1"
              opacity="0.6"
            />
            {#each d3.range(0, 1.1, 0.2) as tick}
              <g transform="translate(0, {proportionYScale(tick)})">
                <line x1="-6" x2="0" stroke="currentColor" opacity="0.6" />
                <text
                  x="-10"
                  dy="0.35em"
                  text-anchor="end"
                  class="tick-label"
                  fill="var(--color-text)">{tick.toFixed(1)}</text
                >
              </g>
            {/each}
          </g>
          
          <!-- Eixo Y para a proporção -->
          <g class="axis">
            <line
              x1="0"
              y1="0"
              x2="0"
              y2={proportionHeight}
              stroke="currentColor"
              stroke-width="1"
              opacity="0.6"
            />

            {#each d3.range(0, 1.1, 0.2) as tick}
              <g transform="translate(0, {proportionYScale(tick)})">
                <line x1="-6" x2="0" stroke="currentColor" opacity="0.6" />
                <text
                  x="-10"
                  dy="0.35em"
                  text-anchor="end"
                  class="tick-label"
                  fill="var(--color-text)"
                >
                  {tick.toFixed(1)}
                </text>
              </g>
            {/each}

            <!-- Título do eixo Y -->
            <text
              x="-{proportionHeight / 2}"
              y="-60"
              transform="rotate(-90)"
              text-anchor="middle"
              fill="var(--color-text)"
              class="axis-label"
            >
              Impureza
            </text>
          </g>

        </g>

        

      <!-- Legenda das linhas -->
        <g transform="translate({chartWidth - 160}, {histogramHeight + 65})">
          <g transform="translate(90, -30)">
            <line x1="0" y1="5" x2="20" y2="5" stroke="var(--color--gini--left)" stroke-width="2" opacity="0.6" />
            <text x="25" y="9" font-size="9" fill="var(--color-text)">Impureza esquerda</text>
          </g>
          <g transform="translate(90, -20)">
            <line x1="0" y1="5" x2="20" y2="5" stroke="var(--color--gini--right)" stroke-width="2" opacity="0.6" />
            <text x="25" y="9" font-size="9" fill="var(--color-text)">Impureza direita</text>
          </g>
          <g transform="translate(90, -10)">
            <line x1="0" y1="5" x2="20" y2="5" stroke="var(--color--gini--prop)" stroke-width="2" opacity="0.9" />
            <text x="25" y="9" font-size="9" fill="var(--color-text)">Impureza ponderada</text>
          </g>
          <g transform="translate(90, -40)">
            <line x1="0" y1="5" x2="20" y2="5" stroke="gray" stroke-width="2" stroke-dasharray="4,3" opacity="0.9" />
            <text x="25" y="9" font-size="9" fill="var(--color-text)">Melhor corte</text>
          </g>
        </g>
      <!-- Eixos -->
      <!-- Eixo X -->
      <g class="axis" transform="translate(0,{histogramHeight})">
        <line
          x1="0"
          y1="0"
          x2={chartWidth}
          y2="0"
          stroke="currentColor"
          stroke-width="1"
          opacity="0.6"
        />
        {#each xTicks as tick}
          <g transform="translate({tick.x},0)">
            <line y1="0" y2="6" stroke="currentColor" opacity="0.6" />
            <text
              y="20"
              text-anchor="middle"
              class="tick-label"
              fill="var(--color-text)">{tick.label}</text
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
          y2={histogramHeight}
          stroke="currentColor"
          stroke-width="1"
          opacity="0.6"
        />
        {#each yTicks as tick}
          <g transform="translate(0,{tick.y})">
            <line x1="-6" x2="0" stroke="currentColor" opacity="0.6" />
            <text
              x="-10"
              dy="0.35em"
              text-anchor="end"
              class="tick-label"
              fill="var(--color-text)">{tick.label}</text
            >
          </g>
        {/each}
      </g>

      

      <!-- Etiquetas de eixos -->
      <text
        x={chartWidth / 2}
        y={histogramHeight + 50}
        text-anchor="middle"
        class="axis-label"
        fill="var(--color-text)"
      >
        {axisLabel || $_("scatterplot.value")}
      </text>

      <text
        x={-histogramHeight / 2}
        y="-60"
        text-anchor="middle"
        class="axis-label"
        transform="rotate(-90)"
        fill="var(--color-text)"
      >
        {$_("scatterplot.frequency")}
      </text>

      <!-- Legenda do scatterplot -->
        <g transform="translate({chartWidth-50}, -40)">
          <circle cx="5" cy="6" r="6" fill="var(--color-classe0)" />
          <text x="15" y="10" font-size="9" fill="var(--color-text)">San Francisco</text>
        </g>
        <g transform="translate({chartWidth-50}, -25)">
          <circle cx="5" cy="6" r="6" fill="var(--color-classe1)" />
          <text x="15" y="10" font-size="9" fill="var(--color-text)">Sacramento</text>
        </g>

      <!-- Pontos do scatter plot -->
      {#each plotPoints as point}
        <circle
          cx={point.x}
          cy={point.y}
          r={dotRadius}
          fill={point.city === "Sacramento"
            ? "var(--color-classe1)"
            : "var(--color-classe0)"}
          stroke={point.city === "Sacramento"
            ? "var(--color-classe1)"
            : "var(--color-classe0)"}
          stroke-width="1.5"
          class="dot"
          opacity="0.9"
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
          y2={histogramHeight}
          stroke="#28a745"
          stroke-width="2"
          stroke-dasharray="5,5"
          class="cutoff-line"
        />

        <!-- Linha de corte no gráfico de linha (abaixo do histograma) -->
        <line
          x1={cutoffX}
          y1={histogramHeight + 40}
          x2={cutoffX}
          y2={histogramHeight + fullHeight}
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
          stroke="currentColor"
          stroke-width="2"
          class="cutoff-handle"
          on:mousedown={handleMouseDown}
        />

      <!-- Tooltip combinado: cutoff + proporções -->
      <g class="cutoff-tooltip" transform="translate({chartWidth - 120}, 20)">
        <rect
          x="-7"
          width="130"
          height="55"
          y="0"
          rx="4"
          fill="rgba(40, 167, 69, 0.95)"
          stroke="currentColor"
          stroke-width="1"
          stroke-opacity="0.3"
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
        {$_("scatterplot.cutoff_tooltip", {
        values: { value: formattedCutoff },
        })}
        </text>
        <text
          x="57.5"
          y="34"
          text-anchor="middle"
          fill="white"
          font-size="10"
        >Impureza esquerda: {(proportionBelowCut?.y ).toFixed(3)}
        </text>

        <text
          x="57.5"
          y="49"
          text-anchor="middle"
          fill="white"
          font-size="10"
        >Impureza direita: {(proportionAboveCut?.y).toFixed(3)}
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
          fill="rgba(0, 0, 0, 0.95)"
          stroke="rgba(255, 255, 255, 0.2)"
          stroke-width="1"
          filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
          class="tooltip-bg"
        />
        <text
          x="10"
          y="18"
          fill="white"
          font-size="12"
          font-weight="bold"
          class="tooltip-title"
        >
          {$_("scatterplot.point_tooltip.property_of", {
            values: { city: hoveredPoint.city },
          })}
        </text>
        <text x="10" y="35" fill="#ccc" font-size="11" class="tooltip-text">
          {$_("scatterplot.point_tooltip.value", {
            values: { value: hoveredPoint.value.toLocaleString() },
          })}
        </text>
        <text x="10" y="50" fill="#ccc" font-size="11" class="tooltip-text">
          {$_("scatterplot.point_tooltip.frequency", {
            values: { frequency: hoveredPoint.frequency },
          })}
        </text>
        <text x="10" y="65" fill="#ccc" font-size="11" class="tooltip-text">
          {hoveredPoint.value < cutoffValue
            ? $_("scatterplot.point_tooltip.below_cutoff")
            : $_("scatterplot.point_tooltip.above_cutoff")}
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
    fill: var(--color-text);
  }

  .axis-label {
    font-size: 14px;
    fill: var(--color-text);
    font-weight: 500;
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

  /* Tooltip styles for better theme support */
  .tooltip-bg {
    fill: rgba(0, 0, 0, 0.95); /* Default dark tooltip for all themes */
  }

  .tooltip-title {
    fill: white;
  }

  .tooltip-text {
    fill: #ccc;
  }

  /* Light mode adjustments could be made here if needed */
  @media (prefers-color-scheme: light) {
    /* Keep tooltips dark even in light mode for better contrast */
    .tooltip-bg {
      fill: rgba(0, 0, 0, 0.95);
    }
  }
</style>

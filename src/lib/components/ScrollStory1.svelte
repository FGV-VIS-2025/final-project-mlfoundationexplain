<script>
  import { onMount } from 'svelte';

  let currentStep = 0;
  let data = [];
  let error = null;

  let stepRefs = [];

  const xKey = 'total_rooms';
  const yKey = 'median_house_value';

  // Dimensões do gráfico
  const width = 700;
  const height = 500;
  const margin = { top: 20, right: 20, bottom: 40, left: 70 };

  // Escalas (serão definidas após o carregamento)
  let xScale, yScale;
  let xTicks = [], yTicks = [];

  onMount(async () => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = stepRefs.findIndex(el => el === entry.target);
            if (index !== -1) currentStep = index;
          }
        });
      },
      { threshold: 0.5 }
    );

    stepRefs.forEach(el => { if(el) observer.observe(el) });

    try {
      const res = await fetch('/data/housing_limpo.csv');
      const text = await res.text();

      const lines = text.trim().split('\n');
      const headers = lines[0].split(',');

      const xIndex = headers.indexOf(xKey);
      const yIndex = headers.indexOf(yKey);

      if (xIndex === -1 || yIndex === -1) {
        error = `Colunas "${xKey}" ou "${yKey}" não encontradas no CSV`;
        return;
      }

      data = lines.slice(1).map(line => {
        const cols = line.split(',');
        return {
          x: parseFloat(cols[xIndex]),
          y: parseFloat(cols[yIndex])
        };
      }).filter(d => !isNaN(d.x) && !isNaN(d.y));

      // Definir domínio e escalas
      const xValues = data.map(d => d.x);
      const yValues = data.map(d => d.y);

      const xMin = Math.min(...xValues);
      const xMax = Math.max(...xValues);
      const yMin = Math.min(...yValues);
      const yMax = Math.max(...yValues);

      // Funções escala simples (linear)
      xScale = x => margin.left + ((x - xMin) / (xMax - xMin)) * (width - margin.left - margin.right);
      yScale = y => height - margin.bottom - ((y - yMin) / (yMax - yMin)) * (height - margin.top - margin.bottom);

      // Ticks simples para eixo X e Y (5 ticks cada)
      xTicks = Array.from({length:5}, (_,i) => xMin + i*(xMax - xMin)/4);
      yTicks = Array.from({length:5}, (_,i) => yMin + i*(yMax - yMin)/4);

    } catch(e) {
      error = 'Erro ao carregar CSV: ' + e.message;
    }

    return () => observer.disconnect();
  });
</script>



<!-- Container principal com layout horizontal (lado a lado) -->
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
      </div>
    {/each}
  </div>

  <!-- Coluna com visualização (SVG) que fica fixa ao rolar -->
<div class="viz">
  {#if error}
    <p style="color: red">{error}</p>
  {:else if data.length === 0}
    <p>Carregando dados...</p>
  {:else}
    <svg width={width} height={height} style="background: transparent;">
      <!-- Pontos do scatterplot -->
      {#each data as point}
        <circle
          cx={xScale(point.x)}
          cy={yScale(point.y)}
          r="3"
          fill="steelblue"
          opacity="0.7"
        />
      {/each}

      <!-- Eixo X -->
      <line 
        x1={margin.left} 
        y1={height - margin.bottom} 
        x2={width - margin.right} 
        y2={height - margin.bottom} 
        stroke="black" 
      />
      {#each xTicks as tick}
        <line 
          x1={xScale(tick)} 
          y1={height - margin.bottom} 
          x2={xScale(tick)} 
          y2={height - margin.bottom + 6} 
          stroke="black" 
        />
        <text 
          x={xScale(tick)} 
          y={height - margin.bottom + 20} 
          font-size="10" 
          text-anchor="middle"
        >
          {Math.round(tick)}
        </text>
      {/each}

      <!-- Eixo Y -->
      <line
        x1={margin.left}
        y1={margin.top}
        x2={margin.left}
        y2={height - margin.bottom}
        stroke="black"
      />
      {#each yTicks as tick}
        <line
          x1={margin.left}
          y1={yScale(tick)}
          x2={margin.left - 6}
          y2={yScale(tick)}
          stroke="black"
        />
        <text
          x={margin.left - 10}
          y={yScale(tick) + 3}
          font-size="10"
          text-anchor="end"
        >
          {Math.round(tick)}
        </text>
      {/each}

      <!-- Legenda eixo X -->
      <text
        x={(width + margin.left - margin.right) / 2}
        y={height - 5}
        font-size="12"
        text-anchor="middle"
        font-weight="bold"
      >
        Total Rooms
      </text>

      <!-- Legenda eixo Y -->
      <text
        transform={`translate(15, ${(height - margin.bottom + margin.top)/2}) rotate(-90)`}
        font-size="12"
        text-anchor="middle"
        font-weight="bold"
      >
        Median House Value
      </text>
    </svg>
  {/if}
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

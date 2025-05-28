<script>
  import { onMount } from 'svelte';

  let currentStep = 0;
  const colors = ['steelblue', 'orange', 'green', 'purple'];
  const positions = [100, 250, 100, 250];

  // Armazena as referências dos elementos DOM de cada etapa (step)
  let stepRefs = [];

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Callback chamado sempre que um "step" entra ou sai da viewport
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Verifica se o elemento está visível na tela
            const index = stepRefs.findIndex((el) => el === entry.target);
            if (index !== -1) {
                // Atualiza o step atual para mudar a visualização
              currentStep = index;
            }
          }
        });
      },
      {
        // Define o quanto do elemento precisa estar visível (50%) para ser considerado "visível"
        threshold: 0.5, 
      }
    );

    stepRefs.forEach((el) => {
      if (el) observer.observe(el);
    });

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
    <svg width="400" height="300">
      <circle
        cx={positions[currentStep]}
        cy="150"
        r="50"
        fill={colors[currentStep]}
      />
    </svg>
  </div>
</div>

<style>
  .scroll-container {
    display: flex;
    height: 100vh;
  }

  .steps {
    width: 40%;
    padding: 2rem;
    overflow-y: auto;
  }

  .viz {
    width: 60%;
    position: sticky;
    top: 72px;
    height: calc(100vh - 72px);
    background: #f3f4f6;
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
    border-color: #1e3a8a;
    font-weight: bold;
  }
</style>

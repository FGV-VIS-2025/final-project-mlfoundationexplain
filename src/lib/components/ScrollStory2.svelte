<!-- src/lib/components/ScrollStory2.svelte -->
<script>
  import { onMount } from 'svelte';

  let currentStep = 0;
  const colors = ['red', 'blue', 'green', 'orange'];
  const positions = [80, 120, 160, 200];
  let stepRefs = [];

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = stepRefs.findIndex((el) => el === entry.target);
            if (index !== -1) {
              currentStep = index;
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    stepRefs.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  });
</script>

<div class="scroll-container">
  <div class="steps">
    {#each [0, 1, 2, 3] as stepIndex}
      <div
        class="step"
        bind:this={stepRefs[stepIndex]}
        class:active={stepIndex === currentStep}
      >
        <h3>Bloco 2 - Etapa {stepIndex + 1}</h3>
        <p>Conteúdo diferente para o bloco 2 - etapa {stepIndex + 1}
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
        </p>
      </div>
    {/each}
  </div>

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
    background: #1e293b;
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


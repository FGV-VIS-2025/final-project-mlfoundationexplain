<script>
  import { onMount } from 'svelte';
  let currentStep = 0;

  const colors = ['steelblue', 'orange', 'green', 'purple'];
  const positions = [100, 150, 200, 250];

  function handleStepEnter(index) {
    currentStep = index;
  }
</script>

<div class="scroll-container">
  <div class="steps">
    {#each [0, 1, 2, 3] as stepIndex}
      <div
        class="step"
        class:active={stepIndex === currentStep}
        on:mouseenter={() => handleStepEnter(stepIndex)}
      >
        <h3>Etapa {stepIndex + 1}</h3>
        <p>Texto para a etapa {stepIndex + 1}.</p>
      </div>
    {/each}
  </div>

  <div class="viz">
    <svg width="400" height="300">
      <circle
        cx="{positions[currentStep]}"
        cy="150"
        r="50"
        fill="{colors[currentStep]}"
      >
        <animate
          attributeName="cx"
          dur="0.3s"
          values="{positions.join(';')}"
          repeatCount="1"
          fill="freeze"
        />
      </circle>
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
  }

  .step.active {
    border-color: #1e3a8a;
    font-weight: bold;
  }
</style>

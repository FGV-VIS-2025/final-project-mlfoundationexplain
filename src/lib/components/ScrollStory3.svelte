<script>
  import { onMount } from 'svelte';
  import Tree from './Tree2.svelte'; // importe seu componente de árvore

  let currentStep = 0;
  const totalSteps = 12;

  let stepRefs = [];

  const treeData = {
  name: "feature 2 ≤ 3.80",
  children: [
    {
      name: "Classe: 0"
    },
    {
      name: "feature 2 ≤ 4.80",
      children: [
        {
          name: "Classe: 1"
        },
        {
          name: "feature 3 ≤ 1.80",
          children: [
            {
              name: "median_house_value ≤ 2.70",
              children: [
                {
                  name: "Classe: 2"
                },
                {
                  name: "feature 2 ≤ 5.10",
                  children: [
                    {
                      name: "Classe: 1"
                    },
                    {
                      name: "total_bedrooms ≤ 6.30",
                      children: [
                        {
                          name: "Classe: 1"
                        },
                        {
                          name: "Classe: 2"
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              name: "feature 2 ≤ 4.90",
              children: [
                {
                  name: "total_bedrooms ≤ 6.00",
                  children: [
                    {
                      name: "Classe: 1"
                    },
                    {
                      name: "Classe: 2"
                    }
                  ]
                },
                {
                  name: "Classe: 2"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};


  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = stepRefs.findIndex(el => el === entry.target);
            if (index !== -1) {
              currentStep = index;
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    stepRefs.forEach(el => {
      if(el) observer.observe(el);
    });

    return () => observer.disconnect();
  });
</script>

<div>
  <div class="scroll-container">
    <div class="steps">
      {#each Array(totalSteps) as _, stepIndex}
        <div
          class="step"
          bind:this={stepRefs[stepIndex]}
          class:active={stepIndex === currentStep}
        >
          <h3>Bloco 3 - Etapa {stepIndex + 1}</h3>
          <p>
            Conteúdo diferente para o bloco 3 - etapa {stepIndex + 1}.<br />
            A árvore cresce conforme você avança.
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Esse excepturi error facere? Sunt, ad deserunt inventore consequuntur deleniti rem, sequi, aperiam sapiente error aliquid molestiae non architecto dolore explicabo culpa?
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Vitae voluptate veritatis maiores cum provident explicabo quas numquam accusamus ratione sunt. Repudiandae omnis error quod molestias optio nobis recusandae officiis quam!
          </p>
        </div>
      {/each}
    </div>

    <div class="viz">
      <Tree {treeData} step={currentStep} />
    </div>
  </div>
</div>

<style>
  .scroll-container {
  display: flex;
  position: relative;
  gap: 2rem;
  margin-bottom: 10rem; 
  margin-top: 10rem;
  background-color: var(--color-background); 
  padding: 2rem;
  border-radius: 1rem;
}

.viz {
  width: 60%;
  position: sticky;
  top: 72px;
  height: calc(100vh - 72px);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--color-background); 
  border-radius: 1rem;
}


  .steps {
    width: 40%;
    padding: 2rem;
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

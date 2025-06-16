<script>
  import { onMount } from 'svelte';
  import Tree from './Tree2.svelte'; // importe seu componente de árvore
  import ScrollStory from './scatterCutsViz.svelte'; // ajuste o caminho
  import Step3 from './Step3.svelte';



  let currentStep = 0;
  const totalSteps = 10;

  let stepRefs = [];

 const treeData = {
  "name": "median_house_value \n\u2264 185300.00",
  "children": [
    {
      "name": "median_house_value \n\u2264 112500.00",
      "children": [
        {
          "name": "median_house_value \n\u2264 72600.00",
          "children": [
            {
              "name": "Sacramento"
            },
            {
              "name": "total_bedrooms \n\u2264 2061.00",
              "children": [
                {
                  "name": "Sacramento"
                },
                {
                  "name": "Sacramento"
                }
              ]
            }
          ]
        },
        {
          "name": "total_bedrooms \n\u2264 2324.00",
          "children": [
            {
              "name": "Sacramento"
            },
            {
              "name": "Sacramento"
            }
          ]
        }
      ]
    },
    {
      "name": "median_house_value \n\u2264 237500.00",
      "children": [
        {
          "name": "San Francisco"
        },
        {
          "name": "total_bedrooms \n\u2264 1335.00",
          "children": [
            {
              "name": "San Francisco"
            },
            {
              "name": "median_house_value \n\u2264 328100.00",
              "children": [
                {
                  "name": "median_house_value \n\u2264 297600.00",
                  "children": [
                    {
                      "name": "total_bedrooms \n\u2264 1871.00",
                      "children": [
                        {
                          "name": "San Francisco"
                        },
                        {
                          "name": "San Francisco"
                        }
                      ]
                    },
                    {
                      "name": "San Francisco"
                    }
                  ]
                },
                {
                  "name": "San Francisco"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}




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
      { threshold: 0.9 }
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
    <Step3 {stepIndex} />
  </div>
{/each}
</div>


    <div class="viz">
    <div class="dual-tree">
  <div class="scroll-container-svg">
    <ScrollStory {currentStep} />
  </div>
  <div class="tree-container-svg">
    <Tree {treeData} step={currentStep} />
  </div>
</div>
</div>

  </div>
</div>

<style>
.dual-tree {
  display: flex;
  gap: 2rem;
  width: 100%;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
}

.scroll-container-svg {
  width: 40%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible;
}

.tree-container-svg {
  width: 60%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible;
}

  .scroll-container {
  display: flex;
  position: relative;
  gap: 2rem;
  margin-bottom: 7rem; 
  /* margin-top: 0.1rem; */
  background-color: var(--color-background); 
  padding: 2rem;
  border-radius: 1rem;
}

.viz {
  width: 75%;
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
    width: 25%;
    padding: 2rem;
    margin-bottom: 0rem; 
  }


  .step {
    margin: 20rem 0;
    margin-top: 20;
    padding: 1rem;
    border-left: 4px solid #ccc;
    transition: border-color 0.3s ease;
    text-align: justify;
  }

  .step.active {
    border-color: var(--color-accent2);
    /* font-weight: bold; */
  }



</style>

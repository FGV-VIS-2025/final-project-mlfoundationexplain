<script>
  import { onMount } from "svelte";
  import SimpleScatterplot from "./SimpleScatterplot.svelte";
  import * as d3 from "d3";
  import { base } from "$app/paths";
  import { _ } from "svelte-i18n";

  // Variáveis de controle da narrativa
  let currentStep = 0;
  let stepRefs = [];
  let data = [];
  let isLoading = true;

  // Configurações dos 4 passos da narrativa
  $: steps = [
    {
      feature: "total_rooms",
      cutoff: 3000,
    },
    {
      feature: "total_bedrooms",
      cutoff: 800,
    },
    {
      feature: "households",
      cutoff: 500,
    },
    {
      feature: "median_house_value",
      cutoff: 250000,
    },
  ];

  // Carregamento dos dados
  async function loadData() {
    try {
      const resData = await d3.csv(`${base}/data/housing_limpo.csv`);

      data = resData;
      isLoading = false;
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      isLoading = false;
    }
  }

  // Observer para detectar mudanças de passo durante o scroll
  onMount(() => {
    loadData();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepIndex = stepRefs.findIndex((ref) => ref === entry.target);
            if (stepIndex !== -1 && stepIndex !== currentStep) {
              currentStep = stepIndex;
            }
          }
        });
      },
      { threshold: 0.5, rootMargin: "0px 0px -50% 0px" }
    );

    stepRefs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  });
</script>

<div
  class="flex relative my-16 min-h-screen flex-col gap-4 md:flex-row md:gap-8"
>
  <!-- Coluna com o conteúdo textual rolável -->
  <div class="md:w-2/5 w-full md:px-8 px-4 md:pl-16 pl-8">
    {#each steps as step, stepIndex}
      <div
        class="md:my-16 my-8 md:p-10 p-8 border-l-4 rounded-r-xl transition-all duration-300
               md:min-h-[80vh] min-h-0 flex flex-col justify-center
                backdrop-blur-sm border-gray-200 dark:border-gray-700
               {stepIndex === currentStep
          ? 'border-l-purple-600 transform translate-x-1 dark:border-l-purple-400 dark:from-purple-900/20 dark:to-gray-800/80'
          : ''}"
        bind:this={stepRefs[stepIndex]}
      >
        <div class="mb-6">
          <span
            class="text-purple-600 text-sm font-semibold uppercase tracking-wide dark:text-purple-400"
          >
            {$_("cutoffs.feature_label", { values: { number: stepIndex + 1 } })}
          </span>
          <h3
            class="md:text-3xl text-2xl font-bold mt-2 mb-0 text-gray-800 dark:text-white
                     {stepIndex === currentStep
              ? 'text-purple-600 dark:text-purple-400'
              : ''}"
          >
            {$_(`cutoffs.steps.${step.feature}.title`)}
          </h3>
        </div>

        <div class="flex-1">
          <p
            class="text-gray-600 text-lg leading-relaxed mb-8 dark:text-gray-300"
          >
            {$_(`cutoffs.steps.${step.feature}.description`)}
          </p>

          <div class=" p-6 rounded-lg mb-8">
            <div class="mb-3 text-gray-600 dark:text-gray-300">
              <strong class="text-gray-800 dark:text-white"
                >{$_("cutoffs.characteristic")}</strong
              >
              {$_(`cutoffs.steps.${step.feature}.axis_label`)}
            </div>
            <div class="mb-3 text-gray-600 dark:text-gray-300">
              <strong class="text-gray-800 dark:text-white"
                >{$_("cutoffs.value_range")}</strong
              >
              {#if data && data.length > 0}
                {(() => {
                  const values = data
                    .map((d) => Number(d[steps[currentStep].feature]))
                    .filter((v) => !isNaN(v));
                  const min = Math.min(...values);
                  const max = Math.max(...values);
                  return `${min.toLocaleString()} - ${max.toLocaleString()}`;
                })()}
              {:else}
                {$_("cutoffs.loading")}
              {/if}
            </div>
            <div class="text-gray-600 dark:text-gray-300">
              <strong class="text-gray-800 dark:text-white"
                >{$_("cutoffs.cutoff_point")}</strong
              >
              {step.cutoff.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Visualização fixa -->
  <div
    class="md:w-3/5 w-full md:sticky md:top-20 relative top-auto md:h-[calc(100vh-80px)] h-[500px]
              flex flex-col justify-center items-center rounded-xl p-4"
  >
    {#if isLoading}
      <div class="text-center text-gray-600 dark:text-gray-300">
        <div
          class="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto dark:border-gray-700 dark:border-t-purple-400"
        ></div>
        <p class="mt-4 text-xl">{$_("cutoffs.loading_data")}</p>
      </div>
    {:else if data != null}
      <div class="mb-4">
        <h4 class="text-gray-800 text-xl text-center m-0 dark:text-white">
          {$_(`cutoffs.steps.${steps[currentStep].feature}.axis_label`)}
        </h4>
      </div>
      {#key steps[currentStep].feature}
        <SimpleScatterplot
          width={700}
          height={400}
          dotRadius={3}
          {data}
          feature={steps[currentStep].feature}
          axisLabel={$_(
            `cutoffs.steps.${steps[currentStep].feature}.axis_label`
          )}
          bins={55}
          initialCutoffValue={steps[currentStep].cutoff}
        />
      {/key}
      <div class="mt-4 text-center">
        <p class="text-gray-600 text-sm italic dark:text-gray-400">
          {$_("cutoffs.city_comparison")}
        </p>
      </div>
    {:else}
      <div class="text-center text-red-600 text-xl dark:text-red-400">
        <p>{$_("cutoffs.error_loading")}</p>
      </div>
    {/if}
  </div>
</div>

<script>
  import { onMount } from "svelte";
  import SimpleScatterplot from "./SimpleScatterplot.svelte";
  import * as d3 from "d3";
  import { base } from '$app/paths';

  // Variáveis de controle da narrativa
  let currentStep = 0;
  let stepRefs = [];
  let data = [];
  let isLoading = true;

  // Configurações dos 4 passos da narrativa
  const steps = [
    {
      title: "Total de Quartos",
      feature: "total_rooms",
      description:
        "Esta feature representa o número total de quartos em cada propriedade. É uma característica fundamental que captura o tamanho da propriedade. Propriedades com mais quartos tendem a ter características diferentes e esta informação é valiosa para o modelo. Observe como esta feature se distribui nos dados e como estabelecemos um ponto de corte para binarizar esta característica contínua.",
      cutoff: 3000,
      axisLabel: "Total de Quartos",
    },
    {
      title: "Quartos de Dormir",
      feature: "total_bedrooms",
      description:
        "Esta feature captura especificamente os quartos de dormir, diferindo da feature anterior que inclui todos os tipos de quartos. É uma característica importante para determinar a capacidade habitacional da propriedade. Esta feature fornece informação específica sobre a funcionalidade residencial do imóvel.",
      cutoff: 800,
      axisLabel: "Total de Quartos de Dormir",
    },
    {
      title: "Densidade de Domicílios",
      feature: "households",
      description:
        "Esta feature representa a quantidade de domicílios por região, capturando aspectos de densidade populacional e urbanização. É uma característica contextual importante que reflete o ambiente onde a propriedade está localizada. Esta informação demográfica é valiosa para caracterizar o tipo de área.",
      cutoff: 500,
      axisLabel: "Número de Domicílios",
    },
    {
      title: "Valor Mediano das Casas",
      feature: "median_house_value",
      description:
        "Esta feature representa o valor mediano das casas na região. É uma característica econômica importante que reflete o mercado imobiliário local. Esta feature captura informações sobre o poder aquisitivo e padrão socioeconômico da área onde a propriedade está localizada.",
      cutoff: 250000,
      axisLabel: "Valor Mediano (USD)",
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
            Feature {stepIndex + 1}
          </span>
          <h3
            class="md:text-3xl text-2xl font-bold mt-2 mb-0 text-gray-800 dark:text-white
                     {stepIndex === currentStep
              ? 'text-purple-600 dark:text-purple-400'
              : ''}"
          >
            {step.title}
          </h3>
        </div>

        <div class="flex-1">
          <p
            class="text-gray-600 text-lg leading-relaxed mb-8 dark:text-gray-300"
          >
            {step.description}
          </p>

          <div class=" p-6 rounded-lg mb-8">
            <div class="mb-3 text-gray-600 dark:text-gray-300">
              <strong class="text-gray-800 dark:text-white"
                >Característica:</strong
              >
              {step.axisLabel}
            </div>
            <div class="mb-3 text-gray-600 dark:text-gray-300">
              <strong class="text-gray-800 dark:text-white"
                >Faixa de valores:</strong
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
                Carregando...
              {/if}
            </div>
            <div class="text-gray-600 dark:text-gray-300">
              <strong class="text-gray-800 dark:text-white"
                >Ponto de corte:</strong
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
        <p class="mt-4 text-xl">Carregando dados...</p>
      </div>
    {:else if data != null}
      <div class="mb-4">
        <h4 class="text-gray-800 text-xl text-center m-0 dark:text-white">
          {steps[currentStep].axisLabel}
        </h4>
      </div>
      {#key steps[currentStep].feature}
        <SimpleScatterplot
          width={700}
          height={400}
          dotRadius={3}
          {data}
          feature={steps[currentStep].feature}
          axisLabel={steps[currentStep].axisLabel}
          bins={55}
          initialCutoffValue={steps[currentStep].cutoff}
        />
      {/key}
      <div class="mt-4 text-center">
        <p class="text-gray-600 text-sm italic dark:text-gray-400">
          Sacramento (púrpura) vs San Francisco (verde)
        </p>
      </div>
    {:else}
      <div class="text-center text-red-600 text-xl dark:text-red-400">
        <p>❌ Erro ao carregar os dados</p>
      </div>
    {/if}
  </div>
</div>

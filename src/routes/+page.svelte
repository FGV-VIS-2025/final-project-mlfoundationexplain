<!-- src/routes/+page.svelte -->

<script>
  import ScrollStory3 from "$lib/components/ScrollStory3.svelte";
  import Introduction from "$lib/components/Introduction.svelte";
  import CuttOffs from "$lib/components/CuttOffs.svelte";
  import Gini from "$lib/components/gini.svelte";
  import { _ } from "svelte-i18n";

  import DecisionTree from "$lib/components/Tree.svelte";

  import DecisionTree2 from "$lib/components/TreeInteractive.svelte";

  let treeJson = null;
  let treeJson_2d = null;
  let selectedPruningMethod = "original";
  let pruningData = null;
  let isLoadingTree = false;

  import { onMount } from "svelte";

  // Configuración de métodos de poda disponibles
  const pruningMethods = [
    {
      id: "original",
      name: "Sin Poda",
      description: "Árbol completo sin podas aplicadas",
      color: "#e11d48",
      file: "housing_original.json",
    },
    {
      id: "validacao",
      name: "Poda por Validación",
      description: "Poda basada en mejora de precisión en validación",
      color: "#0891b2",
      file: "housing_validacao.json",
    },
    {
      id: "profundidade_3",
      name: "Poda por Profundidad (3)",
      description: "Limita la profundidad máxima a 3 niveles",
      color: "#059669",
      file: "housing_profundidade_3.json",
    },
    {
      id: "profundidade_4",
      name: "Poda por Profundidad (4)",
      description: "Limita la profundidad máxima a 4 niveles",
      color: "#7c3aed",
      file: "housing_profundidade_4.json",
    },
    {
      id: "custo_complexidade_001",
      name: "Costo-Complejidad (α=0.01)",
      description: "Poda por costo-complejidad con α=0.01",
      color: "#ea580c",
      file: "housing_custo_complexidade_alpha_0.01.json",
    },
    {
      id: "hibrida",
      name: "Poda Híbrida",
      description: "Combina múltiples criterios de poda",
      color: "#dc2626",
      file: "housing_hibrida.json",
    },
  ];

  // Función para convertir formato de cortes a D3
  function convertToD3Format(cortes, featureNames) {
    if ("class" in cortes) {
      const className = cortes.class === 0 ? "Sacramento" : "San \nFrancisco";
      return {
        name: `Clase: ${className}`,
      };
    }

    const featureMatch = cortes.feature.match(/feature (\d+)/);
    let featureName = cortes.feature;

    if (featureMatch && featureNames) {
      const featureIdx = parseInt(featureMatch[1]);
      if (featureIdx < featureNames.length) {
        featureName = featureNames[featureIdx];
      }
    }

    return {
      name: `${featureName} ≤ ${cortes.threshold.toFixed(2)}`,
      children: [
        convertToD3Format(cortes.left, featureNames),
        convertToD3Format(cortes.right, featureNames),
      ],
    };
  }

  // Cargar árbol específico según método seleccionado
  async function loadPruningTree(methodId) {
    const method = pruningMethods.find((m) => m.id === methodId);
    if (!method) return;

    try {
      // Establecer loading state
      isLoadingTree = true;
      treeJson = null;
      
      const response = await fetch(`trees/${method.file}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const cortesData = await response.json();

      // Convertir al formato D3
      const featureNames = [
        "total_rooms",
        "total_bedrooms",
        "households",
        "median_house_value",
      ];
      
      // Forzar reactividad asignando nuevo objeto
      treeJson = convertToD3Format(cortesData, featureNames);

      console.log(`✅ Cargado exitosamente: ${method.name}`, treeJson);
    } catch (error) {
      console.error(`❌ Error cargando ${method.name}:`, error);
      // En caso de error, mostrar un árbol vacío o mensaje
      treeJson = null;
    } finally {
      isLoadingTree = false;
    }
  }

  // Manejar cambio de método de poda
  function handlePruningChange(methodId) {
    selectedPruningMethod = methodId;
    loadPruningTree(methodId);
  }

  onMount(async () => {
    // Cargar árbol 2D para la sección interactiva
    const res2 = await fetch("data/arvore_2d copy.json");
    treeJson_2d = await res2.json();

    // Cargar datos de resumen de podas
    try {
      const summaryRes = await fetch("trees/resumo_podas_housing.json");
      pruningData = await summaryRes.json();
    } catch (error) {
      console.error("Error cargando resumen de podas:", error);
    }

    // Cargar árbol inicial (original)
    await loadPruningTree("original");
  });
</script>

<!-- <div class="scroll-wrapper-default"> -->
<div
  style="background-color: var(--color-background-intro); margin-left: 8rem;"
>
  <Introduction />
</div>

<div
  class="max-w-7xl mx-auto p-6 py-40 text-justify bg-[var(--color-background)] text-[var(--color-text)] transition-colors duration-300 leading-relaxed space-y-6"
>
  <h2 class="text-3xl font-extrabold mb-6">
    {$_("section-understanding.title")}
  </h2>

  <p>
    {@html $_("section-understanding.intro.welcome", {
      values: {
        guide: `<span class="font-semibold">${$_("section-understanding.intro.guide")}</span>`,
        powerful: `<span class="font-semibold">${$_("section-understanding.intro.powerful")}</span>`,
      },
    })}
  </p>

  <p>
    {@html $_("section-understanding.intro.purpose", {
      values: {
        visual: `<span class="italic">${$_("section-understanding.intro.visual")}</span>`,
        classification: `<span class="underline">${$_("section-understanding.intro.classification")}</span>`,
        regression: `<span class="underline">${$_("section-understanding.intro.regression")}</span>`,
      },
    })}
  </p>

  <p>
    {@html $_("section-understanding.intro.pruning", {
      values: {
        pruningConcept: `<span class="font-semibold">${$_("section-understanding.intro.pruningConcept")}</span>`,
        overfitting: `<span class="italic">${$_("section-understanding.intro.overfitting")}</span>`,
      },
    })}
  </p>

  <p>
    {@html $_("section-understanding.intro.conclusion", {
      values: {
        clear: `<span class="font-medium">${$_("section-understanding.intro.clear")}</span>`,
        visual_examples: `<span class="font-medium">${$_("section-understanding.intro.visual_examples")}</span>`,
        demonstrations: `<span class="font-medium">${$_("section-understanding.intro.demonstrations")}</span>`,
      },
    })}
  </p>
</div>

<!-- <div class="scroll-wrapper-dark"> -->
<div
  class="max-w-7xl mx-auto p-6 pt-20 pb-20 text-justify transition-colors duration-300 leading-relaxed space-y-6"
  style="background-color: #2e3e5a; color: white;"
>
  <h2 class="text-3xl font-extrabold mb-6">{$_("section-what-is.title")}</h2>

  <p>
    {@html $_("section-what-is.definition", {
      values: {
        decision_tree: `<span class="font-semibold">${$_("section-what-is.decision_tree")}</span>`,
        internal_node: `<span class="italic">${$_("section-what-is.internal_node")}</span>`,
        branch: `<span class="italic">${$_("section-what-is.branch")}</span>`,
        leaves: `<span class="font-semibold">${$_("section-what-is.leaves")}</span>`,
        classification: `<span class="underline">${$_("section-what-is.classification")}</span>`,
        regression: `<span class="underline">${$_("section-what-is.regression")}</span>`,
      },
    })}
  </p>
</div>
<!-- </div> -->

<!-- Seção explicando o dataset usado -->

<div
  class="max-w-7xl mx-auto p-6 pt-20 pb-20 text-justify transition-colors duration-300 leading-relaxed space-y-6"
  style="background-color: #2e5a3d; color: white; margin-top: 80px;"
>
  <h2 class="text-3xl font-extrabold mb-6">
    {$_("section-dataset.title")}
  </h2>

  <p>{@html $_("section-dataset.paragraph1")}</p>

  <p>{@html $_("section-dataset.paragraph2")}</p>

  <p>{@html $_("section-dataset.variables_intro")}</p>

  <ul class="list-disc ml-6 space-y-2">
    <li>{@html $_("section-dataset.variables.total_rooms")}</li>
    <li>{@html $_("section-dataset.variables.total_bedrooms")}</li>
    <li>{@html $_("section-dataset.variables.households")}</li>
    <li>{@html $_("section-dataset.variables.median_house_value")}</li>
    <li>{@html $_("section-dataset.variables.city")}</li>
  </ul>

  <p>{@html $_("section-dataset.paragraph3")}</p>
</div>

<div
  class="max-w-7xl mx-auto pt-40 pb-10 text-justify transition-colors duration-300"
>
  <h2 class="text-3xl font-extrabold pb-10">
    {$_("section-tree-creation.title")}
  </h2>

  <p>
    {@html $_("section-tree-creation.description", {
      values: {
        cuts: `<span class="font-semibold">${$_("section-tree-creation.cuts")}</span>`,
      },
    })}
  </p>
</div>

<div style="background-color: var(--color-background); " class=" mt-0 mb-0">
  <div>
    <ScrollStory3 />
  </div>
</div>

<div
  class="max-w-7xl mx-auto p-6 pt-0 pb-0 text-justify transition-colors duration-300 leading-relaxed space-y-6"
  style="background-color: var(--color-background-section);"
>
  <h2 class="text-3xl font-semibold mb-4 py-8">
    {$_("section-interactive-prediction.title")}
  </h2>

  <h3 class="text-xl font-semibold mb-4">{$_("section-prediction.title")}</h3>

  <p>
    {@html $_("section-prediction.description", {
      values: {
        prediction: `<span class="font-semibold">${$_("section-prediction.prediction")}</span>`,
        root_to_leaf: `<span class="italic">${$_("section-prediction.root_to_leaf")}</span>`,
        feature: `<span class="font-mono bg-muted px-1 py-0.5 rounded">${$_("section-prediction.feature")}</span>`,
        corresponding_branch: `<span class="italic">${$_("section-prediction.corresponding_branch")}</span>`,
        unique: `<span class="underline">${$_("section-prediction.unique")}</span>`,
        leaf: `<span class="font-semibold">${$_("section-prediction.leaf")}</span>`,
        fast_interpretable: `<span class="font-medium">${$_("section-prediction.fast_interpretable")}</span>`,
      },
    })}
  </p>

  <p><b>{$_("section-interactive-prediction.practice_text")}</b></p>

  {#if treeJson_2d}
    <DecisionTree2 treeData={treeJson_2d} />
  {:else}
    <p>{$_("section-interactive-prediction.loading_tree")}</p>
    <p>{$_("section-interactive-prediction.interactive_placeholder")}</p>
  {/if}
</div>

<div class="scroll-wrapper-default mt-40">
  <div
    class="max-w-7xl mx-auto p-6 pt-20 pb-20 text-justify transition-colors duration-300 leading-relaxed space-y-6"
    style=" color: var(--color-text);"
  >
    <!-- <h2 class="text-3xl font-extrabold mb-6">{$_('section-gini.title')}</h2> -->
    <!-- <p class="mb-4">{$_('section-gini.description')}</p> -->

    <Gini />
  </div>
</div>

<div
  class="max-w-7xl mx-auto p-6 pt-20 pb-20 text-justify transition-colors duration-300 leading-relaxed space-y-6"
  style="color: var(--color-text);"
>
  <div class="max-w-7xl mx-auto px-6">
    <h2 class="text-3xl font-semibold text-center mb-4 py-8">
      {$_("cutoffs.title")}
    </h2>
    <p>{@html $_("cutoffs.paragraph")}</p>
    <CuttOffs />
  </div>
</div>

<div
  class="max-w-7xl mx-auto mt-0 p-0 pt-2 pb-0 text-center transition-colors duration-300 leading-relaxed space-y-6"
>
  <h2 class="text-5xl font-semibold mb-4 py-8">
    {$_("section-complete-tree.title")}
  </h2>

  <p class="text-justify">
    {@html $_("section-complete-tree.description", {
      values: {
        accuracy: `<span class="font-semibold">${$_("section-complete-tree.accuracy")}</span>`,
        overfitting: `<span class="italic">${$_("section-complete-tree.overfitting")}</span>`,
      },
    })}
  </p>

  <p class="text-justify"><b>{$_("section-complete-tree.example_text")}</b></p>
</div>

<!-- Pruning Controls Section -->
<div class="max-w-7xl mx-auto p-6 mb-8">
  <div
    class="bg-[var(--color-background-section)] rounded-lg border border-gray-300 p-6 shadow-lg"
  >
    <h3
      class="text-2xl font-semibold mb-4 text-center text-[var(--color-text)]"
    >
      Métodos de Poda de Árboles de Decisión
    </h3>

    <p class="text-sm text-[var(--color-text)] mb-6 text-center opacity-80">
      Selecciona un método de poda para ver cómo afecta la estructura del árbol
      de decisión
    </p>

    <!-- Pruning Method Selector -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {#each pruningMethods as method}
        <button
          class="relative p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50 text-left pruning-button"
          class:selected={selectedPruningMethod === method.id}
          class:opacity-50={isLoadingTree}
          style="border-color: {method.color}; background-color: {selectedPruningMethod ===
          method.id
            ? method.color + '20'
            : 'transparent'}; color: var(--color-text);"
          on:click={() => !isLoadingTree && handlePruningChange(method.id)}
          disabled={isLoadingTree}
        >
          <div class="flex items-start space-x-3">
            <div
              class="w-4 h-4 rounded-full mt-1 flex-shrink-0"
              style="background-color: {method.color};"
            ></div>
            <div class="flex-1">
              <h4 class="font-semibold text-sm mb-1">{method.name}</h4>
              <p class="text-xs opacity-75 leading-tight">
                {method.description}
              </p>
            </div>
          </div>
          {#if selectedPruningMethod === method.id}
            <div class="absolute top-2 right-2">
              {#if isLoadingTree}
                <svg class="animate-spin w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm6 14a6 6 0 110-12 6 6 0 010 12z"/>
                </svg>
              {:else}
                <svg
                  class="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              {/if}
            </div>
          {/if}
        </button>
      {/each}
    </div>

    <!-- Selected Method Info -->
    {#if selectedPruningMethod}
      {@const currentMethod = pruningMethods.find(
        (m) => m.id === selectedPruningMethod
      )}
      <div
        class="bg-[var(--color-background)] rounded-lg p-4 border-l-4"
        style="border-left-color: {currentMethod.color};"
      >
        <div class="flex items-center space-x-2 mb-2">
          <div
            class="w-3 h-3 rounded-full"
            style="background-color: {currentMethod.color};"
          ></div>
          <h4 class="font-semibold text-[var(--color-text)]">
            Método Seleccionado: {currentMethod.name}
          </h4>
        </div>
        <p class="text-sm text-[var(--color-text)] opacity-80">
          {currentMethod.description}
        </p>

        <!-- Show accuracy info if available -->
        {#if pruningData && pruningData.comparacion && pruningData.comparacion[currentMethod.id]}
          {@const methodData = pruningData.comparacion[currentMethod.id]}
          <div class="mt-3 text-xs text-[var(--color-text)] opacity-70">
            <span class="font-medium"
              >Precisión: {(methodData.accuracy * 100).toFixed(1)}%</span
            >
            {#if methodData.nodes !== undefined}
              | <span>Nodos: {methodData.nodes}</span>
            {/if}
            {#if methodData.depth !== undefined}
              | <span>Profundidad: {methodData.depth}</span>
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<div class="my-19 mt-10 mb-1">
  {#if isLoadingTree}
    <div class="text-center py-8">
      <div class="inline-flex items-center space-x-2 text-[var(--color-text)]">
        <svg
          class="animate-spin -ml-1 mr-3 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span>Cargando árbol de decisión...</span>
      </div>
    </div>
  {:else if treeJson}
    <DecisionTree treeData={treeJson} />
  {:else}
    <div class="text-center py-8">
      <div class="text-[var(--color-text)] opacity-60">
        <p>Error al cargar el árbol. Por favor, intenta seleccionar otro método de poda.</p>
      </div>
    </div>
  {/if}
</div>

<footer
  class="bg-[var(--color-background-section)] text-[var(--color-text)] mt-20 pt-4 pb-4 border-t border-gray-600 text-xs"
>
  <div class="max-w-7xl mx-auto px-4 text-center space-y-2">
    <!-- <p class="text-sm"> </p> -->
    <p class="text-xs text-[var(--color-text)]">
      {$_("footer.developed_by")}
    </p>
  </div>
</footer>

<style>
  .selected {
    box-shadow:
      0 0 0 2px currentColor,
      0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transform: scale(1.02);
  }

  .pruning-button {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .pruning-button:hover {
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .pruning-button:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>

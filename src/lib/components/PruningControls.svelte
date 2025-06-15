<!-- PruningControls.svelte -->
<script>
  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";

  export let selectedPruningMethod = "original";
  export let isLoadingTree = false;
  export let pruningData = null;
  export let pruningMethods = [];

  const dispatch = createEventDispatcher();

  function handlePruningChange(methodId) {
    dispatch("pruningChange", methodId);
  }
</script>

<div class="max-w-7xl mx-auto p-6 mb-8">
  <div
    class="bg-[var(--color-background-section)] rounded-lg border border-gray-300 p-6 shadow-lg"
  >
    <h3
      class="text-2xl font-semibold mb-4 text-center text-[var(--color-text)]"
    >
      {$_("pruning.title")}
    </h3>

    <p class="text-sm text-[var(--color-text)] mb-6 text-center opacity-80">
      {$_("pruning.description")}
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
                <svg
                  class="animate-spin w-5 h-5 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm6 14a6 6 0 110-12 6 6 0 010 12z"
                  />
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
            {$_("pruning.selected_method")}
            {currentMethod.name}
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
              >{$_("pruning.accuracy")}
              {(methodData.accuracy * 100).toFixed(1)}%</span
            >
            {#if methodData.nodes !== undefined}
              | <span>{$_("pruning.nodes")} {methodData.nodes}</span>
            {/if}
            {#if methodData.depth !== undefined}
              | <span>{$_("pruning.depth")} {methodData.depth}</span>
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

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

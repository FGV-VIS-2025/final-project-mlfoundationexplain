<script>
  import Header from "$lib/components/Header.svelte";
  import { onMount } from "svelte";
  import { isLoading } from "svelte-i18n";
  import "../app.css";
  import { initI18n } from "../i18n.js";

  let i18nReady = false;

  // Initialize i18n
  onMount(async () => {
    try {
      await initI18n();
      i18nReady = true;
    } catch (error) {
      console.error("Failed to initialize i18n:", error);
      // Continue without i18n if it fails
      i18nReady = true;
    }
  });
</script>

{#if i18nReady}
  <Header />
  <main>
    <slot />
  </main>
{:else}
  <!-- Loading state while i18n initializes -->
  <div class="loading-container">
    <div class="loading-spinner"></div>
  </div>
{/if}

<style>
  main {
    /* padding-top: 72px;  */
  }

  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: var(--bg-color, #f8f9fa);
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>

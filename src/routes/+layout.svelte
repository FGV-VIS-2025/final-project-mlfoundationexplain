<script>
  import Header from '$lib/components/Header.svelte';
  import '../app.css';
</script>

<Header /> <!-- Componente fixo no topo -->

<main>
  <slot /> <!-- Aqui entra o conteúdo da página atual -->
</main>

<style>
  main {
    padding-top: 72px; /* Compensar altura do cabeçalho fixo */
  }
</style>

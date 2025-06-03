<script>
  import { _ } from 'svelte-i18n';
  
  export let stepIndex;
</script>

{#if $_('step3.steps')[stepIndex]}
    <h3 class="text-xl font-semibold">{$_('step3.steps')[stepIndex].title}</h3>
    <p>{@html $_('step3.steps')[stepIndex].content}</p>
{:else}
  <p>{$_('step3.step_not_available', { values: { number: stepIndex + 1 } })}</p>
{/if}

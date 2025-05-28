<script>
  import { createEventDispatcher, onMount } from 'svelte';

  export let index;
  const dispatch = createEventDispatcher();

  let el;

  onMount(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        dispatch('enter');
      }
    }, {
      threshold: 0.5,
    });

    observer.observe(el);

    return () => observer.disconnect();
  });
</script>

<div bind:this={el} class="step">
  <h2>Passo {index + 1}</h2>
  <p>Descrição do passo {index + 1}.</p>
</div>

<style>
  .step {
    margin: 4rem 0;
    padding: 1rem;
    border-left: 4px solid #ccc;
  }
</style>

<!-- src/routes/+page.svelte -->

<script>
  import ScrollStory1 from '$lib/components/ScrollStory1.svelte';
  import ScrollStory2 from '$lib/components/ScrollStory2.svelte';
  import ScrollStory3 from '$lib/components/ScrollStory3.svelte';
  import Introduction from '$lib/components/Introduction.svelte';
  import Gini from '$lib/components/gini.svelte';
  import { _ } from 'svelte-i18n';

  import DecisionTree from '$lib/components/Tree.svelte';

  let treeJson = null;
  let treeJson_2d = null;

  import { onMount } from 'svelte';

  onMount(async () => {
    const res = await fetch('/data/arvore_d3.json');
    treeJson = await res.json();

     const res2 = await fetch('static/data/arvore_2d.json');
    treeJson_2d = await res.json();
  });
</script>



<!-- <div class="scroll-wrapper-default"> -->
  <div 
  style="background-color: var(--color-background-intro); margin-left: 8rem;">
    <Introduction />
  </div>



<div class="max-w-7xl mx-auto p-6 py-40 text-justify bg-[var(--color-background)] text-[var(--color-text)] transition-colors duration-300  leading-relaxed space-y-6">

  <h2 class="text-3xl font-extrabold  mb-6">{$_('section-understanding.title')}</h2>

  <p>
    {@html $_('section-understanding.intro.welcome', {
      values: {
        guide: `<span class="font-semibold">${$_('section-understanding.intro.guide')}</span>`,
        powerful: `<span class="font-semibold">${$_('section-understanding.intro.powerful')}</span>`
      }
    })}
  </p>

  <p>
    {@html $_('section-understanding.intro.purpose', {
      values: {
        visual: `<span class="italic">${$_('section-understanding.intro.visual')}</span>`,
        classification: `<span class="underline">${$_('section-understanding.intro.classification')}</span>`,
        regression: `<span class="underline">${$_('section-understanding.intro.regression')}</span>`
      }
    })}
  </p>

  <p>
    {@html $_('section-understanding.intro.pruning', {
      values: {
        pruningConcept: `<span class="font-semibold">${$_('section-understanding.intro.pruningConcept')}</span>`,
        overfitting: `<span class="italic">${$_('section-understanding.intro.overfitting')}</span>`
      }
    })}
  </p>

  <p>
    {@html $_('section-understanding.intro.conclusion', {
      values: {
        clear: `<span class="font-medium">${$_('section-understanding.intro.clear')}</span>`,
        visual_examples: `<span class="font-medium">${$_('section-understanding.intro.visual_examples')}</span>`,
        demonstrations: `<span class="font-medium">${$_('section-understanding.intro.demonstrations')}</span>`
      }
    })}
  </p>






</div>


<div class="scroll-wrapper-dark">
<div class="max-w-7xl mx-auto p-6 py-40 text-justify  transition-colors duration-300  leading-relaxed space-y-6">

  <h2 class="text-3xl font-extrabold  mb-6">{$_('section-what-is.title')}</h2>

  <p>
    {@html $_('section-what-is.definition', {
      values: {
        decision_tree: `<span class="font-semibold">${$_('section-what-is.decision_tree')}</span>`,
        internal_node: `<span class="italic">${$_('section-what-is.internal_node')}</span>`,
        branch: `<span class="italic">${$_('section-what-is.branch')}</span>`,
        leaves: `<span class="font-semibold">${$_('section-what-is.leaves')}</span>`,
        classification: `<span class="underline">${$_('section-what-is.classification')}</span>`,
        regression: `<span class="underline">${$_('section-what-is.regression')}</span>`
      }
    })}
  </p>

</div>
</div>


 <div style="background-color: var(--color-background);">
  <div >
    <ScrollStory3 />
  </div>
 </div>



<div class="scroll-wrapper-dark">
<div class="max-w-7xl mx-auto p-6 py-40 text-justify  transition-colors duration-300  leading-relaxed space-y-6">

  <h3 class="text-xl font-semibold mb-4">{$_('section-prediction.title')}</h3>

  <p>
    {@html $_('section-prediction.description', {
      values: {
        prediction: `<span class="font-semibold">${$_('section-prediction.prediction')}</span>`,
        root_to_leaf: `<span class="italic">${$_('section-prediction.root_to_leaf')}</span>`,
        feature: `<span class="font-mono bg-muted px-1 py-0.5 rounded">${$_('section-prediction.feature')}</span>`,
        corresponding_branch: `<span class="italic">${$_('section-prediction.corresponding_branch')}</span>`,
        unique: `<span class="underline">${$_('section-prediction.unique')}</span>`,
        leaf: `<span class="font-semibold">${$_('section-prediction.leaf')}</span>`,
        fast_interpretable: `<span class="font-medium">${$_('section-prediction.fast_interpretable')}</span>`
      }
    })}
  </p>


{#if treeJson_2d}
  <DecisionTree treeData={treeJson_2d} />
{:else}
  <p>Carregando árvore de decisão...</p>
  <p>Aqui vai uma árvore interativa, onde montamos um dado e vemos percorrer a árvore até a previsão</p>
{/if}

</div>


</div>
<div class="my-19 mt-40 mb-40">
  {#if treeJson}
    <DecisionTree treeData={treeJson} />
  {:else}
    <p>Carregando árvore de decisão...</p>
  {/if}
</div>



<!-- <div class="max-w-7xl mx-auto p-6 text-justify"> -->
 <div class="max-w-7xl mx-auto p-6 text-justify bg-[var(--color-background)] text-[var(--color-text)] transition-colors duration-300">

  <h2 class="text-2xl font-bold mb-4">{$_('page.testTitle')}</h2>

  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse euismod, nunc a fermentum dapibus, lacus nisi pretium justo, nec dignissim ipsum libero eget tortor. Etiam vehicula facilisis augue, ac accumsan libero dictum nec.
  </p>

  <p>
    Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Sed sit amet ligula dignissim, sodales elit a, feugiat justo. Integer condimentum, mauris in volutpat volutpat, tortor quam tincidunt velit, nec finibus metus sapien sit amet sapien.
  </p>

  <p>
    Curabitur vel odio nec metus egestas rutrum. Quisque nec lorem ut elit tincidunt eleifend. Aenean pretium, justo sed volutpat pulvinar, eros justo sollicitudin arcu, ut sagittis nulla elit sit amet ante. Duis sit amet urna sed orci scelerisque tincidunt.
  </p>

  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse euismod, nunc a fermentum dapibus, lacus nisi pretium justo, nec dignissim ipsum libero eget tortor. Etiam vehicula facilisis augue, ac accumsan libero dictum nec.
  </p>

  <p>
    Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Sed sit amet ligula dignissim, sodales elit a, feugiat justo. Integer condimentum, mauris in volutpat volutpat, tortor quam tincidunt velit, nec finibus metus sapien sit amet sapien.
  </p>

  <p>
    Curabitur vel odio nec metus egestas rutrum. Quisque nec lorem ut elit tincidunt eleifend. Aenean pretium, justo sed volutpat pulvinar, eros justo sollicitudin arcu, ut sagittis nulla elit sit amet ante. Duis sit amet urna sed orci scelerisque tincidunt.
  </p>
  
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse euismod, nunc a fermentum dapibus, lacus nisi pretium justo, nec dignissim ipsum libero eget tortor. Etiam vehicula facilisis augue, ac accumsan libero dictum nec.
  </p>

  <p>
    Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Sed sit amet ligula dignissim, sodales elit a, feugiat justo. Integer condimentum, mauris in volutpat volutpat, tortor quam tincidunt velit, nec finibus metus sapien sit amet sapien.
  </p>

  <p>
    Curabitur vel odio nec metus egestas rutrum. Quisque nec lorem ut elit tincidunt eleifend. Aenean pretium, justo sed volutpat pulvinar, eros justo sollicitudin arcu, ut sagittis nulla elit sit amet ante. Duis sit amet urna sed orci scelerisque tincidunt.
  </p>
</div>

 <div class="scroll-wrapper-default">
  <div class="max-w-7xl mx-auto px-6">
    <ScrollStory1 />
  </div>
 </div>

 <div class="max-w-7xl mx-auto p-6 text-justify bg-[var(--color-background)] text-[var(--color-text)] transition-colors duration-300">


  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse euismod, nunc a fermentum dapibus, lacus nisi pretium justo, nec dignissim ipsum libero eget tortor. Etiam vehicula facilisis augue, ac accumsan libero dictum nec.
  </p>

  <p>
    Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Sed sit amet ligula dignissim, sodales elit a, feugiat justo. Integer condimentum, mauris in volutpat volutpat, tortor quam tincidunt velit, nec finibus metus sapien sit amet sapien.
  </p>

  <p>
    Curabitur vel odio nec metus egestas rutrum. Quisque nec lorem ut elit tincidunt eleifend. Aenean pretium, justo sed volutpat pulvinar, eros justo sollicitudin arcu, ut sagittis nulla elit sit amet ante. Duis sit amet urna sed orci scelerisque tincidunt.
  </p>


</div>

<div class="scroll-wrapper-dark">
  <div class="max-w-7xl mx-auto px-6">
    <ScrollStory2 />
  </div>
</div>

 <div class="scroll-wrapper-default">
  <div class="max-w-7xl mx-auto px-6">
    <Gini />
  </div>
 </div>

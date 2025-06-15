<!-- src/routes/+page.svelte -->

<script>
  import ScrollStory3 from '$lib/components/ScrollStory3.svelte';
  import Introduction from '$lib/components/Introduction.svelte';
  import CuttOffs from '$lib/components/CuttOffs.svelte';
  import Gini from '$lib/components/gini.svelte';
  import { _ } from 'svelte-i18n';

  import DecisionTree from '$lib/components/Tree.svelte';

  import DecisionTree2 from '$lib/components/TreeInteractive.svelte';

  let treeJson = null;
  let treeJson_2d = null;

  import { onMount } from 'svelte';

  onMount(async () => {
    const res = await fetch('data/arvore_d3.json');
    treeJson = await res.json();

     const res2 = await fetch('data/arvore_2d copy.json');
    treeJson_2d = await res2.json();
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


<!-- <div class="scroll-wrapper-dark"> -->
 <div
  class="max-w-7xl mx-auto p-6 pt-20 pb-20 text-justify transition-colors duration-300 leading-relaxed space-y-6"
  style="background-color: #2e3e5a; color: white;"
>

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
<!-- </div> -->








<!-- Seção explicando o dataset usado -->

<div
  class="max-w-7xl mx-auto p-6 pt-20 pb-20 text-justify transition-colors duration-300 leading-relaxed space-y-6"
  style="background-color: #2e5a3d; color: white; margin-top: 80px;"
>
  <h2 class="text-3xl font-extrabold mb-6">
    {$_('section-dataset.title')}
  </h2>

  <p>{@html $_('section-dataset.paragraph1')}</p>

  <p>{@html $_('section-dataset.paragraph2')}</p>

  <p>{@html $_('section-dataset.variables_intro')}</p>

  <ul class="list-disc ml-6 space-y-2">
    <li>{@html $_('section-dataset.variables.total_rooms')}</li>
    <li>{@html $_('section-dataset.variables.total_bedrooms')}</li>
    <li>{@html $_('section-dataset.variables.households')}</li>
    <li>{@html $_('section-dataset.variables.median_house_value')}</li>
    <li>{@html $_('section-dataset.variables.city')}</li>
  </ul>

  <p>{@html $_('section-dataset.paragraph3')}</p>
</div>














<div class="max-w-7xl mx-auto pt-40 pb-10 text-justify  transition-colors duration-300 ">

  <h2 class="text-3xl font-extrabold pb-10">{$_('section-tree-creation.title')}</h2>

  <p>
    {@html $_('section-tree-creation.description', {
      values: {
        cuts: `<span class="font-semibold">${$_('section-tree-creation.cuts')}</span>`
      }
    })}
  </p>
</div>

 <div style="background-color: var(--color-background); " class=" mt-0 mb-0">
  <div >
    <ScrollStory3 />
  </div>
 </div>





<div class="max-w-7xl mx-auto p-6 pt-0 pb-0 text-justify  transition-colors duration-300  leading-relaxed space-y-6" style="background-color: var(--color-background-section);">

  <h2 class="text-3xl font-semibold mb-4 py-8">{$_('section-interactive-prediction.title')}</h2>

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

  <p><b>{$_('section-interactive-prediction.practice_text')}</b></p>


{#if treeJson_2d}
  <DecisionTree2 treeData={treeJson_2d} />
{:else}
  <p>{$_('section-interactive-prediction.loading_tree')}</p>
  <p>{$_('section-interactive-prediction.interactive_placeholder')}</p>
{/if}

</div>



<div class="scroll-wrapper-default  mt-40">
<div 
  class="max-w-7xl mx-auto  p-6 pt-20 pb-20 text-justify transition-colors duration-300 leading-relaxed space-y-6"
  style=" color: var(--color-text);"
>
  <!-- <h2 class="text-3xl font-extrabold mb-6">{$_('section-gini.title')}</h2> -->
  <!-- <p class="mb-4">{$_('section-gini.description')}</p> -->

  <Gini />
</div>
</div>


<div class="max-w-7xl mx-auto p-6 pt-20 pb-20 text-justify transition-colors duration-300 leading-relaxed space-y-6"
  style="color: var(--color-text);">

  <div class="max-w-7xl mx-auto px-6">
    <h2 class="text-3xl font-semibold text-center mb-4 py-8">{$_('cutoffs.title')}</h2>
    <p>{@html $_('cutoffs.paragraph')}</p>
    <CuttOffs />
  </div>
</div>




<div class="max-w-7xl mx-auto mt-0 p-0 pt-2 pb-0 text-center  transition-colors duration-300  leading-relaxed space-y-6" >

  <h2 class="text-5xl font-semibold mb-4 py-8">{$_('section-complete-tree.title')}</h2>

  <p class="text-justify">
    {@html $_('section-complete-tree.description', {
      values: {
        accuracy: `<span class="font-semibold">${$_('section-complete-tree.accuracy')}</span>`,
        overfitting: `<span class="italic">${$_('section-complete-tree.overfitting')}</span>`
      }
    })}
  </p>

  <p class="text-justify"><b>{$_('section-complete-tree.example_text')}</b></p>

</div>

<div class="my-19 mt-10 mb-1">
  {#if treeJson}
    <DecisionTree treeData={treeJson} />
  {:else}
    <p>{$_('section-interactive-prediction.loading_tree')}</p>
  {/if}
</div>

 <footer class="bg-[var(--color-background-section)] text-[var(--color-text)] mt-20 pt-4 pb-4 border-t border-gray-600 text-xs">
  <div class="max-w-7xl mx-auto px-4 text-center space-y-2">
    <!-- <p class="text-sm"> </p> -->
    <p class="text-xs text-[var(--color-text)]">
      {$_('footer.developed_by')}
    </p>
  </div>
</footer>

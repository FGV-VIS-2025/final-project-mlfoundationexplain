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

  import { onMount } from 'svelte';

  onMount(async () => {
    const res = await fetch('/data/arvore_d3.json');
    treeJson = await res.json();
  });
</script>


<!-- <div class="scroll-wrapper-default"> -->
  <div 
  style="background-color: var(--color-background-intro); margin-left: 8rem;">
    <Introduction />
  </div>


<!-- </div> -->
<!-- {#if treeJson}
  <DecisionTree treeData={treeJson} />
{:else}
  <p>Carregando árvore de decisão...</p>
{/if} -->

<div class="max-w-7xl mx-auto p-6 py-40 text-justify bg-[var(--color-background)] text-[var(--color-text)] transition-colors duration-300  leading-relaxed space-y-6">

  <h2 class="text-3xl font-extrabold  mb-6">Entendendo Árvores de Decisão e Poda</h2>

  <p>
    Bem-vindo ao nosso <span class="font-semibold">guia interativo sobre árvores de decisão</span> — uma das ferramentas mais <span class="font-semibold">intuitivas e poderosas</span> no campo da inteligência artificial e da ciência de dados.
  </p>

  <p>
    Este site foi criado para ajudar você a compreender, de forma <span class="italic">visual e acessível</span>, como essas estruturas funcionam, como são construídas, e por que são tão úteis para resolver problemas de <span class="underline">classificação</span> e <span class="underline">regressão</span>.
  </p>

  <p>
    Além disso, exploraremos um conceito essencial para melhorar o desempenho das árvores: <span class="font-semibold">a poda</span>. Ela reduz a complexidade do modelo, evita o <span class="italic">overfitting</span> (sobreajuste) e torna as previsões mais confiáveis com dados novos.
  </p>

  <p>
    Aqui, você encontrará <span class="font-medium">explicações claras</span>, <span class="font-medium">exemplos visuais</span> e <span class="font-medium">demonstrações passo a passo</span> para construir e otimizar árvores de decisão. Quer você seja iniciante ou já tenha experiência, nosso objetivo é tornar esses conceitos simples, interativos e aplicáveis.
  </p>






</div>


<div class="scroll-wrapper-dark">
<div class="max-w-7xl mx-auto p-6 py-40 text-justify  transition-colors duration-300  leading-relaxed space-y-6">

  <h2 class="text-3xl font-extrabold  mb-6">O que é?</h2>

  <p>
  Uma <span class="font-semibold">árvore de decisão</span> é um modelo preditivo que representa uma série de decisões estruturadas em forma de árvore, onde cada <span class="italic">nó interno</span> corresponde a uma pergunta ou condição baseada nas características dos dados, e cada <span class="italic">ramo</span> leva a uma possível resposta ou divisão. As <span class="font-semibold">folhas</span> da árvore indicam o resultado final, como uma classe ou valor numérico. Esse modelo é amplamente utilizado em tarefas de <span class="underline">classificação</span> e <span class="underline">regressão</span> devido à sua interpretação intuitiva: ele simula um processo de tomada de decisão sequencial, em que seguimos um caminho lógico com base nas entradas até chegar a uma conclusão.
</p>

</div>
</div>


 <div style="background-color: var(--color-background);">
  <div >
    <ScrollStory3 />
  </div>
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

<!-- src/routes/+page.svelte -->
<div class="max-w-4xl mx-auto p-6 text-justify">
  <h2 class="text-2xl font-bold mb-4">Página de Teste</h2>

  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse euismod, nunc a fermentum dapibus, lacus nisi pretium justo, nec dignissim ipsum libero eget tortor. Etiam vehicula facilisis augue, ac accumsan libero dictum nec.
  </p>

  <p>
    Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Sed sit amet ligula dignissim, sodales elit a, feugiat justo. Integer condimentum, mauris in volutpat volutpat, tortor quam tincidunt velit, nec finibus metus sapien sit amet sapien.
  </p>

  <p>
    Curabitur vel odio nec metus egestas rutrum. Quisque nec lorem ut elit tincidunt eleifend. Aenean pretium, justo sed volutpat pulvinar, eros justo sollicitudin arcu, ut sagittis nulla elit sit amet ante. Duis sit amet urna sed orci scelerisque tincidunt.
  </p>

  <!-- Repita mais vezes para testar rolagem -->
  {#each Array(20) as _, i}
    <p class="my-4">
      <strong>Parágrafo {i + 1}:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras nec felis sed lorem suscipit consequat. In fermentum libero nec ligula fermentum, at vehicula arcu malesuada.
    </p>
  {/each}
</div>

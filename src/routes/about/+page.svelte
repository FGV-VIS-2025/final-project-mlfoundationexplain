<script>
  // adicionar as imagens com os gráficos sem sobreposição
  import corte from '$lib/image/corte2d.png';
  import corteTree from '$lib/image/corteeArv.png';
  import prev from '$lib/image/previsao.png';
  import { _ } from 'svelte-i18n';
</script>

<div class="max-w-7xl mx-auto p-6 py-40 text-justify bg-[var(--color-background)] text-[var(--color-text)] transition-colors duration-300 leading-relaxed space-y-6">

  <h2 class="text-3xl font-extrabold mb-6">{$_('about.presentation-title')}</h2>

  <p>
    {$_('about.presentation-text')}
  </p>

  <div>
  
    <h2 class="text-3xl font-extrabold mb-6">{$_('about.resume-title')}</h2>

    <p>
      {$_('about.resume-text')} <strong>{$_('about.modules')}</strong> {$_('about.resume-text2')} <strong>{$_('about.models')}</strong>
    </p>

    <p>{$_('about.list-title')}</p>
      <ul>
        <li>{$_('about.item1')}</li>
        <li>{$_('about.item2')}</li>
        <li>{$_('about.item3')}</li>
        <li>{$_('about.item4')}</li>
        <li>{$_('about.item5')}</li>
      </ul>

    <br>
    <p>{$_('about.accessibility')}</p>
      <ul>
        <li>{$_('about.acc-list1')}</li>
        <li>{$_('about.acc-list2')}</li>
      </ul>

    <section class="space-y-8">
      <h2 class="text-2xl font-bold">{$_('about.images')}</h2>

      <div class="flex flex-col gap-8 items-center">
        
        <div class="text-center">
          <img src="{corteTree}" alt="Corte e Árvore" class="w-[700px] max-w-full rounded-xl shadow-md" />
          <p class="mt-2 text-sm text-gray-600">Visualização combinada da árvore de decisão e seus cortes no plano.</p>
        </div>
        <div class="text-center">
          <img src="{prev}" alt="Previsão" class="w-[700px] max-w-full rounded-xl shadow-md" />
          <p class="mt-2 text-sm text-gray-600">Resultado das previsões do modelo em relação aos dados originais.</p>
        </div>
        
        <div class="text-center">
          <img src="{corte}" alt="Corte 2D" class="w-[700px] max-w-full rounded-xl shadow-md" />
          <p class="mt-2 text-sm text-gray-600">Corte em 2D representando a separação das classes.</p>
        </div>
      </div>
    </section>


    <br>
    <h2 class="text-3xl font-extrabold mb-6">{$_('about.article-title')}</h2>
    <p>
      <a href="https://github.com/FGV-VIS-2025/final-project-mlfoundationexplain/blob/main/Artigo/relatorio.pdf" target="_blank" rel="noopener noreferrer">
        <span class="underline">{$_('about.click')}</span> {$_('about.article-text')}
      </a>
    </p>


    <h2 class="text-3xl font-extrabold mb-6" >{$_('about.video-title')}</h2>
    <div>
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/SEU_VIDEO_ID"
        title="Vídeo de apresentação"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
    
    <br>
    <h2 class="text-3xl font-extrabold mb-6">{$_('about.team-members')}</h2>
    <ul>
      <li>Paula Eduarda de Lima</li>
      <li>Mariana Fernandes Rocha</li>
      <li>Joel Perca</li>
    </ul>


    <br>

    <h2 class="text-3xl font-extrabold mb-6">{$_('about.instructions-title')}</h2>
    <p>
    {$_('about.instructions-text')} <strong><em>SvelteKit</em></strong>. {$_('about.local-run')}
    </p>
      <ul class="list-disc list-inside space-y-1">
        <li>{$_('about.run-step1')}</li>
        <li>{$_('about.run-step2')}<strong><em>npm install</em></strong></li>
        <li>{$_('about.run-step3')}<strong><em>npm run dev</em></strong></li>
        <li>
          {$_('about.run-step4')}
          <span class="underline">http://localhost:5173</span>
          {$_('about.run-step5')}
        </li>
      </ul>


  </div>
</div>

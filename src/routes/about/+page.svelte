<script>
  // adicionar as imagens com os gráficos sem sobreposição
  import corte from '$lib/image/corte2d.png';
  import corteTree from '$lib/image/corteEArvore.png';
  import prev from '$lib/image/previsao.png';
</script>

<div class="max-w-7xl mx-auto p-6 py-40 text-justify bg-[var(--color-background)] text-[var(--color-text)] transition-colors duration-300 leading-relaxed space-y-6">

  <h2 class="text-3xl font-extrabold mb-6">Apresentação</h2>

  <p>
  Na aba Início, você encontrará nossa visualização interativa que orienta a explicação do 
  funcionamento do algoritmo de árvore de decisão. Além de mostrar a estrutura da árvore, 
  oferecemos visualizações dinâmicas que ajudam a entender o processo de construção da árvore, 
  permitindo o entendimento da escolha dos cortes que definem suas divisões.
</p>

  <div>
  
    <h2 class="text-3xl font-extrabold mb-6">Resumo do Projeto</h2>

    <p>
      A plataforma apresenta <strong>módulos visuais e interativos</strong> que facilitam a compreensão dos 
      <strong>modelos baseados em árvores binárias</strong>. 
    </p>

    <p>Entre os principais recursos estão:</p>
      <ul>
        <li>Construção dinâmica da árvore de decisão junto aos cortes no espaço 2D dos dados</li>
        <li>Simulações de predição interativas</li>
        <li>Gráficos das métricas de impureza (Índice de Gini e Entropia)</li>
        <li>Histogramas que ilustram os cortes univariados</li>
        <li>Dendograma que ilustra a poda manual de árvores complexas</li>
      </ul>

    <br>
    <p>O projeto também foi desenvolvido com foco em acessibilidade e personalização, incluindo:</p>
      <ul>
        <li>Suporte multilíngue (Português, Espanhol e Inglês)</li>
        <li>Alternância entre temas claro e escuro</li>
      </ul>

    <!-- <section class="space-y-8">
  <h2 class="text-2xl font-bold underline">Visualizações do Modelo</h2>

  <div class="flex flex-col gap-8 items-center">
    <div class="text-center">
      <img src="{corte}" alt="Corte 2D" class="max-w-full rounded-xl shadow-md" />
      <p class="mt-2 text-sm text-gray-600">Corte em 2D representando a separação das classes.</p>
    </div>

    <div class="text-center">
      <img src="{corteTree}" alt="Corte e Árvore" class="max-w-full rounded-xl shadow-md" />
      <p class="mt-2 text-sm text-gray-600">Visualização combinada da árvore de decisão e seus cortes no plano.</p>
    </div>

    <div class="text-center">
      <img src="{prev}" alt="Previsão" class="max-w-full rounded-xl shadow-md" />
      <p class="mt-2 text-sm text-gray-600">Resultado das previsões do modelo em relação aos dados originais.</p>
    </div>
  </div>
</section> -->

    <br>
    <h2 class="text-3xl font-extrabold mb-6">Artigo</h2>
    <p>
      <a href="https://exemplo.com/artigo" target="_blank" rel="noopener noreferrer">
        <span class="underline">Clique aqui</span> para acessar o artigo completo
      </a>
    </p>


    <h2 class="text-3xl font-extrabold mb-6" >Vídeo de Apresentação</h2>
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
    <h2 class="text-3xl font-extrabold mb-6">Membros da Equipe</h2>
    <ul>
      <li>Paula Eduarda de Lima</li>
      <li>Mariana Fernandes Rocha</li>
      <li>Joel Perca</li>
    </ul>


    <br>

    <h2 class="text-3xl font-extrabold mb-6">Instruções de Execução</h2>
    <p>
    Este projeto foi criado usando <strong><em>SvelteKit</em></strong>. Para rodar localmente:
    </p>
      <ul class="list-disc list-inside space-y-1">
        <li>Clone o repositório acessível por meio da aba "GitHub" no menu desta página.</li>
        <li>Instale as dependências com <strong><em>npm install</em></strong></li>
        <li>Rode o servidor de desenvolvimento com <strong><em>npm run dev</em></strong></li>
        <li>
          Acesse no navegador 
          <span class="underline">http://localhost:5173</span>
          (ou a porta informada no terminal)
        </li>
      </ul>


  </div>
</div>

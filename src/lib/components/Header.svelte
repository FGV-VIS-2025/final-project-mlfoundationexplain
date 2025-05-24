<script>
  import { onMount } from 'svelte';

  let scrollProgress = 0;

  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = (scrollTop / docHeight) * 100;
  }

  onMount(() => {
    updateScrollProgress(); // inicializa corretamente
    window.addEventListener('scroll', updateScrollProgress);
    return () => window.removeEventListener('scroll', updateScrollProgress);
  });
</script>



<header class="header">
  <!-- Barra de progresso -->
  <!-- <div class="scroll-progress" style="width: {scrollProgress}%;"></div> -->

  <div class="container">
    <h1 class="site-title">Árvore de decisão</h1>

    <nav class="nav-links">
      <a href="/">Início</a>
      <a href="/https://github.com/FGV-VIS-2025/final-project-mlfoundationexplain#">GitHub</a>
      <!-- <a href="/contato">Contato</a> -->
    </nav>

    <!-- Botão de idioma -->
    <button class="lang-button" aria-label="Selecionar idioma">
      🌐 Idioma
    </button>
  </div>

  <div class="scroll-progress" style="width: {scrollProgress}%;"></div>
</header>

<style>
  .header {
    position: sticky;
    top: 0;
    z-index: 50;
    background-color: #182c64;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
  .lang-button {
  background-color: #0e4f9e; /* azul vibrante */
  color: white;
  font-weight: 600;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-left: 1rem;
}

  .lang-button:hover {
    background-color: #07143f; /* azul mais escuro no hover */
  }


  .scroll-progress {
    height: 4px;
    background-color: #1660bb; /* azul claro */
    transition: width 0.2s ease;
  }

  .container {
    max-width: 1120px;
    margin: 0 auto;
    padding: 0.5rem 1.2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .site-title {
    font-size: 1.5rem;
    font-weight: 800;
    color: white;
    letter-spacing: 0.05em;
  }

  .nav-links {
    display: flex;
    gap: 2rem;
  }

  .nav-links a {
    color: white;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.3s;
  }

  .nav-links a:hover {
    color: #93c5fd;
  }
</style>

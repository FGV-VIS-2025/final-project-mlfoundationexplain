<script>
  import { onMount } from "svelte";
  import { _, locale, locales } from "svelte-i18n";
  import { changeLocale } from "../../i18n.js";

  let scrollProgress = 0;
  let darkMode = false;

  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = (scrollTop / docHeight) * 100;
  }

  onMount(() => {
    // Inicializa barra de rolagem
    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress);

    // Inicializa tema
    darkMode = localStorage.getItem("theme") === "dark";
    updateTheme();

    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
    };
  });

  function toggleTheme() {
    darkMode = !darkMode;
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    updateTheme();
  }

  function updateTheme() {
    document.documentElement.classList.toggle("dark", darkMode);
  }

  async function toggleLanguage() {
    const newLang = $locale === "pt" ? "en" : "pt";
    changeLocale(newLang);
  }

  // Opções de idioma (código + nome exibido)
  const languages = [
    { code: "en", label: "🇺🇸 English" },
    { code: "pt", label: "🇧🇷 Português" },
    { code: "es", label: "🇪🇸 Español" }
  ];

  // Troca idioma ao selecionar
  function onLanguageChange(event) {
    const newLang = event.target.value;
    changeLocale(newLang);
  }
</script>

<header class="header">
  <!-- Barra de progresso -->
  <!-- <div class="scroll-progress" style="width: {scrollProgress}%;"></div> -->

  <div class="container">
    <div class="left">
      <h1 class="site-title">{$_("header.title")}</h1>
    </div>

    <div class="right">
      <nav class="nav-links">
        <a href="./">{$_("header.home")}</a>
        <a
          href="https://github.com/FGV-VIS-2025/final-project-mlfoundationexplain"
          >GitHub</a
        >
      </nav>

      <div class="header-buttons">
        <!-- Seletor de idioma -->
        <select
          class="lang-select"
          bind:value={$locale}
          on:change={onLanguageChange}
          aria-label={$_("header.language")}
        >
          {#each languages as lang}
            <option value={lang.code}>{lang.label}</option>
          {/each}
        </select>

        <button
          class="theme-button"
          on:click={toggleTheme}
          aria-label="Alternar tema"
        >
          {darkMode ? $_("header.theme.light") : $_("header.theme.dark")}
        </button>
      </div>
    </div>
  </div>

  <div class="scroll-progress" style="width: {scrollProgress}%;"></div>
</header>

<style>
  .header {
    position: sticky;
    top: 0;
    z-index: 50;
    background-color: var(--color-secondary);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
  .lang-select,
  .theme-button {
    background-color: var(--color-primary);
    color: var(--color-text-auxiliary);
    font-weight: 600;
    padding: 0.4rem 0.75rem;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .lang-select:hover,
  .theme-button:hover {
    background-color: #07143f;
  }

  .scroll-progress {
    height: 4px;
    background-color: var(--color-accent);
    transition: width 0.2s ease;
  }

  .container {
    max-width: 1120px;
    margin: 0 auto;
    padding: 0.5rem 1.2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .site-title {
    font-size: 2.3em;
    font-weight: 800;
    color: var(--color-text-title);
    letter-spacing: 0.05em;
    margin: 0;
  }

  .nav-links {
    display: flex;
    gap: 2rem;
  }

  .nav-links a {
    color: var(--color-text);
    font-weight: 600;
    text-decoration: none;
    transition: color 0.3s;
  }

  .nav-links a:hover {
    color: #93c5fd;
  }

  .header-buttons {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .left {
    display: flex;
    align-items: center;
    flex: 1;
    margin-right: 0rem;
  }

  .right {
    display: flex;
    align-items: center;
    gap: 4rem;
  }
</style>

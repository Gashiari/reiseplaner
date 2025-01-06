<script>
  import { onMount } from 'svelte';
  let currentPath = '/'; // Standardwert für den Server

  // Zugriff auf die aktuelle URL nur im Browser
  onMount(() => {
    currentPath = window.location.pathname;
  });
</script>

<svelte:head>
  <!-- Globale CSS-Datei einbinden -->
  <link rel="stylesheet" href="/src/global.css" />
</svelte:head>

<!-- Navigation -->
<nav>
  <ul class="navbar">
    <li>
      <a href="/" class:active={currentPath === '/'}>Reiseplaner</a>
    </li>
    <li>
      <a href="/trips" class:active={currentPath.startsWith('/trips') && currentPath !== '/trips/new'}>Meine Reisen</a>
    </li>
    <li>
      <a href="/trips/new" class:active={currentPath === '/trips/new'}>Neue Reise</a>
    </li>
  </ul>
</nav>

<!-- Seiteninhalt -->
<slot />

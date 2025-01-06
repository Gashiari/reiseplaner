<script>
  import { onMount } from 'svelte';
  let currentPath = '/'; // Standardwert für den Server

  // Zugriff auf die aktuelle URL nur im Browser
  onMount(() => {
    currentPath = window.location.pathname;
  });
</script>

<svelte:head>
  <link rel="stylesheet" href="/global.css" />
</svelte:head>

<!-- Navigation -->
<nav>
  <ul class="navbar">
    <li>
      <a href="/">Reiseplaner</a>
    </li>
    <li>
      <a href="/trips">Meine Reisen</a>
    </li>
    <li>
      <a href="/trips/new">Neue Reise</a>
    </li>
  </ul>
</nav>

<!-- Seiteninhalt -->
<slot />

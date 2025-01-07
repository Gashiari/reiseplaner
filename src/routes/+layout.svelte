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
<nav style="display: flex; align-items: center; justify-content: space-between; padding: 10px;">
  <ul class="navbar" style="display: flex; gap: 15px; margin: 0; padding: 0; list-style: none;">
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
  <div style="margin-left: auto; margin-right: 20px;">
    <img src="/img/Reiseplaner.jpg" alt="Reiseplaner Logo" style="height: 40px;" />
  </div>
</nav>

<!-- Seiteninhalt -->
<slot />

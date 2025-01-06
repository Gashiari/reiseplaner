<script>
  import { onMount } from 'svelte';

  let trips = [];

  // Trips laden
  async function loadTrips() {
    try {
      const response = await fetch('/api/trips');
      if (!response.ok) {
        throw new Error('Fehler beim Abrufen der Reisen.');
      }
      trips = await response.json();

      // Trips nach Startdatum sortieren
      trips.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    } catch (error) {
      alert(error.message);
    }
  }

  // Trips beim Mounten laden
  onMount(loadTrips);
</script>

<div class="container">
  <h1>Meine Reisen</h1>

  {#if trips.length > 0}
    <div class="trip-list">
      {#each trips as trip}
        <div class="trip-card">
          <h2>{trip.name}</h2>
          <p><strong>Startort:</strong> {trip.startLocation} ({trip.startDate})</p>
          <p><strong>Zielort:</strong> {trip.destination} ({trip.endDate})</p>
          <p><strong>Budget:</strong> {trip.budget} CHF</p>
          <p><strong>Gesamtdistanz:</strong> {trip.totalDistance} km</p>
          <div class="button-group">
            <button class="view-trip-button" on:click={() => (window.location.href = `/trips/${trip._id}`)}>
              Reise anzeigen
            </button>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <p>Keine Reisen gefunden.</p>
  {/if}
</div>

<svelte:head>
  <link rel="stylesheet" href="/src/global.css" />
</svelte:head>

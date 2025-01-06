<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { get } from 'svelte/store';

  let trip = null;
  let error = null;
  let map;
  let isEditing = false;
  let updatedName;
  let updatedBudget;
  let updatedStartDate;
  let updatedEndDate;
  let updatedDates = [];

  const tripId = get(page).params.id;

  async function loadTrip() {
    try {
      const response = await fetch(`/api/trips/${tripId}`);
      if (!response.ok) {
        throw new Error('Fehler beim Abrufen der Reise.');
      }
      trip = await response.json();
      updatedName = trip.name;
      updatedBudget = trip.budget;
      updatedStartDate = trip.startDate;
      updatedEndDate = trip.endDate;
      updatedDates = trip.waypoints.map((waypoint) => waypoint.date);
    } catch (err) {
      error = err.message;
    }
  }

  async function initializeMap() {
    if (typeof window !== 'undefined') {
      const L = await import('leaflet');

      if (trip) {
        map = L.map('map').setView([trip.startLocationCoords.lat, trip.startLocationCoords.lng], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        L.marker([trip.startLocationCoords.lat, trip.startLocationCoords.lng])
          .addTo(map)
          .bindPopup(`<strong>Startort:</strong> ${trip.startLocation}`)
          .openPopup();

        L.marker([trip.destinationCoords.lat, trip.destinationCoords.lng])
          .addTo(map)
          .bindPopup(`<strong>Zielort:</strong> ${trip.destination}`);

        const polylineCoordinates = [trip.startLocationCoords];
        if (trip.coordinates.waypoints && trip.coordinates.waypoints.length > 0) {
          trip.coordinates.waypoints.forEach((waypoint, index) => {
            if (waypoint) {
              L.marker([waypoint.lat, waypoint.lng])
                .addTo(map)
                .bindPopup(`<strong>Zwischenziel:</strong> ${trip.waypoints[index].location}`);
              polylineCoordinates.push(waypoint);
            }
          });
        }
        polylineCoordinates.push(trip.destinationCoords);

        L.polyline(
          polylineCoordinates.map((coord) => [coord.lat, coord.lng]),
          {
            color: 'red',
            weight: 2,
            opacity: 0.7,
            dashArray: '5, 5',
          }
        ).addTo(map);
      }
    }
  }

  function formatDate(date) {
    if (!date) return 'Kein Datum';
    const [year, month, day] = date.split('-');
    return `${day}.${month}.${year}`;
  }

  async function saveChanges() {
    try {
      const updatedTrip = {
        name: updatedName,
        budget: updatedBudget,
        startDate: updatedStartDate,
        endDate: updatedEndDate,
        waypoints: trip.waypoints.map((waypoint, index) => ({
          ...waypoint,
          date: updatedDates[index],
        })),
      };

      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTrip),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern der Änderungen.');
      }

      alert('Änderungen erfolgreich gespeichert!');
      isEditing = false;
      await loadTrip();
    } catch (err) {
      alert(err.message);
    }
  }

  async function deleteTrip() {
    if (confirm('Möchten Sie diese Reise wirklich löschen?')) {
      try {
        const response = await fetch(`/api/trips/${tripId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Fehler beim Löschen der Reise.');
        }

        alert('Reise erfolgreich gelöscht!');
        window.location.href = '/trips';
      } catch (err) {
        alert(err.message);
      }
    }
  }

  onMount(async () => {
    await loadTrip();
    if (trip) await initializeMap();
  });
</script>

<div class="container">
  {#if error}
    <p>{error}</p>
  {:else if trip}
    {#if isEditing}
      <div>
        <label for="name"><strong>Name der Reise:</strong></label>
        <input id="name" type="text" bind:value={updatedName} />

        <label for="budget"><strong>Budget:</strong></label>
        <input id="budget" type="number" bind:value={updatedBudget} min="0" />

        <label for="startDate"><strong>Startdatum:</strong></label>
        <input id="startDate" type="date" bind:value={updatedStartDate} />

        <label for="endDate"><strong>Enddatum:</strong></label>
        <input id="endDate" type="date" bind:value={updatedEndDate} />

        {#if trip.waypoints && trip.waypoints.length > 0}
          <h2>Zwischenziele</h2>
          {#each trip.waypoints as waypoint, index}
            <div>
              <p>{waypoint.location}</p>
              <label for={`date-${index}`}><strong>Datum:</strong></label>
              <input id={`date-${index}`} type="date" bind:value={updatedDates[index]} />
            </div>
          {/each}
        {/if}

        <button on:click={saveChanges}>Änderungen speichern</button>
        <button on:click={() => (isEditing = false)}>Abbrechen</button>
      </div>
    {:else}
      <h1>{trip.name}</h1>
      <p><strong>Startort:</strong> {trip.startLocation} ({formatDate(trip.startDate)})</p>
      <p><strong>Zielort:</strong> {trip.destination} ({formatDate(trip.endDate)})</p>
      <p><strong>Budget:</strong> {trip.budget} CHF</p>
      <p><strong>Gesamtdistanz:</strong> {trip.totalDistance} km</p>

      {#if trip.waypoints && trip.waypoints.length > 0}
        <h2>Zwischenziele</h2>
        {#each trip.waypoints as waypoint}
          <p>{waypoint.location} ({formatDate(waypoint.date)})</p>
        {/each}
      {/if}

      <div class="button-group">
        <button on:click={() => (window.location.href = '/trips')} class="back-button">Zurück</button>
        <button on:click={() => (isEditing = true)}>Bearbeiten</button>
        <button on:click={deleteTrip} class="delete-button">Löschen</button>
      </div>
    {/if}

    <div id="map" class="map"></div>
  {:else}
    <p>Reisedetails werden geladen...</p>
  {/if}
</div>

<svelte:head>
  <link rel="stylesheet" href="/global.css" />
</svelte:head>

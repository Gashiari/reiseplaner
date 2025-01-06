<script>
  import { onMount } from 'svelte';
  import L from 'leaflet';

  let name = '';
  let startLocation = '';
  let destination = '';
  let startDate = '';
  let endDate = '';
  let budget = 0;
  let waypoints = []; // Zwischenziele als { location, date }
  let map;
  let coordinates = {
    startLocation: null,
    destination: null,
    waypoints: []
  };
  let totalDistance = 0;
  let polyline;

  // Funktion zur Berechnung der Entfernung (Haversine-Formel)
  function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Erdradius in Kilometern
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Entfernung in Kilometern
  }

  // Funktion zum Abrufen von Städten aus der Datenbank
  async function fetchCities(cityName) {
    const response = await fetch(`/api/places?city=${cityName}`);
    if (!response.ok) {
      alert('Fehler beim Abrufen der Städte.');
      return [];
    }
    const data = await response.json();
    return data;
  }

  // Marker und Polyline zur Karte hinzufügen
  async function addMarker(cityName, positionIndex = null) {
    const cities = await fetchCities(cityName);
    if (cities.length > 0) {
      const { lat, lng, city_ascii } = cities[0];
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`${city_ascii}`)
        .openPopup();

      if (positionIndex === 0) {
        coordinates.startLocation = { lat, lng };
      } else if (positionIndex === waypoints.length + 1) {
        coordinates.destination = { lat, lng };
      } else {
        coordinates.waypoints[positionIndex - 1] = { lat, lng };
      }

      // Polyline aktualisieren
      updatePolyline();
    }
  }

  // Polyline aktualisieren
  function updatePolyline() {
    if (polyline) {
      map.removeLayer(polyline);
    }

    const allCoordinates = [
      coordinates.startLocation,
      ...coordinates.waypoints,
      coordinates.destination
    ].filter(Boolean); // Filtert ungültige Koordinaten

    polyline = L.polyline(allCoordinates.map(coord => [coord.lat, coord.lng]), {
      color: 'red',
      weight: 2,
      opacity: 0.7,
      dashArray: '10,5',
    }).addTo(map);

    // Gesamtdistanz berechnen
    totalDistance = 0;
    for (let i = 0; i < allCoordinates.length - 1; i++) {
      const { lat: lat1, lng: lng1 } = allCoordinates[i];
      const { lat: lat2, lng: lng2 } = allCoordinates[i + 1];
      totalDistance += calculateDistance(lat1, lng1, lat2, lng2);
    }
  }

  // Zwischenziele hinzufügen
  function addWaypoint() {
    waypoints = [...waypoints, { location: '', date: '' }];
    coordinates.waypoints.push(null); // Platz für neue Koordinaten
  }

  // Prüfung von Start- und Enddatum
  function validateDates() {
    const today = new Date().toISOString().split('T')[0];

    if (!startDate || !endDate) {
      alert('Start- und Enddatum müssen ausgefüllt sein.');
      return false;
    }

    if (startDate < today) {
      alert('Das Startdatum darf nicht in der Vergangenheit liegen.');
      return false;
    }

    if (endDate < startDate) {
      alert('Das Enddatum darf nicht vor dem Startdatum liegen.');
      return false;
    }

    return true;
  }

  // Reise speichern
  async function saveTrip() {
    if (!validateDates()) {
      return;
    }

    if (!name || !startLocation || !destination || budget < 0) {
      alert('Bitte alle Felder korrekt ausfüllen.');
      return;
    }

    const tripData = {
      name,
      startLocation,
      destination,
      startDate,
      endDate,
      budget,
      waypoints,
      coordinates,
      totalDistance: totalDistance.toFixed(2), // Gesamtdistanz speichern
    };

    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripData),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern der Reise.');
      }

      alert('Reise erfolgreich gespeichert!');
    } catch (error) {
      alert(error.message);
    }
  }

  // Leaflet-Karte initialisieren
  onMount(() => {
    map = L.map('map').setView([47.3769, 8.5417], 13); // Standardposition: Zürich
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);
  });
</script>

<div class="container">
  <h1>Neue Reise erstellen</h1>
  <form>
    <label for="name">Name der Reise:</label>
    <input id="name" bind:value={name} placeholder="Name der Reise" required />

    <label for="startLocation">Startort:</label>
    <input
      id="startLocation"
      bind:value={startLocation}
      placeholder="Startort"
      required
      on:change={() => addMarker(startLocation, 0)}
    />

    <label for="destination">Zielort:</label>
    <input
      id="destination"
      bind:value={destination}
      placeholder="Zielort"
      required
      on:change={() => addMarker(destination, waypoints.length + 1)}
    />

    <label for="startDate">Startdatum:</label>
    <input id="startDate" bind:value={startDate} type="date" required />

    <label for="endDate">Enddatum:</label>
    <input id="endDate" bind:value={endDate} type="date" required />

    <label for="budget">Budget (CHF):</label>
    <input id="budget" bind:value={budget} type="number" min="0" required />

    <label for="waypoints">Zwischenziele:</label>
    <div id="waypoints-list">
      {#each waypoints as waypoint, index (index)}
        <div>
          <input
            type="text"
            bind:value={waypoint.location}
            placeholder={`Zwischenziel ${index + 1}`}
            on:change={() => addMarker(waypoint.location, index + 1)}
          />
          <input
            type="date"
            bind:value={waypoint.date}
            placeholder="Datum"
          />
        </div>
      {/each}
    </div>

    <button type="button" on:click={addWaypoint}>Zwischenziel hinzufügen</button>
    <button type="button" on:click={saveTrip}>Speichern</button>
  </form>

  <p>Gesamtdistanz: {totalDistance.toFixed(2)} km</p>

  <div id="map" class="map"></div>
</div>

<svelte:head>
  <link rel="stylesheet" href="/src/global.css" />
</svelte:head>

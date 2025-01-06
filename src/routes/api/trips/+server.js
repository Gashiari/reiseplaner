import { json } from '@sveltejs/kit';
import { connectToDB } from '$lib/db'; // Verbindung zur MongoDB

export async function GET() {
    const db = await connectToDB(); // Verbindung zur Datenbank herstellen
    try {
        const trips = await db
            .collection('trips')
            .find()
            .sort({ startDate: 1 }) // Sortiere nach Startdatum (älteste zuerst)
            .toArray(); // Reisen abrufen
        return json(trips);
    } catch (error) {
        console.error('Fehler beim Abrufen der Reisen:', error);
        return json({ error: 'Fehler beim Abrufen der Reisen.' }, { status: 500 });
    }
}

export async function POST({ request }) {
    const db = await connectToDB(); // Verbindung zur Datenbank herstellen
    try {
        const tripData = await request.json();

        // Städteinformationen überprüfen und formatieren
        const citiesCollection = db.collection('cities');
        const startCity = await citiesCollection.findOne({ city_ascii: tripData.startLocation });
        const destinationCity = await citiesCollection.findOne({ city_ascii: tripData.destination });

        if (!startCity || !destinationCity) {
            return json({ error: 'Ungültige Start- oder Zielstadt.' }, { status: 400 });
        }

        tripData.startLocationCoords = { lat: startCity.lat, lng: startCity.lng };
        tripData.destinationCoords = { lat: destinationCity.lat, lng: destinationCity.lng };

        // Zwischenziele validieren
        if (tripData.waypoints && tripData.waypoints.length > 0) {
            const waypointCoords = [];
            for (const waypoint of tripData.waypoints) {
                const waypointCity = await citiesCollection.findOne({ city_ascii: waypoint });
                if (waypointCity) {
                    waypointCoords.push({ lat: waypointCity.lat, lng: waypointCity.lng });
                } else {
                    waypointCoords.push(null); // Ungültiges Zwischenziel
                }
            }
            tripData.waypointsCoords = waypointCoords;
        }

        // Überprüfen, ob ein Trip mit demselben Namen bereits existiert
        const existingTrip = await db.collection('trips').findOne({ name: tripData.name });
        if (existingTrip) {
            // Wenn ein Trip existiert, aktualisiere ihn
            const updateResult = await db
                .collection('trips')
                .updateOne({ name: tripData.name }, { $set: tripData });
            return json(updateResult, { status: 200 });
        }

        // Neuen Trip erstellen, wenn keiner existiert
        const result = await db.collection('trips').insertOne(tripData); // Reise speichern
        return json(result, { status: 201 });
    } catch (error) {
        console.error('Fehler beim Speichern der Reise:', error);
        return json({ error: 'Fehler beim Speichern der Reise.' }, { status: 500 });
    }
}

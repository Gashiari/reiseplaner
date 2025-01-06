import { json } from '@sveltejs/kit';
import { connectToDB } from '$lib/db'; // Verbindung zur MongoDB
import { ObjectId } from 'mongodb'; // ObjectId-Objekt für MongoDB

export async function GET({ params }) {
  const db = await connectToDB(); // Verbindung zur Datenbank herstellen
  const { id } = params; // ID aus den Routenparametern
  try {
    const trip = await db.collection('trips').findOne({ _id: new ObjectId(id) });
    if (!trip) {
      return json({ error: 'Reise nicht gefunden.' }, { status: 404 });
    }
    return json(trip);
  } catch (error) {
    console.error('Fehler beim Abrufen der Reise:', error);
    return json({ error: 'Fehler beim Abrufen der Reise.' }, { status: 500 });
  }
}

export async function PUT({ params, request }) {
  const db = await connectToDB(); // Verbindung zur Datenbank herstellen
  const { id } = params; // ID aus den Routenparametern
  try {
    const updatedData = await request.json();
    const result = await db.collection('trips').updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );

    if (result.matchedCount === 0) {
      return json({ error: 'Reise nicht gefunden.' }, { status: 404 });
    }

    return json({ message: 'Reise erfolgreich aktualisiert.' }, { status: 200 });
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Reise:', error);
    return json({ error: 'Fehler beim Aktualisieren der Reise.' }, { status: 500 });
  }
}

export async function DELETE({ params }) {
  const db = await connectToDB(); // Verbindung zur Datenbank herstellen
  const { id } = params; // ID aus den Routenparametern
  try {
    const result = await db.collection('trips').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return json({ error: 'Reise nicht gefunden.' }, { status: 404 });
    }

    return json({ message: 'Reise erfolgreich gelöscht.' }, { status: 200 });
  } catch (error) {
    console.error('Fehler beim Löschen der Reise:', error);
    return json({ error: 'Fehler beim Löschen der Reise.' }, { status: 500 });
  }
}

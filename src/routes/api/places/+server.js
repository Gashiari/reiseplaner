import { json } from '@sveltejs/kit';
import { connectToDB } from '$lib/db';

export async function GET({ url }) {
  const db = await connectToDB(); // Verbindung zur Datenbank herstellen
  const cityName = url.searchParams.get('city'); // Abruf des Query-Parameters `city`

  try {
    const query = cityName ? { city_ascii: { $regex: cityName, $options: 'i' } } : {}; // Suche nach city_ascii
    const cities = await db.collection('cities').find(query).limit(10).toArray(); // Maximal 10 Ergebnisse abrufen
    return json(cities); // Städte zurückgeben
  } catch (error) {
    console.error('Fehler beim Abrufen der Städte:', error);
    return json({ error: 'Fehler beim Abrufen der Städte.' }, { status: 500 });
  }
}

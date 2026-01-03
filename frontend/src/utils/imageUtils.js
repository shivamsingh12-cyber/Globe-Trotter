export const getTripImage = (trip) => {
    if (!trip) return '/images/default-trip.webp';
    if (trip.cover_photo) return trip.cover_photo;

    // Smart matching based on trip name or destination
    const searchTerm = (trip.name || '').toLowerCase();
    const cities = [
        { key: 'paris', img: '/images/paris.webp' },
        { key: 'london', img: '/images/london.webp' },
        { key: 'tokyo', img: '/images/tokyo.webp' },
        { key: 'york', img: '/images/new-york.webp' },
        { key: 'santorini', img: '/images/santorini.webp' },
        { key: 'rome', img: '/images/rome.webp' },
        { key: 'dubai', img: '/images/dubai.webp' },
        { key: 'barcelona', img: '/images/barcelona.webp' }
    ];

    const match = cities.find(c => searchTerm.includes(c.key));
    if (match) return match.img;

    // Fallback deterministic random image based on ID
    const fallbackCities = cities.map(c => c.img);
    const index = (typeof trip.id === 'number' ? trip.id : 0) % fallbackCities.length;
    return fallbackCities[index];
};

const fs = require('fs');
const https = require('https');
const path = require('path');

const cities = [
    { name: 'paris', query: 'paris,france' },
    { name: 'new-york', query: 'new+york,city' },
    { name: 'tokyo', query: 'tokyo,japan' },
    { name: 'london', query: 'london,uk' },
    { name: 'barcelona', query: 'barcelona,spain' },
    { name: 'santorini', query: 'santorini,greece' },
    { name: 'rome', query: 'rome,italy' },
    { name: 'dubai', query: 'dubai,uae' }
];

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded ${filepath}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => { }); // Delete the file async. (But we don't check the result)
            reject(err.message);
        });
    });
};

const run = async () => {
    for (const city of cities) {
        // Unsplash source URL with WebP format enforcement
        // Using specific size 600x800 for cards
        const url = `https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80`;
        // Note: source.unsplash.com is deprecated/unreliable for strict format. 
        // Better to use specific IDs if possible, but for dynamic we can try to find a stable search URL or just use specific reliable IDs for these common cities.

        // Let's use specific high-quality IDs for these famous cities to ensure they look "Premium"
        let specificUrl = '';
        switch (city.name) {
            case 'paris': specificUrl = 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&h=800&q=80&fm=webp'; break;
            case 'new-york': specificUrl = 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&h=800&q=80&fm=webp'; break;
            case 'tokyo': specificUrl = 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&h=800&q=80&fm=webp'; break;
            case 'london': specificUrl = 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&h=800&q=80&fm=webp'; break;
            case 'barcelona': specificUrl = 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=600&h=800&q=80&fm=webp'; break;
            case 'santorini': specificUrl = 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&h=800&q=80&fm=webp'; break;
            case 'rome': specificUrl = 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&h=800&q=80&fm=webp'; break;
            case 'dubai': specificUrl = 'https://images.unsplash.com/photo-1512453979798-5ea904ac6605?auto=format&fit=crop&w=600&h=800&q=80&fm=webp'; break;
        }

        await downloadImage(specificUrl, path.join(__dirname, 'frontend/public/images', `${city.name}.webp`));
    }
};

run();

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const genshin = require('genshin-db');

const imagesDir = path.join(__dirname, 'images', 'characters');
const elementsDir = path.join(__dirname, 'images', 'elements');
const jsDir = path.join(__dirname, 'js');

// Create directories
[imagesDir, elementsDir, jsDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function downloadImage(url, dest) {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 100) return true; // Skip if already downloaded and valid
    try {
        const response = await axios({ 
            url, 
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Referer': 'https://genshin.hoyoverse.com/'
            }
        });
        return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(dest);
            response.data.pipe(writer)
                .on('finish', () => resolve(true))
                .on('error', e => { fs.unlinkSync(dest); reject(e); });
        });
    } catch (e) {
        console.error(`Failed to download ${url}`);
        return false;
    }
}

async function scrapeElements() {
    const elements = ['anemo', 'geo', 'electro', 'dendro', 'hydro', 'pyro', 'cryo'];
    for (const el of elements) {
        const url = `https://genshin.jmp.blue/elements/${el}/icon`;
        await downloadImage(url, path.join(elementsDir, `${el}.png`));
    }
    console.log("Elements downloaded.");
}

async function scrapeCharacters() {
    const allNames = genshin.characters('names', { matchCategories: true }) || [];
    
    // We want a clean list.
    const uniqueChars = [];
    
    for (const name of allNames) {
        const details = genshin.characters(name);
        if (!details) continue;

        let element = details.elementText ? details.elementText.toLowerCase() : 'anemo';
        if (element === 'none') element = 'anemo';
        
        let id = details.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        // Unify travelers
        if (id.includes('traveler') || id === 'aether' || id === 'lumine') id = 'traveler';
        
        // Skip duplicates
        if (uniqueChars.some(c => c.id === id)) continue;

        // Prioritize Ambr.top CDN for unblocked HD Portraits
        let imgUrl = null;
        if (details.images && details.images.filename_icon) {
            imgUrl = `https://api.ambr.top/assets/UI/${details.images.filename_icon}.png`;
        }

        const fileName = `${id}.png`;
        const dest = path.join(imagesDir, fileName);
        
        let success = false;
        if (imgUrl) success = await downloadImage(imgUrl, dest);
        
        if (!success) {
            const devUrl = `https://genshin.jmp.blue/characters/${id}/icon`;
            success = await downloadImage(devUrl, dest);
        }

        if (!success) {
            const fallback = `https://ui-avatars.com/api/?name=${details.name.substring(0,2)}&background=1e293b&color=fff&size=128&font-size=0.4`;
            await downloadImage(fallback, dest);
        }
        
        uniqueChars.push({
            id: id,
            name: details.name,
            element: element,
            img: `./images/characters/${fileName}`
        });
    }
    
    // Save to JS file
    const jsContent = `const charactersDatabase = ${JSON.stringify(uniqueChars, null, 4)};\n`;
    fs.writeFileSync(path.join(jsDir, 'charactersData.js'), jsContent);
    console.log(`Saved ${uniqueChars.length} characters.`);
}

async function run() {
    console.log("Scraping Elements...");
    await scrapeElements();
    console.log("Scraping Characters...");
    await scrapeCharacters();
    console.log("All done.");
}

run();

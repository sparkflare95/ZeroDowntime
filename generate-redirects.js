const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://sparkflare95.github.io/ZeroDowntime';
const destFile = path.join(__dirname, 'destinations.txt');

function generateRandomString(length = 9) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

let destinations = [];
if (fs.existsSync(destFile)) {
    destinations = fs.readFileSync(destFile, 'utf8')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
}

if (destinations.length === 0) {
    console.log('No destination URLs found in destinations.txt');
    return;
}

let generatedUrls = [];
const now = new Date().toISOString();

destinations.forEach(targetUrl => {
    const randomSlug = generateRandomString(9);
    const folderPath = path.join(__dirname, randomSlug);
    
    fs.mkdirSync(folderPath, { recursive: true });

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=${targetUrl}">
    <title>Redirecting...</title>
    <script>
        window.location.href = "${targetUrl}";
    </script>
</head>
<body>
    <p>Redirecting to <a href="${targetUrl}">${targetUrl}</a>...</p>
</body>
</html>`;

    fs.writeFileSync(path.join(folderPath, 'index.html'), htmlContent, 'utf8');

    const fullPageUrl = `${DOMAIN}/${randomSlug}/`;
    generatedUrls.push(fullPageUrl);
});

let sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>\n`;
sitemapXML += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

generatedUrls.forEach(url => {
    sitemapXML += `  <url>\n`;
    sitemapXML += `    <loc>${url}</loc>\n`;
    sitemapXML += `    <lastmod>${now}</lastmod>\n`;
    sitemapXML += `  </url>\n`;
});

sitemapXML += `</urlset>`;

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemapXML, 'utf8');
console.log(`Successfully generated ${generatedUrls.length} redirect pages and sitemap.xml`);

function getAllowedOrigins() {
    const configuredOrigins = [process.env.CLIENT_URL, process.env.CLIENT_ORIGIN]
        .filter(Boolean)
        .join(',');

    return `${configuredOrigins},https://ubersclone-1.onrender.com,http://localhost:5173,http://localhost:3000`
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
        .filter((origin, index, origins) => origins.indexOf(origin) === index);
}

function isProduction() {
    return process.env.NODE_ENV === 'production';
}

module.exports = { getAllowedOrigins, isProduction };
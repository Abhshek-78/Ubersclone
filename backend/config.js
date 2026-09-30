function getAllowedOrigins() {
    return (process.env.CLIENT_ORIGIN || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
}

function isProduction() {
    return process.env.NODE_ENV === 'production';
}

module.exports = { getAllowedOrigins, isProduction };
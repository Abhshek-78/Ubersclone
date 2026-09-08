const axios = require('axios');

const getApiKey = () => {
    const apiKey = process.env.MAPBOX_API || process.env.MAPBOX_TOKEN || process.env.Mapbox_API;

    if (!apiKey) {
        const error = new Error('MAPBOX_API is not configured');
        error.statusCode = 500;
        throw error;
    }

    return apiKey;
};

const getMapboxApiError = (response, fallbackMessage) => {
    const message = response?.data?.message
        || response?.data?.error
        || response?.data?.features?.length === 0
        || fallbackMessage;
    const error = new Error(message);
    error.statusCode = response?.status >= 400 ? response.status : 502;
    return error;
};

const geocodeAddress = async (address) => {
    const normalizedAddress = (address || '').trim();

    if (!normalizedAddress) {
        const error = new Error('Address is required');
        error.statusCode = 400;
        throw error;
    }

    const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(normalizedAddress)}.json`, {
        params: {
            access_token: getApiKey(),
            autocomplete: true,
            limit: 1,
            types: 'place,address,poi',
        },
    });

    const feature = response.data.features?.[0];
    if (!feature || !Array.isArray(feature.center) || feature.center.length < 2) {
        throw getMapboxApiError(response, 'Unable to find coordinates');
    }

    const [longitude, latitude] = feature.center;
    return {
        latitude,
        longitude,
        placeName: feature.place_name || normalizedAddress,
    };
};

module.exports.getAddressCoordinate = async (address) => {
    const { latitude, longitude } = await geocodeAddress(address);
    return { latitude, longitude };
};

module.exports.getDistancetime = async (origin, destination) => {
    if (!origin || !destination) {
        const error = new Error('Origin and destination are required');
        error.statusCode = 400;
        throw error;
    }

    try {
        const originCoords = await geocodeAddress(origin);
        const destinationCoords = await geocodeAddress(destination);

        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${originCoords.longitude},${originCoords.latitude};${destinationCoords.longitude},${destinationCoords.latitude}.json`;
        const response = await axios.get(url, {
            params: {
                access_token: getApiKey(),
                geometries: 'geojson',
                steps: false,
                overview: 'simplified',
            },
        });

        const route = response.data.routes?.[0];
        if (!route) {
            const error = new Error('No route found');
            error.statusCode = 404;
            throw error;
        }

        const distance = Number(route.distance) || 0;
        const duration = Number(route.duration) || 0;

        return {
            status: 'OK',
            distance: {
                text: `${(distance / 1000).toFixed(1)} km`,
                value: distance,
            },
            duration: {
                text: `${Math.ceil(duration / 60)} mins`,
                value: duration,
            },
        };
    } catch (err) {
        if (err.response) {
            throw getMapboxApiError(err.response, 'Unable to calculate route');
        }
        throw err;
    }
};

module.exports.getAutocompleteSuggestion = async (input) => {
    if (!input) {
        const error = new Error('Input is required');
        error.statusCode = 400;
        throw error;
    }

    const trimmedInput = input.trim();

    try {
        const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trimmedInput)}.json`, {
            params: {
                access_token: getApiKey(),
                autocomplete: true,
                limit: 5,
                types: 'place,address,poi',
            },
        });

        return (response.data.features || []).map((feature) => {
            const [longitude, latitude] = Array.isArray(feature.center) ? feature.center : [];
            const description = feature.place_name || '';
            const [mainText, ...secondaryParts] = description.split(',');

            return {
                description,
                place_id: feature.id || description,
                structured_formatting: {
                    main_text: mainText || description,
                    secondary_text: secondaryParts.join(', ').trim(),
                },
                latitude: latitude ?? null,
                longitude: longitude ?? null,
            };
        });
    } catch (err) {
        if (err.response) {
            throw getMapboxApiError(err.response, 'Unable to find place suggestions');
        }
        throw err;
    }
};
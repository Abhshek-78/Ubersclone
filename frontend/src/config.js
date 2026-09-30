const configuredBaseUrl = import.meta.env.VITE_BASE_URL || '';

export const API_BASE_URL = configuredBaseUrl.replace(/\/$/, '');
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.VITE_MAPBOX_API || '';
const API_URL = import.meta.env.VITE_API_URL || "";

export const getApiUrl = (endpoint) => {
    // Ensure endpoint starts with /
    const formattedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    // In production (Vercel), API_URL will be the Render backend URL
    // In development (local monolith), API_URL will be empty, so it uses relative paths
    return `${API_URL}${formattedEndpoint}`;
};

export const getSocketUrl = () => {
    // Return the API_URL for socket connection if defined, else same origin
    return API_URL || window.location.origin;
};

const productionApiUrl = 'https://backend-fggt.onrender.com/api/v1';
const localApiUrl = 'http://localhost:3000/api/v1';

export const API_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? localApiUrl : productionApiUrl);

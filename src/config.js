// This file automatically sets the API URL based on the environment.
// In development (npm run dev) → uses localhost.
// In production (after npm run build) → uses the VITE_API_URL environment variable.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default API_URL;

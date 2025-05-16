export const NODE_API_ENDPOINT =
  process.env.NODE_ENV === 'production'
    ? 'https://shoping-app-backend.vercel.app/api'
    : 'http://10.0.2.2:8000/api';

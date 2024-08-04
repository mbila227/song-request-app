// src/spotifyAuth.js
import axios from 'axios';

const CLIENT_ID = 'a7aeec09735d493cb283e7001c9a53df';
const CLIENT_SECRET = 'f0f5c4cdb2214cbcb8ef53ebdf4afcea';
const REDIRECT_URI = 'https://song-request-app.vercel.app/'; // Change this to your deployed URL

const getAuthToken = async () => {
  const response = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
    grant_type: 'client_credentials'
  }), {
    headers: {
      'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  return response.data.access_token;
};

export default getAuthToken;

import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const SongRequestForm = ({ userId }) => {
  const [name, setName] = useState('');
  const [artist, setArtist] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'songRequests'), {
        name,
        artist,
        userId,
        albumCover: track.album.images[1].url,
        spotifyUrl,
        timestamp: new Date()
      });
      setName('');
      setArtist('');
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Song Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label>Artist:</label>
        <input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} required />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default SongRequestForm;

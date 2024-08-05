import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const SongRequestList = () => {
  const [requests, setRequests] = useState([]);
  const { currentUser } = useAuth(); // Get current user from Auth context

  useEffect(() => {
    const q = query(
      collection(db, "songRequests"),
      where("userId", "==", currentUser.uid),
      orderBy("timestamp", "desc")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requestsArray = [];
      querySnapshot.forEach((doc) => {
        requestsArray.push({ id: doc.id, ...doc.data() });
      });
      setRequests(requestsArray);
    });
    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div>
      <h2>Song Requests</h2>
      <ul>
        {requests.map((request) => (
          <li key={request.id}>
            <strong>{request.songName}</strong> by {request.artistName}
            {request.albumCover && (
              <img src={request.albumCover} alt={`${request.songName} cover`} style={{ width: '50px', marginLeft: '10px' }} />
            )}
            <a href={request.spotifyUrl} target="_blank" rel="noopener noreferrer">
              <button>Listen on Spotify</button>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SongRequestList;

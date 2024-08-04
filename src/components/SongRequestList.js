import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Import db from firebase
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const SongRequestList = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'songRequests'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requestsArray = [];
      querySnapshot.forEach((doc) => {
        requestsArray.push({ id: doc.id, ...doc.data() });
      });
      setRequests(requestsArray);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2>Song Requests</h2>
      <ul>
        {requests.map((request) => (
          <li key={request.id}>
            {request.name} by {request.artist}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SongRequestList;

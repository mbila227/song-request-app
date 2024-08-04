import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Import db from firebase
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const SongRequestList = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    // Query to get song requests sorted by timestamp in descending order
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
  }, []);

  return (
    <div>
      <h2>Song Requests</h2>
      <ul>
        {requests.map((request) => (
          <li key={request.id}>
            <strong>{request.songName}</strong> by {request.artistName}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SongRequestList;

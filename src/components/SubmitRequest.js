import React from 'react';
import { useParams } from 'react-router-dom';
import SongRequestForm from './SongRequestForm';

const SubmitRequest = () => {
  const { userId } = useParams();

  return (
    <div>
      <h2>Submit a Song Request</h2>
      <SongRequestForm userId={userId} />
    </div>
  );
};

export default SubmitRequest;

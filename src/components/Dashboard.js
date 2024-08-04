import React, { useState, useEffect } from "react";
import { Card, Button, Alert, ListGroup } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import QRCode from "qrcode.react";
import SpotifySearch from "./SpotifySearch";

export default function Dashboard() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [requests, setRequests] = useState([]);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [userUrl, setUserUrl] = useState("");

  useEffect(() => {
    if (currentUser) {
      setUserUrl(generateUserUrl(currentUser.uid));

      const fetchRequests = async () => {
        try {
          const q = query(
            collection(db, "songRequests"),
            where("userId", "==", currentUser.uid),
            orderBy("timestamp", "desc")  // Order by timestamp in descending order
          );
          const querySnapshot = await getDocs(q);
          const requestsData = querySnapshot.docs.map((doc) => doc.data());
          setRequests(requestsData);
        } catch (error) {
          setError("Failed to load song requests");
          console.error("Error fetching song requests: ", error);
        }
      };

      fetchRequests();
    }
  }, [currentUser]);

  async function handleLogout() {
    setError("");

    try {
      await logout();
      navigate("/login");
    } catch {
      setError("Failed to log out");
    }
  }

  if (!currentUser) {
    return (
      <div className="w-100 text-center mt-2">
        <p>No user is currently logged in.</p>
        <Link to="/login">Log In</Link>
      </div>
    );
  }

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Song Requests</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <div className="text-center mb-4">
            <h5>Your Song Request QR Code</h5>
            <QRCode value={userUrl} />
            <p>{userUrl}</p>
          </div>
          <SpotifySearch 
            userId={currentUser.uid} 
            setRequests={setRequests} 
            setError={setError} 
            setSuccess={setSuccess} 
          />
          <hr />
          {requests.length === 0 ? (
            <p>No song requests found.</p>
          ) : (
            <ListGroup>
              {requests.map((request, index) => (
                <ListGroup.Item key={index}>
                  <strong>{request.songName}</strong> by {request.artistName}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        <Button variant="link" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
    </>
  );
}

const generateUserUrl = (userId) => {
  return `${window.location.origin}/requests/${userId}`;
};

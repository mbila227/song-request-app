import React, { useState, useEffect } from "react";
import { Card, Button, Alert, ListGroup, Form } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import QRCode from "qrcode.react";

export default function Dashboard() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [requests, setRequests] = useState([]);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [songName, setSongName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [userUrl, setUserUrl] = useState("");

  useEffect(() => {
    if (currentUser) {
      setUserUrl(generateUserUrl(currentUser.uid));

      const fetchRequests = async () => {
        try {
          const q = query(
            collection(db, "songRequests"),
            where("userId", "==", currentUser.uid)
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

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await addDoc(collection(db, "songRequests"), {
        userId: currentUser.uid,
        songName,
        artistName,
        timestamp: new Date(),
      });
      setSuccess("Song request added successfully");
      setSongName("");
      setArtistName("");

      // Refetch the song requests to update the list
      const q = query(
        collection(db, "songRequests"),
        where("userId", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const requestsData = querySnapshot.docs.map((doc) => doc.data());
      setRequests(requestsData);
    } catch (error) {
      setError("Failed to add song request");
      console.error("Error adding song request: ", error);
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
          <Form onSubmit={handleSubmit}>
            <Form.Group id="songName">
              <Form.Label>Song Name</Form.Label>
              <Form.Control
                type="text"
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group id="artistName">
              <Form.Label>Artist Name</Form.Label>
              <Form.Control
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                required
              />
            </Form.Group>
            <Button disabled={false} className="w-100 mt-2" type="submit">
              Add Song
            </Button>
          </Form>
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


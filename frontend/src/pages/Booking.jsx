import { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

function Booking() {
  const params = useParams();
  const hotelId = params.id || params.hotelId;
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [hotel, setHotel] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // Get Hotel
  // =========================
  useEffect(() => {
    const fetchHotel = async () => {
      if (!hotelId) {
        setError("Invalid hotel ID.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/hotels/${hotelId}`,
        );

        setHotel(response.data);
      } catch (error) {
        console.error("Hotel fetch error:", error);

        setError(error.response?.data?.message || "Failed to load hotel.");
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [hotelId]);

  // =========================
  // Create Booking
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    if (checkOut <= checkIn) {
      alert("Check-out date must be after check-in date.");
      return;
    }

    try {
      setBookingLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/bookings",
        {
          hotelId: hotelId,
          checkIn,
          checkOut,
          guests: Number(guests),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Booking created:", response.data);

      alert("Booking created successfully!");

      navigate("/my-bookings");
    } catch (error) {
      console.error("Booking error:", error);

      alert(
        error.response?.data?.message || "Booking failed. Please try again.",
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h2>Loading hotel...</h2>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h2>{error || "Hotel not found."}</h2>

        <button onClick={() => navigate("/hotels")}>Back to Hotels</button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          background: "#fff",
          borderRadius: "20px",
          padding: "35px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
        }}
      >
        <button
          type="button"
          onClick={() => navigate(`/hotels/${hotel._id}`)}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "#64748b",
            marginBottom: "20px",
          }}
        >
          ← Back to Hotel
        </button>

        <h1 style={{ marginBottom: "8px" }}>🏨 Book Your Stay</h1>

        <h2 style={{ marginBottom: "5px" }}>{hotel.name}</h2>

        <p style={{ color: "#64748b" }}>📍 {hotel.location}</p>

        <div
          style={{
            background: "#f8fafc",
            padding: "18px",
            borderRadius: "12px",
            margin: "25px 0",
          }}
        >
          <strong style={{ fontSize: "24px" }}>{hotel.price} ETB</strong>

          <span style={{ color: "#64748b" }}> / night</span>

          <p style={{ marginBottom: 0 }}>🛏️ {hotel.rooms} rooms available</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label>Check-In Date</label>

            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "13px",
                marginTop: "8px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label>Check-Out Date</label>

            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "13px",
                marginTop: "8px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "25px" }}>
            <label>Number of Guests</label>

            <input
              type="number"
              min="1"
              max={hotel.rooms}
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "13px",
                marginTop: "8px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={bookingLoading}
            style={{
              width: "100%",
              padding: "15px",
              background: "#111827",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              cursor: bookingLoading ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            {bookingLoading ? "Creating Booking..." : "✓ Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Booking;

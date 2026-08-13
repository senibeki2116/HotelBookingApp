import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Hotels.css";

import regImage from "../images/regImage.png";

function Hotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/hotels");

        setHotels(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  if (loading) {
    return <h2>Loading hotels...</h2>;
  }

  return (
    <div className="hotels-container">
      <h1>Available Hotels 🏨</h1>

      <div className="hotel-grid">
        {hotels.length > 0 ? (
          hotels.map((hotel) => (
            <div className="hotel-card" key={hotel._id}>
              <img src={regImage} alt={hotel.name} />

              <h2>{hotel.name}</h2>

              <p>📍 {hotel.location}</p>

              <p>{hotel.description}</p>

              <h3>${hotel.price} / night</h3>

              <Link to={`/hotels/${hotel._id}`}>
                <button>View Details</button>
              </Link>
            </div>
          ))
        ) : (
          <h2>No hotels available.</h2>
        )}
      </div>
    </div>
  );
}

export default Hotels;

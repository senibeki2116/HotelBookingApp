import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

const AddHotel = () => {
  const navigate = useNavigate();

  const [hotel, setHotel] = useState({
    name: "",
    location: "",
    description: "",
    price: "",
    image: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setHotel({
      ...hotel,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      console.log("Submitting admin add hotel request");

      await API.post("/admin/hotels", hotel);

      alert("Hotel added successfully!");

      navigate("/admin/hotels");
    } catch (err) {
      console.error("Add hotel error:", err);
      setError(err.response?.data?.message || "Failed to add hotel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Add New Hotel</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Hotel Name</label>
          <input
            type="text"
            name="name"
            value={hotel.name}
            onChange={handleChange}
            placeholder="Enter hotel name"
            required
          />
        </div>

        <div>
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={hotel.location}
            onChange={handleChange}
            placeholder="Enter hotel location"
            required
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={hotel.description}
            onChange={handleChange}
            placeholder="Enter hotel description"
            required
          />
        </div>

        <div>
          <label>Price per Night</label>
          <input
            type="number"
            name="price"
            value={hotel.price}
            onChange={handleChange}
            placeholder="Enter price"
            required
          />
        </div>

        <div>
          <label>Image URL</label>
          <input
            type="text"
            name="image"
            value={hotel.image}
            onChange={handleChange}
            placeholder="Enter image URL"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Hotel"}
        </button>

        <button type="button" onClick={() => navigate("/admin/hotels")}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default AddHotel;

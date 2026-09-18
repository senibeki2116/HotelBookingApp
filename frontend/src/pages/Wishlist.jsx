import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Wishlist.css";

const API_URL = "http://localhost:5000";

function Wishlist() {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);

  // Load wishlist
  useEffect(() => {
    try {
      const savedFavorites = JSON.parse(
        localStorage.getItem("favoriteHotels") || "[]",
      );

      setFavorites(Array.isArray(savedFavorites) ? savedFavorites : []);
    } catch (error) {
      console.error("Failed to load wishlist:", error);
      setFavorites([]);
    }
  }, []);

  // Remove hotel from wishlist
  const removeFromWishlist = (hotelId) => {
    const updatedFavorites = favorites.filter(
      (hotel) => (hotel._id || hotel.id) !== hotelId,
    );

    setFavorites(updatedFavorites);

    localStorage.setItem("favoriteHotels", JSON.stringify(updatedFavorites));
  };

  // Get hotel image
  const getImage = (hotel) => {
    if (!hotel?.image) {
      return "https://images.unsplash.com/photo-1566073771259-6a8506099945";
    }

    if (hotel.image.startsWith("http")) {
      return hotel.image;
    }

    if (hotel.image.startsWith("/")) {
      return `${API_URL}${hotel.image}`;
    }

    return `${API_URL}/uploads/${hotel.image}`;
  };

  return (
    <div className="wishlist-page">
      {/* ================= NAVBAR ================= */}
      <nav className="wishlist-navbar">
        <div className="wishlist-logo" onClick={() => navigate("/")}>
          <div className="wishlist-logo-icon">H</div>

          <div>
            <h2>HotelBooking</h2>
            <span>Better Stays. Brighter Journeys.</span>
          </div>
        </div>

        <div className="wishlist-nav-links">
          <button onClick={() => navigate("/")}>Home</button>

          <button onClick={() => navigate("/hotels")}>Hotels</button>

          <button className="wishlist-active">Wishlist</button>

          <button onClick={() => navigate("/bookings")}>My Bookings</button>

          <button onClick={() => navigate("/profile")}>Profile</button>
        </div>

        <button className="wishlist-back-button" onClick={() => navigate("/")}>
          ← Back
        </button>
      </nav>

      {/* ================= HERO ================= */}
      <section className="wishlist-hero">
        <div className="wishlist-hero-overlay"></div>

        <div className="wishlist-hero-content">
          <p>YOUR FAVORITES</p>

          <h1>My Wishlist</h1>

          <span>
            Save the places you love and keep them ready for your next
            unforgettable journey.
          </span>
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <main className="wishlist-content">
        <div className="wishlist-heading">
          <div>
            <p>MY COLLECTION</p>

            <h2>
              Saved Hotels
              <span>{favorites.length}</span>
            </h2>
          </div>

          {favorites.length > 0 && (
            <button
              className="browse-hotels-button"
              onClick={() => navigate("/hotels")}
            >
              + Explore More Hotels
            </button>
          )}
        </div>

        {/* ================= EMPTY WISHLIST ================= */}
        {favorites.length === 0 ? (
          <div className="empty-wishlist">
            <div className="empty-heart">♡</div>

            <h2>Your wishlist is empty</h2>

            <p>
              You haven't saved any hotels yet. Start exploring and save your
              favorite places for later.
            </p>

            <button
              className="explore-button"
              onClick={() => navigate("/hotels")}
            >
              Explore Hotels
              <span>→</span>
            </button>
          </div>
        ) : (
          /* ================= HOTEL GRID ================= */
          <div className="wishlist-grid">
            {favorites.map((hotel) => {
              const hotelId = hotel._id || hotel.id;

              return (
                <article className="wishlist-card" key={hotelId}>
                  {/* Image */}
                  <div className="wishlist-image-container">
                    <img src={getImage(hotel)} alt={hotel.name || "Hotel"} />

                    <button
                      className="remove-wishlist"
                      onClick={() => removeFromWishlist(hotelId)}
                      title="Remove from wishlist"
                    >
                      ♥
                    </button>

                    {hotel.rating && (
                      <div className="wishlist-rating">★ {hotel.rating}</div>
                    )}
                  </div>

                  {/* Information */}
                  <div className="wishlist-card-content">
                    <div className="wishlist-location">
                      📍 {hotel.location || "Beautiful destination"}
                    </div>

                    <h3>{hotel.name || "Beautiful Hotel"}</h3>

                    {hotel.description && (
                      <p className="wishlist-description">
                        {hotel.description.length > 100
                          ? `${hotel.description.substring(0, 100)}...`
                          : hotel.description}
                      </p>
                    )}

                    <div className="wishlist-card-bottom">
                      <div className="wishlist-price">
                        {hotel.price ? (
                          <>
                            <strong>${hotel.price}</strong>

                            <span>/ night</span>
                          </>
                        ) : (
                          <span>Contact for price</span>
                        )}
                      </div>

                      <button
                        className="view-hotel-button"
                        onClick={() => navigate(`/hotels/${hotelId}`)}
                      >
                        View Hotel
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="wishlist-footer">
        <div>
          <strong>HotelBooking</strong>
          <p>Find your perfect stay and create unforgettable journeys.</p>
        </div>

        <div className="wishlist-footer-slogan">
          <span></span>
          Better Stays. Brighter Journeys.
        </div>
      </footer>
    </div>
  );
}

export default Wishlist;

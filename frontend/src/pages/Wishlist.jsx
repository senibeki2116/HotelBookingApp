import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Wishlist.css";

const API_URL = "http://localhost:5000";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200",
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200",
];

const WISHLIST_HERO =
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1800";

// ============================================================
// GET HOTEL ID
// ============================================================
const getHotelId = (hotel) => {
  if (typeof hotel === "string") {
    return hotel;
  }

  return hotel?._id || hotel?.id;
};

// ============================================================
// GET HOTEL IMAGE
// ============================================================
const getImage = (hotel, index = 0) => {
  if (!hotel) {
    return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  }

  const image =
    hotel.image ||
    hotel.imageUrl ||
    hotel.photo ||
    hotel.photoUrl ||
    (Array.isArray(hotel.images) ? hotel.images[0] : "");

  if (!image) {
    return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  }

  const imageUrl = String(image).trim();

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/")) {
    return `${API_URL}${imageUrl}`;
  }

  return `${API_URL}/uploads/${imageUrl}`;
};

// ============================================================
// HOTEL NAME
// ============================================================
const getHotelName = (hotel) => {
  return hotel?.name || hotel?.hotelName || hotel?.title || "Beautiful Hotel";
};

// ============================================================
// LOCATION
// ============================================================
const getLocation = (hotel) => {
  if (typeof hotel?.location === "string") {
    return hotel.location;
  }

  if (hotel?.location && typeof hotel.location === "object") {
    return (
      hotel.location.city ||
      hotel.location.address ||
      hotel.location.name ||
      "Location unavailable"
    );
  }

  return hotel?.city || hotel?.address || "Location unavailable";
};

// ============================================================
// PRICE
// ============================================================
const getPrice = (hotel) => {
  return hotel?.price ?? hotel?.pricePerNight ?? hotel?.roomPrice ?? 0;
};

// ============================================================
// RATING
// ============================================================
const getRating = (hotel) => {
  return hotel?.rating ?? hotel?.averageRating ?? 0;
};

// ============================================================
// REVIEWS
// ============================================================
const getReviews = (hotel) => {
  if (Array.isArray(hotel?.reviews)) {
    return hotel.reviews.length;
  }

  return hotel?.reviewsCount ?? hotel?.reviewCount ?? 0;
};

// ============================================================
// MAIN WISHLIST
// ============================================================
function Wishlist() {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [allHotels, setAllHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================================
  // LOAD WISHLIST + REAL HOTEL DATA
  // ==========================================================
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setLoading(true);

        // Get saved IDs / saved hotel objects
        const saved = JSON.parse(
          localStorage.getItem("favoriteHotels") || "[]",
        );

        if (!Array.isArray(saved) || saved.length === 0) {
          setFavorites([]);
          setLoading(false);
          return;
        }

        // Get ALL real hotels from backend
        const response = await fetch(`${API_URL}/api/hotels`);

        if (!response.ok) {
          throw new Error("Failed to load hotels");
        }

        const data = await response.json();

        const hotels = Array.isArray(data)
          ? data
          : Array.isArray(data.hotels)
            ? data.hotels
            : [];

        setAllHotels(hotels);

        // Match wishlist IDs with actual hotel objects
        const wishlistHotels = saved
          .map((savedHotel) => {
            const savedId = getHotelId(savedHotel);

            // Find the real hotel from database
            const realHotel = hotels.find(
              (hotel) => String(hotel?._id || hotel?.id) === String(savedId),
            );

            // If found, use REAL hotel object
            if (realHotel) {
              return realHotel;
            }

            // If saved object already contains hotel data
            if (typeof savedHotel === "object" && savedHotel !== null) {
              return savedHotel;
            }

            return null;
          })
          .filter(Boolean);

        setFavorites(wishlistHotels);
      } catch (error) {
        console.error("Failed to load wishlist:", error);

        // Try to show saved objects if API fails
        try {
          const saved = JSON.parse(
            localStorage.getItem("favoriteHotels") || "[]",
          );

          if (Array.isArray(saved)) {
            setFavorites(
              saved.filter((item) => typeof item === "object" && item !== null),
            );
          }
        } catch {
          setFavorites([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, []);

  // ==========================================================
  // REMOVE FROM WISHLIST
  // ==========================================================
  const removeFromWishlist = (hotelId) => {
    const updatedFavorites = favorites.filter(
      (hotel) => String(getHotelId(hotel)) !== String(hotelId),
    );

    setFavorites(updatedFavorites);

    // Keep localStorage as IDs
    const savedIds = updatedFavorites.map((hotel) => getHotelId(hotel));

    localStorage.setItem("favoriteHotels", JSON.stringify(savedIds));
  };

  // ==========================================================
  // DETAILS
  // ==========================================================
  const handleDetails = (hotel) => {
    const hotelId = getHotelId(hotel);

    if (!hotelId) return;

    navigate(`/hotels/${hotelId}`);
  };

  // ==========================================================
  // BOOK
  // ==========================================================

  const handleBook = (hotel) => {
    const hotelId = hotel?._id || hotel?.id;

    if (!hotelId) {
      console.error("Hotel ID is missing:", hotel);
      return;
    }

    navigate(`/booking/hotel/${hotelId}`);
  };

  // ==========================================================
  // LOADING
  // ==========================================================
  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-loading">
          <div className="wishlist-spinner"></div>
          <h2>Loading your favorites...</h2>
          <p>We're preparing your saved hotels.</p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // EMPTY
  // ==========================================================
  if (favorites.length === 0) {
    return (
      <div className="wishlist-page">
        <section
          className="wishlist-hero"
          style={{
            backgroundImage: `url(${WISHLIST_HERO})`,
          }}
        >
          <div className="wishlist-hero-overlay">
            <div className="wishlist-hero-content">
              <span className="wishlist-eyebrow">YOUR FAVORITES</span>

              <h1>Places Worth Remembering</h1>

              <p>
                Save the hotels you love and keep your perfect stays in one
                beautiful place.
              </p>
            </div>
          </div>
        </section>

        <section className="wishlist-empty-section">
          <div className="empty-heart">♡</div>

          <span className="empty-label">YOUR WISHLIST</span>

          <h2>Nothing saved yet</h2>

          <p>
            When you find a hotel you love, tap the heart and we'll keep it here
            for you.
          </p>

          <button
            className="wishlist-primary-button"
            onClick={() => navigate("/hotels")}
          >
            Explore Hotels
            <span>→</span>
          </button>
        </section>
      </div>
    );
  }

  // ==========================================================
  // MAIN PAGE
  // ==========================================================
  return (
    <div className="wishlist-page">
      {/* ======================================================
          HERO
      ====================================================== */}
      <section
        className="wishlist-hero"
        style={{
          backgroundImage: `url(${WISHLIST_HERO})`,
        }}
      >
        <div className="wishlist-hero-overlay">
          <div className="wishlist-hero-content">
            <span className="wishlist-eyebrow">YOUR PRIVATE COLLECTION</span>

            <h1>Places You Love</h1>

            <p>Your favorite stays, saved in one place.</p>

            <div className="wishlist-count-pill">
              <span>♥</span>
              {favorites.length} saved{" "}
              {favorites.length === 1 ? "hotel" : "hotels"}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          CONTENT
      ====================================================== */}
      <main className="wishlist-content">
        {/* HEADER */}
        <div className="wishlist-header">
          <div className="wishlist-title-area">
            <span className="section-label">SAVED FOR LATER</span>

            <h2>Your Wishlist</h2>

            <p>A collection of places you're dreaming about.</p>
          </div>

          <button
            className="wishlist-explore-button"
            onClick={() => navigate("/hotels")}
          >
            <span>＋</span>
            Discover More
          </button>
        </div>

        {/* HOTEL GRID */}
        <div className="wishlist-grid">
          {favorites.map((hotel, index) => {
            const hotelId = getHotelId(hotel);

            return (
              <article className="wishlist-card" key={hotelId || index}>
                {/* IMAGE */}
                <div className="wishlist-image-container">
                  <img
                    src={getImage(hotel, index)}
                    alt={getHotelName(hotel)}
                    className="wishlist-hotel-image"
                    onError={(event) => {
                      event.currentTarget.onerror = null;

                      event.currentTarget.src =
                        FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
                    }}
                  />

                  <div className="wishlist-image-shade"></div>

                  {/* FAVORITE */}
                  <button
                    className="remove-wishlist"
                    onClick={() => removeFromWishlist(hotelId)}
                    title="Remove from wishlist"
                    aria-label="Remove from wishlist"
                  >
                    ♥
                  </button>

                  {/* RATING */}
                  {Number(getRating(hotel)) > 0 && (
                    <div className="wishlist-rating">
                      <span>★</span>
                      {Number(getRating(hotel)).toFixed(1)}
                    </div>
                  )}

                  {/* SAVED LABEL */}
                  <div className="saved-label">SAVED</div>
                </div>

                {/* CONTENT */}
                <div className="wishlist-card-content">
                  <div className="wishlist-card-top">
                    <div>
                      <h3>{getHotelName(hotel)}</h3>

                      <p className="wishlist-location">
                        <span>⌖</span>
                        {getLocation(hotel)}
                      </p>
                    </div>
                  </div>

                  {/* META */}
                  <div className="wishlist-meta">
                    <div className="wishlist-meta-item">
                      <span className="meta-icon">★</span>

                      <div>
                        <strong>
                          {Number(getRating(hotel)) > 0
                            ? Number(getRating(hotel)).toFixed(1)
                            : "New"}
                        </strong>

                        <small>Rating</small>
                      </div>
                    </div>

                    <div className="wishlist-meta-item">
                      <span className="meta-icon">♡</span>

                      <div>
                        <strong>{getReviews(hotel) || "—"}</strong>

                        <small>Reviews</small>
                      </div>
                    </div>

                    <div className="wishlist-price">
                      <strong>${getPrice(hotel)}</strong>

                      <span>/ night</span>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="wishlist-actions">
                    <button
                      className="wishlist-details-button"
                      onClick={() => handleDetails(hotel)}
                    >
                      View Details
                    </button>

                    <button
                      className="wishlist-book-button"
                      onClick={() => handleBook(hotel)}
                    >
                      Book Now
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default Wishlist;

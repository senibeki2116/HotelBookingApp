import "./Hotels.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=2200&q=85";

function Hotels() {
  const navigate = useNavigate();

  const [hotels, setHotels] = useState([]);

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("favoriteHotels") || "[]");
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD REAL HOTELS FROM BACKEND / MONGODB
  // =========================================================
  useEffect(() => {
    const loadHotels = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/hotels");

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.hotels || [];

        setHotels(data);
      } catch (err) {
        console.error("Failed to load hotels:", err);

        setError(
          err.response?.data?.message ||
            "Could not load hotels. Make sure the backend is running on port 5000.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadHotels();
  }, []);

  // =========================================================
  // SAVE FAVORITES
  // =========================================================
  useEffect(() => {
    localStorage.setItem("favoriteHotels", JSON.stringify(favorites));
  }, [favorites]);

  // =========================================================
  // FAVORITE HOTEL
  // =========================================================
  const toggleFavorite = (id) => {
    if (!id) return;

    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  // =========================================================
  // HOTEL IMAGE
  // =========================================================
  const getImage = (hotel) => {
    if (!hotel?.image) {
      return FALLBACK_HERO;
    }

    if (String(hotel.image).startsWith("http")) {
      return hotel.image;
    }

    if (String(hotel.image).startsWith("/")) {
      return `http://localhost:5000${hotel.image}`;
    }

    return `http://localhost:5000/uploads/${hotel.image}`;
  };

  // =========================================================
  // HOTEL INFORMATION
  // =========================================================
  const getRating = (hotel) => {
    return Number(hotel?.rating ?? 4.8).toFixed(1);
  };

  const getReviews = (hotel) => {
    return hotel?.reviews ?? 0;
  };

  const getPrice = (hotel) => {
    return hotel?.price ?? 0;
  };

  const getLocation = (hotel) => {
    return hotel?.location || hotel?.city || "Ethiopia";
  };

  // =========================================================
  // VIEW HOTEL DETAILS
  // =========================================================
  const handleDetails = (hotel) => {
    if (!hotel?._id) return;

    navigate(`/hotels/${hotel._id}`);
  };

  // =========================================================
  // BOOK HOTEL
  // =========================================================
  const handleBook = (hotel) => {
    if (!hotel?._id) return;

    navigate(`/booking/hotel/${hotel._id}`);
  };

  // =========================================================
  // SCROLL TO HOTELS
  // =========================================================
  const scrollToHotels = () => {
    document.getElementById("hotels")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  // =========================================================
  // SCROLL TO DESTINATIONS
  // =========================================================
  const scrollToDestinations = () => {
    document.getElementById("destinations")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="hotel-home">
      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <header className="hotel-navbar">
        <div className="hotel-nav-inner">
          {/* LOGO */}
          <button
            className="brand"
            onClick={() => navigate("/")}
            aria-label="HotelBooking home"
          >
            <span className="brand-icon">▣</span>

            <span>
              Hotel<span>Booking</span>
            </span>
          </button>

          {/* NAVIGATION */}
          <nav className="main-nav">
            <a className="active" href="#home">
              Home
            </a>

            <a href="#hotels">Hotels</a>

            <a href="#destinations">Destinations</a>

            <a href="#about">About</a>

            <button onClick={() => navigate("/my-bookings")}>
              My Bookings
            </button>
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="nav-actions">
            <button
              className="nav-search"
              aria-label="View hotels"
              onClick={scrollToHotels}
            >
              ⌕
            </button>

            <button className="login-btn" onClick={() => navigate("/login")}>
              Login
            </button>

            <button
              className="register-btn"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* =====================================================
            HERO
        ===================================================== */}
        <section
          className="hero"
          id="home"
          style={{
            backgroundImage: `url("${FALLBACK_HERO}")`,
          }}
        >
          <div className="hero-shade" />

          <div className="hero-inner">
            <div className="hero-copy">
              <div className="eyebrow">WELCOME TO HOTEL BOOKING</div>

              <h1>
                Find Your
                <br />
                <span>Perfect Stay</span>
              </h1>

              <p>
                Discover beautiful hotels, comfortable rooms,
                <br className="desktop-break" />
                and unforgettable experiences at the best prices.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            BENEFITS
        ===================================================== */}
        <section className="benefits">
          <div className="benefit">
            <span className="benefit-icon">▥</span>

            <div>
              <h3>Best Hotels</h3>

              <p>
                Handpicked hotels for
                <br />
                your comfort and safety.
              </p>
            </div>
          </div>

          <div className="benefit">
            <span className="benefit-icon">◆</span>

            <div>
              <h3>Great Prices</h3>

              <p>
                Get the best rates
                <br />
                with no hidden fees.
              </p>
            </div>
          </div>

          <div className="benefit">
            <span className="benefit-icon">✓</span>

            <div>
              <h3>Secure Booking</h3>

              <p>
                Your data and payments
                <br />
                are always protected.
              </p>
            </div>
          </div>

          <div className="benefit">
            <span className="benefit-icon">◉</span>

            <div>
              <h3>24/7 Support</h3>

              <p>
                We are here to help,
                <br />
                anytime you need us.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            HOTELS
        ===================================================== */}
        <section className="hotels-section" id="hotels">
          <div className="section-heading-row">
            <div>
              <div className="section-eyebrow">POPULAR HOTELS</div>

              <h2>Recommended for You</h2>

              <p>Explore our top-rated hotels and find your perfect stay.</p>
            </div>

            <button className="view-all" onClick={scrollToHotels}>
              View All Hotels
              <span>→</span>
            </button>
          </div>

          {/* LOADING */}
          {loading && <div className="state-box">Loading hotels...</div>}

          {/* ERROR */}
          {!loading && error && (
            <div className="state-box error-box">{error}</div>
          )}

          {/* NO HOTELS */}
          {!loading && !error && hotels.length === 0 && (
            <div className="state-box">No hotels are available yet.</div>
          )}

          {/* HOTEL CARDS */}
          {!loading && hotels.length > 0 && (
            <div className="hotel-grid">
              {hotels.map((hotel, index) => {
                const id = hotel._id || hotel.id || `hotel-${index}`;

                const rating = getRating(hotel);

                const reviews = getReviews(hotel);

                const price = getPrice(hotel);

                const location = getLocation(hotel);

                const isFavorite = favorites.includes(id);

                return (
                  <article className="hotel-card" key={id}>
                    {/* HOTEL IMAGE */}
                    <div className="hotel-photo-wrap">
                      <img
                        src={getImage(hotel)}
                        alt={hotel.name || "Hotel"}
                        className="hotel-photo"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_HERO;
                        }}
                      />

                      {/* BADGE */}
                      <span
                        className={`hotel-badge ${
                          index % 3 === 1
                            ? "blue"
                            : index % 3 === 2
                              ? "purple"
                              : "green"
                        }`}
                      >
                        {hotel.badge ||
                          (index % 3 === 1
                            ? "Popular"
                            : index % 3 === 2
                              ? "Luxury"
                              : "Best Seller")}
                      </span>

                      {/* FAVORITE */}
                      <button
                        className={`favorite ${isFavorite ? "liked" : ""}`}
                        onClick={() => toggleFavorite(id)}
                        aria-label="Toggle favorite"
                      >
                        {isFavorite ? "♥" : "♡"}
                      </button>
                    </div>

                    {/* HOTEL CONTENT */}
                    <div className="hotel-card-body">
                      {/* TITLE + PRICE */}
                      <div className="hotel-title-row">
                        <h3>{hotel.name || "Hotel"}</h3>

                        <div className="card-price">
                          <strong>${price}</strong>

                          <span>per night</span>
                        </div>
                      </div>

                      {/* LOCATION */}
                      <div className="hotel-location">
                        <span>⌖</span>

                        {location}
                      </div>

                      {/* RATING */}
                      <div className="rating-row">
                        <span className="stars">★★★★★</span>

                        <strong>{rating}</strong>

                        <span className="review-text">({reviews} reviews)</span>
                      </div>

                      {/* DESCRIPTION */}
                      <p className="hotel-description">
                        {hotel.description ||
                          "Comfortable hotel with modern facilities"}
                      </p>

                      {/* AMENITIES */}
                      <div className="amenities">
                        <span>⌁ WiFi</span>

                        <span>❄ AC</span>

                        <span>▣ Parking</span>
                      </div>

                      {/* BUTTONS */}
                      <div className="card-actions">
                        <button
                          className="details-btn"
                          onClick={() => handleDetails(hotel)}
                        >
                          View Details
                        </button>

                        <button
                          className="book-btn"
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
          )}
        </section>

        {/* =====================================================
            SPECIAL OFFERS
        ===================================================== */}
        <section className="offers-banner" id="offers">
          <div className="offer-icon">☼</div>

          <div>
            <h2>Special Offers</h2>

            <p>Get up to 30% off on selected hotels.</p>
          </div>

          <button onClick={scrollToHotels}>
            Explore Deals
            <span>→</span>
          </button>
        </section>

        {/* =====================================================
            DESTINATIONS
        ===================================================== */}
        <section className="destinations" id="destinations">
          <div className="section-heading-row">
            <div>
              <div className="section-eyebrow">DESTINATIONS</div>

              <h2>Explore Ethiopia</h2>

              <p>Discover beautiful places and unforgettable stays.</p>
            </div>

            <button className="view-all" onClick={scrollToHotels}>
              Browse Hotels
              <span>→</span>
            </button>
          </div>

          <div className="destination-grid">
            {[
              [
                "Addis Ababa",
                "Capital city of Ethiopia",
                "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=900&q=80",
              ],

              [
                "Bahir Dar",
                "Beautiful lakeside destination",
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
              ],

              [
                "Hawassa",
                "Relaxing city beside Lake Hawassa",
                "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
              ],
            ].map(([name, text, image]) => (
              <button
                className="destination-card"
                key={name}
                onClick={scrollToHotels}
              >
                <img src={image} alt={name} />

                <div>
                  <h3>{name}</h3>

                  <p>{text}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* =====================================================
            ABOUT
        ===================================================== */}
        <section className="about-strip" id="about">
          <div>
            <div className="section-eyebrow">ABOUT HOTEL BOOKING</div>

            <h2>Your journey starts with the right stay.</h2>

            <p>
              Find trusted hotels, compare prices and book your next stay with
              confidence.
            </p>
          </div>

          <button onClick={scrollToHotels}>
            Find a Hotel
            <span>→</span>
          </button>
        </section>
      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="footer" id="footer">
        <div className="footer-main">
          {/* BRAND */}
          <div className="footer-brand">
            <button className="brand footer-logo" onClick={() => navigate("/")}>
              <span className="brand-icon">▣</span>

              <span>
                Hotel<span>Booking</span>
              </span>
            </button>

            <p>Find the perfect stay, wherever you go.</p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4>Quick Links</h4>

            <a href="#home">Home</a>

            <a href="#hotels">Hotels</a>

            <a href="#destinations">Destinations</a>

            <a href="#about">About</a>
          </div>

          {/* SUPPORT */}
          <div>
            <h4>Support</h4>

            <a href="#about">Help Center</a>

            <a href="#about">Terms & Conditions</a>

            <a href="#about">Privacy Policy</a>

            <a href="#about">Contact Us</a>
          </div>

          {/* ACCOUNT */}
          <div>
            <h4>Account</h4>

            <button onClick={() => navigate("/login")}>Login</button>

            <button onClick={() => navigate("/register")}>Register</button>

            <button onClick={() => navigate("/my-bookings")}>
              My Bookings
            </button>
          </div>

          {/* SOCIAL */}
          <div>
            <h4>Follow Us</h4>

            <div className="socials">
              <a href="#footer">f</a>

              <a href="#footer">𝕏</a>

              <a href="#footer">◎</a>

              <a href="#footer">in</a>
            </div>
          </div>
        </div>

        {/* FOOTER BOTTOM */}
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} HotelBooking. All rights reserved.
          </span>

          <em>Travel More ♡</em>
        </div>
      </footer>
    </div>
  );
}

export default Hotels;

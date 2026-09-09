import "./Hotels.css";
import { useEffect, useMemo, useState } from "react";
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
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [searched, setSearched] = useState(false);

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

  useEffect(() => {
    localStorage.setItem("favoriteHotels", JSON.stringify(favorites));
  }, [favorites]);

  const filteredHotels = useMemo(() => {
    const query = destination.trim().toLowerCase();
    if (!query) return hotels;

    return hotels.filter((hotel) =>
      [hotel.name, hotel.location, hotel.city, hotel.address]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [hotels, destination]);

  const toggleFavorite = (id) => {
    if (!id) return;
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const getImage = (hotel) => {
    if (!hotel?.image) return FALLBACK_HERO;
    if (String(hotel.image).startsWith("http")) return hotel.image;
    if (String(hotel.image).startsWith("/")) {
      return `http://localhost:5000${hotel.image}`;
    }
    return `http://localhost:5000/uploads/${hotel.image}`;
  };

  const getRating = (hotel) => Number(hotel?.rating ?? 4.8).toFixed(1);
  const getReviews = (hotel) => hotel?.reviews ?? 0;
  const getPrice = (hotel) => hotel?.price ?? 0;
  const getLocation = (hotel) => hotel?.location || hotel?.city || "Ethiopia";

  const handleSearch = () => {
    setSearched(true);
    document.getElementById("hotels")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBook = (hotel) => {
    if (!hotel?._id) return;

    sessionStorage.setItem(
      "hotelBookingSearch",
      JSON.stringify({ checkIn, checkOut, guests }),
    );

    navigate(`/booking/hotel/${hotel._id}`);
  };

  const handleDetails = (hotel) => {
    if (!hotel?._id) return;
    navigate(`/hotels/${hotel._id}`);
  };

  const scrollToHotels = () => {
    setDestination("");
    setSearched(false);
    document.getElementById("hotels")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="hotel-home">
      <header className="hotel-navbar">
        <div className="hotel-nav-inner">
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

          <div className="nav-actions">
            <button
              className="nav-search"
              aria-label="Search"
              onClick={handleSearch}
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
        <section
          className="hero"
          id="home"
          style={{ backgroundImage: `url("${FALLBACK_HERO}")` }}
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
                <br className="desktop-break" /> and unforgettable experiences
                at the best prices.
              </p>
            </div>

            <div className="booking-search-panel">
              <div className="search-control location-control">
                <span className="control-icon">⌖</span>
                <div>
                  <label>Location</label>
                  <input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Where are you going?"
                  />
                </div>
                <span className="chevron">⌄</span>
              </div>

              <div className="search-control">
                <span className="control-icon">□</span>
                <div>
                  <label>Check In</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>
                <span className="chevron">⌄</span>
              </div>

              <div className="search-control">
                <span className="control-icon">□</span>
                <div>
                  <label>Check Out</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
                <span className="chevron">⌄</span>
              </div>

              <div className="search-control guests-control">
                <span className="control-icon">♧</span>
                <div>
                  <label>Guests</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>
                        {n} Guest{n > 1 ? "s" : ""} · {Math.ceil(n / 2)} Room
                        {Math.ceil(n / 2) > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="chevron">⌄</span>
              </div>

              <button className="search-hotels-btn" onClick={handleSearch}>
                ⌕ <span>Search Hotels</span>
              </button>
            </div>
          </div>
        </section>

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

        <section className="hotels-section" id="hotels">
          <div className="section-heading-row">
            <div>
              <div className="section-eyebrow">POPULAR HOTELS</div>
              <h2>Recommended for You</h2>
              <p>Explore our top-rated hotels and find your perfect stay.</p>
            </div>
            <button className="view-all" onClick={scrollToHotels}>
              View All Hotels <span>→</span>
            </button>
          </div>

          {searched && destination && (
            <div className="search-result-note">
              Showing hotels matching <strong>{destination}</strong> ·{" "}
              {filteredHotels.length} result
              {filteredHotels.length === 1 ? "" : "s"}
              <button onClick={scrollToHotels}>Clear</button>
            </div>
          )}

          {loading && <div className="state-box">Loading hotels...</div>}
          {!loading && error && (
            <div className="state-box error-box">{error}</div>
          )}
          {!loading && !error && filteredHotels.length === 0 && (
            <div className="state-box">
              No hotels found. Try another location.
            </div>
          )}

          {!loading && filteredHotels.length > 0 && (
            <div className="hotel-grid">
              {filteredHotels.map((hotel, index) => {
                const id = hotel._id || hotel.id || `hotel-${index}`;
                const rating = getRating(hotel);
                const reviews = getReviews(hotel);
                const price = getPrice(hotel);
                const location = getLocation(hotel);
                const isFavorite = favorites.includes(id);

                return (
                  <article className="hotel-card" key={id}>
                    <div className="hotel-photo-wrap">
                      <img
                        src={getImage(hotel)}
                        alt={hotel.name || "Hotel"}
                        className="hotel-photo"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_HERO;
                        }}
                      />
                      <span
                        className={`hotel-badge ${index % 3 === 1 ? "blue" : index % 3 === 2 ? "purple" : "green"}`}
                      >
                        {hotel.badge ||
                          (index % 3 === 1
                            ? "Popular"
                            : index % 3 === 2
                              ? "Luxury"
                              : "Best Seller")}
                      </span>
                      <button
                        className={`favorite ${isFavorite ? "liked" : ""}`}
                        onClick={() => toggleFavorite(id)}
                        aria-label="Toggle favorite"
                      >
                        {isFavorite ? "♥" : "♡"}
                      </button>
                    </div>

                    <div className="hotel-card-body">
                      <div className="hotel-title-row">
                        <h3>{hotel.name || "Hotel"}</h3>
                        <div className="card-price">
                          <strong>${price}</strong>
                          <span>per night</span>
                        </div>
                      </div>
                      <div className="hotel-location">
                        <span>⌖</span>
                        {location}
                      </div>
                      <div className="rating-row">
                        <span className="stars">★★★★★</span>
                        <strong>{rating}</strong>
                        <span className="review-text">({reviews} reviews)</span>
                      </div>
                      <p className="hotel-description">
                        {hotel.description ||
                          "Comfortable hotel with modern facilities"}
                      </p>
                      <div className="amenities">
                        <span>⌁ WiFi</span>
                        <span>❄ AC</span>
                        <span>▣ Parking</span>
                      </div>
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
                          Book Now <span>→</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="offers-banner" id="offers">
          <div className="offer-icon">☼</div>
          <div>
            <h2>Special Offers</h2>
            <p>Get up to 30% off on selected hotels.</p>
          </div>
          <button onClick={scrollToHotels}>
            Explore Deals <span>→</span>
          </button>
        </section>

        <section className="destinations" id="destinations">
          <div className="section-heading-row">
            <div>
              <div className="section-eyebrow">DESTINATIONS</div>
              <h2>Explore Ethiopia</h2>
              <p>Discover beautiful places and unforgettable stays.</p>
            </div>
            <button className="view-all" onClick={scrollToHotels}>
              Browse Hotels <span>→</span>
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
                onClick={() => {
                  setDestination(name);
                  document
                    .getElementById("hotels")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
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
            Find a Hotel <span>→</span>
          </button>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <button className="brand footer-logo" onClick={() => navigate("/")}>
              <span className="brand-icon">▣</span>
              <span>
                Hotel<span>Booking</span>
              </span>
            </button>
            <p>Find the perfect stay, wherever you go.</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <a href="#home">Home</a>
            <a href="#hotels">Hotels</a>
            <a href="#destinations">Destinations</a>
            <a href="#about">About</a>
          </div>
          <div>
            <h4>Support</h4>
            <a href="#about">Help Center</a>
            <a href="#about">Terms & Conditions</a>
            <a href="#about">Privacy Policy</a>
            <a href="#about">Contact Us</a>
          </div>
          <div>
            <h4>Account</h4>
            <button onClick={() => navigate("/login")}>Login</button>
            <button onClick={() => navigate("/register")}>Register</button>
            <button onClick={() => navigate("/my-bookings")}>
              My Bookings
            </button>
          </div>
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

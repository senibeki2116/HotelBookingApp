import "./Hotels.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const API_URL = "http://localhost:5000";

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=2200&q=90";

const FALLBACK_HOTEL =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85";

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

  // VIEW ALL HOTELS
  const [showAllHotels, setShowAllHotels] = useState(false);

  // AI Finder
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResults, setAiResults] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // ========================================
  // FETCH HOTELS
  // ========================================

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
            "Could not load hotels. Please make sure the backend is running.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadHotels();
  }, []);

  // ========================================
  // SAVE FAVORITES
  // ========================================

  useEffect(() => {
    localStorage.setItem("favoriteHotels", JSON.stringify(favorites));
  }, [favorites]);

  // ========================================
  // FAVORITE
  // ========================================

  const toggleFavorite = (id) => {
    if (!id) return;

    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  // ========================================
  // HOTEL IMAGE
  // ========================================

  const getImage = (hotel) => {
    if (!hotel?.image) {
      return FALLBACK_HOTEL;
    }

    const image = String(hotel.image).trim();

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    if (image.startsWith("/")) {
      return `${API_URL}${image}`;
    }

    return `${API_URL}/uploads/${image}`;
  };

  // ========================================
  // SAFE VALUES
  // ========================================

  const getRating = (hotel) => {
    const rating = Number(hotel?.rating ?? 4.8);
    return rating.toFixed(1);
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

  const getHotelName = (hotel) => {
    return hotel?.name || hotel?.hotelName || "Luxury Hotel";
  };

  // ========================================
  // HOTEL ID
  // ========================================

  const getHotelId = (hotel) => {
    return hotel?._id || hotel?.id;
  };

  // ========================================
  // VIEW HOTEL DETAILS
  // ========================================

  const handleDetails = (hotel) => {
    const hotelId = getHotelId(hotel);

    if (!hotelId) {
      console.error("Hotel ID is missing:", hotel);

      alert("Unable to open hotel details because the hotel ID is missing.");

      return;
    }

    console.log("Opening hotel details:", hotelId);

    navigate(`/hotels/${hotelId}`);
  };

  // ========================================
  // BOOK HOTEL
  // ========================================

  const handleBook = (hotel) => {
    const hotelId = getHotelId(hotel);

    if (!hotelId) {
      console.error("Hotel ID is missing:", hotel);

      alert("Unable to book this hotel because the hotel ID is missing.");

      return;
    }

    navigate(`/booking/hotel/${hotelId}`);
  };

  // ========================================
  // NAVIGATION
  // ========================================

  const scrollToHotels = () => {
    document.getElementById("hotels")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const scrollToDestinations = () => {
    document.getElementById("destinations")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const scrollToAbout = () => {
    document.getElementById("about")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  // ========================================
  // VIEW ALL HOTELS
  // ========================================

  const handleViewAllHotels = () => {
    setShowAllHotels(true);

    setTimeout(() => {
      document.getElementById("hotels")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  // ========================================
  // AI RECOMMENDATION
  // ========================================

  const handleAIRecommend = async () => {
    if (!aiPrompt.trim()) {
      setAiError("Please tell us what kind of hotel you're looking for.");

      return;
    }

    try {
      setAiLoading(true);
      setAiError("");
      setAiResults([]);

      const response = await fetch(`${API_URL}/api/ai/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: aiPrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to get hotel recommendations.",
        );
      }

      const recommendations =
        data?.recommendations || data?.hotels || data?.results || [];

      setAiResults(Array.isArray(recommendations) ? recommendations : []);
    } catch (err) {
      console.error("AI recommendation error:", err);

      setAiError(
        err.message || "Something went wrong while finding your perfect hotel.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  const useExamplePrompt = (prompt) => {
    setAiPrompt(prompt);
    setAiError("");
  };

  // ========================================
  // DISPLAY HOTELS
  // ========================================

  const displayHotels = showAllHotels ? hotels : hotels.slice(0, 6);

  return (
    <div className="hotel-home">
      {/* ================= NAVBAR ================= */}

      <header className="main-navbar">
        <div className="nav-container">
          <button
            type="button"
            className="brand"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            <span className="brand-icon">H</span>

            <span>
              <strong>Hotel</strong>
              <em>Booking</em>
            </span>
          </button>

          <nav className="desktop-nav">
            <button
              type="button"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
            >
              Home
            </button>

            <button type="button" onClick={scrollToHotels}>
              Hotels
            </button>

            <button type="button" onClick={scrollToDestinations}>
              Destinations
            </button>

            <button type="button" onClick={scrollToAbout}>
              About
            </button>

            <button type="button" onClick={() => navigate("/bookings")}>
              My Bookings
            </button>
          </nav>

          {/* ================= LOGIN / LOGOUT ================= */}

          {/* WISHLIST BUTTON */}
          <button
            type="button"
            className="transparent-icon-button wishlist-nav-button"
            onClick={() => navigate("/wishlist")}
            title="Wishlist"
          >
            <svg viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
            </svg>

            {favorites.length > 0 && (
              <span className="wishlist-count">{favorites.length}</span>
            )}
          </button>

          {/* PROFILE BUTTON */}
          <button
            type="button"
            className="transparent-icon-button profile-nav-button"
            onClick={() => navigate("/profile")}
            title="My Profile"
          >
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7" />
            </svg>
          </button>

          {/* Sign In / Sign Out */}
          {localStorage.getItem("token") ? (
            <button
              type="button"
              className="login-link"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.reload();
              }}
            >
              Sign Out
            </button>
          ) : (
            <>
              <button
                type="button"
                className="login-link"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>

              <button
                type="button"
                className="register-button"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
            </>
          )}
        </div>
      </header>

      {/* ================= HERO ================= */}

      <section className="hero-section">
        <img className="hero-image" src={FALLBACK_HERO} alt="Luxury hotel" />

        <div className="hero-overlay"></div>

        <div className="hero-content">
          <div className="hero-badge">
            <span>✦</span>
            DISCOVER YOUR PERFECT STAY
          </div>

          <h1>
            Stay somewhere
            <br />
            <span>extraordinary.</span>
          </h1>

          <p>
            Discover beautiful hotels, unforgettable destinations, and
            comfortable stays across Ethiopia.
          </p>

          <div className="hero-buttons">
            <button
              type="button"
              className="primary-hero-button"
              onClick={scrollToHotels}
            >
              Explore Hotels
              <span>→</span>
            </button>

            <button
              type="button"
              className="secondary-hero-button"
              onClick={() =>
                document.getElementById("ai-finder")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              ✨ Find with AI
            </button>
          </div>
        </div>

        {/* ================= BOOKING BAR ================= */}

        <div className="booking-bar">
          <div className="booking-field">
            <div className="booking-icon">⌖</div>

            <div>
              <span>DESTINATION</span>
              <strong>Ethiopia</strong>
            </div>
          </div>

          <div className="booking-divider"></div>

          <div className="booking-field">
            <div className="booking-icon">◷</div>

            <div>
              <span>CHECK IN</span>
              <strong>Select date</strong>
            </div>
          </div>

          <div className="booking-divider"></div>

          <div className="booking-field">
            <div className="booking-icon">◷</div>

            <div>
              <span>CHECK OUT</span>
              <strong>Select date</strong>
            </div>
          </div>

          <div className="booking-divider"></div>

          <div className="booking-field">
            <div className="booking-icon">♙</div>

            <div>
              <span>GUESTS</span>
              <strong>2 Guests</strong>
            </div>
          </div>

          <button
            type="button"
            className="booking-search-button"
            onClick={scrollToHotels}
          >
            Search
            <span>→</span>
          </button>
        </div>
      </section>

      {/* ================= TRUST BAR ================= */}

      <section className="trust-section">
        <div className="trust-container">
          <div className="trust-item">
            <span>✦</span>

            <div>
              <strong>Best Price</strong>
              <small>Guaranteed</small>
            </div>
          </div>

          <div className="trust-item">
            <span>★</span>

            <div>
              <strong>Trusted Reviews</strong>
              <small>From real guests</small>
            </div>
          </div>

          <div className="trust-item">
            <span>✓</span>

            <div>
              <strong>Easy Booking</strong>
              <small>Fast & secure</small>
            </div>
          </div>

          <div className="trust-item">
            <span>24</span>

            <div>
              <strong>24/7 Support</strong>
              <small>Always here for you</small>
            </div>
          </div>
        </div>
      </section>

      {/* ================= AI FINDER ================= */}

      <section id="ai-finder" className="ai-section">
        <div className="ai-container">
          <div className="ai-heading">
            <span className="section-eyebrow">SMART TRAVEL SEARCH</span>

            <h2>
              Let AI find your
              <br />
              <span>perfect hotel.</span>
            </h2>

            <p>
              Tell us what you need in your own words. Our smart hotel finder
              will help you discover the best match.
            </p>
          </div>

          <div className="ai-card">
            <div className="ai-card-top">
              <div className="ai-symbol">✦</div>

              <div>
                <strong>AI Hotel Finder</strong>

                <span>Personalized recommendations</span>
              </div>
            </div>

            <div className="ai-input-wrapper">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Example: I need a cheap hotel in Addis Ababa for 2 people..."
                rows="3"
              />

              <button
                type="button"
                className="ai-find-button"
                onClick={handleAIRecommend}
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <>
                    <span className="ai-spinner"></span>
                    Finding...
                  </>
                ) : (
                  <>
                    Find My Hotel
                    <span>→</span>
                  </>
                )}
              </button>
            </div>

            <div className="example-prompts">
              <span>Try:</span>

              <button
                type="button"
                onClick={() =>
                  useExamplePrompt(
                    "I need a cheap hotel in Addis Ababa for 2 people",
                  )
                }
              >
                Budget stay in Addis Ababa
              </button>

              <button
                type="button"
                onClick={() =>
                  useExamplePrompt("I want a luxury hotel in Addis Ababa")
                }
              >
                Luxury hotel
              </button>

              <button
                type="button"
                onClick={() =>
                  useExamplePrompt("Find a family friendly hotel in Bahir Dar")
                }
              >
                Family hotel
              </button>
            </div>

            {aiError && (
              <div className="ai-error">
                <span>!</span>
                {aiError}
              </div>
            )}

            {aiLoading && (
              <div className="ai-loading-box">
                <div className="ai-loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <p>Finding hotels that match your preferences...</p>
              </div>
            )}

            {!aiLoading && aiResults.length > 0 && (
              <div className="ai-results">
                <div className="ai-results-header">
                  <div>
                    <span className="section-eyebrow">AI RECOMMENDATIONS</span>

                    <h3>We found these for you</h3>
                  </div>

                  <span className="result-count">
                    {aiResults.length} matches
                  </span>
                </div>

                <div className="ai-result-grid">
                  {aiResults.map((hotel, index) => (
                    <HotelCard
                      key={hotel?._id || hotel?.id || index}
                      hotel={hotel}
                      getImage={getImage}
                      getRating={getRating}
                      getReviews={getReviews}
                      getPrice={getPrice}
                      getLocation={getLocation}
                      getHotelName={getHotelName}
                      favorites={favorites}
                      toggleFavorite={toggleFavorite}
                      handleDetails={handleDetails}
                      handleBook={handleBook}
                      aiReason={hotel?.reason}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= HOTELS ================= */}

      <section id="hotels" className="hotels-section">
        <div className="section-container">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">HANDPICKED FOR YOU</span>

              <h2>
                Popular <span>hotels</span>
              </h2>

              <p>
                Beautiful places to stay, selected for comfort, quality and
                unforgettable experiences.
              </p>
            </div>

            {/* FIXED VIEW ALL BUTTON */}

            {!showAllHotels && hotels.length > 6 && (
              <button
                type="button"
                className="view-all-button"
                onClick={handleViewAllHotels}
              >
                View All Hotels
                <span>→</span>
              </button>
            )}

            {showAllHotels && hotels.length > 6 && (
              <button
                type="button"
                className="view-all-button"
                onClick={() => {
                  setShowAllHotels(false);

                  setTimeout(() => {
                    document.getElementById("hotels")?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }, 100);
                }}
              >
                Show Less
                <span>↑</span>
              </button>
            )}
          </div>

          {loading && (
            <div className="hotel-loading">
              <div className="loading-spinner"></div>

              <p>Finding beautiful places to stay...</p>
            </div>
          )}

          {!loading && error && (
            <div className="hotel-error">
              <div>!</div>

              <h3>Unable to load hotels</h3>

              <p>{error}</p>
            </div>
          )}

          {!loading && !error && displayHotels.length === 0 && (
            <div className="hotel-empty">
              <div>⌂</div>

              <h3>No hotels available yet</h3>

              <p>Hotels will appear here once they are added to the system.</p>
            </div>
          )}

          {!loading && !error && displayHotels.length > 0 && (
            <div className="hotel-grid">
              {displayHotels.map((hotel, index) => (
                <HotelCard
                  key={hotel?._id || hotel?.id || index}
                  hotel={hotel}
                  getImage={getImage}
                  getRating={getRating}
                  getReviews={getReviews}
                  getPrice={getPrice}
                  getLocation={getLocation}
                  getHotelName={getHotelName}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  handleDetails={handleDetails}
                  handleBook={handleBook}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= OFFER ================= */}

      <section className="offer-section">
        <div className="offer-container">
          <div className="offer-content">
            <span className="offer-label">SPECIAL OFFER</span>

            <h2>
              Make your next stay
              <br />
              <span>extra special.</span>
            </h2>

            <p>
              Discover selected stays and enjoy an unforgettable experience with
              HotelBooking.
            </p>

            <button type="button" onClick={scrollToHotels}>
              Explore Our Hotels
              <span>→</span>
            </button>
          </div>

          <div className="offer-decoration">
            <div className="offer-circle"></div>

            <div className="offer-card-small">
              <span>✦</span>

              <strong>Beautiful stays</strong>

              <small>Made for memorable moments</small>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DESTINATIONS ================= */}

      <section id="destinations" className="destinations-section">
        <div className="section-container">
          <div className="section-header centered">
            <span className="section-eyebrow">EXPLORE ETHIOPIA</span>

            <h2>
              Find your next <span>destination.</span>
            </h2>

            <p>
              From vibrant city life to peaceful lakeside escapes, discover
              somewhere worth remembering.
            </p>
          </div>

          <div className="destination-grid">
            <DestinationCard
              image="https://images.unsplash.com/photo-1611416517780-eff3a13b0359?auto=format&fit=crop&w=1000&q=85"
              name="Addis Ababa"
              subtitle="The capital city"
              onClick={scrollToHotels}
            />

            <DestinationCard
              image="https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1000&q=85"
              name="Bahir Dar"
              subtitle="Lakeside escape"
              onClick={scrollToHotels}
            />

            <DestinationCard
              image="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1000&q=85"
              name="Hawassa"
              subtitle="Relax & explore"
              onClick={scrollToHotels}
            />
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}

      <section id="about" className="about-section">
        <div className="about-container">
          <div className="about-image-wrapper">
            <img
              src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=85"
              alt="Luxury hotel interior"
            />

            <div className="about-stat">
              <strong>4.9</strong>

              <span>Guest rating</span>

              <div>★★★★★</div>
            </div>
          </div>

          <div className="about-content">
            <span className="section-eyebrow">WHY HOTELBOOKING</span>

            <h2>
              Travel more.
              <br />
              <span>Worry less.</span>
            </h2>

            <p>
              We make finding and booking your next stay simple. Whether you're
              traveling for business, relaxing with family, or planning your
              next adventure, HotelBooking helps you find a place that feels
              right.
            </p>

            <div className="about-features">
              <div>
                <span>✓</span>

                <div>
                  <strong>Verified stays</strong>

                  <small>Quality places you can trust.</small>
                </div>
              </div>

              <div>
                <span>✓</span>

                <div>
                  <strong>Simple booking</strong>

                  <small>Book your stay in just a few clicks.</small>
                </div>
              </div>

              <div>
                <span>✓</span>

                <div>
                  <strong>Smart recommendations</strong>

                  <small>Let AI help you find your match.</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}

      <footer className="hotel-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <button
              type="button"
              className="brand footer-brand-logo"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
            >
              <span className="brand-icon">H</span>

              <span>
                <strong>Hotel</strong>

                <em>Booking</em>
              </span>
            </button>

            <p>
              Beautiful stays. Better journeys.
              <br />
              Discover Ethiopia with confidence.
            </p>
          </div>

          <div className="footer-column">
            <h4>Explore</h4>

            <button type="button" onClick={scrollToHotels}>
              Hotels
            </button>

            <button type="button" onClick={scrollToDestinations}>
              Destinations
            </button>

            <button type="button" onClick={scrollToAbout}>
              About Us
            </button>
          </div>

          <div className="footer-column">
            <h4>Account</h4>

            <button type="button" onClick={() => navigate("/login")}>
              Sign In
            </button>

            <button type="button" onClick={() => navigate("/register")}>
              Register
            </button>

            <button type="button" onClick={() => navigate("/bookings")}>
              My Bookings
            </button>
          </div>

          <div className="footer-column">
            <h4>Need help?</h4>

            <p>We're here for you 24/7.</p>

            <span className="footer-contact">✉ support@hotelbooking.com</span>

            <span className="footer-contact">☎ +251 900 000 000</span>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 HotelBooking. All rights reserved.</span>

          <span>Made for unforgettable stays.</span>
        </div>
      </footer>
    </div>
  );
}

// =====================================================
// HOTEL CARD
// =====================================================

function HotelCard({
  hotel,
  getImage,
  getRating,
  getReviews,
  getPrice,
  getLocation,
  getHotelName,
  favorites,
  toggleFavorite,
  handleDetails,
  handleBook,
  aiReason,
}) {
  const hotelId = hotel?._id || hotel?.id;

  const isFavorite = favorites.includes(hotelId);

  const rating = Number(getRating(hotel));

  return (
    <article className="hotel-card">
      <div className="hotel-image-wrapper">
        <img
          src={getImage(hotel)}
          alt={getHotelName(hotel)}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_HOTEL;
          }}
        />

        <div className="hotel-image-gradient"></div>

        <button
          type="button"
          className={`favorite-button ${isFavorite ? "active" : ""}`}
          onClick={() => toggleFavorite(hotelId)}
          aria-label="Favorite hotel"
        >
          {isFavorite ? "♥" : "♡"}
        </button>

        <div className="hotel-location">
          <span>⌖</span>
          {getLocation(hotel)}
        </div>

        {aiReason && <div className="ai-match-badge">✦ AI MATCH</div>}
      </div>

      <div className="hotel-card-content">
        <div className="hotel-card-title-row">
          <div>
            <h3>{getHotelName(hotel)}</h3>

            <div className="hotel-rating">
              <span className="stars">
                {"★★★★★".split("").map((star, index) => (
                  <span
                    key={index}
                    className={index < Math.round(rating) ? "filled" : ""}
                  >
                    {star}
                  </span>
                ))}
              </span>

              <strong>{getRating(hotel)}</strong>

              <span>({getReviews(hotel)} reviews)</span>
            </div>
          </div>
        </div>

        {aiReason && (
          <div className="ai-reason">
            <span>✦</span>

            {aiReason}
          </div>
        )}

        <div className="hotel-card-bottom">
          <div className="hotel-price">
            <strong>${getPrice(hotel)}</strong>

            <span>/ night</span>
          </div>

          <div className="hotel-actions">
            <button
              type="button"
              className="details-button"
              onClick={() => handleDetails(hotel)}
            >
              Details
            </button>

            <button
              type="button"
              className="book-button"
              onClick={() => handleBook(hotel)}
            >
              Book Now
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// =====================================================
// DESTINATION CARD
// =====================================================

function DestinationCard({ image, name, subtitle, onClick }) {
  return (
    <button type="button" className="destination-card" onClick={onClick}>
      <img src={image} alt={name} />

      <div className="destination-overlay"></div>

      <div className="destination-content">
        <span>{subtitle}</span>

        <h3>{name}</h3>

        <div className="destination-arrow">Explore →</div>
      </div>
    </button>
  );
}

export default Hotels;

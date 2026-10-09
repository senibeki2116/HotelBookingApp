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

  const [isLoggedIn, setIsLoggedIn] = useState(() =>
    Boolean(
      localStorage.getItem("token") || localStorage.getItem("accessToken"),
    ),
  );

  const handleAuthButton = () => {
    setMenuOpen(false);

    if (isLoggedIn) {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      setIsLoggedIn(false);
      navigate("/");
    } else {
      navigate("/login");
    }
  };

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

  // AI FINDER
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResults, setAiResults] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // HEADER MENU
  const [menuOpen, setMenuOpen] = useState(false);

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

  const handleAIRecommend = () => {
    console.log("🔎 Hotel search started");
    console.log("User request:", aiPrompt);
    console.log("Available hotels:", hotels);

    if (!aiPrompt.trim()) {
      setAiError("Please tell us what kind of hotel you're looking for.");
      return;
    }

    if (!Array.isArray(hotels) || hotels.length === 0) {
      setAiError("No hotels are currently available.");
      console.log("❌ No hotels available:", hotels);
      return;
    }

    try {
      setAiLoading(true);
      setAiError("");
      setAiResults([]);

      const prompt = aiPrompt.toLowerCase().trim();

      // -----------------------------------------
      // USER PREFERENCES
      // -----------------------------------------

      const wantsCheap =
        prompt.includes("cheap") ||
        prompt.includes("budget") ||
        prompt.includes("affordable") ||
        prompt.includes("low price") ||
        prompt.includes("inexpensive");

      const wantsLuxury =
        prompt.includes("luxury") ||
        prompt.includes("luxurious") ||
        prompt.includes("premium") ||
        prompt.includes("expensive") ||
        prompt.includes("high end");

      const wantsFamily =
        prompt.includes("family") ||
        prompt.includes("children") ||
        prompt.includes("kids") ||
        prompt.includes("child");

      const wantsBusiness =
        prompt.includes("business") ||
        prompt.includes("work") ||
        prompt.includes("office") ||
        prompt.includes("business trip");

      const wantsRomantic =
        prompt.includes("romantic") ||
        prompt.includes("couple") ||
        prompt.includes("honeymoon");

      // -----------------------------------------
      // LOCATION
      // -----------------------------------------

      const locations = [
        "addis ababa",
        "bahir dar",
        "hawassa",
        "gondar",
        "mekele",
        "dire dawa",
        "jimma",
        "lalibela",
        "arbaminch",
        "arba minch",
        "axum",
        "harar",
      ];

      const requestedLocation = locations.find((city) => prompt.includes(city));

      console.log("📍 Requested location:", requestedLocation);

      // -----------------------------------------
      // NUMBER OF GUESTS
      // -----------------------------------------

      const guestMatch = prompt.match(
        /(\d+)\s*(people|person|guests|guest|adults)/i,
      );

      const requestedGuests = guestMatch ? Number(guestMatch[1]) : null;

      console.log("👥 Requested guests:", requestedGuests);

      // -----------------------------------------
      // SCORE HOTELS
      // -----------------------------------------

      const scoredHotels = hotels.map((hotel) => {
        let score = 0;
        const reasons = [];

        // Get hotel information safely
        const name = String(
          hotel?.name || hotel?.hotelName || hotel?.title || "Hotel",
        ).toLowerCase();

        const location = String(
          hotel?.location || hotel?.city || hotel?.address || "",
        ).toLowerCase();

        const price = Number(
          hotel?.price || hotel?.pricePerNight || hotel?.amount || 0,
        );

        const rating = Number(
          hotel?.rating || hotel?.stars || hotel?.averageRating || 0,
        );

        const description = String(
          hotel?.description ||
            hotel?.about ||
            hotel?.amenities ||
            hotel?.facilities ||
            "",
        ).toLowerCase();

        const searchableText =
          `${name} ${location} ${description}`.toLowerCase();

        // -----------------------------------------
        // LOCATION MATCH
        // -----------------------------------------

        if (requestedLocation) {
          const cleanRequestedLocation = requestedLocation.replace(
            "arba minch",
            "arbaminch",
          );

          const cleanHotelLocation = location.replace(
            "arba minch",
            "arbaminch",
          );

          if (cleanHotelLocation.includes(cleanRequestedLocation)) {
            score += 100;
            reasons.push(`Located in ${requestedLocation}`);
          } else {
            score -= 30;
          }
        }

        // -----------------------------------------
        // CHEAP / BUDGET
        // -----------------------------------------

        if (wantsCheap && price > 0) {
          if (price <= 100) {
            score += 50;
            reasons.push("Budget-friendly price");
          } else if (price <= 200) {
            score += 25;
            reasons.push("Reasonable price");
          } else {
            score -= 20;
          }
        }

        // -----------------------------------------
        // LUXURY
        // -----------------------------------------

        if (wantsLuxury) {
          if (rating >= 4.5) {
            score += 40;
            reasons.push("Highly rated luxury stay");
          }

          if (price >= 150) {
            score += 30;
            reasons.push("Premium accommodation");
          }

          if (
            searchableText.includes("luxury") ||
            searchableText.includes("premium") ||
            searchableText.includes("5 star") ||
            searchableText.includes("five star")
          ) {
            score += 40;
            reasons.push("Luxury facilities");
          }
        }

        // -----------------------------------------
        // RATING
        // -----------------------------------------

        if (rating >= 4.8) {
          score += 30;
          reasons.push("Excellent guest rating");
        } else if (rating >= 4.5) {
          score += 20;
          reasons.push("Very highly rated");
        } else if (rating >= 4.0) {
          score += 10;
        }

        // -----------------------------------------
        // FAMILY
        // -----------------------------------------

        if (wantsFamily) {
          if (
            searchableText.includes("family") ||
            searchableText.includes("children") ||
            searchableText.includes("kids") ||
            searchableText.includes("child") ||
            searchableText.includes("playground") ||
            searchableText.includes("pool")
          ) {
            score += 50;
            reasons.push("Family-friendly");
          }
        }

        // -----------------------------------------
        // BUSINESS
        // -----------------------------------------

        if (wantsBusiness) {
          if (
            searchableText.includes("business") ||
            searchableText.includes("wifi") ||
            searchableText.includes("wi-fi") ||
            searchableText.includes("conference") ||
            searchableText.includes("meeting") ||
            searchableText.includes("office")
          ) {
            score += 40;
            reasons.push("Good for business travel");
          }
        }

        // -----------------------------------------
        // ROMANTIC
        // -----------------------------------------

        if (wantsRomantic) {
          if (
            searchableText.includes("romantic") ||
            searchableText.includes("couple") ||
            searchableText.includes("honeymoon") ||
            searchableText.includes("luxury") ||
            searchableText.includes("spa")
          ) {
            score += 45;
            reasons.push("Great for couples");
          }
        }

        // -----------------------------------------
        // KEYWORD MATCH
        // -----------------------------------------

        const words = prompt
          .split(/\s+/)
          .map((word) => word.replace(/[^\w]/g, ""))
          .filter((word) => word.length > 3);

        let matches = 0;

        words.forEach((word) => {
          if (searchableText.includes(word)) {
            matches++;
            score += 5;
          }
        });

        if (matches > 0) {
          reasons.push("Matches your preferences");
        }

        // -----------------------------------------
        // GUEST CAPACITY
        // -----------------------------------------

        if (requestedGuests) {
          const capacity = Number(
            hotel?.maxGuests ||
              hotel?.guests ||
              hotel?.capacity ||
              hotel?.maxOccupancy ||
              hotel?.numberOfGuests ||
              0,
          );

          if (capacity >= requestedGuests) {
            score += 25;
            reasons.push(`Suitable for ${requestedGuests} guests`);
          }
        }

        // -----------------------------------------
        // GENERAL QUALITY
        // -----------------------------------------

        score += rating * 3;

        return {
          ...hotel,
          recommendationScore: score,
          reason:
            reasons.length > 0
              ? reasons.slice(0, 2).join(" • ")
              : "Good overall match for your search",
        };
      });

      // -----------------------------------------
      // SORT RESULTS
      // -----------------------------------------

      scoredHotels.sort(
        (a, b) => b.recommendationScore - a.recommendationScore,
      );

      // -----------------------------------------
      // TOP 6
      // -----------------------------------------

      const recommendations = scoredHotels
        .slice(0, 6)
        .map(({ recommendationScore, ...hotel }) => hotel);

      console.log("✅ Recommendations:", recommendations);

      setAiResults(recommendations);

      if (recommendations.length === 0) {
        setAiError("We couldn't find hotels matching your preferences.");
      }
    } catch (err) {
      console.error("❌ Hotel recommendation error:", err);

      setAiError("Something went wrong while finding your perfect hotel.");
    } finally {
      setAiLoading(false);
    }
  };
  // ========================================
  // DISPLAY HOTELS
  // ========================================

  const displayHotels = showAllHotels ? hotels : hotels.slice(0, 6);

  return (
    <div className="hotel-home">
      {/* ================= NAVBAR ================= */}

      <header className={`main-navbar ${menuOpen ? "menu-is-open" : ""}`}>
        <div className="nav-container">
          {/* ================= BRAND ================= */}

          <button
            type="button"
            className="brand"
            onClick={() => {
              setMenuOpen(false);

              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
            aria-label="Go to homepage"
          >
            <span className="brand-text">
              <strong>HOTELBOOKING</strong>
            </span>
          </button>

          {/* ================= HEADER ACTIONS ================= */}

          <div className="header-actions">
            {/* LOGIN / LOGOUT */}
            <button
              type="button"
              className={`auth-header-button ${
                isLoggedIn ? "logout-header-button" : "login-header-button"
              }`}
              onClick={handleAuthButton}
            >
              {isLoggedIn ? "Logout" : "Login"}
            </button>

            {/* WISHLIST */}

            <button
              type="button"
              className="header-action wishlist-header-button"
              onClick={() => {
                setMenuOpen(false);
                navigate("/wishlist");
              }}
              aria-label="Wishlist"
              title="Wishlist"
            >
              <span className="header-action-icon">♡</span>

              {favorites.length > 0 && (
                <span className="wishlist-count">{favorites.length}</span>
              )}
            </button>

            {/* PROFILE */}

            <button
              type="button"
              className="header-action profile-header-button"
              onClick={() => {
                setMenuOpen(false);
                navigate("/profile");
              }}
              aria-label="Profile"
              title="Profile"
            >
              <span className="header-action-icon">♙</span>
            </button>

            {/* HAMBURGER */}

            <button
              type="button"
              className={`hamburger-button ${menuOpen ? "is-open" : ""}`}
              onClick={() => setMenuOpen((current) => !current)}
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen}
              onMouseEnter={() => setMenuOpen(true)}
              onMouseLeave={() => {
                window.setTimeout(() => {
                  const menu = document.querySelector(".top-menu:hover");

                  if (!menu) {
                    setMenuOpen(false);
                  }
                }, 40);
              }}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        {/* ================= TOP MENU ================= */}

        <div
          className={`top-menu ${menuOpen ? "top-menu-open" : ""}`}
          aria-hidden={!menuOpen}
          onMouseEnter={() => setMenuOpen(true)}
          onMouseLeave={() => setMenuOpen(false)}
        >
          <div className="top-menu-glass">
            <div className="top-menu-inner">
              {/* MENU HEADING */}

              <div className="top-menu-heading">
                <div className="top-menu-heading-copy">
                  <span>HOTEL BOOKING</span>

                  <p>Explore. Stay. Experience.</p>

                  <small>Beautiful stays, unforgettable journeys.</small>
                </div>
              </div>

              {/* MENU LINKS */}

              <nav className="top-menu-links">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);

                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                >
                  <span className="top-menu-index">01</span>
                  <span className="top-menu-title">Home</span>
                  <span className="top-menu-arrow">↗</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    scrollToHotels();
                  }}
                >
                  <span className="top-menu-index">02</span>
                  <span className="top-menu-title">Hotels</span>
                  <span className="top-menu-arrow">↗</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    scrollToDestinations();
                  }}
                >
                  <span className="top-menu-index">03</span>
                  <span className="top-menu-title">Destinations</span>
                  <span className="top-menu-arrow">↗</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    scrollToAbout();
                  }}
                >
                  <span className="top-menu-index">04</span>
                  <span className="top-menu-title">About Us</span>
                  <span className="top-menu-arrow">↗</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/bookings");
                  }}
                >
                  <span className="top-menu-index">05</span>
                  <span className="top-menu-title">My Bookings</span>
                  <span className="top-menu-arrow">↗</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/wishlist");
                  }}
                >
                  <span className="top-menu-index">06</span>

                  <span className="top-menu-title">
                    My Wishlist
                    {favorites.length > 0 && (
                      <span className="top-menu-count">{favorites.length}</span>
                    )}
                  </span>

                  <span className="top-menu-arrow">↗</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                >
                  <span className="top-menu-index">07</span>

                  <span className="top-menu-title">My Profile</span>

                  <span className="top-menu-arrow">↗</span>
                </button>

                {!isLoggedIn && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/login");
                    }}
                  >
                    <span className="top-menu-index">08</span>

                    <span className="top-menu-title">Sign In</span>

                    <span className="top-menu-arrow">↗</span>
                  </button>
                )}
              </nav>

              {/* MENU BOTTOM */}

              <div className="top-menu-bottom">
                <span>DISCOVER BEAUTIFUL STAYS</span>
                <strong>Across Ethiopia</strong>
              </div>
            </div>
          </div>
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

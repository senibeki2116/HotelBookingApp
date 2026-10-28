import "./Hotels.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const API_URL = "http://localhost:5000";

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=2200&q=90";

const FALLBACK_HOTEL =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85";

const WELCOME_EXAMPLES = [
  {
    label: "Budget stay in Addis Ababa",
    prompt: "I need a cheap hotel in Addis Ababa for 2 people",
  },
  {
    label: "Luxury hotel",
    prompt: "I want a luxury hotel in Addis Ababa",
  },
  {
    label: "Family hotel",
    prompt: "Find a family friendly hotel in Bahir Dar",
  },
];

const LOCATIONS = [
  "addis ababa",
  "bahir dar",
  "hawassa",
  "gondar",
  "mekele",
  "dire dawa",
  "jimma",
  "lalibela",
  "arba minch",
  "axum",
  "harar",
];

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/arba\s*minch/g, "arba minch")
    .replace(/[,\-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getHotelIdForCard(hotel) {
  return hotel?._id || hotel?.id;
}

function getHotelNameValue(hotel) {
  return hotel?.name || hotel?.hotelName || hotel?.title || "Hotel";
}

function getHotelLocationValue(hotel) {
  return hotel?.location || hotel?.city || hotel?.address || "Ethiopia";
}

function getHotelPriceValue(hotel) {
  return Number(hotel?.price ?? hotel?.pricePerNight ?? hotel?.amount ?? 0);
}

function getHotelRatingValue(hotel) {
  return Number(hotel?.rating ?? hotel?.averageRating ?? hotel?.stars ?? 0);
}

function Hotels() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(() =>
    Boolean(
      localStorage.getItem("token") || localStorage.getItem("accessToken"),
    ),
  );

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("favoriteHotels") || "[]");

      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [showAllHotels, setShowAllHotels] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // AI HOTEL FINDER
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResults, setAiResults] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiSearched, setAiSearched] = useState(false);

  // FETCH HOTELS
  useEffect(() => {
    let cancelled = false;

    async function loadHotels() {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/hotels");

        const data = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.hotels)
            ? response.data.hotels
            : [];

        if (!cancelled) {
          setHotels(data);
        }
      } catch (err) {
        console.error("Failed to load hotels:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Could not load hotels. Please make sure the backend is running.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHotels();

    return () => {
      cancelled = true;
    };
  }, []);

  // SAVE FAVORITES
  useEffect(() => {
    localStorage.setItem("favoriteHotels", JSON.stringify(favorites));
  }, [favorites]);

  // AUTHENTICATION
  const handleAuthButton = () => {
    setMenuOpen(false);

    if (isLoggedIn) {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      setIsLoggedIn(false);
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  // FAVORITES
  const toggleFavorite = (id) => {
    if (id === undefined || id === null) return;

    setFavorites((current) =>
      current.some((item) => String(item) === String(id))
        ? current.filter((item) => String(item) !== String(id))
        : [...current, id],
    );
  };

  // HOTEL IMAGES
  const getImage = (hotel) => {
    if (!hotel?.image) return FALLBACK_HOTEL;

    const image = String(hotel.image).trim();

    if (/^https?:\/\//i.test(image)) return image;

    if (image.startsWith("/")) return `${API_URL}${image}`;

    return `${API_URL}/uploads/${image}`;
  };

  // HOTEL VALUES
  const getRating = (hotel) => {
    const rating = getHotelRatingValue(hotel);
    return Number.isFinite(rating) ? rating.toFixed(1) : "0.0";
  };

  const getReviews = (hotel) => hotel?.reviews ?? hotel?.reviewCount ?? 0;

  const getPrice = (hotel) => {
    const price = getHotelPriceValue(hotel);
    return Number.isFinite(price) ? price.toLocaleString() : "0";
  };

  const getLocation = getHotelLocationValue;
  const getHotelName = getHotelNameValue;

  // HOTEL DETAILS
  const handleDetails = (hotel) => {
    const id = getHotelIdForCard(hotel);

    if (!id) {
      console.error("Hotel ID is missing:", hotel);
      alert("Unable to open hotel details because the hotel ID is missing.");
      return;
    }

    navigate(`/hotels/${id}`);
  };

  // BOOK HOTEL
  const handleBook = (hotel) => {
    const id = getHotelIdForCard(hotel);

    if (!id) {
      console.error("Hotel ID is missing:", hotel);
      alert("Unable to book this hotel because the hotel ID is missing.");
      return;
    }

    navigate(`/booking/hotel/${id}`);
  };

  // NAVIGATION
  const scrollToHotels = () => {
    setMenuOpen(false);
    document.getElementById("hotels")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scrollToDestinations = () => {
    setMenuOpen(false);
    document.getElementById("destinations")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scrollToAbout = () => {
    setMenuOpen(false);
    document.getElementById("about")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scrollToAI = () => {
    document.getElementById("ai-finder")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleViewAllHotels = () => {
    setShowAllHotels(true);

    window.setTimeout(() => {
      document.getElementById("hotels")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  // AI EXAMPLE PROMPTS
  const useExamplePrompt = (prompt) => {
    setAiPrompt(prompt);
    setAiError("");
    setAiResults([]);
    setAiSearched(false);

    window.setTimeout(() => {
      document.querySelector("#ai-finder textarea")?.focus();
    }, 0);
  };

  // AI HOTEL RECOMMENDATIONS
  const handleAIRecommend = async () => {
    const prompt = normalize(aiPrompt);

    setAiError("");
    setAiResults([]);
    setAiSearched(false);

    if (!prompt) {
      setAiError("Please describe the hotel you are looking for.");
      return;
    }

    if (loading || aiLoading) {
      setAiError("Please wait while the hotel list finishes loading.");
      return;
    }

    if (error) {
      setAiError(
        "Hotels could not be loaded. Please check your connection and try again.",
      );
      return;
    }

    if (hotels.length === 0) {
      setAiError("There are no hotels available to recommend right now.");
      return;
    }

    setAiLoading(true);

    // Yield one browser frame so the loading indicator can appear.
    await new Promise((resolve) => window.setTimeout(resolve, 50));

    try {
      const requestedLocation = LOCATIONS.find((city) => prompt.includes(city));

      const wantsCheap =
        /\b(cheap|budget|affordable|inexpensive|low price|low cost)\b/.test(
          prompt,
        );

      const wantsLuxury =
        /\b(luxury|luxurious|premium|five star|5 star|high end)\b/.test(prompt);

      const wantsFamily = /\b(family|children|child|kids|kid friendly)\b/.test(
        prompt,
      );

      const wantsBusiness =
        /\b(business|work|office|conference|meeting)\b/.test(prompt);

      const wantsRomantic = /\b(romantic|couple|honeymoon)\b/.test(prompt);

      const guestMatch = prompt.match(
        /\b(\d+)\s*(people|persons|person|guests|guest|adults)\b/,
      );

      const requestedGuests = guestMatch ? Number(guestMatch[1]) : null;

      const ignoredWords = new Set([
        "need",
        "want",
        "with",
        "from",
        "find",
        "hotel",
        "hotels",
        "stay",
        "looking",
        "please",
        "that",
        "this",
        "have",
        "cheap",
        "budget",
        "affordable",
        "luxury",
        "family",
        "friendly",
        "people",
        "guests",
        "guest",
        "near",
        "best",
        "some",
        "good",
        "for",
        "the",
        "and",
        "in",
        "ababa",
        "ababa",
      ]);

      const words = prompt
        .split(/\s+/)
        .map((word) => word.replace(/[^\w]/g, ""))
        .filter(
          (word) =>
            word.length > 3 &&
            !ignoredWords.has(word) &&
            !LOCATIONS.some((city) =>
              normalize(city).split(" ").includes(word),
            ),
        );

      let candidates = hotels;

      // Match the requested city against every available location field.
      if (requestedLocation) {
        const city = normalize(requestedLocation);

        candidates = hotels.filter((hotel) => {
          const locationFields = [
            hotel?.location,
            hotel?.city,
            hotel?.address,
            hotel?.hotelAddress,
          ]
            .filter(Boolean)
            .map((value) => normalize(value));

          return locationFields.some((location) => location.includes(city));
        });

        if (candidates.length === 0) {
          setAiSearched(true);
          setAiError(
            `No hotels in ${requestedLocation.replace(/\b\w/g, (letter) =>
              letter.toUpperCase(),
            )} were found in the current hotel database. Please add hotels for this city or try another destination.`,
          );
          return;
        }
      }

      const scoredHotels = candidates.map((hotel) => {
        let score = 0;
        const reasons = [];

        const name = normalize(getHotelName(hotel));
        const location = normalize(getLocation(hotel));
        const description = normalize(
          `${hotel?.description || ""} ${hotel?.about || ""}`,
        );

        const amenities = Array.isArray(hotel?.amenities)
          ? hotel.amenities.join(" ")
          : String(hotel?.amenities || hotel?.facilities || "");

        const searchableText = normalize(
          `${name} ${location} ${description} ${amenities}`,
        );

        const price = getHotelPriceValue(hotel);
        const rating = getHotelRatingValue(hotel);

        if (requestedLocation) {
          score += 100;
          reasons.push(`Located in ${requestedLocation}`);
        }

        if (wantsCheap) {
          if (price > 0) {
            // Lower prices score better without assuming a particular currency.
            score += Math.max(0, 50 - Math.log10(price + 1) * 10);
            reasons.push("Budget-focused option");
          }
        }

        if (wantsLuxury) {
          if (rating >= 4.5) {
            score += 35;
            reasons.push("Highly rated");
          }

          if (
            /\b(luxury|premium|five star|5 star|spa|resort)\b/.test(
              searchableText,
            )
          ) {
            score += 35;
            reasons.push("Luxury features");
          }
        }

        if (wantsFamily) {
          if (
            /\b(family|children|child|kids|playground|pool|connecting rooms)\b/.test(
              searchableText,
            )
          ) {
            score += 45;
            reasons.push("Family-friendly features");
          }
        }

        if (wantsBusiness) {
          if (
            /\b(business|wi fi|wifi|conference|meeting|office|desk)\b/.test(
              searchableText,
            )
          ) {
            score += 40;
            reasons.push("Business travel features");
          }
        }

        if (wantsRomantic) {
          if (
            /\b(romantic|couple|honeymoon|luxury|spa|resort)\b/.test(
              searchableText,
            )
          ) {
            score += 40;
            reasons.push("Suitable for couples");
          }
        }

        let keywordMatches = 0;

        words.forEach((word) => {
          if (searchableText.includes(word)) {
            score += 8;
            keywordMatches += 1;
          }
        });

        if (keywordMatches > 0) {
          reasons.push("Matches your search");
        }

        if (requestedGuests) {
          const capacity = Number(
            hotel?.maxGuests ??
              hotel?.maxOccupancy ??
              hotel?.capacity ??
              hotel?.maxGuestsPerRoom ??
              0,
          );

          if (capacity >= requestedGuests && capacity > 0) {
            score += 20;
            reasons.push(`Capacity for ${requestedGuests} guests`);
          }
        }

        if (rating >= 4.8) score += 30;
        else if (rating >= 4.5) score += 20;
        else if (rating >= 4) score += 10;

        return {
          hotel,
          score,
          reason:
            reasons.slice(0, 2).join(" • ") ||
            "Suggested from your hotel search",
        };
      });

      // Stable sorting: score first, then rating.
      const recommendations = scoredHotels
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return getHotelRatingValue(b.hotel) - getHotelRatingValue(a.hotel);
        })
        .slice(0, 6)
        .map(({ hotel, reason }) => ({
          ...hotel,
          reason,
        }));

      setAiResults(recommendations);
      setAiSearched(true);

      if (recommendations.length === 0) {
        setAiError(
          "No hotels match those preferences. Try changing your search.",
        );
      }
    } catch (err) {
      console.error("Hotel recommendation error:", err);
      setAiError(
        "Something went wrong while finding a hotel. Please try again.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  const displayHotels = showAllHotels ? hotels : hotels.slice(0, 6);

  return (
    <div className="hotel-home">
      {/* NAVBAR */}
      <header className={`main-navbar ${menuOpen ? "menu-is-open" : ""}`}>
        <div className="nav-container">
          <button
            type="button"
            className="brand"
            onClick={() => {
              setMenuOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            aria-label="Go to homepage"
          >
            <span className="brand-text">
              <strong>HOTELBOOKING</strong>
            </span>
          </button>

          <div className="header-actions">
            <button
              type="button"
              className={`auth-header-button ${
                isLoggedIn ? "logout-header-button" : "login-header-button"
              }`}
              onClick={handleAuthButton}
            >
              {isLoggedIn ? "Logout" : "Login"}
            </button>

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

            <button
              type="button"
              className={`hamburger-button ${menuOpen ? "is-open" : ""}`}
              onClick={() => setMenuOpen((current) => !current)}
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        <div
          className={`top-menu ${menuOpen ? "top-menu-open" : ""}`}
          aria-hidden={!menuOpen}
          onMouseEnter={() => setMenuOpen(true)}
          onMouseLeave={() => setMenuOpen(false)}
        >
          <div className="top-menu-glass">
            <div className="top-menu-inner">
              <div className="top-menu-heading">
                <div className="top-menu-heading-copy">
                  <span>HOTEL BOOKING</span>
                  <p>Explore. Stay. Experience.</p>
                  <small>Beautiful stays, unforgettable journeys.</small>
                </div>
              </div>

              <nav className="top-menu-links">
                {[
                  {
                    number: "01",
                    title: "Home",
                    action: () => {
                      setMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    },
                  },
                  { number: "02", title: "Hotels", action: scrollToHotels },
                  {
                    number: "03",
                    title: "Destinations",
                    action: scrollToDestinations,
                  },
                  {
                    number: "04",
                    title: "About Us",
                    action: scrollToAbout,
                  },
                  {
                    number: "05",
                    title: "My Bookings",
                    action: () => {
                      setMenuOpen(false);
                      navigate("/bookings");
                    },
                  },
                  {
                    number: "06",
                    title: "My Wishlist",
                    action: () => {
                      setMenuOpen(false);
                      navigate("/wishlist");
                    },
                  },
                  {
                    number: "07",
                    title: "My Profile",
                    action: () => {
                      setMenuOpen(false);
                      navigate("/profile");
                    },
                  },
                ].map((item) => (
                  <button type="button" key={item.number} onClick={item.action}>
                    <span className="top-menu-index">{item.number}</span>
                    <span className="top-menu-title">
                      {item.title}
                      {item.title === "My Wishlist" && favorites.length > 0 && (
                        <span className="top-menu-count">
                          {favorites.length}
                        </span>
                      )}
                    </span>
                    <span className="top-menu-arrow">↗</span>
                  </button>
                ))}

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

              <div className="top-menu-bottom">
                <span>DISCOVER BEAUTIFUL STAYS</span>
                <strong>Across Ethiopia</strong>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hero-section">
        <img
          className="hero-image"
          src={FALLBACK_HERO}
          alt="Hotel destination"
        />
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
              Explore Hotels <span>→</span>
            </button>

            <button
              type="button"
              className="secondary-hero-button"
              onClick={scrollToAI}
            >
              ✨ Find with AI
            </button>
          </div>
        </div>

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
            Search <span>→</span>
          </button>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="trust-section">
        <div className="trust-container">
          <TrustItem icon="✦" title="Best Price" subtitle="Guaranteed" />
          <TrustItem
            icon="★"
            title="Trusted Reviews"
            subtitle="From real guests"
          />
          <TrustItem icon="✓" title="Easy Booking" subtitle="Fast & secure" />
          <TrustItem
            icon="24"
            title="24/7 Support"
            subtitle="Always here for you"
          />
        </div>
      </section>

      {/* AI HOTEL FINDER */}
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

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleAIRecommend();
              }}
            >
              <div className="ai-input-wrapper">
                <textarea
                  value={aiPrompt}
                  onChange={(event) => {
                    setAiPrompt(event.target.value);
                    setAiError("");
                    setAiResults([]);
                    setAiSearched(false);
                  }}
                  placeholder="Example: I need a cheap hotel in Addis Ababa for 2 people..."
                  rows={3}
                  aria-label="Describe your ideal hotel"
                />

                <button
                  type="submit"
                  className="ai-find-button"
                  disabled={aiLoading || loading}
                >
                  {aiLoading ? (
                    <>
                      <span className="ai-spinner"></span>
                      Finding...
                    </>
                  ) : (
                    <>
                      Find My Hotel <span>→</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="example-prompts">
              <span>Try:</span>
              {WELCOME_EXAMPLES.map((example) => (
                <button
                  type="button"
                  key={example.label}
                  onClick={() => useExamplePrompt(example.prompt)}
                >
                  {example.label}
                </button>
              ))}
            </div>

            {aiError && (
              <div className="ai-error" role="alert">
                <span>!</span>
                {aiError}
              </div>
            )}

            {aiLoading && (
              <div className="ai-loading-box" role="status">
                <div className="ai-loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p>Finding hotels that match your preferences...</p>
              </div>
            )}

            {!aiLoading && aiSearched && aiResults.length > 0 && (
              <div className="ai-results">
                <div className="ai-results-header">
                  <div>
                    <span className="section-eyebrow">
                      HOTEL RECOMMENDATIONS
                    </span>
                    <h3>We found these for you</h3>
                  </div>
                  <span className="result-count">
                    {aiResults.length} matches
                  </span>
                </div>

                <div className="ai-result-grid">
                  {aiResults.map((hotel, index) => (
                    <HotelCard
                      key={getHotelIdForCard(hotel) || index}
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
                      aiReason={hotel.reason}
                    />
                  ))}
                </div>
              </div>
            )}

            {!aiLoading && aiSearched && !aiError && aiResults.length === 0 && (
              <div className="hotel-empty">
                <h3>No matching hotels found</h3>
                <p>Try changing your destination or preferences.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* POPULAR HOTELS */}
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
                View All Hotels <span>→</span>
              </button>
            )}

            {showAllHotels && hotels.length > 6 && (
              <button
                type="button"
                className="view-all-button"
                onClick={() => {
                  setShowAllHotels(false);
                  window.setTimeout(() => {
                    document.getElementById("hotels")?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }, 100);
                }}
              >
                Show Less <span>↑</span>
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

          {!loading && !error && hotels.length === 0 && (
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
                  key={getHotelIdForCard(hotel) || index}
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

      {/* SPECIAL OFFER */}
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
              Explore Our Hotels <span>→</span>
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

      {/* DESTINATIONS */}
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

      {/* ABOUT */}
      <section id="about" className="about-section">
        <div className="about-container">
          <div className="about-image-wrapper">
            <img
              src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=85"
              alt="Hotel interior"
              loading="lazy"
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
              <AboutFeature
                title="Verified stays"
                subtitle="Quality places you can trust."
              />
              <AboutFeature
                title="Simple booking"
                subtitle="Book your stay in just a few clicks."
              />
              <AboutFeature
                title="Smart recommendations"
                subtitle="Let the hotel finder help you find your match."
              />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="hotel-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <button
              type="button"
              className="brand footer-brand-logo"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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

// HELPER COMPONENTS

function TrustItem({ icon, title, subtitle }) {
  return (
    <div className="trust-item">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </div>
    </div>
  );
}

function AboutFeature({ title, subtitle }) {
  return (
    <div>
      <span>✓</span>
      <div>
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </div>
    </div>
  );
}

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
  const hotelId = getHotelIdForCard(hotel);

  const isFavorite = favorites.some((item) => String(item) === String(hotelId));

  const rating = Math.max(0, Math.min(5, Number(getRating(hotel)) || 0));

  return (
    <article className="hotel-card">
      <div className="hotel-image-wrapper">
        <img
          src={getImage(hotel)}
          alt={getHotelName(hotel)}
          loading="lazy"
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
          aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isFavorite ? "♥" : "♡"}
        </button>

        <div className="hotel-location">
          <span>⌖</span>
          {getLocation(hotel)}
        </div>

        {aiReason && <div className="ai-match-badge">✦ MATCH</div>}
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
              Book Now <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function DestinationCard({ image, name, subtitle, onClick }) {
  return (
    <button type="button" className="destination-card" onClick={onClick}>
      <img src={image} alt={name} loading="lazy" />
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

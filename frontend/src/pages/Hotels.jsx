import "./Hotels.css";

import blueSky from "../images/roomImg1.png";
import hilton from "../images/roomImg2.png";
import sheraton from "../images/roomImg3.png";

function Hotels() {
  const hotels = [
    {
      image: blueSky,
      name: "Blue Sky Hotel",
      location: "Addis Ababa",
      rating: "5.0",
      reviews: 128,
      price: 80,
      badge: "POPULAR",
      description:
        "Comfortable rooms with modern facilities and excellent service.",
    },
    {
      image: hilton,
      name: "Hilton Hotel",
      location: "Bahir Dar",
      rating: "4.8",
      reviews: 96,
      price: 120,
      badge: "BEST VALUE",
      description:
        "Enjoy a relaxing stay with beautiful views and premium services.",
    },
    {
      image: sheraton,
      name: "Sheraton Hotel",
      location: "Hawassa",
      rating: "4.9",
      reviews: 154,
      price: 150,
      badge: "LUXURY",
      description:
        "A luxury hotel experience designed for comfort and relaxation.",
    },
  ];

  return (
    <div className="home-page">
      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            Stay<span>Lux</span>
          </div>

          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#hotels">Hotels</a>
            <a href="#destinations">Destinations</a>
            <a href="#offers">Offers</a>
            <a href="#about">About</a>
          </div>

          <div className="nav-actions">
            <button className="language-button">🌐 EN</button>

            <button className="signin-button">Sign In</button>

            <button className="register-button">Register</button>
          </div>
        </div>
      </nav>

      {/* =========================
          HERO
      ========================= */}

      <section className="hero-section" id="home">
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <div className="hero-badge">✨ Your perfect stay starts here</div>

          <h1>
            Your journey
            <span>begins here.</span>
          </h1>

          <p>
            Discover beautiful hotels, comfortable rooms, and unforgettable
            experiences. Find the perfect place to stay at the best prices.
          </p>

          {/* SEARCH BOX */}

          <div className="search-box">
            <div className="search-item">
              <span>📍</span>

              <div>
                <small>Destination</small>
                <strong>Addis Ababa</strong>
              </div>
            </div>

            <div className="search-item">
              <span>📅</span>

              <div>
                <small>Check In</small>
                <strong>Select date</strong>
              </div>
            </div>

            <div className="search-item">
              <span>📅</span>

              <div>
                <small>Check Out</small>
                <strong>Select date</strong>
              </div>
            </div>

            <button className="search-button">🔍 Search</button>
          </div>
        </div>
      </section>

      {/* =========================
          FEATURES
      ========================= */}

      <section className="features-section">
        <div className="feature-box">
          <div className="feature-icon">🏨</div>

          <h3>500+ Hotels</h3>

          <p>
            Choose from hundreds of comfortable and affordable hotels across
            Ethiopia.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon">⭐</div>

          <h3>Best Prices</h3>

          <p>
            Get competitive prices and great deals for your next hotel stay.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon">🛎️</div>

          <h3>24/7 Support</h3>

          <p>Our support team is always ready to help you with your booking.</p>
        </div>
      </section>

      {/* =========================
          HOTELS
      ========================= */}

      <section className="hotels-section" id="hotels">
        <div className="section-header">
          <div>
            <div className="section-label">OUR HOTELS</div>

            <h2>Handpicked hotels</h2>

            <p>Discover some of our most popular places to stay.</p>
          </div>

          <button className="view-all-button">View All Hotels →</button>
        </div>

        <div className="hotel-grid">
          {hotels.map((hotel, index) => (
            <div className="hotel-wrapper" key={index}>
              <div className="popular-badge">{hotel.badge}</div>

              <div className="hotel-card">
                {/* HOTEL IMAGE */}

                <div className="hotel-image-container">
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="hotel-image"
                  />

                  <button className="favorite-button">♡</button>
                </div>

                {/* HOTEL INFORMATION */}

                <div className="hotel-info">
                  <div className="hotel-location">📍 {hotel.location}</div>

                  <h3>{hotel.name}</h3>

                  <div className="hotel-rating">
                    <span className="stars">★★★★★</span>

                    <strong>{hotel.rating}</strong>

                    <span className="reviews">({hotel.reviews} reviews)</span>
                  </div>

                  <p className="hotel-description">{hotel.description}</p>

                  <div className="hotel-features">
                    <span>📶 WiFi</span>
                    <span>❄️ AC</span>
                    <span>🅿️ Parking</span>
                  </div>

                  <div className="hotel-bottom">
                    <div className="hotel-price">
                      <span>From</span>

                      <strong>${hotel.price}</strong>

                      <small>/ night</small>
                    </div>

                    <button className="book-button">Book Now</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================
          DESTINATIONS
      ========================= */}

      <section className="destinations-section" id="destinations">
        <div className="section-title-center">
          <div className="section-label">EXPLORE ETHIOPIA</div>

          <h2>Popular destinations</h2>

          <p>Discover amazing places and find your perfect hotel.</p>
        </div>

        <div className="destination-grid">
          <div className="destination-card">
            <div className="destination-overlay">
              <h3>Addis Ababa</h3>
              <p>Capital city of Ethiopia</p>
            </div>
          </div>

          <div className="destination-card destination-two">
            <div className="destination-overlay">
              <h3>Bahir Dar</h3>
              <p>Beautiful lakeside destination</p>
            </div>
          </div>

          <div className="destination-card destination-three">
            <div className="destination-overlay">
              <h3>Hawassa</h3>
              <p>Relax beside Lake Hawassa</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          CTA
      ========================= */}

      <section className="home-cta" id="offers">
        <div className="cta-content">
          <div className="cta-icon">🎁</div>

          <h2>Save up to 30% on your next stay</h2>

          <p>
            Book your next hotel with StayLux and enjoy exclusive offers,
            comfortable rooms, and unforgettable experiences.
          </p>

          <button>Explore Special Offers →</button>
        </div>
      </section>

      {/* =========================
          ABOUT
      ========================= */}

      <section className="about-section" id="about">
        <div className="about-content">
          <div className="about-text">
            <div className="section-label">WHY STAYLUX</div>

            <h2>A better way to book your stay</h2>

            <p>
              We make finding and booking hotels simple. Compare hotels,
              discover great destinations, and choose the room that is perfect
              for you.
            </p>

            <div className="about-list">
              <div>
                <span>✓</span>
                <strong>Easy booking</strong>
              </div>

              <div>
                <span>✓</span>
                <strong>Secure reservations</strong>
              </div>

              <div>
                <span>✓</span>
                <strong>Best available prices</strong>
              </div>

              <div>
                <span>✓</span>
                <strong>Customer support</strong>
              </div>
            </div>
          </div>

          <div className="about-image">
            <img src={blueSky} alt="Hotel room" />
          </div>
        </div>
      </section>

      {/* =========================
          NEWSLETTER
      ========================= */}

      <section className="newsletter-section">
        <div className="newsletter-content">
          <div>
            <h2>Get the best hotel deals</h2>

            <p>Subscribe and receive special offers directly in your inbox.</p>
          </div>

          <div className="newsletter-form">
            <input type="email" placeholder="Enter your email address" />

            <button>Subscribe</button>
          </div>
        </div>
      </section>

      {/* =========================
          FOOTER
      ========================= */}

      <footer className="home-footer">
        <h3>
          Stay<span>Lux</span>
        </h3>

        <p>Find your perfect stay, wherever your journey takes you.</p>

        <div className="footer-links">
          <a href="#home">Home</a>
          <a href="#hotels">Hotels</a>
          <a href="#destinations">Destinations</a>
          <a href="#offers">Offers</a>
          <a href="#about">About</a>
        </div>

        <p className="copyright">© 2026 StayLux. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Hotels;

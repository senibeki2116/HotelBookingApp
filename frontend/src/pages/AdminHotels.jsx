import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./AdminHotels.css";

const FALLBACK_HOTEL_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=85";

const formatPrice = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });

const AdminHotels = () => {
  const navigate = useNavigate();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const fetchHotels = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/hotels");
      setHotels(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("GET HOTELS ERROR:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load hotels. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const locations = useMemo(() => {
    return [
      ...new Set(
        hotels
          .map((hotel) => String(hotel.location || "").trim())
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [hotels]);

  const totalRooms = hotels.reduce(
    (total, hotel) => total + Math.max(0, Number(hotel.rooms) || 0),
    0,
  );

  const averagePrice = hotels.length
    ? hotels.reduce(
        (total, hotel) => total + Math.max(0, Number(hotel.price) || 0),
        0,
      ) / hotels.length
    : 0;

  const filteredHotels = useMemo(() => {
    const term = search.trim().toLowerCase();

    const result = hotels.filter((hotel) => {
      const matchesSearch = [
        hotel.name,
        hotel.location,
        hotel.description,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(term),
      );

      const matchesLocation =
        locationFilter === "all" ||
        String(hotel.location || "").trim() === locationFilter;

      return matchesSearch && matchesLocation;
    });

    return [...result].sort((a, b) => {
      if (sortBy === "price-low") {
        return Number(a.price || 0) - Number(b.price || 0);
      }

      if (sortBy === "price-high") {
        return Number(b.price || 0) - Number(a.price || 0);
      }

      if (sortBy === "name") {
        return String(a.name || "").localeCompare(String(b.name || ""));
      }

      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    });
  }, [hotels, search, locationFilter, sortBy]);

  const handleDelete = async (hotel) => {
    if (!hotel?._id || deletingId) return;

    const confirmed = window.confirm(
      `Delete "${hotel.name || "this hotel"}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(hotel._id);
      setError("");

      await API.delete(`/admin/hotels/${hotel._id}`);

      setHotels((current) => current.filter((item) => item._id !== hotel._id));
    } catch (err) {
      console.error("DELETE HOTEL ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete this hotel. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="admin-hotels-page">
      <section className="admin-hotels-header">
        <div className="admin-hotels-heading">
          <div className="admin-hotels-eyebrow">
            <span className="eyebrow-line" />
            STAYORA ADMINISTRATION
          </div>

          <h1>
            Manage <span>Hotels</span>
          </h1>

          <p>
            Manage your properties, review hotel details, and keep your
            accommodation listings up to date.
          </p>
        </div>

        <button
          type="button"
          className="add-new-hotel-btn"
          onClick={() => navigate("/admin/hotels/add")}
        >
          <span className="add-btn-icon">+</span>
          Add New Hotel
        </button>
      </section>

      <section className="hotel-overview-grid">
        <article className="hotel-overview-card overview-primary">
          <div className="overview-card-top">
            <span className="overview-icon">H</span>
            <span className="overview-caption">PROPERTY PORTFOLIO</span>
          </div>

          <div className="overview-number">
            {hotels.length.toLocaleString()}
          </div>

          <div className="overview-label">Total properties</div>
          <div className="overview-footnote">All hotels in your system</div>
        </article>

        <article className="hotel-overview-card">
          <div className="overview-card-top">
            <span className="overview-icon rooms-icon">R</span>
            <span className="overview-caption">ACCOMMODATION</span>
          </div>

          <div className="overview-number">{totalRooms.toLocaleString()}</div>

          <div className="overview-label">Total rooms</div>
          <div className="overview-footnote">Combined listed room capacity</div>
        </article>

        <article className="hotel-overview-card">
          <div className="overview-card-top">
            <span className="overview-icon price-icon">$</span>
            <span className="overview-caption">LISTED PRICING</span>
          </div>

          <div className="overview-number overview-price">
            ${formatPrice(averagePrice)}
          </div>

          <div className="overview-label">Average listed price</div>
          <div className="overview-footnote">
            Per night, based on current listings
          </div>
        </article>
      </section>

      <section className="hotels-toolbar">
        <div className="toolbar-title">
          <div>
            <h2>Your properties</h2>
            <p>
              {loading
                ? "Loading your hotel listings..."
                : `${filteredHotels.length} of ${hotels.length} properties`}
            </p>
          </div>
        </div>

        <div className="hotel-filter-controls">
          <label className="hotel-search-box">
            <span className="search-symbol" aria-hidden="true">
              ⌕
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search hotels..."
              aria-label="Search hotels"
            />

            {search && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </label>

          <select
            className="hotel-filter-select"
            value={locationFilter}
            onChange={(event) => setLocationFilter(event.target.value)}
            aria-label="Filter by location"
          >
            <option value="all">All locations</option>
            {locations.map((location) => (
              <option value={location} key={location}>
                {location}
              </option>
            ))}
          </select>

          <select
            className="hotel-filter-select sort-select"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            aria-label="Sort hotels"
          >
            <option value="newest">Newest first</option>
            <option value="name">Name A–Z</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>

          <button
            type="button"
            className="hotel-refresh-btn"
            onClick={fetchHotels}
            disabled={loading}
            title="Refresh hotels"
          >
            <span className={loading ? "refresh-spinning" : ""}>↻</span>
            Refresh
          </button>
        </div>
      </section>

      {error && (
        <div className="hotels-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <section className="hotels-loading-grid" aria-label="Loading hotels">
          {[1, 2, 3].map((item) => (
            <div className="hotel-skeleton" key={item}>
              <div className="skeleton-image" />
              <div className="skeleton-content">
                <div className="skeleton-line skeleton-title" />
                <div className="skeleton-line" />
                <div className="skeleton-line skeleton-short" />
                <div className="skeleton-button" />
              </div>
            </div>
          ))}
        </section>
      ) : hotels.length === 0 ? (
        <section className="hotels-empty-state">
          <div className="empty-state-icon">H</div>
          <span className="empty-state-label">YOUR COLLECTION STARTS HERE</span>
          <h2>No hotels added yet</h2>
          <p>
            Add your first property to begin managing your hotel listings
            through Stayora.
          </p>

          <button
            type="button"
            className="add-new-hotel-btn"
            onClick={() => navigate("/admin/hotels/add")}
          >
            <span className="add-btn-icon">+</span>
            Add Your First Hotel
          </button>
        </section>
      ) : filteredHotels.length === 0 ? (
        <section className="hotels-empty-state filtered-empty-state">
          <div className="empty-state-icon">⌕</div>
          <h2>No matching hotels</h2>
          <p>Try a different name or location, or clear your filters.</p>

          <button
            type="button"
            className="reset-filters-btn"
            onClick={() => {
              setSearch("");
              setLocationFilter("all");
              setSortBy("newest");
            }}
          >
            Clear filters
          </button>
        </section>
      ) : (
        <section className="hotels-grid">
          {filteredHotels.map((hotel) => (
            <article className="admin-hotel-card" key={hotel._id}>
              <div className="hotel-image-container">
                <img
                  src={hotel.image || FALLBACK_HOTEL_IMAGE}
                  alt={hotel.name || "Hotel property"}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = FALLBACK_HOTEL_IMAGE;
                  }}
                />

                <span className="hotel-photo-label">STAYORA PROPERTY</span>

                <div className="price-badge">
                  <strong>${formatPrice(hotel.price)}</strong>
                  <span>/ night</span>
                </div>
              </div>

              <div className="hotel-info">
                <div className="hotel-card-title-row">
                  <div className="hotel-card-title">
                    <h3>{hotel.name || "Untitled Hotel"}</h3>

                    <p className="hotel-location">
                      <span aria-hidden="true">⌖</span>
                      {hotel.location || "Location not specified"}
                    </p>
                  </div>

                  <span className="hotel-card-mark" aria-hidden="true">
                    S
                  </span>
                </div>

                <p className="hotel-description">
                  {hotel.description?.trim() ||
                    "No description has been added for this property yet."}
                </p>

                <div className="hotel-card-meta">
                  <div className="hotel-room-detail">
                    <span className="room-detail-icon" aria-hidden="true">
                      ▦
                    </span>
                    <span>
                      <strong>{Number(hotel.rooms) || 0}</strong> rooms
                    </span>
                  </div>

                  <span className="hotel-listing-tag">Property listing</span>
                </div>

                <div className="hotel-actions">
                  <button
                    type="button"
                    className="edit-btn"
                    onClick={() => navigate(`/admin/hotels/edit/${hotel._id}`)}
                  >
                    <span aria-hidden="true">↗</span>
                    Edit property
                  </button>

                  <button
                    type="button"
                    className="delete-btn"
                    disabled={deletingId === hotel._id}
                    onClick={() => handleDelete(hotel)}
                    aria-label={`Delete ${hotel.name || "hotel"}`}
                    title="Delete hotel"
                  >
                    {deletingId === hotel._id ? "..." : "×"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <footer className="admin-hotels-footer">
        <span>
          <span className="footer-status-dot" />
          STAYORA PROPERTY MANAGEMENT
        </span>
        <span>Hotel administration</span>
      </footer>
    </main>
  );
};

<div className="hotel-actions">
  <button
    type="button"
    className="edit-btn"
    onClick={() => navigate(`/admin/hotels/edit/${hotel._id}`)}
  >
    Edit Hotel
  </button>

  <button
    type="button"
    className="delete-btn"
    onClick={() => handleDelete(hotel._id)}
  >
    Delete Hotel
  </button>
</div>;
export default AdminHotels;

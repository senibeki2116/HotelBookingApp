import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import fallbackImg from "../images/regImage.png";
import "./MyBookings.css";

const API_URL = "http://localhost:5000";

const getBookingImageUrl = (image) => {
  if (!image || typeof image !== "string") return fallbackImg;

  if (image.startsWith("http")) return image;
  if (image.startsWith("/uploads/")) return `${API_URL}${image}`;
  if (image.startsWith("uploads/")) return `${API_URL}/${image}`;

  return `${API_URL}/uploads/${image}`;
};

const formatDate = (date) => {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "Not available";

  return parsedDate.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatAmount = (amount, currency = "ETB") => {
  const number = Number(amount || 0);

  return `${currency} ${number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review states
  const [reviewedBookingIds, setReviewedBookingIds] = useState([]);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Payment states
  const [payingBookingId, setPayingBookingId] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [loadingReceiptId, setLoadingReceiptId] = useState(null);

  const { token } = useContext(AuthContext);

  // Fetch bookings and reviews
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const bookingsResponse = await axios.get(
          `${API_URL}/api/bookings/my`,
          config,
        );

        setBookings(
          Array.isArray(bookingsResponse.data) ? bookingsResponse.data : [],
        );

        try {
          const reviewsResponse = await axios.get(
            `${API_URL}/api/reviews/my`,
            config,
          );

          const reviews = Array.isArray(reviewsResponse.data)
            ? reviewsResponse.data
            : [];

          setReviewedBookingIds(
            reviews
              .map((review) =>
                typeof review.booking === "object"
                  ? review.booking?._id
                  : review.booking,
              )
              .filter(Boolean)
              .map(String),
          );
        } catch (reviewError) {
          console.error(
            "Unable to load your reviews:",
            reviewError.response?.data || reviewError.message,
          );
        }
      } catch (error) {
        console.error(
          "Unable to load bookings:",
          error.response?.data || error.message,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // =====================================================
  // CHAPA PAYMENT INITIALIZATION
  // =====================================================

  const initializePayment = async (bookingId) => {
    if (!token) {
      alert("Please log in to make a payment.");
      return;
    }

    if (payingBookingId) return;

    setPayingBookingId(bookingId);

    try {
      const response = await axios.post(
        `${API_URL}/api/payments/initialize/${bookingId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        },
      );

      console.log("CHAPA INITIALIZATION RESPONSE:", response.data);

      const checkoutUrl = response.data?.checkoutUrl;

      if (!response.data?.success || !checkoutUrl) {
        throw new Error(
          response.data?.message || "Chapa did not return a checkout URL.",
        );
      }

      // Redirect to Chapa's hosted checkout.
      window.location.assign(checkoutUrl);
    } catch (error) {
      // Log the complete Axios error for debugging.
      console.error("========== CHAPA PAYMENT ERROR ==========");
      console.error("ERROR OBJECT:", error);
      console.error("ERROR MESSAGE:", error.message);
      console.error("HTTP STATUS:", error.response?.status);
      console.error(
        "SERVER RESPONSE:",
        JSON.stringify(error.response?.data ?? null, null, 2),
      );
      console.error("REQUEST URL:", error.config?.url);
      console.error("REQUEST METHOD:", error.config?.method);
      console.error("==========================================");

      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unable to start payment. Please try again.";

      alert(`Payment initialization failed:\n${serverMessage}`);

      setPayingBookingId(null);
    }
  };

  // =====================================================
  // LOAD PAYMENT RECEIPT
  // =====================================================

  const viewReceipt = async (bookingId) => {
    if (!token) {
      alert("Please log in to view your receipt.");
      return;
    }

    setLoadingReceiptId(bookingId);

    try {
      const response = await axios.get(
        `${API_URL}/api/payments/receipt/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setReceipt(response.data.receipt);
    } catch (error) {
      console.error("RECEIPT ERROR:", error.response?.data || error.message);

      alert(
        error.response?.data?.message || "Unable to load your payment receipt.",
      );
    } finally {
      setLoadingReceiptId(null);
    }
  };

  const closeReceipt = () => {
    setReceipt(null);
  };

  const printReceipt = () => {
    window.print();
  };

  // =====================================================
  // CANCEL BOOKING
  // =====================================================

  const deleteBooking = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to cancel this booking?",
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/api/bookings/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBookings((previous) =>
        previous.filter((booking) => booking._id !== id),
      );

      alert("Booking cancelled successfully!");
    } catch (error) {
      console.error(
        "CANCEL BOOKING ERROR:",
        error.response?.data || error.message,
      );

      alert(error.response?.data?.message || "Failed to cancel booking.");
    }
  };

  // =====================================================
  // REVIEW ELIGIBILITY
  // =====================================================

  const canReviewBooking = (booking) => {
    if (!booking || booking.status !== "confirmed" || !booking.checkOut) {
      return false;
    }

    const checkoutTime = new Date(booking.checkOut).getTime();

    return Number.isFinite(checkoutTime) && checkoutTime <= Date.now();
  };

  const openReviewForm = (booking) => {
    setReviewTarget(booking);
    setRating(5);
    setComment("");
  };

  const closeReviewForm = () => {
    if (submittingReview) return;

    setReviewTarget(null);
    setRating(5);
    setComment("");
  };

  // =====================================================
  // SUBMIT HOTEL REVIEW
  // =====================================================

  const submitReview = async (event) => {
    event.preventDefault();

    if (!reviewTarget || !token) return;

    if (comment.trim().length < 5) {
      alert("Please write at least 5 characters in your review.");
      return;
    }

    if (comment.trim().length > 1000) {
      alert("Your review cannot exceed 1000 characters.");
      return;
    }

    setSubmittingReview(true);

    try {
      await axios.post(
        `${API_URL}/api/reviews`,
        {
          hotelId: reviewTarget.hotel?._id || reviewTarget.hotel?.id,
          bookingId: reviewTarget._id,
          rating,
          comment: comment.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setReviewedBookingIds((previous) => [
        ...previous,
        String(reviewTarget._id),
      ]);

      setReviewTarget(null);
      setRating(5);
      setComment("");

      alert("Thank you! Your review was submitted successfully.");
    } catch (error) {
      console.error(
        "REVIEW SUBMISSION ERROR:",
        error.response?.data || error.message,
      );

      alert(
        error.response?.data?.message ||
          "Unable to submit your review. Please try again.",
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <div className="bookings-loading">
        <div className="loading-spinner" />
        <p>Preparing your reservations...</p>
      </div>
    );
  }

  const confirmedCount = bookings.filter(
    (booking) => booking.status === "confirmed",
  ).length;

  const paidCount = bookings.filter(
    (booking) => booking.paymentStatus === "paid",
  ).length;

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <main className="my-bookings-page">
      {/* PAGE HEADING */}
      <section className="bookings-heading">
        <div className="heading-content">
          <span className="heading-eyebrow">
            STAYORA <span> / </span> YOUR JOURNEY
          </span>

          <h1>Your reservations.</h1>

          <p>
            Every journey starts with a great stay. Manage your reservations and
            share your experiences.
          </p>
        </div>

        <div className="booking-overview">
          <div className="overview-item">
            <span className="overview-number">{bookings.length}</span>
            <span className="overview-label">Total bookings</span>
          </div>

          <div className="overview-divider" />

          <div className="overview-item">
            <span className="overview-number">{confirmedCount}</span>
            <span className="overview-label">Confirmed</span>
          </div>

          <div className="overview-divider" />

          <div className="overview-item">
            <span className="overview-number">{paidCount}</span>
            <span className="overview-label">Paid</span>
          </div>
        </div>
      </section>

      {/* BOOKINGS SECTION */}
      <section className="bookings-content">
        <div className="bookings-section-heading">
          <div>
            <span className="section-eyebrow">YOUR TRAVEL HISTORY</span>
            <h2>My bookings</h2>
          </div>

          <span className="booking-count">
            {bookings.length}{" "}
            {bookings.length === 1 ? "reservation" : "reservations"}
          </span>
        </div>

        {bookings.length === 0 ? (
          <div className="empty-bookings">
            <div className="empty-bookings-icon">⌂</div>

            <span className="section-eyebrow">YOUR NEXT ADVENTURE</span>

            <h2>No reservations yet</h2>

            <p>
              Your next memorable stay is waiting. Explore our hotels and find a
              place you'll love.
            </p>
          </div>
        ) : (
          <div className="booking-list">
            {bookings.map((booking) => {
              const hotel = booking.hotel || {};

              const hasReviewed = reviewedBookingIds.includes(
                String(booking._id),
              );

              const eligibleForReview = canReviewBooking(booking);

              const isReviewOpen = reviewTarget?._id === booking._id;

              const paymentStatus = (
                booking.paymentStatus || "pending"
              ).toLowerCase();

              const isPaid = paymentStatus === "paid";

              return (
                <article className="booking-card" key={booking._id}>
                  <div className="booking-card-main">
                    {/* HOTEL IMAGE */}
                    <div className="booking-photo-wrap">
                      <img
                        className="booking-image"
                        src={getBookingImageUrl(hotel.image)}
                        alt={hotel.name || "Hotel"}
                        onError={(event) => {
                          event.currentTarget.src = fallbackImg;
                        }}
                      />

                      <span className="photo-label">YOUR STAY</span>
                    </div>

                    {/* BOOKING INFORMATION */}
                    <div className="booking-information">
                      <div className="hotel-title-row">
                        <div>
                          <span className="hotel-category">
                            HOTEL RESERVATION
                          </span>

                          <h3>{hotel.name || "Hotel"}</h3>

                          <p className="hotel-location">
                            <span>⌖</span>
                            {hotel.location || "Location not available"}
                          </p>
                        </div>

                        <span
                          className={`booking-status ${
                            booking.status === "confirmed"
                              ? "status-confirmed"
                              : "status-cancelled"
                          }`}
                        >
                          <span className="status-dot" />
                          {booking.status || "Unknown"}
                        </span>
                      </div>

                      {/* PAYMENT STATUS */}
                      <div className="payment-status-row">
                        <span className="payment-label">Payment status:</span>

                        <span
                          className={`payment-status payment-${paymentStatus}`}
                        >
                          <span className="status-dot" />
                          {paymentStatus}
                        </span>
                      </div>

                      {/* STAY DATES */}
                      <div className="stay-dates">
                        <div className="stay-date-box">
                          <span className="date-caption">CHECK-IN</span>

                          <strong>{formatDate(booking.checkIn)}</strong>

                          <span className="date-subtitle">Arrival date</span>
                        </div>

                        <div className="date-connector">
                          <span>→</span>
                        </div>

                        <div className="stay-date-box">
                          <span className="date-caption">CHECK-OUT</span>

                          <strong>{formatDate(booking.checkOut)}</strong>

                          <span className="date-subtitle">Departure date</span>
                        </div>
                      </div>

                      {/* BOOKING DETAILS */}
                      <div className="booking-meta">
                        <div className="meta-item">
                          <span className="meta-icon">♙</span>

                          <span>
                            <small>Guests</small>
                            <strong>{booking.guests ?? "—"}</strong>
                          </span>
                        </div>

                        <div className="meta-item">
                          <span className="meta-icon">▦</span>

                          <span>
                            <small>Booking ID</small>

                            <strong>
                              {String(booking._id).slice(-8).toUpperCase()}
                            </strong>
                          </span>
                        </div>

                        <div className="meta-price">
                          <small>Total price</small>

                          <strong>
                            {formatAmount(
                              booking.totalPrice,
                              booking.paymentCurrency || "ETB",
                            )}
                          </strong>
                        </div>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="booking-card-footer">
                        <div className="booking-actions">
                          {/* PAYMENT */}
                          {booking.status !== "cancelled" && (
                            <>
                              {isPaid ? (
                                <button
                                  type="button"
                                  className="receipt-btn"
                                  onClick={() => viewReceipt(booking._id)}
                                  disabled={loadingReceiptId === booking._id}
                                >
                                  {loadingReceiptId === booking._id
                                    ? "Loading receipt..."
                                    : "View Receipt ↗"}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="pay-now-btn"
                                  onClick={() => initializePayment(booking._id)}
                                  disabled={payingBookingId !== null}
                                >
                                  {payingBookingId === booking._id
                                    ? "Preparing secure checkout..."
                                    : paymentStatus === "failed"
                                      ? "Try Payment Again →"
                                      : "Pay Now →"}
                                </button>
                              )}
                            </>
                          )}

                          {/* REVIEWS */}
                          {eligibleForReview &&
                            (hasReviewed ? (
                              <button
                                className="reviewed-btn"
                                type="button"
                                disabled
                              >
                                ✓ Review submitted
                              </button>
                            ) : (
                              <button
                                className="review-btn"
                                type="button"
                                onClick={() => openReviewForm(booking)}
                              >
                                Write a review <span>↗</span>
                              </button>
                            ))}

                          {/* CANCEL */}
                          {booking.status === "confirmed" && (
                            <button
                              className="cancel-btn"
                              type="button"
                              onClick={() => deleteBooking(booking._id)}
                            >
                              Cancel reservation
                            </button>
                          )}
                        </div>

                        {eligibleForReview && hasReviewed && (
                          <span className="review-thank-you">
                            Thank you for your feedback!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* REVIEW FORM */}
                  {isReviewOpen && (
                    <form className="review-form" onSubmit={submitReview}>
                      <div className="review-form-heading">
                        <div>
                          <span className="section-eyebrow">
                            SHARE YOUR EXPERIENCE
                          </span>

                          <h3>How was your stay?</h3>

                          <p>
                            Your feedback helps other travelers choose their
                            perfect stay.
                          </p>
                        </div>

                        <button
                          type="button"
                          className="review-close"
                          onClick={closeReviewForm}
                          disabled={submittingReview}
                          aria-label="Close review form"
                        >
                          ×
                        </button>
                      </div>

                      <label className="review-label">
                        Rate your experience
                      </label>

                      <div
                        className="rating-stars"
                        role="group"
                        aria-label="Choose a rating"
                      >
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={star <= rating ? "star active" : "star"}
                            onClick={() => setRating(star)}
                            aria-label={`${star} star${star === 1 ? "" : "s"}`}
                            aria-pressed={rating === star}
                          >
                            ★
                          </button>
                        ))}

                        <span className="rating-value">{rating}/5</span>
                      </div>

                      <label
                        className="review-label"
                        htmlFor={`review-comment-${booking._id}`}
                      >
                        Tell us about your stay
                      </label>

                      <textarea
                        id={`review-comment-${booking._id}`}
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        placeholder="What did you love about this hotel? Tell other travelers about your experience..."
                        minLength={5}
                        maxLength={1000}
                        rows={5}
                        required
                      />

                      <div className="review-form-footer">
                        <span>{comment.length}/1000 characters</span>

                        <div className="review-form-actions">
                          <button
                            type="button"
                            className="review-cancel-btn"
                            onClick={closeReviewForm}
                            disabled={submittingReview}
                          >
                            Cancel
                          </button>

                          <button
                            type="submit"
                            className="review-submit-btn"
                            disabled={
                              submittingReview || comment.trim().length < 5
                            }
                          >
                            {submittingReview
                              ? "Submitting..."
                              : "Publish review →"}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* PAYMENT RECEIPT MODAL */}
      {receipt && (
        <div className="receipt-overlay">
          <div className="receipt-modal" id="payment-receipt">
            <div className="receipt-header">
              <div>
                <span className="section-eyebrow">STAYORA PAYMENT</span>

                <h2>Payment Receipt</h2>

                <p>Thank you for choosing Stayora.</p>
              </div>

              <button
                type="button"
                className="receipt-close"
                onClick={closeReceipt}
                aria-label="Close receipt"
              >
                ×
              </button>
            </div>

            <div className="receipt-success">
              <span>✓</span>
              <strong>Payment successful</strong>
            </div>

            <div className="receipt-details">
              <div>
                <small>Receipt number</small>
                <strong>{receipt.receiptNumber}</strong>
              </div>

              <div>
                <small>Customer</small>
                <strong>{receipt.customer || "—"}</strong>
              </div>

              <div>
                <small>Email</small>
                <strong>{receipt.customerEmail || "—"}</strong>
              </div>

              <div>
                <small>Hotel</small>
                <strong>{receipt.hotel || "—"}</strong>
              </div>

              <div>
                <small>Hotel location</small>
                <strong>{receipt.hotelLocation || "—"}</strong>
              </div>

              <div>
                <small>Booking ID</small>
                <strong>
                  {String(receipt.bookingId).slice(-8).toUpperCase()}
                </strong>
              </div>

              <div>
                <small>Transaction reference</small>
                <strong>{receipt.transactionReference || "—"}</strong>
              </div>

              <div>
                <small>Check-in</small>
                <strong>{formatDate(receipt.checkIn)}</strong>
              </div>

              <div>
                <small>Check-out</small>
                <strong>{formatDate(receipt.checkOut)}</strong>
              </div>

              <div>
                <small>Guests</small>
                <strong>{receipt.guests ?? "—"}</strong>
              </div>

              <div>
                <small>Rooms</small>
                <strong>{receipt.rooms ?? "—"}</strong>
              </div>

              <div>
                <small>Payment date</small>
                <strong>{formatDate(receipt.paidAt)}</strong>
              </div>

              <div>
                <small>Payment provider</small>
                <strong>{receipt.paymentProvider || "Chapa"}</strong>
              </div>
            </div>

            <div className="receipt-total">
              <span>Total paid</span>

              <strong>
                {formatAmount(receipt.amount, receipt.currency || "ETB")}
              </strong>
            </div>

            <div className="receipt-actions">
              <button type="button" onClick={printReceipt}>
                Print Receipt
              </button>

              <button type="button" onClick={closeReceipt}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default MyBookings;

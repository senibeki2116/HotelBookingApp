import { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./PaymentResult.css";

const API_URL = "http://localhost:5000";

function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("Verifying your payment...");
  const [payment, setPayment] = useState(null);

  const txRef = searchParams.get("tx_ref");
  const returnedStatus = searchParams.get("status");

  const verifyPayment = async () => {
    if (!token) {
      setStatus("error");
      setMessage("Please log in to verify your payment.");
      return;
    }

    if (!txRef) {
      setStatus("error");
      setMessage("Payment reference was not found.");
      return;
    }

    setStatus("checking");
    setMessage("Verifying your payment with Chapa...");

    try {
      const response = await axios.get(
        `${API_URL}/api/payments/verify/${encodeURIComponent(txRef)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const paymentStatus = response.data.paymentStatus;

      setPayment(response.data);

      if (paymentStatus === "paid") {
        setStatus("success");
        setMessage("Your payment was completed successfully.");
      } else if (paymentStatus === "failed" || paymentStatus === "cancelled") {
        setStatus("failed");
        setMessage("Your payment was not completed.");
      } else {
        setStatus("pending");
        setMessage(
          "Your payment is not confirmed yet. You can check again shortly.",
        );
      }
    } catch (error) {
      console.error(
        "PAYMENT VERIFICATION ERROR:",
        error.response?.data || error.message,
      );

      setStatus("error");
      setMessage(
        error.response?.data?.message ||
          "We could not verify your payment. Please try again.",
      );
    }
  };

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Please log in to verify your payment.");
      return;
    }

    if (returnedStatus === "missing_reference" || !txRef) {
      setStatus("error");
      setMessage("Payment reference was not found.");
      return;
    }

    verifyPayment();
  }, [token, txRef, returnedStatus]);

  const getIcon = () => {
    if (status === "success") return "✓";
    if (status === "failed" || status === "error") return "!";
    if (status === "pending") return "…";
    return "";
  };

  return (
    <main className="payment-result-page">
      <section className={`payment-result-card result-${status}`}>
        {status === "checking" ? (
          <div className="payment-loading-spinner" />
        ) : (
          <div className="payment-result-icon">{getIcon()}</div>
        )}

        <span className="payment-result-eyebrow">STAYORA PAYMENT</span>

        <h1>
          {status === "checking" && "Checking Payment"}
          {status === "success" && "Payment Successful!"}
          {status === "failed" && "Payment Failed"}
          {status === "pending" && "Payment Pending"}
          {status === "error" && "Verification Error"}
        </h1>

        <p>{message}</p>

        {payment && (
          <div className="payment-result-details">
            <div>
              <span>Booking ID</span>
              <strong>
                {String(payment.bookingId).slice(-8).toUpperCase()}
              </strong>
            </div>

            <div>
              <span>Payment reference</span>
              <strong>{txRef}</strong>
            </div>

            <div>
              <span>Amount</span>
              <strong>
                {payment.currency || "ETB"}{" "}
                {Number(payment.amount || 0).toLocaleString()}
              </strong>
            </div>

            <div>
              <span>Payment status</span>
              <strong>{payment.paymentStatus}</strong>
            </div>
          </div>
        )}

        <div className="payment-result-actions">
          {(status === "pending" ||
            status === "error" ||
            status === "checking") && (
            <button
              type="button"
              className="payment-check-btn"
              onClick={verifyPayment}
              disabled={status === "checking"}
            >
              Check Payment Again
            </button>
          )}

          <button
            type="button"
            className="payment-bookings-btn"
            onClick={() => navigate("/my-bookings")}
          >
            Return to My Bookings
          </button>
        </div>

        <small className="payment-result-note">
          Stayora — Your journey, our priority.
        </small>
      </section>
    </main>
  );
}

export default PaymentResult;

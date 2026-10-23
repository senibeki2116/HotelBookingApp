import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HotelChatbot.css";

const QUICK_QUESTIONS = [
  "How do I manage bookings?",
  "How do I add a room?",
  "How do I view my website?",
  "How do I update my hotel?",
];

function getReply(rawMessage) {
  const message = rawMessage.toLowerCase().trim();

  if (/\b(hello|hi|hey|good morning|good afternoon)\b/.test(message)) {
    return "Hello! 👋 I’m Stayora Assistant. I can help you find your way around the hotel dashboard. What would you like to do?";
  }
  if (/\b(bookings?|reservations?)\b/.test(message)) {
    return "To review reservations, open **Bookings** in the left sidebar. There you can review booking details and check their current status. If the page looks out of date, use its refresh control.";
  }
  if (/\b(room|rooms|add a room|new room|amenit)\b/.test(message)) {
    return "To add or edit a room, use the Rooms section or the dashboard’s room-management action. Enter the room details, price, description, and amenities, then save. Make sure the information is correct before publishing.";
  }
  if (/\b(website|home page|homepage|public page|view site)\b/.test(message)) {
    return "Use **View Website** to open the public home page in a new tab. If you want to check a specific hotel listing instead, open that listing from the public website.";
  }
  if (
    /\b(hotel|property|profile|details|description|address|edit)\b/.test(
      message,
    )
  ) {
    return "To update your property information, look for the hotel details or edit-property action on your dashboard. Review the name, location, contact details, photos, and description before saving.";
  }
  if (/\b(cancel|cancelled|cancellation|refund)\b/.test(message)) {
    return "Open **Bookings** and review the reservation status and booking details first. Follow your property’s cancellation and refund policy; contact the guest if more information is needed.";
  }
  if (/\b(help|support|what can you do|options)\b/.test(message)) {
    return "I can guide you through bookings, rooms, property information, and opening your public website. Choose one of the suggested questions below or type your question.";
  }
  if (/\b(thank|thanks)\b/.test(message)) {
    return "You’re welcome! 😊 Let me know if you need help with another dashboard task.";
  }

  return "I’m a basic hotel-dashboard assistant, so I may not know that one yet. Try asking about bookings, rooms, hotel details, or viewing your website. You can also contact your project administrator for account or payment issues.";
}

const makeMessage = (sender, text) => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  sender,
  text,
});

export default function HotelChatbot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "Hi! I’m Stayora Assistant. 👋 Ask me about managing bookings, rooms, your hotel details, or your public website.",
    },
  ]);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = (value = input) => {
    const text = value.trim();
    if (!text) return;

    setMessages((current) => [
      ...current,
      makeMessage("user", text),
      makeMessage("bot", getReply(text)),
    ]);
    setInput("");
    setShowQuickQuestions(false);
  };

  const handleAction = (action) => {
    if (action === "bookings") {
      setIsOpen(false);
      navigate("/admin/hotel-bookings");
      return;
    }
    if (action === "dashboard") {
      setIsOpen(false);
      navigate("/admin/hotel-dashboard");
      return;
    }
    if (action === "website") {
      window.open(
        `${window.location.origin}/`,
        "_blank",
        "noopener,noreferrer",
      );
    }
  };

  return (
    <div className="hotel-chatbot-root">
      {isOpen && (
        <section
          className="hotel-chatbot-panel"
          aria-label="Stayora chat assistant"
        >
          <header className="hotel-chatbot-header">
            <div className="hotel-chatbot-brand-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M4 20V7.5L12 3l8 4.5V20" />
                <path d="M8 20v-5h8v5M8 9h.01M12 9h.01M16 9h.01" />
              </svg>
            </div>
            <div className="hotel-chatbot-heading">
              <strong>Stayora Assistant</strong>
              <span>
                <i /> Here to help
              </span>
            </div>
            <button
              type="button"
              className="hotel-chatbot-icon-button"
              aria-label="Close chat"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </header>

          <div className="hotel-chatbot-messages" aria-live="polite">
            <div className="hotel-chatbot-date-label">DASHBOARD SUPPORT</div>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`hotel-chatbot-message-row ${message.sender}`}
              >
                {message.sender === "bot" && (
                  <span className="hotel-chatbot-avatar">S</span>
                )}
                <div className="hotel-chatbot-bubble">{message.text}</div>
              </div>
            ))}
            {showQuickQuestions && (
              <div className="hotel-chatbot-quick-questions">
                <span>QUICK QUESTIONS</span>
                {QUICK_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => sendMessage(question)}
                  >
                    {question}
                    <span aria-hidden="true">↗</span>
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="hotel-chatbot-shortcuts">
            <button type="button" onClick={() => handleAction("bookings")}>
              Bookings
            </button>
            <button type="button" onClick={() => handleAction("dashboard")}>
              Dashboard
            </button>
            <button type="button" onClick={() => handleAction("website")}>
              Home page ↗
            </button>
          </div>

          <form
            className="hotel-chatbot-composer"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask me anything..."
              aria-label="Type your message"
              maxLength={500}
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={!input.trim()}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 3 10.8 13.2M21 3l-6.5 18-3.7-7.8L3 9.5 21 3Z" />
              </svg>
            </button>
          </form>
          <p className="hotel-chatbot-disclaimer">
            Automated guidance · Don’t share passwords or payment details
          </p>
        </section>
      )}

      <button
        type="button"
        className={`hotel-chatbot-launcher ${isOpen ? "is-open" : ""}`}
        aria-label={
          isOpen ? "Close Stayora assistant" : "Open Stayora assistant"
        }
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? (
          <span className="hotel-chatbot-launcher-close">×</span>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-6.5A7.5 7.5 0 1 1 20 11.5Z" />
              <path d="M8 10h8M8 13.5h5" />
            </svg>
            <span className="hotel-chatbot-launcher-dot" />
          </>
        )}
      </button>
    </div>
  );
}

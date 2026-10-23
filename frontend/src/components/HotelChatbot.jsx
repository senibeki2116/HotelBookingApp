import React, { useEffect, useRef, useState } from "react";
import "./HotelChatbot.css";

const QUICK_QUESTIONS = [
  "How can I find a hotel?",
  "How do I check my booking?",
  "What services do hotels offer?",
];

function getReply(message) {
  const text = message.toLowerCase();

  if (/\b(hello|hi|hey)\b/.test(text)) {
    return "Hello! Welcome to Stayora. How can I help you today?";
  }

  if (
    text.includes("hotel") ||
    text.includes("find") ||
    text.includes("search")
  ) {
    return "Visit the home page to browse hotels. Select a hotel to see its details, rooms, and available services.";
  }

  if (text.includes("booking") || text.includes("reservation")) {
    return "To manage a booking, sign in to your account and check the bookings section, if available.";
  }

  if (text.includes("cancel")) {
    return "Please check your booking details and cancellation policy, or contact the hotel for assistance.";
  }

  if (
    text.includes("room") ||
    text.includes("service") ||
    text.includes("amenities")
  ) {
    return "Open a hotel's details page to learn about its rooms, amenities, and services.";
  }

  if (text.includes("price") || text.includes("cost")) {
    return "Hotel prices vary by date, room type, and availability. Compare the listings to find a suitable option.";
  }

  if (text.includes("thank")) {
    return "You're welcome! I'm happy to help.";
  }

  return "I can help with hotels, bookings, rooms, prices, and hotel services. What would you like to know?";
}

const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export default function HotelChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hi! I'm your Stayora Assistant. You can type a message or speak to me.",
    },
  ]);

  const messagesRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function stopSpeaking() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }

  function speak(text) {
    if (!voiceEnabled || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }

  function sendMessage(value = input) {
    const text = value.trim();
    if (!text) return;

    setError("");
    setMessages((previous) => [
      ...previous,
      { id: Date.now(), sender: "user", text },
    ]);
    setInput("");

    // These are sample replies. Connect your AI backend for real AI answers.
    const reply = getReply(text);

    window.setTimeout(() => {
      setMessages((previous) => [
        ...previous,
        { id: Date.now() + 1, sender: "bot", text: reply },
      ]);
      speak(reply);
    }, 300);
  }

  function startListening() {
    setError("");

    if (!SpeechRecognition) {
      setError("Voice input is unavailable. Please try Chrome or Edge.");
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    stopSpeaking();

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setListening(false);
      sendMessage(transcript);
    };

    recognition.onerror = (event) => {
      setListening(false);

      if (event.error === "not-allowed") {
        setError("Please allow microphone access in your browser settings.");
      } else if (event.error !== "aborted" && event.error !== "no-speech") {
        setError("Could not hear you clearly. Please try again.");
      }
    };

    recognition.onend = () => setListening(false);

    try {
      recognition.start();
    } catch {
      setListening(false);
      setError("The microphone could not start. Please try again.");
    }
  }

  return (
    <div className="stayora-chatbot">
      {isOpen && (
        <section className="stayora-chat-panel">
          <header className="stayora-chat-header">
            <div className="stayora-avatar">✦</div>

            <div className="stayora-heading">
              <strong>Stayora Assistant</strong>
              <span>
                <i /> Online · Text &amp; voice
              </span>
            </div>

            <button
              type="button"
              className="stayora-icon-button"
              onClick={() => {
                setVoiceEnabled((value) => {
                  if (value) stopSpeaking();
                  return !value;
                });
              }}
              aria-label="Toggle voice replies"
              title="Toggle voice replies"
            >
              {voiceEnabled ? "🔊" : "🔇"}
            </button>

            <button
              type="button"
              className="stayora-icon-button stayora-close"
              onClick={() => {
                stopSpeaking();
                setIsOpen(false);
              }}
              aria-label="Close chatbot"
            >
              ×
            </button>
          </header>

          <div className="stayora-welcome">
            <span>HOTEL BOOKING SUPPORT</span>
            <h3>How can I help you?</h3>
            <p>Type a message or tap the microphone to speak.</p>
          </div>

          <div className="stayora-messages" ref={messagesRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`stayora-message-row ${message.sender}`}
              >
                {message.sender === "bot" && (
                  <div className="stayora-mini-avatar">✦</div>
                )}

                <div className="stayora-bubble">
                  <p>{message.text}</p>

                  {message.sender === "bot" && (
                    <button
                      type="button"
                      className="stayora-listen"
                      onClick={() => speak(message.text)}
                    >
                      ▶ Listen
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {messages.length === 1 && (
            <div className="stayora-quick-questions">
              {QUICK_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => sendMessage(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          {error && <p className="stayora-error">{error}</p>}

          {listening && (
            <p className="stayora-status">🎙 Listening… speak now</p>
          )}

          {speaking && (
            <p className="stayora-status">🔊 Assistant is speaking…</p>
          )}

          <form
            className="stayora-composer"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <button
              type="button"
              className={`stayora-mic ${listening ? "active" : ""}`}
              onClick={startListening}
              aria-label="Speak"
              title="Speak"
            >
              {listening ? "■" : "🎙"}
            </button>

            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your message..."
              aria-label="Type your message"
            />

            <button
              type="submit"
              className="stayora-send"
              disabled={!input.trim()}
              aria-label="Send message"
              title="Send message"
            >
              ➤
            </button>
          </form>

          <footer className="stayora-footer">
            Stayora support · Text and voice assistance
          </footer>
        </section>
      )}

      <button
        type="button"
        className="stayora-launcher"
        onClick={() => setIsOpen((value) => !value)}
        aria-label={isOpen ? "Close assistant" : "Open assistant"}
      >
        {isOpen ? "×" : "✦"}
        {!isOpen && <span className="stayora-launcher-dot" />}
      </button>
    </div>
  );
}

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

  if (text.includes("cancel")) {
    return "Please check your booking details and cancellation policy, or contact the hotel for assistance.";
  }

  if (
    text.includes("booking") ||
    text.includes("reservation") ||
    text.includes("book")
  ) {
    return "To manage a booking, sign in to your account and open the bookings section, if available.";
  }

  if (text.includes("price") || text.includes("cost")) {
    return "Hotel prices vary by date, room type, and availability. Compare hotel listings to find a suitable option.";
  }

  if (
    text.includes("hotel") ||
    text.includes("find") ||
    text.includes("search")
  ) {
    return "Visit the home page to browse hotels. Select a hotel to see its details, rooms, prices, and available services.";
  }

  if (
    text.includes("room") ||
    text.includes("service") ||
    text.includes("amenities")
  ) {
    return "Open a hotel's details page to learn about its rooms, amenities, and services.";
  }

  if (text.includes("thank")) {
    return "You're welcome! I'm happy to help.";
  }

  return "I can help with hotels, bookings, rooms, prices, and hotel services. What would you like to know?";
}

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
      text: "Hi! I'm your Stayora Assistant. I can help you with hotels, rooms, and bookings.",
    },
  ]);

  const [position, setPosition] = useState(null);
  const [dragging, setDragging] = useState(false);

  const chatbotRef = useRef(null);
  const messagesRef = useRef(null);
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);
  const dragRef = useRef(null);
  const replyTimerRef = useRef(null);

  function clampPosition(x, y, width, height) {
    const margin = 8;

    return {
      x: Math.max(margin, Math.min(window.innerWidth - width - margin, x)),
      y: Math.max(margin, Math.min(window.innerHeight - height - margin, y)),
    };
  }
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseMove = (event) => {
      const chatbot = chatbotRef.current;
      if (!chatbot) return;

      // Keep the chatbot open while dragging it.
      if (dragRef.current) return;

      // Close when the cursor leaves the entire chatbot.
      if (!chatbot.contains(event.target)) {
        stopSpeaking();
        setIsOpen(false);
        setError("");
      }
    };

    document.addEventListener("pointermove", handleMouseMove);

    return () => {
      document.removeEventListener("pointermove", handleMouseMove);
    };
  }, [isOpen]);
  function placeChatbot() {
    const element = chatbotRef.current;
    if (!element || dragRef.current) return;

    const rect = element.getBoundingClientRect();
    const width = rect.width || 58;
    const height = rect.height || 58;

    setPosition((current) => {
      const x = current ? current.x : window.innerWidth - width - 20;

      const y = current ? current.y : window.innerHeight - height - 20;

      return clampPosition(x, y, width, height);
    });
  }

  useEffect(() => {
    placeChatbot();

    window.addEventListener("resize", placeChatbot);

    let resizeObserver;

    if (window.ResizeObserver && chatbotRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (!dragRef.current) {
          placeChatbot();
        }
      });

      resizeObserver.observe(chatbotRef.current);
    }

    return () => {
      window.removeEventListener("resize", placeChatbot);
      resizeObserver?.disconnect();
    };
  }, [isOpen]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isOpen, listening, speaking]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();

      if (replyTimerRef.current) {
        window.clearTimeout(replyTimerRef.current);
      }

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function stopSpeaking() {
    utteranceRef.current = null;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setSpeaking(false);
  }

  function speak(text) {
    if (!voiceEnabled) {
      setError("Turn on the speaker button to hear replies.");
      return;
    }

    if (!("speechSynthesis" in window)) {
      setError("Voice playback is not supported by this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setSpeaking(false);
    setError("");

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1;

    utteranceRef.current = utterance;

    utterance.onstart = () => {
      if (utteranceRef.current === utterance) {
        setSpeaking(true);
      }
    };

    utterance.onend = () => {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null;
        setSpeaking(false);
      }
    };

    utterance.onerror = (event) => {
      if (utteranceRef.current !== utterance) return;

      utteranceRef.current = null;
      setSpeaking(false);

      if (event.error !== "interrupted" && event.error !== "canceled") {
        setError("Sound could not play. Check your browser and device volume.");
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  function sendMessage(value = input) {
    const text = value.trim();
    if (!text) return;

    setError("");

    setMessages((previous) => [
      ...previous,
      {
        id: `${Date.now()}-user`,
        sender: "user",
        text,
      },
    ]);

    setInput("");

    if (replyTimerRef.current) {
      window.clearTimeout(replyTimerRef.current);
    }

    const reply = getReply(text);

    replyTimerRef.current = window.setTimeout(() => {
      setMessages((previous) => [
        ...previous,
        {
          id: `${Date.now()}-bot`,
          sender: "bot",
          text: reply,
        },
      ]);

      speak(reply);
    }, 350);
  }

  function startListening() {
    setError("");

    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Recognition) {
      setError("Voice input is unsupported. Please use Chrome or Edge.");
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    stopSpeaking();

    try {
      const recognition = new Recognition();

      recognitionRef.current = recognition;
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setListening(true);

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript || "";

        setListening(false);

        if (transcript.trim()) {
          sendMessage(transcript);
        }
      };

      recognition.onerror = (event) => {
        setListening(false);

        if (
          event.error === "not-allowed" ||
          event.error === "service-not-allowed"
        ) {
          setError("Allow microphone access in your browser site settings.");
        } else if (event.error === "audio-capture") {
          setError(
            "No microphone was detected. Check your microphone connection.",
          );
        } else if (event.error !== "no-speech" && event.error !== "aborted") {
          setError("Microphone error. Please try again.");
        }
      };

      recognition.onend = () => setListening(false);
      recognition.start();
    } catch (err) {
      setListening(false);
      setError("Could not start the microphone. Please try again.");
      console.error(err);
    }
  }

  function handleDragStart(event) {
    if (event.button !== 0) return;
    if (event.target.closest("button")) return;

    const element = chatbotRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Continue without pointer capture if unavailable.
    }

    setDragging(true);
    event.preventDefault();
  }

  function handleDragMove(event) {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    setPosition(
      clampPosition(drag.left + dx, drag.top + dy, drag.width, drag.height),
    );
  }

  function handleDragEnd(event) {
    if (!dragRef.current) return;

    if (
      event?.pointerId != null &&
      dragRef.current.pointerId !== event.pointerId
    ) {
      return;
    }

    dragRef.current = null;
    setDragging(false);

    requestAnimationFrame(placeChatbot);
  }

  function closeChat() {
    stopSpeaking();
    recognitionRef.current?.abort();
    setListening(false);
    setIsOpen(false);
  }

  return (
    <div
      ref={chatbotRef}
      className={`stayora-chatbot ${dragging ? "is-dragging" : ""} ${
        isOpen ? "is-open" : ""
      }`}
    >
      {isOpen ? (
        <section
          className="stayora-chat-panel"
          aria-label="Stayora customer support"
        >
          <header
            className="stayora-chat-header"
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            onPointerCancel={handleDragEnd}
            onLostPointerCapture={handleDragEnd}
          >
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
                if (voiceEnabled) stopSpeaking();
                setVoiceEnabled((value) => !value);
                setError("");
              }}
              aria-label={
                voiceEnabled
                  ? "Turn off voice replies"
                  : "Turn on voice replies"
              }
              title="Toggle voice replies"
            >
              {voiceEnabled ? "🔊" : "🔇"}
            </button>

            <button
              type="button"
              className="stayora-icon-button stayora-close"
              onClick={closeChat}
              aria-label="Close assistant"
              title="Close"
            >
              ×
            </button>
          </header>

          <div className="stayora-welcome">
            <span>STAYORA CUSTOMER CARE</span>
            <h3>How can I help you?</h3>
            <p>Ask about hotels, rooms, prices, or your booking.</p>
          </div>

          <div
            className="stayora-messages"
            ref={messagesRef}
            aria-live="polite"
          >
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

          {error && (
            <p className="stayora-error" role="status">
              {error}
            </p>
          )}

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
              aria-label={listening ? "Stop listening" : "Start voice input"}
              title={listening ? "Stop listening" : "Speak"}
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
            <span>✦</span> Stayora · Here to help
          </footer>
        </section>
      ) : (
        <button
          type="button"
          className="stayora-launcher"
          onClick={() => setIsOpen(true)}
          aria-label="Open Stayora assistant"
          title="Chat with Stayora"
        >
          ✦
          <span className="stayora-launcher-dot" />
        </button>
      )}
    </div>
  );
}

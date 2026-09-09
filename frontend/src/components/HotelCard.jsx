import { useNavigate } from "react-router-dom";

function HotelCard(props) {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate(props.link || "/hotels");
  };

  return (
    <div className="hotel-card">
      <img src={props.image} alt={props.name} />

      <h2>🏨 {props.name}</h2>

      <p>{props.rating}</p>

      <p>📍 {props.location}</p>

      <p>💲{props.price} per night</p>

      <button type="button" onClick={handleBookNow}>
        Book Now
      </button>
    </div>
  );
}

export default HotelCard;

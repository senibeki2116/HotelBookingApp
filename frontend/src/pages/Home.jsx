import HotelCard from "../components/HotelCard";

import blueSky from "../images/roomImg1.png";
import hilton from "../images/roomImg2.png";
import sheraton from "../images/roomImg3.png";

function Home() {
  return (
    <div className="container">
      <h1>Hotel Booking System</h1>

      <p>Find the best hotels at the best prices.</p>

      <HotelCard
        image={blueSky}
        name="Blue Sky Hotel"
        rating="⭐⭐⭐⭐⭐"
        location="Addis Ababa"
        price={80}
      />

      <HotelCard
        image={hilton}
        name="Hilton Hotel"
        rating="⭐⭐⭐⭐"
        location="Bahir Dar"
        price={120}
      />

      <HotelCard
        image={sheraton}
        name="Sheraton Hotel"
        rating="⭐⭐⭐⭐⭐"
        location="Hawassa"
        price={150}
      />
    </div>
  );
}

export default Home;

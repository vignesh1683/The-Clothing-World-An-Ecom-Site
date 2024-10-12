import React, { useState } from "react";
import banner1 from "../assets/banner-1.png";
import banner2 from "../assets/banner-2.png";
import banner3 from "../assets/banner-3.png";
function Banner() {
  const images = [banner1, banner2, banner3];

  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="carousel">
      <div className="carousel-inner">
        <img
          src={images[currentIndex]}
          alt={currentIndex}
          className="bannerImg"
        />
      </div>
      <div className="carousel-buttons">
        <button className="carousel-prev" onClick={goToPrevSlide}>
          &lt;
        </button>
        <button className="carousel-next" onClick={goToNextSlide}>
          &gt;
        </button>
      </div>
    </div>
  );
}

export default Banner;

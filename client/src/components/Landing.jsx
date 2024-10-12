import React from "react";
import NavBar from "./NavBar";
import Banner from "./Banner";
import Home from "./Home";
import Footer from "./Footer";

function Landing() {
  return (
    <div>
      <NavBar />
      <Banner />
      <Home gender={"mens"} />
      <Home gender={"womens"} />
      <Footer />
    </div>
  );
}

export default Landing;

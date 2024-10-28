import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "./NavBar";
import plain from "../assets/plain_heart.png";
import active from "../assets/active_heart.png";
import ProductModal from "./ProductModal";
import Footer from "./Footer";

function Mens() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState({
    sort: "popularity",
    category: "",
    size: "",
    color: "",
    minAmount: null,
    maxAmount: null,
  });
  const [productsMens, setProductsMens] = useState([]);
  const [activeProducts, setActiveProducts] = useState({});
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [product, setProduct] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [selectedColor, setSelectedColor] = useState();
  const [selectedSize, setSelectedSize] = useState();
  const [quantity, setQuantity] = useState();

  useEffect(() => {
    fetchAllProducts();
    getWishlist();
  }, [selectedOption]);

  const getWishlist = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const res = await axios.get(
          "https://the-clothing-world-an-ecom-site.onrender.com/user_wishlist_get",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const productIds = res.data.map((item) => item.product_detail_id);
        setWishlist(productIds);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const fetchAllProducts = async () => {
    let categories = ["tshirt", "pant", "shorts"];
    let allProducts = [];
    if (selectedOption.category) {
      categories = [selectedOption.category];
    }
    for (const category of categories) {
      const products = await fetchProducts(category);
      allProducts = [...allProducts, ...products];
    }
    if (selectedOption.minAmount) {
      allProducts = allProducts.filter(
        (product) =>
          product.price - (product.price * 20) / 100 >=
          Number(selectedOption.minAmount)
      );
    }
    if (selectedOption.maxAmount) {
      allProducts = allProducts.filter(
        (product) =>
          product.price - (product.price * 20) / 100 <=
          Number(selectedOption.maxAmount)
      );
    }
    if (selectedOption.size) {
      allProducts = allProducts.filter(
        (product) => product.size === `size.${selectedOption.size}`
      );
    }
    if (selectedOption.color) {
      allProducts = allProducts.filter(
        (product) => product.color === `color.${selectedOption.color}`
      );
    }
    if (selectedOption.sort === "lowest") {
      allProducts.sort((a, b) => a.price - b.price);
    } else if (selectedOption.sort === "highest") {
      allProducts.sort((a, b) => b.price - a.price);
    } else {
      allProducts.sort(() => Math.random() - 0.5);
    }
    setProductsMens(allProducts);
  };

  const fetchProducts = async (category) => {
    try {
      let apiUrl = "";
      apiUrl = `https://the-clothing-world-an-ecom-site.onrender.com/products/mens/${category}`;
      const response = await axios.get(apiUrl);
      return response.data.map(parseProduct);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const addToWishlist = async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    console.log(productId);
    try {
      const res = await axios.post(
        "https://the-clothing-world-an-ecom-site.onrender.com/user_wishlist_add",
        {
          productid: productId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWishlist(...wishlist, res.data);
      getWishlist();
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const addToBag = async (productId) => {
    if (!selectedColor || !selectedSize || !quantity) {
      alert("Please select color, size, and enter quantity");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    console.log(productId);
    let data = {
      product_id: productId,
      color: selectedColor,
      size: selectedSize,
      quantity: quantity,
    };
    console.log(data);
    const response = await axios.post(
      "https://the-clothing-world-an-ecom-site.onrender.com/user_bag_add",
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("Product added to bag:");
    setModalOpen(false);
  };

  const removeFromWishlist = async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    try {
      const res = await axios.post(
        "https://the-clothing-world-an-ecom-site.onrender.com/remove_user_wishlist",
        {
          productid: productId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      getWishlist();
      fetchAllProducts();
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const handleMouseEnter = (productId) => {
    setActiveProducts((prev) => ({ ...prev, [productId]: true }));
  };

  const handleMouseLeave = (productId) => {
    setActiveProducts((prev) => ({ ...prev, [productId]: false }));
  };

  const parseProduct = (product) => ({
    ...product,
    gender: parseGender(product.gender),
    image: atob(product.image),
  });

  const parseGender = (gender) => {
    return gender.split(".")[1];
  };

  return (
    <div>
      <NavBar highlight={"mens"} />
      <div
        className="filter-bar"
        style={{
          justifyContent: filtersVisible ? "space-between" : "end",
        }}
      >
        {filtersVisible && (
          <>
            <div className="filter-bar-title">Sort By:</div>
            <select
              value={selectedOption.sort}
              onChange={(event) =>
                setSelectedOption((prev) => ({
                  ...prev,
                  sort: event.target.value,
                }))
              }
              className="sort"
            >
              <option value="popularity">Popularity</option>
              <option value="lowest">Price: Lowest to Highest</option>
              <option value="highest">Price: Highest to Lowest</option>
              <option value="newest">Newest Arrivals</option>
              <option value="discount">Discount</option>
            </select>
            <div className="filter-bar-title">Category:</div>
            <select
              value={selectedOption.category}
              onChange={(event) =>
                setSelectedOption((prev) => ({
                  ...prev,
                  category: event.target.value,
                }))
              }
              className="sort"
            >
              <option value="">Select Category</option>
              <option value="pant">Pant</option>
              <option value="tshirt">T-Shirt</option>
              <option value="shorts">Shorts</option>
            </select>
            <div className="filter-bar-title">Size :</div>
            <select
              value={selectedOption.size}
              onChange={(event) =>
                setSelectedOption((prev) => ({
                  ...prev,
                  size: event.target.value,
                }))
              }
              className="sort"
            >
              <option value="">Select Size</option>
              <option value="s">S</option>
              <option value="m">M</option>
              <option value="l">L</option>
            </select>
            <div className="filter-bar-title">Color :</div>
            <select
              value={selectedOption.color}
              onChange={(event) =>
                setSelectedOption((prev) => ({
                  ...prev,
                  color: event.target.value,
                }))
              }
              className="sort"
            >
              <option value="">Select Color</option>
              <option value="red">Red</option>
              <option value="blue">Blue</option>
              <option value="black">Black</option>
            </select>
            <div className="filter-bar-title">Min Amount :</div>
            <input
              type="number"
              className="min-amount"
              placeholder="Min Amount"
              onChange={(event) =>
                setSelectedOption((prev) => ({
                  ...prev,
                  minAmount: event.target.value,
                }))
              }
            />
            <div className="filter-bar-title">Max Amount :</div>
            <input
              type="number"
              className="max-amount"
              placeholder="Max Amount"
              onChange={(event) =>
                setSelectedOption((prev) => ({
                  ...prev,
                  maxAmount: event.target.value,
                }))
              }
            />
          </>
        )}

        <div
          className="filter-btn-container"
          style={{
            width: filtersVisible ? "" : "100%",
          }}
        >
          <button
            className="view-all filter-btn"
            onClick={() => {
              setFiltersVisible(!filtersVisible);
            }}
          >
            {filtersVisible ? "Hide Filters" : "Filters"}
          </button>
        </div>
      </div>
      <div className="all-product-container card-container">
        {productsMens.map((product) => (
          <div
            className="products-list-container product-card"
            key={product.product_detail_id}
          >
            <div className="content">
              <div className="content-overlay">
                <img
                  src={`${product.image}`}
                  alt="dress"
                  className="product-image product-card-image"
                ></img>
                <div
                  className="fadeIn-bottom"
                  onClick={() => {
                    setModalOpen(true);
                    setProduct(product);
                  }}
                >
                  <h3>Quick View</h3>
                </div>
                <div
                  className="like-img-container"
                  onMouseEnter={() =>
                    handleMouseEnter(product.product_detail_id)
                  }
                  onMouseLeave={() =>
                    handleMouseLeave(product.product_detail_id)
                  }
                >
                  <img
                    src={plain}
                    alt="wishlist"
                    className={`plain ${
                      activeProducts[product.product_detail_id] ||
                      (Array.isArray(wishlist) &&
                        wishlist?.includes(product.product_detail_id))
                        ? "hidden"
                        : ""
                    }`}
                  />
                  <img
                    src={active}
                    alt="active"
                    className={`active ${
                      activeProducts[product.product_detail_id] ||
                      (Array.isArray(wishlist) &&
                        wishlist?.includes(product.product_detail_id))
                        ? ""
                        : "hidden"
                    }`}
                    onClick={() => {
                      Array.isArray(wishlist) &&
                      wishlist?.includes(product.product_detail_id)
                        ? removeFromWishlist(product.product_detail_id)
                        : addToWishlist(product.product_detail_id);
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="text">
              <p className="product-name">
                {`${product.model}-${product.gender}`.toUpperCase()}
              </p>
              <p className="price-details">
                <p className="line-through">RS.{product.price} </p>
                <span>RS.{product.price - (product.price * 20) / 100}</span> 20%
              </p>
            </div>
          </div>
        ))}
      </div>
      <ProductModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        product={product}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
        quantity={quantity}
        setQuantity={setQuantity}
        addToBag={addToBag}
        addToWishlist={addToWishlist}
        showAddToBag={true}
        showAddToWishlist={true}
      />
      <Footer />
    </div>
  );
}

export default Mens;

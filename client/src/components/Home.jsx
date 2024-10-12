import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import plain from "../assets/plain_heart.png";
import active from "../assets/active_heart.png";
import ProductModal from "./ProductModal";

const mensCategories = [
  { name: "PANTS", value: "pant" },
  { name: "TSHIRT", value: "tshirt" },
  { name: "SHORTS", value: "shorts" },
];
const womensCategories = [
  { name: "SHORTS", value: "short" },
  { name: "SAREE", value: "sarees" },
  { name: "KURTHI", value: "Kurtis" },
];

function Home({ gender }) {
  const navigate = useNavigate();
  const [selectedItemMens, setSelectedItemMens] = useState("pant");
  const [selectedItemWomens, setSelectedItemWomens] = useState("short");
  const [productsMens, setProductsMens] = useState([]);
  const [productsWomens, setProductsWomens] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeProducts, setActiveProducts] = useState({});
  const [selectedColor, setSelectedColor] = useState();
  const [selectedSize, setSelectedSize] = useState();
  const [product, setProduct] = useState({});
  const [quantity, setQuantity] = useState();

  useEffect(() => {
    if (gender === "mens") {
      fetchProducts(selectedItemMens, "mens");
    } else {
      fetchProducts(selectedItemWomens, "womens");
    }
    getWishlist();
  }, [gender, selectedItemMens, selectedItemWomens]);

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

  const fetchProducts = async (category, gender) => {
    try {
      let apiUrl = "";
      if (gender === "mens") {
        apiUrl = `https://the-clothing-world-an-ecom-site.onrender.com/products/mens/${category}`;
        const response = await axios.get(apiUrl);
        setProductsMens(response.data.map(parseProduct));
      } else if (gender === "womens") {
        apiUrl = `https://the-clothing-world-an-ecom-site.onrender.com/products/women/${category}`;
        const response = await axios.get(apiUrl);
        setProductsWomens(response.data.map(parseProduct));
      }
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
    try {
      if (!selectedColor || !selectedSize || !quantity) {
        alert("Please select color, size, and enter quantity");
        return;
      }
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      let data = {
        product_id: productId,
        color: selectedColor,
        size: selectedSize,
        quantity: quantity,
      };
      const response = await axios.post(
        "https://the-clothing-world-an-ecom-site.onrender.com/user_bag_add",
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Product added to bag:");
      setModalOpen(false);
    } catch (error) {
      console.error("Error adding product to bag:", error);
    }
  };

  const handleCategoryClick = (category, gender) => {
    if (gender === "mens") {
      setSelectedItemMens(category);
    } else {
      setSelectedItemWomens(category);
    }
    fetchProducts(category, gender);
  };

  const handleNavigate = () => {
    if (gender === "mens") {
      navigate("/mens");
    } else if (gender === "womens") {
      navigate("/womens");
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
  });

  const parseGender = (gender) => {
    return gender.split(".")[1];
  };

  return (
    <div>
      <div className="showcase">
        <div className="category-container">
          <p>{gender === "mens" ? "MEN" : "WOMEN"}'S WARE</p>
          <div className="category-list">
            {(gender === "mens" ? mensCategories : womensCategories).map(
              (category) => (
                <h4
                  key={category.value}
                  className={
                    (gender === "mens"
                      ? selectedItemMens
                      : selectedItemWomens) === category.value
                      ? "selected"
                      : ""
                  }
                  onClick={() => handleCategoryClick(category.value, gender)}
                >
                  {category.name}
                </h4>
              )
            )}
          </div>
        </div>
        <div className="product-container">
          {(gender === "mens" ? productsMens : productsWomens).map(
            (product) => (
              <div
                className="products-list-container"
                key={product.product_detail_id}
              >
                <div className="content">
                  <div className="content-overlay">
                    <img
                      src={`${product.image}`}
                      alt="dress"
                      className="product-image"
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
                        onClick={() => addToWishlist(product.product_detail_id)}
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
                    <span>
                      RS.{product.price - (product.price * 20) / 100}
                    </span>{" "}
                    20%
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
      <div className="view">
        <button className="view-all" onClick={() => handleNavigate()}>
          View All
        </button>
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
    </div>
  );
}

export default Home;

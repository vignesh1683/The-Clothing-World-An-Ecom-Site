import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import axios from "axios";
import ProductModal from "./ProductModal";

function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [product, setProduct] = useState({});
  const [products, setProducts] = useState([]);

  const getWishlist = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const res = await axios.get("http://localhost:5000/user_wishlist_get", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res?.data?.message) {
          setWishlist(res?.data?.map(parseProduct));
        } else {
          setWishlist([]);
        }
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      navigate("/login");
    }
  };

  const addToBag = async (productId) => {
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
      "http://localhost:5000/user_bag_add",
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    window.location.reload();
  };

  const removeFromWishlist = async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    try {
      const res = await axios.post(
        "http://localhost:5000/remove_user_wishlist",
        {
          productid: productId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      getWishlist();
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const fetchAllProducts = async () => {
    let categories = ["tshirt", "pant", "shorts", "sarees", "Kurtis", "short"];
    let allProducts = [];
    for (const category of categories) {
      const products = await fetchProducts(category);
      allProducts = [...allProducts, ...products];
    }
    allProducts.sort(() => Math.random() - 0.5);
    const selectedProducts = allProducts.slice(0, 5);
    setProducts(selectedProducts);
  };

  const fetchProducts = async (category) => {
    try {
      let apiUrl = "";
      apiUrl = `http://localhost:5000/products/mens/${category}`;
      const response = await axios.get(apiUrl);
      return response.data.map(parseProduct);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const parseProduct = (product) => ({
    ...product,
    gender: parseGender(product.gender),
  });

  const parseGender = (gender) => {
    return gender.split(".")[1];
  };

  useEffect(() => {
    getWishlist();
    fetchAllProducts();
  }, [setWishlist]);

  return (
    <div>
      <NavBar highlight={"wishlist"} />
      <div className="wishlist-container">
        <div className="wishlist-content">
          <h2>Your's Wishlist</h2>
          {wishlist.length > 0 ? (
            wishlist.map((product) => (
              <div key={product.product_detail_id} className="wishlist-item">
                <div className="wishlist-img-container">
                  <img
                    src={product.image}
                    alt=""
                    className="product-image modal-sub-img"
                  />
                </div>
                <p className="product-details">
                  <div>
                    <h2>
                      {`${product.model}-${product.gender}`.toUpperCase()}
                    </h2>
                    <h5>#TBB{product.product_detail_id}</h5>
                    <h3>RS.{product.price - (product.price * 20) / 100}</h3>
                    <span className="line-through">
                      RS.{product.price}{" "}
                    </span>{" "}
                    {"  "} 20%
                  </div>
                  <div className="product-description">
                    <h3>Product Description</h3>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Nihil dolor error commodi, consectetur officia illo
                      ducimus autem expedita officiis tempore iusto laboriosam
                      alias eos sequi pariatur itaque, possimus odio! Natus!{" "}
                      {product.description} {product.model} {product.gender}
                    </p>
                  </div>
                  <div className="product-buttons">
                    <button
                      className="sbutton"
                      onClick={() =>
                        removeFromWishlist(product.product_detail_id)
                      }
                    >
                      Remove from Wishlist
                    </button>
                    <button
                      className="sbutton"
                      onClick={() => {
                        setModalOpen(true);
                        setProduct(product);
                      }}
                    >
                      Add to Bag
                    </button>
                  </div>
                </p>
              </div>
            ))
          ) : (
            <h3>No items in your wishlist</h3>
          )}
        </div>
      </div>
      <div className="wishlist-button">
        <button className="sbutton" onClick={() => navigate("/")}>
          Continue Shopping
        </button>
      </div>
      <div className="similar-products">
        <h2>Similar Products</h2>
        <div className="product-container similar-product-container">
          {products.map((product) => (
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
                    onClick={() => {
                      product.gender === "mens"
                        ? navigate("/mens")
                        : navigate("/womens");
                    }}
                  ></img>
                </div>
              </div>
              <div className="text">
                <p className="product-name">
                  {`${product.model}-${product.gender}`.toUpperCase()}
                </p>
                <p className="price-details">
                  <h3>RS.{product.price - (product.price * 20) / 100}</h3>
                  <span className="line-through">RS.{product.price} </span>{" "}
                  {"  "} 20%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
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
        addToWishlist={() => {}}
        showAddToBag={true}
        showAddToWishlist={false}
      />
    </div>
  );
}

export default Wishlist;

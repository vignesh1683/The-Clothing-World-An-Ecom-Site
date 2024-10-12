import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";

function Cart() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [bagItems, setBagItems] = useState([]);

  useEffect(() => {
    getBagItems();
    fetchAllProducts();
  }, []);

  const getBagItems = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/user_bag_get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res?.data?.message) {
        setBagItems(res?.data?.map(parseProduct));
      } else {
        setBagItems([]);
      }
    } catch (error) {
      console.error("Error fetching bag items:", error);
    }
  };

  const removeFromBag = async (productId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://localhost:5000/user_bag_remove",
        { product_id: productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      getBagItems();
    } catch (error) {
      console.error("Error removing product from bag:", error);
    }
  };

  const moveProductCheckout = async (productIds) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        "http://localhost:5000/move_to_checkout",
        { product_ids: productIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      getBagItems();
      alert("This website is a poc... Thank you for your time");
    } catch (error) {
      console.error("Error moving product to checkout:", error);
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

  return (
    <div>
      <NavBar highlight={"cart"} />
      <div>
        <div className="cart-container">
          <h2>Your's Cart</h2>
          <div className="cart-content">
            {bagItems.length > 0 ? (
              bagItems.map((product) => (
                <div key={product.product_detail_id} className="cart-item">
                  <div className="cart-img-container">
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
                      <p>Size :{product.size.toUpperCase()}</p>
                      <p>Quantity : {product.quantity}</p>
                      <p>Color : {product.color}</p>
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
                        onClick={() => removeFromBag(product.product_detail_id)}
                      >
                        Remove from Cart
                      </button>
                      <button
                        className="sbutton"
                        onClick={() => {
                          moveProductCheckout(
                            bagItems
                              .filter(
                                (products) =>
                                  products.product_detail_id ===
                                  product.product_detail_id
                              )
                              .map((products) => products.product_detail_id)
                          );
                        }}
                      >
                        Buy Now
                      </button>
                    </div>
                  </p>
                </div>
              ))
            ) : (
              <h3>No items in your Cart</h3>
            )}
            <div className="cart-total">
              {bagItems.length > 0 ? (
                <>
                  <h3 className="cart-total">
                    No. of products :{" "}
                    {bagItems.reduce(
                      (acc, product) => acc + product.quantity,
                      0
                    )}
                  </h3>
                  <p className="cart-total">
                    Total Price :{" "}
                    {bagItems.reduce(
                      (acc, product) =>
                        acc + product.quantity * parseInt(product.price),
                      0
                    )}
                  </p>
                  <h3 className="cart-total">
                    Discounted Price :{" "}
                    {bagItems.reduce(
                      (acc, product) =>
                        acc +
                        product.quantity *
                          (parseInt(product.price) -
                            (parseInt(product.price) * 20) / 100),
                      0
                    )}
                  </h3>
                  <button
                    className="sbutton"
                    onClick={() =>
                      moveProductCheckout(
                        bagItems.map((product) => product.product_detail_id)
                      )
                    }
                  >
                    Buy Now
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
        <div className="cart-button">
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
                    <span className="line-through">
                      RS.{product.price}{" "}
                    </span>{" "}
                    {"  "} 20%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Cart;

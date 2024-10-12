// ProductModal.js
import React from "react";

const ProductModal = ({
  modalOpen,
  setModalOpen,
  product,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  quantity,
  setQuantity,
  addToBag,
  addToWishlist,
  showAddToBag,
  showAddToWishlist,
}) => {
  if (!modalOpen) return null; // If modal is not open, return null

  return (
    <div className="modal">
      <div className="modal-container">
        <span
          className="modal-close"
          onClick={() => {
            setModalOpen(false);
          }}
        >
          &times;
        </span>
        <div className="modal-content">
          <div className="modal-left">
            {[...Array(3)].map((_, i) => (
              <img
                key={i}
                src={`${product.image}`}
                className="modal-sub-img"
                alt="mens_dress"
              />
            ))}
          </div>
          <img
            src={`${product.image}`}
            className="model-main-img"
            alt="mens_dress"
          />
          <div className="modal-right">
            <h2>{`${product.model}-${product.gender}`.toUpperCase()}</h2>
            <h5>#TBB{product.product_detail_id}</h5>
            <h3>Product Description</h3>
            <p>{product.description}</p>
            <h3>Available Color</h3>
            <div className="color-circles">
              {["Red", "Blue", "Black"].map((color) => (
                <div
                  key={color}
                  className={`circle ${color.toLowerCase()} ${
                    selectedColor === color ? "selectedSizeColor" : ""
                  }`}
                  onClick={() => setSelectedColor(color)}
                ></div>
              ))}
            </div>
            <h3>Available Size</h3>
            <div className="size-circle">
              {["s", "m", "l"].map((size) => (
                <div
                  key={size}
                  className={`circle circleColor ${
                    selectedSize === size ? "selectedSizeColor" : ""
                  }`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size.toUpperCase()}
                </div>
              ))}
            </div>
            <div className="quantity">
              <p>Quantity</p>
              <input
                type="number"
                className="quantity-bar"
                placeholder="Enter Quantity"
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <h3>Price Details</h3>
            <p className="price-details">
              <p className="line-through">RS.{product.price} </p>
              <span>RS.{product.price - (product.price * 20) / 100}</span> 20%
            </p>
            {showAddToBag && (
              <button
                className="sbutton"
                onClick={() => addToBag(product.product_detail_id)}
              >
                Add to Bag
              </button>
            )}
            {showAddToWishlist && (
              <button
                className="sbutton"
                onClick={() => addToWishlist(product.product_detail_id)}
              >
                Add to Wishlist
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;

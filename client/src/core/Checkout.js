import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import {
  // getProducts,
  getBraintreeClientToken,
  processPayment,
  createOrder,
  readUser,
} from "./apiCore";
import { emptyCart } from "./cartHelpers";
// import Card from './Card';
import { isAuthenticated } from "../auth";
import { Link } from "react-router-dom";
import DropIn from "braintree-web-drop-in-react";

const loadUserData = async (setData, userId, token) => {
  try {
    const userData = await readUser(userId, token);
    console.log("User data from API:", userData);
    if (userData) {
      setData((prevData) => ({
        ...prevData,
        address: userData.address || "",
        phone: userData.phone || "", // Load phone từ user data
      }));
    }
  } catch (err) {
    console.log("Lỗi khi lấy thông tin người dùng:", err);
  }
};
const Checkout = ({ products, setRun = (f) => f, run = undefined }) => {
  const [data, setData] = useState({
    loading: false,
    success: false,
    clientToken: null,
    error: "",
    instance: {},
    address: "",
    phone: "",
    addressLoading: true,
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const userId = isAuthenticated() && isAuthenticated().user._id;
  const token = isAuthenticated() && isAuthenticated().token;

  const getToken = (userId, token) => {
    getBraintreeClientToken(userId, token).then((data) => {
      if (data.error) {
        console.log(data.error);
        setData((prevData) => ({ ...prevData, error: data.error }));
      } else {
        console.log(data);
        setData((prevData) => ({ ...prevData, clientToken: data.clientToken }));
      }
    });
  };
  const handleAddress = (event) => {
    const address = event.target.value;
    setData((prevData) => ({
      ...prevData,
      address: address,
    }));
  };
  const handlePhone = (event) => {
    const phone = event.target.value;
    setData((prevData) => ({
      ...prevData,
      phone: phone,
    }));
  };
  const getTotal = () => {
    return products.reduce((currentValue, nextValue) => {
      return currentValue + nextValue.count * nextValue.price;
    }, 0);
  };

  const showCheckout = () => {
    return isAuthenticated() ? (
      <div>{showDropIn()}</div>
    ) : (
      <Link to="/signin">
        <Button variant="contained" color="primary">
          Sign in to checkout
        </Button>
      </Link>
    );
  };

  useEffect(() => {
    if (userId && token) {
      getToken(userId, token);
      loadUserData(setData, userId, token); // Truyền userId và token
    }
  }, [userId, token]);

  const buy = () => {
    if (!data.address || !data.address.trim()) {
      setData((prevData) => ({
        ...prevData,
        error: "Vui lòng nhập địa chỉ giao hàng",
      }));
      return;
    }
    if (!data.phone || !data.phone.trim()) {
      setData((prevData) => ({
        ...prevData,
        error: "Vui lòng nhập số điện thoại",
      }));
      return;
    }

    setData((prevData) => ({ ...prevData, loading: true }));

    let nonce;
    data.instance
      .requestPaymentMethod()
      .then((paymentData) => {
        // Đổi tên biến để tránh conflict
        nonce = paymentData.nonce;
        const paymentRequestData = {
          paymentMethodNonce: nonce,
          amount: getTotal(products),
        };

        processPayment(userId, token, paymentRequestData)
          .then((response) => {
            const createOrderData = {
              products: products,
              transaction_id: response.transaction.id,
              amount: response.transaction.amount,
              address: data.address,
              phone: data.phone,
            };

            // Debug: In ra data trước khi gửi
            console.log("Data gửi đi:", createOrderData);
            console.log("Products:", products);
            console.log("Address:", data.address);
            console.log("Phone:", data.phone);

            createOrder(userId, token, createOrderData)
              .then((response) => {
                console.log("Response từ server:", response);
                emptyCart(() => {
                  setRun(!run);
                  console.log("payment success and empty cart");
                  setData({
                    loading: false,
                    success: true,
                  });
                });
              })
              .catch((error) => {
                console.log("Lỗi create order:", error);
                setData((prevData) => ({ ...prevData, loading: false }));
              });
          })
          .catch((error) => {
            console.log("Lỗi payment:", error);
            setData((prevData) => ({ ...prevData, loading: false }));
          });
      })
      .catch((error) => {
        console.log("Lỗi request payment:", error);
        setData((prevData) => ({ ...prevData, error: error.message }));
      });
  };

  const showDropIn = () => (
    <div onBlur={() => setData((prevData) => ({ ...prevData, error: "" }))}>
      {data.clientToken !== null && products.length > 0 ? (
        <div>
          <div className="form-group mb-3">
            <label className="text-muted">Địa chỉ giao hàng:</label>
            <textarea
              onChange={handleAddress}
              className="form-control"
              value={data.address}
              disabled={!isEditingAddress}
            />
          </div>

          <div className="form-group mb-3">
            <label className="text-muted">Số điện thoại:</label>
            <input
              type="tel"
              onChange={handlePhone}
              className="form-control"
              value={data.phone}
              disabled={!isEditingAddress}
              placeholder="Nhập số điện thoại"
            />
          </div>

          {!isEditingAddress ? (
            <Button
              variant="outlined"
              color="primary"
              size="small"
              style={{ marginTop: "10px" }}
              onClick={() => setIsEditingAddress(true)}
            >
              Chỉnh sửa thông tin
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              size="small"
              style={{ marginTop: "10px" }}
              onClick={() => setIsEditingAddress(false)}
            >
              Lưu
            </Button>
          )}

          <DropIn
            options={{
              authorization: data.clientToken,
            }}
            onInstance={(instance) =>
              setData((prevData) => ({ ...prevData, instance }))
            }
          />
          <button onClick={buy} className="btn btn-success btn-block">
            Pay
          </button>
        </div>
      ) : null}
    </div>
  );

  const showError = (error) => (
    <div
      className="alert alert-danger"
      style={{ display: error ? "" : "none" }}
    >
      {error}
    </div>
  );

  const showSuccess = (success) => (
    <div
      className="alert alert-info"
      style={{ display: success ? "" : "none" }}
    >
      Thanks! Your payment was successful!
    </div>
  );

  const showLoading = (loading) =>
    loading && <h2 className="text-danger">Loading...</h2>;

  return (
    <div>
      <h2>Total: ${getTotal()}</h2>
      {showLoading(data.loading)}
      {showSuccess(data.success)}
      {showError(data.error)}
      {showCheckout()}
    </div>
  );
};

export default Checkout;

import React, { useState, useEffect, useCallback } from "react";
import Layout from "../core/Layout";
import { isAuthenticated } from "../auth";
import { Link } from "react-router-dom";
import { getPurchaseHistory } from "./apiUser";
import moment from "moment";

const Dashboard = () => {
  const [history, setHistory] = useState([]);

  const {
    user: { _id, name, email, role },
  } = isAuthenticated();

  const token = isAuthenticated().token;

  const init = useCallback((userId, token) => {
    getPurchaseHistory(userId, token).then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        setHistory(data);
      }
    });
  }, []);

  useEffect(() => {
    init(_id, token);
  }, [init, _id, token]);


  const userLinks = () => {
    return (
      <div className="card">
        <h4 className="card-header">User links</h4>
        <ul className="list-group">
          <li className="list-group-item">
            <Link className="nav-link" to="/cart">
              My cart
            </Link>
          </li>
          <li className="list-group-item">
            <Link className="nav-link" to={`/profile/${_id}`}>
              Update profile
            </Link>
          </li>
        </ul>
      </div>
    );
  };

  const userInfo = () => {
    return (
      <div className="card mb-5">
        <h3 className="card-header">User information</h3>
        <ul className="list-group">
          <li className="list-group-item">{name}</li>
          <li className="list-group-item">{email}</li>
          <li className="list-group-item">
            {role === 1 ? "Admin" : "Registered user"}
          </li>
        </ul>
      </div>
    );
  };

  const purchaseHistory = (history) => {
    return (
      <div className="card mb-5">
        <h3 className="card-header">Purchase history</h3>
        <ul className="list-group">
          <li className="list-group-item">
            {history.map((h, i) => {
              return (
                <div key={i}>
                  <hr />
                  <div className="order-info mb-2">
                    <h6>
                      <strong>Order ID:</strong> {h._id}
                    </h6>
                    <h6>
                      <strong>Status:</strong> {h.status}
                    </h6>
                    <h6>
                      <strong>Order Date:</strong>{" "}
                      {moment(h.createdAt).fromNow()}
                    </h6>
                    <h6>
                      <strong>Total Amount:</strong> ${h.amount}
                    </h6>
                    {h.address && (
                      <h6>
                        <strong>Address:</strong> {h.address}
                      </h6>
                    )}
                    {h.phone && (
                      <h6>
                        <strong>Phone:</strong> {h.phone}
                      </h6>
                    )}
                  </div>
                  <div className="products-info">
                    <strong>Products:</strong>
                    {h.products.map((p, i) => {
                      return (
                        <div key={i} className="ml-3 mt-2">
                          <h6>• Product name: {p.name}</h6>
                          <h6>• Product price: ${p.price}</h6>
                          <h6>• Quantity: {p.count}</h6>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </li>
        </ul>
      </div>
    );
  };
  return (
    <Layout
      title="Dashboard"
      description={`${name}`}
      className="container-fluid"
    >
      <div className="row">
        <div className="col-md-3">{userLinks()}</div>
        <div className="col-md-9">
          {userInfo()}
          {purchaseHistory(history)}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

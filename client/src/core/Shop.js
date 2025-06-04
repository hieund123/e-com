import React, { useState, useEffect, useCallback } from "react";
import Layout from "./Layout";
import Button from "@material-ui/core/Button";
import Card from "./Card";
import { getCategories, getFilteredProducts } from "./apiCore";
import Checkbox from "./Checkbox";
import RadioBox from "./RadioBox";
import { makeStyles } from "@material-ui/core/styles";

import Search from "./Search";
import { prices } from "./fixedPrices";

const Shop = () => {
  const [myFilters, setMyFilters] = useState({
    filters: { category: [], price: [] },
  });

  const [categories, setCategories] = useState([]);
  // const [error, setError] = useState(false);
  const [limit] = useState(6);
  const [skip, setSkip] = useState(0);
  const [size, setSize] = useState(0);
  const [filteredResults, setFilteredResults] = useState([]);

  const init = () => {
    getCategories().then((data) => {
      if (data.error) {
        // setError(data.error);
      } else {
        setCategories(data);
      }
    });
  };

  const loadFilteredResults = useCallback(
    (newFilters) => {
      getFilteredProducts(skip, limit, newFilters).then((data) => {
        if (data.error) {
          // setError(data.error);
        } else {
          setFilteredResults(data.data);
          setSize(data.size);
          setSkip(0);
        }
      });
    },
    [skip, limit]
  );

  const loadMore = () => {
    let toSkip = skip + limit;
    // console.log(newFilters);
    getFilteredProducts(toSkip, limit, myFilters.filters).then((data) => {
      if (data.error) {
        // setError(data.error);
      } else {
        setFilteredResults([...filteredResults, ...data.data]);
        setSize(data.size);
        setSkip(toSkip);
      }
    });
  };

  const useStyles = makeStyles((theme) => ({
    btn: {
      background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
      borderRadius: 3,
      border: 0,
      color: "white",
      height: 48,
      padding: "0 20px",
      boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
    },
  }));

  const classes = useStyles();

  const loadMoreButton = () => {
    return (
      size > 0 &&
      size >= limit && (
        // <button onClick={loadMore} className='btn btn-warning mb-5'>
        //   Load more
        // </button>
        <Button onClick={loadMore} variant="contained" className={classes.btn}>
          Load more
        </Button>
      )
    );
  };

  useEffect(() => {
    init();
    loadFilteredResults(myFilters.filters);
  }, [loadFilteredResults, myFilters.filters]);

  const handleFilters = (filters, filterBy) => {
    const newFilters = { ...myFilters };
    newFilters.filters[filterBy] = filters || [];

    if (filterBy === "price") {
      let priceValues = handlePrice(filters);
      newFilters.filters[filterBy] = priceValues;
    }
    setMyFilters(newFilters);
    loadFilteredResults(myFilters.filters);
  };

  const handlePrice = (value) => {
    const data = prices;
    let array = [];

    for (let key in data) {
      if (data[key]._id === parseInt(value)) {
        array = data[key].array;
      }
    }
    return array.length > 0 ? array : [0, 1000000];
  };

  return (
    <Layout
      title="Shop page"
      description="Tìm kiếm và khám phá những sản phẩm bạn yêu thích"
      className="container-fluid"
    >
      <Search />
      <div className="row">
        <div className="col-md-3">
          <h4>Lọc theo categories</h4>
          <ul>
            <Checkbox
              categories={categories}
              handleFilters={(filters) => handleFilters(filters, "category")}
            />
          </ul>

          <h4>Lọc theo giá</h4>
          <div>
            <RadioBox
              prices={prices}
              handleFilters={(filters) => handleFilters(filters, "price")}
            />
          </div>
        </div>

        <div className="col-md-9">
          <h2 className="mb-2">Products</h2>
          <div className="row">
            {filteredResults.map((product, i) => (
              <div key={i} className="col-xl-4 col-lg-6 col-md-12 col-sm-12">
                <Card product={product} />
              </div>
            ))}
          </div>
          <hr />
          {loadMoreButton()}
        </div>
      </div>
    </Layout>
  );
};

export default Shop;

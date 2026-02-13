import { useState, useContext, useMemo } from 'react';
import { ShopContext } from './ShopContext';
import './Filter.css';

function FilterAccessories() {
  const { accessoryProductsFull, accessoryProducts, sort, setSort } =
    useContext(ShopContext);
  const [showFilter, setShowFilters] = useState(false);

  // Memoize unique sizes and categories
  const allSizes = useMemo(() => {
    return [...new Set(accessoryProductsFull.flatMap((p) => p.sizes || []))];
  }, [accessoryProducts]);

  const allCategories = useMemo(() => {
    return [...new Set(accessoryProductsFull.map((p) => p.category))];
  }, [accessoryProducts]);

  function handleClick() {
    setShowFilters((prevValue) => !prevValue);
  }

  function setPricing(e) {
    setSort(e.target.value);
  }

  return (
    <div className="filterbar">
      <div className="container">
        <div className="wrapper flex-sb">
          <div className="left-side flex gap2">
            <button
              type="button"
              className="filter-btn flex gap"
              onClick={handleClick}
            >
              <div className="lines-container">
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
              </div>
              Filter
            </button>
            <select className="sort" onChange={setPricing}>
              <option value="default">Newest First</option>
              <option value="Low-High">Price: Low to High</option>
              <option value="High-Low">Price: High to Low</option>
            </select>
          </div>
          <div className="right-side">
            Showing {accessoryProducts.length} out of {accessoryProducts.length}{' '}
            Products
          </div>
        </div>
        {showFilter && (
          <div className="filter-dropdown">
            <h3>Filters</h3>
            <div className="cat-section">
              <h4>Categories</h4>
              <div className="filter-btns-container flex gap1">
                {allCategories.map((category) => {
                  return <button type="button">{category}</button>;
                })}
              </div>
            </div>
            <div className="size-section">
              <h4>Sizes</h4>
              <div className="filter-btns-container flex gap1">
                {allSizes.map((size) => {
                  return <button type="button">{size}</button>;
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FilterAccessories;

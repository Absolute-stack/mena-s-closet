import { useState, useContext, useMemo } from 'react';
import { ShopContext } from './ShopContext';
import './Filter.css';

function FilterMen() {
  const {
    menProductsFull,
    menProducts,
    setSort,
    sizes,
    setSizes,
    categories,
    setCategories,
  } = useContext(ShopContext);
  const [showFilter, setShowFilters] = useState(false);

  // Memoize unique sizes and categories
  const allSizes = useMemo(() => {
    return [...new Set(menProductsFull.flatMap((p) => p.sizes || []))];
  }, [menProducts]);

  const allCategories = useMemo(() => {
    return [...new Set(menProductsFull.map((p) => p.category))];
  }, [menProducts]);

  function handleClick() {
    setShowFilters((prevValue) => !prevValue);
  }

  function handleCategories(e) {
    const value = e.target.textContent;
    setCategories((prevArr) =>
      prevArr.includes(value)
        ? prevArr.filter((v) => v !== value)
        : [...prevArr, value]
    );
  }

  function handleSizes(e) {
    const value = e.target.textContent;
    setSizes((prevArr) =>
      prevArr.includes(value)
        ? prevArr.filter((v) => v !== value)
        : [...prevArr, value]
    );
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
            Showing {menProducts.length} out of {menProducts.length} Products
          </div>
        </div>
        {showFilter && (
          <div className="filter-dropdown">
            <h3>Filters</h3>
            <div className="cat-section">
              <h4>Categories</h4>
              <div className="filter-btns-container flex gap1 category-container">
                {allCategories.map((category) => {
                  return (
                    <button
                      type="button"
                      onClick={handleCategories}
                      className={categories.includes(category) ? 'active' : ''}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="size-section">
              <h4>Sizes</h4>
              <div className="filter-btns-container flex gap1 size-container">
                {allSizes.map((size) => {
                  return (
                    <button
                      type="button"
                      onClick={handleSizes}
                      className={sizes.includes(size) ? 'active' : ''}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default FilterMen;

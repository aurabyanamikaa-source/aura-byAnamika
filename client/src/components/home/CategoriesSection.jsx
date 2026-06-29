import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function CategoriesSection() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories?featured=true').then(r => setCategories(r.data.data)).catch(() => {});
  }, []);

  return (
    <div className="ul-container">
      <section className="ul-categories">
        <div className="ul-inner-container">
          <div className="row row-cols-lg-4 row-cols-md-3 row-cols-2 row-cols-xxs-1 ul-bs-row">
            {categories.map(cat => (
              <div className="col" key={cat._id}>
                <Link className="ul-category" to={`/shop?category=${cat.slug}`}>
                  <div className="ul-category-img">
                    <img
                      src={cat.image || 'https://via.placeholder.com/59x59'}
                      alt={cat.name}
                    />
                  </div>
                  <div className="ul-category-txt">
                    <span>{cat.name}</span>
                  </div>
                  <div className="ul-category-btn">
                    <span><i className="bi bi-arrow-right"></i></span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

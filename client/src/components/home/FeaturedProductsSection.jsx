import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import api from '../../services/api';
import ProductCard from '../product/ProductCard';

export default function FeaturedProductsSection({ config = {} }) {
  const [row1Products, setRow1Products] = useState([]);
  const [row2Products, setRow2Products] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/products?featured=true&limit=6'),
      api.get('/banners?type=collection'),
    ]).then(([prodRes, bannerRes]) => {
      const all = prodRes.data.data || [];
      setRow1Products(all.slice(0, 3));
      setRow2Products(all.slice(3, 6));
      setBanners(bannerRes.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const banner1 = banners[0];
  const banner2 = banners[1];

  const SWIPER_OPTS = {
    modules: [Navigation, Autoplay],
    slidesPerView: 3,
    loop: true,
    autoplay: { delay: 3500, disableOnInteraction: false },
    spaceBetween: 15,
    breakpoints: {
      0:    { slidesPerView: 1 },
      480:  { slidesPerView: 2 },
      992:  { slidesPerView: 3, spaceBetween: 15 },
      1200: { slidesPerView: 3, spaceBetween: 20 },
      1400: { slidesPerView: 3, spaceBetween: 22 },
      1600: { slidesPerView: 3, spaceBetween: 26 },
    },
  };

  return (
    <div className="ul-container">
      <section className="ul-products">
        <div className="ul-inner-container">

          {/* Section heading — "More Collection" button on right */}
          <div className="ul-section-heading">
            <div className="left">
              <span className="ul-section-sub-title">
                {config.subtitle || 'Summer collection'}
              </span>
              <h2 className="ul-section-title">
                {config.title || 'Shopping Every Day'}
              </h2>
            </div>
            <div className="right">
              <Link to="/shop" className="ul-btn">
                More Collection <i className="bi bi-arrow-up-right"></i>
              </Link>
            </div>
          </div>

          {/* ── ROW 1: Promo banner LEFT + 3 products RIGHT ── */}
          <div className="row ul-bs-row">
            {/* Banner col */}
            <div className="col-lg-3 col-md-4 col-12">
              <div className="ul-products-sub-banner">
                <div className="ul-products-sub-banner-img">
                  {banner1?.image ? (
                    <img src={banner1.image} alt={banner1.title || 'Trending'} />
                  ) : (
                    <img
                      src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop"
                      alt="Trending Now"
                    />
                  )}
                </div>
                <div className="ul-products-sub-banner-txt">
                  <h3 className="ul-products-sub-banner-title">
                    {banner1?.title || 'Trending Now Only This Weekend!'}
                  </h3>
                  <Link to={banner1?.buttonLink || '/shop'} className="ul-btn">
                    {banner1?.buttonText || 'Shop Now'}{' '}
                    <i className="bi bi-arrow-up-right"></i>
                  </Link>
                </div>
              </div>
            </div>

            {/* Products Swiper — row 1 */}
            <div className="col-lg-9 col-md-8 col-12">
              <Swiper
                {...SWIPER_OPTS}
                navigation={{
                  nextEl: '.ul-products-slider-1-nav .next',
                  prevEl: '.ul-products-slider-1-nav .prev',
                }}
                className="ul-products-slider-1"
              >
                {(row1Products.length ? row1Products : Array(3).fill(null)).map((product, i) => (
                  <SwiperSlide key={product?._id || i}>
                    {product ? (
                      <ProductCard product={product} />
                    ) : (
                      <div style={{ background: '#f5f5f5', borderRadius: 12, height: 300 }} />
                    )}
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className="ul-products-slider-nav ul-products-slider-1-nav">
                <button className="prev"><i className="bi bi-arrow-left"></i></button>
                <button className="next"><i className="bi bi-arrow-right"></i></button>
              </div>
            </div>

            {/* ── ROW 2: Promo banner LEFT + 3 products RIGHT ── */}
            {/* Banner col */}
            <div className="col-lg-3 col-md-4 col-12">
              <div className="ul-products-sub-banner">
                <div className="ul-products-sub-banner-img">
                  {banner2?.image ? (
                    <img src={banner2.image} alt={banner2.title || 'Trending'} />
                  ) : (
                    <img
                      src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop"
                      alt="Trending Now"
                    />
                  )}
                </div>
                <div className="ul-products-sub-banner-txt">
                  <h3 className="ul-products-sub-banner-title">
                    {banner2?.title || 'Trending Now Only This Weekend!'}
                  </h3>
                  <Link to={banner2?.buttonLink || '/shop'} className="ul-btn">
                    {banner2?.buttonText || 'Shop Now'}{' '}
                    <i className="bi bi-arrow-up-right"></i>
                  </Link>
                </div>
              </div>
            </div>

            {/* Products Swiper — row 2 */}
            <div className="col-lg-9 col-md-8 col-12">
              <Swiper
                {...SWIPER_OPTS}
                navigation={{
                  nextEl: '.ul-products-slider-2-nav .next',
                  prevEl: '.ul-products-slider-2-nav .prev',
                }}
                className="ul-products-slider-2"
              >
                {(row2Products.length ? row2Products : Array(3).fill(null)).map((product, i) => (
                  <SwiperSlide key={product?._id || i}>
                    {product ? (
                      <ProductCard product={product} />
                    ) : (
                      <div style={{ background: '#f5f5f5', borderRadius: 12, height: 300 }} />
                    )}
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className="ul-products-slider-nav ul-products-slider-2-nav">
                <button className="prev"><i className="bi bi-arrow-left"></i></button>
                <button className="next"><i className="bi bi-arrow-right"></i></button>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
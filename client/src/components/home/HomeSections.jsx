import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import api from '../../services/api';
import ProductCard from '../product/ProductCard';
import toast from 'react-hot-toast';

// ─── AD BANNER ───────────────────────────────────────────────────
export function AdSection({ config = {} }) {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    api.get('/banners?type=ad').then(r => {
      if (r.data.data?.[0]) setBanner(r.data.data[0]);
    }).catch(() => {});
  }, []);

  const title = banner?.title || config.title || 'Get 30% Discount On All Hudis!';
  const subtitle = banner?.subtitle || config.subtitle || 'LIMITED TIME OFFER';
  const btnText = banner?.buttonText || config.buttonText || 'Shop Now';
  const btnLink = banner?.buttonLink || config.buttonLink || '/shop';
  const image = banner?.image || 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=1400&h=400&fit=crop';

  return (
    <div className="ul-container">
      <section className="ul-ad" style={{ margin: 'clamp(40px,4.2vw,80px) 0' }}>
        <div
          className="ul-ad-inner"
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: 'clamp(15px,2.1vw,40px)',
            padding: 'clamp(40px,4.2vw,80px) clamp(20px,3.15vw,60px)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 100%)',
          }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
            <span style={{
              color: '#FFA31A', fontWeight: 500, fontSize: 'clamp(13px,0.84vw,16px)',
              letterSpacing: '0.25em', textTransform: 'uppercase', display: 'block', marginBottom: 12,
            }}>
              {subtitle}
            </span>
            <h2 style={{
              color: '#fff', fontWeight: 700, fontSize: 'clamp(28px,2.63vw,50px)',
              lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 24,
            }}>
              {title}
            </h2>
            <Link to={btnLink} className="ul-btn" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}>
              {btnText} <i className="bi bi-arrow-up-right"></i>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── MOST SELLING ─────────────────────────────────────────────────
export function MostSellingSection({ config = {} }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('/products?bestSeller=true&limit=8').then(r => setProducts(r.data.data)).catch(() => {});
  }, []);

  return (
    <div className="ul-container">
      <section style={{ margin: 'clamp(40px,4.2vw,80px) 0' }}>
        <div className="ul-inner-container">
          <div className="ul-section-heading">
            <div>
              <span className="ul-section-sub-title">{config.subtitle || 'most selling items'}</span>
              <h2 className="ul-section-title">{config.title || 'Top selling Categories This Week'}</h2>
            </div>
            <Link to="/shop?bestSeller=true" className="ul-btn">
              View All <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={30}
            slidesPerView={4}
            navigation
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            loop={products.length > 4}
            breakpoints={{
              0: { slidesPerView: 1 },
              480: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1200: { slidesPerView: 4 },
            }}
          >
            {products.map(product => (
              <SwiperSlide key={product._id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
    </div>
  );
}

// ─── FLASH SALE ───────────────────────────────────────────────────
function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, days: 0 });

  useEffect(() => {
    const end = targetDate ? new Date(targetDate) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const tick = () => {
      const diff = end - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

export function FlashSaleSection({ config = {} }) {
  const [products, setProducts] = useState([]);
  const timeLeft = useCountdown(config.endDate);

  useEffect(() => {
    api.get('/products?onSale=true&limit=8').then(r => setProducts(r.data.data)).catch(() => {});
  }, []);

  const pad = n => String(n).padStart(2, '0');

  return (
    <div className="overflow-hidden">
      <div className="ul-container">
        <div className="ul-flash-sale">
          <div className="ul-inner-container">

            {/* Heading row */}
            <div className="ul-section-heading ul-flash-sale-heading">
              <div className="left">
                <span className="ul-section-sub-title">{config.subtitle || 'New Collection'}</span>
                <h2 className="ul-section-title">{config.title || 'Trending Flash Sell'}</h2>
              </div>

              <div className="ul-flash-sale-countdown-wrapper">
                <div className="ul-flash-sale-countdown">
                  <div className="days-wrapper">
                    <div className="days number">{pad(timeLeft.days)}</div>
                    <span className="txt">Days</span>
                  </div>
                  <div className="hours-wrapper">
                    <div className="hours number">{pad(timeLeft.hours)}</div>
                    <span className="txt">Hours</span>
                  </div>
                  <div className="minutes-wrapper">
                    <div className="minutes number">{pad(timeLeft.minutes)}</div>
                    <span className="txt">Min</span>
                  </div>
                  <div className="seconds-wrapper">
                    <div className="seconds number">{pad(timeLeft.seconds)}</div>
                    <span className="txt">Sec</span>
                  </div>
                </div>
              </div>

              <Link to="/shop?onSale=true" className="ul-btn">
                View All Collection <i className="bi bi-arrow-up-right"></i>
              </Link>
            </div>

            {/* Products slider */}
            <Swiper
              modules={[Navigation, Autoplay]}
              className="ul-flash-sale-slider"
              slidesPerView={1}
              loop={products.length > 4}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              spaceBetween={15}
              navigation
              breakpoints={{
                480: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                992: { slidesPerView: 4 },
                1200: { spaceBetween: 20, slidesPerView: 4 },
                1680: { spaceBetween: 26, slidesPerView: 4 },
                1700: { spaceBetween: 30, slidesPerView: 4.7 },
              }}
            >
              {products.map(product => (
                <SwiperSlide key={product._id}>
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>

          </div>
        </div>
      </div>
    </div>
  );
}

// ─── REVIEWS ──────────────────────────────────────────────────────
export function ReviewsSection({ config = {} }) {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    api.get('/testimonials').then(r => setTestimonials(r.data.data)).catch(() => {});
  }, []);

  return (
    <div className="ul-container">
      <section className="ul-reviews" style={{ padding: 'clamp(40px,4.2vw,80px) 0' }}>
        <div className="ul-inner-container">
          <div className="ul-section-heading" style={{ justifyContent: 'center', textAlign: 'center', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
            <span className="ul-section-sub-title">{config.subtitle || 'Customer Reviews'}</span>
            <h2 className="ul-section-title">{config.title || 'Product Reviews'}</h2>
          </div>

          <Swiper
            modules={[Navigation, Autoplay, Pagination]}
            spaceBetween={30}
            slidesPerView={2}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000 }}
            loop={testimonials.length > 2}
            breakpoints={{ 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 } }}
            style={{ paddingBottom: 50 }}
          >
            {testimonials.map(t => (
              <SwiperSlide key={t._id}>
                <div style={{
                  background: '#fff', borderRadius: 20, padding: 'clamp(20px,1.58vw,30px)',
                  boxShadow: '0 4px 30px rgba(0,0,0,0.06)', height: '100%',
                }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <i key={i} className={`bi ${i < t.rating ? 'bi-star-fill' : 'bi-star'}`}
                        style={{ color: i < t.rating ? '#FFA31A' : '#ddd', fontSize: 14 }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 'clamp(14px,0.84vw,16px)', color: '#444', marginBottom: 20, lineHeight: 1.7 }}>
                    "{t.content}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {t.avatar && (
                      <img src={t.avatar} alt={t.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'clamp(15px,0.84vw,16px)' }}>{t.name}</div>
                      {t.role && <div style={{ fontSize: 13, color: '#999' }}>{t.role}</div>}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
    </div>
  );
}

// ─── NEWSLETTER ───────────────────────────────────────────────────
export function NewsletterSection() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Thank you for subscribing!');
    setEmail('');
  };

  return (
    <div className="ul-container">
      <section className="ul-nwsltr-subs" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&h=600&fit=crop')" }}>
        <div className="ul-inner-container">
          <div className="ul-section-heading justify-content-center text-center">
            <div>
              <span className="ul-section-sub-title text-white">GET NEWSLETTER</span>
              <h2 className="ul-section-title text-white">Sign Up to Newsletter</h2>
            </div>
          </div>
          <div className="ul-nwsltr-subs-form-wrapper">
            <div className="icon"><i className="bi bi-send"></i></div>
            <form className="ul-nwsltr-subs-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Enter Your Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <button type="submit">
                SUBSCRIBE NOW <i className="bi bi-arrow-up-right"></i>
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}


// ─── BLOG ─────────────────────────────────────────────────────────
export function BlogSection({ config = {} }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.get('/blog?limit=3').then(r => setPosts(r.data.data)).catch(() => {});
  }, []);

  return (
    <div className="ul-container">
      <section style={{ margin: 'clamp(40px,4.2vw,80px) 0' }}>
        <div className="ul-inner-container">
          <div className="ul-section-heading">
            <div>
              <span className="ul-section-sub-title">{config.subtitle || 'News & Blog'}</span>
              <h2 className="ul-section-title">{config.title || 'Explore Our Blogs'}</h2>
            </div>
            <Link to="/blog" className="ul-btn">
              View All <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          <div className="row row-cols-md-3 row-cols-sm-2 row-cols-1 ul-bs-row">
            {posts.map(post => (
              <div key={post._id} className="col">
                <article style={{ borderRadius: 20, overflow: 'hidden', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  {post.image && (
                    <Link to={`/blog/${post.slug}`}>
                      <div style={{ overflow: 'hidden', aspectRatio: '4/3' }}>
                        <img
                          src={post.image}
                          alt={post.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.4s ease' }}
                          onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                        />
                      </div>
                    </Link>
                  )}
                  <div style={{ padding: 'clamp(15px,1.58vw,25px)' }}>
                    {post.category && (
                      <span style={{ color: '#EF2853', fontSize: 12, textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 500 }}>
                        {post.category}
                      </span>
                    )}
                    <h3 style={{ fontWeight: 600, fontSize: 'clamp(16px,1.05vw,20px)', lineHeight: 1.3, margin: '8px 0 12px' }}>
                      <Link to={`/blog/${post.slug}`} style={{ color: '#000' }}>{post.title}</Link>
                    </h3>
                    {post.excerpt && (
                      <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 16 }}>
                        {post.excerpt.substring(0, 100)}...
                      </p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#999' }}>
                      <span>
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                      </span>
                      <Link to={`/blog/${post.slug}`} style={{ color: '#EF2853', fontWeight: 500 }}>
                        Read More <i className="bi bi-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── INSTAGRAM GALLERY ────────────────────────────────────────────
export function GallerySection({ config = {} }) {
  const defaultImages = [
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&h=400&fit=crop',
  ];
  const images = (config.images && config.images.length) ? config.images : defaultImages;

  // Duplicate: render set A + set B side by side.
  // Animate: slide the track left by exactly 50% (= one full set width).
  // Shape: use position within ONE set (pos % images.length % 2) so both
  //        set A and set B have identical square-circle-square-circle pattern —
  //        the loop snap is invisible because the pattern matches perfectly.
  const doubled = [...images, ...images];

  return (
    <div className="ul-gallery overflow-hidden mx-auto">
      <div className="ul-gallery-marquee-track" style={{ '--set-count': 2 }}>
        {doubled.map((img, i) => {
          const posInSet = i % images.length;
          const isCircle = posInSet % 2 === 1;
          return (
            <div
              key={i}
              className="ul-gallery-item"
              style={{ borderRadius: isCircle ? '999px' : 'clamp(10px, 1.05vw, 20px)' }}
            >
              <img src={img} alt={`Gallery ${i + 1}`} />
              <div className="ul-gallery-item-btn-wrapper">
                <a href={img} target="_blank" rel="noreferrer">
                  <i className="bi bi-instagram"></i>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
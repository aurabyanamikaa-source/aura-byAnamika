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
    <div className="ul-container">
      <section style={{ margin: 'clamp(40px,4.2vw,80px) 0' }}>
        <div className="ul-inner-container">
          <div className="ul-section-heading" style={{ flexWrap: 'wrap', gap: 20 }}>
            <div>
              <span className="ul-section-sub-title">{config.subtitle || 'New Collection'}</span>
              <h2 className="ul-section-title">{config.title || 'Trending Flash Sell'}</h2>
            </div>
            {/* Countdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {[
                { num: pad(timeLeft.days), label: 'DAYS' },
                { num: pad(timeLeft.hours), label: 'HRS' },
                { num: pad(timeLeft.minutes), label: 'MINS' },
                { num: pad(timeLeft.seconds), label: 'SECS' },
              ].map((t, i) => (
                <React.Fragment key={t.label}>
                  <div className="countdown-box">
                    <span className="num">{t.num}</span>
                    <span className="label">{t.label}</span>
                  </div>
                  {i < 3 && <span className="countdown-sep">:</span>}
                </React.Fragment>
              ))}
            </div>
            <Link to="/shop?onSale=true" className="ul-btn">
              View All <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={30}
            slidesPerView={4}
            navigation
            autoplay={{ delay: 2500, disableOnInteraction: false }}
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
    <section className="ul-newsletter" style={{
      background: 'linear-gradient(90deg, #EF2853 0%, #FFA31A 100%)',
      padding: 'clamp(40px,4.2vw,80px) 0',
      margin: 'clamp(40px,4.2vw,80px) 0',
      borderRadius: 'clamp(15px,2.1vw,40px)',
    }}>
      <div className="ul-container">
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, letterSpacing: '3px', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
            GET NEWSLETTER
          </span>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 'clamp(24px,2.1vw,40px)', marginBottom: 30, letterSpacing: '-0.02em' }}>
            Sign Up to Newsletter
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 0, borderRadius: 999, overflow: 'hidden', background: '#fff', maxWidth: 500, margin: '0 auto' }}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                flex: 1, border: 'none', padding: '14px 20px',
                fontSize: 14, background: 'transparent',
              }}
            />
            <button type="submit" style={{
              background: '#000', color: '#fff', padding: '0 24px',
              border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
              textTransform: 'uppercase', letterSpacing: 1,
              transition: '0.3s',
            }}>
              Subscribe
            </button>
          </form>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 16 }}>
            Get early access to exclusive deals and new arrivals. No spam, unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
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
  const images = config.images || Array(8).fill('https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&h=300&fit=crop');

  return (
    <section style={{ margin: 'clamp(40px,4.2vw,80px) 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <span className="ul-section-sub-title">{config.subtitle || 'Follow Us'}</span>
        <h2 className="ul-section-title">{config.title || 'Follow Us @glamics'}</h2>
      </div>
      <Swiper
        modules={[Autoplay]}
        spaceBetween={10}
        slidesPerView={5}
        loop
        autoplay={{ delay: 0, disableOnInteraction: false }}
        speed={3000}
        breakpoints={{
          0: { slidesPerView: 2 },
          480: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1200: { slidesPerView: 6 },
        }}
      >
        {images.concat(images).map((img, i) => (
          <SwiperSlide key={i}>
            <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '1/1' }}>
              <img src={img} alt={`Gallery ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(239,40,83,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: '0.3s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
              >
                <i className="bi bi-instagram" style={{ color: '#fff', fontSize: 28 }}></i>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaSearch, 
  FaUser, 
  FaHeart, 
  FaShoppingCart, 
  FaBars, 
  FaEnvelope, 
  FaFacebookF, 
  FaTwitter, 
  FaLinkedinIn, 
  FaInstagram, 
  FaYoutube, 
  FaChevronDown, 
  FaPaperPlane, 
  FaBox, 
  FaShieldAlt, 
  FaTimes, 
  FaApple, 
  FaPlay, 
  FaTh,
  FaList,
  FaStar,
  FaChevronUp,
  FaRegHeart,
  FaArrowLeft,
  FaEllipsisV,
  FaHome,
  FaGlobe,
  FaHeadset,
  FaFileAlt,
  FaSignOutAlt
} from 'react-icons/fa';
import { BsChatSquareTextFill } from 'react-icons/bs';
import { 
  categories, 
  dealsOffers, 
  homeOutdoor, 
  consumerElectronics, 
  recommendedItems, 
  extraServices, 
  suppliers,
  filterCategories,
  filterBrands,
  filterFeatures,
  filterConditions,
  listingProducts
} from './data';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';

const getNumericPrice = (p) => {
  if (typeof p === 'number') return p;
  if (!p) return 0;
  const clean = String(p).replace('$', '').split('-')[0].trim();
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
};

const getProductBrand = (product) => {
  if (product.brand) return product.brand;
  const name = (product.name || product.title || '').toLowerCase();
  if (name.includes('gopro')) return 'GoPro';
  if (name.includes('apple') || name.includes('iphone') || name.includes('watch')) return 'Apple';
  if (name.includes('samsung')) return 'Samsung';
  if (name.includes('huawei')) return 'Huawei';
  if (name.includes('pocco')) return 'Pocco';
  if (name.includes('canon')) return 'Canon';
  if (name.includes('intel') || name.includes('laptop')) return 'Intel';
  if (name.includes('resort') || name.includes('shirt') || name.includes('jacket') || name.includes('jeans')) return 'FashionCo';
  if (name.includes('chair') || name.includes('espresso') || name.includes('blender') || name.includes('coffee')) return 'HomeStyle';
  if (name.includes('tennis') || name.includes('soccer') || name.includes('ball') || name.includes('shoes')) return 'SportsOut';
  if (name.includes('wallet') || name.includes('sunglasses') || name.includes('backpack')) return 'TravelKit';
  return 'Other';
};

const getProductFeatures = (product) => {
  if (product.features && product.features.length > 0) return product.features;
  const name = (product.name || product.title || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  
  if (category === 'electronics') {
    if (name.includes('watch')) return ['Metallic', 'Super power'];
    if (name.includes('camera')) return ['Metallic', 'Plastic cover'];
    if (name.includes('laptop')) return ['Metallic', '8GB Ram', '16GB Ram', 'Large Memory'];
  }
  if (category === 'clothing') {
    return ['100% Cotton', 'Super power'];
  }
  if (category === 'home & kitchen') {
    return ['Metallic', 'Plastic cover'];
  }
  if (category === 'sports') {
    return ['Metallic', 'Super power'];
  }
  if (category === 'accessories') {
    return ['Leather', 'Plastic cover'];
  }
  return ['Metallic'];
};

function InnerApp() {
    // --- STATE MANAGEMENT ---
  const { 
    user, 
    token, 
    cartItems, 
    addToCart, 
    removeFromCart, 
    updateCartQty, 
    clearCart, 
    cartCount, 
    logout, 
    loading: authLoading 
  } = useAuth();

  const [view, rawSetView] = useState('home'); // 'home' or 'products'
  const [viewLayout, setViewLayout] = useState('list'); // 'list' or 'grid'
  const [products, setProducts] = useState(listingProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Product Detail States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailActiveTab, setDetailActiveTab] = useState('Description');
  const [activeThumbnailIndex, setActiveThumbnailIndex] = useState(0);

  // Function to search/fetch products dynamically from Express API
  const handleSearch = async (query) => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      let response;
      if (!query || query.trim() === '') {
        response = await axios.get(`${apiUrl}/api/products`);
      } else {
        response = await axios.get(`${apiUrl}/api/products/search?q=${encodeURIComponent(query)}`);
      }

      if (response.data && Array.isArray(response.data)) {
        const normalized = response.data.map(item => {
          const title = item.title || item.name || "Product Name";
          return {
            ...item,
            title,
            brand: item.brand || getProductBrand(item),
            features: getProductFeatures(item),
            price: typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : (item.price || "$9.99")
          };
        });
        setProducts(normalized);
      }
    } catch (err) {
      console.error('Failed to search/load products:', err.message);
      setError('Failed to fetch products from backend server. Showing offline catalog.');
    } finally {
      setLoading(false);
    }
  };

  // Initial products fetch on mount
  useEffect(() => {
    handleSearch('');
  }, []);

  // Router sync & custom navigation handlers
  const syncRouteWithUrl = async () => {
    if (authLoading) return;
    const path = window.location.pathname;
    
    if (path.startsWith('/product/')) {
      const parts = path.split('/');
      const productId = parts[parts.length - 1];
      if (productId) {
        try {
          setLoading(true);
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const res = await axios.get(`${apiUrl}/api/products/${productId}`);
          if (res.data) {
            setSelectedProduct({
              ...res.data,
              title: res.data.title || res.data.name || "Product Name",
              price: typeof res.data.price === 'number' ? `$${res.data.price.toFixed(2)}` : (res.data.price || "$9.99")
            });
            rawSetView('detail');
          } else {
            rawSetView('home');
          }
        } catch (err) {
          console.error('Failed to load product from path:', err.message);
          rawSetView('home');
        } finally {
          setLoading(false);
        }
      }
    } else if (path === '/cart') {
      if (!user) {
        window.history.replaceState({ view: 'login' }, '', '/login');
        rawSetView('login');
      } else {
        rawSetView('cart');
      }
    } else if (path === '/profile') {
      if (!user) {
        window.history.replaceState({ view: 'login' }, '', '/login');
        rawSetView('login');
      } else {
        rawSetView('profile');
      }
    } else if (path === '/wishlist') {
      rawSetView('wishlist');
    } else if (path === '/messages') {
      rawSetView('messages');
    } else if (path === '/orders') {
      rawSetView('orders');
    } else if (path === '/settings') {
      rawSetView('settings');
    } else if (path === '/admin') {
      if (!user || user.role !== 'admin') {
        alert('Access denied. Administrator role required.');
        window.history.replaceState({ view: 'home' }, '', '/');
        rawSetView('home');
      } else {
        rawSetView('admin');
      }
    } else if (path === '/login') {
      rawSetView('login');
    } else if (path === '/register') {
      rawSetView('register');
    } else if (path === '/products') {
      rawSetView('products');
    } else {
      rawSetView('home');
    }
  };

  const navigate = (viewName, productId = null) => {
    let path = '/';
    if (viewName === 'products') path = '/products';
    else if (viewName === 'detail' && productId) path = `/product/${productId}`;
    else if (viewName === 'cart') path = '/cart';
    else if (viewName === 'profile') path = '/profile';
    else if (viewName === 'wishlist') path = '/wishlist';
    else if (viewName === 'messages') path = '/messages';
    else if (viewName === 'orders') path = '/orders';
    else if (viewName === 'settings') path = '/settings';
    else if (viewName === 'login') path = '/login';
    else if (viewName === 'register') path = '/register';
    else if (viewName === 'admin') path = '/admin';
    
    if (viewName === 'cart' && !user) {
      window.history.pushState({ view: 'login' }, '', '/login');
      rawSetView('login');
      return;
    }
    if (viewName === 'profile' && !user) {
      window.history.pushState({ view: 'login' }, '', '/login');
      rawSetView('login');
      return;
    }
    if (viewName === 'admin' && (!user || user.role !== 'admin')) {
      alert('Access denied. Administrator role required.');
      window.history.pushState({ view: 'home' }, '', '/');
      rawSetView('home');
      return;
    }
    
    window.history.pushState({ view: viewName, productId }, '', path);
    rawSetView(viewName);
  };

  const setView = (viewName, productId = null) => {
    navigate(viewName, productId);
  };

  // Options popover menu state for cart items on mobile
  const handleToggleItemMenu = (id) => {
    setActiveItemMenuId(activeItemMenuId === id ? null : id);
  };

  // Sync route on popstate back/forward action
  useEffect(() => {
    const handlePopState = () => {
      syncRouteWithUrl();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user, authLoading]);

  // Sync route on mount and when authentication finishes loading
  useEffect(() => {
    syncRouteWithUrl();
  }, [user, authLoading]);

  // Mobile viewport detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Options popover menu state for cart items on mobile
  const [activeItemMenuId, setActiveItemMenuId] = useState(null);
  useEffect(() => {
    if (activeItemMenuId === null) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.options-menu-btn') && !e.target.closest('.options-menu-popover')) {
        setActiveItemMenuId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [activeItemMenuId]);
  
  // Sidebar Collapse/Accordion States
  const [collapseCategory, setCollapseCategory] = useState(false);
  const [collapseBrands, setCollapseBrands] = useState(false);
  const [collapseFeatures, setCollapseFeatures] = useState(false);
  const [collapsePrice, setCollapsePrice] = useState(false);
  const [collapseCondition, setCollapseCondition] = useState(false);
  const [collapseRatings, setCollapseRatings] = useState(false);
  const [collapseManufacturer, setCollapseManufacturer] = useState(true);

  // Filter Values
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sliderMin, setSliderMin] = useState(250);
  const [sliderMax, setSliderMax] = useState(750);
  const [priceRangeFilter, setPriceRangeFilter] = useState({ min: '', max: '' });
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectedCondition, setSelectedCondition] = useState('Any');
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedManufacturers, setSelectedManufacturers] = useState([]);
  const [sortBy, setSortBy] = useState('Featured');
  
  // Wishlist state loaded from LocalStorage
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Sync wishlist to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to sync wishlist to localStorage:', e);
    }
  }, [wishlist]);

  // Clear wishlist on logout
  useEffect(() => {
    if (!user) {
      setWishlist([]);
      localStorage.removeItem('wishlist');
    }
  }, [user]);

  // Pagination state
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All category');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  // Mobile Nav Drawer
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Language & Currency Dropdowns
  const [language, setLanguage] = useState('English, USD');
  const [shipTo, setShipTo] = useState('Germany');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [shipDropdownOpen, setShipDropdownOpen] = useState(false);

  // Inquiry Form State
  const [inquiryForm, setInquiryForm] = useState({
    itemName: '',
    details: '',
    quantity: '',
    unit: 'Pcs'
  });
      const [inquirySubmitted, setInquirySubmitted] = useState(false);

  // Cart state managed by AuthContext

  const [savedItems, setSavedItems] = useState([
    {
      id: 101,
      title: "GoPro HERO6 4K Action Camera - Black",
      price: 99.50,
      image: "/smartphones_electronics.png"
    },
    {
      id: 102,
      title: "GoPro HERO6 4K Action Camera - Black",
      price: 99.50,
      image: "/deal_phone.png"
    },
    {
      id: 103,
      title: "GoPro HERO6 4K Action Camera - Black",
      price: 99.50,
      image: "/recommended_smartwatch.png"
    },
    {
      id: 104,
      title: "GoPro HERO6 4K Action Camera - Black",
      price: 99.50,
      image: "/laptop_electronics.png"
    }
  ]);

  const [couponInput, setCouponInput] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Reset scroll position to top on view changes, product changes, and page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view, selectedProduct, currentPage]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.profile-dropdown-trigger') && !e.target.closest('.profile-dropdown-menu')) {
        setProfileDropdownOpen(false);
      }
      if (!e.target.closest('.category-dropdown-trigger') && !e.target.closest('.category-dropdown-menu')) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleQtyChange = (id, newQty) => {
    updateCartQty(id, parseInt(newQty, 10));
  };

  const handleRemoveCartItem = (id) => {
    removeFromCart(id);
  };

  const handleSaveForLater = (item) => {
    removeFromCart(item.id);
    if (!savedItems.some(x => x.id === item.id)) {
      setSavedItems([...savedItems, {
        id: item.id,
        title: item.title,
        price: item.price,
        image: item.image
      }]);
    }
  };

  const handleMoveToCart = (item) => {
    setSavedItems(savedItems.filter(x => x.id !== item.id));
    addToCart(item);
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponInput.toUpperCase() === 'SAVE60') {
      setDiscountAmount(60.00);
      alert('Coupon SAVE60 applied successfully! $60.00 discount subtracted.');
    } else {
      alert('Invalid coupon. Try SAVE60');
    }
  };

  const handleRemoveAllCart = () => {
    clearCart();
  };

  const handleAddToCartDirect = (product) => {
    if (!product) return;
    const titleVal = product.title || product.name || product.description || "Product Name";
    let priceVal = 99.50;
    if (product.price) {
      const cleanPrice = String(product.price).replace('$', '').split('-')[0].trim();
      const parsed = parseFloat(cleanPrice);
      if (!isNaN(parsed)) {
        priceVal = parsed;
      }
    }

    addToCart({
      ...product,
      title: titleVal,
      price: priceVal
    });
    navigate('cart');
  };

  const handleProductClick = async (item) => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiUrl}/api/products/${item.id}`);
      if (response.data) {
        const normalized = {
          ...response.data,
          title: response.data.title || response.data.name || "Product Name",
          price: typeof response.data.price === 'number' ? `$${response.data.price.toFixed(2)}` : (response.data.price || "$9.99")
        };
        setSelectedProduct(normalized);
        setActiveThumbnailIndex(0);
        setDetailActiveTab('Description');
        rawSetView('detail');
        window.history.pushState({ view: 'detail', productId: item.id }, '', `/product/${item.id}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Failed to fetch details from server API:', err.message);
      const productDetail = {
        id: item.id || 1,
        title: item.title || item.name || "Product Name",
        price: item.price ? (String(item.price).startsWith('$') ? String(item.price) : `$${item.price}`) : "$99.50",
        originalPrice: item.originalPrice || null,
        rating: item.rating || 7.5,
        orders: item.orders || 154,
        shipping: item.shipping || "Free Shipping",
        brand: item.brand || "Brand Name",
        manufacturer: item.manufacturer || "Manufacturer Name",
        features: item.features || ["Metallic", "Super power"],
        description: item.description || "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        image: item.image || "/deal_phone.png"
      };
      setSelectedProduct(productDetail);
      setActiveThumbnailIndex(0);
      setDetailActiveTab('Description');
      rawSetView('detail');
      window.history.pushState({ view: 'detail', productId: item.id }, '', `/product/${item.id}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const isProductClothing = (product) => {
    if (!product) return false;
    const text = (product.title + " " + product.description).toLowerCase();
    return text.includes('shirt') || 
           text.includes('coat') || 
           text.includes('blazer') || 
           text.includes('clothing') || 
           text.includes('jean') || 
           text.includes('jacket') || 
           text.includes('wear') || 
           text.includes('polo') ||
           text.includes('socks') ||
           text.includes('t-shirt') ||
           text.includes('blazers');
  };

  // 5 high-fidelity clothing mocks for "You may like"
  const clothingYouMayLike = [
    { id: 101, title: "Men Blazers Sets Elegant Formal", price: "$7.00 - $99.50", image: "/recommended_coat.png" },
    { id: 102, title: "Men Shirt Sleeve Polo Contrast", price: "$7.00 - $99.50", image: "/recommended_tshirt.png" },
    { id: 103, title: "Apple Watch Series Space Gray", price: "$7.00 - $99.50", image: "/deal_smartwatch.png" },
    { id: 104, title: "Basketball Crew Socks Long Stuff", price: "$7.00 - $99.50", image: "/recommended_jeans.jpg" },
    { id: 105, title: "New Summer Men's castrol T-Shirts", price: "$7.00 - $99.50", image: "/recommended_tshirt.png" }
  ];

  // 5 high-fidelity non-clothing mocks for "You may like"
  const nonClothingYouMayLike = [
    { id: 201, title: "GoPro HERO6 4K Action Camera", price: "$99.50 - $150.00", image: "/camera_electronics.png" },
    { id: 202, title: "Laptops Intel Core i7 16GB RAM", price: "$799.00 - $1128.00", image: "/laptop_electronics.png" },
    { id: 203, title: "Smartphones 5G Dual SIM Android", price: "$299.00 - $499.00", image: "/smartphones_electronics.png" },
    { id: 204, title: "Gaming Headset with Surround Mic", price: "$49.99 - $89.99", image: "/recommended_headset.png" },
    { id: 205, title: "Smart Watch silver color modern", price: "$10.30 - $24.00", image: "/recommended_smartwatch.png" }
  ];

  // Countdown Timer State (Target: 4 days, 13 hours, 34 mins, 56 secs from load)
  const [timeLeft, setTimeLeft] = useState({
    days: 4,
    hours: 13,
    minutes: 34,
    seconds: 56
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        } else {
          clearInterval(timer);
          return prev;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Form submit handler
  const handleInquirySubmit = (e) => {
    e.preventDefault();
    if (!inquiryForm.itemName || !inquiryForm.quantity) {
      alert('Please fill out the item name and quantity.');
      return;
    }
    setInquirySubmitted(true);
    setTimeout(() => {
    setInquirySubmitted(false);
      setInquiryForm({ itemName: '', details: '', quantity: '', unit: 'Pcs' });
    }, 5000);
    };

  // Dynamically extract unique categories, brands, and features based on current loaded products
  const dynamicCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  const dynamicBrands = Array.from(new Set(products.map(p => p.brand || getProductBrand(p)).filter(Boolean)));
  const dynamicFeatures = Array.from(new Set(products.flatMap(p => p.features || getProductFeatures(p)).filter(Boolean)));

  // Filter products for listing page based on sidebar filters, verified check, price range, and search
  const filteredProducts = products.filter(product => {
    // 1. Search Query filter (matches title/name, description, or category)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const title = (product.title || product.name || '').toLowerCase();
      const desc = (product.description || '').toLowerCase();
      const cat = (product.category || '').toLowerCase();
      if (!title.includes(q) && !desc.includes(q) && !cat.includes(q)) {
        return false;
      }
    }

    // 2. Category selection filter (compares dynamically with product.category)
    if (selectedCategory !== 'All category') {
      if ((product.category || '').toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
    }

    // 3. Brands selection filter
    if (selectedBrands.length > 0) {
      const matched = selectedBrands.some(brand => 
        (product.brand || getProductBrand(product) || '').toLowerCase() === brand.toLowerCase()
      );
      if (!matched) return false;
    }

    // 4. Features selection filter
    if (selectedFeatures.length > 0) {
      const productFeats = product.features || getProductFeatures(product) || [];
      const matched = selectedFeatures.some(feat => 
        productFeats.some(f => f.toLowerCase() === feat.toLowerCase())
      );
      if (!matched) return false;
    }

    // 5. Price range filter
    if (priceRangeFilter.min !== '') {
      const priceVal = getNumericPrice(product.price);
      if (priceVal < parseFloat(priceRangeFilter.min)) return false;
    }
    if (priceRangeFilter.max !== '') {
      const priceVal = getNumericPrice(product.price);
      if (priceVal > parseFloat(priceRangeFilter.max)) return false;
    }

    // 6. Condition filter
    if (selectedCondition !== 'Any') {
      const condLower = selectedCondition.toLowerCase();
      if (condLower === 'refurbed' && (product.id !== 1 && product.id !== 2)) return false;
      if (condLower === 'brand new' && (product.id !== 3 && product.id !== 4)) return false;
      if (condLower === 'old items' && (product.id !== 5 && product.id !== 6)) return false;
    }

    // 7. Ratings filter
    if (selectedRatings.length > 0) {
      const productStars = Math.round(product.rating / 2);
      const minStarsSelected = Math.min(...selectedRatings);
      if (productStars < minStarsSelected) return false;
    }

        // 8. Verified Only filter
    if (verifiedOnly && product.id % 2 === 0) {
      return false;
    }

        // 9. Manufacturer filter
    if (selectedManufacturers.length > 0) {
      const matched = selectedManufacturers.some(m => 
        product.manufacturer && product.manufacturer.toLowerCase() === m.toLowerCase()
      );
      if (!matched) return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = getNumericPrice(a.price);
    const priceB = getNumericPrice(b.price);
    if (sortBy === 'Price: Low to High') return priceA - priceB;
    if (sortBy === 'Price: High to Low') return priceB - priceA;
    return a.id - b.id;
  });

  return (
    <div className="min-h-screen bg-brand-bg text-[#1C1C1C] font-sans antialiased">
      
      {/* ---------------- 1. TOP HEADER BAR ---------------- */}
      {isMobile && view === 'cart' ? (
        <header className="bg-white border-b border-[#DEE2E7] sticky top-0 z-50 px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => setView('products')} 
            className="text-xl text-[#1C1C1C] hover:opacity-80 transition-opacity focus:outline-none flex items-center justify-center w-8 h-8"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-xl font-bold text-[#1C1C1C] tracking-tight">Shopping cart</h1>
        </header>
      ) : (
        <header className="bg-white border-b border-brand-border sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex items-center justify-between gap-4">
          
                                        {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0 cursor-pointer" onClick={() => setView('home')}>
            <img 
              src="/logo.png" 
              alt="Brand Logo" 
              className="w-10 h-10 object-contain flex-shrink-0" 
            />
            <span className="text-2xl font-bold text-brand-blue tracking-tight">Brand</span>
          </div>

          {/* Search Bar (Desktop) - Unified double border container */}
          <div className="hidden md:flex flex-grow max-w-[660px] items-center h-10 bg-white">
            <input 
              type="text" 
              placeholder="Search" 
              className="px-4 py-2 flex-grow outline-none text-sm text-[#1C1C1C] border-2 border-brand-blue rounded-l-lg h-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchQuery);
                  setView('products');
                }
              }}
            />
            {/* Category Dropdown */}
            <div className="relative border-t-2 border-b-2 border-r-2 border-brand-blue h-full flex items-center px-4 bg-white text-sm text-[#1C1C1C] cursor-pointer category-dropdown-trigger" onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}>
              <span className="mr-3 select-none text-[#1C1C1C]">{selectedCategory}</span>
              <FaChevronDown className="text-gray-400 text-xs" />
              {categoryDropdownOpen && (
                <div className="absolute top-11 right-0 bg-white border border-brand-border rounded-md shadow-lg py-1 w-48 z-10 category-dropdown-menu">
                  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => { setSelectedCategory('All category'); setCategoryDropdownOpen(false); handleSearch(''); setView('products'); }}>All category</div>
                  {dynamicCategories.map((cat, idx) => (
                    <div key={idx} className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => { setSelectedCategory(cat); setCategoryDropdownOpen(false); handleSearch(cat); setView('products'); }}>{cat}</div>
                  ))}
                </div>
              )}
            </div>
            {/* Search Button */}
            <button 
              className="bg-brand-blue hover:bg-[#0f6fd6] text-white px-8 h-full font-semibold transition-colors text-sm rounded-r-lg"
              onClick={() => {
                handleSearch(searchQuery);
                setView('products');
              }}
            >
              Search
            </button>
          </div>

                    {/* User Actions (Desktop/Mobile Icons) */}
          <div className="flex items-center gap-6 text-brand-gray relative">
            <div className="flex flex-col items-center md:relative">
              <div 
                onClick={(e) => {
                  if (user) {
                    e.stopPropagation();
                    setProfileDropdownOpen(!profileDropdownOpen);
                  } else {
                    navigate('login');
                  }
                }}
                className="flex flex-col items-center cursor-pointer hover:text-brand-blue transition-colors profile-dropdown-trigger"
              >
                <FaUser className="text-xl" />
                <span className="text-xs hidden md:block mt-1.5 font-normal">
                  {user ? user.name.split(' ')[0] : 'Sign In'}
                </span>
              </div>
              
              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-[#DEE2E7] rounded-lg shadow-lg py-0 z-50 overflow-hidden profile-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                  {user ? (
                    <div className="flex flex-col">
                      {/* User display */}
                      <div className="px-4 py-3 border-b border-[#EFF2F4] bg-[#F7FAFC]">
                        <p className="text-sm font-semibold text-[#1C1C1C] truncate">{user.name}</p>
                        <p className="text-xs text-[#8B96A5] truncate mt-0.5">{user.email || 'user@example.com'}</p>
                      </div>
                      {/* Navigation links */}
                      <div className="py-1">
                        {user.role === 'admin' && (
                          <button 
                            onClick={() => { navigate('admin'); setProfileDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-xs text-[#0D6EFD] hover:bg-gray-50 font-bold flex items-center gap-2"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            </svg>
                            Admin Panel
                          </button>
                        )}
                        <button 
                          onClick={() => { navigate('profile'); setProfileDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-xs text-[#505050] hover:bg-gray-50 font-medium flex items-center gap-2"
                        >
                          <FaUser className="text-[#8B96A5] text-[10px]" />
                          My Profile
                        </button>
                        <button 
                          onClick={() => { navigate('orders'); setProfileDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-xs text-[#505050] hover:bg-gray-50 font-medium flex items-center gap-2"
                        >
                          <svg className="w-3.5 h-3.5 text-[#8B96A5]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          My Orders
                        </button>
                        <button 
                          onClick={() => { navigate('wishlist'); setProfileDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-xs text-[#505050] hover:bg-gray-50 font-medium flex items-center gap-2"
                        >
                          <FaHeart className="text-[#8B96A5] text-[10px]" />
                          My Wishlist
                        </button>
                        <button 
                          onClick={() => { navigate('settings'); setProfileDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-xs text-[#505050] hover:bg-gray-50 font-medium flex items-center gap-2"
                        >
                          <svg className="w-3.5 h-3.5 text-[#8B96A5]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Settings
                        </button>
                      </div>
                      {/* Logout button */}
                      <div className="border-t border-[#EFF2F4]">
                        <button 
                          onClick={() => { logout(); navigate('home'); setProfileDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-xs text-[#FA3434] hover:bg-red-50 font-bold flex items-center gap-2 transition-colors"
                        >
                          <FaSignOutAlt />
                          Logout
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-1">
                      <button 
                        onClick={() => { navigate('login'); setProfileDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs text-[#0D6EFD] hover:bg-gray-50 font-semibold"
                      >
                        Login
                      </button>
                      <button 
                        onClick={() => { navigate('register'); setProfileDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs text-[#505050] hover:bg-gray-50 font-semibold"
                      >
                        Register
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div onClick={() => navigate('messages')} className="flex flex-col items-center cursor-pointer hover:text-brand-blue transition-colors">
              <BsChatSquareTextFill className="text-xl" />
              <span className="text-xs hidden md:block mt-1.5 font-normal">Message</span>
            </div>
            <div onClick={() => navigate('wishlist')} className="flex flex-col items-center cursor-pointer hover:text-brand-blue transition-colors relative">
              <FaHeart className="text-xl" />
              <span className="text-xs hidden md:block mt-1.5 font-normal">Wishlist</span>
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1 bg-red-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </div>
                        <div onClick={() => setView('cart')} className="flex flex-col items-center cursor-pointer hover:text-brand-blue transition-colors relative">
              <FaShoppingCart className="text-xl" />
              <span className="text-xs hidden md:block mt-1.5 font-normal">My cart</span>
              {cartItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1 bg-green-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                  {cartItems.reduce((acc, curr) => acc + curr.qty, 0)}
                </span>
              )}
            </div>
            {/* Hamburger (Mobile) */}
            <button 
              className="md:hidden text-2xl text-[#1C1C1C]"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <FaBars />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-3">
          <div className="flex items-center border border-brand-border rounded-lg overflow-hidden h-10 bg-[#F7F7F7]">
            <FaSearch className="text-gray-400 ml-3 mr-2" />
                        <input 
              type="text" 
              placeholder="Search" 
              className="bg-transparent flex-grow outline-none text-sm py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchQuery);
                  setView('products');
                }
              }}
            />
          </div>
        </div>
      </header>
      )}

      {/* ---------------- 2. NAVIGATION BAR ---------------- */}
      <nav className="bg-white border-b border-brand-border py-3 hidden md:block">
        <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between text-sm font-medium">
          
          {/* Left links */}
          <div className="flex items-center gap-6">
                        <button className="flex items-center gap-2 text-[#1C1C1C] hover:text-brand-blue" onClick={() => setView('products')}>
              <FaBars />
              <span>All category</span>
            </button>
            <a href="#" className="text-[#1C1C1C] hover:text-brand-blue">Hot offers</a>
            <a href="#" className="text-[#1C1C1C] hover:text-brand-blue">Gift boxes</a>
            <a href="#" className="text-[#1C1C1C] hover:text-brand-blue">Projects</a>
            <a href="#" className="text-[#1C1C1C] hover:text-brand-blue">Menu item</a>
            <a href="#" className="text-[#1C1C1C] hover:text-brand-blue">Help</a>
          </div>

          {/* Right Selectors */}
          <div className="flex items-center gap-6">
            {/* Language/Currency selector */}
            <div className="relative">
              <button 
                className="flex items-center gap-1.5 hover:text-brand-blue"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              >
                <span>{language}</span>
                <FaChevronDown className="text-xs text-gray-400" />
              </button>
              {langDropdownOpen && (
                <div className="absolute top-7 right-0 bg-white border border-brand-border rounded-md shadow-lg py-1 w-36 z-20">
                  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => { setLanguage('English, USD'); setLangDropdownOpen(false); }}>English, USD</div>
                  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => { setLanguage('Deutsch, EUR'); setLangDropdownOpen(false); }}>Deutsch, EUR</div>
                  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => { setLanguage('Français, EUR'); setLangDropdownOpen(false); }}>Français, EUR</div>
                </div>
              )}
            </div>

                        {/* Ship to Selector */}
            <div className="relative">
              <button 
                className="flex items-center gap-1.5 hover:text-brand-blue"
                onClick={() => setShipDropdownOpen(!shipDropdownOpen)}
              >
                <span>Ship to</span>
                {shipTo === 'Germany' && (
                  <img src="/flag_germany.png" alt="Germany" className="w-[18px] h-[13px] object-cover rounded-sm shadow-sm flex-shrink-0" />
                )}
                {shipTo === 'United States' && (
                  <img src="/flag_usa.png" alt="USA" className="w-[18px] h-[13px] object-cover rounded-sm shadow-sm flex-shrink-0" />
                )}
                {shipTo === 'China' && (
                  <img src="/flag_china.png" alt="China" className="w-[18px] h-[13px] object-cover rounded-sm shadow-sm flex-shrink-0" />
                )}
                <FaChevronDown className="text-xs text-gray-400" />
              </button>
              {shipDropdownOpen && (
                <div className="absolute top-7 right-0 bg-white border border-brand-border rounded-md shadow-lg py-1 w-36 z-20">
                  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2" onClick={() => { setShipTo('Germany'); setShipDropdownOpen(false); }}>
                    <img src="/flag_germany.png" alt="Germany" className="w-[18px] h-[13px] object-cover rounded-sm shadow-sm flex-shrink-0" /> Germany
                  </div>
                  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2" onClick={() => { setShipTo('United States'); setShipDropdownOpen(false); }}>
                    <img src="/flag_usa.png" alt="USA" className="w-[18px] h-[13px] object-cover rounded-sm shadow-sm flex-shrink-0" /> USA
                  </div>
                  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2" onClick={() => { setShipTo('China'); setShipDropdownOpen(false); }}>
                    <img src="/flag_china.png" alt="China" className="w-[18px] h-[13px] object-cover rounded-sm shadow-sm flex-shrink-0" /> China
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Nav Sidebar/Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}></div>
          
          {/* Drawer Body */}
          <div className="relative w-72 max-w-sm bg-white h-full shadow-xl z-10 flex flex-col overflow-y-auto">
            {/* Top Light Gray-Blue Header Block */}
            <div 
              onClick={() => {
                if (!user) {
                  navigate('login');
                  setIsMobileMenuOpen(false);
                }
              }}
              className="bg-[#EFF2F4] px-5 py-6 border-b border-[#DEE2E7] flex flex-col relative cursor-pointer"
            >
              {/* Close Button on Top Right */}
              <button 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileMenuOpen(false);
                }}
              >
                <FaTimes className="text-gray-400 text-base" />
              </button>

              {/* Silhouette Avatar */}
              <div className="w-12 h-12 bg-[#DEE2E7] rounded-full flex items-center justify-center text-white mb-3 overflow-hidden">
                <FaUser className="text-white text-2xl mt-1.5" />
              </div>

              {/* Sign in | Register text */}
              <span className="text-[15px] font-normal text-[#1C1C1C]">
                {user ? `Hi, ${user.name}` : 'Sign in | Register'}
              </span>
            </div>

            {/* Drawer Navigation List */}
            <div className="flex-grow py-2 flex flex-col">
              {/* Group 1 */}
              {user && user.role === 'admin' && (
                <div 
                  onClick={() => { navigate('admin'); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-4 py-3 px-5 text-sm text-[#0D6EFD] hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer border-b border-[#EFF2F4]"
                >
                  <div className="w-5 flex-shrink-0 flex items-center justify-center text-[#0D6EFD]">
                    <FaUser className="text-[15px]" />
                  </div>
                  <span className="font-semibold">Admin Panel</span>
                </div>
              )}
              <div 
                onClick={() => { navigate('home'); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-4 py-3 px-5 text-sm text-[#1C1C1C] hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="w-5 flex-shrink-0 flex items-center justify-center text-[#8B96A5]">
                  <FaHome className="text-[17px]" />
                </div>
                <span>Home</span>
              </div>
              <div 
                onClick={() => { setSelectedCategory('All category'); navigate('products'); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-4 py-3 px-5 text-sm text-[#1C1C1C] hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="w-5 flex-shrink-0 flex items-center justify-center text-[#8B96A5]">
                  <FaList className="text-[15px]" />
                </div>
                <span>Categories</span>
              </div>
              {user && (
                <div 
                  onClick={() => { navigate('profile'); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-4 py-3 px-5 text-sm text-[#1C1C1C] hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="w-5 flex-shrink-0 flex items-center justify-center text-[#8B96A5]">
                    <FaUser className="text-[14px]" />
                  </div>
                  <span>My Profile</span>
                </div>
              )}
              <div 
                onClick={() => { navigate('wishlist'); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-4 py-3 px-5 text-sm text-[#1C1C1C] hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="w-5 flex-shrink-0 flex items-center justify-center text-[#8B96A5]">
                  <FaRegHeart className="text-[16px]" />
                </div>
                <span>Favorites</span>
              </div>
              <div 
                onClick={() => { navigate('orders'); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-4 py-3 px-5 text-sm text-[#1C1C1C] hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="w-5 flex-shrink-0 flex items-center justify-center text-[#8B96A5]">
                  <FaBox className="text-[15px]" />
                </div>
                <span>My orders</span>
              </div>
              {user && (
                <div 
                  onClick={() => { navigate('settings'); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-4 py-3 px-5 text-sm text-[#1C1C1C] hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="w-5 flex-shrink-0 flex items-center justify-center text-[#8B96A5]">
                    <svg className="w-4 h-4 text-[#8B96A5]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span>Settings</span>
                </div>
              )}

              {user && (
                <div 
                  onClick={() => { logout(); navigate('home'); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-4 py-3 px-5 text-sm text-[#FA3434] hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer border-t border-[#EFF2F4] mt-2"
                >
                  <div className="w-5 flex-shrink-0 flex items-center justify-center text-[#FA3434]">
                    <FaSignOutAlt className="text-[15px]" />
                  </div>
                  <span className="font-semibold">Logout</span>
                </div>
              )}

              {/* Divider 1 */}
              <hr className="border-t border-[#EFF2F4] my-2" />

              {/* Group 2 */}
              <div 
                onClick={() => { alert('Language & Currency Settings'); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-4 py-3 px-5 text-sm text-[#1C1C1C] hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="w-5 flex-shrink-0 flex items-center justify-center text-[#8B96A5]">
                  <FaGlobe className="text-[16px]" />
                </div>
                <span>English | USD</span>
              </div>
              <div 
                onClick={() => { alert('Contact us clicked'); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-4 py-3 px-5 text-sm text-[#1C1C1C] hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="w-5 flex-shrink-0 flex items-center justify-center text-[#8B96A5]">
                  <FaHeadset className="text-[16px]" />
                </div>
                <span>Contact us</span>
              </div>
              <div 
                onClick={() => { alert('About clicked'); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-4 py-3 px-5 text-sm text-[#1C1C1C] hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="w-5 flex-shrink-0 flex items-center justify-center text-[#8B96A5]">
                  <FaFileAlt className="text-[16px]" />
                </div>
                <span>About</span>
              </div>

              {/* Divider 2 */}
              <hr className="border-t border-[#EFF2F4] my-2" />

              {/* Group 3 */}
              <div 
                onClick={() => { alert('User agreement clicked'); setIsMobileMenuOpen(false); }}
                className="pl-[56px] pr-5 py-3 text-sm text-[#1C1C1C] hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer block"
              >
                User agreement
              </div>
              <div 
                onClick={() => { alert('Partnership clicked'); setIsMobileMenuOpen(false); }}
                className="pl-[56px] pr-5 py-3 text-sm text-[#1C1C1C] hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer block"
              >
                Partnership
              </div>
              <div 
                onClick={() => { alert('Privacy policy clicked'); setIsMobileMenuOpen(false); }}
                className="pl-[56px] pr-5 py-3 text-sm text-[#1C1C1C] hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer block"
              >
                Privacy policy
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-[1200px] mx-auto px-4 py-5 space-y-6">
        
        {/* Loading Spinner */}
        {loading && (
          <div className="bg-white border border-[#DEE2E7] rounded-lg p-8 flex flex-col items-center justify-center space-y-3 card-shadow">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0D6EFD]"></div>
            <p className="text-sm text-[#8B96A5] font-medium">Fetching dynamic data...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-[#FFF0DF] border border-[#FF9017] rounded-lg p-4 flex items-center justify-between text-sm text-[#D8000C] card-shadow">
            <div className="flex items-center gap-2">
              <span className="font-bold">⚠️ Notice:</span>
              <span>{error}</span>
            </div>
            <button 
              onClick={() => {
                setError(null);
                handleSearch(searchQuery);
              }}
              className="bg-white border border-[#DEE2E7] hover:bg-gray-50 text-[#0D6EFD] font-semibold px-3 py-1 rounded transition-colors text-xs"
            >
              Retry
            </button>
          </div>
        )}

        {view === 'home' ? (
          <>
            {/* ---------------- 3. HERO SECTION ---------------- */}
            <section className="bg-white border border-brand-border rounded-lg p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 card-shadow">
              
              {/* Left Column: Categories List */}
              <div className="hidden lg:block col-span-1">
                <ul className="space-y-1">
                  {dynamicCategories.map((cat, idx) => (
                    <li key={idx}>
                      <a 
                        href="#" 
                        className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                          idx === 0 && selectedCategory === cat
                            ? 'bg-brand-blueLight text-[#1C1C1C] font-semibold' 
                            : selectedCategory === cat
                            ? 'bg-brand-blueLight text-brand-blue font-semibold'
                            : 'text-[#505050] hover:bg-gray-100 hover:text-[#1C1C1C]'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedCategory(cat);
                          setView('products');
                        }}
                      >
                        {cat}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Center Column: Banner */}
              <div className="col-span-1 lg:col-span-2 rounded-lg relative overflow-hidden min-h-[280px] lg:min-h-full bg-[#9BE0CB] bg-contain bg-right-top bg-no-repeat shadow-sm p-6 sm:p-11 flex flex-col justify-center items-start"
                   style={{ backgroundImage: "url('/banner_headphones.png')" }}>
                <h3 className="text-[#1C1C1C] text-lg sm:text-[28px] font-normal leading-tight">
                  Latest trending
                </h3>
                <h2 className="text-[#1C1C1C] text-2xl sm:text-[32px] font-bold leading-tight mt-1 mb-6">
                  Electronic items
                </h2>
                <a 
                  href="#" 
                  className="bg-white hover:bg-gray-100 text-[#1C1C1C] font-semibold text-sm px-4 py-2.5 rounded-lg shadow-sm transition-all duration-200"
                >
                  Learn more
                </a>
              </div>

              {/* Right Column: User Cards */}
              <div className="col-span-1 flex flex-col sm:flex-row lg:flex-col gap-3">
                {/* Greeting Card */}
                <div className="bg-brand-blueLight rounded-lg p-4 flex-grow flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#A2C7FF] flex items-center justify-center text-white text-lg">
                      <FaUser />
                    </div>
                    <div className="text-sm font-medium text-[#1C1C1C] leading-snug">
                      {user ? (
                        <>
                          Hi, {user.name.split(' ')[0]} <br />
                          {user.role === 'admin' ? 'Administrator' : 'Happy shopping!'}
                        </>
                      ) : (
                        <>
                          Hi, user <br />
                          let's get started
                        </>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {user ? (
                      <>
                        {user.role === 'admin' && (
                          <button 
                            onClick={() => navigate('admin')}
                            className="w-full bg-brand-blue hover:bg-[#0f6fd6] text-white text-xs py-2 rounded-md font-semibold transition-colors"
                          >
                            Admin Panel
                          </button>
                        )}
                        <button 
                          onClick={() => logout()}
                          className="w-full bg-white hover:bg-gray-50 border border-brand-border text-[#FA3434] text-xs py-2 rounded-md font-semibold transition-colors"
                        >
                          Log out
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => navigate('register')}
                          className="w-full bg-brand-blue hover:bg-[#0f6fd6] text-white text-xs py-2 rounded-md font-semibold transition-colors"
                        >
                          Join now
                        </button>
                        <button 
                          onClick={() => navigate('login')}
                          className="w-full bg-white hover:bg-gray-50 border border-brand-border text-brand-blue text-xs py-2 rounded-md font-semibold transition-colors"
                        >
                          Log in
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Discount Card */}
                <div className="bg-brand-orange rounded-lg p-4 flex-grow text-white flex flex-col justify-between min-h-[90px]">
                  <p className="text-xs leading-normal font-medium">
                    Get US $10 off <br /> with a new supplier
                  </p>
                </div>

                {/* Send quotes Card */}
                <div className="bg-[#55BDC3] rounded-lg p-4 flex-grow text-white flex flex-col justify-between min-h-[90px]">
                  <p className="text-xs leading-normal font-medium">
                    Send quotes with supplier <br /> preferences
                  </p>
                </div>
              </div>
            </section>

                        {/* ---------------- 4. DEALS AND OFFERS SECTION ---------------- */}
            <section className="bg-white border border-brand-border rounded-lg flex flex-col lg:flex-row overflow-hidden card-shadow">
              
              {/* Info & Timer Column */}
              <div className="p-4 lg:p-5 flex flex-row lg:flex-col items-center lg:items-start justify-between border-b lg:border-b-0 lg:border-r border-brand-border lg:w-[280px] flex-shrink-0 gap-4">
                <div>
                  <h3 className="text-base lg:text-lg font-bold text-[#1C1C1C] mb-0.5 lg:mb-1">Deals and offers</h3>
                  <p className="text-xs lg:text-sm text-gray-500 font-medium">Electronic equipments</p>
                </div>
                
                {/* Timer Box Grid */}
                <div className="flex gap-1.5 flex-shrink-0">
                  <div className="bg-[#EFF2F4] lg:bg-[#606C80] rounded px-2 py-1 text-center min-w-[42px] lg:min-w-[48px] text-[#8B96A5] lg:text-white">
                    <span className="block text-sm lg:text-base font-bold leading-none text-[#1C1C1C] lg:text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-[9px] lg:text-[10px] opacity-75 font-normal block mt-0.5">Hour</span>
                  </div>
                  <div className="bg-[#EFF2F4] lg:bg-[#606C80] rounded px-2 py-1 text-center min-w-[42px] lg:min-w-[48px] text-[#8B96A5] lg:text-white">
                    <span className="block text-sm lg:text-base font-bold leading-none text-[#1C1C1C] lg:text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-[9px] lg:text-[10px] opacity-75 font-normal block mt-0.5">Min</span>
                  </div>
                  <div className="bg-[#EFF2F4] lg:bg-[#606C80] rounded px-2 py-1 text-center min-w-[42px] lg:min-w-[48px] text-[#8B96A5] lg:text-white">
                    <span className="block text-sm lg:text-base font-bold leading-none text-[#1C1C1C] lg:text-white">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="text-[9px] lg:text-[10px] opacity-75 font-normal block mt-0.5">Sec</span>
                  </div>
                </div>
              </div>

              {/* Desktop-only Deals List */}
              <div className="hidden lg:flex flex-grow overflow-x-auto no-scrollbar divide-x divide-brand-border">
                {dealsOffers.map((item) => (
                  <div key={item.id} onClick={() => handleProductClick(item)} className="min-w-[150px] sm:min-w-[180px] flex-grow flex flex-col items-center justify-center p-5 text-center group cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="h-28 w-28 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200">
                      <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 truncate max-w-full">{item.name}</h4>
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {item.discount}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mobile-only Deals List */}
              <div className="flex lg:hidden overflow-x-auto no-scrollbar divide-x divide-brand-border border-t border-brand-border">
                {/* Product 1: Blazer */}
                <div onClick={() => handleProductClick({ id: 1001, title: "Smart watches", price: "$99.50", image: "/recommended_coat.png" })} 
                     className="min-w-[120px] flex-grow flex flex-col items-center justify-center p-4 text-center group cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="h-20 w-20 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200">
                    <img src="/recommended_coat.png" alt="Smart watches" className="max-h-full max-w-full object-contain" />
                  </div>
                  <h4 className="text-xs font-normal text-[#1C1C1C] mb-1.5 truncate max-w-full">Smart watches</h4>
                  <span className="bg-[#FFE3E3] text-[#FA3434] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    -25%
                  </span>
                </div>
                {/* Product 2: Headphones */}
                <div onClick={() => handleProductClick({ id: 1002, title: "Smart watches", price: "$99.50", image: "/deal_headset.png" })} 
                     className="min-w-[120px] flex-grow flex flex-col items-center justify-center p-4 text-center group cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="h-20 w-20 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200">
                    <img src="/deal_headset.png" alt="Smart watches" className="max-h-full max-w-full object-contain" />
                  </div>
                  <h4 className="text-xs font-normal text-[#1C1C1C] mb-1.5 truncate max-w-full">Smart watches</h4>
                  <span className="bg-[#FFE3E3] text-[#FA3434] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    -25%
                  </span>
                </div>
                {/* Product 3: Laptop */}
                <div onClick={() => handleProductClick({ id: 1003, title: "Smart watches", price: "$99.50", image: "/deal_laptop.png" })} 
                     className="min-w-[120px] flex-grow flex flex-col items-center justify-center p-4 text-center group cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="h-20 w-20 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200">
                    <img src="/deal_laptop.png" alt="Smart watches" className="max-h-full max-w-full object-contain" />
                  </div>
                  <h4 className="text-xs font-normal text-[#1C1C1C] mb-1.5 truncate max-w-full">Smart watches</h4>
                  <span className="bg-[#FFE3E3] text-[#FA3434] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    -25%
                  </span>
                </div>
              </div>
            </section>

                        {/* ---------------- 5. HOME & OUTDOOR BANNER + PRODUCT GRID ---------------- */}
            {/* Desktop Version */}
            <section className="hidden lg:flex bg-white border border-brand-border rounded-lg flex-col lg:flex-row overflow-hidden card-shadow">
              {/* Left promotional banner - horizontally flipped to match reference layout (couch on right, text on left) */}
              <div className="relative p-6 bg-cover bg-center text-[#1C1C1C] flex flex-col justify-between min-h-[200px] lg:w-[280px] flex-shrink-0 scale-x-[-1]" 
                   style={{ backgroundImage: `linear-gradient(rgba(255, 230, 204, 0.45), rgba(255, 230, 204, 0.45)), url('/home_outdoor_banner.png')` }}>
                <div className="scale-x-[-1] flex flex-col justify-between h-full w-full">
                  <div>
                    <h3 className="text-lg font-bold max-w-[140px] leading-tight mb-4">
                      Home and <br /> outdoor
                    </h3>
                    <button className="bg-white hover:bg-gray-50 text-[#1C1C1C] font-semibold text-sm px-4 py-2 rounded-md shadow-sm transition-transform hover:scale-105 duration-200">
                      Source now
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Product Grid */}
              <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-l border-brand-border">
                {homeOutdoor.map((item) => (
                  <div key={item.id} onClick={() => handleProductClick(item)} className="p-4 border-b border-r border-brand-border flex justify-between gap-2 hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="flex flex-col justify-between">
                      <span className="text-sm font-medium text-[#1C1C1C] truncate max-w-[110px]">{item.name}</span>
                      <div className="mt-1">
                        <span className="text-xs text-gray-400 block">From</span>
                        <span className="text-xs text-gray-500 font-semibold">USD {item.price}</span>
                      </div>
                    </div>
                    <div className="w-16 h-16 flex-shrink-0 self-end group-hover:scale-105 transition-transform duration-200">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Mobile Home and Outdoor Section */}
            <section className="lg:hidden bg-white border border-brand-border rounded-lg p-4 card-shadow space-y-3">
              <h3 className="text-base font-bold text-[#1C1C1C]">Home and outdoor</h3>
              
              <div className="grid grid-cols-3 border-t border-b border-brand-border divide-x divide-brand-border py-2">
                {/* Card 1: Rack */}
                <div onClick={() => handleProductClick({ id: 2001, title: "Smart watches", price: "$19.00", image: "/home_appliance.jpg" })}
                     className="flex flex-col items-center justify-between p-2 text-center group cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="h-16 w-16 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200">
                    <img src="/home_appliance.jpg" alt="Smart watches" className="max-h-full max-w-full object-cover rounded-md" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-normal text-[#1C1C1C] block">Smart watches</span>
                    <span className="text-[10px] text-gray-400 block font-normal">From USD 19</span>
                  </div>
                </div>
                {/* Card 2: Empty/Placeholder */}
                <div onClick={() => handleProductClick({ id: 2002, title: "Smart watches", price: "$19.00", image: "" })}
                     className="flex flex-col items-center justify-end p-2 text-center group cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="h-16 w-16 mb-2"></div>
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-normal text-[#1C1C1C] block">Smart watches</span>
                    <span className="text-[10px] text-gray-400 block font-normal">From USD 19</span>
                  </div>
                </div>
                {/* Card 3: Armchair */}
                <div onClick={() => handleProductClick({ id: 2003, title: "Smart watches", price: "$19.00", image: "/soft_chair.png" })}
                     className="flex flex-col items-center justify-between p-2 text-center group cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="h-16 w-16 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200">
                    <img src="/soft_chair.png" alt="Smart watches" className="max-h-full max-w-full object-contain rounded-md" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-normal text-[#1C1C1C] block">Smart watches</span>
                    <span className="text-[10px] text-gray-400 block font-normal">From USD 19</span>
                  </div>
                </div>
              </div>

              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setView('products'); }}
                className="inline-flex items-center gap-1 text-sm text-[#0D6EFD] font-semibold hover:underline"
              >
                <span>Source now</span>
                <span>→</span>
              </a>
            </section>

            {/* ---------------- 6. CONSUMER ELECTRONICS BANNER + PRODUCT GRID ---------------- */}
            {/* Desktop Version */}
            <section className="hidden lg:flex bg-white border border-brand-border rounded-lg flex-col lg:flex-row overflow-hidden card-shadow">
              {/* Left promotional banner */}
              <div className="relative p-6 bg-cover bg-bottom text-[#1C1C1C] flex flex-col justify-between min-h-[200px] lg:w-[280px] flex-shrink-0" 
                   style={{ backgroundImage: "url('/consumer_electronics_banner.png')" }}>
                <div>
                  <h3 className="text-lg font-bold max-w-[150px] leading-tight mb-4 font-sans">
                    Consumer <br /> electronics and <br /> gadgets
                  </h3>
                  <button className="bg-white hover:bg-gray-50 text-[#1C1C1C] font-semibold text-sm px-4 py-2 rounded-md shadow-sm transition-transform hover:scale-105 duration-200">
                    Source now
                  </button>
                </div>
              </div>

              {/* Right Product Grid */}
              <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-l border-brand-border">
                {consumerElectronics.map((item) => (
                  <div key={item.id} onClick={() => handleProductClick(item)} className="p-4 border-b border-r border-brand-border flex justify-between gap-2 hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="flex flex-col justify-between">
                      <span className="text-sm font-medium text-[#1C1C1C] truncate max-w-[110px]">{item.name}</span>
                      <div className="mt-1">
                        <span className="text-xs text-gray-400 block">From</span>
                        <span className="text-xs text-gray-500 font-semibold">USD {item.price}</span>
                      </div>
                    </div>
                    <div className="w-16 h-16 flex-shrink-0 self-end group-hover:scale-105 transition-transform duration-200">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Mobile Consumer Electronics Section */}
            <section className="lg:hidden bg-white border border-brand-border rounded-lg p-4 card-shadow space-y-3">
              <h3 className="text-base font-bold text-[#1C1C1C]">Consumer electronics</h3>
              
              <div className="grid grid-cols-3 border-t border-b border-brand-border divide-x divide-brand-border py-2">
                {/* Card 1: Blue phone */}
                <div onClick={() => handleProductClick({ id: 3001, title: "Smart watches", price: "$19.00", image: "/electric_kettle_iphone.png" })}
                     className="flex flex-col items-center justify-between p-2 text-center group cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="h-16 w-16 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200">
                    <img src="/electric_kettle_iphone.png" alt="Smart watches" className="max-h-full max-w-full object-contain rounded-md" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-normal text-[#1C1C1C] block">Smart watches</span>
                    <span className="text-[10px] text-gray-400 block font-normal">From USD 19</span>
                  </div>
                </div>
                {/* Card 2: Tablet */}
                <div onClick={() => handleProductClick({ id: 3002, title: "Smart watches", price: "$19.00", image: "/smartphones_electronics.png" })}
                     className="flex flex-col items-center justify-between p-2 text-center group cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="h-16 w-16 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200">
                    <img src="/smartphones_electronics.png" alt="Smart watches" className="max-h-full max-w-full object-contain rounded-md" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-normal text-[#1C1C1C] block">Smart watches</span>
                    <span className="text-[10px] text-gray-400 block font-normal">From USD 19</span>
                  </div>
                </div>
                {/* Card 3: Purple phone */}
                <div onClick={() => handleProductClick({ id: 3003, title: "Smart watches", price: "$19.00", image: "/deal_phone.png" })}
                     className="flex flex-col items-center justify-between p-2 text-center group cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="h-16 w-16 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200">
                    <img src="/deal_phone.png" alt="Smart watches" className="max-h-full max-w-full object-contain rounded-md" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-normal text-[#1C1C1C] block">Smart watches</span>
                    <span className="text-[10px] text-gray-400 block font-normal">From USD 19</span>
                  </div>
                </div>
              </div>

              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setView('products'); }}
                className="inline-flex items-center gap-1 text-sm text-[#0D6EFD] font-semibold hover:underline"
              >
                <span>Source now</span>
                <span>→</span>
              </a>
            </section>

            {/* ---------------- 7. SEND INQUIRY / SUPPLIER CTA SECTION ---------------- */}
            <section className="rounded-lg p-6 sm:p-8 text-white flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 relative overflow-hidden card-shadow">
              {/* Warehouse background image horizontally flipped to match perspective */}
              <div className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-x-[-1] z-0"
                   style={{ backgroundImage: "url('/warehouse_bg.jpg')" }}></div>
              {/* Blue-cyan gradient overlay matching Image 2 */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0066FF] via-[#0088FF]/95 to-[#00D5EC]/70 z-0"></div>

              {/* Left Text */}
              <div className="z-10 max-w-[500px] w-full text-left">
                <h2 className="text-xl sm:text-3xl font-bold leading-tight mb-3">
                  An easy way to send requests to all suppliers
                </h2>
                <p className="text-sm sm:text-base text-blue-100 font-normal leading-relaxed hidden lg:block mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt.
                </p>
                {/* Mobile Button - aligned left */}
                <button 
                  onClick={() => alert('Send inquiry popup/form activated!')}
                  className="lg:hidden bg-[#0D6EFD] hover:bg-[#0b5ed7] text-white px-5 py-2.5 rounded-md font-semibold text-sm transition-colors shadow-md mt-2"
                >
                  Send inquiry
                </button>
              </div>

              {/* Right Form Card */}
              <div className="z-10 bg-white rounded-lg p-6 w-full max-w-[490px] text-[#1C1C1C] shadow-lg hidden lg:block">
                <h3 className="text-lg font-bold text-[#1C1C1C] mb-4">Send quote to suppliers</h3>
                
                {inquirySubmitted ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-6 rounded-md text-center">
                    <span className="text-2xl block mb-2">🎉</span>
                    <h4 className="font-bold text-sm mb-1">Inquiry Sent Successfully!</h4>
                    <p className="text-xs text-green-600">Suppliers will contact you with quotes shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    {/* Item Name */}
                    <input 
                      type="text" 
                      placeholder="What item you need?" 
                      className="w-full border border-brand-border rounded px-4 py-2 text-sm outline-none focus:border-brand-blue"
                      value={inquiryForm.itemName}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, itemName: e.target.value })}
                    />
                    
                    {/* Details Textarea */}
                    <textarea 
                      placeholder="Type more details" 
                      rows="3"
                      className="w-full border border-brand-border rounded px-4 py-2 text-sm outline-none focus:border-brand-blue resize-none"
                      value={inquiryForm.details}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, details: e.target.value })}
                    />

                    {/* Quantity and units selection */}
                    <div className="flex gap-3">
                      <input 
                        type="number" 
                        placeholder="Quantity" 
                        className="w-1/2 border border-brand-border rounded px-4 py-2 text-sm outline-none focus:border-brand-blue"
                        value={inquiryForm.quantity}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, quantity: e.target.value })}
                      />
                      <select 
                        className="w-1/2 border border-brand-border rounded px-4 py-2 text-sm outline-none bg-white focus:border-brand-blue cursor-pointer"
                        value={inquiryForm.unit}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, unit: e.target.value })}
                      >
                        <option value="Pcs">Pcs</option>
                        <option value="Litres">Litres</option>
                        <option value="Kg">Kg</option>
                      </select>
                    </div>

                    {/* Submit button */}
                    <button 
                      type="submit" 
                      className="bg-brand-blue hover:bg-[#0f6fd6] text-white px-5 py-2.5 rounded-md font-semibold text-sm transition-colors"
                    >
                      Send inquiry
                    </button>
                  </form>
                )}
              </div>
            </section>

            {/* ---------------- 8. RECOMMENDED ITEMS SECTION ---------------- */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-[#1C1C1C]">Recommended items</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {products.slice(0, 10).map((item) => (
                  <div key={item.id} onClick={() => handleProductClick(item)} className="bg-white border border-brand-border rounded-lg p-4 card-shadow flex flex-col cursor-pointer group hover:shadow-md transition-all duration-200">
                    <div className="h-36 flex items-center justify-center mb-3 flex-shrink-0 overflow-hidden rounded-md bg-[#EEEEEE]">
                      <img src={item.image} alt="product" className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200" />
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-base font-bold text-[#1C1C1C]">{item.price}</span>
                        <p className="text-xs text-[#1C1C1C] font-semibold truncate leading-tight">{item.title}</p>
                        <p className="text-[11px] text-[#8B96A5] font-normal leading-snug line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ---------------- 9. OUR EXTRA SERVICES SECTION ---------------- */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-[#1C1C1C]">Our extra services</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {extraServices.map((service) => (
                  <div key={service.id} className="bg-white border border-brand-border rounded-lg overflow-hidden flex flex-col card-shadow relative">
                    
                    {/* Image panel with grey overlay */}
                    <div className="h-32 bg-cover bg-center relative" style={{ backgroundImage: `url('${service.image}')` }}>
                      <div className="absolute inset-0 bg-[#1C1C1C] opacity-35"></div>
                    </div>

                    {/* Bottom title panel */}
                    <div className="p-4 pt-6 relative bg-white flex-grow">
                      
                      {/* Floating Circular Icon */}
                      <div className="absolute -top-7 right-6 w-12 h-12 rounded-full border-2 border-white bg-[#D1E7FF] flex items-center justify-center text-brand-blue shadow-sm">
                        {service.icon === 'search' && <FaSearch />}
                        {service.icon === 'box' && <FaBox />}
                        {service.icon === 'send' && <FaPaperPlane />}
                        {service.icon === 'shield' && <FaShieldAlt />}
                      </div>

                      <p className="text-sm font-semibold text-[#1C1C1C] pr-10 leading-snug">
                        {service.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ---------------- 10. SUPPLIERS BY REGION SECTION ---------------- */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-[#1C1C1C]">Suppliers by region</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-y-4 gap-x-6">
                {suppliers.map((sup, idx) => (
                  <div key={idx} className="flex items-start gap-3 cursor-pointer group">
                    {sup.flagImg ? (
                      <img 
                        src={sup.flagImg} 
                        alt={sup.country} 
                        className="w-[28px] h-[20px] object-cover group-hover:scale-110 transition-transform duration-200 flex-shrink-0" 
                      />
                    ) : (
                      <span className="text-2xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-200 flex-shrink-0">{sup.flag}</span>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[#1C1C1C] leading-5 group-hover:text-brand-blue transition-colors">
                        {sup.country}
                      </span>
                      <span className="text-xs text-brand-gray mt-0.5">
                        {sup.domain}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
                        </section>
          </>
        ) : view === 'products' ? (
          !isMobile ? (
            /* ---------------- PRODUCT LISTING VIEW (DESKTOP) ---------------- */
          <div className="space-y-4">
            
                                    {/* Breadcrumbs */}
            <div className="hidden lg:flex items-center flex-wrap gap-x-2.5 text-[16px] text-[#8B96A5] font-normal py-3 select-none">
              <span className="hover:text-brand-blue cursor-pointer" onClick={() => setView('home')}>Home</span>
              <span className="text-[#8B96A5] font-light">&gt;</span>
              <span className="hover:text-brand-blue cursor-pointer" onClick={() => setSelectedCategory('All category')}>All category</span>
              {selectedCategory !== 'All category' && (
                <>
                  <span className="text-[#8B96A5] font-light">&gt;</span>
                  <span className="text-[#8B96A5]">{selectedCategory}</span>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              
              {/* Sidebar Filters */}
              <aside className="hidden lg:block col-span-1 bg-white lg:bg-transparent border lg:border-0 border-[#DEE2E7] rounded-lg p-4 lg:p-0 space-y-5 card-shadow lg:shadow-none">
                
                                {/* Categories */}
                <div className="border-t border-[#DEE2E7] first:border-t-0 pt-4 first:pt-0">
                  <button 
                    className="w-full flex items-center justify-between font-semibold text-[16px] text-[#1C1C1C] pb-3"
                    onClick={() => setCollapseCategory(!collapseCategory)}
                  >
                    <span>Category</span>
                    <FaChevronUp className={`text-[#8B96A5] text-[13px] transition-transform duration-200 ${collapseCategory ? 'rotate-180' : ''}`} />
                  </button>
                  {!collapseCategory && (
                    <ul className="space-y-3.5 text-[#505050] text-[16px] font-normal">
                      {dynamicCategories.map((cat, idx) => (
                        <li key={idx}>
                          <a 
                            href="#" 
                            className={`block hover:text-[#0D6EFD] transition-colors ${selectedCategory === cat ? 'text-[#1C1C1C] font-medium' : 'text-[#505050]'}`}
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedCategory(cat);
                            }}
                          >
                            {cat}
                          </a>
                        </li>
                      ))}
                      <li>
                        <a 
                          href="#" 
                          className="text-[#0D6EFD] hover:underline font-normal block"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedCategory('All category');
                          }}
                        >
                          See all
                        </a>
                      </li>
                    </ul>
                  )}
                </div>

                                {/* Brands */}
                <div className="border-t border-[#DEE2E7] pt-4">
                  <button 
                    className="w-full flex items-center justify-between font-semibold text-[16px] text-[#1C1C1C] pb-3"
                    onClick={() => setCollapseBrands(!collapseBrands)}
                  >
                    <span>Brands</span>
                    <FaChevronUp className={`text-[#8B96A5] text-[13px] transition-transform duration-200 ${collapseBrands ? 'rotate-180' : ''}`} />
                  </button>
                  {!collapseBrands && (
                    <div className="space-y-2.5">
                      {dynamicBrands.map((brand, idx) => {
                        const isChecked = selectedBrands.includes(brand);
                        return (
                          <label key={idx} className="flex items-center gap-3 text-sm text-[#1C1C1C] font-normal cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 rounded border-[#C8D1DC] text-brand-blue focus:ring-brand-blue cursor-pointer"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedBrands(selectedBrands.filter(b => b !== brand));
                                } else {
                                  setSelectedBrands([...selectedBrands, brand]);
                                }
                              }}
                            />
                            <span>{brand}</span>
                          </label>
                        );
                      })}
                      <a href="#" className="text-brand-blue hover:underline text-sm font-medium block pt-1">See all</a>
                    </div>
                  )}
                </div>

                                {/* Features */}
                <div className="border-t border-[#DEE2E7] pt-4">
                  <button 
                    className="w-full flex items-center justify-between font-semibold text-[16px] text-[#1C1C1C] pb-3"
                    onClick={() => setCollapseFeatures(!collapseFeatures)}
                  >
                    <span>Features</span>
                    <FaChevronUp className={`text-[#8B96A5] text-[13px] transition-transform duration-200 ${collapseFeatures ? 'rotate-180' : ''}`} />
                  </button>
                  {!collapseFeatures && (
                    <div className="space-y-2.5">
                      {dynamicFeatures.map((feat, idx) => {
                        const isChecked = selectedFeatures.includes(feat);
                        return (
                          <label key={idx} className="flex items-center gap-3 text-sm text-[#1C1C1C] font-normal cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 rounded border-[#C8D1DC] text-brand-blue focus:ring-brand-blue cursor-pointer"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedFeatures(selectedFeatures.filter(f => f !== feat));
                                } else {
                                  setSelectedFeatures([...selectedFeatures, feat]);
                                }
                              }}
                            />
                            <span>{feat}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                                {/* Price range */}
                <div className="border-t border-[#DEE2E7] pt-4">
                  <button 
                    className="w-full flex items-center justify-between font-semibold text-[16px] text-[#1C1C1C] pb-3"
                    onClick={() => setCollapsePrice(!collapsePrice)}
                  >
                    <span>Price range</span>
                    <FaChevronUp className={`text-[#8B96A5] text-[13px] transition-transform duration-200 ${collapsePrice ? 'rotate-180' : ''}`} />
                  </button>
                  {!collapsePrice && (
                    <div className="space-y-4 pt-1">
                      {/* Dual range slider */}
                      <div className="px-1 py-2 relative">
                        <div className="relative w-full h-5 flex items-center select-none">
                          {/* Track background */}
                          <div className="absolute left-0 right-0 h-1 bg-[#D1E7FF] rounded-lg"></div>
                          
                          {/* Selected range highlighted bar */}
                          <div 
                            className="absolute h-1 bg-[#0D6EFD]" 
                            style={{ 
                              left: `${(sliderMin / 1000) * 100}%`, 
                              right: `${100 - (sliderMax / 1000) * 100}%` 
                            }}
                          ></div>
                          
                          {/* Left range input */}
                          <input 
                            type="range" 
                            min="0" 
                            max="1000" 
                            value={sliderMin}
                            onChange={(e) => {
                              const value = Math.min(Number(e.target.value), sliderMax - 10);
                              setSliderMin(value);
                              setPriceMin(value === 0 ? '' : String(value));
                            }}
                            className="absolute w-full h-1 pointer-events-none appearance-none bg-transparent outline-none
                              [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[#A3CFFF] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:active:scale-110 [&::-webkit-slider-thumb]:transition-transform
                              [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-[#A3CFFF] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md"
                            style={{ zIndex: sliderMin > 900 ? 5 : 3 }}
                          />
                          
                          {/* Right range input */}
                          <input 
                            type="range" 
                            min="0" 
                            max="1000" 
                            value={sliderMax}
                            onChange={(e) => {
                              const value = Math.max(Number(e.target.value), sliderMin + 10);
                              setSliderMax(value);
                              setPriceMax(value === 1000 ? '' : String(value));
                            }}
                            className="absolute w-full h-1 pointer-events-none appearance-none bg-transparent outline-none
                              [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[#A3CFFF] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:active:scale-110 [&::-webkit-slider-thumb]:transition-transform
                              [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-[#A3CFFF] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md"
                            style={{ zIndex: 4 }}
                          />
                        </div>
                      </div>

                      {/* Min & Max input fields */}
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col w-1/2">
                          <label className="text-[16px] text-[#1C1C1C] font-normal mb-1">Min</label>
                          <input 
                            type="number" 
                            placeholder="0" 
                            className="w-full border border-[#DEE2E7] rounded-md px-3 py-2 text-[16px] outline-none focus:border-brand-blue text-[#1C1C1C] placeholder-[#8B96A5]"
                            value={priceMin}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPriceMin(val);
                              if (val !== '' && !isNaN(val)) {
                                setSliderMin(Math.min(Math.max(Number(val), 0), sliderMax - 10));
                              } else {
                                setSliderMin(0);
                              }
                            }}
                          />
                        </div>
                        <div className="flex flex-col w-1/2">
                          <label className="text-[16px] text-[#1C1C1C] font-normal mb-1">Max</label>
                          <input 
                            type="number" 
                            placeholder="999999" 
                            className="w-full border border-[#DEE2E7] rounded-md px-3 py-2 text-[16px] outline-none focus:border-brand-blue text-[#1C1C1C] placeholder-[#8B96A5]"
                            value={priceMax}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPriceMax(val);
                              if (val !== '' && !isNaN(val)) {
                                setSliderMax(Math.max(Math.min(Number(val), 1000), sliderMin + 10));
                              } else {
                                setSliderMax(1000);
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* Apply button */}
                      <button 
                        className="w-full bg-white hover:bg-gray-50 border border-[#DEE2E7] text-[#0D6EFD] font-semibold text-[16px] py-2 rounded-md transition-colors card-shadow"
                        onClick={() => {
                          setPriceRangeFilter({ min: priceMin, max: priceMax });
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                                {/* Condition */}
                <div className="border-t border-[#DEE2E7] pt-4">
                  <button 
                    className="w-full flex items-center justify-between font-semibold text-[16px] text-[#1C1C1C] pb-3"
                    onClick={() => setCollapseCondition(!collapseCondition)}
                  >
                    <span>Condition</span>
                    <FaChevronUp className={`text-[#8B96A5] text-[13px] transition-transform duration-200 ${collapseCondition ? 'rotate-180' : ''}`} />
                  </button>
                  {!collapseCondition && (
                    <div className="space-y-2.5">
                      {filterConditions.map((cond, idx) => (
                        <label key={idx} className="flex items-center gap-3 text-sm text-[#1C1C1C] font-normal cursor-pointer select-none">
                          <input 
                            type="radio" 
                            name="condition"
                            className="w-5 h-5 border-[#C8D1DC] text-brand-blue focus:ring-brand-blue cursor-pointer"
                            checked={selectedCondition === cond}
                            onChange={() => setSelectedCondition(cond)}
                          />
                          <span>{cond}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                                {/* Ratings */}
                <div className="border-t border-[#DEE2E7] pt-4">
                  <button 
                    className="w-full flex items-center justify-between font-semibold text-[16px] text-[#1C1C1C] pb-3"
                    onClick={() => setCollapseRatings(!collapseRatings)}
                  >
                    <span>Ratings</span>
                    <FaChevronUp className={`text-[#8B96A5] text-[13px] transition-transform duration-200 ${collapseRatings ? 'rotate-180' : ''}`} />
                  </button>
                  {!collapseRatings && (
                    <div className="space-y-2.5">
                      {[5, 4, 3, 2].map((stars) => {
                        const isChecked = selectedRatings.includes(stars);
                        return (
                          <label key={stars} className="flex items-center gap-3 text-sm text-[#1C1C1C] font-normal cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 rounded border-[#C8D1DC] text-brand-blue focus:ring-brand-blue cursor-pointer"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedRatings(selectedRatings.filter(r => r !== stars));
                                } else {
                                  setSelectedRatings([...selectedRatings, stars]);
                                }
                              }}
                            />
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <FaStar 
                                  key={s} 
                                  className={s <= stars ? "text-[#FF9017]" : "text-[#D5DEE7]"} 
                                />
                              ))}
                              {stars < 5 && <span className="text-xs text-gray-500 font-normal ml-1">& Up</span>}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Manufacturer */}
                <div className="border-t border-[#DEE2E7] pt-4">
                  <button 
                    className="w-full flex items-center justify-between font-semibold text-[16px] text-[#1C1C1C] pb-3"
                    onClick={() => setCollapseManufacturer(!collapseManufacturer)}
                  >
                    <span>Manufacturer</span>
                    <FaChevronUp className={`text-[#8B96A5] text-[13px] transition-transform duration-200 ${collapseManufacturer ? 'rotate-180' : ''}`} />
                  </button>
                  {!collapseManufacturer && (
                    <div className="space-y-2.5">
                      {filterManufacturers.map((m, idx) => {
                        const isChecked = selectedManufacturers.includes(m);
                        return (
                          <label key={idx} className="flex items-center gap-3 text-sm text-[#1C1C1C] font-normal cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 rounded border-[#C8D1DC] text-brand-blue focus:ring-brand-blue cursor-pointer"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedManufacturers(selectedManufacturers.filter(x => x !== m));
                                } else {
                                  setSelectedManufacturers([...selectedManufacturers, m]);
                                }
                              }}
                            />
                            <span>{m}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

              </aside>

              {/* Main Products Grid/List Panel */}
              <div className="col-span-1 lg:col-span-3 space-y-4">
                
                {/* Header Filter Panel */}
                <div className="bg-white border border-[#DEE2E7] rounded-lg p-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 card-shadow">
                                    <div className="text-[16px] text-[#1C1C1C] font-normal self-start sm:self-auto">
                    <span className="font-semibold">{sortedProducts.length}</span> items in <span className="font-semibold text-brand-blue">{selectedCategory}</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 self-end sm:self-auto">
                    <label className="flex items-center gap-2 text-sm text-[#1C1C1C] font-normal cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-[#C8D1DC] text-brand-blue focus:ring-brand-blue cursor-pointer"
                        checked={verifiedOnly}
                        onChange={(e) => setVerifiedOnly(e.target.checked)}
                      />
                      <span>Verified only</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <select 
                        className="border border-[#DEE2E7] rounded px-3 py-1.5 text-sm bg-white text-[#1C1C1C] font-normal outline-none focus:border-brand-blue cursor-pointer"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="Featured">Featured</option>
                        <option value="Price: Low to High">Price: Low to High</option>
                        <option value="Price: High to Low">Price: High to Low</option>
                      </select>
                    </div>

                    <div className="flex border border-[#DEE2E7] rounded overflow-hidden">
                      <button 
                        className={`p-2 transition-colors ${viewLayout === 'grid' ? 'bg-[#EFF2F4] text-[#1C1C1C]' : 'bg-white text-gray-400 hover:text-gray-600'}`}
                        onClick={() => setViewLayout('grid')}
                        title="Grid view"
                      >
                        <FaTh className="text-sm" />
                      </button>
                      <button 
                        className={`p-2 transition-colors border-l border-[#DEE2E7] ${viewLayout === 'list' ? 'bg-[#EFF2F4] text-[#1C1C1C]' : 'bg-white text-gray-400 hover:text-gray-600'}`}
                        onClick={() => setViewLayout('list')}
                        title="List view"
                      >
                        <FaList className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>

                                {/* Active Filter Chips */}
                {(selectedBrands.length > 0 || selectedFeatures.length > 0 || selectedCondition !== 'Any' || selectedRatings.length > 0 || priceRangeFilter.min !== '' || priceRangeFilter.max !== '') && (
                  <div className="flex flex-wrap items-center gap-2 py-1 select-none">
                    {selectedBrands.map(brand => (
                      <div key={brand} className="flex items-center gap-1.5 bg-white border border-[#0D6EFD] px-2.5 py-1.5 rounded-md text-sm text-[#505050] font-normal shadow-sm">
                        <span>{brand === 'Pocco' ? 'Poco' : brand}</span>
                        <button 
                          className="text-[#8B96A5] hover:text-red-500 transition-colors ml-1 font-bold text-xs"
                          onClick={() => setSelectedBrands(selectedBrands.filter(b => b !== brand))}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {selectedFeatures.map(feat => (
                      <div key={feat} className="flex items-center gap-1.5 bg-white border border-[#0D6EFD] px-2.5 py-1.5 rounded-md text-sm text-[#505050] font-normal shadow-sm">
                        <span>{feat}</span>
                        <button 
                          className="text-[#8B96A5] hover:text-red-500 transition-colors ml-1 font-bold text-xs"
                          onClick={() => setSelectedFeatures(selectedFeatures.filter(f => f !== feat))}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {selectedCondition !== 'Any' && (
                      <div className="flex items-center gap-1.5 bg-white border border-[#0D6EFD] px-2.5 py-1.5 rounded-md text-sm text-[#505050] font-normal shadow-sm">
                        <span>{selectedCondition}</span>
                        <button 
                          className="text-[#8B96A5] hover:text-red-500 transition-colors ml-1 font-bold text-xs"
                          onClick={() => setSelectedCondition('Any')}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    {selectedRatings.map(stars => (
                      <div key={stars} className="flex items-center gap-1.5 bg-white border border-[#0D6EFD] px-2.5 py-1.5 rounded-md text-sm text-[#505050] font-normal shadow-sm">
                        <span>{stars} star</span>
                        <button 
                          className="text-[#8B96A5] hover:text-red-500 transition-colors ml-1 font-bold text-xs"
                          onClick={() => setSelectedRatings(selectedRatings.filter(r => r !== stars))}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {(priceRangeFilter.min !== '' || priceRangeFilter.max !== '') && (
                      <div className="flex items-center gap-1.5 bg-white border border-[#0D6EFD] px-2.5 py-1.5 rounded-md text-sm text-[#505050] font-normal shadow-sm">
                        <span>
                          Price: {priceRangeFilter.min || '0'} - {priceRangeFilter.max || '999999'}
                        </span>
                        <button 
                          className="text-[#8B96A5] hover:text-red-500 transition-colors ml-1 font-bold text-xs"
                          onClick={() => {
                            setPriceMin('');
                            setPriceMax('');
                            setPriceRangeFilter({ min: '', max: '' });
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    
                    <button 
                      className="text-[#0D6EFD] hover:underline font-normal text-sm ml-2"
                      onClick={() => {
                        setSelectedBrands([]);
                        setSelectedFeatures([]);
                        setSelectedCondition('Any');
                        setSelectedRatings([]);
                        setPriceMin('');
                        setPriceMax('');
                        setPriceRangeFilter({ min: '', max: '' });
                        setSelectedCategory('All category');
                        setSearchQuery('');
                        handleSearch('');
                      }}
                    >
                      Clear all filter
                    </button>
                  </div>
                )}

                                {viewLayout === 'list' ? (
                  <div className="space-y-2 md:space-y-4">
                    {sortedProducts.map((product) => {
                      const isWishlisted = wishlist.includes(product.id);
                      
                      if (isMobile) {
                        return (
                          <div 
                            key={product.id} 
                            onClick={() => handleProductClick(product)}
                            className="bg-white border border-[#EFF2F4] rounded-lg p-3 flex gap-3.5 cursor-pointer shadow-sm"
                          >
                            {/* Image container */}
                            <div className="w-[110px] h-[110px] bg-white rounded-md flex items-center justify-center p-1.5 flex-shrink-0">
                              <img 
                                src={product.image} 
                                alt={product.title} 
                                className="max-h-full max-w-full object-contain" 
                              />
                            </div>

                            {/* Info container */}
                            <div className="flex-grow flex flex-col justify-between min-w-0 py-0.5">
                              <div>
                                <h4 className="text-sm font-normal text-[#1C1C1C] leading-snug line-clamp-2">
                                  {product.title || product.name || "Product Name"}
                                </h4>
                                <div className="text-[#1C1C1C] font-bold text-base mt-1">
                                  {product.price}
                                </div>
                                <div className="flex items-center gap-0.5 mt-1 text-[#FF9017]">
                                  <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <FaStar 
                                        key={s} 
                                        className={s <= Math.round((product.rating || 8) / 2) ? "text-[#FF9017] w-3 h-3" : "text-[#D5DEE7] w-3 h-3"} 
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[#FF9017] text-xs font-semibold ml-1">{product.rating || "8.0"}</span>
                                  <span className="text-gray-300 text-xs mx-1">•</span>
                                  <span className="text-[#8B96A5] text-xs font-normal">{product.orders || "10"} orders</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-2 flex-shrink-0">
                                <span className="text-[#00B517] text-xs font-normal block">
                                  {product.shipping || "Free Shipping"}
                                </span>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleAddToCartDirect(product); }}
                                  className="bg-[#0D6EFD] text-white text-[10px] font-semibold px-2 py-1 rounded hover:bg-[#0b5ed7] transition-colors"
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={product.id} className="bg-white border border-[#DEE2E7] rounded-lg p-5 flex flex-col sm:flex-row gap-5 card-shadow hover:shadow-md transition-shadow relative">
                          <div onClick={() => handleProductClick(product)} className="w-full sm:w-[210px] h-[210px] bg-white border border-gray-100 rounded-md flex items-center justify-center p-4 flex-shrink-0 cursor-pointer">
                            <img 
                              src={product.image} 
                              alt={product.title} 
                              className="max-h-full max-w-full object-contain" 
                            />
                          </div>

                          <div className="flex-grow flex flex-col justify-between">
                            <div className="space-y-2">
                                                            <h4 onClick={() => handleProductClick(product)} className="text-base font-semibold text-[#1C1C1C] hover:text-brand-blue cursor-pointer leading-snug">
                                {product.title}
                              </h4>

                              <div className="flex items-baseline gap-2.5">
                                <span className="text-lg sm:text-xl font-bold text-[#1C1C1C]">
                                  {product.price}
                                </span>
                                {product.originalPrice && (
                                  <span className="text-sm text-gray-400 line-through font-normal">
                                    {product.originalPrice}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#8B96A5] font-normal">
                                <div className="flex items-center gap-0.5">
                                                                    {[1, 2, 3, 4, 5].map((s) => (
                                    <FaStar 
                                      key={s} 
                                      className={s <= Math.round(product.rating / 2) ? "text-[#FF9017]" : "text-[#D5DEE7]"} 
                                    />
                                  ))}
                                </div>
                                <span className="text-[#FF9017] font-medium">{product.rating}</span>
                                <span className="text-gray-300">•</span>
                                <span>{product.orders} orders</span>
                                <span className="text-gray-300">•</span>
                                <span className="text-[#00B517] font-medium">{product.shipping}</span>
                              </div>

                              <p className="text-sm text-[#505050] font-normal leading-relaxed line-clamp-2 sm:line-clamp-3">
                                {product.description}
                              </p>
                            </div>

                            <div className="mt-4 sm:mt-0 pt-2 flex items-center gap-3">
                              <a 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); handleProductClick(product); }}
                                className="text-brand-blue hover:text-[#0b5ed7] font-semibold text-sm"
                              >
                                View details
                              </a>
                              <button 
                                onClick={() => handleAddToCartDirect(product)}
                                className="bg-[#0D6EFD] hover:bg-[#0b5ed7] text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors flex items-center gap-1.5"
                              >
                                <FaShoppingCart className="text-xs" />
                                <span>Add to Cart</span>
                              </button>
                            </div>
                          </div>

                          <button 
                            className={`absolute top-5 right-5 w-10 h-10 rounded-md border border-[#DEE2E7] flex items-center justify-center shadow-sm transition-colors ${
                              isWishlisted 
                                ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100' 
                                : 'bg-white text-brand-blue hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              if (isWishlisted) {
                                setWishlist(wishlist.filter(id => id !== product.id));
                              } else {
                                setWishlist([...wishlist, product.id]);
                              }
                            }}
                            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                          >
                            {isWishlisted ? <FaHeart /> : <FaRegHeart />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {sortedProducts.map((product) => {
                      const isWishlisted = wishlist.includes(product.id);
                      return (
                        <div key={product.id} className="bg-white border border-[#DEE2E7] rounded-lg p-4 card-shadow hover:shadow-md transition-shadow relative flex flex-col justify-between group">
                          <div>
                                                        <div onClick={() => handleProductClick(product)} className="h-44 flex items-center justify-center p-3 mb-4 rounded-md overflow-hidden relative cursor-pointer">
                              <img 
                                src={product.image} 
                                alt={product.title} 
                                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200" 
                              />
                              <button 
                                className={`absolute top-2 right-2 w-8 h-8 rounded-md border border-[#DEE2E7] flex items-center justify-center shadow-sm transition-colors ${
                                  isWishlisted 
                                    ? 'bg-red-50 text-red-500 border-red-200' 
                                    : 'bg-white text-brand-blue hover:bg-gray-50'
                                }`}
                                onClick={() => {
                                  if (isWishlisted) {
                                    setWishlist(wishlist.filter(id => id !== product.id));
                                  } else {
                                    setWishlist([...wishlist, product.id]);
                                  }
                                }}
                                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                              >
                                {isWishlisted ? <FaHeart className="text-xs" /> : <FaRegHeart className="text-xs" />}
                              </button>
                            </div>

                            <div className="flex items-baseline gap-2 mb-1.5">
                              <span className="text-base font-bold text-[#1C1C1C]">
                                {product.price}
                              </span>
                              {product.originalPrice && (
                                <span className="text-xs text-gray-400 line-through font-normal">
                                  {product.originalPrice}
                                </span>
                              )}
                            </div>

                                                         <div className="flex items-center gap-1 text-xs text-[#8B96A5] font-normal mb-2">
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <FaStar 
                                    key={s} 
                                    className={s <= Math.round(product.rating / 2) ? "text-[#FF9017]" : "text-[#D5DEE7]"} 
                                  />
                                ))}
                              </div>
                              <span className="text-[#FF9017] font-semibold">{product.rating}</span>
                            </div>

                                                        <h4 onClick={() => handleProductClick(product)} className="text-sm font-medium text-[#505050] hover:text-brand-blue cursor-pointer line-clamp-2 leading-snug mb-3">
                              {product.title}
                            </h4>
                          </div>

                          <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                            <span className="text-[11px] text-[#00B517] font-medium">{product.shipping}</span>
                            <div className="flex items-center gap-2">
                              <a 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); handleProductClick(product); }}
                                className="text-brand-blue hover:text-[#0b5ed7] font-semibold text-xs"
                              >
                                View details
                              </a>
                              <button 
                                onClick={() => handleAddToCartDirect(product)}
                                className="bg-[#0D6EFD] hover:bg-[#0b5ed7] text-white text-[10px] font-semibold px-2 py-1 rounded transition-colors flex items-center gap-1"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {sortedProducts.length === 0 && (
                  <div className="bg-white border border-[#DEE2E7] rounded-lg p-10 text-center card-shadow">
                    <span className="text-4xl block mb-3">🔍</span>
                    <h4 className="font-bold text-lg text-[#1C1C1C] mb-1">No products match the selected filters</h4>
                    <p className="text-sm text-gray-500">Try adjusting your brand, features, condition, or rating filters.</p>
                  </div>
                )}

                                                {/* Pagination */}
                {sortedProducts.length > 0 && (
                  <div className="hidden lg:flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 pb-2 border-t border-[#DEE2E7] mt-8 select-none">
                    
                    {/* Show Items Select Dropdown */}
                    <div className="relative">
                      <select 
                        className="appearance-none border border-[#DEE2E7] rounded-md pl-4 pr-10 py-2 text-[15px] bg-white text-[#1C1C1C] font-normal outline-none focus:border-brand-blue cursor-pointer h-10 min-w-[125px]"
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                      >
                        <option value={10}>Show 10</option>
                        <option value={20}>Show 20</option>
                        <option value={30}>Show 30</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <FaChevronDown className="text-[#8B96A5] text-[11px]" />
                      </div>
                    </div>

                    {/* Pagination Numbers and Chevrons */}
                    <div className="flex border border-[#DEE2E7] rounded-md overflow-hidden bg-white">
                      {/* Left Arrow Button */}
                      <button 
                        className="w-10 h-10 flex items-center justify-center border-r border-[#DEE2E7] hover:bg-gray-50 transition-colors"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      >
                        <svg className="w-3.5 h-3.5 text-[#8B96A5]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      {/* Page 1 */}
                      <button 
                        className={`w-10 h-10 flex items-center justify-center text-[15px] border-r border-[#DEE2E7] transition-colors ${
                          currentPage === 1 
                            ? 'bg-[#EFF2F4] text-[#8B96A5] font-normal' 
                            : 'bg-white text-[#1C1C1C] hover:bg-gray-50'
                        }`}
                        onClick={() => setCurrentPage(1)}
                      >
                        1
                      </button>

                      {/* Page 2 */}
                      <button 
                        className={`w-10 h-10 flex items-center justify-center text-[15px] border-r border-[#DEE2E7] transition-colors ${
                          currentPage === 2 
                            ? 'bg-[#EFF2F4] text-[#8B96A5] font-normal' 
                            : 'bg-white text-[#1C1C1C] hover:bg-gray-50'
                        }`}
                        onClick={() => setCurrentPage(2)}
                      >
                        2
                      </button>

                      {/* Page 3 */}
                      <button 
                        className={`w-10 h-10 flex items-center justify-center text-[15px] border-r border-[#DEE2E7] transition-colors ${
                          currentPage === 3 
                            ? 'bg-[#EFF2F4] text-[#8B96A5] font-normal' 
                            : 'bg-white text-[#1C1C1C] hover:bg-gray-50'
                        }`}
                        onClick={() => setCurrentPage(3)}
                      >
                        3
                      </button>

                      {/* Right Arrow Button */}
                      <button 
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, 3))}
                      >
                        <svg className="w-3.5 h-3.5 text-[#1C1C1C]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                                            </button>
                    </div>

                  </div>
                )}

                {isMobile && (
                  <div className="space-y-3 pt-6 pb-4">
                    <h3 className="text-lg font-bold text-[#1C1C1C]">You may also like</h3>
                    <div className="flex overflow-x-auto gap-3.5 no-scrollbar pb-2">
                      {[
                        {
                          id: 901,
                          image: "/recommended_bag4.png",
                          price: "$10.30",
                          description: "Solid Backpack blue jeans large size"
                        },
                        {
                          id: 902,
                          image: "/recommended_smartwatch.png",
                          price: "$10.30",
                          description: "T-shirts with multiple colors, for men"
                        },
                        {
                          id: 903,
                          image: "/recommended_coat.png",
                          price: "$10.30",
                          description: "T-shirts with multiple colors, for men"
                        }
                      ].map((item) => (
                        <div 
                          key={item.id} 
                          onClick={() => handleProductClick(item)}
                          className="bg-white border border-[#DEE2E7] rounded-lg p-3 w-[140px] flex-shrink-0 cursor-pointer hover:shadow-sm transition-shadow flex flex-col justify-between"
                        >
                          <div className="h-28 flex items-center justify-center mb-2 bg-white">
                            <img src={item.image} alt={item.description} className="max-h-full max-w-full object-contain" />
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-[#1C1C1C]">{item.price}</span>
                            <p className="text-xs text-gray-500 font-normal mt-0.5 line-clamp-2 leading-tight">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>
        ) : (
          /* ---------------- PRODUCT LISTING VIEW (MOBILE) ---------------- */
          <div className="space-y-4">
            
            {/* Breadcrumbs */}
            <div className="flex items-center flex-wrap gap-2 text-sm text-[#8B96A5] font-normal py-1 select-none">
              <span className="hover:text-brand-blue cursor-pointer" onClick={() => setView('home')}>Home</span>
              <span className="text-gray-400">&gt;</span>
              <span className="hover:text-brand-blue cursor-pointer" onClick={() => setSelectedCategory('All category')}>All category</span>
              {selectedCategory !== 'All category' && (
                <>
                  <span className="text-gray-400">&gt;</span>
                  <span className="text-[#1C1C1C] font-semibold">{selectedCategory}</span>
                </>
              )}
            </div>

            {/* Mobile Category Dropdown Selector */}
            <div className="lg:hidden bg-white border border-[#DEE2E7] rounded-lg p-3.5 flex items-center justify-between shadow-sm">
              <span className="text-sm font-semibold text-[#1C1C1C]">Category filter:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-[#DEE2E7] rounded px-3 py-1.5 text-sm text-[#505050] outline-none bg-white font-medium cursor-pointer focus:border-brand-blue"
              >
                <option value="All category">All categories</option>
                {dynamicCategories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              
              {/* Sidebar Filters */}
              <aside className="hidden lg:block col-span-1 bg-white lg:bg-transparent border lg:border-0 border-[#DEE2E7] rounded-lg p-4 lg:p-0 space-y-5 card-shadow lg:shadow-none">
                
                {/* Categories */}
                <div className="border-t border-[#DEE2E7] first:border-t-0 pt-4 first:pt-0">
                  <button 
                    className="w-full flex items-center justify-between font-semibold text-sm text-[#1C1C1C] pb-3"
                    onClick={() => setCollapseCategory(!collapseCategory)}
                  >
                    <span>Category</span>
                    <FaChevronUp className={`text-gray-400 text-xs transition-transform duration-200 ${collapseCategory ? 'rotate-180' : ''}`} />
                  </button>
                  {!collapseCategory && (
                    <ul className="space-y-2 text-[#505050] text-sm font-normal">
                      <li>
                        <a 
                          href="#" 
                          className={`block hover:text-brand-blue ${selectedCategory === 'All category' ? 'text-brand-blue font-semibold' : ''}`}
                          onClick={(e) => { e.preventDefault(); setSelectedCategory('All category'); }}
                        >
                          All category
                        </a>
                      </li>
                      {dynamicCategories.map((cat, idx) => (
                        <li key={idx}>
                          <a 
                            href="#" 
                            className={`block hover:text-brand-blue ${selectedCategory === cat ? 'text-brand-blue font-semibold' : ''}`}
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedCategory(cat);
                            }}
                          >
                            {cat}
                          </a>
                        </li>
                      ))}
                      <li>
                        <a href="#" className="text-brand-blue hover:underline text-sm font-medium">See all</a>
                      </li>
                    </ul>
                  )}
                </div>

                {/* Brands */}
                <div className="border-t border-[#DEE2E7] pt-4">
                  <button 
                    className="w-full flex items-center justify-between font-semibold text-sm text-[#1C1C1C] pb-3"
                    onClick={() => setCollapseBrands(!collapseBrands)}
                  >
                    <span>Brands</span>
                    <FaChevronUp className={`text-gray-400 text-xs transition-transform duration-200 ${collapseBrands ? 'rotate-180' : ''}`} />
                  </button>
                  {!collapseBrands && (
                    <div className="space-y-2.5">
                      {dynamicBrands.map((brand, idx) => {
                        const isChecked = selectedBrands.includes(brand);
                        return (
                          <label key={idx} className="flex items-center gap-3 text-sm text-[#1C1C1C] font-normal cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 rounded border-[#C8D1DC] text-brand-blue focus:ring-brand-blue cursor-pointer"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedBrands(selectedBrands.filter(b => b !== brand));
                                } else {
                                  setSelectedBrands([...selectedBrands, brand]);
                                }
                              }}
                            />
                            <span>{brand}</span>
                          </label>
                        );
                      })}
                      <a href="#" className="text-brand-blue hover:underline text-sm font-medium block pt-1">See all</a>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="border-t border-[#DEE2E7] pt-4">
                  <button 
                    className="w-full flex items-center justify-between font-semibold text-sm text-[#1C1C1C] pb-3"
                    onClick={() => setCollapseFeatures(!collapseFeatures)}
                  >
                    <span>Features</span>
                    <FaChevronUp className={`text-gray-400 text-xs transition-transform duration-200 ${collapseFeatures ? 'rotate-180' : ''}`} />
                  </button>
                  {!collapseFeatures && (
                    <div className="space-y-2.5">
                      {dynamicFeatures.map((feat, idx) => {
                        const isChecked = selectedFeatures.includes(feat);
                        return (
                          <label key={idx} className="flex items-center gap-3 text-sm text-[#1C1C1C] font-normal cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 rounded border-[#C8D1DC] text-brand-blue focus:ring-brand-blue cursor-pointer"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedFeatures(selectedFeatures.filter(f => f !== feat));
                                } else {
                                  setSelectedFeatures([...selectedFeatures, feat]);
                                }
                              }}
                            />
                            <span>{feat}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Price range */}
                <div className="border-t border-[#DEE2E7] pt-4">
                  <button 
                    className="w-full flex items-center justify-between font-semibold text-sm text-[#1C1C1C] pb-3"
                    onClick={() => setCollapsePrice(!collapsePrice)}
                  >
                    <span>Price range</span>
                    <FaChevronUp className={`text-gray-400 text-xs transition-transform duration-200 ${collapsePrice ? 'rotate-180' : ''}`} />
                  </button>
                  {!collapsePrice && (
                    <div className="space-y-3 pt-1">
                      <div className="px-1">
                        <input 
                          type="range" 
                          min="0" 
                          max="1500" 
                          className="w-full h-1 bg-[#DEE2E7] rounded-lg appearance-none cursor-pointer accent-brand-blue" 
                          value={priceMax || 1500}
                          onChange={(e) => {
                            setPriceMax(e.target.value);
                          }}
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1.5 font-normal">
                          <span>$0</span>
                          <span>$1500</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col w-1/2">
                          <label className="text-[11px] text-gray-400 mb-1">Min</label>
                          <input 
                            type="number" 
                            placeholder="0" 
                            className="w-full border border-[#DEE2E7] rounded px-3 py-1.5 text-sm outline-none focus:border-brand-blue placeholder-gray-300"
                            value={priceMin}
                            onChange={(e) => setPriceMin(e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col w-1/2">
                          <label className="text-[11px] text-gray-400 mb-1">Max</label>
                          <input 
                            type="number" 
                            placeholder="1500" 
                            className="w-full border border-[#DEE2E7] rounded px-3 py-1.5 text-sm outline-none focus:border-brand-blue placeholder-gray-300"
                            value={priceMax}
                            onChange={(e) => setPriceMax(e.target.value)}
                          />
                        </div>
                      </div>
                      <button 
                        className="w-full bg-white hover:bg-gray-50 border border-[#DEE2E7] text-brand-blue hover:text-[#0b5ed7] font-semibold text-sm py-2 rounded-md transition-colors card-shadow"
                        onClick={() => {
                          setPriceRangeFilter({ min: priceMin, max: priceMax });
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                {/* Condition */}
                <div className="border-t border-[#DEE2E7] pt-4">
                  <button 
                    className="w-full flex items-center justify-between font-semibold text-sm text-[#1C1C1C] pb-3"
                    onClick={() => setCollapseCondition(!collapseCondition)}
                  >
                    <span>Condition</span>
                    <FaChevronUp className={`text-gray-400 text-xs transition-transform duration-200 ${collapseCondition ? 'rotate-180' : ''}`} />
                  </button>
                  {!collapseCondition && (
                    <div className="space-y-2.5">
                      {filterConditions.map((cond, idx) => (
                        <label key={idx} className="flex items-center gap-3 text-sm text-[#1C1C1C] font-normal cursor-pointer select-none">
                          <input 
                            type="radio" 
                            name="condition"
                            className="w-5 h-5 border-[#C8D1DC] text-brand-blue focus:ring-brand-blue cursor-pointer"
                            checked={selectedCondition === cond}
                            onChange={() => setSelectedCondition(cond)}
                          />
                          <span>{cond}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ratings */}
                <div className="border-t border-[#DEE2E7] pt-4">
                  <button 
                    className="w-full flex items-center justify-between font-semibold text-sm text-[#1C1C1C] pb-3"
                    onClick={() => setCollapseRatings(!collapseRatings)}
                  >
                    <span>Ratings</span>
                    <FaChevronUp className={`text-gray-400 text-xs transition-transform duration-200 ${collapseRatings ? 'rotate-180' : ''}`} />
                  </button>
                  {!collapseRatings && (
                    <div className="space-y-2.5">
                      {[5, 4, 3, 2].map((stars) => {
                        const isChecked = selectedRatings.includes(stars);
                        return (
                          <label key={stars} className="flex items-center gap-3 text-sm text-[#1C1C1C] font-normal cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 rounded border-[#C8D1DC] text-brand-blue focus:ring-brand-blue cursor-pointer"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedRatings(selectedRatings.filter(r => r !== stars));
                                } else {
                                  setSelectedRatings([...selectedRatings, stars]);
                                }
                              }}
                            />
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <FaStar 
                                  key={s} 
                                  className={s <= stars ? "text-[#FF9017]" : "text-[#D5DEE7]"} 
                                />
                              ))}
                              {stars < 5 && <span className="text-xs text-gray-500 font-normal ml-1">& Up</span>}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

              </aside>

              {/* Main Products Grid/List Panel */}
              <div className="col-span-1 lg:col-span-3 space-y-4">
                
                {/* Header Filter Panel */}
                <div className="bg-white border border-[#DEE2E7] rounded-lg p-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 card-shadow">
                  <div className="text-sm text-[#1C1C1C] font-normal self-start sm:self-auto">
                    <span className="font-semibold">{sortedProducts.length}</span> items in <span className="font-semibold text-brand-blue">{selectedCategory}</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 self-end sm:self-auto">
                    <label className="flex items-center gap-2 text-sm text-[#1C1C1C] font-normal cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-[#C8D1DC] text-brand-blue focus:ring-brand-blue cursor-pointer"
                        checked={verifiedOnly}
                        onChange={(e) => setVerifiedOnly(e.target.checked)}
                      />
                      <span>Verified only</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <select 
                        className="border border-[#DEE2E7] rounded px-3 py-1.5 text-sm bg-white text-[#1C1C1C] font-normal outline-none focus:border-brand-blue cursor-pointer"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="Featured">Featured</option>
                        <option value="Price: Low to High">Price: Low to High</option>
                        <option value="Price: High to Low">Price: High to Low</option>
                      </select>
                    </div>

                    <div className="flex border border-[#DEE2E7] rounded overflow-hidden">
                      <button 
                        className={`p-2 transition-colors ${viewLayout === 'grid' ? 'bg-[#EFF2F4] text-[#1C1C1C]' : 'bg-white text-gray-400 hover:text-gray-600'}`}
                        onClick={() => setViewLayout('grid')}
                        title="Grid view"
                      >
                        <FaTh className="text-sm" />
                      </button>
                      <button 
                        className={`p-2 transition-colors border-l border-[#DEE2E7] ${viewLayout === 'list' ? 'bg-[#EFF2F4] text-[#1C1C1C]' : 'bg-white text-gray-400 hover:text-gray-600'}`}
                        onClick={() => setViewLayout('list')}
                        title="List view"
                      >
                        <FaList className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active Filter Chips */}
                {(selectedBrands.length > 0 || selectedFeatures.length > 0 || selectedCondition !== 'Any' || selectedRatings.length > 0 || priceRangeFilter.min !== '' || priceRangeFilter.max !== '') && (
                  <div className="flex flex-wrap items-center gap-2 py-1">
                    {selectedBrands.map(brand => (
                      <div key={brand} className="flex items-center gap-1.5 bg-white border border-[#DEE2E7] px-3 py-1.5 rounded-md text-sm text-[#1C1C1C] font-normal shadow-sm">
                        <span>{brand}</span>
                        <button 
                          className="text-gray-400 hover:text-red-500 transition-colors ml-1 font-bold text-xs"
                          onClick={() => setSelectedBrands(selectedBrands.filter(b => b !== brand))}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {selectedFeatures.map(feat => (
                      <div key={feat} className="flex items-center gap-1.5 bg-white border border-[#DEE2E7] px-3 py-1.5 rounded-md text-sm text-[#1C1C1C] font-normal shadow-sm">
                        <span>{feat}</span>
                        <button 
                          className="text-gray-400 hover:text-red-500 transition-colors ml-1 font-bold text-xs"
                          onClick={() => setSelectedFeatures(selectedFeatures.filter(f => f !== feat))}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {selectedCondition !== 'Any' && (
                      <div className="flex items-center gap-1.5 bg-white border border-[#DEE2E7] px-3 py-1.5 rounded-md text-sm text-[#1C1C1C] font-normal shadow-sm">
                        <span>{selectedCondition}</span>
                        <button 
                          className="text-gray-400 hover:text-red-500 transition-colors ml-1 font-bold text-xs"
                          onClick={() => setSelectedCondition('Any')}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    {selectedRatings.map(stars => (
                      <div key={stars} className="flex items-center gap-1.5 bg-white border border-[#DEE2E7] px-3 py-1.5 rounded-md text-sm text-[#1C1C1C] font-normal shadow-sm">
                        <span>{stars} Stars & Up</span>
                        <button 
                          className="text-gray-400 hover:text-red-500 transition-colors ml-1 font-bold text-xs"
                          onClick={() => setSelectedRatings(selectedRatings.filter(r => r !== stars))}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {(priceRangeFilter.min !== '' || priceRangeFilter.max !== '') && (
                      <div className="flex items-center gap-1.5 bg-white border border-[#DEE2E7] px-3 py-1.5 rounded-md text-sm text-[#1C1C1C] font-normal shadow-sm">
                        <span>
                          Price: {priceRangeFilter.min || '0'} - {priceRangeFilter.max || '1500'}
                        </span>
                        <button 
                          className="text-gray-400 hover:text-red-500 transition-colors ml-1 font-bold text-xs"
                          onClick={() => {
                            setPriceMin('');
                            setPriceMax('');
                            setPriceRangeFilter({ min: '', max: '' });
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    
                    <button 
                      className="text-brand-blue hover:text-[#0b5ed7] font-semibold text-sm ml-2"
                      onClick={() => {
                        setSelectedBrands([]);
                        setSelectedFeatures([]);
                        setSelectedCondition('Any');
                        setSelectedRatings([]);
                        setPriceMin('');
                        setPriceMax('');
                        setPriceRangeFilter({ min: '', max: '' });
                        setSelectedCategory('All category');
                        setSearchQuery('');
                        handleSearch('');
                      }}
                    >
                      Clear all filters
                    </button>
                  </div>
                )}

                {/* Product list */}
                {viewLayout === 'list' ? (
                  <div className="space-y-4">
                    {sortedProducts.map((product) => {
                      const isWishlisted = wishlist.includes(product.id);
                      return (
                        <div key={product.id} className="bg-white border border-[#DEE2E7] rounded-lg p-5 flex flex-col sm:flex-row gap-5 card-shadow hover:shadow-md transition-shadow relative">
                          <div className="w-full sm:w-[210px] h-[210px] bg-white border border-gray-100 rounded-md flex items-center justify-center p-4 flex-shrink-0">
                            <img 
                              src={product.image} 
                              alt={product.title} 
                              className="max-h-full max-w-full object-contain" 
                            />
                          </div>

                          <div className="flex-grow flex flex-col justify-between">
                            <div className="space-y-2">
                              <h4 className="text-base font-semibold text-[#1C1C1C] hover:text-brand-blue cursor-pointer leading-snug">
                                {product.title}
                              </h4>

                              <div className="flex items-baseline gap-2.5">
                                <span className="text-lg sm:text-xl font-bold text-[#1C1C1C]">
                                  {product.price}
                                </span>
                                {product.originalPrice && (
                                  <span className="text-sm text-gray-400 line-through font-normal">
                                    {product.originalPrice}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#8B96A5] font-normal">
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <FaStar 
                                      key={s} 
                                      className={s <= 4 ? "text-[#FF9017]" : "text-[#D5DEE7]"} 
                                    />
                                  ))}
                                </div>
                                <span className="text-[#FF9017] font-medium">{product.rating}</span>
                                <span className="text-gray-300">•</span>
                                <span>{product.orders} orders</span>
                                <span className="text-gray-300">•</span>
                                <span className="text-[#00B517] font-medium">{product.shipping}</span>
                              </div>

                              <p className="text-sm text-[#505050] font-normal leading-relaxed line-clamp-2 sm:line-clamp-3">
                                {product.description}
                              </p>
                            </div>

                            <div className="mt-4 sm:mt-0 pt-2">
                              <a 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); alert(`Viewing details for: ${product.title}`); }}
                                className="text-brand-blue hover:text-[#0b5ed7] font-semibold text-sm"
                              >
                                View details
                              </a>
                            </div>
                          </div>

                          <button 
                            className={`absolute top-5 right-5 w-10 h-10 rounded-md border border-[#DEE2E7] flex items-center justify-center shadow-sm transition-colors ${
                              isWishlisted 
                                ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100' 
                                : 'bg-white text-brand-blue hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              if (isWishlisted) {
                                setWishlist(wishlist.filter(id => id !== product.id));
                              } else {
                                setWishlist([...wishlist, product.id]);
                              }
                            }}
                            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                          >
                            {isWishlisted ? <FaHeart /> : <FaRegHeart />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {sortedProducts.map((product) => {
                      const isWishlisted = wishlist.includes(product.id);
                      return (
                        <div key={product.id} className="bg-white border border-[#DEE2E7] rounded-lg p-4 card-shadow hover:shadow-md transition-shadow relative flex flex-col justify-between group">
                          <div>
                            <div className="h-44 flex items-center justify-center p-3 mb-4 rounded-md overflow-hidden relative">
                              <img 
                                src={product.image} 
                                alt={product.title} 
                                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200" 
                              />
                              <button 
                                className={`absolute top-2 right-2 w-8 h-8 rounded-md border border-[#DEE2E7] flex items-center justify-center shadow-sm transition-colors ${
                                  isWishlisted 
                                    ? 'bg-red-50 text-red-500 border-red-200' 
                                    : 'bg-white text-brand-blue hover:bg-gray-50'
                                }`}
                                onClick={() => {
                                  if (isWishlisted) {
                                    setWishlist(wishlist.filter(id => id !== product.id));
                                  } else {
                                    setWishlist([...wishlist, product.id]);
                                  }
                                }}
                                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                              >
                                {isWishlisted ? <FaHeart className="text-xs" /> : <FaRegHeart className="text-xs" />}
                              </button>
                            </div>

                            <div className="flex items-baseline gap-2 mb-1.5">
                              <span className="text-base font-bold text-[#1C1C1C]">
                                {product.price}
                              </span>
                              {product.originalPrice && (
                                <span className="text-xs text-gray-400 line-through font-normal">
                                  {product.originalPrice}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 text-xs text-[#8B96A5] font-normal mb-2">
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <FaStar 
                                    key={s} 
                                    className={s <= 4 ? "text-[#FF9017]" : "text-[#D5DEE7]"} 
                                  />
                                ))}
                              </div>
                              <span className="text-[#FF9017] font-semibold">{product.rating}</span>
                            </div>

                            <h4 className="text-sm font-medium text-[#505050] hover:text-brand-blue cursor-pointer line-clamp-2 leading-snug mb-3">
                              {product.title}
                            </h4>
                          </div>

                          <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                            <span className="text-[11px] text-[#00B517] font-medium">{product.shipping}</span>
                            <a 
                              href="#" 
                              onClick={(e) => { e.preventDefault(); alert(`Viewing details for: ${product.title}`); }}
                              className="text-brand-blue hover:text-[#0b5ed7] font-semibold text-xs"
                            >
                              View details
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {sortedProducts.length === 0 && (
                  <div className="bg-white border border-[#DEE2E7] rounded-lg p-10 text-center card-shadow">
                    <span className="text-4xl block mb-3">🔍</span>
                    <h4 className="font-bold text-lg text-[#1C1C1C] mb-1">No products match the selected filters</h4>
                    <p className="text-sm text-gray-500">Try adjusting your brand, features, condition, or rating filters.</p>
                  </div>
                )}

                {/* Pagination */}
                {sortedProducts.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-2 border-t border-[#DEE2E7] mt-8">
                    <div className="flex items-center gap-2">
                      <select 
                        className="border border-[#DEE2E7] rounded px-3 py-1.5 text-sm bg-white text-[#1C1C1C] font-normal outline-none focus:border-brand-blue cursor-pointer"
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                      >
                        <option value={10}>Show 10</option>
                        <option value={20}>Show 20</option>
                        <option value={30}>Show 30</option>
                      </select>
                    </div>

                    <div className="flex border border-[#DEE2E7] rounded overflow-hidden shadow-sm">
                      <button 
                        className="px-3.5 py-2 bg-white text-gray-500 hover:bg-gray-50 text-sm border-r border-[#DEE2E7] transition-colors"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      >
                        &lt;
                      </button>
                      <button className="px-4 py-2 bg-brand-blueLight text-[#1C1C1C] font-bold text-sm border-r border-[#DEE2E7]">
                        1
                      </button>
                      <button className="px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 text-sm border-r border-[#DEE2E7]">
                        2
                      </button>
                      <button className="px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 text-sm border-r border-[#DEE2E7]">
                        3
                      </button>
                      <button 
                        className="px-3.5 py-2 bg-white text-gray-500 hover:bg-gray-50 text-sm transition-colors"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, 3))}
                      >
                        &gt;
                      </button>
                    </div>
                  </div>
                )}

              </div>

                                    </div>
          </div>
        )
      ) : view === 'detail' ? (
  <div className="space-y-6">
            {isMobile ? (
              /* Mobile High-Fidelity Detail Layout */
              <div className="space-y-4">
                {/* 1. Gallery Image Box */}
                <div className="relative border border-[#DEE2E7] rounded-lg p-4 h-[300px] flex items-center justify-center bg-white">
                  <img 
                    src={selectedProduct?.image} 
                    alt={selectedProduct?.title} 
                    className="max-h-full max-w-full object-contain" 
                  />
                  {/* ←  → Slider Overlay controls */}
                  <div className="absolute bottom-4 right-4 bg-[#1C1C1C] bg-opacity-35 text-white rounded-full px-4 py-1.5 flex items-center gap-3.5 text-sm select-none backdrop-blur-sm">
                    <span className="cursor-pointer font-bold hover:opacity-80">←</span>
                    <span className="text-gray-400 font-light">|</span>
                    <span className="cursor-pointer font-bold hover:opacity-80">→</span>
                  </div>
                </div>

                {/* 2. Rating & Stats Row */}
                <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-3">
                  <div className="flex items-center text-[#FF9017] text-sm">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <FaStar 
                        key={s} 
                        className={s <= Math.round((selectedProduct?.rating || 7.5) / 2) ? "text-[#FF9017] w-3.5 h-3.5" : "text-[#D5DEE7] w-3.5 h-3.5"} 
                      />
                    ))}
                  </div>
                  <span className="text-[#FF9017] text-xs font-semibold ml-1">{selectedProduct?.rating || '7.5'}</span>
                  <span className="text-gray-300 text-xs mx-1">•</span>
                  <div className="flex items-center gap-1 text-[#8B96A5] text-xs font-normal">
                    <BsChatSquareTextFill className="text-[9px] opacity-75" />
                    <span>32 reviews</span>
                  </div>
                  <span className="text-gray-300 text-xs mx-1">•</span>
                  <div className="flex items-center gap-1 text-[#8B96A5] text-xs font-normal">
                    <svg className="w-3 h-3 text-[#8B96A5]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>154 sold</span>
                  </div>
                </div>

                {/* 3. Title */}
                <h2 className="text-base font-semibold text-[#1C1C1C] leading-snug mt-1.5">
                  {selectedProduct?.title || "Product name goes here"}
                </h2>

                {/* 4. Price & tier info */}
                <div className="text-[#FA3434] font-bold text-base mt-1 flex items-baseline">
                  <span>{selectedProduct?.price || "$129.95"}</span>
                  <span className="text-[#8B96A5] font-normal text-xs ml-1.5">
                    (50-100 pcs)
                  </span>
                </div>

                {/* 5. Send Inquiry & Wishlist buttons */}
                <div className="flex items-center gap-2.5 mt-3 w-full">
                  <button 
                    onClick={() => {
                      handleAddToCartDirect(selectedProduct);
                    }}
                    className="flex-grow bg-[#FF9017] hover:bg-[#e07b0b] text-white py-2.5 rounded-lg text-sm font-semibold text-center transition-colors h-11"
                  >
                    Add to Cart
                  </button>
                  <button 
                    onClick={() => {
                      const isWish = wishlist.includes(selectedProduct?.id);
                      if (isWish) setWishlist(wishlist.filter(id => id !== selectedProduct?.id));
                      else setWishlist([...wishlist, selectedProduct?.id]);
                    }}
                    className="w-11 h-11 rounded-lg border border-[#DEE2E7] flex items-center justify-center text-brand-blue hover:bg-gray-50 bg-white flex-shrink-0 cursor-pointer"
                  >
                    {wishlist.includes(selectedProduct?.id) ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                  </button>
                </div>

                {/* 6. Product specifications attributes table */}
                <div className="space-y-2.5 mt-4 border-t border-b border-[#EFF2F4] py-3 text-sm text-[#505050] font-normal">
                  <div className="grid grid-cols-3">
                    <span className="text-[#8B96A5]">Condition</span>
                    <span className="col-span-2 text-[#1C1C1C]">Brand new</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-[#8B96A5]">Material</span>
                    <span className="col-span-2 text-[#1C1C1C]">
                      {selectedProduct?.material || (isProductClothing(selectedProduct) ? "Cotton/Polyester" : "Plastic")}
                    </span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-[#8B96A5]">Category</span>
                    <span className="col-span-2 text-[#1C1C1C]">
                      {selectedProduct?.category || (isProductClothing(selectedProduct) ? "Clothes and apparel" : "Electronics, gadgets")}
                    </span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-[#8B96A5]">Item num</span>
                    <span className="col-span-2 text-[#1C1C1C]">
                      {selectedProduct?.id ? selectedProduct.id + 23400 : "23421"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-[#8B96A5]">Availability</span>
                    <span className={`col-span-2 font-semibold ${selectedProduct?.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                      {selectedProduct?.stock !== undefined ? (selectedProduct.stock > 0 ? `In Stock (${selectedProduct.stock} items)` : "Out of Stock") : "In Stock"}
                    </span>
                  </div>
                </div>

                {/* 7. Description block */}
                <div className="text-sm text-[#505050] leading-relaxed mt-3">
                  <p className="line-clamp-3">
                    {selectedProduct?.description || "Info about edu item is an ideal companion for anyone engaged in learning. The drone provides precise and ..."}
                  </p>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      alert(selectedProduct?.description || "Info about edu item...");
                    }} 
                    className="text-[#0D6EFD] font-semibold mt-1 block hover:underline"
                  >
                    Read more
                  </a>
                </div>

                {/* 8. Supplier card */}
                <div className="border border-[#DEE2E7] rounded-lg p-3.5 mt-4 space-y-3 bg-white shadow-sm">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => alert("Guanjoi Trading LLC profile")}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-[#C3F2F6] text-[#4CA7A9] font-bold text-lg flex items-center justify-center select-none">
                        R
                      </div>
                      <div className="leading-snug">
                        <span className="text-[11px] text-[#8B96A5] block">Supplier</span>
                        <span className="text-sm font-semibold text-[#1C1C1C]">Guanjoi Trading LLC</span>
                      </div>
                    </div>
                    <span className="text-[#8B96A5] text-base font-bold select-none">&gt;</span>
                  </div>
                  <hr className="border-t border-[#EFF2F4]" />
                  <div className="flex items-center justify-between text-xs text-[#8B96A5] pt-0.5 font-normal">
                    <div className="flex items-center gap-1.5">
                      <img src="/flag_germany.png" alt="DE" className="w-[18px] h-[13px] object-cover rounded-sm shadow-sm" />
                      <span className="text-[#505050]">Germany</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[#8B96A5]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-[#505050]">Verified</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[#8B96A5]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <span className="text-[#505050]">Shipping</span>
                    </div>
                  </div>
                </div>

                {/* 9. Dynamic similar products recommended horizontal list */}
                <div className="space-y-3 pt-6 pb-4">
                  <h3 className="text-lg font-bold text-[#1C1C1C]">Similar products</h3>
                  <div className="flex overflow-x-auto gap-3.5 no-scrollbar pb-2">
                    {(isProductClothing(selectedProduct)
                      ? [
                          { id: 701, image: "/recommended_tshirt.png", price: "$10.30", title: "T-shirts with multiple colors, for men" },
                          { id: 702, image: "/recommended_coat.png", price: "$10.30", title: "T-shirts with multiple colors, for men" },
                          { id: 703, image: "/recommended_jeans.jpg", price: "$10.30", title: "T-shirts with multiple colors, for men" }
                        ]
                      : [
                          { id: 801, image: "/smartphones_electronics.png", price: "$10.30", title: "T-shirts with multiple colors, for men" },
                          { id: 802, image: "/recommended_smartwatch.png", price: "$10.30", title: "T-shirts with multiple colors, for men" },
                          { id: 803, image: "/laptop_electronics.png", price: "$10.30", title: "T-shirts with multiple colors, for men" }
                        ]
                    ).map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => handleProductClick(item)}
                        className="bg-white border border-[#DEE2E7] rounded-lg p-3 w-[140px] flex-shrink-0 cursor-pointer hover:shadow-sm transition-shadow flex flex-col justify-between"
                      >
                        <div className="h-28 flex items-center justify-center mb-2 bg-white">
                          <img src={item.image} alt={item.title} className="max-h-full max-w-full object-contain" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-[#1C1C1C]">{item.price}</span>
                          <p className="text-xs text-gray-500 font-normal mt-0.5 line-clamp-2 leading-tight">
                            {item.title}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              /* Desktop High-Fidelity Detail Layout */
              <>
                {/* Breadcrumbs */}
                <div className="flex items-center flex-wrap gap-x-2.5 text-[16px] text-[#8B96A5] font-normal py-3 select-none">
                  <span className="hover:text-brand-blue cursor-pointer" onClick={() => setView('home')}>Home</span>
                  <span className="text-[#8B96A5] font-light">&gt;</span>
                  <span className="hover:text-brand-blue cursor-pointer" onClick={() => { setSelectedCategory('All category'); setView('products'); }}>Clothings</span>
                  <span className="text-[#8B96A5] font-light">&gt;</span>
                  <span className="hover:text-brand-blue cursor-pointer" onClick={() => setView('products')}>Men's wear</span>
                  <span className="text-[#8B96A5] font-light">&gt;</span>
                  <span className="text-[#8B96A5]">Summer clothing</span>
                </div>

                {/* Main Product Card */}
                <div className="bg-white border border-[#DEE2E7] rounded-lg p-5 card-shadow grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Gallery (Left: 4 cols) */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="border border-[#DEE2E7] rounded-lg p-4 h-[340px] flex items-center justify-center bg-white">
                      <img 
                        src={selectedProduct?.image} 
                        alt={selectedProduct?.title} 
                        className="max-h-full max-w-full object-contain transition-all duration-300"
                        style={{
                          filter: activeThumbnailIndex === 0 ? 'none' : 
                                  activeThumbnailIndex === 1 ? 'hue-rotate(90deg)' :
                                  activeThumbnailIndex === 2 ? 'hue-rotate(180deg)' :
                                  activeThumbnailIndex === 3 ? 'hue-rotate(270deg)' :
                                  activeThumbnailIndex === 4 ? 'grayscale(80%)' :
                                  'sepia(60%)'
                        }}
                      />
                    </div>
                    {/* Thumbnails row (6 items) */}
                    <div className="grid grid-cols-6 gap-2">
                      {[0, 1, 2, 3, 4, 5].map((idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setActiveThumbnailIndex(idx)}
                          className={`border rounded-md p-1 h-14 flex items-center justify-center bg-white cursor-pointer transition-all ${
                            activeThumbnailIndex === idx ? 'border-[#1C1C1C] ring-1 ring-[#1C1C1C]' : 'border-[#DEE2E7] hover:border-gray-400'
                          }`}
                        >
                          <img 
                            src={selectedProduct?.image} 
                            alt="thumb" 
                            className="max-h-full max-w-full object-contain"
                            style={{
                              filter: idx === 0 ? 'none' : 
                                      idx === 1 ? 'hue-rotate(90deg)' :
                                      idx === 2 ? 'hue-rotate(180deg)' :
                                      idx === 3 ? 'hue-rotate(270deg)' :
                                      idx === 4 ? 'grayscale(80%)' :
                                      'sepia(60%)'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Product Info (Center: 5 cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[#00B517] font-medium text-sm">
                        <span>✓</span>
                        <span>In stock</span>
                      </div>
                      <h2 className="text-xl font-bold text-[#1C1C1C] leading-snug">
                        {selectedProduct?.title}
                      </h2>
                      
                      {/* Reviews & Orders Row */}
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-[#8B96A5] font-normal">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <FaStar 
                              key={s} 
                              className={s <= Math.round((selectedProduct?.rating || 7.5) / 2) ? "text-[#FF9017]" : "text-[#D5DEE7]"} 
                            />
                          ))}
                        </div>
                        <span className="text-[#FF9017] font-medium">{selectedProduct?.rating || '7.5'}</span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1">
                          <BsChatSquareTextFill className="text-gray-300 text-[10px]" />
                          <span>{selectedProduct?.orders ? selectedProduct.orders - 122 : '32'} reviews</span>
                        </span>
                        <span className="text-gray-300">•</span>
                        <span>{selectedProduct?.orders || '154'} sold</span>
                      </div>
                    </div>

                    {/* Wholesale Tiers Panel (Peach) */}
                    <div className="bg-[#FFF0DF] rounded-md p-4 flex divide-x divide-[#E5D0BC]">
                      {/* Tier 1 */}
                      <div className="flex-grow pr-4">
                        <div className="text-[#FA3434] text-lg font-bold">
                          {selectedProduct?.price || '$99.50'}
                        </div>
                        <div className="text-xs text-[#606C80] font-normal mt-0.5">50-100 pcs</div>
                      </div>
                      {/* Tier 2 */}
                      <div className="flex-grow px-4">
                        <div className="text-[#1C1C1C] text-lg font-bold">
                          ${(parseFloat((selectedProduct?.price || '$99.50').replace('$', '')) * 0.9).toFixed(2)}
                        </div>
                        <div className="text-xs text-[#606C80] font-normal mt-0.5">100-700 pcs</div>
                      </div>
                      {/* Tier 3 */}
                      <div className="flex-grow pl-4">
                        <div className="text-[#1C1C1C] text-lg font-bold">
                          ${(parseFloat((selectedProduct?.price || '$99.50').replace('$', '')) * 0.8).toFixed(2)}
                        </div>
                        <div className="text-xs text-[#606C80] font-normal mt-0.5">700+ pcs</div>
                      </div>
                    </div>

                    {/* Specs List */}
                    <div className="divide-y divide-[#EFF2F4] text-sm text-[#505050]">
                      <div className="py-2.5 grid grid-cols-3">
                        <span className="text-[#8B96A5]">Price:</span>
                        <span className="col-span-2 text-[#1C1C1C]">Negotiable</span>
                      </div>
                      <div className="py-2.5 grid grid-cols-3">
                        <span className="text-[#8B96A5]">Type:</span>
                        <span className="col-span-2 text-[#1C1C1C]">Classic shoes</span>
                      </div>
                      <div className="py-2.5 grid grid-cols-3">
                        <span className="text-[#8B96A5]">Material:</span>
                        <span className="col-span-2 text-[#1C1C1C]">Plastic material</span>
                      </div>
                      <div className="py-2.5 grid grid-cols-3">
                        <span className="text-[#8B96A5]">Design:</span>
                        <span className="col-span-2 text-[#1C1C1C]">Modern nice</span>
                      </div>
                      <div className="py-2.5 grid grid-cols-3">
                        <span className="text-[#8B96A5]">Customization:</span>
                        <span className="col-span-2 text-[#1C1C1C]">Customized logo and design custom packages</span>
                      </div>
                      <div className="py-2.5 grid grid-cols-3">
                        <span className="text-[#8B96A5]">Protection:</span>
                        <span className="col-span-2 text-[#1C1C1C]">Refund Policy</span>
                      </div>
                      <div className="py-2.5 grid grid-cols-3">
                        <span className="text-[#8B96A5]">Warranty:</span>
                        <span className="col-span-2 text-[#1C1C1C]">2 years full warranty</span>
                      </div>
                    </div>
                  </div>

                  {/* Supplier Info Box (Right: 3 cols) */}
                  <div className="lg:col-span-3">
                    <div className="border border-[#DEE2E7] rounded-lg p-4 space-y-4">
                      {/* Avatar & Name */}
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-md bg-[#C3F2F6] text-[#4CA7A9] font-bold text-xl flex items-center justify-center">
                          R
                        </div>
                        <div className="leading-snug">
                          <span className="text-xs text-[#8B96A5] block">Supplier</span>
                          <span className="text-sm font-semibold text-[#1C1C1C]">Guanjoi Trading LLC</span>
                        </div>
                      </div>

                      <hr className="border-t border-[#DEE2E7]" />

                      {/* Info List */}
                      <div className="space-y-3 text-sm text-[#505050]">
                        <div className="flex items-center gap-3">
                          <img src="/flag_germany.png" alt="DE" className="w-[20px] h-[14px] object-cover rounded-sm shadow-sm" />
                          <span>Germany, Berlin</span>
                        </div>
                        <div className="flex items-center gap-3 text-[#8B96A5]">
                          <svg className="w-4 h-4 text-[#8B96A5]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span className="text-[#505050]">Verified Seller</span>
                        </div>
                        <div className="flex items-center gap-3 text-[#8B96A5]">
                          <svg className="w-4 h-4 text-[#8B96A5]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          <span className="text-[#505050]">Worldwide shipping</span>
                        </div>
                      </div>

                      {/* Supplier Buttons */}
                      <div className="space-y-2.5">
                        <button 
                          onClick={() => handleAddToCartDirect(selectedProduct)} 
                          className="w-full bg-[#FF9017] hover:bg-[#e07b0b] text-white text-sm font-semibold py-2.5 rounded-md transition-colors shadow-sm"
                        >
                          Add to cart
                        </button>
                        <button 
                          onClick={() => alert('Inquiry sent to Guanjoi Trading LLC')} 
                          className="w-full bg-[#0D6EFD] hover:bg-[#0b5ed7] text-white text-sm font-semibold py-2.5 rounded-md transition-colors shadow-sm"
                        >
                          Send inquiry
                        </button>
                        <button 
                          onClick={() => alert("Viewing Guanjoi Trading LLC profile")} 
                          className="w-full bg-white hover:bg-gray-50 border border-[#DEE2E7] text-[#0D6EFD] text-sm font-semibold py-2.5 rounded-md transition-colors"
                        >
                          Seller's profile
                        </button>
                      </div>
                    </div>

                    {/* Save for Later Wishlist Button */}
                    <div className="text-center mt-4">
                      <button 
                        onClick={() => {
                          if (selectedProduct && wishlist.includes(selectedProduct.id)) {
                            setWishlist(wishlist.filter(id => id !== selectedProduct.id));
                          } else if (selectedProduct) {
                            setWishlist([...wishlist, selectedProduct.id]);
                          }
                        }}
                        className="inline-flex items-center gap-2 text-sm text-[#0D6EFD] hover:underline font-medium"
                      >
                        {selectedProduct && wishlist.includes(selectedProduct.id) ? (
                          <>
                            <FaHeart className="text-red-500" />
                            <span>Saved in list</span>
                          </>
                        ) : (
                          <>
                            <FaRegHeart />
                            <span>Save for later</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Section Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start mt-6">
                  
                  {/* Tabs Container (Left: 3 cols) */}
                  <div className="lg:col-span-3 space-y-4">
                    
                    {/* Tabs Headers */}
                    <div className="bg-white border border-[#DEE2E7] rounded-lg overflow-hidden card-shadow">
                      <div className="flex border-b border-[#DEE2E7]">
                        {['Description', 'Reviews', 'Shipping', 'About seller'].map((tabName) => (
                          <button 
                            key={tabName}
                            onClick={() => setDetailActiveTab(tabName)}
                            className={`flex-grow py-3.5 text-[15px] font-medium text-center border-b-2 transition-all ${
                              detailActiveTab === tabName 
                                ? 'border-[#0D6EFD] text-[#0D6EFD] bg-white' 
                                : 'border-transparent text-[#8B96A5] hover:text-[#505050]'
                            }`}
                          >
                            {tabName}
                          </button>
                        ))}
                      </div>

                      {/* Tabs Active Content */}
                      <div className="p-6 bg-white space-y-6">
                        {detailActiveTab === 'Description' && (
                          <div className="space-y-6">
                            <p className="text-sm text-[#505050] font-normal leading-relaxed">
                              {selectedProduct?.description}
                            </p>

                            {/* Specs Table */}
                            <div className="border border-[#DEE2E7] rounded-md overflow-hidden text-sm">
                              <div className="grid grid-cols-3 bg-[#F7FAFC] border-b border-[#DEE2E7] py-2 px-3.5 text-[#505050] font-medium">
                                <span className="text-[#8B96A5]">Model</span>
                                <span className="col-span-2 text-[#1C1C1C]">#8786867</span>
                              </div>
                              <div className="grid grid-cols-3 bg-white border-b border-[#DEE2E7] py-2 px-3.5 text-[#505050] font-medium">
                                <span className="text-[#8B96A5]">Style</span>
                                <span className="col-span-2 text-[#1C1C1C]">Classic style</span>
                              </div>
                              <div className="grid grid-cols-3 bg-[#F7FAFC] border-b border-[#DEE2E7] py-2 px-3.5 text-[#505050] font-medium">
                                <span className="text-[#8B96A5]">Certificate</span>
                                <span className="col-span-2 text-[#1C1C1C]">ISO-898921212</span>
                              </div>
                              <div className="grid grid-cols-3 bg-white border-b border-[#DEE2E7] py-2 px-3.5 text-[#505050] font-medium">
                                <span className="text-[#8B96A5]">Size</span>
                                <span className="col-span-2 text-[#1C1C1C]">34mm x 450mm x 19mm</span>
                              </div>
                              <div className="grid grid-cols-3 bg-[#F7FAFC] py-2 px-3.5 text-[#505050] font-medium">
                                <span className="text-[#8B96A5]">Memory</span>
                                <span className="col-span-2 text-[#1C1C1C]">36GB RAM</span>
                              </div>
                            </div>

                            {/* Feature Checks */}
                            <div className="space-y-2.5 text-sm text-[#505050] font-normal">
                              <div className="flex items-center gap-2.5">
                                <span className="text-[#00B517] text-xs">✓</span>
                                <span>Some great feature name here</span>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <span className="text-[#00B517] text-xs">✓</span>
                                <span>Lorem ipsum dolor sit amet, consectetur</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {detailActiveTab === 'Reviews' && (
                          <div className="space-y-4 text-sm text-[#505050] font-normal">
                            <div className="border-b pb-3.5">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-semibold text-[#1C1C1C]">John Doe</span>
                                <span className="text-xs text-gray-400">2 weeks ago</span>
                              </div>
                              <div className="flex text-[#FF9017] mb-2 text-xs">
                                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                              </div>
                              <p className="text-xs leading-relaxed">Fast delivery and superb build quality. Highly recommended seller!</p>
                            </div>
                            <div className="border-b pb-3.5">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-semibold text-[#1C1C1C]">Emma Watson</span>
                                <span className="text-xs text-gray-400">1 month ago</span>
                              </div>
                              <div className="flex text-[#FF9017] mb-2 text-xs">
                                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar className="text-gray-200" />
                              </div>
                              <p className="text-xs leading-relaxed">Very satisfied with the purchase. Matches description perfectly.</p>
                            </div>
                          </div>
                        )}

                        {detailActiveTab === 'Shipping' && (
                          <div className="space-y-2.5 text-sm text-[#505050] font-normal leading-relaxed">
                            <p className="font-semibold text-[#1C1C1C] mb-1">Standard Shipping Conditions</p>
                            <p>We dispatch items within 2-3 business days. Delivery times vary based on shipping destinations:</p>
                            <ul className="list-disc pl-5 space-y-1 mt-1 text-xs">
                              <li>Europe: 3-5 business days</li>
                              <li>North America: 5-7 business days</li>
                              <li>Worldwide: 7-14 business days</li>
                            </ul>
                            <p className="text-xs text-gray-500 mt-2">Custom packages or bulk supplier inquiries may take longer depending on agreements.</p>
                          </div>
                        )}

                        {detailActiveTab === 'About seller' && (
                          <div className="space-y-3 text-sm text-[#505050]">
                            <p className="font-semibold text-[#1C1C1C] mb-1">Guanjoi Trading LLC</p>
                            <p className="leading-relaxed text-xs">
                              Guanjoi Trading LLC is a certified global wholesale distributor with over 8 years of supply chain experience, based in Berlin, Germany. Specializing in high-demand electronics and client customization options.
                            </p>
                            <div className="pt-2 text-xs space-y-1 text-[#8B96A5]">
                              <div>Response rate: <span className="text-[#1C1C1C] font-medium">98%</span></div>
                              <div>Response time: <span className="text-[#1C1C1C] font-medium">&lt; 24 hours</span></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* You may like alternative list (Right: 1 col) */}
                  <div className="col-span-1 bg-white border border-[#DEE2E7] rounded-lg p-4 card-shadow space-y-4">
                    <h3 className="text-sm font-bold text-[#1C1C1C]">You may like</h3>
                    <div className="space-y-4 divide-y divide-[#EFF2F4]">
                      {(isProductClothing(selectedProduct) ? clothingYouMayLike : nonClothingYouMayLike).map((item, idx) => (
                        <div 
                          key={item.id} 
                          onClick={() => handleProductClick(item)} 
                          className={`flex items-center gap-3 cursor-pointer group ${idx > 0 ? 'pt-4' : ''}`}
                        >
                          <div className="w-14 h-14 border border-gray-100 rounded-md p-1.5 flex items-center justify-center flex-shrink-0 bg-white">
                            <img src={item.image} alt={item.title} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                          </div>
                          <div className="leading-tight">
                            <span className="text-xs font-normal text-[#1C1C1C] line-clamp-2 hover:text-[#0D6EFD] transition-colors">{item.title}</span>
                            <span className="text-xs text-gray-500 font-medium mt-1 block">{item.price || '$7.00 - $99.50'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Related products horizontal slider */}
                <div className="bg-white border border-[#DEE2E7] rounded-lg p-5 mt-6 card-shadow space-y-4">
                  <h3 className="text-[17px] font-bold text-[#1C1C1C]">Related products</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                    {(isProductClothing(selectedProduct) ? products.filter(x => x.category === 'Clothing').slice(0, 6) : products.filter(x => x.category !== 'Clothing').slice(0, 6)).map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => handleProductClick(item)} 
                        className="flex flex-col cursor-pointer group"
                      >
                        <div className="bg-[#EEEEEE] rounded-md h-[130px] flex items-center justify-center p-4 transition-colors hover:bg-gray-200">
                          <img src={item.image} alt={item.title || item.description} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200" />
                        </div>
                        <span className="text-xs text-[#505050] font-normal leading-snug mt-2 line-clamp-1 group-hover:text-[#0D6EFD] transition-colors">
                          {item.title || item.description}
                        </span>
                        <span className="text-xs text-gray-400 mt-1 block">
                          {item.price ? (String(item.price).startsWith('$') ? String(item.price) : `$${item.price}`) : "$32.00-$40.00"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Promo banner bottom */}
                <div className="rounded-lg py-5 px-6 sm:py-7 sm:px-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 relative overflow-hidden card-shadow bg-gradient-to-r from-[#0066FF] to-[#00D5EC]">
                  <div className="leading-snug text-center sm:text-left">
                    <h4 className="text-base sm:text-lg font-bold">Super discount on more than 100 USD</h4>
                    <p className="text-xs text-blue-100 opacity-90 font-normal mt-0.5">Have you ever finally just write dummy info</p>
                  </div>
                  <button 
                    onClick={() => alert('Promo activated!')}
                    className="bg-[#FF9017] hover:bg-[#e07b0b] text-white font-semibold text-xs py-2.5 px-4 rounded-md transition-colors shadow-sm flex-shrink-0"
                  >
                    Shop now
                  </button>
                </div>
              </>
            )}
          </div>
        ) : view === 'cart' ? (
          /* ---------------- MY CART VIEW ---------------- */
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-[#1C1C1C] my-4">My cart ({cartItems.length})</h2>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              
              {/* Left Side: Cart Items Box (3/4 width) */}
              <div className="lg:col-span-3 space-y-4">
                <div className="bg-white border border-[#DEE2E7] rounded-lg p-5 card-shadow space-y-5">
                  {cartItems.length === 0 ? (
                    <div className="py-10 text-center space-y-4">
                      <span className="text-4xl block">🛒</span>
                      <h3 className="text-lg font-bold text-[#1C1C1C]">Your cart is empty</h3>
                      <p className="text-sm text-gray-500">Add some products to your cart and start shopping!</p>
                      <button 
                        onClick={() => setView('products')} 
                        className="bg-[#0D6EFD] hover:bg-[#0b5ed7] text-white py-2 px-6 rounded-md font-semibold text-sm transition-colors"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#EFF2F4]">
                      {cartItems.map((item, idx) => {
                        return isMobile ? (
                          /* Mobile Cart Item Layout matching screenshot */
                          <div key={item.id} className="py-4 space-y-3">
                            <div className="flex gap-3">
                              {/* 1. White rounded box for image on the left */}
                              <div className="w-[80px] h-[80px] border border-[#DEE2E7] rounded-lg p-1.5 flex items-center justify-center flex-shrink-0 bg-white">
                                <img src={item.image} alt={item.title} className="max-h-full max-w-full object-contain" />
                              </div>

                              {/* 2. Text Content in Middle */}
                              <div className="flex-grow min-w-0">
                                <h4 className="text-sm font-normal text-[#1C1C1C] line-clamp-2 leading-tight">
                                  {item.title}
                                </h4>
                                <p className="text-[13px] text-[#8B96A5] font-normal mt-1 leading-normal">
                                  Size: {item.size || 'medium'}, Color: {item.color || 'blue'}
                                </p>
                                <p className="text-[13px] text-[#8B96A5] font-normal leading-normal">
                                  Seller: {item.seller || 'Artel Market'}
                                </p>
                              </div>

                              {/* 3. Three-dots options button on far right */}
                              <div className="flex-shrink-0 relative">
                                <button 
                                  onClick={() => handleToggleItemMenu(item.id)}
                                  className="w-8 h-8 text-[#8B96A5] hover:text-[#505050] transition-colors flex items-center justify-center options-menu-btn"
                                >
                                  <FaEllipsisV className="text-xs" />
                                </button>
                                {/* Popover options menu */}
                                {activeItemMenuId === item.id && (
                                  <div className="absolute right-0 top-8 bg-white border border-[#DEE2E7] rounded-lg shadow-lg py-1 w-32 z-30 options-menu-popover">
                                    <button 
                                      onClick={() => {
                                        handleSaveForLater(item);
                                        setActiveItemMenuId(null);
                                      }}
                                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-xs font-semibold text-[#0D6EFD]"
                                    >
                                      Save for later
                                    </button>
                                    <button 
                                      onClick={() => {
                                        handleRemoveCartItem(item.id);
                                        setActiveItemMenuId(null);
                                      }}
                                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-xs font-semibold text-[#FA3434] border-t border-gray-100"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 4. Bottom Row: Stepper and Price */}
                            <div className="flex items-center justify-between pt-1">
                              {/* Stepper qty controls */}
                              <div className="border border-[#DEE2E7] rounded-lg flex items-center bg-white overflow-hidden h-9">
                                <button 
                                  onClick={() => handleQtyChange(item.id, item.qty - 1)}
                                  className="w-9 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 active:bg-gray-100 text-sm font-bold border-r border-[#DEE2E7] focus:outline-none select-none"
                                >
                                  —
                                </button>
                                <span className="w-11 text-center text-sm font-semibold text-[#1C1C1C] select-none">
                                  {item.qty}
                                </span>
                                <button 
                                  onClick={() => handleQtyChange(item.id, item.qty + 1)}
                                  className="w-9 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 active:bg-gray-100 text-sm font-bold border-l border-[#DEE2E7] focus:outline-none select-none"
                                >
                                  +
                                </button>
                              </div>

                              {/* Price */}
                              <span className="text-[17px] font-bold text-[#1C1C1C]">
                                ${(item.price * item.qty).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          /* Current Desktop Layout */
                          <div key={item.id} className={`flex flex-col sm:flex-row gap-4 py-5 ${idx === 0 ? 'pt-0' : ''}`}>
                            {/* Image Thumbnail */}
                            <div className="w-20 h-20 border border-[#DEE2E7] rounded-md p-1.5 flex items-center justify-center flex-shrink-0 bg-white">
                              <img src={item.image} alt={item.title} className="max-h-full max-w-full object-contain" />
                            </div>

                            {/* Item details */}
                            <div className="flex-grow space-y-1">
                              <h4 className="text-base font-medium text-[#1C1C1C] hover:text-[#0D6EFD] cursor-pointer" onClick={() => handleProductClick(item)}>
                                {item.title}
                              </h4>
                              <div className="text-sm text-[#8B96A5] font-normal space-y-0.5">
                                <div>Size: {item.size || 'medium'}, Color: {item.color || 'blue'}, Material: {item.material || 'Plastic'}</div>
                                <div className="text-[#8B96A5]">Seller: {item.seller}</div>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 pt-2">
                                <button 
                                  onClick={() => handleRemoveCartItem(item.id)}
                                  className="border border-[#DEE2E7] hover:border-red-200 text-[#FA3434] hover:bg-red-50 px-2.5 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-colors"
                                >
                                  Remove
                                </button>
                                <button 
                                  onClick={() => handleSaveForLater(item)}
                                  className="border border-[#DEE2E7] hover:border-blue-200 text-[#0D6EFD] hover:bg-blue-50 px-2.5 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-colors"
                                >
                                  Save for later
                                </button>
                              </div>
                            </div>

                            {/* Price and quantity selectors */}
                            <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start gap-4 flex-shrink-0">
                              <span className="text-base font-semibold text-[#1C1C1C]">
                                ${(item.price * item.qty).toFixed(2)}
                              </span>

                              <div className="relative">
                                <select 
                                  value={item.qty}
                                  onChange={(e) => handleQtyChange(item.id, e.target.value)}
                                  className="appearance-none border border-[#DEE2E7] rounded-md pl-3 pr-8 py-1.5 text-sm bg-white text-[#1C1C1C] font-normal outline-none focus:border-brand-blue cursor-pointer h-9"
                                >
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(q => (
                                    <option key={q} value={q}>Qty: {q}</option>
                                  ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                                  <FaChevronDown className="text-[#8B96A5] text-[10px]" />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Back to Shop & Remove All footer buttons */}
                  {cartItems.length > 0 && (
                    <div className="border-t border-[#DEE2E7] pt-4 flex items-center justify-between">
                      <button 
                        onClick={() => setView('products')} 
                        className="bg-[#0D6EFD] hover:bg-[#0b5ed7] text-white py-2.5 px-4 rounded-md font-semibold text-sm hover:bg-blue-600 flex items-center gap-2 transition-colors shadow-sm"
                      >
                        <span>←</span>
                        <span>Back to shop</span>
                      </button>
                      <button 
                        onClick={handleRemoveAllCart}
                        className="border border-[#DEE2E7] hover:border-red-300 text-[#0D6EFD] hover:text-red-500 hover:bg-red-50 py-2.5 px-4 rounded-md font-semibold text-sm transition-colors"
                      >
                        Remove all
                      </button>
                    </div>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 text-[#8B96A5]">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-[#E3E8EE] text-[#8B96A5] flex items-center justify-center text-xl flex-shrink-0">
                      <svg className="w-5 h-5 text-[#8B96A5]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-[#1C1C1C]">Secure payment</h4>
                      <p className="text-xs text-[#8B96A5] mt-0.5">Have you ever finally just</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-[#E3E8EE] text-[#8B96A5] flex items-center justify-center text-xl flex-shrink-0">
                      <svg className="w-5 h-5 text-[#8B96A5]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-[#1C1C1C]">Customer support</h4>
                      <p className="text-xs text-[#8B96A5] mt-0.5">Have you ever finally just</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-[#E3E8EE] text-[#8B96A5] flex items-center justify-center text-xl flex-shrink-0">
                      <svg className="w-5 h-5 text-[#8B96A5]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1zm0 0h5l4 4v-4m0 0h-4m-12 1h.01M9 17h.01" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-[#1C1C1C]">Free delivery</h4>
                      <p className="text-xs text-[#8B96A5] mt-0.5">Have you ever finally just</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Financial Summary Box (1/4 width) */}
              <div className="col-span-1 space-y-4">
                
                {/* Coupon input */}
                <div className="bg-white border border-[#DEE2E7] rounded-lg p-4 card-shadow space-y-3">
                  <span className="text-sm text-[#505050] font-normal block">Have a coupon?</span>
                  <form onSubmit={handleApplyCoupon} className="flex border border-[#DEE2E7] rounded-md overflow-hidden bg-white h-10">
                    <input 
                      type="text" 
                      placeholder="Add coupon" 
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full px-3 outline-none text-[#1C1C1C] placeholder-[#8B96A5] text-sm bg-transparent"
                    />
                    <button 
                      type="submit"
                      className="bg-white border-l border-[#DEE2E7] hover:bg-gray-50 text-[#0D6EFD] font-semibold text-sm px-4 h-full flex-shrink-0 transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                </div>

                                {/* Financial values */}
                <div className="bg-white border border-[#DEE2E7] rounded-lg p-6 card-shadow space-y-4">
                  {isMobile ? (
                    /* Mobile Financial Summary layout matching screenshot */
                    <div className="space-y-3.5 text-sm text-[#505050] font-normal">
                      <div className="flex justify-between">
                        <span>Items ({cartItems.reduce((acc, curr) => acc + curr.qty, 0)}):</span>
                        <span className="text-[#1C1C1C]">${cartItems.reduce((acc, curr) => acc + (curr.price * curr.qty), 0).toFixed(2)}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between">
                          <span>Discount:</span>
                          <span className="text-[#FA3434]">- ${discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span className="text-[#505050]">${cartItems.length > 0 ? '10.00' : '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span className="text-[#505050]">${cartItems.length > 0 ? '7.00' : '0.00'}</span>
                      </div>
                    </div>
                  ) : (
                    /* Desktop Financial Summary layout */
                    <div className="space-y-3.5 text-[16px] text-[#505050] font-normal">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="text-[#1C1C1C]">${cartItems.reduce((acc, curr) => acc + (curr.price * curr.qty), 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span className="text-[#FA3434]">- ${cartItems.length > 0 ? discountAmount.toFixed(2) : '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span className="text-[#00B517]">+ ${cartItems.length > 0 ? '14.00' : '0.00'}</span>
                      </div>
                    </div>
                  )}

                  <hr className="border-t border-[#DEE2E7] my-4" />

                  <div className="flex justify-between items-center pb-2">
                    <span className="text-[#1C1C1C] font-semibold text-[16px]">Total:</span>
                    <span className="text-[#1C1C1C] font-bold text-[22px] leading-none">
                      {isMobile ? (
                        `$${Math.max(
                          cartItems.reduce((acc, curr) => acc + (curr.price * curr.qty), 0) +
                          (cartItems.length > 0 ? 10.00 : 0) +
                          (cartItems.length > 0 ? 7.00 : 0) -
                          (cartItems.length > 0 ? discountAmount : 0),
                          0
                        ).toFixed(2)}`
                      ) : (
                        `$${Math.max(
                          cartItems.reduce((acc, curr) => acc + (curr.price * curr.qty), 0) -
                          (cartItems.length > 0 ? discountAmount : 0) +
                          (cartItems.length > 0 ? 14.00 : 0),
                          0
                        ).toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <button 
                    onClick={() => alert('Proceeding to checkout! Thank you for your purchase.')}
                    className="w-full bg-[#00B517] hover:bg-[#009e14] active:bg-[#008a11] text-white py-3.5 rounded-lg font-semibold text-[18px] shadow-sm transition-colors mt-5 block text-center"
                  >
                    {isMobile ? `Checkout (${cartItems.reduce((acc, curr) => acc + curr.qty, 0)} items)` : 'Checkout'}
                  </button>

                  {/* Payment Icons */}
                  <div className="flex items-center justify-center gap-2 pt-3">
                    {/* American Express */}
                    <div className="w-[46px] h-[28px] bg-white border border-[#DEE2E7] rounded flex items-center justify-center shadow-sm select-none">
                      <svg viewBox="0 0 32 20" width="32" height="20">
                        <text x="2" y="8" font-size="4.2" font-family="sans-serif" font-weight="900" fill="#017cc2" letter-spacing="0.1">AMERICAN</text>
                        <text x="2" y="14" font-size="4.2" font-family="sans-serif" font-weight="900" fill="#017cc2" letter-spacing="0.1">EXPRESS</text>
                      </svg>
                    </div>
                    {/* Mastercard */}
                    <div className="w-[46px] h-[28px] bg-white border border-[#DEE2E7] rounded flex items-center justify-center shadow-sm select-none">
                      <svg viewBox="0 0 30 20" width="30" height="20">
                        <circle cx="11" cy="10" r="6.5" fill="#EB001B" opacity="0.95"/>
                        <circle cx="19" cy="10" r="6.5" fill="#F79E1B" opacity="0.95"/>
                      </svg>
                    </div>
                                        {/* PayPal */}
                    <div className="w-[46px] h-[28px] bg-white border border-[#DEE2E7] rounded flex items-center justify-center shadow-sm select-none">
                      <svg viewBox="0 0 30 20" width="30" height="20">
                        <path fill="#003087" d="M11 4h5.5c2.5 0 4.5 1.5 4.5 4s-2 4-4.5 4H13.2l-.8 4.2h-2.5L11 4z"/>
                        <path fill="#0079C1" d="M13 6.5h5.5c2.5 0 4.5 1.5 4.5 4s-2 4-4.5 4h-3.3l-.8 4.2h-2.5L13 6.5z" opacity="0.85"/>
                      </svg>
                    </div>
                    {/* Visa */}
                    <div className="w-[46px] h-[28px] bg-white border border-[#DEE2E7] rounded flex items-center justify-center shadow-sm select-none">
                      <svg viewBox="0 0 30 20" width="30" height="20">
                        <text x="15" y="14.5" font-size="11" font-family="Impact, Arial Black, sans-serif" font-style="italic" font-weight="900" fill="#1A1F71" text-anchor="middle" letter-spacing="-0.3">VISA</text>
                        <polygon points="6,6 9.5,6 8,10" fill="#F7B614"/>
                      </svg>
                    </div>
                    {/* Apple Pay */}
                    <div className="w-[46px] h-[28px] bg-white border border-[#DEE2E7] rounded flex items-center justify-center shadow-sm select-none">
                      <svg viewBox="0 0 30 20" width="30" height="20">
                        <path d="M10.2,9.3c0-1.2,0.9-2.1,2.1-2.8c-0.6-0.8-1.5-1-1.9-1c-1,0-1.9,0.6-2.4,0.6c-0.5,0-1.3-0.5-2.1-0.5 c-1.1,0-2.1,0.6-2.6,1.5c-1.1,1.9-1.1,4.9,0,6.7c0.5,0.9,1.1,1.7,2.1,1.7c0.9,0,1.2-0.5,2.3-0.5c1,0,1.3,0.5,2.3,0.5 c1,0,1.5-0.7,2.1-1.5c0.6-0.9,0.9-1.8,0.9-1.9C12.5,13.1,10.2,12.2,10.2,9.3z" fill="#000"/>
                        <path d="M8.8,5.1c0.4-0.5,0.7-1.2,0.6-1.9c-0.6,0.1-1.4,0.5-1.8,0.9C7.2,4.6,6.9,5.3,7,6C7.7,6.1,8.4,5.7,8.8,5.1z" fill="#000"/>
                        <text x="13.5" y="13.5" font-family="-apple-system, system-ui, sans-serif" font-weight="700" font-size="9" fill="#000">Pay</text>
                      </svg>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Saved for Later list */}
            <div className="bg-white border border-[#DEE2E7] rounded-lg p-5 mt-6 card-shadow space-y-4">
              <h3 className="text-lg font-bold text-[#1C1C1C]">Saved for later</h3>
              
              {savedItems.length === 0 ? (
                <div className="text-center text-sm text-gray-400 py-4">No saved items yet.</div>
              ) : isMobile ? (
                <div className="flex flex-col gap-3.5">
                  {savedItems.map((item) => (
                    <div key={item.id} className="border border-[#DEE2E7] rounded-lg p-3 bg-white flex gap-3">
                      {/* Left: White image container with border-radius and thin border */}
                      <div className="w-[80px] h-[80px] border border-[#DEE2E7] rounded-lg p-1.5 flex items-center justify-center flex-shrink-0 bg-white">
                        <img src={item.image} alt={item.title} className="max-h-full max-w-full object-contain" />
                      </div>
                      {/* Right: Title and Price in bold, with outline buttons Move to Cart and Remove side-by-side underneath */}
                      <div className="flex-grow min-w-0 flex flex-col justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#1C1C1C]">${parseFloat(String(item.price).replace('$', '')).toFixed(2)}</p>
                          <p className="text-xs text-[#8B96A5] font-normal leading-snug line-clamp-2 mt-0.5">{item.title}</p>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button 
                            onClick={() => handleMoveToCart(item)}
                            className="flex-1 border border-[#DEE2E7] hover:border-blue-300 hover:bg-blue-50 text-[#0D6EFD] font-semibold text-xs py-2 rounded-md transition-colors flex items-center justify-center gap-1"
                          >
                            <FaShoppingCart className="text-[10px]" />
                            <span>Move to cart</span>
                          </button>
                          <button 
                            onClick={() => setSavedItems(savedItems.filter(x => x.id !== item.id))}
                            className="flex-1 border border-[#DEE2E7] hover:border-red-300 hover:bg-red-50 text-[#FA3434] font-semibold text-xs py-2 rounded-md transition-colors flex items-center justify-center"
                          >
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {savedItems.map((item) => (
                    <div key={item.id} className="border border-[#DEE2E7] rounded-lg p-4 space-y-3 bg-white hover:shadow-sm transition-shadow">
                      <div className="bg-[#EEEEEE] rounded-md h-[130px] flex items-center justify-center p-4">
                        <img src={item.image} alt={item.title} className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm font-semibold text-[#1C1C1C]">${parseFloat(String(item.price).replace('$', '')).toFixed(2)}</span>
                        <p className="text-xs text-[#8B96A5] font-normal leading-snug line-clamp-2">{item.title}</p>
                      </div>
                      <button 
                        onClick={() => handleMoveToCart(item)}
                        className="w-full border border-[#DEE2E7] hover:border-blue-300 hover:bg-blue-50 text-[#0D6EFD] font-semibold text-xs py-2 rounded-md transition-colors flex items-center justify-center gap-1.5"
                      >
                        <FaShoppingCart className="text-[10px]" />
                        <span>Move to cart</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Promo banner bottom */}
            <div className="rounded-lg py-5 px-6 sm:py-7 sm:px-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 relative overflow-hidden card-shadow bg-gradient-to-r from-[#0066FF] to-[#00D5EC]">
              <div className="leading-snug text-center sm:text-left">
                <h4 className="text-base sm:text-lg font-bold">Super discount on more than 100 USD</h4>
                <p className="text-xs text-blue-100 opacity-90 font-normal mt-0.5">Have you ever finally just write dummy info</p>
              </div>
              <button 
                onClick={() => alert('Promo activated!')}
                className="bg-[#FF9017] hover:bg-[#e07b0b] text-white font-semibold text-xs py-2.5 px-4 rounded-md transition-colors shadow-sm flex-shrink-0"
              >
                Shop now
              </button>
            </div>

          </div>
        ) : view === 'login' ? (
          <Login onNavigate={navigate} />
        ) : view === 'register' ? (
          <Register onNavigate={navigate} />
        ) : view === 'admin' ? (
          <AdminDashboard 
            products={products}
            categories={categories}
            onRefreshProducts={() => handleSearch('')}
            onNavigate={navigate}
            isMobile={isMobile}
          />
        ) : view === 'profile' ? (
          <UserProfileView user={user} navigate={navigate} logout={logout} />
        ) : view === 'wishlist' ? (
          <UserWishlistView 
            wishlist={wishlist} 
            setWishlist={setWishlist} 
            products={products} 
            navigate={navigate} 
            handleProductClick={handleProductClick} 
          />
        ) : view === 'messages' ? (
          <UserMessagesView navigate={navigate} />
        ) : view === 'orders' ? (
          <UserOrdersView navigate={navigate} />
        ) : view === 'settings' ? (
          <UserSettingsView navigate={navigate} />
        ) : null}
      </main>

            {/* ---------------- 11. NEWSLETTER SUBSCRIPTION BAR ---------------- */}
      <section className="bg-[#EFF2F4] py-10 mt-10">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h3 className="text-xl font-bold text-[#1C1C1C] mb-1">Subscribe on our newsletter</h3>
          <p className="text-sm text-[#606C80] mb-6">
            Get daily news on upcoming offers from many suppliers all over the world
          </p>

          <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully!'); }} className="flex flex-col sm:flex-row max-w-[440px] mx-auto gap-2">
            <div className="flex-grow flex items-center bg-white border border-[#DEE2E7] rounded-md px-3 h-10 text-sm">
              <FaEnvelope className="text-[#8B96A5] mr-2.5 flex-shrink-0" />
              <input 
                type="email" 
                placeholder="Email" 
                required
                className="w-full outline-none text-[#1C1C1C] placeholder-[#8B96A5] bg-transparent"
              />
            </div>
            <button 
              type="submit"
              className="bg-[#0D6EFD] hover:bg-[#0b5ed7] text-white font-semibold text-sm px-6 h-10 rounded-md transition-colors flex-shrink-0"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

            {/* ---------------- 12. FOOTER ---------------- */}
      <footer className="bg-white border-t border-brand-border pt-12 pb-10">
        <div className="max-w-[1200px] mx-auto px-4">
          
          {/* Main Footer Links */}
          <div className="grid grid-cols-2 md:grid-cols-7 gap-8">
            
                        {/* Brand Logo & Info */}
            <div className="col-span-2 space-y-4">
                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
                <img 
                  src="/logo.png" 
                  alt="Brand Logo" 
                  className="w-8 h-8 object-contain flex-shrink-0" 
                />
                <span className="text-xl font-bold text-[#80B3FF] tracking-tight">Brand</span>
              </div>
              <p className="text-sm text-[#606C80] font-normal leading-relaxed max-w-[240px]">
                Best information about the company <br /> gies here but now lorem ipsum is
              </p>
              {/* Socials */}
              <div className="flex items-center gap-3">
                <a href="#" className="w-8 h-8 rounded-full bg-[#BDC4CD] hover:bg-brand-blue text-white flex items-center justify-center transition-colors">
                  <FaFacebookF />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#BDC4CD] hover:bg-brand-blue text-white flex items-center justify-center transition-colors">
                  <FaTwitter />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#BDC4CD] hover:bg-brand-blue text-white flex items-center justify-center transition-colors">
                  <FaLinkedinIn />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#BDC4CD] hover:bg-brand-blue text-white flex items-center justify-center transition-colors">
                  <FaInstagram />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#BDC4CD] hover:bg-brand-blue text-white flex items-center justify-center transition-colors">
                  <FaYoutube />
                </a>
              </div>
            </div>

            {/* Col 1: About */}
            <div className="col-span-1 space-y-3">
              <h4 className="text-sm font-semibold text-[#1C1C1C]">About</h4>
              <ul className="space-y-2 text-sm text-[#8B96A5] font-normal">
                <li><a href="#" className="hover:text-brand-blue">About Us</a></li>
                <li><a href="#" className="hover:text-brand-blue">Find store</a></li>
                <li><a href="#" className="hover:text-brand-blue">Categories</a></li>
                <li><a href="#" className="hover:text-brand-blue">Blogs</a></li>
              </ul>
            </div>

            {/* Col 2: Partnership */}
            <div className="col-span-1 space-y-3">
              <h4 className="text-sm font-semibold text-[#1C1C1C]">Partnership</h4>
              <ul className="space-y-2 text-sm text-[#8B96A5] font-normal">
                <li><a href="#" className="hover:text-brand-blue">About Us</a></li>
                <li><a href="#" className="hover:text-brand-blue">Find store</a></li>
                <li><a href="#" className="hover:text-brand-blue">Categories</a></li>
                <li><a href="#" className="hover:text-brand-blue">Blogs</a></li>
              </ul>
            </div>

            {/* Col 3: Information */}
            <div className="col-span-1 space-y-3">
              <h4 className="text-sm font-semibold text-[#1C1C1C]">Information</h4>
              <ul className="space-y-2 text-sm text-[#8B96A5] font-normal">
                <li><a href="#" className="hover:text-brand-blue">Help Center</a></li>
                <li><a href="#" className="hover:text-brand-blue">Money Refund</a></li>
                <li><a href="#" className="hover:text-brand-blue">Shipping</a></li>
                <li><a href="#" className="hover:text-brand-blue">Contact us</a></li>
              </ul>
            </div>

            {/* Col 4: For users */}
            <div className="col-span-1 space-y-3">
              <h4 className="text-sm font-semibold text-[#1C1C1C]">For users</h4>
              <ul className="space-y-2 text-sm text-[#8B96A5] font-normal">
                <li><a href="#" className="hover:text-brand-blue">Login</a></li>
                <li><a href="#" className="hover:text-brand-blue">Register</a></li>
                <li><a href="#" className="hover:text-brand-blue">Settings</a></li>
                <li><a href="#" className="hover:text-brand-blue">My Orders</a></li>
              </ul>
            </div>

            {/* Col 5: Get App */}
            <div className="col-span-1 space-y-3">
              <h4 className="text-sm font-semibold text-[#1C1C1C]">Get app</h4>
              <div className="space-y-2">
                <a href="#" className="flex items-center gap-2 bg-[#1C1C1C] text-white px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors max-w-[130px]">
                  <FaApple className="text-xl" />
                  <div className="text-left">
                    <span className="block text-[8px] opacity-75 leading-none">Download on the</span>
                    <span className="block text-xs font-semibold leading-none mt-0.5">App Store</span>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-2 bg-[#1C1C1C] text-white px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors max-w-[130px]">
                  <FaPlay className="text-lg" />
                  <div className="text-left">
                    <span className="block text-[8px] opacity-75 leading-none">GET IT ON</span>
                    <span className="block text-xs font-semibold leading-none mt-0.5">Google Play</span>
                  </div>
                </a>
              </div>
            </div>

          </div>
        </div>
      </footer>

      {/* Bottom copyright & settings bar */}
      <div className="bg-[#EFF2F4] py-5 border-t border-brand-border">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm text-[#606C80] font-normal">
            © 2023 Ecommerce.
          </span>
          <div className="flex items-center gap-2 text-sm text-[#606C80] font-normal cursor-pointer hover:text-brand-blue transition-colors">
            <img 
              src="/flag_usa.png" 
              alt="English" 
              className="w-[20px] h-[14px] object-cover flex-shrink-0 rounded-sm shadow-sm" 
            />
            <span>English</span>
            <FaChevronDown className="text-gray-400 text-[10px] ml-0.5" />
          </div>
        </div>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  );
}

function UserProfileView({ user, navigate, logout }) {
  if (!user) return <div className="p-8 text-center bg-white rounded-lg border border-[#DEE2E7] shadow-sm">Please sign in to view your profile.</div>;
  
  return (
    <div className="max-w-2xl mx-auto bg-white border border-[#DEE2E7] rounded-lg shadow-sm p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-4 pb-6 border-b border-[#EFF2F4]">
        <div className="w-16 h-16 bg-brand-blueLight text-brand-blue rounded-full flex items-center justify-center font-bold text-2xl uppercase">
          {user.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1C1C1C]">{user.name}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
          <span className="inline-block bg-[#E2F0D9] text-[#385723] text-xs font-bold px-2 py-0.5 rounded mt-1.5 uppercase">
            {user.role}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => navigate('orders')}
          className="flex flex-col items-center justify-center p-6 border border-[#DEE2E7] hover:border-brand-blue rounded-lg hover:shadow-sm transition-all text-center group"
        >
          <div className="w-12 h-12 rounded-full bg-brand-blueLight text-brand-blue flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-[#1C1C1C]">My Orders</span>
          <span className="text-xs text-gray-500 mt-1">Track & history</span>
        </button>

        <button 
          onClick={() => navigate('wishlist')}
          className="flex flex-col items-center justify-center p-6 border border-[#DEE2E7] hover:border-brand-blue rounded-lg hover:shadow-sm transition-all text-center group"
        >
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
            <FaHeart />
          </div>
          <span className="text-sm font-semibold text-[#1C1C1C]">My Wishlist</span>
          <span className="text-xs text-gray-500 mt-1">Saved items</span>
        </button>

        <button 
          onClick={() => navigate('settings')}
          className="flex flex-col items-center justify-center p-6 border border-[#DEE2E7] hover:border-brand-blue rounded-lg hover:shadow-sm transition-all text-center group"
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-[#1C1C1C]">Settings</span>
          <span className="text-xs text-gray-500 mt-1">Profile & config</span>
        </button>
      </div>

      <div className="pt-4 border-t border-[#EFF2F4] flex justify-end">
        <button 
          onClick={() => {
            logout();
            navigate('home');
          }}
          className="bg-[#FA3434] hover:bg-red-600 text-white font-bold text-sm px-6 py-2.5 rounded-md transition-colors shadow-sm flex items-center gap-2"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </div>
  );
}

function UserWishlistView({ wishlist, setWishlist, products, navigate, handleProductClick }) {
  const wishlistedItems = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#DEE2E7] pb-4">
        <h2 className="text-2xl font-bold text-[#1C1C1C]">My Wishlist</h2>
        <button 
          onClick={() => navigate('products')}
          className="text-brand-blue hover:underline text-sm font-semibold"
        >
          Back to Shopping
        </button>
      </div>

      {wishlistedItems.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#DEE2E7] rounded-lg shadow-sm space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-50 text-red-500 flex items-center justify-center text-3xl">
            <FaHeart />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#1C1C1C]">Your wishlist is empty</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">Items you save will appear here. Find products you like and tap the heart icon!</p>
          </div>
          <button 
            onClick={() => navigate('products')}
            className="bg-brand-blue hover:bg-[#0b5ed7] text-white text-sm font-semibold px-6 py-2.5 rounded-md transition-colors shadow-sm"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {wishlistedItems.map((product) => {
            return (
              <div key={product.id} className="bg-white border border-[#DEE2E7] rounded-lg p-4 card-shadow hover:shadow-md transition-shadow relative flex flex-col justify-between group">
                <div>
                  <div onClick={() => handleProductClick(product)} className="h-44 flex items-center justify-center p-3 mb-4 rounded-md overflow-hidden relative cursor-pointer bg-white">
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200" 
                    />
                    <button 
                      className="absolute top-2 right-2 w-8 h-8 rounded-md border border-[#DEE2E7] flex items-center justify-center shadow-sm transition-colors bg-red-50 text-red-500 border-red-200 hover:bg-red-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setWishlist(wishlist.filter(id => id !== product.id));
                      }}
                      title="Remove from wishlist"
                    >
                      <FaHeart className="text-xs" />
                    </button>
                  </div>

                  <div className="flex items-baseline gap-2 mb-1.5">
                    <span className="text-base font-bold text-[#1C1C1C]">
                      {product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-gray-400 line-through font-normal">
                        {product.originalPrice}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center text-[#FF9017] text-xs mb-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <FaStar 
                          key={s} 
                          className={s <= Math.round((product.rating || 7.5) / 2) ? "text-[#FF9017] w-3 h-3" : "text-[#D5DEE7] w-3 h-3"} 
                        />
                      ))}
                    </div>
                    <span className="text-gray-400 ml-2 font-normal">
                      {product.rating}
                    </span>
                  </div>

                  <h4 
                    onClick={() => handleProductClick(product)}
                    className="text-sm font-normal text-[#505050] hover:text-[#0D6EFD] transition-colors leading-5 line-clamp-2 mb-3 cursor-pointer"
                  >
                    {product.title}
                  </h4>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-normal">
                  <span>Stock: {product.stock || 20}</span>
                  <span className="text-green-500 font-medium">Free Shipping</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function UserMessagesView({ navigate }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#DEE2E7] pb-4">
        <h2 className="text-2xl font-bold text-[#1C1C1C]">My Inbox</h2>
        <button 
          onClick={() => navigate('home')}
          className="text-brand-blue hover:underline text-sm font-semibold"
        >
          Back to Home
        </button>
      </div>

      <div className="text-center py-20 bg-white border border-[#DEE2E7] rounded-lg shadow-sm space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-brand-blueLight text-brand-blue flex items-center justify-center text-3xl">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-[#1C1C1C]">No messages yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">Your conversations with sellers and customer service agents will appear here.</p>
        </div>
      </div>
    </div>
  );
}

function UserOrdersView({ navigate }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#DEE2E7] pb-4">
        <h2 className="text-2xl font-bold text-[#1C1C1C]">My Orders</h2>
        <button 
          onClick={() => navigate('home')}
          className="text-brand-blue hover:underline text-sm font-semibold"
        >
          Back to Home
        </button>
      </div>

      <div className="text-center py-20 bg-white border border-[#DEE2E7] rounded-lg shadow-sm space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-brand-blueLight text-brand-blue flex items-center justify-center text-3xl">
          <FaBox className="text-2xl" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-[#1C1C1C]">No orders placed yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">Once you check out items from your cart, you will be able to track their shipping and order status here.</p>
        </div>
        <button 
          onClick={() => navigate('products')}
          className="bg-brand-blue hover:bg-[#0b5ed7] text-white text-sm font-semibold px-6 py-2.5 rounded-md transition-colors shadow-sm"
        >
          Browse Products
        </button>
      </div>
    </div>
  );
}

function UserSettingsView({ navigate }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#DEE2E7] pb-4">
        <h2 className="text-2xl font-bold text-[#1C1C1C]">Account Settings</h2>
        <button 
          onClick={() => navigate('home')}
          className="text-brand-blue hover:underline text-sm font-semibold"
        >
          Back to Home
        </button>
      </div>

      <div className="text-center py-20 bg-white border border-[#DEE2E7] rounded-lg shadow-sm space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-brand-blueLight text-brand-blue flex items-center justify-center text-3xl">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-[#1C1C1C]">Settings Dashboard</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">Configure your email preferences, billing addresses, and account credentials.</p>
        </div>
      </div>
    </div>
  );
}

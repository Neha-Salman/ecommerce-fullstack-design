// Mock database containing all datasets for the homepage sections, aligned to reference images

export const categories = [
  "Automobiles",
  "Clothes and wear",
  "Home interiors",
  "Computer and tech",
  "Tools, equipments",
  "Sports and outdoor",
  "Animal and pets",
  "Machinery tools",
  "More category"
];

export const dealsOffers = [
  {
    id: 1,
    name: "Smart watches",
    discount: "-25%",
    image: "/deal_smartwatch.png",
  },
  {
    id: 2,
    name: "Laptops",
    discount: "-15%",
    image: "/deal_laptop.png",
  },
  {
    id: 3,
    name: "GoPro cameras",
    discount: "-40%",
    image: "/deal_camera.png",
  },
  {
    id: 4,
    name: "Headphones",
    discount: "-25%",
    image: "/deal_headset.png",
  },
  {
    id: 5,
    name: "Canon camreras", // Match spelling from image
    discount: "-25%",
    image: "/deal_phone.png", // smartphone image
  }
];

export const homeOutdoor = [
  {
    id: 1,
    name: "Soft chairs",
    price: "19",
    image: "/soft_chair.png", // peach armchair
  },
  {
    id: 2,
    name: "Sofa & chair",
    price: "19",
    image: "/sofa_chair.png", // grey table lamp
  },
  {
    id: 3,
    name: "Kitchen dishes",
    price: "19",
    image: "/kitchen_dishes.png", // blue mattress
  },
  {
    id: 4,
    name: "Smart watches",
    price: "19",
    image: "/smart_watch_home.png", // clay pot
  },
  {
    id: 5,
    name: "Kitchen mixer",
    price: "100",
    image: "/kitchen_mixer.png", // juicer grinder
  },
  {
    id: 6,
    name: "Blenders",
    price: "39",
    image: "/blender.png", // espresso maker
  },
  {
    id: 7,
    name: "Home appliance",
    price: "19",
    image: "/home_appliance.jpg", // organizer
  },
  {
    id: 8,
    name: "Coffee maker",
    price: "10",
    image: "/coffee_maker_home.png", // potted plant
  }
];

export const consumerElectronics = [
  {
    id: 1,
    name: "Smart watches",
    price: "19",
    image: "/smart_watch_electronics.png", // grey watch white strap
  },
  {
    id: 2,
    name: "Cameras",
    price: "89",
    image: "/camera_electronics.png", // black DSLR
  },
  {
    id: 3,
    name: "Headphones",
    price: "10",
    image: "/headphones_electronics.png", // white headphones
  },
  {
    id: 4,
    name: "Smart watches",
    price: "90",
    image: "/smart_watch_kettle.png", // black electric kettle
  },
  {
    id: 5,
    name: "Gaming set",
    price: "35",
    image: "/gaming_set.png", // gaming headset
  },
  {
    id: 6,
    name: "Laptops & PC",
    price: "340",
    image: "/laptop_electronics.png", // laptop
  },
  {
    id: 7,
    name: "Smartphones",
    price: "19",
    image: "/smartphones_electronics.png", // tablet
  },
  {
    id: 8,
    name: "Electric kettle",
    price: "240",
    image: "/electric_kettle_iphone.png", // red iPhone
  }
];

export const recommendedItems = [
  {
    id: 1,
    price: "$10.30",
    description: "T-shirts with multiple colors, for men",
    image: "/recommended_tshirt.png"
  },
  {
    id: 2,
    price: "$10.30",
    description: "Jeans shorts for men blue color",
    image: "/recommended_jeans.jpg"
  },
  {
    id: 3,
    price: "$12.50",
    description: "Brown winter coat medium size",
    image: "/recommended_coat.png"
  },
  {
    id: 4,
    price: "$34.00",
    description: "Jeans bag for travel for men",
    image: "/recommended_bag4.png"
  },
  {
    id: 5,
    price: "$99.00",
    description: "Leather wallet", // label: "Leather wallet"
    image: "/recommended_wallet5.png"
  },
  {
    id: 6,
    price: "$9.99",
    description: "Canon camera black, 100x zoom",
    image: "/recommended_camera.png"
  },
  {
    id: 7,
    price: "$8.99",
    description: "Headset for gaming with mic",
    image: "/recommended_headset.png"
  },
  {
    id: 8,
    price: "$10.30",
    description: "Smartwatch silver color modern",
    image: "/recommended_smartwatch.png"
  },
  {
    id: 9,
    price: "$10.30",
    description: "Blue wallet for men leather metarfial",
    image: "/recommended_bluewallet.png"
  },
  {
    id: 10,
    price: "$80.95",
    description: "Jeans bag for travel for men",
    image: "/recommended_bag10.png"
  }
];

export const extraServices = [
  {
    id: 1,
    title: "Source from Industry Hubs",
    icon: "search",
    image: "/service_hubs.png"
  },
  {
    id: 2,
    title: "Customize Your Products",
    icon: "box",
    image: "/service_customize.png"
  },
  {
    id: 3,
    title: "Fast, reliable shipping by ocean or air",
    icon: "send",
    image: "/service_shipping.png"
  },
  {
    id: 4,
    title: "Product monitoring and inspection",
    icon: "shield",
    image: "/service_inspection.png"
  }
];

export const suppliers = [
  { country: "Arabic Emirates", domain: "shopname.ae", flag: "🇦🇪", flagImg: "/flag_uae.png" },
  { country: "Australia", domain: "shopname.ae", flag: "🇦🇺", flagImg: "/flag_australia.png" },
  { country: "United States", domain: "shopname.ae", flag: "🇺🇸", flagImg: "/flag_usa.png" },
  { country: "Russia", domain: "shopname.ru", flag: "🇷🇺", flagImg: "/flag_russia.png" },
  { country: "Italy", domain: "shopname.it", flag: "🇮🇹", flagImg: "/flag_italy.png" },
  { country: "Denmark", domain: "denmark.com.dk", flag: "🇩🇰", flagImg: "/flag_denmark.png" },
  { country: "France", domain: "shopname.com.fr", flag: "🇫🇷", flagImg: "/flag_france.png" },
  { country: "Arabic Emirates", domain: "shopname.ae", flag: "🇦🇪", flagImg: "/flag_uae.png" }, // Duplicate as shown in footer/region list
  { country: "China", domain: "shopname.ae", flag: "🇨🇳", flagImg: "/flag_china.png" },
  { country: "Great Britain", domain: "shopname.co.uk", flag: "🇬🇧", flagImg: "/flag_uk.png" }
];

export const filterCategories = [
  "Mobile accessory",
  "Electronics",
  "Smartphones",
  "Modern tech"
];

export const filterBrands = [
  "Samsung",
  "Apple",
  "Huawei",
  "Pocco",
  "Lenovo"
];

export const filterFeatures = [
  "Metallic",
  "Plastic cover",
  "8GB Ram",
  "Super power",
  "Large Memory",
  "64GB"
];

export const filterConditions = [
  "Any",
  "Refurbed",
  "Brand new",
  "Old items"
];

export const listingProducts = [
  {
    id: 1,
    title: "GoPro HERO6 4K Action Camera - Black",
    price: "$99.50",
    originalPrice: "$1128.00",
    rating: 7.5,
    orders: 154,
    shipping: "Free Shipping",
    brand: "Apple",
    manufacturer: "Apple",
    features: ["Metallic", "Super power", "64GB"],
    description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
    image: "/electric_kettle_iphone.png"
  },
  {
    id: 2,
    title: "GoPro HERO6 4K Action Camera - Black",
    price: "$99.50",
    originalPrice: "$1128.00",
    rating: 5.9,
    orders: 154,
    shipping: "Free Shipping",
    brand: "Samsung",
    manufacturer: "Samsung",
    features: ["Metallic"],
    description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit",
    image: "/deal_phone.png"
  },
  {
    id: 3,
    title: "GoPro HERO6 4K Action Camera - Black",
    price: "$99.50",
    originalPrice: null,
    rating: 7.5,
    orders: 154,
    shipping: "Free Shipping",
    brand: "Pocco",
    manufacturer: "Xiaomi",
    features: ["Metallic", "Plastic cover", "64GB"],
    description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit",
    image: "/smartphones_electronics.png"
  },
  {
    id: 4,
    title: "GoPro HERO6 4K Action Camera - Black",
    price: "$99.50",
    originalPrice: "$1128.00",
    rating: 7.5,
    orders: 154,
    shipping: "Free Shipping",
    brand: "Apple",
    manufacturer: "Apple",
    features: ["Metallic", "8GB Ram"],
    description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit",
    image: "/laptop_electronics.png"
  },
  {
    id: 5,
    title: "GoPro HERO6 4K Action Camera - Black",
    price: "$99.50",
    originalPrice: "$1128.00",
    rating: 7.5,
    orders: 154,
    shipping: "Free Shipping",
    brand: "Samsung",
    manufacturer: "Sony",
    features: ["Metallic", "Super power"],
    description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit",
    image: "/camera_electronics.png"
  },
  {
    id: 6,
    title: "GoPro HERO6 4K Action Camera - Black",
    price: "$99.50",
    originalPrice: null,
    rating: 7.5,
    orders: 154,
    shipping: "Free Shipping",
    brand: "Apple",
    manufacturer: "Apple",
    features: ["Metallic", "Large Memory"],
    description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit",
    image: "/deal_phone.png"
  },
  {
    id: 7,
    title: "GoPro HERO6 4K Action Camera - Black",
    price: "$120.00",
    originalPrice: "$150.00",
    rating: 6.0,
    orders: 120,
    shipping: "Free Shipping",
    brand: "Huawei",
    manufacturer: "Huawei",
    features: ["Plastic cover", "8GB Ram", "64GB"],
    description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    image: "/deal_phone.png"
  },
  {
    id: 8,
    title: "GoPro HERO6 4K Action Camera - Black",
    price: "$450.00",
    originalPrice: "$500.00",
    rating: 8.5,
    orders: 200,
    shipping: "Free Shipping",
    brand: "Lenovo",
    manufacturer: "Lenovo",
    features: ["8GB Ram", "Large Memory"],
    description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    image: "/laptop_electronics.png"
  }
];

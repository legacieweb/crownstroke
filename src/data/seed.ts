import { Product } from '../types';

export const PRODUCT_DATA: any = {
  't-shirt': {
    '#ffffff': {
      front: 'https://i.imgur.com/1PSq0jv.png',
      back: 'https://i.imgur.com/oEenycn.png',
    },
    '#000000': {
      front: 'https://i.imgur.com/3J0YJ77.png',
      back: 'https://i.imgur.com/vY3s8O5.png',
    },
    '#ef4444': {
      front: 'https://i.imgur.com/99R56YS.png',
      back: 'https://i.imgur.com/InY9HIp.png',
    }
  },
  'hoodie': {
    '#000000': {
      front: 'https://i.imgur.com/aOIBIZn.png',
      back: 'https://i.imgur.com/6EVlfhd.png',
    },
    '#ffffff': {
      front: 'https://i.imgur.com/BxITaC1.png',
      back: 'https://i.imgur.com/hUdjIvj.png',
    }
  },
  'long-sleeve-tee': {
    '#ffffff': {
      front: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800',
      back: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800&flip=h',
    },
    '#000000': {
      front: 'https://images.unsplash.com/photo-1618354691229-88d47f285158?auto=format&fit=crop&q=80&w=800',
      back: 'https://images.unsplash.com/photo-1618354691229-88d47f285158?auto=format&fit=crop&q=80&w=800&flip=h',
    }
  },
  'tank-top': {
    '#ffffff': {
      front: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&q=80&w=800',
      back: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&q=80&w=800&flip=h',
    },
    '#000000': {
      front: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800',
      back: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800&flip=h',
    }
  },
  'mug': {
    '#ffffff': {
      front: 'https://i.imgur.com/1XDgkYa.png',
      back: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800&flip=h',
    },
    '#000000': {
      front: 'https://images.unsplash.com/photo-1517256011271-101ad9d4bbfa?auto=format&fit=crop&q=80&w=800',
      back: 'https://images.unsplash.com/photo-1517256011271-101ad9d4bbfa?auto=format&fit=crop&q=80&w=800&flip=h',
    }
  },
  'poster': {
    '#ffffff': {
      front: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
      back: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800&flip=h',
    }
  },
  'art-design': {
    '#ffffff': {
      front: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800',
      back: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800&flip=h',
    }
  }
};

export const READY_MADE_PRODUCTS: Product[] = [
  {
    id: 'ready-1',
    name: 'Elite Signature Tee',
    description: 'Premium oversized t-shirt crafted from ethically-sourced cotton. Features a modern fit with our signature crown emblem. Material: 100% organic ring-spun cotton. Weight: 4.3 oz. Available in white, black, and red.',
    price: 1500,
    image: 'https://i.imgur.com/1PSq0jv.png',
    category: 't-shirt',
    isCustomizable: true,
    colors: ['#ffffff', '#000000', '#ef4444'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: {
      front: 'https://i.imgur.com/1PSq0jv.png',
      back: 'https://i.imgur.com/oEenycn.png'
    }
  },
  {
    id: 'ready-2',
    name: 'Legend Urban Hoodie',
    description: 'Heavyweight fleece hoodie with ribbed cuffs and hem. Designed for comfort with a bold street-ready aesthetic. Material: 80% cotton / 20% polyester blend. Weight: 10.2 oz. Features kangaroo pocket and adjustable drawstring.',
    price: 3500,
    image: 'https://i.imgur.com/aOIBIZn.png',
    category: 'hoodie',
    isCustomizable: true,
    colors: ['#000000', '#ffffff'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: {
      front: 'https://i.imgur.com/aOIBIZn.png',
      back: 'https://i.imgur.com/6EVlfhd.png'
    }
  },
  {
    id: 'ready-3',
    name: 'Minimalist Art Mug',
    description: 'Premium ceramic mug with a sleek matte finish. Perfect for your morning brew or as a design canvas. Capacity: 330ml / 11oz. Microwave and dishwasher safe. Features ergonomic C-handle design.',
    price: 1200,
    image: 'https://i.imgur.com/1XDgkYa.png',
    category: 'mug',
    isCustomizable: true,
    colors: ['#ffffff', '#000000'],
    images: {
      front: 'https://i.imgur.com/1XDgkYa.png',
      back: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800&flip=h'
    }
  },
  {
    id: 'ready-4',
    name: 'Premium Art Poster',
    description: 'Museum-quality art poster printed on premium paper. High-resolution artwork ready to elevate any space. Size: A2 (420mm x 594mm). Printed on 250gsm silk paper with vibrant archival inks.',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
    category: 'poster',
    isCustomizable: true,
    colors: ['#ffffff'],
    images: {
      front: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
      back: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800&flip=h'
    }
  },
  {
    id: 'ready-5',
    name: 'Elite Art Design',
    description: 'Exclusive digital artwork from Crownstroke collection. Bold geometric patterns meet contemporary minimalism. High-resolution digital file for personal use. Perfect for posters, prints, or digital displays.',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800',
    category: 'art-design',
    isCustomizable: true,
    colors: ['#ffffff'],
    images: {
      front: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800',
      back: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800&flip=h'
    }
  },
  {
    id: 'ready-6',
    name: 'Urban Streetwear Long Sleeve',
    description: 'Contemporary long sleeve tee with tapered fit. Made from premium jersey with exceptional durability. Material: 100% combed cotton jersey. Weight: 5.2 oz. Features double-stitched seams for longevity.',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800',
    category: 'long-sleeve-tee',
    isCustomizable: true,
    colors: ['#ffffff', '#000000'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: {
      front: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800',
      back: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800&flip=h'
    }
  }
];

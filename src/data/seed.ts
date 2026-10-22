import { Product } from '../types';

export const PRODUCT_DATA: any = {
  't-shirt': {
    '#ffffff': {
      front: 'https://i.imgur.com/UtVWuDD.png',
      back: 'https://i.imgur.com/hxmn9c9.png',
    },
    '#000000': {
      front: 'https://i.imgur.com/Lzi8Lac.png',
      back: 'https://i.imgur.com/ZB3rtI1.png',
    },
    '#ef4444': {
      front: 'https://i.imgur.com/bkclLY6.png',
      back: 'https://i.imgur.com/z9LXfA2.png',
    }
  },
  'hoodie': {
    '#000000': {
      front: 'https://i.imgur.com/gP6peYl.png',
      back: 'https://i.imgur.com/6kJOYbH.png',
    },
    '#ffffff': {
      front: 'https://i.imgur.com/FnWbDhy.png',
      back: 'https://i.imgur.com/Y8NZB3M.png',
    }
  },
  'long-sleeve-tee': {
    '#ffffff': {
      front: 'https://i.imgur.com/jJM4L4y.png',
      back: 'https://i.imgur.com/to7OfLW.png',
    },
    '#000000': {
      front: 'https://i.imgur.com/KkWLntj.png',
      back: 'https://i.imgur.com/oyFsyfN.png',
    }
  },
  'tank-top': {
    '#ffffff': {
      front: 'https://i.imgur.com/7eGH499.png',
      back: 'https://i.imgur.com/cN1e9V4.png',
    },
    '#000000': {
      front: 'https://i.imgur.com/7yQetz0.png',
      back: 'https://i.imgur.com/ut9jT6M.png',
    }
  },
  'mug': {
    '#ffffff': {
      front: 'https://i.imgur.com/uezu9tp.png',
      back: 'https://i.imgur.com/MVe8Lp3.png',
    },
    '#000000': {
      front: 'https://i.imgur.com/SbVltHS.png',
      back: 'https://i.imgur.com/7foteLb.png',
    }
  },
  'poster': {
    '#ffffff': {
      front: 'https://i.imgur.com/YlKbqZ2.png',
      back: 'https://i.imgur.com/KLxCHM3.png',
    }
  },
  'art-design': {
    '#ffffff': {
      front: 'https://i.imgur.com/m5hzUeq.png',
      back: 'https://i.imgur.com/Awayw3t.png',
    }
  }
};

export const READY_MADE_PRODUCTS: Product[] = [
  {
    id: 'ready-1',
    name: 'Elite Signature Tee',
    description: 'Premium oversized t-shirt crafted from ethically-sourced cotton. Features a modern fit with our signature crown emblem. Material: 100% organic ring-spun cotton. Weight: 4.3 oz. Available in white, black, and red.',
    price: 1500,
    image: 'https://i.imgur.com/y7Zfbvy.png',
    category: 't-shirt',
    isCustomizable: true,
    colors: ['#ffffff'],
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
    image: 'https://i.imgur.com/y7Zfbvy.png',
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
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1024&h=1536',
    category: 'poster',
    isCustomizable: true,
    colors: ['#ffffff'],
    images: {
      front: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1024&h=1536',
      back: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1536&h=1024'
    }
  },
  {
    id: 'ready-5',
    name: 'Elite Art Design',
    description: 'Exclusive digital artwork from Crownstroke collection. Bold geometric patterns meet contemporary minimalism. High-resolution digital file for personal use. Perfect for posters, prints, or digital displays.',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=1024&h=1536',
    category: 'art-design',
    isCustomizable: true,
    colors: ['#ffffff'],
    images: {
      front: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=1024&h=1536',
      back: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=1536&h=1024'
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

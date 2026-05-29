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
    description: '',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
    category: 't-shirt',
    isCustomizable: true
  },
  {
    id: 'ready-2',
    name: 'Legend Urban Hoodie',
    description: '',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800',
    category: 'hoodie',
    isCustomizable: true
  },
  {
    id: 'ready-3',
    name: 'Minimalist Art Mug',
    description: '',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800',
    category: 'mug',
    isCustomizable: true
  },
  {
    id: 'ready-4',
    name: 'Premium Art Poster',
    description: '',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
    category: 'poster',
    isCustomizable: true
  },
  {
    id: 'ready-5',
    name: 'Elite Art Design',
    description: '',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800',
    category: 'poster', // Was art-design, which is not in the Product category type
    isCustomizable: true
  },
  {
    id: 'ready-6',
    name: 'Urban Streetwear Long Sleeve',
    description: '',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800',
    category: 'long-sleeve-tee',
    isCustomizable: true
  }
];

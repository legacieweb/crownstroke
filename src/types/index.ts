export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 't-shirt' | 'hoodie' | 'mug' | 'long-sleeve-tee' | 'tank-top' | 'poster';
  isCustomizable: boolean;
  colors?: string[];
  sizes?: string[];
}

export interface DesignElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  content: string;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  angle: number;
  fill?: string;
  fontFamily?: string;
  fontSize?: number;
}

export interface CustomDesign {
  id?: string;
  designerId?: string;
  productId: string;
  elements: DesignElement[];
  previewImage: string;
  isDoubleSided?: boolean;
  previews?: {
    front?: string;
    back?: string;
  };
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  customDesign?: CustomDesign;
  selectedColor?: string;
  selectedSize?: string;
}

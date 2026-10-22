import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { fabric } from 'fabric';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Layout, { BackendStatusContext } from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import { db } from '../db';
import { designerDesigns, designers, shops } from '../db/schema';
import { eq } from 'drizzle-orm';
import { 
  Type, 
  Image as ImageIcon, 
  Trash2, 
  Undo2, 
  Redo2, 
  Download, 
  ShoppingBag, 
  ChevronLeft, 
  Maximize2,
  Plus,
  LayoutGrid,
  RefreshCcw,
  Eye,
  Link as LinkIcon,
  X,
  Menu,
  ChevronDown,
  ShieldAlert,
  HelpCircle,
  UploadCloud
} from 'lucide-react';
import { clsx } from 'clsx';

// Types for complex product state
interface ProductView {
  front: string;
  back: string;
}

interface ProductImages {
  [color: string]: ProductView;
}

import { PRODUCT_DATA as SEED_DATA } from '../data/seed';

const PRODUCT_DATA: Record<string, ProductImages> = SEED_DATA;

const DESIGN_CONFIG: Record<string, { top: number; left: number; scale: number }> = {
  // Map the full 380x480 pad onto the garment face so designs placed near its
  // lower edge can reach the hem in the product preview without being stretched.
  't-shirt': { top: 150, left: 86, scale: 1.65 },
  'hoodie': { top: 150, left: 86, scale: 1.65 },
  'long-sleeve-tee': { top: 150, left: 86, scale: 1.65 },
  'tank-top': { top: 150, left: 86, scale: 1.65 },
  // Keep artwork on the mug body while letting the pad reach its lower edge.
  'mug': { top: 220, left: 187, scale: 1.12 },
  // Flat products use most of their printable surface, nearly edge to edge.
  'art-design': { top: 70, left: 52, scale: 1.83 },
  'poster': { top: 70, left: 52, scale: 1.83 }
};

const MIN_PRICES: Record<string, number> = {
  't-shirt': 1500,
  'hoodie': 3500,
  'mug': 1200,
  'art-design': 1200,
  'poster': 1200
};

const FONTS = [
  'Arial', 
  'Roboto', 
  'Pacifico', 
  'Impact', 
  'Bebas Neue', 
  'Permanent Marker', 
  'Dancing Script',
  'Montserrat',
  'Oswald',
  'Playfair Display',
  'Poppins',
  'Lobster',
  'Raleway',
  'Ubuntu',
  'Cinzel',
  'Righteous',
  'Abril Fatface',
  'Comfortaa',
  'Kaushan Script',
  'Gloria Hallelujah'
];
const COLORS = [
  '#ffffff', '#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', 
  '#ec4899', '#8b5cf6', '#06b6d4', '#71717a', '#78350f', '#14532d'
];

const PREVIEW_WIDTH = 600;
const PREVIEW_HEIGHT = 750;
const PREVIEW_SCALE = PREVIEW_WIDTH / 800;
const isFlatPrint = (product: string) => product === 'poster' || product === 'art-design';
const getCanvasDimensions = (product: string, side: 'front' | 'back') => {
  if (!isFlatPrint(product)) return { width: 380, height: 480 };
  return side === 'front' ? { width: 320, height: 480 } : { width: 480, height: 320 };
};
const getPrintDimensions = (side: 'front' | 'back') => side === 'front'
  ? { orientation: 'Portrait', mockup: '1024 × 1536 px', ratio: '2:3', artwork: '4000 × 6000 px' }
  : { orientation: 'Landscape', mockup: '1536 × 1024 px', ratio: '3:2', artwork: '6000 × 4000 px' };

const canvasToCompactDataUrl = (canvas: HTMLCanvasElement, quality = 0.82) => {
  const webp = canvas.toDataURL('image/webp', quality);
  if (webp.startsWith('data:image/webp')) return webp;
  return canvas.toDataURL('image/jpeg', quality);
};

const optimizeImageFile = (file: File, maxSize = 1400, quality = 0.84, onProgress?: (progress: number) => void): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.min(38, Math.round((event.loaded / event.total) * 38)));
    };
    reader.onload = () => {
      onProgress?.(42);
      const img = new Image();
      img.onload = () => {
        onProgress?.(76);
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not optimize uploaded image.'));
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const optimized = canvasToCompactDataUrl(canvas, quality);
        onProgress?.(88);
        resolve(optimized);
      };
      img.onerror = () => reject(new Error('Could not read uploaded image.'));
      img.src = reader.result as string;
    };

    reader.onerror = () => reject(new Error('Could not read uploaded image.'));
    reader.readAsDataURL(file);
  });
};

import { useSeo } from '../hooks/useSeo';
import { CROWNSTROKE_BASE } from './SeoDefaults';

const Designer: React.FC = () => {
  useEffect(() => {
    const fontStyles = document.createElement('link');
    fontStyles.rel = 'stylesheet';
    fontStyles.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Pacifico&family=Bebas+Neue&family=Permanent+Marker&family=Dancing+Script:wght@400;700&family=Oswald:wght@400;700&family=Poppins:wght@400;600&family=Lobster&family=Raleway:wght@400;700&family=Ubuntu:wght@400;700&family=Cinzel&family=Righteous&family=Abril+Fatface&family=Comfortaa:wght@400;700&family=Kaushan+Script&family=Gloria+Hallelujah&display=swap';
    document.head.appendChild(fontStyles);
    return () => fontStyles.remove();
  }, []);

  useSeo({
    title: 'Design Studio | Crownstroke',
    description:
      'Create premium designs in the Crownstroke studio. Customize products, preview in real time, deploy to your shop, and shop designer drops.',
    canonicalUrl: `${CROWNSTROKE_BASE.url}/designer`,
    ogImage: CROWNSTROKE_BASE.ogImage,
    robots: 'index,follow'
  });
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isOnline } = React.useContext(BackendStatusContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialProduct = searchParams.get('product') || 't-shirt';
  const [activeProduct, setActiveProduct] = useState(initialProduct);
  const [activeColor, setActiveColor] = useState('#ffffff');
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const flatProduct = isFlatPrint(activeProduct);
  const printSpec = getPrintDimensions(activeSide);
  const [activeTab, setActiveTab] = useState<'product' | 'text' | 'upload'>('product');
  const [hasSelection, setHasSelection] = useState(false);
  const [selectedImage, setSelectedImage] = useState<fabric.Image | null>(null);
  const [imageCornerRadius, setImageCornerRadius] = useState(0);
  const [showDrafts, setShowDrafts] = useState(false);
  const [showLargePreview, setShowLargePreview] = useState(false);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState('');
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  
  // Save to Shop Modal State
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveDesignName, setSaveDesignName] = useState('');
  const [saveDesignPrice, setSaveDesignPrice] = useState('2500');
  const [isSaving, setIsSaving] = useState(false);
  
  // Undo/Redo State
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isHistoryLocked = useRef(false);

  // Custom Popup State
  const [popup, setPopup] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'alert' | 'confirm';
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    type: 'alert'
  });

  const showAlert = (title: string, message: string) => {
    setPopup({ show: true, title, message, type: 'alert' });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => {
    setPopup({ show: true, title, message, type: 'confirm', onConfirm, onCancel });
  };
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const changeImageInputRef = useRef<HTMLInputElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [mirrorPreview, setMirrorPreview] = useState<string>('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, visible: boolean, target: any } | null>(null);
  const updateMirrorPreviewRef = useRef<() => void>();
  const saveHistoryRef = useRef<() => void>();
  const previewTimerRef = useRef<number | null>(null);
  const previewRenderIdRef = useRef(0);
  const designDataRef = useRef<Record<string, any>>({ front: null, back: null });

  const saveHistory = useCallback(() => {
    if (!fabricCanvas || isHistoryLocked.current) return;
    const json = JSON.stringify(fabricCanvas.toJSON());
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      if (newHistory[newHistory.length - 1] === json) return prev;
      return [...newHistory, json].slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => {
      const newIndex = historyIndex + 1;
      return Math.min(newIndex, 49);
    });
  }, [fabricCanvas, historyIndex]);

  useEffect(() => {
    saveHistoryRef.current = saveHistory;
  }, [saveHistory]);

  const deleteObject = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length) {
      fabricCanvas.discardActiveObject();
      activeObjects.forEach((obj) => {
        fabricCanvas.remove(obj);
      });
      updateMirrorPreview();
    }
    setContextMenu(null);
  };

  const clearCanvas = () => {
    if (!fabricCanvas) return;
    showConfirm(
      'Clear Canvas?',
      'Are you sure you want to clear all designs from this side? This action cannot be undone.',
      () => {
        fabricCanvas.clear();
        updateMirrorPreview();
        saveHistory();
      }
    );
  };

  const duplicateObject = () => {
    if (!fabricCanvas || !contextMenu?.target) return;
    contextMenu.target.clone((cloned: any) => {
      cloned.set({
        left: cloned.left + 20,
        top: cloned.top + 20,
      });
      fabricCanvas.add(cloned);
      fabricCanvas.setActiveObject(cloned);
      updateMirrorPreview();
    });
    setContextMenu(null);
  };

  const changeColor = (color: string) => {
    if (!fabricCanvas || !contextMenu?.target) return;
    contextMenu.target.set('fill', color);
    fabricCanvas.renderAll();
    updateMirrorPreview();
    setContextMenu(null);
  };

  const triggerChangeImage = () => {
    if (changeImageInputRef.current) {
      changeImageInputRef.current.click();
    }
  };

  const handleChangeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && fabricCanvas && contextMenu?.target && contextMenu.target.type === 'image') {
      try {
        const optimizedImage = await optimizeImageFile(file);
        fabric.Image.fromURL(optimizedImage, (img) => {
          if (!img) return;
          const target = contextMenu.target as fabric.Image;
          target.setSrc(optimizedImage, () => {
            fabricCanvas.renderAll();
            updateMirrorPreview();
          });
        });
      } catch (err) {
        console.error('Failed to optimize replacement image:', err);
        showAlert('Error', 'Failed to process image.');
      }
    }
    setContextMenu(null);
  };

  const updateMirrorPreview = useCallback(async () => {
    if (!fabricCanvas) return;

    const renderId = ++previewRenderIdRef.current;
    const flatPrint = isFlatPrint(activeProduct);
    const outputWidth = flatPrint ? (activeSide === 'front' ? 600 : 900) : PREVIEW_WIDTH;
    const outputHeight = flatPrint ? (activeSide === 'front' ? 900 : 600) : PREVIEW_HEIGHT;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = outputWidth;
    tempCanvas.height = outputHeight;
    const ctx = tempCanvas.getContext('2d');
    
    if (ctx) {
      const productImg = new Image();
      productImg.crossOrigin = "anonymous";
      productImg.src = PRODUCT_DATA[activeProduct]?.[activeColor]?.[activeSide] || PRODUCT_DATA['t-shirt']['#ffffff'].front;
      
      productImg.onload = () => {
        if (renderId !== previewRenderIdRef.current) return;
        if (!ctx) {
          setIsPreviewLoading(false);
          return;
        }
        ctx.clearRect(0, 0, outputWidth, outputHeight);
        ctx.drawImage(productImg, 0, 0, outputWidth, outputHeight);
        
        const designDataUrl = fabricCanvas.toDataURL({ 
          format: 'png', 
          quality: 0.82,
          multiplier: 1
        });
        
        const designImg = new Image();
        designImg.src = designDataUrl;
        designImg.onload = () => {
          if (renderId !== previewRenderIdRef.current) return;
          if (flatPrint) {
            const margin = Math.round(Math.min(outputWidth, outputHeight) * 0.035);
            ctx.drawImage(designImg, margin, margin, outputWidth - margin * 2, outputHeight - margin * 2);
          } else {
            const config = DESIGN_CONFIG[activeProduct] || { top: 80, left: 210, scale: 1.0 };
            ctx.drawImage(
              designImg,
              config.left * PREVIEW_SCALE,
              config.top * PREVIEW_SCALE,
              380 * config.scale * PREVIEW_SCALE,
              480 * config.scale * PREVIEW_SCALE
            );
          }
          setMirrorPreview(canvasToCompactDataUrl(tempCanvas));
          setIsPreviewLoading(false);
        };
        designImg.onerror = () => {
          if (renderId !== previewRenderIdRef.current) return;
          setMirrorPreview(canvasToCompactDataUrl(tempCanvas));
          setIsPreviewLoading(false);
        };
      };
      productImg.onerror = () => {
        if (renderId !== previewRenderIdRef.current) return;
        const designDataUrl = fabricCanvas.toDataURL({ format: 'jpeg', quality: 0.82, multiplier: 1 });
        setMirrorPreview(designDataUrl);
        setIsPreviewLoading(false);
      };
    }
  }, [fabricCanvas, activeProduct, activeColor, activeSide]);

  useEffect(() => {
    updateMirrorPreviewRef.current = updateMirrorPreview;
  }, [updateMirrorPreview]);

  useEffect(() => {
    if (!showLargePreview) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowLargePreview(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [showLargePreview]);

  const scheduleMirrorPreview = useCallback(() => {
    if (previewTimerRef.current) {
      window.clearTimeout(previewTimerRef.current);
    }

    previewTimerRef.current = window.setTimeout(() => {
      updateMirrorPreviewRef.current?.();
      previewTimerRef.current = null;
    }, 120);
  }, []);

  useEffect(() => {
    const savedDrafts = JSON.parse(localStorage.getItem('crownstroke_drafts') || '[]');
    setDrafts(savedDrafts);
  }, []);

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && fabricCanvas) {
      const loadEditDesign = async () => {
        try {
          const design = await db.select()
            .from(designerDesigns)
            .where(eq(designerDesigns.id, editId))
            .limit(1);
          
          if (design.length > 0) {
            const d = design[0];
            setActiveProduct(d.productId);
            const data = d.designData as any;
            const editSide = data.activeSide === 'back' ? 'back' : 'front';
            setActiveSide(editSide);
            designDataRef.current = data;
            setDesignData(data);
            
            if (data[editSide]) {
              fabricCanvas.setDimensions(getCanvasDimensions(d.productId, editSide));
              fabricCanvas.loadFromJSON(data[editSide], () => {
                fabricCanvas.renderAll();
                updateMirrorPreview();
              });
            }
            
            setSaveDesignName(d.name);
            setSaveDesignPrice(d.price.toString());
          }
        } catch (err) {
          console.error('Failed to load design for editing:', err);
        }
      };
      loadEditDesign();
    }
  }, [searchParams, fabricCanvas]);
  
  const [designData, setDesignData] = useState<Record<string, any>>({
    front: null,
    back: null
  });

  useEffect(() => {
    designDataRef.current = designData;
  }, [designData]);

  useEffect(() => {
    const productData = PRODUCT_DATA[activeProduct];
    if (!productData) {
      setActiveProduct('t-shirt');
      return;
    }

    const productColors = Object.keys(productData);
    
    if (!productData[activeColor]?.[activeSide]) {
      setActiveSide('front');
    }

    if (productColors.length > 0 && !productColors.includes(activeColor)) {
      setActiveColor(productColors[0]);
    }
  }, [activeProduct]);

  useEffect(() => {
    if (canvasRef.current) {
      // Keep Fabric's design coordinates stable; CSS fits the 4:5 canvas to the pad.
      const canvasSize = getCanvasDimensions(activeProduct, activeSide);

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: canvasSize.width,
        height: canvasSize.height,
        backgroundColor: 'transparent',
        preserveObjectStacking: true,
        fireRightClick: true,
        stopContextMenu: true,
      });

      const syncSelection = () => {
        const active = canvas.getActiveObject();
        const image = active?.type === 'image' ? active as fabric.Image : null;
        setHasSelection(!!active);
        setSelectedImage(image);
        const clip = image?.clipPath as fabric.Rect | undefined;
        setImageCornerRadius(clip?.type === 'rect' ? Math.round(clip.rx || 0) : 0);
      };
      canvas.on('selection:created', syncSelection);
      canvas.on('selection:updated', syncSelection);
      canvas.on('selection:cleared', syncSelection);
      
      canvas.on('mouse:down', (options) => {
        if (options.button === 3 && options.target) {
          setContextMenu({
            x: options.e.clientX,
            y: options.e.clientY,
            visible: true,
            target: options.target
          });
        } else {
          setContextMenu(null);
        }
      });

      const triggerMirrorUpdate = () => {
        if (updateMirrorPreviewRef.current) updateMirrorPreviewRef.current();
        if (saveHistoryRef.current) saveHistoryRef.current();
      };

      canvas.on('object:modified', triggerMirrorUpdate);
      canvas.on('object:added', triggerMirrorUpdate);
      canvas.on('object:removed', triggerMirrorUpdate);
      canvas.on('object:moving', () => {
        scheduleMirrorPreview();
      });
      canvas.on('object:scaling', () => {
        scheduleMirrorPreview();
      });
      canvas.on('object:rotating', () => {
        scheduleMirrorPreview();
      });

      setFabricCanvas(canvas);
      
      // Save initial state
      setTimeout(() => {
        const json = JSON.stringify(canvas.toJSON());
        setHistory([json]);
        setHistoryIndex(0);
      }, 100);

      return () => {
        if (previewTimerRef.current) {
          window.clearTimeout(previewTimerRef.current);
        }
        canvas.dispose();
      };
    }
  }, [scheduleMirrorPreview]);

  useEffect(() => {
    if (!fabricCanvas) return;
    const canvasSize = getCanvasDimensions(activeProduct, activeSide);
    fabricCanvas.setDimensions(canvasSize);
    fabricCanvas.requestRenderAll();
  }, [fabricCanvas, activeProduct, activeSide]);

  useLayoutEffect(() => {
    setIsPreviewLoading(true);
    updateMirrorPreview();
  }, [activeProduct, activeColor, activeSide, updateMirrorPreview]);

  const switchSide = (side: 'front' | 'back') => {
    if (!fabricCanvas || side === activeSide) return;
    
    const currentJSON = fabricCanvas.toJSON();
    const nextDesigns = { ...designDataRef.current, [activeSide]: currentJSON };
    designDataRef.current = nextDesigns;
    setDesignData(nextDesigns);

    const canvasSize = getCanvasDimensions(activeProduct, side);
    fabricCanvas.setDimensions(canvasSize);
    
    fabricCanvas.clear();
    const otherDesign = nextDesigns[side];
    const finishSideChange = () => {
      fabricCanvas.renderAll();
      setHistory([JSON.stringify(fabricCanvas.toJSON())]);
      setHistoryIndex(0);
    };
    if (otherDesign) {
      fabricCanvas.loadFromJSON(otherDesign, () => {
        finishSideChange();
      });
    } else {
      finishSideChange();
    }
    
    setActiveSide(side);
  };

  const undo = () => {
    if (!fabricCanvas || historyIndex <= 0) return;
    isHistoryLocked.current = true;
    const previousState = history[historyIndex - 1];
    fabricCanvas.loadFromJSON(previousState, () => {
      fabricCanvas.renderAll();
      setHistoryIndex(historyIndex - 1);
      isHistoryLocked.current = false;
      updateMirrorPreview();
    });
  };

  const redo = () => {
    if (!fabricCanvas || historyIndex >= history.length - 1) return;
    isHistoryLocked.current = true;
    const nextState = history[historyIndex + 1];
    fabricCanvas.loadFromJSON(nextState, () => {
      fabricCanvas.renderAll();
      setHistoryIndex(historyIndex + 1);
      isHistoryLocked.current = false;
      updateMirrorPreview();
    });
  };

  const addText = () => {
    if (!fabricCanvas) return;
    const text = new fabric.Textbox('ELITE DESIGN', {
      left: fabricCanvas.width! / 4,
      top: fabricCanvas.height! / 3,
      width: fabricCanvas.width! / 2,
      fontSize: 32,
      fill: activeColor === '#ffffff' ? '#000000' : '#ffffff',
      fontFamily: 'Bebas Neue',
      textAlign: 'center',
      cornerStyle: 'circle',
      transparentCorners: false,
      cornerColor: '#0ea5e9',
    });
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
  };

  const changeFont = (font: string) => {
    if (!fabricCanvas) return;
    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
      (activeObject as any).set('fontFamily', font);
      fabricCanvas.renderAll();
      updateMirrorPreview();
    }
  };

  const changeTextColor = (color: string) => {
    if (!fabricCanvas) return;
    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
      (activeObject as any).set('fill', color);
      fabricCanvas.renderAll();
      updateMirrorPreview();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!fabricCanvas) {
      showAlert('Canvas is loading', 'Please wait a moment, then upload your artwork again.');
      e.target.value = '';
      return;
    }
    if (!file.type.startsWith('image/')) {
      showAlert('Unsupported file', 'Choose a PNG, JPG, or other image file to add to your design.');
      e.target.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showAlert('Image is too large', 'Choose an image under 10 MB.');
      e.target.value = '';
      return;
    }

    setIsUploadingImage(true);
    setUploadProgress(0);
    setUploadFileName(file.name);
    try {
      const optimizedImage = await optimizeImageFile(file, 1400, 0.84, setUploadProgress);
      setUploadProgress(92);
      await new Promise<void>((resolve, reject) => {
        fabric.Image.fromURL(optimizedImage, (img) => {
          if (!img) {
            reject(new Error('Could not place this image on the canvas.'));
            return;
          }
          img.scaleToWidth(fabricCanvas.width! / 2);
          fabricCanvas.add(img);
          fabricCanvas.setActiveObject(img);
          fabricCanvas.renderAll();
          updateMirrorPreview();
          resolve();
        });
      });
      setUploadProgress(100);
      if (window.matchMedia('(max-width: 1023px)').matches) setShowMobileMenu(false);
    } catch (err) {
      console.error('Failed to optimize uploaded image:', err);
      showAlert('Upload failed', 'We could not prepare that image. Please try another file.');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (imageUrl && fabricCanvas) {
      fabric.Image.fromURL(imageUrl, (img) => {
        if (!img) {
          showAlert('Error', 'Failed to load image from URL. Please ensure the URL is correct and the image allows cross-origin access.');
          return;
        }
        img.scaleToWidth(fabricCanvas.width! / 2);
        fabricCanvas.add(img);
        fabricCanvas.setActiveObject(img);
        fabricCanvas.renderAll();
        updateMirrorPreview();
        setImageUrl('');
        setShowUrlInput(false);
        if (window.matchMedia('(max-width: 1023px)').matches) setShowMobileMenu(false);
      }, { crossOrigin: 'anonymous' });
    }
  };

  const applyImageCornerRadius = (value: number) => {
    if (!fabricCanvas || !selectedImage) return;
    const imageWidth = selectedImage.width || 0;
    const imageHeight = selectedImage.height || 0;
    const maxRadius = Math.floor(Math.min(imageWidth, imageHeight) / 2);
    const radius = Math.max(0, Math.min(maxRadius, Math.round(value)));

    if (radius === 0) {
      selectedImage.set('clipPath', undefined);
    } else {
      // Fabric 5 positions relative clip paths around the object's center.
      // Matching the full source dimensions keeps the rounding on the whole image
      // even when the user later moves, scales, or rotates the object.
      const clipPath = new fabric.Rect({
        width: imageWidth,
        height: imageHeight,
        rx: radius,
        ry: radius,
        originX: 'center',
        originY: 'center',
        left: 0,
        top: 0,
      });
      selectedImage.set('clipPath', clipPath);
    }

    selectedImage.setCoords();
    fabricCanvas.requestRenderAll();
    setImageCornerRadius(radius);
    updateMirrorPreviewRef.current?.();
  };

  const renderSidePreview = useCallback((side: 'front' | 'back', sideData: any): Promise<string | null> => {
    if (!sideData?.objects?.length) return Promise.resolve(null);

    return new Promise((resolve) => {
      const flatPrint = isFlatPrint(activeProduct);
      const canvasSize = getCanvasDimensions(activeProduct, side);
      const outputWidth = flatPrint ? (side === 'front' ? 1024 : 1536) : 800;
      const outputHeight = flatPrint ? (side === 'front' ? 1536 : 1024) : 1000;
      const tempCanvas = new fabric.Canvas(null as any, {
        width: canvasSize.width,
        height: canvasSize.height,
        backgroundColor: 'transparent',
        renderOnAddRemove: false,
      });
      const finish = (preview: string | null) => {
        tempCanvas.dispose();
        resolve(preview);
      };

      tempCanvas.loadFromJSON(sideData, () => {
        tempCanvas.renderAll();
        const productImg = new Image();
        productImg.crossOrigin = 'anonymous';
        productImg.onload = () => {
          const productCanvas = document.createElement('canvas');
          productCanvas.width = outputWidth;
          productCanvas.height = outputHeight;
          const ctx = productCanvas.getContext('2d');
          if (!ctx) return finish(null);
          ctx.drawImage(productImg, 0, 0, outputWidth, outputHeight);

          const designImg = new Image();
          designImg.onload = () => {
            if (flatPrint) {
              const margin = Math.round(Math.min(outputWidth, outputHeight) * 0.035);
              ctx.drawImage(designImg, margin, margin, outputWidth - margin * 2, outputHeight - margin * 2);
            } else {
              const config = DESIGN_CONFIG[activeProduct] || { top: 80, left: 210, scale: 1.0 };
              ctx.drawImage(designImg, config.left, config.top, 380 * config.scale, 480 * config.scale);
            }
            finish(canvasToCompactDataUrl(productCanvas, 0.88));
          };
          designImg.onerror = () => finish(null);
          designImg.src = tempCanvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
        };
        productImg.onerror = () => finish(null);
        productImg.src = PRODUCT_DATA[activeProduct]?.[activeColor]?.[side] || '';
      });
    });
  }, [activeProduct, activeColor]);

  const saveToShop = async () => {
    if (!user || !fabricCanvas || !saveDesignName) return;
    
    if (!user.designerId || !user.shopId) {
      showAlert('Error', 'Designer profile or shop not found. Please contact support.');
      return;
    }

    setIsSaving(true);
    try {
      const minPrice = MIN_PRICES[activeProduct] || 1200;
      const currentPrice = parseInt(saveDesignPrice) || 0;

      if (currentPrice < minPrice) {
        showAlert('Price Too Low', `The minimum price for this product is ${minPrice}. You can only increase the amount.`);
        setIsSaving(false);
        return;
      }

      const currentJSON = fabricCanvas.toJSON();
      const sideDesigns = { ...designDataRef.current, [activeSide]: currentJSON };
      const [frontPreview, backPreview] = await Promise.all([
        renderSidePreview('front', sideDesigns.front),
        renderSidePreview('back', sideDesigns.back),
      ]);
      const updatedData = {
        ...sideDesigns,
        previews: { front: frontPreview, back: backPreview },
        activeSide,
      };
      
      const designPayload = {
        name: saveDesignName,
        designerId: user.designerId,
        shopId: user.shopId,
        productId: activeProduct,
        preview: (activeSide === 'front' ? frontPreview : backPreview) || frontPreview || backPreview || mirrorPreview,
        designData: updatedData,
        price: parseInt(saveDesignPrice) || 2500,
        isFeatured: 'false',
        isEditorsPick: 'false',
        isExclusive: 'false',
        isSpringCollection: 'false',
        isMinimalist: 'false',
        isFlashSale: 'false',
      };

      const editId = searchParams.get('edit');
      if (editId) {
        await db.update(designerDesigns).set(designPayload as any).where(eq(designerDesigns.id, editId));
      } else {
        await db.insert(designerDesigns).values(designPayload as any);
      }

      setShowSaveModal(false);
      showAlert('Success', `Design "${saveDesignName}" deployed!`);
      navigate('/designer-dashboard');
    } catch (error) {
      console.error('Error saving design:', error);
      showAlert('Error', 'Failed to save design.');
    } finally {
      setIsSaving(false);
    }
  };

  const saveAsDraft = () => {
    if (!fabricCanvas) return;
    const currentJSON = fabricCanvas.toJSON();
    const updatedData = { ...designData, [activeSide]: currentJSON, activeSide };
    
    const draft = {
      id: Date.now().toString(),
      productId: activeProduct,
      color: activeColor,
      activeSide,
      designData: updatedData,
      preview: mirrorPreview,
      createdAt: new Date().toISOString()
    };
    
    const savedDrafts = JSON.parse(localStorage.getItem('crownstroke_drafts') || '[]');
    const newDrafts = [draft, ...savedDrafts];
    localStorage.setItem('crownstroke_drafts', JSON.stringify(newDrafts));
    setDrafts(newDrafts);
    showAlert('Saved', 'Design saved to drafts!');
  };

  const downloadCurrentDesign = async () => {
    if (!mirrorPreview) return;
    const link = document.createElement('a');
    link.download = `crownstroke-design-${activeProduct}-${Date.now()}.png`;
    link.href = mirrorPreview;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadDraft = (draft: any) => {
    if (!draft.preview) return;
    const link = document.createElement('a');
    link.download = `crownstroke-draft-${draft.productId}-${draft.id}.png`;
    link.href = draft.preview;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDraftsClick = () => {
    showConfirm(
      'Save Progress?', 
      'Would you like to save your current design as a draft first?',
      () => {
        saveAsDraft();
        setShowDrafts(true);
      },
      () => {
        setShowDrafts(true);
      }
    );
  };

  const loadDraft = (draft: any) => {
    const draftSide = draft.activeSide === 'back' ? 'back' : 'front';
    setActiveProduct(draft.productId);
    setActiveColor(draft.color);
    setActiveSide(draftSide);
    designDataRef.current = draft.designData;
    setDesignData(draft.designData);
    
    if (fabricCanvas) {
      fabricCanvas.setDimensions(getCanvasDimensions(draft.productId, draftSide));
      fabricCanvas.clear();
      const currentSideDesign = draft.designData[draftSide];
      if (currentSideDesign) {
        fabricCanvas.loadFromJSON(currentSideDesign, () => {
          fabricCanvas.renderAll();
          setHistory([JSON.stringify(fabricCanvas.toJSON())]);
          setHistoryIndex(0);
        });
      } else {
        setHistory([JSON.stringify(fabricCanvas.toJSON())]);
        setHistoryIndex(0);
      }
    }
    setShowDrafts(false);
  };

  const handleCheckout = async () => {
    if (!isOnline) {
      showAlert('Shop Closed', 'The shop is currently closed. You can still save your design as a draft and checkout once we are open!');
      return;
    }
    if (!fabricCanvas) return;
    const currentJSON = fabricCanvas.toJSON();
    const sideDesigns = { ...designDataRef.current, [activeSide]: currentJSON };
    const [frontPreview, backPreview] = await Promise.all([
      renderSidePreview('front', sideDesigns.front),
      renderSidePreview('back', sideDesigns.back),
    ]);
    const updatedData = {
      ...sideDesigns,
      previews: { front: frontPreview, back: backPreview },
      activeSide,
    };
    const mainPreview = (activeSide === 'front' ? frontPreview : backPreview) || frontPreview || backPreview || mirrorPreview;

    let basePrice = activeProduct === 'hoodie' ? 3500 : (activeProduct === 't-shirt' ? 1500 : 1200);
    if (frontPreview && backPreview) basePrice *= 1.4;

    addToCart({
      id: activeProduct,
      name: activeProduct.charAt(0).toUpperCase() + activeProduct.slice(1),
      description: '',
      price: basePrice,
      image: mainPreview || '',
      category: activeProduct as any,
      isCustomizable: true
    }, 1, 'M', activeColor, {
      productId: activeProduct,
      elements: updatedData as any,
      previewImage: mainPreview,
      isDoubleSided: !!(frontPreview && backPreview),
      previews: { front: frontPreview, back: backPreview }
    });

    navigate('/cart');
  };

  const PRODUCTS = [
    { id: 't-shirt', label: 'Elite Tee' },
    { id: 'hoodie', label: 'Legend Hoodie' },
    { id: 'mug', label: 'Premium Mug' },
    { id: 'art-design', label: 'Elite Art Design' },
    { id: 'poster', label: 'Art Poster' },
  ];

  return (
    <Layout>
      <div 
        className="designer-workspace flex flex-col h-screen overflow-hidden bg-transparent"
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Header Toolbar - Responsive */}
        <div className="bg-black/30 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-4 flex items-center justify-between z-40 shadow-sm shrink-0">
          <div className="flex items-center gap-4 md:gap-8">
            <Link to="/shop" className="shrink-0">
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white gap-2 uppercase font-black tracking-widest text-[10px]">
                <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Exit</span>
              </Button>
            </Link>
            <div className="hidden sm:block h-8 w-px bg-white/10" />
            
            <div className="relative shrink-0">
              <button 
                onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] md:text-xs font-black text-white hover:bg-white/10 transition-all uppercase tracking-widest min-w-[140px] justify-between"
              >
                {PRODUCTS.find(p => p.id === activeProduct)?.label}
                <ChevronDown className={clsx("w-4 h-4 transition-transform", isProductDropdownOpen ? "rotate-180" : "")} />
              </button>
              
              <AnimatePresence>
                {isProductDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProductDropdownOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-full bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 p-1"
                    >
                      {PRODUCTS.map(p => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setActiveProduct(p.id);
                            setIsProductDropdownOpen(false);
                          }}
                          className={clsx(
                            "w-full text-left px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                            activeProduct === p.id ? "bg-primary-500 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          {p.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <button 
              className="lg:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
              {user?.role === 'designer' && (
                <Button variant="premium" className="bg-purple-600 hover:bg-purple-700 h-10 sm:h-11 px-2.5 sm:px-4 lg:px-6 !rounded-xl text-[8px] sm:text-[10px] uppercase font-black tracking-widest gap-1 sm:gap-2 shadow-lg shadow-purple-500/20" onClick={() => setShowSaveModal(true)}>
                  <LayoutGrid className="w-4 h-4" /><span className="hidden sm:inline">Save to Shop</span>
                </Button>
              )}
              <Button
                variant="premium"
                aria-label="Open saved drafts"
                className="bg-slate-800 hover:bg-slate-700 h-10 sm:h-11 px-2.5 sm:px-4 lg:px-6 !rounded-xl text-[8px] sm:text-[10px] uppercase font-black tracking-widest gap-1 sm:gap-2 shadow-lg shadow-white/5 transition-all group"
                onClick={handleDraftsClick}
              >
                <RefreshCcw className="w-4 h-4 text-white/40 group-hover:rotate-180 transition-transform duration-500" /><span className="hidden sm:inline">Drafts</span>
              </Button>
            </div>
            
            <Button 
              variant="premium" 
              className={clsx(
                "h-11 px-8 !rounded-xl text-[10px] uppercase font-black tracking-widest gap-2 shadow-xl relative overflow-hidden group",
                isOnline ? "shadow-primary-500/20" : "opacity-50 grayscale"
              )}
              onClick={handleCheckout}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <ShoppingBag className="w-4 h-4 relative z-10" /> 
              <span className="hidden sm:inline relative z-10">{isOnline ? "Checkout" : "Shop Closed"}</span>
            </Button>
          </div>
        </div>

        <div className="designer-workspace-body flex flex-1 overflow-hidden p-2 md:p-6 gap-2 md:gap-6 flex-col">
          <div className="designer-workspace-columns flex flex-1 overflow-hidden gap-2 md:gap-6 lg:flex-row flex-col relative">
            
{/* Redesigned Integrated Sidebar */}
             <AnimatePresence>
               {(showMobileMenu || window.innerWidth >= 1024) && (
                 <motion.div 
                   initial={showMobileMenu ? { x: -50, opacity: 0 } : false}
                   animate={{ x: 0, opacity: 1 }}
                   exit={{ x: -50, opacity: 0 }}
                   className={clsx(
                     "w-full lg:w-[400px] bg-black/60 backdrop-blur-3xl lg:rounded-[3rem] rounded-2xl flex flex-col border border-white/10 shadow-2xl shrink-0 z-30 transition-all",
                     showMobileMenu ? "fixed left-4 top-24 bottom-24 right-4 lg:relative lg:inset-auto h-auto" : "hidden lg:flex"
                   )}
                 >
                   <div className="p-6 md:p-8 flex flex-col h-full">
                     <div className="flex justify-between items-center mb-6 sm:mb-8">
                       <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tighter uppercase italic flex items-center gap-2 sm:gap-3">
                         <div className="w-1 h-5 sm:w-1.5 sm:h-8 bg-primary-500 rounded-full" />
                         Customize
                       </h3>
                       <button className="lg:hidden text-white/40" onClick={() => setShowMobileMenu(false)}>
                         <X className="w-5 h-5 sm:w-6 sm:h-6" />
                       </button>
                     </div>

                     {/* Integrated Tab Navigation */}
                     <div className="flex bg-white/5 p-1 rounded-xl sm:p-1.5 rounded-2xl mb-4 sm:mb-6">
                       {[
                         { id: 'product', icon: LayoutGrid, label: 'Product' },
                         { id: 'text', icon: Type, label: 'Text' },
                         { id: 'upload', icon: ImageIcon, label: 'Design' },
                       ].map((tab) => (
                         <button
                           key={tab.id}
                           onClick={() => setActiveTab(tab.id as any)}
                           className={clsx(
                             "flex-1 flex flex-col items-center py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all gap-1",
                             activeTab === tab.id ? "bg-white/10 text-primary-400 shadow-xl" : "text-white/30 hover:text-white/60"
                           )}
                         >
                           <tab.icon className={clsx("w-4 h-4 sm:w-5 sm:h-5", activeTab === tab.id ? "text-primary-400" : "")} />
                           <span className="text-[6px] sm:text-[7px] md:text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                      {activeTab === 'product' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div>
                            <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                              <div className="w-1 h-1 bg-primary-500 rounded-full" />
                              Color Palette
                            </h4>
                            <div className="grid grid-cols-6 gap-3">
                              {(Object.keys(PRODUCT_DATA[activeProduct] || PRODUCT_DATA['t-shirt'])).map(color => (
                                <button
                                  key={color}
                                  onClick={() => setActiveColor(color)}
                                  className={clsx(
                                    "aspect-square rounded-xl border-2 transition-all hover:scale-110",
                                    activeColor === color ? "border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)]" : "border-transparent"
                                  )}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>

                          {(
                            <div>
                              <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                <div className="w-1 h-1 bg-primary-500 rounded-full" />
                                {flatProduct ? 'Print orientation' : 'Perspective'}
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                {(['front', 'back'] as const).map(side => (
                                  <button
                                    key={side}
                                    onClick={() => switchSide(side)}
                                    aria-pressed={activeSide === side}
                                    className={clsx(
                                      "flex items-center gap-3 p-3 rounded-xl text-left border transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-300",
                                      activeSide === side ? "bg-primary-400/15 text-white border-primary-300/50 shadow-[0_8px_24px_rgba(14,165,233,.12)]" : "bg-white/[0.035] border-white/10 text-white/55 hover:bg-white/[0.08]"
                                    )}
                                  >
                                    {flatProduct && <span className={clsx('mx-auto flex shrink-0 items-center justify-center rounded-sm border', side === 'front' ? 'h-9 w-6' : 'h-6 w-9', activeSide === side ? 'border-primary-200 bg-primary-200/10' : 'border-white/30')}><span className="h-1 w-1 rounded-full bg-lime-300" /></span>}
                                    <span className="min-w-0">
                                      <span className="block text-[9px] font-black uppercase tracking-[.16em]">{flatProduct ? (side === 'front' ? 'Portrait' : 'Landscape') : `${side} view`}</span>
                                      {flatProduct && <span className="mt-1 block text-[8px] font-semibold text-white/40">{side === 'front' ? '2:3 ratio' : '3:2 ratio'}</span>}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="pt-8 border-t border-white/5">
                            <button 
                              onClick={clearCanvas}
                              className="w-full py-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 text-[9px] font-black uppercase tracking-[0.3em] hover:bg-red-500/10 transition-all flex items-center justify-center gap-3 group"
                            >
                              <Trash2 className="w-4 h-4 group-hover:scale-110 group-hover:rotate-12 transition-all" />
                              Reset All Designs
                            </button>
                          </div>
                        </div>
                      )}

                      {activeTab === 'text' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <Button className="w-full py-5 rounded-2xl gap-3 font-black text-xs shadow-2xl shadow-primary-500/20 uppercase tracking-widest italic h-16" onClick={addText}>
                            <Plus className="w-5 h-5" /> Add New Text
                          </Button>
                          
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                              <div className="w-1 h-1 bg-primary-500 rounded-full" />
                              Typography
                            </h4>
                            
                            {/* Text Color Selection */}
                            <div className="mb-6">
                              <h5 className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mb-3">Text Color</h5>
                              <div className="grid grid-cols-6 gap-2">
                                {COLORS.map(color => (
                                  <button
                                    key={color}
                                    onClick={() => changeTextColor(color)}
                                    className={clsx(
                                      "aspect-square rounded-lg border transition-all hover:scale-110",
                                      "border-white/10 hover:border-white/30"
                                    )}
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                              {FONTS.map(font => (
                                <button
                                  key={font}
                                  onClick={() => changeFont(font)}
                                  className={clsx(
                                    "w-full px-5 py-4 rounded-2xl text-left border transition-all hover:scale-[1.02] flex items-center justify-between group",
                                    "bg-white/5 border-white/5 text-white hover:bg-white/10 hover:border-white/20"
                                  )}
                                  style={{ fontFamily: font }}
                                >
                                  <span className="text-base">{font}</span>
                                  <Type className="w-4 h-4 text-white/10 group-hover:text-primary-500 transition-colors" />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'upload' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                          <section className="rounded-2xl border border-white/10 bg-white/[.035] p-4" aria-labelledby="image-corners-title">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <h4 id="image-corners-title" className="text-[10px] font-black uppercase tracking-[.18em] text-white">Image corners</h4>
                                <p className="mt-1 text-[9px] leading-relaxed text-white/45">Round the full selected image.</p>
                              </div>
                              {selectedImage && <output className="shrink-0 rounded-lg border border-white/10 bg-black/25 px-2.5 py-1.5 text-[9px] font-bold tabular-nums text-primary-200">{imageCornerRadius}px</output>}
                            </div>
                            {selectedImage ? (
                              <>
                                <input
                                  type="range"
                                  min={0}
                                  max={Math.floor(Math.min(selectedImage.width || 0, selectedImage.height || 0) / 2)}
                                  step={1}
                                  value={imageCornerRadius}
                                  onChange={(event) => applyImageCornerRadius(Number(event.target.value))}
                                  onPointerUp={() => saveHistoryRef.current?.()}
                                  onKeyUp={() => saveHistoryRef.current?.()}
                                  aria-label="Selected image corner radius"
                                  aria-describedby="image-corners-help"
                                  className="mt-4 h-2 w-full cursor-pointer accent-sky-400"
                                />
                                <div id="image-corners-help" className="mt-2 flex justify-between text-[8px] font-semibold uppercase tracking-[.14em] text-white/35">
                                  <span>Square</span><span>Fully rounded</span>
                                </div>
                              </>
                            ) : (
                              <p className="mt-4 rounded-xl border border-dashed border-white/10 px-3 py-3 text-[9px] leading-relaxed text-white/45">Select an uploaded image on the Precision Pad to adjust its corners.</p>
                            )}
                          </section>

                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">Add your artwork</h4>
                              <p className="mt-2 text-[10px] leading-relaxed text-white/45">Bring a logo, illustration, or photo onto your product.</p>
                            </div>
                            <span className="shrink-0 rounded-full border border-primary-400/20 bg-primary-400/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-primary-300">PNG · JPG</span>
                          </div>

                          <label className={clsx(
                            'designer-upload-zone group relative flex min-h-[204px] w-full flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border border-dashed p-5 text-center transition-all',
                            isUploadingImage ? 'pointer-events-none border-primary-300/50 bg-primary-500/10' : 'cursor-pointer border-white/20 bg-gradient-to-br from-white/[0.08] to-white/[0.02] hover:border-primary-300/55 hover:from-primary-500/10'
                          )}>
                            <div className="pointer-events-none absolute inset-3 rounded-[1.25rem] border border-white/[0.045]" />
                            {isUploadingImage ? (
                              <div className="relative z-10 flex w-full flex-col items-center" role="status" aria-live="polite">
                                <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-primary-300/25 bg-primary-400/10 text-primary-300">
                                  <RefreshCcw className="h-6 w-6 animate-spin" />
                                </div>
                                <span className="max-w-full truncate text-[11px] font-bold text-white">{uploadFileName}</span>
                                <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-primary-200/75">Preparing your artwork · {uploadProgress}%</span>
                                <div className="mt-4 h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-white/10">
                                  <motion.div className="h-full rounded-full bg-gradient-to-r from-primary-400 to-cyan-300" animate={{ width: `${Math.max(uploadProgress, 6)}%` }} transition={{ duration: .2, ease: 'easeOut' }} />
                                </div>
                              </div>
                            ) : (
                              <div className="relative z-10 flex flex-col items-center">
                                <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-primary-300/20 bg-gradient-to-br from-primary-400/20 to-cyan-400/5 text-primary-200 shadow-[0_10px_35px_rgba(14,165,233,.12)] transition-transform duration-200 group-hover:scale-105">
                                  <UploadCloud className="h-6 w-6" />
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-[0.16em] text-white">Choose an image</span>
                                <span className="mt-2 text-[9px] text-white/45">Select a file from your device</span>
                                <span className="mt-4 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[8px] font-bold uppercase tracking-widest text-white/55">Up to 10 MB</span>
                              </div>
                            )}
                            <input type="file" accept="image/*" className="sr-only" disabled={isUploadingImage} onChange={handleImageUpload} />
                          </label>

                          <div className="relative flex items-center justify-center">
                            <div className="absolute inset-x-0 border-t border-white/10" />
                            <span className="relative bg-[#0a0a0a] px-3 text-[8px] font-black uppercase tracking-[0.24em] text-white/35">or import by link</span>
                          </div>

                            {!showUrlInput ? (
                              <Button variant="outline" className="w-full h-16 border-white/5 bg-white/5 rounded-2xl text-[10px] uppercase font-black tracking-[0.2em] gap-3 text-blue-400" onClick={() => setShowUrlInput(true)}>
                                <LinkIcon className="w-4 h-4 text-blue-400" /> Cloud Import
                              </Button>
                            ) : (
                              <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                                <input 
                                  type="text" 
                                  placeholder="Paste cloud asset URL..."
                                  value={imageUrl}
                                  onChange={(e) => setImageUrl(e.target.value)}
                                  className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 text-xs text-white font-bold outline-none focus:border-primary-500 transition-all placeholder:text-white/10"
                                />
                                <div className="flex gap-2">
                                  <Button className="flex-1 h-12 text-[10px] rounded-xl uppercase font-black tracking-widest" onClick={handleAddImageUrl}>Import</Button>
                                  <Button variant="ghost" className="h-12 px-6 rounded-xl text-[10px] uppercase font-black tracking-widest text-white/20 hover:text-white" onClick={() => setShowUrlInput(false)}>Cancel</Button>
                                </div>
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

{/* Mobile/Desktop Flex Layout */}
             <div className="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 overflow-hidden">
               
               {/* Live Preview Panel - Top on Mobile, Right on Desktop */}
               <div className="designer-preview-column w-full lg:w-[400px] flex flex-col gap-4 sm:gap-6 order-1 lg:order-2 shrink-0">
                 <div className="flex-1 relative bg-black/60 backdrop-blur-3xl rounded-[2rem] sm:rounded-[3rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden min-h-[200px] sm:min-h-[250px] lg:min-h-0">
                    <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between gap-3">
                       <h3 className="text-[9px] sm:text-[10px] md:text-xs font-black text-white uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center gap-2 sm:gap-3 italic">
                         <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500" />
                         Live Preview
                       </h3>
                        <button
                          type="button"
                          onClick={() => setShowLargePreview(true)}
                          disabled={!mirrorPreview || isPreviewLoading}
                          aria-label="Open large preview"
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-[8px] font-black uppercase tracking-[.14em] text-white/75 transition hover:border-primary-300/40 hover:bg-primary-400/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          <Maximize2 className="h-3.5 w-3.5 text-primary-300" />
                          <span className="hidden sm:inline">View large</span>
                        </button>
                   </div>
                  
                   <div className="flex-1 flex items-center justify-center p-4 sm:p-6 relative">
                       <div className="relative w-full rounded-[1.5rem] sm:rounded-2xl md:rounded-[2rem] overflow-hidden bg-slate-900 shadow-2xl border border-white/5" style={{ aspectRatio: flatProduct ? (activeSide === 'front' ? '2 / 3' : '3 / 2') : '4 / 5' }}>
                         {mirrorPreview ? (
                           <motion.img 
                             key={`${activeProduct}-${activeColor}-${activeSide}`}
                             initial={{ opacity: 0.72, scale: 0.985 }}
                             animate={{ opacity: 1, scale: 1 }}
                             transition={{ duration: 0.18, ease: 'easeOut' }}
                             src={mirrorPreview} 
                             className="w-full h-full object-contain"
                             alt={`${activeColor} ${activeProduct} ${activeSide} live design preview`}
                           />
                         ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center gap-3 sm:gap-4 text-white/10">
                             <RefreshCcw className="w-6 h-6 sm:w-8 sm:h-8 animate-spin-slow" />
                           </div>
                         )}
                          <AnimatePresence>
                            {isPreviewLoading && (
                              <motion.div
                                key="preview-brand-loader"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: .16 }}
                                className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md"
                                role="status"
                                aria-live="polite"
                                aria-label={`Loading ${activeColor} ${activeProduct} ${activeSide} preview`}
                              >
                                <div className="relative mb-5 grid h-20 w-20 place-items-center rounded-full border border-white/10 bg-black/35">
                                  <motion.div className="absolute inset-[-7px] rounded-full border border-primary-300/20 border-t-primary-300" animate={{ rotate: 360 }} transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }} />
                                  <img src="https://i.imgur.com/1PBylbz.png" alt="" className="h-12 w-12 object-contain brightness-0 invert drop-shadow-[0_0_12px_rgba(56,189,248,.5)]" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[.22em] text-white/85">Updating preview</span>
                                <span className="mt-2 text-[8px] font-semibold uppercase tracking-[.14em] text-white/45">{activeColor} · {activeProduct.replace('-', ' ')} · {activeSide}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                       </div>
                   </div>

                   <div className="hidden sm:flex p-4 sm:p-6 bg-white/5 flex flex-col gap-2 sm:gap-3">
                       <div className="flex justify-between items-center text-[7px] sm:text-[8px] font-black text-white/40 uppercase tracking-widest">
                         <span>Render Status</span>
                         <span className="text-green-500 animate-pulse">Synced</span>
                       </div>
                       <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                         <motion.div className="h-full bg-primary-500 w-full" initial={{ x: "-100%" }} animate={{ x: "0%" }} transition={{ duration: 1 }} />
                       </div>
                   </div>
                 </div>
                 {flatProduct && (
                   <div className="mx-4 mb-4 rounded-2xl border border-lime-200/20 bg-[linear-gradient(120deg,rgba(190,242,100,.09),rgba(255,255,255,.035)_46%,rgba(255,255,255,.02))] p-4 sm:mx-6 sm:mb-6 sm:p-5">
                     <div className="flex items-start justify-between gap-4">
                       <div>
                         <p className="text-[8px] font-black uppercase tracking-[.22em] text-lime-200/80">Print proof · {printSpec.orientation}</p>
                         <p className="mt-2 text-sm font-black text-white">{printSpec.mockup} <span className="text-white/35">/ {printSpec.ratio}</span></p>
                       </div>
                       <div className={clsx('mt-1 grid shrink-0 place-items-center rounded-sm border border-lime-200/50 bg-lime-100/[.07]', activeSide === 'front' ? 'h-11 w-7' : 'h-7 w-11')} aria-hidden="true"><span className="h-1.5 w-1.5 rounded-full bg-lime-200 shadow-[0_0_12px_rgba(217,249,157,.8)]" /></div>
                     </div>
                     <div className="mt-3 flex items-baseline justify-between gap-2 border-t border-white/10 pt-3">
                       <span className="text-[8px] font-bold uppercase tracking-[.14em] text-white/45">Recommended artwork</span>
                       <span className="text-[10px] font-black tracking-wide text-white">{printSpec.artwork}</span>
                     </div>
                   </div>
                 )}
               </div>

               {/* Main Interaction Area - Bottom on Mobile, Left/Center on Desktop */}
               <div className="designer-pad-column flex-1 flex flex-col gap-4 sm:gap-6 order-2 lg:order-1 min-h-[250px] sm:min-h-[300px] lg:min-h-0 overflow-hidden">
                 <div className="designer-pad relative flex-1 min-h-0 bg-black/40 backdrop-blur-2xl rounded-[2rem] sm:rounded-[3rem] border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden">
                   <div className="absolute top-3 sm:top-4 md:top-8 left-4 sm:left-6 md:left-10 flex items-center gap-1 sm:gap-2 md:gap-3 z-10">
                     <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
                     <span className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-white/75 uppercase tracking-[0.15em] sm:tracking-[0.25em]">Precision Pad <span className="text-white/35">/ {activeProduct.replace('-', ' ')}</span></span>
                   </div>

                   {/* Quick Actions Toolbar */}
                   <div className="absolute top-3 sm:top-4 md:top-8 right-4 sm:right-6 md:right-10 flex items-center gap-1 sm:gap-2 z-10">
                     <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-1 sm:p-1.5 flex items-center gap-0.5 sm:gap-1 shadow-2xl">
                       <button 
                         onClick={undo} 
                         disabled={historyIndex <= 0}
                         className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                         title="Undo"
                       >
                         <Undo2 className="w-3 h-3 sm:w-4 sm:h-4" />
                       </button>
                       <button 
                         onClick={redo} 
                         disabled={historyIndex >= history.length - 1}
                         className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                         title="Redo"
                       >
                         <Redo2 className="w-3 h-3 sm:w-4 sm:h-4" />
                       </button>
                       <div className="w-px h-3 sm:h-4 bg-white/10 mx-0.5 sm:mx-1" />
                       <button 
                         onClick={downloadCurrentDesign}
                         className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                         title="Download Preview"
                       >
                         <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                       </button>
                       <button 
                         onClick={deleteObject}
                         disabled={!hasSelection}
                         className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-400/10 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                         title="Delete Selected"
                       >
                         <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                       </button>
                     </div>
                   </div>
                   
                   <div className="precision-canvas-shell relative z-10 rounded-xl sm:rounded-2xl md:rounded-[2rem] border border-white/10 bg-white/[0.035] shadow-[0_24px_70px_rgba(0,0,0,.3)] overflow-hidden" style={{ width: flatProduct ? (activeSide === 'front' ? 'min(100%, 320px)' : 'min(100%, 480px)') : 'min(100%, 380px)', aspectRatio: flatProduct ? (activeSide === 'front' ? '2 / 3' : '3 / 2') : '4 / 5' }}>
                     <div className="w-full h-full overflow-hidden bg-transparent">
                       <canvas ref={canvasRef} className="outline-none" />
                     </div>
                   </div>

                   {/* Perspective Info */}
                   <div className="absolute bottom-3 sm:bottom-4 md:bottom-8 left-4 sm:left-6 md:left-10 right-4 sm:right-6 md:right-10 flex justify-between items-end z-10">
                     <div className="flex flex-col gap-0.5 sm:gap-1">
                     </div>
                     <div className="flex flex-col items-end">
                       <span className="text-[6px] sm:text-[7px] md:text-[8px] font-black text-white/20 uppercase tracking-widest">Side</span>
                       <span className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-primary-400 uppercase tracking-widest italic">{activeSide}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <AnimatePresence>
          {showLargePreview && mirrorPreview && (
            <motion.div
              className="fixed inset-0 z-[130] flex flex-col bg-[#05080e]/95 p-3 backdrop-blur-2xl sm:p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLargePreview(false)}
            >
              <div className="mx-auto flex h-full w-full max-w-7xl flex-col" onClick={(event) => event.stopPropagation()}>
                <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-1 py-3 sm:px-3 sm:py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <img src="https://i.imgur.com/1PBylbz.png" alt="Crownstroke" className="h-8 w-8 shrink-0 object-contain brightness-0 invert" />
                    <div className="min-w-0">
                      <h2 className="truncate text-xs font-black uppercase tracking-[.18em] text-white sm:text-sm">Design preview</h2>
                      <p className="mt-1 truncate text-[8px] font-semibold uppercase tracking-[.15em] text-white/45 sm:text-[9px]">{activeColor} · {activeProduct.replace('-', ' ')} · {activeSide} view</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setShowLargePreview(false)} aria-label="Close large preview" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[.06] text-white/75 transition hover:bg-white/10 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="relative flex min-h-0 flex-1 items-center justify-center py-3 sm:py-6">
                  <motion.img
                    key={`large-${activeProduct}-${activeColor}-${activeSide}`}
                    src={mirrorPreview}
                    alt={`${activeColor} ${activeProduct} ${activeSide} product design preview`}
                    className="h-full w-full object-contain drop-shadow-[0_28px_48px_rgba(0,0,0,.42)]"
                    initial={{ opacity: .6, scale: .985 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: .2, ease: 'easeOut' }}
                  />
                  {isPreviewLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#05080e]/70 backdrop-blur-sm">
                      <img src="https://i.imgur.com/1PBylbz.png" alt="" className="h-16 w-16 animate-pulse object-contain brightness-0 invert" />
                      <span className="mt-4 text-[9px] font-black uppercase tracking-[.2em] text-white/75">Refreshing design</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modals remain mostly same but with responsive max-widths */}
        <AnimatePresence>
          {showDrafts && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDrafts(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-4xl bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-white/10">
                <div className="p-6 md:p-8 border-b border-white/10 flex items-center justify-between">
                  <h3 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter">Your Designs</h3>
                  <button onClick={() => setShowDrafts(false)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                  {drafts.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-white/20 uppercase font-black tracking-widest text-[10px]">No drafts saved</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {drafts.map((draft) => (
                        <div key={draft.id} className="group relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/5 shadow-xl">
                          <img src={draft.preview} className="w-full h-full object-cover" alt="Draft" />
                          <div className="absolute inset-0 bg-primary-600/90 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-4 gap-2">
                            <Button variant="premium" className="w-full py-2 rounded-lg font-black uppercase text-[10px]" onClick={() => loadDraft(draft)}>Load Design</Button>
                            <button onClick={() => downloadDraft(draft)} className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-black uppercase text-[10px] flex items-center justify-center gap-2 transition-all">
                              <Download className="w-3 h-3" /> Download
                            </button>
                            <button onClick={() => {
                              const updated = drafts.filter(d => d.id !== draft.id);
                              localStorage.setItem('crownstroke_drafts', JSON.stringify(updated));
                              setDrafts(updated);
                            }} className="text-[8px] font-black text-white/60 hover:text-white uppercase tracking-widest mt-1">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Context Menu */}
        <AnimatePresence>
          {contextMenu && contextMenu.visible && (
            <>
              <div className="fixed inset-0 z-[190]" onClick={() => setContextMenu(null)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="fixed z-[200] bg-black/90 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 min-w-[180px] overflow-hidden"
                style={{ left: Math.min(contextMenu.x, window.innerWidth - 200), top: Math.min(contextMenu.y, window.innerHeight - 200) }}
              >
                <div className="px-3 py-2 mb-1 border-b border-white/5">
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Object Actions</span>
                </div>
                <button onClick={duplicateObject} className="w-full text-left px-4 py-3 rounded-xl hover:bg-primary-500 hover:text-white text-white/80 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all group">
                  <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <Maximize2 className="w-3 h-3 text-primary-400 group-hover:text-white" />
                  </div>
                  Duplicate
                </button>
                {contextMenu.target?.type === 'image' && (
                  <button onClick={triggerChangeImage} className="w-full text-left px-4 py-3 rounded-xl hover:bg-primary-500 hover:text-white text-white/80 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all group">
                    <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <RefreshCcw className="w-3 h-3 text-primary-400 group-hover:text-white" />
                    </div>
                    Replace Image
                  </button>
                )}
                <div className="h-px bg-white/5 my-1" />
                <button onClick={deleteObject} className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-500 hover:text-white text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all group">
                  <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </div>
                  Remove Object
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        
        {/* Hidden Input for change image */}
        <input type="file" ref={changeImageInputRef} className="hidden" onChange={handleChangeImage} />

        {/* Save to Shop Modal */}
        <AnimatePresence>
          {showSaveModal && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isSaving && setShowSaveModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="relative w-full max-w-md bg-[#0a0a0a] rounded-[2.5rem] border border-white/10 p-8 md:p-12 shadow-3xl">
                <button type="button" aria-label="Close save design dialog" onClick={() => !isSaving && setShowSaveModal(false)} disabled={isSaving} className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/55 transition hover:bg-white/10 hover:text-white disabled:opacity-40"><X className="h-4 w-4" /></button>
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Deploy Design</h2>
                <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em] mb-8">Publish this masterpiece to your legendary shop</p>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Design Name</label>
                    <input type="text" value={saveDesignName} onChange={(e) => setSaveDesignName(e.target.value)} className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-sm text-white font-bold focus:border-primary-500 outline-none" placeholder="Enter design name..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] ml-2 flex justify-between">
                      <span>Price (KES)</span>
                      <span className="text-primary-500/60">Min: {MIN_PRICES[activeProduct] || 1200}</span>
                    </label>
                    <input 
                      type="number" 
                      value={saveDesignPrice} 
                      min={MIN_PRICES[activeProduct] || 1200}
                      onChange={(e) => setSaveDesignPrice(e.target.value)} 
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-sm text-white font-bold focus:border-primary-500 outline-none" 
                      placeholder={(MIN_PRICES[activeProduct] || 1200).toString()} 
                    />
                  </div>
                  <Button className="w-full py-4 rounded-2xl font-black uppercase tracking-widest h-16 shadow-xl shadow-primary-500/20" onClick={saveToShop} disabled={isSaving}>{isSaving ? 'Deploying...' : 'Deploy to Shop'}</Button>
                  <button onClick={() => setShowSaveModal(false)} className="w-full text-center text-[9px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors" disabled={isSaving}>Cancel Deployment</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Custom Cool Popup */}
        <AnimatePresence>
          {popup.show && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-black/60 backdrop-blur-md" 
                onClick={() => popup.type === 'alert' && setPopup(p => ({ ...p, show: false }))}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9, y: 20 }} 
                role="dialog"
                aria-modal="true"
                aria-labelledby="designer-popup-title"
                className="relative w-full max-w-sm bg-slate-900 border border-white/20 rounded-[2rem] p-8 shadow-2xl overflow-hidden"
              >
                <button type="button" aria-label="Close dialog" onClick={() => { if (popup.type === 'confirm') popup.onCancel?.(); setPopup(p => ({ ...p, show: false })); }} className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/55 transition hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
                {/* Decorative background element */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/10 blur-[100px] rounded-full" />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-6">
                    {popup.type === 'alert' ? <ShieldAlert className="w-6 h-6 text-primary-400" /> : <HelpCircle className="w-6 h-6 text-primary-400" />}
                  </div>
                  
                  <h3 id="designer-popup-title" className="pr-8 text-xl font-black text-white italic uppercase tracking-tighter mb-2">{popup.title}</h3>
                  <p className="text-white/60 text-xs leading-relaxed mb-8">{popup.message}</p>
                  
                  <div className="flex gap-3">
                    {popup.type === 'confirm' ? (
                      <>
                        <button 
                          onClick={() => {
                            popup.onCancel?.();
                            setPopup(p => ({ ...p, show: false }));
                          }}
                          className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => {
                            popup.onConfirm?.();
                            setPopup(p => ({ ...p, show: false }));
                          }}
                          className="flex-1 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary-500/25"
                        >
                          Confirm
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => setPopup(p => ({ ...p, show: false }))}
                        className="w-full py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary-500/25"
                      >
                        Got it
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Designer;

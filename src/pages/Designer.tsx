import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  HelpCircle
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
  't-shirt': { top: 80, left: 210, scale: 1.0 },
  'hoodie': { top: 120, left: 210, scale: 1.0 },
  'mug': { top: 250, left: 260, scale: 0.7 },
  'art-design': { top: 100, left: 160, scale: 1.1 },
  'poster': { top: 50, left: 160, scale: 1.2 }
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

const Designer: React.FC = () => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isOnline } = React.useContext(BackendStatusContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialProduct = searchParams.get('product') || 't-shirt';
  const [activeProduct, setActiveProduct] = useState(initialProduct);
  const [activeColor, setActiveColor] = useState('#ffffff');
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [activeTab, setActiveTab] = useState<'product' | 'text' | 'upload'>('product');
  const [hasSelection, setHasSelection] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
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
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, visible: boolean, target: any } | null>(null);
  const updateMirrorPreviewRef = useRef<() => void>();
  const saveHistoryRef = useRef<() => void>();

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

  const handleChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && fabricCanvas && contextMenu?.target && contextMenu.target.type === 'image') {
      const reader = new FileReader();
      reader.onload = (f) => {
        fabric.Image.fromURL(f.target?.result as string, (img) => {
          const target = contextMenu.target as fabric.Image;
          target.setSrc(f.target?.result as string, () => {
            fabricCanvas.renderAll();
            updateMirrorPreview();
          });
        });
      };
      reader.readAsDataURL(file);
    }
    setContextMenu(null);
  };

  const updateMirrorPreview = useCallback(async () => {
    if (!fabricCanvas) return;

    fabricCanvas.discardActiveObject().renderAll();

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 800;
    tempCanvas.height = 1000;
    const ctx = tempCanvas.getContext('2d');
    
    if (ctx) {
      const productImg = new Image();
      productImg.crossOrigin = "anonymous";
      productImg.src = PRODUCT_DATA[activeProduct]?.[activeColor]?.[activeSide] || PRODUCT_DATA['t-shirt']['#ffffff'].front;
      
      productImg.onload = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, 800, 1000);
        ctx.drawImage(productImg, 0, 0, 800, 1000);
        
        const designDataUrl = fabricCanvas.toDataURL({ 
          format: 'png', 
          quality: 1, 
          multiplier: 2
        });
        
        const designImg = new Image();
        designImg.src = designDataUrl;
        designImg.onload = () => {
          const config = DESIGN_CONFIG[activeProduct] || { top: 80, left: 210, scale: 1.0 };
          ctx.drawImage(designImg, config.left, config.top, 380 * config.scale, 480 * config.scale);
          setMirrorPreview(tempCanvas.toDataURL('image/png'));
        };
      };
      productImg.onerror = () => {
        const designDataUrl = fabricCanvas.toDataURL({ format: 'png' });
        setMirrorPreview(designDataUrl);
      };
    }
  }, [fabricCanvas, activeProduct, activeColor, activeSide]);

  useEffect(() => {
    updateMirrorPreviewRef.current = updateMirrorPreview;
  }, [updateMirrorPreview]);

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
            setDesignData(data);
            
            if (data[activeSide]) {
              fabricCanvas.loadFromJSON(data[activeSide], () => {
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
    const productData = PRODUCT_DATA[activeProduct];
    if (!productData) {
      setActiveProduct('t-shirt');
      return;
    }

    const productColors = Object.keys(productData);
    
    if (activeProduct === 'poster' || !productData[activeColor]?.[activeSide]) {
      setActiveSide('front');
    }

    if (productColors.length > 0 && !productColors.includes(activeColor)) {
      setActiveColor(productColors[0]);
    }
  }, [activeProduct]);

  useEffect(() => {
    if (canvasRef.current) {
      const isMobile = window.innerWidth < 768;
      const canvasWidth = isMobile ? window.innerWidth - 60 : 380;
      const canvasHeight = (canvasWidth / 380) * 480;

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: 'transparent',
        preserveObjectStacking: true,
        fireRightClick: true,
        stopContextMenu: true,
      });

      canvas.on('selection:created', () => setHasSelection(true));
      canvas.on('selection:updated', () => setHasSelection(true));
      canvas.on('selection:cleared', () => setHasSelection(false));
      
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
        if (updateMirrorPreviewRef.current) updateMirrorPreviewRef.current();
      });
      canvas.on('object:scaling', () => {
        if (updateMirrorPreviewRef.current) updateMirrorPreviewRef.current();
      });
      canvas.on('object:rotating', () => {
        if (updateMirrorPreviewRef.current) updateMirrorPreviewRef.current();
      });

      setFabricCanvas(canvas);
      
      // Save initial state
      setTimeout(() => {
        const json = JSON.stringify(canvas.toJSON());
        setHistory([json]);
        setHistoryIndex(0);
      }, 100);

      return () => {
        canvas.dispose();
      };
    }
  }, []);

  useEffect(() => {
    updateMirrorPreview();
  }, [activeProduct, activeColor, activeSide, updateMirrorPreview]);

  const switchSide = (side: 'front' | 'back') => {
    if (!fabricCanvas) return;
    
    const currentJSON = fabricCanvas.toJSON();
    setDesignData(prev => ({ ...prev, [activeSide]: currentJSON }));
    
    fabricCanvas.clear();
    const otherDesign = designData[side];
    if (otherDesign) {
      fabricCanvas.loadFromJSON(otherDesign, () => {
        fabricCanvas.renderAll();
      });
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && fabricCanvas) {
      const reader = new FileReader();
      reader.onload = (f) => {
        fabric.Image.fromURL(f.target?.result as string, (img) => {
          img.scaleToWidth(fabricCanvas.width! / 2);
          fabricCanvas.add(img);
          fabricCanvas.setActiveObject(img);
        });
      };
      reader.readAsDataURL(file);
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
        setImageUrl('');
        setShowUrlInput(false);
      }, { crossOrigin: 'anonymous' });
    }
  };

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
      const updatedData = { ...designData, [activeSide]: currentJSON };
      
      const designPayload = {
        name: saveDesignName,
        designerId: user.designerId,
        shopId: user.shopId,
        productId: activeProduct,
        preview: mirrorPreview,
        designData: updatedData,
        price: parseInt(saveDesignPrice) || 2500,
        isFeatured: 'false',
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
    const updatedData = { ...designData, [activeSide]: currentJSON };
    
    const draft = {
      id: Date.now().toString(),
      productId: activeProduct,
      color: activeColor,
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
    setActiveProduct(draft.productId);
    setActiveColor(draft.color);
    setDesignData(draft.designData);
    
    if (fabricCanvas) {
      fabricCanvas.clear();
      const currentSideDesign = draft.designData[activeSide];
      if (currentSideDesign) {
        fabricCanvas.loadFromJSON(currentSideDesign, () => {
          fabricCanvas.renderAll();
        });
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
    const updatedData = { ...designData, [activeSide]: currentJSON };
    
    const getSidePreview = async (side: 'front' | 'back') => {
      const sideData = updatedData[side];
      if (!sideData || !sideData.objects || sideData.objects.length === 0) return null;

      return new Promise<string>((resolve) => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 800;
        tempCanvas.height = 1000;
        const ctx = tempCanvas.getContext('2d');
        if (!ctx) return resolve('');

        const productImg = new Image();
        productImg.crossOrigin = "anonymous";
        productImg.src = PRODUCT_DATA[activeProduct]?.[activeColor]?.[side] || '';
        
        productImg.onload = () => {
          ctx.drawImage(productImg, 0, 0, 800, 1000);
          const processDesign = (canvasToUse: fabric.Canvas) => {
            canvasToUse.discardActiveObject().renderAll();
            const designDataUrl = canvasToUse.toDataURL({ 
              format: 'png', 
              quality: 1, 
              multiplier: 2
            });
            const designImg = new Image();
            designImg.src = designDataUrl;
            designImg.onload = () => {
              const config = DESIGN_CONFIG[activeProduct] || { top: 80, left: 210, scale: 1.0 };
              ctx.drawImage(designImg, config.left, config.top, 380 * config.scale, 480 * config.scale);
              resolve(tempCanvas.toDataURL('image/png'));
            };
          };

          if (side === activeSide && fabricCanvas) {
            processDesign(fabricCanvas);
          } else {
            const tempFabric = new fabric.Canvas(null, { width: 380, height: 480 });
            tempFabric.loadFromJSON(sideData, () => {
              processDesign(tempFabric);
            });
          }
        };
        productImg.onerror = () => resolve('');
      });
    };

    const frontPreview = await getSidePreview('front');
    const backPreview = await getSidePreview('back');
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
      elements: updatedData,
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
        className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-transparent"
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

            <div className="hidden lg:flex items-center gap-4">
              {user?.role === 'designer' && (
                <Button variant="premium" className="bg-purple-600 hover:bg-purple-700 h-11 px-6 !rounded-xl text-[10px] uppercase font-black tracking-widest gap-2 shadow-lg shadow-purple-500/20" onClick={() => setShowSaveModal(true)}>
                  <LayoutGrid className="w-4 h-4" /> Save to Shop
                </Button>
              )}
              <Button 
                variant="premium" 
                className="bg-slate-800 hover:bg-slate-700 h-11 px-6 !rounded-xl text-[10px] uppercase font-black tracking-widest gap-2 shadow-lg shadow-white/5 transition-all group" 
                onClick={handleDraftsClick}
              >
                <RefreshCcw className="w-4 h-4 text-white/40 group-hover:rotate-180 transition-transform duration-500" /> Drafts
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

        <div className="flex flex-1 overflow-hidden p-2 md:p-6 gap-2 md:gap-6 flex-col">
          <div className="flex flex-1 overflow-hidden gap-2 md:gap-6 lg:flex-row flex-col relative">
            
            {/* Redesigned Integrated Sidebar */}
            <AnimatePresence>
              {(showMobileMenu || window.innerWidth >= 1024) && (
                <motion.div 
                  initial={showMobileMenu ? { x: -50, opacity: 0 } : false}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  className={clsx(
                    "lg:w-96 bg-black/40 backdrop-blur-3xl lg:rounded-[3rem] rounded-2xl flex flex-col border border-white/5 shadow-2xl shrink-0 z-30 transition-all",
                    showMobileMenu ? "fixed left-4 top-24 bottom-24 right-4 lg:relative lg:inset-auto h-auto" : "hidden lg:flex"
                  )}
                >
                  <div className="p-6 md:p-8 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-primary-500 rounded-full" />
                        Customize
                      </h3>
                      <button className="lg:hidden text-white/40" onClick={() => setShowMobileMenu(false)}>
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Integrated Tab Navigation */}
                    <div className="flex bg-white/5 p-1.5 rounded-2xl mb-8">
                      {[
                        { id: 'product', icon: LayoutGrid, label: 'Product' },
                        { id: 'text', icon: Type, label: 'Text' },
                        { id: 'upload', icon: ImageIcon, label: 'Design' },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={clsx(
                            "flex-1 flex flex-col items-center py-3 rounded-xl transition-all gap-1.5",
                            activeTab === tab.id ? "bg-white/10 text-primary-400 shadow-xl" : "text-white/30 hover:text-white/60"
                          )}
                        >
                          <tab.icon className={clsx("w-4 h-4 md:w-5 md:h-5", activeTab === tab.id ? "text-primary-400" : "")} />
                          <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
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

                          {activeProduct !== 'poster' && (
                            <div>
                              <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                <div className="w-1 h-1 bg-primary-500 rounded-full" />
                                Perspective
                              </h4>
                              <div className="grid grid-cols-2 gap-3">
                                {(['front', 'back'] as const).map(side => (
                                  <button
                                    key={side}
                                    onClick={() => switchSide(side)}
                                    className={clsx(
                                      "py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] border transition-all duration-300",
                                      activeSide === side ? "bg-white text-black border-white shadow-2xl" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                                    )}
                                  >
                                    {side} View
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
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                              <div className="w-1 h-1 bg-primary-500 rounded-full" />
                              Asset Manager
                            </h4>
                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/10 rounded-[2rem] bg-white/5 hover:bg-white/10 transition-all cursor-pointer group shadow-inner">
                              <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <ImageIcon className="w-8 h-8 text-primary-400" />
                              </div>
                              <span className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Upload Artwork</span>
                              <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">PNG, JPG up to 10MB</span>
                              <input type="file" className="hidden" onChange={handleImageUpload} />
                            </label>
                            
                            <div className="relative py-4">
                              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-white/20"><span className="bg-[#0a0a0a] px-4 italic">OR</span></div>
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
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile/Desktop Flex Layout */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 md:gap-6 overflow-hidden">
              
              {/* Live Preview Panel - Top on Mobile, Right on Desktop */}
              <div className="flex w-full lg:w-[400px] flex-col gap-6 order-1 lg:order-2 shrink-0">
                <div className="flex-1 relative bg-black/60 backdrop-blur-3xl rounded-[2rem] md:rounded-[3rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden min-h-[250px] lg:min-h-0">
                  <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between">
                      <h3 className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3 italic">
                        <Eye className="w-4 h-4 text-primary-500" />
                        Live Preview
                      </h3>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center p-4 md:p-6 relative">
                      <div className="relative w-full aspect-[4/5] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-slate-900 shadow-2xl border border-white/5">
                        {mirrorPreview ? (
                          <motion.img 
                            key={mirrorPreview}
                            initial={{ opacity: 0.8 }}
                            animate={{ opacity: 1 }}
                            src={mirrorPreview} 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/10">
                            <RefreshCcw className="w-8 h-8 animate-spin-slow" />
                          </div>
                        )}
                      </div>
                  </div>

                  <div className="hidden md:flex p-6 bg-white/5 flex flex-col gap-3">
                      <div className="flex justify-between items-center text-[8px] font-black text-white/40 uppercase tracking-widest">
                        <span>Render Status</span>
                        <span className="text-green-500 animate-pulse">Synced</span>
                      </div>
                      <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-primary-500 w-full" initial={{ x: "-100%" }} animate={{ x: "0%" }} transition={{ duration: 1 }} />
                      </div>
                  </div>
                </div>
              </div>

              {/* Main Interaction Area - Bottom on Mobile, Left/Center on Desktop */}
              <div className="flex-1 flex flex-col gap-4 md:gap-6 order-2 lg:order-1 min-h-[350px] lg:min-h-0 overflow-hidden">
                <div className="flex-1 relative bg-black/40 backdrop-blur-2xl rounded-[2rem] md:rounded-[3rem] border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden">
                  <div className="absolute top-4 md:top-8 left-6 md:left-10 flex items-center gap-2 md:gap-3 z-10">
                    <div className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
                    <span className="text-[8px] md:text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Precision Pad</span>
                  </div>

                  {/* Quick Actions Toolbar */}
                  <div className="absolute top-4 md:top-8 right-6 md:right-10 flex items-center gap-2 z-10">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 flex items-center gap-1 shadow-2xl">
                      <button 
                        onClick={undo} 
                        disabled={historyIndex <= 0}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                        title="Undo"
                      >
                        <Undo2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={redo} 
                        disabled={historyIndex >= history.length - 1}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                        title="Redo"
                      >
                        <Redo2 className="w-4 h-4" />
                      </button>
                      <div className="w-px h-4 bg-white/10 mx-1" />
                      <button 
                        onClick={downloadCurrentDesign}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                        title="Download Preview"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={deleteObject}
                        disabled={!hasSelection}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-400/10 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                        title="Delete Selected"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div 
                    className="relative z-10 p-2 md:p-4 bg-white/5 rounded-2xl md:rounded-[2rem] border border-white/5 shadow-inner scale-[0.7] sm:scale-[0.85] md:scale-100"
                  >
                    <div className="w-full h-full rounded-lg overflow-hidden bg-transparent">
                      <canvas ref={canvasRef} className="outline-none" />
                    </div>
                  </div>

                  {/* Perspective Info */}
                  <div className="absolute bottom-4 md:bottom-8 left-6 md:left-10 right-6 md:right-10 flex justify-between items-end z-10">
                    <div className="flex flex-col gap-1">
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[7px] md:text-[8px] font-black text-white/20 uppercase tracking-widest">Side</span>
                      <span className="text-[9px] md:text-[10px] font-black text-primary-400 uppercase tracking-widest italic">{activeSide}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

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
                className="relative w-full max-w-sm bg-slate-900 border border-white/20 rounded-[2rem] p-8 shadow-2xl overflow-hidden"
              >
                {/* Decorative background element */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/10 blur-[100px] rounded-full" />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-6">
                    {popup.type === 'alert' ? <ShieldAlert className="w-6 h-6 text-primary-400" /> : <HelpCircle className="w-6 h-6 text-primary-400" />}
                  </div>
                  
                  <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">{popup.title}</h3>
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

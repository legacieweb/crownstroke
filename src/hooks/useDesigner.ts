import { useEffect, useRef, useState, useCallback } from 'react';
import { fabric } from 'fabric';

export const useDesigner = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<fabric.Canvas | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);

  useEffect(() => {
    if (canvasRef.current) {
      fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
        width: 400,
        height: 500,
        backgroundColor: 'transparent',
        preserveObjectStacking: true,
      });

      const handleSelection = () => {
        setSelectedObjects(fabricCanvas.current?.getActiveObjects() || []);
      };

      fabricCanvas.current.on('selection:created', handleSelection);
      fabricCanvas.current.on('selection:updated', handleSelection);
      fabricCanvas.current.on('selection:cleared', handleSelection);

      return () => {
        fabricCanvas.current?.dispose();
      };
    }
  }, []);

  const addText = useCallback((text: string = 'Double click to edit') => {
    if (!fabricCanvas.current) return;
    const textBox = new fabric.Textbox(text, {
      left: 100,
      top: 100,
      width: 200,
      fontSize: 24,
      fill: '#000000',
      fontFamily: 'Arial',
      textAlign: 'center',
    });
    fabricCanvas.current.add(textBox);
    fabricCanvas.current.setActiveObject(textBox);
  }, []);

  const addImage = useCallback((url: string) => {
    if (!fabricCanvas.current) return;
    fabric.Image.fromURL(url, (img) => {
      img.scaleToWidth(200);
      img.set({
        left: 100,
        top: 100,
      });
      fabricCanvas.current?.add(img);
      fabricCanvas.current?.setActiveObject(img);
    }, { crossOrigin: 'anonymous' });
  }, []);

  const changeColor = useCallback((color: string) => {
    if (!fabricCanvas.current) return;
    const activeObjects = fabricCanvas.current.getActiveObjects();
    activeObjects.forEach((obj) => {
      if (obj.type === 'textbox' || obj.type === 'text' || obj.type === 'i-text') {
        (obj as any).set({ fill: color });
      } else if (obj instanceof fabric.Path || obj instanceof fabric.Rect || obj instanceof fabric.Circle) {
        (obj as any).set({ fill: color });
      }
    });
    fabricCanvas.current.renderAll();
  }, []);

  const deleteSelected = useCallback(() => {
    if (!fabricCanvas.current) return;
    const activeObjects = fabricCanvas.current.getActiveObjects();
    activeObjects.forEach((obj) => {
      fabricCanvas.current?.remove(obj);
    });
    fabricCanvas.current.discardActiveObject();
    fabricCanvas.current.renderAll();
  }, []);

  const bringToFront = useCallback(() => {
    if (!fabricCanvas.current) return;
    const activeObject = fabricCanvas.current.getActiveObject();
    if (activeObject) {
      activeObject.bringToFront();
      fabricCanvas.current.renderAll();
    }
  }, []);

  const sendToBack = useCallback(() => {
    if (!fabricCanvas.current) return;
    const activeObject = fabricCanvas.current.getActiveObject();
    if (activeObject) {
      activeObject.sendToBack();
      fabricCanvas.current.renderAll();
    }
  }, []);

  return {
    canvasRef,
    fabricCanvas,
    selectedObjects,
    addText,
    addImage,
    changeColor,
    deleteSelected,
    bringToFront,
    sendToBack,
  };
};

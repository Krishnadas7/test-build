/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { FabricImage, FabricObject, PencilBrush } from 'fabric';
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react';
import { FaImage, FaRegCircle, FaRegTrashAlt } from 'react-icons/fa';
import { MdOutlineRectangle, MdRedo, MdUndo, MdZoomIn, MdZoomOut } from 'react-icons/md';
import { TbFlipHorizontal, TbFlipVertical, TbLine } from 'react-icons/tb';
import { BiPencil } from 'react-icons/bi';
import Ruler from './ruler/Ruler';
import { AiOutlineRotateRight } from 'react-icons/ai';

interface VehicleData {
    files: string;
}

interface SvgEditorProps {
    vehicleData?: VehicleData;
}

export interface SvgEditorRef {
    downloadImage: () => void;
}

const SvgEditor = forwardRef<SvgEditorRef, SvgEditorProps>(({ vehicleData }, ref) => {
    const { editor, onReady } = useFabricJSEditor();

    const history: FabricObject[] = [];

    const onAddCircle = () => {
        editor?.addCircle();
    };

    const onAddRectangle = () => {
        editor?.addRectangle();
    };

    const onAddPath = () => {
        editor?.addLine();
    };

    const toggleDraw = () => {
        const canvas = editor?.canvas;
        if (canvas) {
            canvas.isDrawingMode = !canvas.isDrawingMode;

            if (canvas.isDrawingMode && !canvas.freeDrawingBrush) {
                canvas.freeDrawingBrush = new PencilBrush(canvas);
                canvas.freeDrawingBrush.width = 3;
            }
        }
    };

    const deleteObject = () => {
        const activeObject = editor?.canvas?.getActiveObject();
        if (activeObject) {
            editor?.canvas.remove(activeObject);
        }
    };

    const undo = () => {
        if (editor?.canvas && editor.canvas._objects.length > 0) {
            const removedObject = editor.canvas._objects.pop();
            if (removedObject) {
                history.push(removedObject);
            }
            editor.canvas.renderAll();
        }
    };

    const redo = () => {
        if (editor?.canvas && history.length > 0) {
            const restoredObject = history.pop();
            if (restoredObject) {
                editor.canvas.add(restoredObject);
            }
        }
    };

    const addImageToCanvas = (value: string) => {
        const image = new Image();
        image.crossOrigin = 'Anonymous';
        image.src = value;

        image.onload = () => {
            const imgInstance = new FabricImage(image, {
                left: 250,
                top: 250,
                scaleX: 0.2,
                scaleY: 0.2,
            });

            editor?.canvas.add(imgInstance);
            editor?.canvas.renderAll();
        };
    };

    const rotateObject = () => {
        const activeObject = editor?.canvas?.getActiveObject();
        if (activeObject) {
            const currentAngle = activeObject.angle || 0;
            activeObject.rotate(currentAngle + 90);
            editor?.canvas.renderAll();
        } else {
            console.warn('No active object selected for rotation.');
        }
    };

    const mirrorObjectHorizontally = () => {
        const activeObject = editor?.canvas?.getActiveObject();
        if (activeObject) {
            activeObject.set('flipY', !activeObject.flipY);
            editor?.canvas.renderAll();
        } else {
            console.warn('No active object selected for mirroring.');
        }
    };

    const mirrorObjectVertically = () => {
        const activeObject = editor?.canvas?.getActiveObject();
        if (activeObject) {
            activeObject.set('flipX', !activeObject.flipX);
            editor?.canvas.renderAll();
        } else {
            console.warn('No active object selected for mirroring.');
        }
    };

    useEffect(() => {
        if (vehicleData) {
            Object.entries(vehicleData).forEach(([, value]: [string, string]) => {
                addImageToCanvas(value);
            });
        }
    }, [addImageToCanvas, vehicleData]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                const image = new Image();
                image.src = result;
                image.onload = () => {
                    const imgInstance = new FabricImage(image, {
                        left: 250,
                        top: 250,
                        scaleX: 0.2,
                        scaleY: 0.2,
                    });
                    editor?.canvas.add(imgInstance);
                    editor?.canvas.renderAll();
                };
            };
            reader.readAsDataURL(files[0]);
        }
    };

    useImperativeHandle(ref, () => ({
        downloadImage() {
            const dataURL = editor?.canvas.toDataURL({
                format: 'png',
                quality: 1,
                multiplier: 0,
            });
            const link:any = document.createElement('a');
            link.href = dataURL;
            link.download = 'sketch.png';
            link.click();
        },
        getData() {
            return editor?.canvas.toDataURL();
        },
        getCoordinates() {
            if (!editor?.canvas) return [];
            console.log('===',editor?.canvas?.toJSON(),editor.canvas.getObjects()[0].type)

            // Map through all objects on the canvas and extract their coordinates
            return editor.canvas.getObjects().map((obj) => {
                const { left, top, width, height, angle, scaleX, scaleY,type } = obj;
                return {
                    type,
                    left,
                    top,
                    width: width * scaleX,
                    height: height * scaleY,
                    angle,
                };
            });
        },
    }));

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Delete') {
                deleteObject();
            } else if (event.key === 'o') {
                onAddCircle();
            } else if (event.key === 'r') {
                onAddRectangle();
            } else if (event.key === 'p') {
                onAddPath();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [deleteObject, onAddCircle, onAddPath, onAddRectangle]);

    return (
        <div className="App flex p-4">
            <div className="h-[80vh] w-1/12 pr-4 grid-cols-2 flex flex-col gap-4 justify-start items-start">
                <div className="flex justify-evenly w-full gap-4">
                    <FaRegCircle
                        size={30}
                        className="hover:scale-110 hover:transition"
                        onClick={onAddCircle}
                    />
                    <MdOutlineRectangle
                        size={32}
                        className="hover:scale-110 hover:transition"
                        onClick={onAddRectangle}
                    />
                </div>
                <div className="flex justify-evenly w-full gap-4">
                    <TbLine
                        size={32}
                        className="hover:scale-110 hover:transition"
                        onClick={onAddPath}
                    />
                    <BiPencil
                        size={32}
                        className="hover:scale-110 hover:transition"
                        onClick={toggleDraw}
                    />
                </div>
                <div className="flex justify-evenly w-full gap-4">
                    <MdZoomIn
                        size={32}
                        className="hover:scale-110 hover:transition"
                        onClick={() => editor?.canvas.setZoom(editor?.canvas.getZoom() + 0.2)}
                    />
                    <MdZoomOut
                        size={32}
                        className="hover:scale-110 hover:transition"
                        onClick={() => editor?.canvas.setZoom(editor?.canvas.getZoom() - 0.2)}
                    />
                </div>
                <div className="flex justify-evenly w-full gap-4">
                    <MdUndo size={32} className="hover:scale-110 hover:transition" onClick={undo} />
                    <MdRedo size={32} className="hover:scale-110 hover:transition" onClick={redo} />
                </div>

                <div className="flex justify-evenly w-full gap-4">
                    <FaRegTrashAlt
                        size={30}
                        className="hover:scale-110 hover:transition"
                        onClick={deleteObject}
                    />
                    <label className="hover:scale-110 hover:transition">
                        <FaImage size={30} className="hover:scale-110 hover:transition" />
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </label>
                </div>
                <div className="flex justify-evenly w-full gap-4">
                    <TbFlipHorizontal
                        size={32}
                        className="hover:scale-110 hover:transition"
                        onClick={mirrorObjectHorizontally}
                    />
                    <TbFlipVertical
                        size={32}
                        className="hover:scale-110 hover:transition"
                        onClick={mirrorObjectVertically}
                    />
                </div>
                <div className="flex justify-evenly w-full gap-4">
                    <AiOutlineRotateRight
                        size={32}
                        className="hover:scale-110 hover:transition"
                        onClick={rotateObject}
                    />
                    <TbFlipVertical
                        size={32}
                        className="hover:scale-110 hover:transition opacity-0"
                    />
                </div>
            </div>
            <div className="relative w-11/12 h-[80vh] overflow-scroll">
                <Ruler orientation="horizontal" length={32.8} width={60} />
                <div className="flex w-full">
                    <Ruler orientation="vertical" length={100} width={60} />
                    <FabricJSCanvas className="w-11/12 border border-black" onReady={onReady} />
                </div>
            </div>
        </div>
    );
});

export default SvgEditor;

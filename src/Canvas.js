import React, { useRef, useState } from "react";
import { Stage, Layer, Rect } from "react-konva";

const Canvas = () => {
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [endPos, setEndPos] = useState({ x: 0, y: 0 });
  const [rect, setRect] = useState(null);
  const stageRef = useRef(null);

  const handleMouseDown = (e) => {
    setDrawing(true);
    setStartPos({ x: e.evt.layerX, y: e.evt.layerY });
  };

  const handleMouseUp = (e) => {
    setDrawing(false);
    setEndPos({ x: e.evt.layerX, y: e.evt.layerY });
    const newRect = (
      <Rect
        x={startPos.x}
        y={startPos.y}
        width={endPos.x - startPos.x}
        height={endPos.y - startPos.y}
        stroke="black"
        draggable
        onTransformEnd={(e) => {
          const node = e.target;
          setRect(node);
        }}
        onDragEnd={(e) => {
          const node = e.target;
          setRect(node);
        }}
        onDragMove={(e) => {
          const node = e.target;
          setRect(node);
        }}
        rotateEnabled
        strokeWidth={1}
      />
    );
    setRect(newRect);
  };

  const handleMouseMove = (e) => {
    if (!drawing) {
      return;
    }
    const layer = stageRef.current.children[0];
    layer.clear();
    layer.stroke("black");
    layer.strokeWidth(1);
    layer.strokeEnabled(true);
    layer.drawRect(
      startPos.x,
      startPos.y,
      e.evt.layerX - startPos.x,
      e.evt.layerY - startPos.y
    );
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        ref={stageRef}
      >
        <Layer>{rect}</Layer>
      </Stage>
    </div>
  );
};

export default Canvas;

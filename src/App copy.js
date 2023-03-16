import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect } from 'react-konva';

const App = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [rect, setRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [stageWidth, setStageWidth] = useState(600);
  const [stageHeight, setStageHeight] = useState(800);

  const stageRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    setStageWidth(stage.width());
    setStageHeight(stage.height());
  }, []);

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const { x, y } = e.target.getStage().getPointerPosition();
    setRect({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) {
      return;
    }

    const { x, y } = e.target.getStage().getPointerPosition();
    setRect((prevRect) => {
      return {
        ...prevRect,
        width: x - prevRect.x,
        height: y - prevRect.y,
      };
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  return (
    <div>
      <h1>Draw a rectangle on the stage</h1>
      <div
        style={{
          border: '1px solid gray',
          width: stageWidth,
          height: stageHeight,
          position: 'relative',
        }}
      >
        {isDrawing && (
          <div
            style={{
              position: 'absolute',
              left: rect.x,
              top: rect.y,
              width: rect.width,
              height: rect.height,
              border: '1px dashed black',
            }}
          />
        )}
        <Stage
          width={stageWidth}
          height={stageHeight}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          ref={stageRef}
        >
          <Layer>
            <Rect
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              stroke="black"
              strokeWidth={1}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default App;

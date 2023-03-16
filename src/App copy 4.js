import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Group, Transformer } from 'react-konva';

const Rectangle = ({ shapeProps, isSelected, onSelect, onChange, onHoveringRect }) => {
  const shapeRef = React.useRef();
  const trRef = React.useRef();

  React.useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Rect
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onMouseOver={() => onHoveringRect(shapeProps.id)}
        onMouseOut={() => onHoveringRect(null)}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            // set minimal value
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

const initialRectangles = [
  {
    x: 10,
    y: 10,
    width: 100,
    height: 100,
    fill: 'red',
    id: 'rect1',
  },
  {
    x: 150,
    y: 150,
    width: 100,
    height: 100,
    fill: 'green',
    id: 'rect2',
  },
];

const App = () => {
  const [selectedRectangle, setSelectedRectangle] = useState(null);
  const [rectangles, setRectangles] = useState(initialRectangles);
  const [hoveringRect, setHoveringRect] = useState(null);
  const [drawing, setDrawing] = useState(false);

  const handleMouseMove = (e) => {
    if (!drawing) {
      return;
    }
    const { x, y } = e.target.getStage().getPointerPosition();

    selectedRectangle.width = x - selectedRectangle.x;
    selectedRectangle.height = y - selectedRectangle.y;
    
    const index = rectangles.findIndex(rect => rect.id === selectedRectangle.id);
    const beforeRecs = rectangles.slice(0, index);
    const afterRecs = rectangles.slice(index + 1);
    setRectangles([...beforeRecs, selectedRectangle, ...afterRecs]);
  };
  const handleMouseUp = (e) => {
    setSelectedRectangle(null);
    setDrawing(false);
  };

  const handleMouseDown = (e) => {    
    if (selectedRectangle || hoveringRect !== null) {
      return;
    }
    setDrawing(true);
    const { x, y } = e.target.getStage().getPointerPosition();
    const newRectangle = {
      id: (Date.now() + Math.random()).toString(),
      x: x,
      y: y,
      fill: "rgba(0,0,0,0.5)",
      width: 0,
      height: 0
    };
    setSelectedRectangle(newRectangle);
    setRectangles([...rectangles, newRectangle]);
  };
  
  const checkDeselect = (e) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedRectangle(null);
    }
    handleMouseDown(e);
  };

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={checkDeselect}
      onMouseUp={handleMouseUp}
      onTouchStart={checkDeselect}
      onMouseMove={handleMouseMove}
    >
      <Layer>
        {rectangles.map((rect, i) => {
          return (
            <Rectangle
              key={rect.id}
              shapeProps={rect}
              isSelected={selectedRectangle && rect.id === selectedRectangle.id}
              onSelect={() => {
                setSelectedRectangle(rect);
              }}
              onChange={(newAttrs) => {
                const rects = rectangles.slice();
                rects[i] = newAttrs;
                setRectangles(rects);
              }}
              onHoveringRect={setHoveringRect}
            />
          );
        })}
      </Layer>
    </Stage>
  );
};


export default App;

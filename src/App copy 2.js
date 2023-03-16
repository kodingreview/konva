import React, { useState, useRef, useEffect } from "react";
import { render } from "react-dom";
import { Stage, Layer, Rect, Circle, Group, Transformer } from "react-konva";

const Rectangle = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = React.useRef();
  const trRef = React.useRef();

  useEffect(() => {
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

const App = () => {
  const [drawing, setDrawing] = useState(false);
  const [rectangle, setRectangle] = useState(null);
  const [selected, setSelected] = useState(false);
  const [hoveringRect, setHoveringRect] = useState(null);
  const [rectangles, setRectangles] = useState([]);
  const [selectedId, selectShape] = useState(null);

  const stageRef = useRef(null);
  const layerRef = useRef();
  const shapeRef = useRef();
  const trRef = useRef();

  const checkDeselect = (e) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  const handleMouseDown = (e) => {
    checkDeselect(e);
    if (selected || hoveringRect !== null) {
      return;
    }
    setDrawing(true);
    const { x, y } = e.target.getStage().getPointerPosition();
    const newRectangle = {
      id: (Date.now() + Math.random()).toString(),
      x: x,
      y: y,
      width: 0,
      height: 0
    };
    setRectangle(newRectangle);
    setRectangles([...rectangles, newRectangle]);
  };

  const handleMouseMove = (e) => {
    if (!drawing) {
      return;
    }
    const { x, y } = e.target.getStage().getPointerPosition();
    rectangle.width = x - rectangle.x;
    rectangle.height = y - rectangle.y;
    
    setRectangle(rectangle);
    const index = rectangles.findIndex(rect => rect.id === rectangle.id);
    const beforeRecs = rectangles.slice(0, index);
    const afterRecs = rectangles.slice(index + 1);
    setRectangles([...beforeRecs, rectangle, ...afterRecs]);
  };

  const handleMouseUp = () => {
    setSelected(false);
    setDrawing(false);
  };

  const handleRectClick = (rectangle) => {
    setDrawing(false)
    setSelected(true); // todo: needed?
    setRectangle(rectangle);
  };

  const removeRectangle = (i) => {
    const r = rectangles.filter(rec => rec.id !== i);
    setRectangles(r);
  };

  const handleStageClick = (e) => {
    setSelected(false);
    trRef.current.nodes([]);
  };

  const RemoveButton = ({ onClick }) => {
    return (
      <Circle
        x={0}
        y={0}
        radius={10}
        fill="red"
        opacity={0.8}
        onClick={onClick}
        onMouseOver={(e) => {
          // change cursor to pointer when hovering over remove button
          e.target.getStage().container().style.cursor = 'pointer';
        }}
        onMouseOut={(e) => {
          // change cursor back to default when leaving remove button
          e.target.getStage().container().style.cursor = 'default';
        }}
      />
    );
  };

  const renderRectangles = () => {
    console.log(rectangle);
    
    return rectangles.map((rectangle, i) => {
      
      console.log(rectangle);
      return (
        <Group key={rectangle.id + "group"} x={rectangle.x} y={rectangle.y}>
            <Rectangle
              key={rectangle.id + "rect"}
              shapeProps={rectangle}
              isSelected={rectangle.id === selectedId}
              onSelect={() => {
                selectShape(rectangle.id);
              }}
              onChange={(newAttrs) => {
                const rects = rectangles.slice();
                rects[rectangle.id + "rect"] = newAttrs;
                setRectangles(rects);
              }}
            />
          <Rect
            key={rectangle.id + "rect"}
            width={rectangle.width}
            height={rectangle.height}
            fill={rectangle.fill}
            stroke={rectangle.stroke}
            strokeWidth={rectangle.strokeWidth}
            draggable={true}
            fill={"rgba(0,0,0,0.5)"}
            onClick={() => handleRectClick(rectangle)}
            onMouseOver={() => setHoveringRect(rectangle.id)}
            onMouseOut={() => setHoveringRect(null)}
          />
          {hoveringRect === rectangle.id && (
            <Group key={`remove-${rectangle.id}`}>
              <RemoveButton onClick={() => removeRectangle(rectangle.id)} />
            </Group>
          )}
        </Group>
      );
    });
  };

  /*
              <Rect
              x={rectangle.x}
              y={rectangle.y}
              width={rectangle.width}
              height={rectangle.height}
              stroke={"black"}
              strokeWidth={2}
              fill={"rgba(0,0,0,0.5)"}
              onClick={handleRectClick}
              onMouseOver={() => setHoveringRect(true)}
              onMouseOut={() => setHoveringRect(false)}
              draggable
            />
  */
  
  return (
    <div>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onClick={handleStageClick}
        ref={stageRef}
      >
        <Layer ref={layerRef}>
          {rectangle && (
            renderRectangles()
          )}
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
        </Layer>
      </Stage>
    </div>
  );
};


export default App;

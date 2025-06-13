import React, { useEffect, useRef, useState } from "react";
import { Image, Layer, Rect, Stage } from "react-konva";
import { createNoise2D } from "simplex-noise";
import useWindowSize from "../../hooks/resize";

const noise2D = createNoise2D();

export default function Pixel1Canvas() {
  const divRef = useRef<HTMLDivElement>(null);
  const [windowWidth, windowHeight] = useWindowSize();
  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
  });
  const [ticking, _] = useState(true);
  const [count, setCount] = useState(0);

  const [options, setOptions] = useState({
    noiseScale: 1,
    pixelSize: 10,
    speed: 1,
  });

  // State for stage scale and position
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  const itemsRef = useRef(new Map());
  const imageRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => ticking && setCount(count + 1), 10);
    return () => clearTimeout(timer);
  }, [count, ticking]);

  useEffect(() => {
    if (!(divRef.current?.offsetHeight || divRef.current?.offsetWidth)) {
      return;
    }
    setCanvasSize({
      width: divRef.current.offsetWidth,
      height: divRef.current.offsetHeight,
    });
  }, [windowWidth, windowHeight]);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();

    const scaleBy = 1.1;
    const stage = e.target.getStage();
    if (!stage) {
      return;
    }
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition()!.x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition()!.y / oldScale - stage.y() / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    setStageScale(newScale);
    setStagePos({
      x: (stage.getPointerPosition()!.x / newScale - mousePointTo.x) * newScale,
      y: (stage.getPointerPosition()!.y / newScale - mousePointTo.y) * newScale,
    });
  };

  function handleInputChange(key: string, value: any) {
    setOptions((oldConfig) => ({
      ...oldConfig,
      [key]: value,
    }));
  }

  // useEffect(() => {
  //   updateSquares();
  // }, [count.current]);

  // function updateSquares() {
  //   console.log("updateSquares");
  //   let i = 0;
  //   let cols = Math.ceil(canvasSize.width / options.pixelSize);
  //   let rows = Math.ceil(canvasSize.height / options.pixelSize);

  //   // console.log(cols, rows, canvasSize);
  //   if (rows * cols == 0) return;

  //   for (let row = 0; row <= rows; row++) {
  //     for (let col = 0; col <= cols; col++) {
  //       let y = (row / rows) * canvasSize.height;
  //       let x = (col / cols) * canvasSize.width;

  //       let noiseVal = noise2D(
  //         row / options.noiseScale,
  //         col / options.noiseScale + count.current * options.speed
  //       );
  //       let colorVal = Math.round(noiseVal * 255);
  //       let color = `rgb(${colorVal},${colorVal},${colorVal})`;
  //       let square = itemsRef.current.get(i);
  //       if (!square) continue;

  //       square.size({ width: options.pixelSize, height: options.pixelSize });
  //       square.fill(row % 2 == 0 ? "blue" : "red");
  //       // square.x(col % 2 == 0 ? 100 : 0);
  //       // console.log(x);
  //       // square.y(y);

  //       // squares.push(
  //       //   <Rect
  //       //     key={`rect-${row}-${col}`}
  //       //     x={x}
  //       //     y={y}
  //       //     fill={
  //       //       // (row % 2 == 0 && col % 2 != 0) || (row % 2 != 0 && col % 2 == 0)
  //       //       //   ? "white"
  //       //       //   : "gray"
  //       //       color
  //       //     }
  //       //     width={options.pixelSize}
  //       //     height={options.pixelSize}
  //       //   />
  //       // );
  //     }
  //   }
  // }

  useEffect(() => {
    if (!canvasRef.current || canvasSize.width == 0 || canvasSize.height == 0)
      return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const cols = Math.floor(canvasSize.width / options.pixelSize);
    const rows = Math.floor(canvasSize.height / options.pixelSize);

    const imageData = ctx.createImageData(cols, rows);
    const { data } = imageData;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const noiseVal = noise2D(
          x / options.noiseScale,
          y / options.noiseScale + count * options.speed
        );
        const value = Math.floor(((noiseVal + 1) / 2) * 255);
        const index = (y * cols + x) * 4;
        data[index + 0] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    if (imageRef.current) {
      imageRef.current.image(canvasRef.current);
      imageRef.current.getLayer().batchDraw(); // force rerender
    }
  }, [count, canvasSize, options]);

  function createShapes() {
    console.log("createShapes");

    const shapes = [];

    let cols = Math.ceil(canvasSize.width / options.pixelSize);
    let rows = Math.ceil(canvasSize.height / options.pixelSize);
    // console.log(canvasSize, rows, cols);

    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= cols; col++) {
        let y = (row / rows) * canvasSize.height;
        let x = (col / cols) * canvasSize.width;
        let noiseVal = noise2D(
          row / options.noiseScale,
          col / options.noiseScale + count * options.speed
        );
        let colorVal = Math.round(noiseVal * 255);
        let color = `rgb(${colorVal},${colorVal},${colorVal})`;
        let key = `rect-${row}-${col}`;
        shapes.push(
          <Rect
            key={key}
            x={x}
            y={y}
            fill={
              // (row % 2 == 0 && col % 2 != 0) || (row % 2 != 0 && col % 2 == 0)
              //   ? "white"
              //   : "gray"
              color
            }
            width={options.pixelSize}
            height={options.pixelSize}
            ref={(node) => {
              itemsRef.current.set(key, node);
              return () => {
                itemsRef.current.delete(key);
              };
            }}
          />
        );
      }
    }

    return <>{...shapes}</>;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#111",
      }}
    >
      <div
        style={{
          position: "absolute",
          zIndex: 10,
          padding: "10px",
          color: "white",
        }}
      >
        <label>
          <label>
            <input
              type="range"
              min="1"
              max="500"
              value={options.pixelSize}
              onChange={(e) =>
                handleInputChange("pixelSize", Number(e.target.value))
              }
            />
            Pixel Size: {options.pixelSize}
            <br />
          </label>
          <label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={options.noiseScale}
              onChange={(e) =>
                handleInputChange("noiseScale", Number(e.target.value))
              }
            />
            Noise Scale: {options.noiseScale}
          </label>
          <br />
          <input
            type="range"
            min="0"
            max="5"
            step="0.01"
            value={options.speed}
            onChange={(e) => handleInputChange("speed", Number(e.target.value))}
          />
          Speed: {options.speed}
        </label>
      </div>
      <div ref={divRef} style={{ width: "100%", height: "100%" }}>
        <canvas
          ref={canvasRef}
          width={Math.ceil(canvasSize.width / options.pixelSize)}
          height={Math.ceil(canvasSize.height / options.pixelSize)}
          style={{ display: "none" }}
        />

        <Stage
          width={canvasSize.width}
          height={canvasSize.height}
          onWheel={handleWheel}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePos.x}
          y={stagePos.y}
          draggable // Enables panning
          onDragEnd={(e) => {
            // Updates stage position after dragging
            setStagePos({
              x: e.target.x(),
              y: e.target.y(),
            });
          }}
        >
          <Layer>
            {/* {createShapes()} */}
            <Image
              ref={imageRef}
              x={0}
              y={0}
              width={canvasSize.width}
              height={canvasSize.height}
              filters={[]}
              image={undefined}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

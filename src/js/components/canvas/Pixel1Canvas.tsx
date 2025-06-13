import React, { useEffect, useRef, useState } from "react";
import { Image, Layer, Stage } from "react-konva";
import { createNoise2D, createNoise3D } from "simplex-noise";
import useWindowSize from "../../hooks/resize";

const noise2D = createNoise2D();
const noise3D = createNoise3D();

export default function Pixel1Canvas() {
  const divRef = useRef<HTMLDivElement>(null);
  const [windowWidth, windowHeight] = useWindowSize();
  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
  });
  const [ticking, _] = useState(true);
  const [tick, setTick] = useState(0);

  const [options, setOptions] = useState({
    noiseScale: 20,
    pixelSize: 4,
    speed: 1,
    colorBuckets: 20,
    exp: 1,
  });

  // State for stage scale and position
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  const imageRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => ticking && setTick(tick + 1), 10);
    return () => clearTimeout(timer);
  }, [tick, ticking]);

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

  useEffect(() => {
    if (!canvasRef.current || canvasSize.width == 0 || canvasSize.height == 0)
      return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const cols = Math.ceil(canvasSize.width / options.pixelSize);
    const rows = Math.ceil(canvasSize.height / options.pixelSize);

    const imageData = ctx.createImageData(cols, rows);
    const { data } = imageData;

    function valueForCoord(x: number, y: number) {
      let nx = x / options.noiseScale;
      let ny = y / options.noiseScale;
      let nz = (tick * options.speed) / 100;
      let noiseVal = noise3D(nx, ny, nz);
      noiseVal += 0.5 * noise3D(2 * nx, 2 * ny, 2 * nz);
      noiseVal += 0.25 * noise3D(4 * nx, 4 * ny, 4 * nz);
      noiseVal += 0.125 * noise3D(8 * nx, 8 * ny, 8 * nz);
      noiseVal /= 1 + 0.5 + 0.25 + 0.125;
      noiseVal = Math.pow(noiseVal, options.exp);

      let value = Math.floor(((noiseVal + 1) / 2) * 255);
      const buckets = options.colorBuckets;
      if (buckets >= 2) {
        const quantized = Math.floor((value / 256) * buckets);
        value = Math.floor((quantized / (buckets - 1 || 1)) * 255);
      }
      return value;
    }

    function setValueForCoord(x: number, y: number, value: number) {
      const index = (y * cols + x) * 4;
      data[index + 0] = value;
      data[index + 1] = value;
      data[index + 2] = value;
      data[index + 3] = 255;
    }

    const halfCols = Math.floor(cols / 2);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < halfCols; x++) {
        let value = valueForCoord(x, y);
        setValueForCoord(x, y, value);
      }
    }

    for (let y = 0; y < rows; y++) {
      for (let x = halfCols; x < cols; x++) {
        let value = valueForCoord(x - halfCols, y);
        setValueForCoord(x, y, value);
      }
    }

    ctx.putImageData(imageData, 0, 0);

    if (imageRef.current) {
      imageRef.current.image(canvasRef.current);
      imageRef.current.getLayer().batchDraw(); // force rerender
    }
  }, [tick, canvasSize, options]);

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
              max="100"
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
              min="0.01"
              max="1000"
              step="0.5"
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
            max="2"
            step="0.005"
            value={options.speed}
            onChange={(e) => handleInputChange("speed", Number(e.target.value))}
          />
          Speed: {options.speed}
        </label>
        <br />
        <label>
          <input
            type="range"
            min="1"
            max="40"
            value={options.colorBuckets}
            onChange={(e) =>
              handleInputChange("colorBuckets", Number(e.target.value))
            }
          />
          Color Buckets: {options.colorBuckets}
        </label>
        <br />
        <label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={options.exp}
            onChange={(e) => handleInputChange("exp", Number(e.target.value))}
          />
          Exp: {options.exp}
        </label>
        <br />
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

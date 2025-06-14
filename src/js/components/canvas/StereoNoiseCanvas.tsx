import React, { useEffect, useRef, useState } from "react";
import { Image, Layer, Stage } from "react-konva";
import { createNoise3D } from "simplex-noise";
import useWindowSize from "../../hooks/resize";

const noise3D = createNoise3D();

function Controls({
  options,
  handleInputChange,
}: {
  options: any;
  handleInputChange: (key: string, value: any) => void;
}) {
  return (
    <div style={{ padding: "10px", color: "white" }}>
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
      </label>
      <br />
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
      <label>
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
      <label>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={options.depthStrength}
          onChange={(e) =>
            handleInputChange("depthStrength", Number(e.target.value))
          }
        />
        Depth Strength: {options.depthStrength}
      </label>
    </div>
  );
}

export default function StereoNoiseCanvas() {
  const divRef = useRef<HTMLDivElement>(null);
  const [windowWidth, windowHeight] = useWindowSize();
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [ticking, _] = useState(true);
  const [tick, setTick] = useState(0);

  const [options, setOptions] = useState({
    noiseScale: 30,
    pixelSize: 4,
    speed: 1,
    colorBuckets: 20,
    exp: 1,
    depthStrength: 10,
  });

  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  const imageRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => ticking && setTick(tick + 1), 10);
    return () => clearTimeout(timer);
  }, [tick, ticking]);

  useEffect(() => {
    if (!(divRef.current?.offsetHeight || divRef.current?.offsetWidth)) return;
    setCanvasSize({
      width: divRef.current.offsetWidth,
      height: divRef.current.offsetHeight,
    });
  }, [windowWidth, windowHeight]);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    if (!stage) return;
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
    setOptions((old) => ({ ...old, [key]: value }));
  }

  useEffect(() => {
    if (!canvasRef.current || canvasSize.width === 0 || canvasSize.height === 0)
      return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const cols = Math.ceil(canvasSize.width / options.pixelSize);
    const rows = Math.ceil(canvasSize.height / options.pixelSize);
    const halfCols = Math.floor(cols / 2);

    const imageData = ctx.createImageData(cols, rows);
    const { data } = imageData;

    function valueForCoord(x: number, y: number) {
      const nx = x / options.noiseScale;
      const ny = y / options.noiseScale;
      const nz = (tick * options.speed) / 100;
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

    function setPixel(
      data: Uint8ClampedArray,
      x: number,
      y: number,
      width: number,
      value: number
    ) {
      const idx = (y * width + x) * 4;
      data[idx + 0] = value;
      data[idx + 1] = value;
      data[idx + 2] = value;
      data[idx + 3] = 255;
    }

    const leftImage = new Uint8ClampedArray(halfCols * rows * 4);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < halfCols; x++) {
        const val = valueForCoord(x, y);
        setPixel(leftImage, x, y, halfCols, val);
      }
    }

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < halfCols; x++) {
        const idx = (y * cols + x) * 4;
        const val = valueForCoord(x, y);
        const disparity = Math.floor(
          (val / 255 - 0.5) * 2 * options.depthStrength
        );
        const shiftedX = Math.max(0, Math.min(halfCols - 1, x - disparity));
        const srcIdx = (y * halfCols + shiftedX) * 4;

        // Left image
        data[idx + 0] = leftImage[(y * halfCols + x) * 4 + 0];
        data[idx + 1] = leftImage[(y * halfCols + x) * 4 + 1];
        data[idx + 2] = leftImage[(y * halfCols + x) * 4 + 2];
        data[idx + 3] = 255;

        // Right image
        data[idx + halfCols * 4 + 0] = leftImage[srcIdx + 0];
        data[idx + halfCols * 4 + 1] = leftImage[srcIdx + 1];
        data[idx + halfCols * 4 + 2] = leftImage[srcIdx + 2];
        data[idx + halfCols * 4 + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    if (imageRef.current) {
      imageRef.current.image(canvasRef.current);
      imageRef.current.getLayer().batchDraw();
    }
  }, [tick, canvasSize, options]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#111",
        position: "relative",
      }}
    >
      {/* LEFT Controls */}
      <div style={{ position: "absolute", left: 0, top: 0, zIndex: 10 }}>
        <Controls options={options} handleInputChange={handleInputChange} />
      </div>

      {/* RIGHT Controls - Centered on Right Half */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          zIndex: 10,
        }}
      >
        <Controls options={options} handleInputChange={handleInputChange} />
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
          draggable
          onDragEnd={(e) => setStagePos({ x: e.target.x(), y: e.target.y() })}
        >
          <Layer>
            <Image
              ref={imageRef}
              x={0}
              y={0}
              width={canvasSize.width}
              height={canvasSize.height}
              image={undefined}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

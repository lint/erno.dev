import React, { useEffect, useRef, useState } from "react";
import { Circle, Layer, Line, Stage } from "react-konva";
import { createNoise2D } from "simplex-noise";
import useWindowSize from "../../hooks/resize";

const noise2D = createNoise2D();

export default function TestCanvas() {
  const divRef = useRef<HTMLDivElement>(null);
  const [windowWidth, windowHeight] = useWindowSize();
  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
  });
  const [rows, setRows] = useState(20);
  const [cols, setCols] = useState(40);
  const [ticking, _] = useState(true);
  const [count, setCount] = useState(0);

  const [amplitude, setAmplitude] = useState(10);
  const [xFreq, setXFreq] = useState(1);
  const [yFreq, setYFreq] = useState(1);
  const [speed, setSpeed] = useState(2);
  const [circlesEnabled, setCirclesEnabled] = useState(false);
  const [horzEnabled, setHorzEnabled] = useState(true);
  const [vertEnabled, setVertEnabled] = useState(true);

  // State for stage scale and position
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

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

  function createShapes() {
    const shapes = [];

    // for (let i = 0; i < 20; i++) {
    // shapes.push(
    //     <Circle
    //         x={200}
    //         y={100}
    //         radius={50}
    //         fill="white"
    //         draggable
    //     />);
    // }

    // for (let row = 0; row <= rows; row++) {
    //     let points = [];

    //     for (let col = 0; col <= cols; col++) {
    //         let y = row / rows * canvasSize.height;
    //         let x = col / cols * canvasSize.width;

    //         let y2 = amplitude * Math.sin((x - (count / 100 * speed * xFreq)));
    //         let x2 = amplitude * Math.sin((y - (count / 100 * speed * yFreq)));
    //         points.push(x + x2, y + y2);
    //     }

    //     let line = <Line

    //         points={points}
    //         // tension={0.5}
    //         stroke="white"
    //     />;

    //     shapes.push(line);
    // }

    let horzPointsAll = [];
    for (let row = 0; row <= rows; row++) {
      let horzPoints = [];

      for (let col = 0; col <= cols; col++) {
        let y = (row / rows) * canvasSize.height;
        let x = (col / cols) * canvasSize.width;

        const value2d = noise2D(
          x * xFreq + (count / 1000) * speed,
          y * yFreq + (count / 1000) * speed
        );

        // let offset = Math.sin(value2d + count/100*speed) * amplitude;
        // x += offset;
        // y += offset;

        // x += Math.sin(value2d) * amplitude;
        // y += Math.cos(value2d) * amplitude;
        // x += value2d * amplitude * Math.sin(amplitude);
        // y += value2d * amplitude * Math.sin(amplitude);
        x += value2d * amplitude;
        y += (value2d + Math.sin(count / 100)) * amplitude;

        if (circlesEnabled) {
          shapes.push(
            <Circle
              key={`circ-${row}-${col}`}
              x={x}
              y={y}
              radius={2}
              fill="white"
            />
          );
        }
        if (horzEnabled || vertEnabled) {
          horzPoints.push([x, y]);
        }
      }
      if (vertEnabled) {
        horzPointsAll.push(horzPoints);
      }
      if (horzEnabled) {
        let line = (
          <Line
            key={`hline-${row}`}
            points={horzPoints.flat()}
            // tension={0.5}
            stroke="white"
          />
        );
        shapes.push(line);
      }
    }
    if (vertEnabled) {
      for (let y = 0; y < horzPointsAll[0]?.length; y++) {
        // Added optional chaining for safety
        let points = [];

        // problem is that the array is flat

        for (let i = 0; i < horzPointsAll.length; i++) {
          let point = horzPointsAll[i][y];
          points.push(point);
        }
        let line = (
          <Line
            key={`vline-${y}`}
            points={points.flat()}
            // tension={0.5}
            stroke="white"
          />
        );
        shapes.push(line);
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
          <input
            type="range"
            min="0"
            max="100"
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
          />
          Rows: {rows}
        </label>
        <br />
        <label>
          <input
            type="range"
            min="0"
            max="500"
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
          />
          Cols: {cols}
        </label>
        <br />
        <label>
          <input
            type="range"
            min="0"
            max="500"
            step="1"
            value={amplitude}
            onChange={(e) => setAmplitude(Number(e.target.value))}
          />
          Amplitude: {amplitude}
        </label>
        <br />
        <label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.01"
            value={xFreq}
            onChange={(e) => setXFreq(Number(e.target.value))}
          />
          X Frequency: {xFreq.toFixed(2)}
        </label>
        <br />
        <label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.01"
            value={yFreq}
            onChange={(e) => setYFreq(Number(e.target.value))}
          />
          Y Frequency: {yFreq.toFixed(2)}
        </label>
        <br />
        <label>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          Speed: {speed}
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={circlesEnabled}
            onChange={(e) => setCirclesEnabled(e.target.checked)}
          />
          Circles Enabled
        </label>
        <label>
          <input
            type="checkbox"
            checked={horzEnabled}
            onChange={(e) => setHorzEnabled(e.target.checked)}
          />
          Horizontal Lines Enabled
        </label>
        <label>
          <input
            type="checkbox"
            checked={vertEnabled}
            onChange={(e) => setVertEnabled(e.target.checked)}
          />
          Vertical Lines Enabled
        </label>
      </div>
      <div ref={divRef} style={{ width: "100%", height: "100%" }}>
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
          <Layer>{createShapes()}</Layer>
        </Stage>
      </div>
    </div>
  );
}

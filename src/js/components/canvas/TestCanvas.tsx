
import React, { useEffect, useRef, useState } from 'react';
import { Layer, Line, Stage } from 'react-konva';
import useWindowSize from '../../hooks/resize';

export default function TestCanvas() {

    const divRef = useRef<HTMLDivElement>(null);
    const [windowWidth, windowHeight] = useWindowSize();
    const [canvasSize, setCanvasSize] = useState({
        width: 0,
        height: 0
    });
    const rows = 10;
    const cols = 400;
    const [ticking, _] = useState(true);
    const [count, setCount] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => ticking && setCount(count + 1), 10)
        return () => clearTimeout(timer)
    }, [count, ticking])

    useEffect(() => {
        if (!(divRef.current?.offsetHeight || divRef.current?.offsetWidth)) {
            return;
        }
        setCanvasSize({
            width: divRef.current.offsetWidth,
            height: divRef.current.offsetHeight
        })
    }, [windowWidth, windowHeight]);

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

        for (let row = 0; row <= rows; row++) {
            let points = [];

            for (let col = 0; col <= cols; col++) {
                let y = row / rows * canvasSize.height;
                let x = col / cols * canvasSize.width;

                y += Math.sin(x + count / 50 + y / 10) * 100;
                points.push(x, y);
            }

            let line = <Line

                points={points}
                // tension={0.5}
                stroke="white"
            />;

            shapes.push(line);
        }

        return (<>{...shapes}</>);
    }

    return (
        <div ref={divRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <Stage width={canvasSize.width} height={canvasSize.height}>
                <Layer>
                    {createShapes()}
                </Layer>
            </Stage>
        </div>
    );
}

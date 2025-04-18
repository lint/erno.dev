
import React from 'react';
import { Circle, Layer, Rect, Stage } from 'react-konva';

export default function TestCanvas() {

    return (
        <Stage width={window.innerWidth} height={window.innerHeight}>
            <Layer>
                <Rect
                    x={20}
                    y={50}
                    width={100}
                    height={100}
                    fill="red"
                    shadowBlur={10}
                    draggable
                />
                <Circle
                    x={200}
                    y={100}
                    radius={50}
                    fill="green"
                    draggable
                />
            </Layer>
        </Stage>
    );
}

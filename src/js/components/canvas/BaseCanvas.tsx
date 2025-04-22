
import React, { useEffect, useRef, useState } from 'react';
import { Layer, Stage } from 'react-konva';
import useWindowSize from '../../hooks/resize';

export default function BaseCanvas() {

    const divRef = useRef<HTMLDivElement>(null);
    const [windowWidth, windowHeight] = useWindowSize();
    const [canvasSize, setCanvasSize] = useState({
        width: 0,
        height: 0
    });

    useEffect(() => {
        if (!(divRef.current?.offsetHeight || divRef.current?.offsetWidth)) {
            return;
        }
        setCanvasSize({
            width: divRef.current.offsetWidth,
            height: divRef.current.offsetHeight
        })
    }, [windowWidth, windowHeight]);

    return (
        <div ref={divRef} style={{ width: '100%', height: '100%', overflow: 'hidden', backgroundColor: 'white' }}>
            <Stage width={canvasSize.width} height={canvasSize.height}>
                <Layer>

                </Layer>
            </Stage>
        </div>
    );
}


import React from 'react';
import './general.css';

export interface SegmentSelectProps {
    controlClass: string;
    activeClass: string;
    activeIndex: number;
    values: string[];
    callback: (params: any) => any;
}

export default function SegmentSelect({controlClass, activeClass, activeIndex, values, callback}: SegmentSelectProps) {
    return (
        <div className={controlClass}>
            {values.map((value, index) => {
                return (
                    <div key={"key-"+value} className={index === activeIndex ? activeClass : ""}>
                        <button onClick={callback}>{value}</button>
                    </div>
                );
                // if (index === values.length - 1) {
                //     console.log("key: ", "key-"+value)
                //     return (
                //         <div key={"key-"+value}>
                //             {btnContainer}
                //         </div>
                //     );
                // } else {
                //     console.log("key1: ", "key-"+value)
                //     console.log("key2: ", "key-"+value+"-sep")
                //     return (
                //         <div key={"key-"+value}>
                //             {btnContainer}
                //             <div className="segment-select-separator"></div>
                //         </div>
                //     );
                // }
            })}
        </div>
    );
}

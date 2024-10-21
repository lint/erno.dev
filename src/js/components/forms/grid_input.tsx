
import React from "react";
import './forms.css';

export interface GridInputProps {
    data: any[][];
}

export default function GridInput({data}: GridInputProps) {

    return (
        <div className="grid-input-container">

            <table className="grid-input-table">
                {data.map((row, rowIndex) => (
                    <tr className="grid-input-row">
                        {row.map((entry) => {

                            let th = (
                                <th className="grid-input-cell">
                                    {entry}
                                </th>
                            );
                            let td = (
                                <td className="grid-input-cell">
                                    <input type="text"></input>
                                </td>
                            );

                            return rowIndex === 0 ? th : td;
                        })}
                    </tr>
                ))}
            </table>
        </div>
    );
}

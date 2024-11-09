
import React from "react";
import './forms.css';
import { numberFieldValidation } from "../../util/validation";

export interface GridInputProps {
    data: any[][];
    minRows?: number;
    minCols?: number;
    editable: boolean;
    callback: (rowIndex: number, entryIndex: number, value: string) => any;
}

export default function GridInput({data, editable, minRows, minCols, callback}: GridInputProps) {
    console.log(data, editable, minRows, minCols)

    if (minCols && data.length > 0 && data[0].length < minCols) {
        let numNewCols = minCols - data[0].length; 

        data.forEach(row => {
            for (let i = 0; i < numNewCols; i++) {
                row.push("");
            }
        })
    }

    if (minRows && data.length < minRows && minCols) {
        let numNewRows = minRows - data.length;
        let numCols = data.length > 0 ? data[0].length : minCols;

        for (let i = 0; i < numNewRows; i++) {
            let row = [];
            for (let j = 0; j < numCols; j++) {
                row.push("");
            }
            data.push(row);
        }
    }

    return (
        <div className="grid-input-container">

            <table className="grid-input-table">
                <tbody>
                {data.map((row, rowIndex) => (
                    <tr key={"key-row-"+rowIndex} className="grid-input-row">
                        {row.map((entry, entryIndex) => {

                            let className = "grid-input-cell" + (editable ? "" : " grid-input-locked");

                            let th = (
                                <th key={"key-cell-"+rowIndex+"-"+entryIndex} className={className} >
                                    {entry}
                                </th>
                            );
                            let field = <input 
                                disabled={!editable || entryIndex === 0} 
                                type="text" 
                                defaultValue={entry} 
                                onChange={entryIndex !== 0 ? numberFieldValidation : () => {}} 
                                size={6} 
                                maxLength={6}
                                placeholder={entry}>
                            </input>;

                            let td = (
                                <td key={"key-cell-"+rowIndex+"-"+entryIndex} className={className}
                                    onChange={(e)=> { 
                                        callback(rowIndex, entryIndex, (e.target as HTMLInputElement).value);
                                    }}
                                >
                                    {field}        
                                </td>
                            );

                            return rowIndex === 0 ? th : td;
                        })}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

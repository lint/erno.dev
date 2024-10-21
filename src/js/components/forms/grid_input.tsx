
import React from "react";
import './forms.css';
import { numberFieldValidation } from "../../util/validation";

export interface GridInputProps {
    data: any[][];
    editable: boolean;
}

export default function GridInput({data, editable}: GridInputProps) {

    return (
        <div className="grid-input-container">

            <table className="grid-input-table">
                <tbody>
                {data.map((row, rowIndex) => (
                    <tr key={"key-row-"+rowIndex} className="grid-input-row">
                        {row.map((entry, entryIndex) => {

                            let th = (
                                <th key={"key-cell-"+rowIndex+"-"+entryIndex} className="grid-input-cell">
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
                            let label = <span>{entry}</span>;
                            let cellContent = editable ? field : label;

                            let td = (
                                <td key={"key-cell-"+rowIndex+"-"+entryIndex} className={"grid-input-cell" + ((editable || entryIndex === 0) ? "" : " grid-input-locked")}>
                                    {cellContent}        
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

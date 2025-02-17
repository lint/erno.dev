
export default function arraysEqual(arr1: any[], arr2: any[]) {
    return arr1.length === arr2.length && arr1.every(function (value, index) { return value === arr2[index] })
}

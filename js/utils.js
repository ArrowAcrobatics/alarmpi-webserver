export function RemoveFromArray(arrayobj, item) {
    // Helper function to remove a single element from a list if exists
    if (arrayobj.includes(item)) {
        let ind = arrayobj.indexOf(item);
        arrayobj.splice(ind, 1);
     }
}

export function bind(obj, memfunc) {
    const args = Array.prototype.slice.call(arguments, 2);
    return function() {
      return memfunc.apply(obj, args.concat(Array.prototype.slice.call(arguments)));
    };
}
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

export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export class Deferred {
    // promise;
    // resolve;
    // reject;
    constructor(handler) {
        let _this = this;
        this.promise = new Promise(function (_resolve, _reject) {
            _this.resolve = _resolve;
            _this.reject = _reject;
            if (handler) {
                handler(_this.resolve, _this.reject);
            }
        })
    }
}
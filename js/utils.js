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

function deferredPromise(handler){
  let resolve, reject;

  let promise = new Promise(function(_resolve, _reject){
    resolve = _resolve;
    reject = _reject;
    if(handler) handler(resolve, reject);
  })

  promise.resolve = resolve;
  promise.reject = reject;
  return promise;
}
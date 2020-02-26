
   async function pause (x) {
      await wait(1000)
      return x;
    }

    var pauseP = t => async x => {
      await wait(t*1000)
      return x;
    }

    async function pauseM (x) {
      await wait(600)
      return ret(x);
    }

    async function pauseX (x) {
      await wait(x);
    }

    async function squareP (x) {
      await wait(1200)
      return x*x;
    }

    var divPinverse = a => async b => {
      await wait (600)
      return a/b;
    }

    var divP = a => async b => {
      await wait (600)
      return b/a;
    }

    var doubleP = async a => {
      await wait (1000)
      return a+a;
    }

    var toInt = a => pareseInt(a, 10);

    var addP_toInt = x => async y => {
      await wait(1000)
      return toInt(x) + toInt(y);
    }

    var addP = x => async y => {
      await wait(1000)
      return x + y;
    }

    var multP = x => async y => {
      await wait(1200)
      return x * y;
    }

    var powP = x => async y => {
      await wait(1200)
      return y**x;
    }

    async function cubeP (x) {
      await wait(1200)
      return x*x*x;
    }

    async function idP (x) {
      await wait(1200)
      return x;
    }
    async function sqrtP (x) {
      await wait(1200)
      return x**(1/2)
    }

    var _conveNt_ = a => b => parseFloat(b,a);
    var toFloat = _conveNt_ (10);

    function intArray (n) {
      return [...Array(n).keys()];
    }

    function wait(ms) {
       return new Promise(r => setTimeout(r, ms));
    }

    var cube = x => x**3;
    var pow = p => x => x**p;
    var square = x => x*x;
    var add = x => y => x+y;
    var sqrt = x => x**(1/2);
    var root = r => x => x(1/r);
    var div = d => x => x/d;

   var f = function f () {};
   var f_ = function f_ () {};
   var sto = "sto";
   var halt = "halt";

   var O = new Object();
   $: O;

   var M = -1;
   $: M;
   var N = -1;
   $: N;
   var T = -1;
   $: T;
   var Q = -1
   $: Q;

   var lock = false;
   $: lock

   var Monad = function Monad ( AR = [], name = "generic"  )  {
     var f_, p, run;
     var ar = AR.slice();
     var name = name;
     O[name] = ar;
     let x = O[name].pop();
     return run = (function run (x) {
       if (x instanceof Promise) x.then(y =>
         {if (y != undefined && typeof y !== "boolean" && y === y &&
         y.name !== "f_" && y.name !== "halt" ) {
         O[name] = O[name].concat(y)
       }})
       else if (x != undefined && x === x  && x !== false
       && x.name !== "f_" && x.name !== "halt" ) {
         O[name] = O[name].concat(x)
       };
       function f_ (func) {
         if (func === 'halt' || func === 'S') return O[name];
         else if (typeof func !== "function") p = func;
         else if (x instanceof Promise) p = x.then(v => func(v));
         else p = func(x);
         return run(p);
       };
       return f_;
     })(x);
   }

<script>
import {fade} from "svelte/transition"
let visible = true;


var k  = 100000000;
$: k;
var ltTest = x => y => new Filt(x => y < x);
$: ltTest;

var isOdd = function isOdd (x) {return new Filt(v => v % 2 === 1)};
var _fives = function _fives (x) {
 if (typeof x === "number") {return new Filt(v => v % 10 === 5)}
 else if (typeof x === "string") {return Filt(v = v(v.length - 1))}
 else {return undefined}''
}

var fives = function fives (x) {return new Filt(v => v % 10 === 5)}

var isOddF = function isOddF (x) {return new Filt(v => v % 2 === 1)};

function isOd_ (x) {return new Filt(v => v % 2 === 1)};
var lessThan = x => y => new Filt(x => y < x);

function tdReduce(base) {
  return function(reducingFunction) {
    return (accumulator, value) => {
      return reducingFunction(accumulator, func(v));
    }
  }
}

function tdMap(func) {
  return function(reducingFunction) {
    return (accumulator, v) => {
      return reducingFunction(accumulator, func(v));
    }
  }
}

function tdFilter(test) {
  return function(reducingFunction) {
    return (accumulator, v) => {
      return (test(v) ? reducingFunction(accumulator, v) : accumulator)
    };
  };
};

var ar = "cowgirl";
$: ar;

var cleanF = function cleanF (arthur = []) {
  ar = arthur;
  return ar.filter(
    a => a === 0 || a && typeof a !== "boolean" //
  ).reduce((a,b)=>a.concat(b),[])
};

$: cleanF;


function Monad ( AR = [] )  {
  var f_, p, run;
  var ar = AR.slice();
  var x = ar.pop();
  return run = (function run (x) {
    if (x === null || x === NaN ||
      x === undefined) x = f_('stop').pop();
    if (x instanceof Filt) {
      var z = ar.pop();
      if (x.filt(z)) x = z; else ar = [];
    }
    else if (x instanceof Promise) x.then(y =>
      {if (y != undefined && typeof y !== "boolean" && y === y &&
      y.name !== "f_" &&
      y.name !== "stop" ) {
      ar.push(y);
    }})
    else if (x != undefined && x === x  && x !== false
      && x.name !== "f_" && x.name !== "stop" ) {
      ar.push(x);
    };
    function f_ (func) {
      if (func === 'stop' || func === 'S') return ar;
      else if (func === 'finish' || func === 'F') return Object.freeze(ar);
      else if (typeof func !== "function") p = func;
      else if (x instanceof Promise) p = x.then(v => func(v));
      else p = func(x);
      return run(p);
    };

    return f_;
  })(x)
}

var mon44 = `function Monad ( AR = [] )  {
  var f_, p, run;
  var ar = AR.slice();
  var x = ar.pop();
  return run = (function run (x) {
    if (x === null || x === NaN ||
      x === undefined) x = f_('stop').pop();
    if (x instanceof Filt) {
      var z = ar.pop();
      if (x.filt(z)) x = z; else ar = [];
    }
    else if (x instanceof Promise) x.then(y =>
      {if (y != undefined && typeof y !== "boolean" && y === y &&
      y.name !== "f_" &&
      y.name !== "stop" ) {
      ar.push(y);
    }})
    else if (x != undefined && x === x  && x !== false
      && x.name !== "f_" && x.name !== "stop" ) {
      ar.push(x);
    };
    function f_ (func) {
      if (func === 'stop' || func === 'S') return ar;
      else if (func === 'finish' || func === 'F') return Object.freeze(ar);
      else if (typeof func !== "function") p = func;
      else if (x instanceof Promise) p = x.then(v => func(v));
      else p = func(x);
      return run(p);
    };

    return f_;
  })(x)
} `

var compose = (...fns) =>
fns.reduceRight((prevFn, nextFn) =>
(...args) => nextFn(prevFn(...args)),
value => value
);

var add1 = function add1(v) { return v + 1; };
var sum = function sum(total,v) { return total + v; };
var cube = function cube(v) { return v**3; };

var size = 100;
$: size;

var ar74 = [...Array(size).keys()];
$: ar74;

var mapWRf = mapping(cube);
var mapRes = ar74.reduce(mapWRf(concat), []);

var isEven = x => x % 2 === 0;
var not = x => !x;
var isOdd2 = compose(not, isEven);

function curry(fn) {
   var arity = fn.length;
   return function $curry(...args) {
      if (args.length < arity) {
         return $curry.bind(null, ...args);
      }
      return fn.call(null, ...args);
   }  ;
}

var map = f => ar => ar.map(v=>f(v));
var filter = p => ar => ar.filter(p);
var reduce = f => ar => v => ar.reduce(f,v)
function apply(x, f) {return f(x);}
function concat(xs, val) {return xs.concat(val);}

function mapping(f) {
   return function(rf) {
      return (acc, val) => {
         return rf(acc, f(val));
      }
   }
}

var A_A = "H";
$: A_A;

var B_B = "s";
$: B_B;

var C_C = "G";
$: C_C;

var D_D = "I";
$: D_D;

var res1;
// $: res1;

var res2;
// $: res2;

var res3;
$: res3;

var res4;
$: res4;

var dotResult = [];
$: dotResult;

var test9;
$: test9;

var transducerResult;
$: transducerResult;


 A_A = dotResult = ar74
   .filter(v => (v % 2 === 1))
   .map(x => x**4)
   .map(x => x+3)
   .map(x => x-3)
   .filter(v => v % 10 === 5)
   .map(x => Math.sqrt(x))
   .map(v=>v*v)
   .map(v=>v+1000)


var td3;
$: td3;

var xform;
$: xform;

var xform2;
$: xform2;

var xform3;
$: xform3


var test8 = k => ltTest(k).filt;;

var test9
$: test9;

  function Filt (p) {this.p = p; this.filt = function filt (x) {return p(x)}};
  var fives = function fives (x) {return new Filt(v => v % 10 === 5)}

  var td1 = x => Monad([x])(isOdd)(v=>v**4)(v=>v+3)(v=>v-3)(fives)(Math.sqrt)('stop').pop()
  var td2 = y => Monad([y])(v=>v*v)(v=>v+1000)('stop').pop()

res1 = ar74.map(x => td1(x));
B_B = res2 = res1.map(y => td2(y));
C_C = res3 = ar74.map(z => td2(td1(z)));


   xform = compose(
      tdFilter(x=>x%2===1),
      tdMap(x => x**4),
      tdMap(x => x+3),
      tdMap(x => x-3),
      tdFilter(x => x % 10 === 5),
      tdMap(x => Math.sqrt(x))
   )
   xform2 = compose(
      tdMap(x=>x*x),
      tdMap(x=>x+1000)
   );

   xform3 = compose(
      tdFilter(x=>x%2===1),
      tdMap(x => x**4),
      tdMap(x => x+3),
      tdMap(x => x-3),
      tdFilter(x => x % 10 === 5),
      tdMap(x => Math.sqrt(x)),
      tdMap(x=>x*x),
      tdMap(x=>x+1000)
   );
   D_D = transducerResult = ar74.reduce(xform3(concat),[] );
   $: transducerResult = ar74.reduce(xform3(concat),[] );

   $: A_A = dotResult;
   $: B_B = cleanF(res2);
   $: C_C = cleanF(res3);
   $: D_D = transducerResult;

var t37;
$: t37;
function test37 (e) {t37 = e; console.log(e)};


$: dotResult;
$: res2;
$: res3;
$: transducerResult;

var callback = `function increase () {
  size = size + 10;
  ar74 = [...Array(size).keys()];
   A_A = dotResult = ar74
   .filter(v => (v % 2 === 1))
   .map(x => x**4)
   .map(x => x+3)
   .map(x => x-3)
   .filter(v => v % 10 === 5)
   .map(x => Math.sqrt(x))
   .map(v=>v*v)
  res1 = ar74.map(x => td1(x));
  B_B = res2 = res1.map(y => td2(y));
  C_C = res3 = ar74.map(z => td2(td1(z)));
  D_D = transducerResult = ar74.reduce(xform3(concat),[] );
}

  function Filt (p) {this.p = p; this.filt = function filt (x) {return p(x)}};
  var fives = function fives (x) {return new Filt(v => v % 10 === 5)}
  var isOdd = function isOdd (x) {return new Filt(v => v % 2 === 1)};

  var td1 = x => Monad([x])(isOdd)(v=>v**4)(v=>v+3)
    (v=>v-3)(fives)(Math.sqrt)('stop').pop()
  res1 = ar74.map(x => td1(x));
  var td2 = y => Monad([y])(v=>v*v)(v=>v+1000)('stop').pop()`

var call2 = `xform3 = compose(
    tdFilter(x=>x%2===1),
    tdMap(x => x**4),
    tdMap(x => x+3),
    tdMap(x => x-3),
    tdFilter(x => x % 10 === 5),
    tdMap(x => Math.sqrt(x)),
    tdMap(x=>x*x),
    tdMap(x=>x+1000)
  );

  function tdMap(func) {
    return function(reducingFunction) {
      return (accumulator, v) => {
        return reducingFunction(accumulator, func(v));
      }
    }
  }

  function tdFilter(test) {
    return function(reducingFunction) {
      return (accumulator, v) => {
        return (test(v) ? reducingFunction(accumulator, v) : accumulator)
      };
    };
  }; `

  function increase () {
    size = size + 10;
    ar74 = [...Array(size).keys()];
    res1 = ar74.map(x => td1(x));
     A_A = dotResult = ar74
     .filter(v => (v % 2 === 1))
     .map(x => x**4)
     .map(x => x+3)
     .map(x => x-3)
     .filter(v => v % 10 === 5)
     .map(x => Math.sqrt(x))
     .map(v=>v*v)
     .map(v=>v+1000)
    B_B = res2 = res1.map(y => td2(y));
    C_C = res3 = ar74.map(z => td2(td1(z)));
    D_D = transducerResult = ar74.reduce(xform3(concat),[] );
  }

function decrease () {
  size = size - 10;
  ar74 = [...Array(size).keys()];
  res1 = ar74.map(x => td1(x));
   A_A = dotResult = ar74
   .filter(v => (v % 2 === 1))
   .map(x => x**4)
   .map(x => x+3)
   .map(x => x-3)
   .filter(v => v % 10 === 5)
   .map(x => Math.sqrt(x))
   .map(v=>v*v)
   .map(v=>v+1000)
  B_B = res2 = res1.map(y => td2(y));
  C_C = res3 = ar74.map(z => td2(td1(z)));
  D_D = transducerResult = ar74.reduce(xform3(concat),[] );
}

$: size;
$: ar74;
$: increase;
$: decrease;
increase();
decrease();
  </script>
<style>
.p {
  color: #FFAAAA;;
  font-size: 20px;
}
.q {
  color: #FFFFAA;
}
</style>
<br><br><br>
{#if visible}
 <div style = "font-family: Times New Roman;  text-align: center; color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
TRANSDUCER SIMULATION
 </div>
{/if}
<br><br>

<p> The tradition JavaScript method of composing functions using mainly map, filter, and reduce dot notation (eg. "array.map(func1).filter(func2).map(func3)") polutes memory with arrays that are used only to compute the next array in a chain. Moreover, each of the soon-to-be useless arrays must be traversed. When arrays are large and numerous functions are involved, this can be a performance bottleneck.</p>
<p> Transducers provide an ingenious solution to the problem. Any JavaScript developer who hasn't already done so would do well to get a good night's sleep, drink a big cup of coffee, and wrap his or her head around the transducer algorithm.</p>
<p> Another, more straightforward one-array-traversal solution is to use monads. This post shows the result of an array being traversed only one time and, with the help of a monad, undersoing multiple transformations by a collection of functions. The result is the same result obtained by the dot method and a standard transducer.</p>
<p> The following results were obtained by eight transformations on an array of the first 100 integers:</p>
<br><br>
<div class = p> Traditional dot composition </div>
<br>
<div class = q >[{A_A.join(", ")}]</div>
<br>
<br>
<div class = p> Composition in two stages using Monad </div>
<br>
<div class = q > [{B_B.join(", ")}]</div>
<br>
<br>
<div class = p> Composition in one traversal using Monad </div>
<br>
<div class = q > [{C_C.join(", ")}]</div>
<br>
<br>
<div class = p> Composition using a standard transducer </div>
<br>
<div class = q > [{D_D.join(", ")}]</div>
<br>
<br>
<button class = but on:click = {increase}>INCREASE</button>
<button class = but on:click = {decrease}>DECREASE</button>
<br><br>
<div>Array length: {size}</div>
<br>
<div>ar74: [{ar74.join(", ")}]</div>
<br>
<div>The modified Monad (below) could benefit from some refactoring, but it does what needs to be done for this demo. The point is that a standard transducer and Monad both use one array traversal to accomplish what the built-in dot method does by traversing the original array and seven intermediary arrays. </div>
<pre>{mon44}</pre>
<p> On my desktop computer, when ar74.length === 100,000 I got this and similar results: </p>
<div style = "color: #BBFFBB">ar74.length = 100,000:</div>

<pre>Dot method:: 25 ms
Monad two traversals: 255 ms
Monad one traversal: 220 ms
Transducer: 26 ms </pre>
<p> ar74.length === 1,000,000 was about as far as I could go without crashing the browser. Here are two typical results: </p>

<div style = "color: #BBFFBB">Two runs with ar74.length = 1,000,000:</div>

<pre>Dot method:: 276
Monad two traversals: 2140
Monad one traversal: 2060
Transducer: 180

Dot method:: 312
Monad two traversals: 2093
Monad one traversal: 2115
Transducer: 176 </pre>
<p> As you see, the built-in JavaScript dot method and the transducer gave similar results. The Monad methods are much slower. They're just a proof-of-concept hacks showing the versitility of monads spawned by Monad(). </p>
<p> Here's the definition of the increase button's callback function along with the definitions of some assoc some supportingrelated: </p>
<pre>{callback}</pre>
<p> And here's some of the code behind the transducer demonstration: </p>
<pre>{call2}</pre>
<span> The rest of the code can be found in the </span>
<a href = "https://github.com/dschalk/blog">Github repository</a>
<span>.</span>

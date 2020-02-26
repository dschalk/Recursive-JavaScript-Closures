
<script>

import {fade} from "svelte/transition"
let visible = true;

function Monad (z) {
  var x = z;
  var stop = "stop";
  var foo = function foo (func) {
    if (func.name === "stop") return x
    else {
      x = func(x);
      return foo;
    }
  };
  return foo;
}

var Comp = function Comp ( AR = [] )  {
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
      y.name !== "f_" && y.name !== "stop" ) {
      ar.push(y);
      diffRender()
    }})
    else if (x != undefined && x === x  && x !== false
      && x.name !== "f_" && x.name !== "stop" ) {
      ar.push(x);
      diffRender()
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
function ints (n) {return [...Array(n)]}
function isOdd (x) {return new Filt(v => v % 2 === 1)};A

var lessThan = x => y => new Filt(x => y < x);
var ltTest = lessThan();

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
      return test(v) ?
       reducingFunction(accumulator, v) : accumulator;
    };
  };
};

function cleanF (ar) {
  return ar.filter(
    a => a === 0 || a && typeof a !== "boolean" //
  ).reduce((a,b)=>a.concat(b),[])
};

function Fux (p) {this.p = p; this.fux = function fux (x) {return p(x)}};

  var quadF = a => b => c => {
      let ar = [];
      let d = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
      let e = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
      if (d === d) {
          ar.push(`${a}*x*x + ${b}*x + ${c} = 0 has the following solutions:`);
          ar.push(`x = ${d} and x = ${e}`);
      }
      else {
          ar.push(`${a}*x*x + ${b}*x + ${c} = 0 has no solution`);
          ar.push('');
      }
      return ar;
  }

function* integers() {
  let i = 0;
    while (true) {
    yield i++;
  }
}

function Filt (p) {this.p = p; this.filt = function filt (x) {return p(x)}};
function filtP (p) {return new Filt(p)};

var filtOdd = filtP(x=>x%2 === 1);
var filtEven = filtP(x=>x%2 === 0);
var less_than = function less_than(x) {return new Filt(v=>v<x)};

function add1(v) { return v + 1; };V
function sum(total,v) { return total + v; };
function cube(v) { return v**3; 

obS.push(27)

obS.push(27)

var obS  = { ar: [] };

obS.push = function (x) {
  this.ar.push(x);
  if (this.ar.length === 1) E_E = "Now specify an upper bound. The number you enter will be multiplied by 1000."
  if (this.ar.length === 2) {
    compTest3(this.ar[0], this.ar[1]);
    this.ar.length = 0;
    E_E = "Specify an array length: ";
  }
};

function compTest3 (k, n) {

var test9 = ltTest(k*1000).filt
var ar7b = [...Array(Math.abs(n)).keys()];

var res4 = ar7b
.filter(v => (v % 2 === 1))
.map(x => x**4)
.map(x => x+3)
.map(x => x-3)
.map(x => Math.sqrt(x))
// console.log("res4 is", res4);

var dotResult = res4
.map(v=>v*v)
.map(v=>v+1000)
.filter(v => v < k*1000);
console.log("dotResult is", dotResult);

var td1 = x => Comp([x])(isOdd)(v=>v**4)(v=>v+3)(v=>(v-3)/Math.sqrt(v-3))('stop').pop()
var td2 = y => Comp([y])(v=>v*v)(v=>v+1000)(test9)('stop').pop()

var res1 = ar7b.map(x => td1(x));
var res2 = res1.map(y => td2(y));
var res3 = ar7b.map(z => td2(td1(z)));

console.log("cleanF(res2) is", cleanF(res2));
console.log("cleanF(res3) is", cleanF(res3));

var xform = compose(
  tdFilter(x=>x%2===1),
  tdMap(x => x**4),
  tdMap(x => x+3),
  tdMap(x => x-3),
  tdMap(x => Math.sqrt(x))
)
var xform2 = compose(
  tdMap(x=>x*x),
  tdMap(x=>x+1000),
  tdFilter(x => x < k*1000)
);

var transducerResult = ar7b.reduce(xform(xform2(concat)),[] );
console.log("transducerResult is", transducerResult);

  A_A = dotResult.join( );
  B_B = cleanF(res2).join( );
  C_C = cleanF(res3).join( );
  D_D = cleanF(transducerResult).join( );
}
var code = `
var obS  = { ar: [] };

obS.push = function (x) {
  this.ar.push(x);
  if (this.ar.length === 1) E_E = "Now specify an upper bound. The number you enter will be multiplied by 1000."
  if (this.ar.length === 2) {
    compTest3(this.ar[0], this.ar[1]);
    this.ar.length = 0;
    E_E = "Specify an array length: ";
  }
};

function compTest3 (k, n) {

var test9 = ltTest(k*1000).filt
var ar7b = [...Array(Math.abs(n)).keys()];

var res4 = ar7b
.filter(v => (v % 2 === 1))
.map(x => x**4)
.map(x => x+3)
.map(x => x-3)
.map(x => Math.sqrt(x))
// console.log("res4 is", res4);

var dotResult = res4
.map(v=>v*v)
.map(v=>v+1000)
.filter(v => v < k*1000);
console.log("dotResult is", dotResult);

var td1 = x => Comp([x])(isOdd)(v=>v**4)(v=>v+3)(v=>(v-3)/Math.sqrt(v-3))('stop').pop()
var td2 = y => Comp([y])(v=>v*v)(v=>v+1000)(test9)('stop').pop()

var res1 = ar7b.map(x => td1(x));
var res2 = res1.map(y => td2(y));
var res3 = ar7b.map(z => td2(td1(z)));

console.log("cleanF(res2) is", cleanF(res2));
console.log("cleanF(res3) is", cleanF(res3));

var xform = compose(
  tdFilter(x=>x%2===1),
  tdMap(x => x**4),
  tdMap(x => x+3),
  tdMap(x => x-3),
  tdMap(x => Math.sqrt(x))
)
var xform2 = compose(
  tdMap(x=>x*x),
  tdMap(x=>x+1000),
  tdFilter(x => x < k*1000)
);

var transducerResult = ar7b.reduce(xform(xform2(concat)),[] );
console.log("transducerResult is", transducerResult);

  A_A = dotResult.join( );
  B_B = cleanF(res2).join( );
  C_C = cleanF(res3).join( );
  D_D = cleanF(transducerResult).join( );
}`

</script>

{#if visible}
<div style = "font-family: Times New Roman;  text-align: center; color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
<br><br>
TRANSDUCER SIMULATION
</div>
{/if}
<p> You are my sunshine</p>

                        <div style = "display: flex">
                        <div style = "margin-Left: 2%; width: 50%" >

<p> If you click any two numbers (below), they switch locations and a "BACK" button appears. If you go back and click two numbers, the result gets inserted  at your location.</p>
<p> I can use simple variables knowing they will never clash with a similarly named variable in a differenct module. Svelte code is consise and efficient. Coding in Svelte is so relaxing. </p>

<br>
<br>
	<button on:click={back}>
		BACK
	</button>
<br>
<br>
   <div style="text-indent:20px"><button>{ j }</button></div>
<br>
	<button on:click={forward}>
		FORWARD
	</button>
 <br>
 <br>
                        </div>
                     <div style = "marginRight: 2%; width: 50%;">
<br><br><br><br><br><br><br><br><br><br><br><br><br><br>
<button id = m0  on:click = {ob.push} >{cache[j][0]}</button>
<button id = m1  on:click = {ob.push} >{cache[j][1]}</button>
<button id = m2  on:click = {ob.push} >{cache[j][2]}</button>
<br>
<br>
<button id = m3  on:click = {ob.push} >{cache[j][3]}</button>
<button id = m4  on:click = {ob.push} >{cache[j][4]}</button>
<button id = m5  on:click = {ob.push} >{cache[j][5]}</button>
<br>
<br>
<button id = m6  on:click = {ob.push} >{cache[j][6]}</button>
<button id = m7  on:click = {ob.push} >{cache[j][7]}</button>
<button id = m8  on:click = {ob.push} >{cache[j][8]}</button>
</div>
</div>
<p> This is the JavaScript code inside of the script tags except for the definitions of the variables "code" and "html", which are just the code and html cut and pasted inside of back quotes: </p>
<pre>{code}</pre>
<p> And here is the HTML code: </p>
<pre>{html}</pre>
<p> Is Svelte awesome, or what? </p>


<script>
import {fade} from "svelte/transition"
let visible = true;

function wait(ms) {
return new Promise(r => setTimeout(r, ms));
}

let j = 2;
$: j;

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
return Monad(x);
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

var toInt = a => parseInt(a, 10);

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

function intArray (n) {
return [...Array(n).keys()];
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
O.d0 = [2,3,4];
O.d1 = [2,3,4];
O.d2= [2,3,4];

var M = -1;
var Q = -1

var lock = false;

O.generic = ["Nobody"];

const Monad = function Monad ( AR = [], name = "generic", f_ = mFunc  )  {
let ar = AR.slice();
O[name] = ar;
let run;
let x = O[name].pop();
return run = (function run (x) {
if (x != undefined && x === x  && x !== false
  && x.name !== "f_" && x.name !== "halt" ) {
    O[name] = O[name].concat(x)
  };
  return f_;
})(x);
}

var mFunc = function mFunc_ (func) {
    if (func === 'halt' || func === 'S') return O[name];
    else if (typeof func !== "function") p = func(x);
    else if (x instanceof Promise) p = x.then(v => func(v));
    return run(p);
  };

/* let a0 = *Monad([3])(cube)
(add(3))(square)(div(100))
(sqrt)(()=>this)(halt); */

// var socket = new WebSocket("ws://localhost:3055")
var socket = new WebSocket("ws://167.71.168.53:3055")

socket.onclose = function (event) {
console.log('<><><> ALERT - socket is closing. <><><> ', event);
};

socket.onmessage = function(e) {
// console.log("WebSocket message is", e);
var v = e.data.split(',');
if (v[0] === "BE#$42") {
  Q = Q + 1;
  Monad([v[3]], "c"+Q);
  if (Q === 2) Q = -1;
  worker_OO.postMessage([v[3]])
}
}

login();

function login() {
console.log('00000000000000000000000000000000 Entering login', socket.readyState);
setTimeout(function () {
  if (socket.readyState === 1) {
    console.log('readyState is', socket.readyState);
    var v = Math.random().toString().substring(5);
    var v2 = v.toString().substring(2);
    var combo = v + '<o>' + v2;
    socket.send('CC#$42' + combo);
    // socket.send(`GZ#$42,solo,${v}`);
    socket.send("BE#$42,solo,name,10000")
    socket.send("BE#$42,solo,name,100000")
    socket.send("BE#$42,solo,name,1000")
  } else {
    login();
  }
}, 200)
}

function isEmpty(obj) {
  for(var key in obj) {
      if(obj.hasOwnProperty(key))
          return false;
  }
  return true;
};

function countKeys(ob, s) {
var N = 0
for(var key in ob) if (key.startsWith(s)) N+=1;
return N;
}

var groupDelete = function groupDelete (ob, x) {
for (var z in ob) if (z.startsWith("x")) delete ob[z]
}

var clearOb = function clearOb (ob) {
for (var x in ob) delete ob[x]
}

const factors = function factors () {
socket.send("BE#$42,solo,name,10000")
socket.send("BE#$42,solo,name,100000")
socket.send("BE#$42,solo,name,1000")
}

var worker_OO = new Worker('worker_OO.js');

worker_OO.onmessage = e => {
  M = M + 1;
  Monad([e.data], "d"+M);
  if (M === 2) {
    M = -1;
  }
}

var mon = `const Monad = function Monad ( AR = [], name = "generic" )  {
var f_, p, run;
var ar = AR.slice();
var name = name;
O[name] = ar;
let x = O[name].pop();
return run = (function run (x) {
if (x != undefined && x === x  && x !== false
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
} `

var statement = `    Monad(["value"], "key")(x => "This is the " + x)(x => x + ".")(halt)
O.key   // ["value", "This is the value", "This is the value."]`

var fa = `    function factors () {
if (lock === false && j === 2) {
  lock = true;
  clearOb(O);
  N = -1;
  M = -1;
  Q = -1;
  groupDelete(O, "c");
  groupDelete(O, "d");
  fact();
}
else if (j !== 2) {return}
else {
  setTimeout(()=> {
  factors()
},1000)
}
}`

var onmessServer = `ar v = e.data.split(',');
if (v[0] === "BE#$42") {
Q = Q + 1;
Monad([v[3]], "c"+Q);
worker_OO.postMessage([v[3]])
}
}  `

var onmessWorker = `worker_OO.onmessage = e => {
  M = M + 1;
  Monad([e.data], "d"+M);
  if (M === 2) {
    M = -1;
  }
}`

let candle = ` socket.send(\"BE#$42,solo,name,10000\")    
socket.send('\BE#$42,solo,name,100000\")    
socket.send(\"BE#$42,solo,name,1000\")    `    

</script>

<style>
button {
margin-left: 5%;
background-color: #004400;
border-width: 2px;
border-color: #E8F7C1;
border-radius: 70px;
text-decoration-color: red;
font-size: 20px;
-webkit-box-shadow: 0px 0px 15px 0px rgb(255, 215, 0);
box-shadow:         0px 0px 15px 0px rgb(255, 215, 0);
padding: 3px 10px 3px 10px;
}

button:hover {
background-color: #0000CC;
padding: 3px 10px 3px 10px;
text-decoration-color: yellow;
border-color: #0000AA;
}

</style>

{#if j === 2} 
 <div style = "font-family: Times New Roman;  text-align: center; color: hsl(210, 90%, 90%); font-size: 38px;" transition:fade>
ASYNCHRONOUSLY CREATED STATE
</div>
{/if}

<br>
<p> Clicking the button below sends three requests to the Haskell WebSockets server asking for quasi-random integers. As the numbers come in from the server, they are placed in the object named "O" with keys prefixed by "c", and then forwarded to a web worker. The worker returns arrays containing the prime factors of the numbers it recieves. These are placed in "O" with keys prefixed by "d".</p> 
 <br>





<div style = "color: #BBBBFF; font-size: 20px;"> The WebSockets server sent these numbers (now at O.c0, O.c1, and O.c2): </div>
<div style = "color: #FFFFCD; font-size: 20px; ">
{O.c0}, {O.c1}, and {O.c2}  
</div>
<br>
<span style = "color: #CDCDFF; font-size: 20px;"> The web worker sent these arrays of prime factors (now at O.d0, O.d1, and O.d2): </span>
<span style = "color: #FFFFCD; font-size: 20px;">
[{O.d0.join(', ')}], [{O.d1.join(', ')}], and [{O.d2.join(', ')}]</span>
<br>
<br>
<button on:click = {factors}>
<pre>{candle}</pre>

</button>
<br><br><br>



<div style = "color: #FFFFCD; font-size: 20px;">
[{O.d0}].reduce((a,b) => a*b) == {O.c0}: <span style = "font-size:24px; color:#FF0B0B" >{O.d0.reduce((a,b) => a*b) == O.c0}</span>
<br>
[{O.d1}].reduce((a,b) => a*b) == {O.c1}: <span style = "font-size:24px; color:#FF0B0B" >{O.d1.reduce((a,b) => a*b) == O.c1}</span>
<br>
[{O.d2}].reduce((a,b) => a*b) == {O.c2}: <span style = "font-size:24px; color:#FF0B0B" >{O.d2.reduce((a,b) => a*b) == O.c2}</span>
<br>


</div>

<p> In this demonstration, each monad's array of computed values is preserved as an attribute of an object named O. Here's the definition of "Monad" used in this module:</p>

<pre>{mon}</pre>

<p> Messages are sent to the Haskell WebSockets server requesting pseudo-random numbers between 1 and the integer specified at the end of the request. On the server, randomR from the System.Random library produces a number which is sent to the browser with prefix "BE#$42". Messages from the server are parsed in socket.onmessage. If the prefix is "BE#$42", the payload (a number) is sent to worker_OO, which sends back the number's prime decomposition.
<pre>{onmessServer}</pre>
<p> Messages from the web worker are processed in worker_OO.onmessage
<pre>{onmessWorker}</pre>
<p> When M === 2 the process is complete. M and N are set to -1 and lock is set to false, allowing another possible call to random() to call rand(). </p>
<br>
<span> The code for this Svelte application is at </span>
<a href = "https://github.com/dschalk/blog/" target = "_blank">GitHub repository</a>

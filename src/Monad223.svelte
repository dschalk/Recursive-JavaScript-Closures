
<script>
/*
{#if countKeys(O) > 30}

     {N = -1}
     {M = -1}
     {setTimeout(() => {
        O = new Object
        factors()
     },500)}
 {/if}

var arr = [1,2,3];
$: arr;

function Bonad (z = [1,2,3]) {
  arr = z;
  let x = arr.slice(-1)[0];
  let stop = "stop";
  let foo = function foo (func) {
     let x = arr.slice(-1)[0];
    if (x instanceof Promise) {
      x.then(y => arr = arr.concat(func(y)));
      return foo;
   }
    else if (func.name === "stop") return arr
    else if (typeof func === "function") {
      arr = arr.concat(func(x));
      return foo;
    }
    else if (typeof func !== "undefined") {
      arr = arr.concat(func);
      return foo;
    }
  }
  return foo;
}
*/

import {fade} from "svelte/transition"
let visible = true;

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
   }

    /* let a0 = *Monad([3])(cube)
     (add(3))(square)(div(100))
     (sqrt)(()=>this)(halt); */

   var socket = new WebSocket("ws://schalk.net:3055");

   socket.onclose = function (event) {
     console.log('<><><> ALERT - socket is closing. <><><> ', event);
   };

   socket.onmessage = function(e) {
     var v = e.data.split(',');
     if (v[0] === "BE#$42") {
       Q = Q + 1;
       Monad([v[3]], "c"+Q);
       worker_O.postMessage([v[3]])
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
      for (var x in ob) if (x.startsWith("d")) delete ob[x]
   }

   var clearOb = function clearOb (ob) {
      for (var x in ob) delete ob[x]
   }

   function factors () {
      if (lock === false) {
         lock = true;
         clearOb(O);
         N = -1;
         M = -1;
         Q = -1;
         groupDelete(O, "c");
         groupDelete(O, "d");
         fact();
      }
      else {
         setTimeout(()=> {
         factors()
      },1000)
      }
   }

   var fact = function fact () {
      socket.send("BE#$42,solo,3032896499791,10000")
      socket.send("BE#$42,solo,3032896499791,1000")
      socket.send("BE#$42,solo,3032896499791,100000")
      socket.send("BE#$42,solo,3032896499791,100000")
      socket.send("BE#$42,solo,3032896499791,10000")
      socket.send("BE#$42,solo,3032896499791,100000")
      socket.send("BE#$42,solo,3032896499791,1000")
      socket.send("BE#$42,solo,3032896499791,1000")
      socket.send("BE#$42,solo,3032896499791,100000")
      socket.send("BE#$42,solo,3032896499791,10000")
      socket.send("BE#$42,solo,3032896499791,100000")
      socket.send("BE#$42,solo,3032896499791,100")
      socket.send("BE#$42,solo,3032896499791,100000")
      socket.send("BE#$42,solo,3032896499791,10000")
      socket.send("BE#$42,solo,3032896499791,100000")

   }

   /*   if (countKeys(O) > 34) {
           setTimeout( () => {
           N = -1;
           M = -1;
           Q = -1;
           clearOb(O);
           factors();
       },700)
   } */

   var worker_O = new Worker('worker_O.js');

   worker_O.onmessage = e => {
     M = M = M + 1;
     Monad([e.data], "d"+M);
     if (M === 14) {
        M = -1;
        N = -1;
       lock = false;
     }
   }

  var mon = `   var Monad = function Monad ( AR = [], name = "generic"  )  {
       var f_, p, run;
       var ar = AR.slice();
       var name = name;
       O[name] = ar;y-value pairs on O out of each monad's monad's name and array
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
     if (lock === false) {
        lock = true;
        clearOb(O);
        N = -1;
        M = -1;
        Q = -1;
        groupDelete(O, "c");
        groupDelete(O, "d");
        fact();
     }
     else {
        setTimeout(()=> {
        factors()
     },1000)
     }
  }`

var fac = `  var fact = function fact () {
   socket.send("BE#$42,solo,3032896499791,10000")
   socket.send("BE#$42,solo,3032896499791,1000")
   socket.send("BE#$42,solo,3032896499791,100000")
   socket.send("BE#$42,solo,3032896499791,100000")
   socket.send("BE#$42,solo,3032896499791,10000")
   socket.send("BE#$42,solo,3032896499791,100000")
   socket.send("BE#$42,solo,3032896499791,1000000")
   socket.send("BE#$42,solo,3032896499791,1000")
   socket.send("BE#$42,solo,3032896499791,1000000")
   socket.send("BE#$42,solo,3032896499791,10000")
   socket.send("BE#$42,solo,3032896499791,100000")
   socket.send("BE#$42,solo,3032896499791,100000")
   socket.send("BE#$42,solo,3032896499791,100000")
   socket.send("BE#$42,solo,3032896499791,10000")
   socket.send("BE#$42,solo,3032896499791,100000")

}`

  var onmessServer = `  ar v = e.data.split(',');
  if (v[0] === "BE#$42") {
    Q = Q + 1;
    Monad([v[3]], "c"+Q);
    worker_O.postMessage([v[3]])
  }
}  `

  var onmessWorker = `    worker_O.onmessage = e => {
     M = M = M + 1;
     Monad([e.data], "d"+M);
     if (M === 14) {
        M = -1;
        N = -1;
       lock = false;
     }
   } `
</script>

<br><br><br>
{#if visible}
	<div style = "font-family: Times New Roman;  text-align: center; color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
ASYNCHRONOUS MONAD
	</div>
{/if}
<br><br>
<p> If you click execute multiple times in rapid succession, you will see that execution waits until previous runs have completed. This feature was implemented with the Boolean variable "lock". </p>
<br><br>
<button on:click = {factors}>EXECUTE factors()</button>
<br><br>
<span style = "color: #EEBBBB"> The WebSockets server sent these pseudo-random numbers: </span>
<span> {O.c0}, {O.c1}, {O.c2}, {O.c3}, {O.c4}, {O.c5}, {O.c6}, {O.c7}, {O.c8}, {O.c9}, {O.c10}, {O.c11}, {O.c12}, {O.c13}, {O.c14}</span>
<br><br>
<div style = "color: #EEBBBB"> The web worker sent these results: </div>
<div>
{O.d0}
<br>
{O.d1}
<br>
{O.d2}
<br>
{O.d3}
<br>
{O.d4}
<br>
{O.d5}
<br>
{O.d6}
<br>
{O.d7}
<br>
{O.d8}
<br>
{O.d9}
<br>
{O.d10}
<br>
{O.d11}
<br>
{O.d12}
<br>
{O.d13}
<br>
{O.d14}
<br>
</div>
<br>
<p> There are many ways to display the behavior of monads returned by Monad(). For this demonstration, a simple object named "O" was created and Monad was modified to make the names of monads attributes pointing to the monads'internal arrays. Here's the revised definition of Monad.</p>
<pre>{mon}</pre>
The statement "Monad(['value"], 'key")(x => 'This is the ' + x)(x => x + '.')(halt)" attaches the the resulting monad to O as follows:
<pre>{statement}</pre>
<p> The demonstration procedure is initiated by calling factors().
<pre>{fa}</pre>
<p> factor() is called once every second until lock === false; then, lock is set to true and fact() is called. The lock assures that the procedures initiated by fact() will complete before fact() is called again. </p>
<pre>{fac}</pre>
<p> Messages are sent to the Haskell WebSockets server requesting random numbers between 1 and the integer specified at the end of the request. randomR from the System.Random library produces a number which is sent back to the browser with prefix "BE#$42". Messages from the server are parsed and processed in socket.onmessage, which requests the random number's prime decomposition from worker_O.
<pre>{onmessServer}</pre>
<p> Messages from the web worker are processed in worker_O.onmessage
<pre>{onmessWorker}</pre>
<p> When M === 14 the process is complete. M and N are set to -1 and lock is set to false, allowing another possible call to random() to call rand(). </p>
<br>
<span> The code for this Svelte application is at </span>
<a href = "https://github.com/dschalk/blog/" target = "_blank">GitHub repository</a>

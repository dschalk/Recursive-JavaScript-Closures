
  <script>
      import {fade} from "svelte/transition"
      let visible = true;

      let j = 3;
      $: j;


    function wait(ms) {
      return new Promise(r => setTimeout(r, ms));
    }

      async function pause (x) {
        await wait(1000)
        return x;
      }

      let pauseP = t => async x => {
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
        await wait(100)
        return x*x;
      }

      let divPinverse = a => async b => {
        await wait (300)
        return a/b;
      }

      let divP = a => async b => {
        await wait (300)
        return b/a;
      }

      let doubleP = async a => {
        await wait (300)
        return a+a;
      }

      let toInt = a => pareseInt(a, 10);

      let addP_toInt = x => async y => {
        await wait(300)
        return toInt(x) + toInt(y);
      }

      let addP = x => async y => {
        await wait(900)
        return x + y;
      }

      let multP = x => async y => {
        await wait(300)
        return x * y;
      }

      let powP = x => async y => {
        await wait(300)
        return y**x;
      }

      async function cubeP (x) {
        await wait(300)
        return x*x*x;
      }

      async function idP (x) {
        await wait(300)
        return x;
      }
      async function sqrtP (x) {
        await wait(900)
        return x**(1/2)
      }

      let _conveNt_ = a => b => parseFloat(b,a);
      let toFloat = _conveNt_ (10);

      let cube = x => x**3;
      let pow = p => x => x**p;
      let square = x => x*x;
      let add = x => y => x+y;
      let sqrt = x => x**(1/2);
      let root = r => x => x(1/r);
      let div = d => x => x/d;

    let f = function f () {};
    let f_ = function f_ () {};
    let sto = "sto";
    let halt = "halt";

    let O = new Object();
    $: O;

    let M = -1;
    $: M;
    let N = -1;
    $: N;
    let T = -1;
    $: T;
    let Q = -1
    $: Q;

    let lock = false;
    $: lock

    let Monad = function Monad ( AR = [], name = "generic" )  {
      let p, run, f_;
      let  ar = AR.slice();
      O[name] = ar;
      let x = O[name].pop();
      return run = (function run (x) {
        if (x instanceof Promise) x.then(y => {
          if (typeof y != "undefined" && y == y && y.name !== "f_") {
          O[name] = O[name].concat(y)
          }
        })
        if (!(x instanceof Promise)) {
            if (x != undefined && x == x) {
              O[name] = O[name].concat(x)
            }
        }
        f_ = function f_ (func) {
          if (func === 'halt' || func === 'S') return O[name].slice();
          else if (typeof func !== "function") p = func;
          else if (x instanceof Promise) p = x.then(v => func(v));
          else p = func(x);
          return run(p);
        };
        return f_;
      })(x);
    }

    let branch = function branch (s,s2) {return Monad(O[s].slice()  , s2)}
    let resume = function resume (s) {return Monad(O[s], s)}

  /*  Monad([2], "test")(addP(1))(cubeP)(addP(3))(squareP)(divP(100))
    (() => branch("test", "test_2")(sqrtP)(cubeP)(()=>addP(O.test_2[2])
    (O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))
    (() => resume("test")(multP(4))(addP(6)))) */


  let mon = `   let Monad = function Monad ( AR = [], name = "generic"  )  {
      let f_, p, run;
      let ar = AR.slice();
      let name = name;
      O[name] = ar;
      let x = O[name].pop();
      return run = (function run (x) {
        if (x instanceof Promise) x.then(y => {
          if (y != undefined && y == y && y.name !== "f_") {
          O[name] = O[name].concat(y)
          }
        })
        if (!(x instanceof Promise)) {
            if (x != undefined && x == x) {
              O[name] = O[name].concat(x)
            }
        }
        function f_ (func) {
          if (func === 'halt' || func === 'S') return O[name].slice();
          else if (typeof func !== "function") p = func;
          else if (x instanceof Promise) p = x.then(v => func(v));
          else p = func(x);
          return run(p);
        };
        return f_;
      })(x);
    }`

    let lok = false;

    let start = function start () {
      if (!lok) {
        lok = true;
        setTimeout(() => lok = false,3000 );
        O = {};
        Monad([2], "test")(addP(1))(cubeP)(addP(3))(squareP)(divP(100))
        (() => branch("test", "test_2")(sqrtP)(cubeP)(()=>addP(O.test_2[2])
        (O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))
        (() => resume("test")(multP(4))(addP(6)))) }
      else {
        setTimeout(() => start(),300);
      }
    }

  let fs = `   let branch = function branch (s,s2) {return Monad(O[s].slice(-1)  , s2)}
    let resume = function resume (s) {return Monad(O[s], s)}`
  let code = `    Monad([2], "test")(addP(1))(cubeP)(addP(3))(squareP)(divP(100))
      (() => branch("test", "test_2")(sqrtP)(cubeP)(()=>addP(O.test_2[2])
      (O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))
      (() => resume("test")(multP(4))(addP(6))))`
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
    pre:hover {
      color: gold;
    }

    .caption {
      font: times;  
      text-align: center; 
      color: hsl(210, 90%, 90%); 
      font-size: 32px;
    }

    .sub_caption {
      font: times;  
      text-align: center; 
      color: hsl(210, 90%, 90%); 
      font-size: 32px;
    }
  </style>

  {#if j === 3}
 <div style = "font-family: Times New Roman;  text-align: center; color: hsl(210, 90%, 90%); " transition:fade>
<div style = "font-size: 32px;"> A MONAD FOR PROMISE MANIPULATION</div>
<div style = "font-size: 22px;">Computations Easily Resumed and Branched</div>  
</div>
{/if}

  <h2>O.test is {O.test}</h2>
  <h2>O.test_2 is {O.test_2}</h2>             <br>
  <span class=tao> To see branch() and resume() in action, click the verbose butt6n (below). To see the boolean "lok" protecting the integrity of the data, click the verbose button (below) several times in rapid succession:</span>
  <br><br>

  <button style = "text-align: left" on:click = {start}><pre>Monad([2], "test")(addP(1))
(cubeP)(addP(3))(squareP)(divP(100))(() => 
branch("test", "test_2")(sqrtP)(cubeP)(addP(O.test_2[2])
(O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))(() =>
resume("test")(multP(4))(addP(6))))</pre></button>
<p>  </p>
  <br>
  <p> Here's the modified monad constructor: </p>
  <pre>{mon}</pre>
  <p> After monads encounter "halt", they can use the function resume() to continue processing data where they left off and (2) they can branch off in new monads created by branch(). Here are the definitions:</p>
  <pre>{fs}</pre>
  <p> This is the statement that produces the observed results when "START" is clicked. </p>
  <pre>{code}</pre>                           <br>
  <button style = "text-align: left" on:click = {start}><pre>Monad([2], "test")(addP(1))
(cubeP)(addP(3))(squareP)(divP(100))(() => 
branch("test", "test_2")(sqrtP)(cubeP)(addP(O.test_2[2])
(O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))(() =>
resume("test")(multP(4))(addP(6))))</pre></button>


  <br>
  <h2>O.test is {O.test}</h2>
  <h2>O.test_2 is {O.test_2}</h2>
  <br>

  <br>
  <span class = "tao"> Notice the statement: </span>
  <span style = "color: #AAFFAA">()=>addP(O.test_2[2])(O.test_2[1])</span>
  <span>. Promises in chains of ES6 Promises can't access previous Promise resolution values. One way to get access to prior resolution values is to encapsulate Promise chains in Monad(). This also makes it convenient to resume or branch from terminated computation chains; something that can be accomplished without naming the chains. </span>
  <br>
  <br>
  <br>
  

<script>

let Monad = function Monad (z = 42, g = 'generic') {
    this.x = z,
    this.id = g,
    this.bnd = function (func, ...args) {
        let m;
        if (typeof func === "function") {
            m = func(this.x, ...args)
            if (m instanceof Monad) m = m.x;
        }
        else m = func;
        this.x = m;
        return this;
       // return window[this.id] = new Monad(m,this.id);
    }
};

let Comp = function Comp ( AR = [] )  {
  let f_, p, run;
  let ar = AR.slice();
  let x = ar.pop();
  return run = (function run (x) {
    if (x === null || x === NaN ||
      x === undefined) x = f_('stop').pop();
    if (x instanceof Filt) {
      let z = ar.pop();
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
function ints (n) {return [...Array(n).keys()]}

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


function isOdd (x) {return new Filt(v => v % 2 === 1)};
let lessThan = x => y => new Filt(x => y < x);
let ltTest = lessThan();


let rt = fork(h,f)(x=>x/100)(x=>x*x)('stop');
console.log("rr is", rr);
console.log("rt is",rt)

    let orb1 = Comp();
    let orb2 = Comp();
    let orb3 = Comp();
    let orb4 = Comp();
    let orb5 = Comp();
    let orb6 = Comp();
    let orb7 = Comp();
    let orb8 = Comp();
    let orb9 = Comp();
    let orb10 = Comp();
    let orb11 = Comp();
    let orb12 = Comp();
    let orb13 = Comp();
    let orb14 = Comp();
    let orb15 = Comp();
    let orb16 = Comp();
    let orb17 = Comp();
    let orb18 = Comp();
    let orb19 = Comp();

function runT (k) {

    orb1 = Comp();
    orb2 = Comp();
    orb3 = Comp();
    orb4 = Comp();
    orb5 = Comp();
    orb6 = Comp();
    orb7 = Comp();
    orb8 = Comp();

let orbit_1 = "In about eight seconds, orb5 will do something shocking. It will remove the last element from orb2.ar and replace it with its square root. Oh well, it's all inside of runT(). "

let orbit_2 = 'Soon, orb6 will obtain copies of the last three elements of orb2 and perform some computations. Then it will display "THE END". '

console.log("diffRender is", diffRender);

orb1 = Comp([k])(cubeP)(() =>
    fork(orb2,orb1)()(x=>x+k)(squareP)(multP(1/100))(addP(1))(powP(4)(1))(() =>
        fork(orb3,orb1)(x=>x+k)(x=>x/10)(x=>x+1)(cubeP)(() =>
            orb4(orbit_1)(() => iD(7)(false))(() =>
                orb5(orb2('stop').pop())(powP(1/2)(3))(x =>
                    orb2(x))(() =>
                        orb6(orbit_2)(iD(7)(false))(() =>
                            orb7(orb2('stop').slice(-3,-2)[0])
                            (iD(1)(orb2('stop').slice(-2,-1)[0]))
                            (iD(1)(orb2('stop').slice(-1)[0]))(powP(1/2)(1))
                            (addP(1))(powP(3)(1))(iD(4)("THE END"))
                        )
                    )
                )
            )
        )
    )
};
runT(3);

function f(x) {
    return Comp([x])(x=>x**3)(x=>x+3)(x=>x*x)
};

let wwd = [1,2,3,4,5].map(v=>f(v)('stop').pop())
console.log("Mapping a stream into Comp([x])(x=>x**3)(x=>x+3)(x=>x*x) -- wwd is", wwd)

// ->   ************************************************ transduce tduce
let arf =  [x=>x*10,  x=>x*x, x=>x+x];
let arn = [1,2,3,4,5,6,7]

let ff1 = ar => ar.reduceRight((a,b) => b(a))
let ark = ar => x => ar.concat(x);

let tduce = ar1 => ar2  => ar2.map(v => (ff1)(ark(ar1)(v)))
console.log(tduce(arf)(arn))


  let tdF = arF => arA => {let ob, result = []; arA.map(v => {
      result.push(arF.reduce((a,b) => b(a),v))
      })
      return result;
  }

  let dd = tdF([x=>x**3, x=>x+3, x=>x*x])([1,2,3,4,5])
  console.log("dd is", dd);



let tduce = ar1 => ar2  => ar2.map(v => (ff1)(ark(ar1)(v)))
console.log(tduce(arf)(arn))


let arF = [x=>x**3, x=>x+3, x=>x*x];
let arA = [1,2,3,4,5];

function apply(x, f) {
  return f(x);
}

function concat(xs, val) {
  return xs.concat(val);
}

let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// transformations
let add1 = x => x + 1;
let doubleIt = x => x * 2;
let add = (x, y) => x + y;

// ********************************************************** conpTest3


let A_A = [1,2,3].join( );
let B_B = [1,2,3].join( );
let C_C = [1,2,3].join( );
let D_D = [1,2,3].join( );
let E_E = "Sspecify an upper bound. The number you enter will be multiplied by 1000.";

let obS  = { ar: [] };

obS.push = function (x) {
  this.ar.push(x);
  if (this.ar.length === 1) E_E = "Now specify an array length."
  if (this.ar.length === 2) {
    compTest3(this.ar[0], this.ar[1]);
    this.ar.length = 0;
    E_E = "Sspecify an upper bound. The number you enter will be multiplied by 1000.";
  }
};

function compTest3 (k,n) {

let test9 = ltTest(k*1000).filt
let ar7b = [...Array(Math.abs(n)).keys()];

let res4 = ar7b
.filter(v => (v % 2 === 1))
.map(x => x**4)
.map(x => x+3)
.map(x => x-3)
.map(x => Math.sqrt(x))
// console.log("res4 is", res4);

let dotResult = res4
.map(v=>v*v)
.map(v=>v+1000)
.filter(v => v < k*1000);
console.log("dotResult is", dotResult);

let td1 = x => Comp([x])(isOdd)(v=>v**4)(v=>v+3)(v=>(v-3)/Math.sqrt(v-3))('stop').pop()
let td2 = y => Comp([y])(v=>v*v)(v=>v+1000)(test9)('stop').pop()

let res1 = ar7b.map(x => td1(x));
let res2 = res1.map(y => td2(y));
let res3 = ar7b.map(z => td2(td1(z)));

console.log("cleanF(res2) is", cleanF(res2));
console.log("cleanF(res3) is", cleanF(res3));

let xform = compose(
  tdFilter(x=>x%2===1),
  tdMap(x => x**4),
  tdMap(x => x+3),
  tdMap(x => x-3),
  tdMap(x => Math.sqrt(x))
)
let xform2 = compose(
  tdMap(x=>x*x),
  tdMap(x=>x+1000),
  tdFilter(x => x < k*1000)
);

let transducerResult = ar7b.reduce(xform(xform2(concat)),[] );
console.log("transducerResult is", transducerResult);

  A_A = dotResult.map(v => v.toString() + ", ");
  B_B = cleanF(res2).map(v => v.toString() + ", ");
  C_C = cleanF(res3).map(v => v.toString() + ", ");
  D_D = cleanF(transducerResult).map(v => v.toString() + ", ");
}
compTest3(20,10)

let fibonacci = {
    next: (function () {
        let pre = 0, cur = 1;
        return function () {
            tmp = pre;
            pre = cur;
            cur += tmp;
            return cur;
        };
    })()
};

/*let n;
for (;;) {
    n = fibonacci.next();
    if (n > 100000)
        break;
    console.log(n);
} */
console.log("*******************************");
console.log("*******************************");
function f233 (n) {
   let arm, xx, ar = [0.5,1.5];
   while (ar.length < n) {
     arm = ar.slice(-2);
     xx = arm[1] + arm[1] - arm[0] + 0.5;
     ar.push(xx);
   }
   return ar;
}
console.log("f233(30)", f233(30));

function f234 (k) {
   let ar = [];
   let j;
   for (let n = 1; n < k; n+=1) {
      j=n*(n+1)/4;
      ar.push(j)
 }
   return ar;
}
console.log("f234(30 is ", f234(30));
console.log("*******************************");
console.log("*******************************");

console.log("*******************************");
console.log("*******************************");

console.log("*******************************");
console.log("*******************************");

console.log("*******************************");
console.log("*******************************");
</script>

{#if visible}
 <div style = "font-family: Times New Roman;  text-align: center; color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
 <br><br>
TRANSDUCER SIMULATION
 </div>
{/if}

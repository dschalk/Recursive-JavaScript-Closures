
<script>

var Monad = function Monad (z = 42, g = 'generic') {
    this.x = z,
    this.id = g,
    this.bnd = function (func, ...args) {
        var m;
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
var lessThan = x => y => new Filt(x => y < x);
var ltTest = lessThan();


var rt = fork(h,f)(x=>x/100)(x=>x*x)('stop');
console.log("rr is", rr);
console.log("rt is",rt)

    var orb1 = Comp();
    var orb2 = Comp();
    var orb3 = Comp();
    var orb4 = Comp();
    var orb5 = Comp();
    var orb6 = Comp();
    var orb7 = Comp();
    var orb8 = Comp();
    var orb9 = Comp();
    var orb10 = Comp();
    var orb11 = Comp();
    var orb12 = Comp();
    var orb13 = Comp();
    var orb14 = Comp();
    var orb15 = Comp();
    var orb16 = Comp();
    var orb17 = Comp();
    var orb18 = Comp();
    var orb19 = Comp();

function runT (k) {

    orb1 = Comp();
    orb2 = Comp();
    orb3 = Comp();
    orb4 = Comp();
    orb5 = Comp();
    orb6 = Comp();
    orb7 = Comp();
    orb8 = Comp();

var orbit_1 = "In about eight seconds, orb5 will do something shocking. It will remove the last element from orb2.ar and replace it with its square root. Oh well, it's all inside of runT(). "

var orbit_2 = 'Soon, orb6 will obtain copies of the last three elements of orb2 and perform some computations. Then it will display "THE END". '

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

var wwd = [1,2,3,4,5].map(v=>f(v)('stop').pop())
console.log("Mapping a stream into Comp([x])(x=>x**3)(x=>x+3)(x=>x*x) -- wwd is", wwd)

// ->   ************************************************ transduce tduce
var arf =  [x=>x*10,  x=>x*x, x=>x+x];
var arn = [1,2,3,4,5,6,7]

var ff1 = ar => ar.reduceRight((a,b) => b(a))
var ark = ar => x => ar.concat(x);

var tduce = ar1 => ar2  => ar2.map(v => (ff1)(ark(ar1)(v)))
console.log(tduce(arf)(arn))


  var tdF = arF => arA => {var ob, result = []; arA.map(v => {
      result.push(arF.reduce((a,b) => b(a),v))
      })
      return result;
  }

  var dd = tdF([x=>x**3, x=>x+3, x=>x*x])([1,2,3,4,5])
  console.log("dd is", dd);



var tduce = ar1 => ar2  => ar2.map(v => (ff1)(ark(ar1)(v)))
console.log(tduce(arf)(arn))


var arF = [x=>x**3, x=>x+3, x=>x*x];
var arA = [1,2,3,4,5];

function apply(x, f) {
  return f(x);
}

function concat(xs, val) {
  return xs.concat(val);
}

var nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// transformations
var add1 = x => x + 1;
var doubleIt = x => x * 2;
var add = (x, y) => x + y;

// ********************************************************** conpTest3


var A_A = [1,2,3].join( );
var B_B = [1,2,3].join( );
var C_C = [1,2,3].join( );
var D_D = [1,2,3].join( );
var E_E = "Sspecify an upper bound. The number you enter will be multiplied by 1000.";

var obS  = { ar: [] };

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

  A_A = dotResult.map(v => v.toString() + ", ");
  B_B = cleanF(res2).map(v => v.toString() + ", ");
  C_C = cleanF(res3).map(v => v.toString() + ", ");
  D_D = cleanF(transducerResult).map(v => v.toString() + ", ");
}
compTest3(20,10)

var fibonacci = {
    next: (function () {
        var pre = 0, cur = 1;
        return function () {
            tmp = pre;
            pre = cur;
            cur += tmp;
            return cur;
        };
    })()
};

/*var n;
for (;;) {
    n = fibonacci.next();
    if (n > 100000)
        break;
    console.log(n);
} */
console.log("*******************************");
console.log("*******************************");
function f233 (n) {
   var arm, xx, ar = [0.5,1.5];
   while (ar.length < n) {
     arm = ar.slice(-2);
     xx = arm[1] + arm[1] - arm[0] + 0.5;
     ar.push(xx);
   }
   return ar;
}
console.log("f233(30)", f233(30));

function f234 (k) {
   var ar = [];
   var j;
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

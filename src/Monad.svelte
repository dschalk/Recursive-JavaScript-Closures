
<script>
import {fade} from "svelte/transition"
let visible = true;

let monadDisplay = `function Monad (x) {
  let foo;
  return foo = function foo (func) {
    if (func === "stop") return x
    else  {
      x = func(x);
      return foo;
    }
  };
}

const prod = a => b => a*b;
const sum = a => b => a+b;`

let bonadsD = `function bonads(num) {
return [Monad(num)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-1)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-2)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-3)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-2)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-1)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-0)(sum(7))(prod(4))(v=>v-10)("stop")]}`

let axe = `
let mon = Monad(3);
let a = mon(x=>x**3)(x=>x+3)(x=>x**2)("stop");
console.log("a is", a)  // a is 900`

let tree = `
mon(x => x/100)
console.log("mon("stop") now is",mon("stop"))  // mon("stop") now is 9 `

let fred = `
let ar = [];
let mon = Monad(3);
let mon2 = Monad();
ar.push(mon("stop"));
let a = mon(x=>x**3)(x=>x+3)(x=>x**2)
ar.push(a);
ar.push(mon(x => x/100);
ar.push(mon2(mon("stop")(x=>x*100)))
console.log("ar.map(v=>v('stop')) is", ar.map(v=>v('stop')))  // [3, 900, 9] `

let steve = `function Monad (x) {
  return function foo (func) {
    if (func === "stop") return x
    else  {
      x = func(x);
      return foo;
    }
  };
}`

function Monad (x) {
  return function foo (func) {
    if (func === "stop") return x
    else  {
      x = func(x);
      return foo;
    }
  };
}

const prod = a => b => a*b;
const sum = a => b => a+b;

let num = 6;

let bonads = function bonads(num) {
return [Monad(num)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-1)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-2)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-3)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-2)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-1)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-0)(sum(7))(prod(4))(v=>v-10)("stop")]}


let mona = bonads(num);
console.log(mona)

function numF (e) {num = e.target.value; console.log("e.target.value is", e.target.value); return e.target.value}

console.log("num is", num);
</script>

<style>
.tao {
  margin-left: 3%;
}

h3 {
   font-size: 27px;
}

#aside {
    font-size: 18px;
    color: #eeaaff;
    font-style: italic;
}
</style>

 {#if visible}
 	<div style = "font-family: Times New Roman; text-align:center; color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
A SIMPLE LITTLE MONAD
 	</div>
 {/if}
 <br>
 <span class="tao"> Monad (from Greek μονάς monas, "singularity" in turn from μόνος monos, "alone")[1] refers, in cosmogony, to the Supreme Being, divinity or the totality of all things. A basic unit of perceptual reality is a "monad" in Gottfried Leibniz' </span>
<span style = "font-style: italic"> Monadology </span>
<span>, published in 1714. A single note in music theory is called a monad. </span>
<p> Monads in the Haskell Programming Language were inspired by Category Theory monads. The "monads" discussed herein are inspired by Haskell monads. Here's the definition of the simple monad described in this module: </p>
<pre>{steve}</pre>

<p> In the following expression: </p>
<pre> Monad(6)(v=>v+7)(v=>v*4)(v=>v-10)("stop") // 42 </pre>
<p> The expression "Monad(6)" creates a closure whose outer function contains "x" (initially equal to 6) and whose inner function "foo" is confined to the scope of the anonymous outer function.  whose scope is  returns "foo"; "foo(v=>v+7) returns "foo" while also mutating "x" in its outer scope, making it 13. "foo(v=>v*4) changes x to 52 and returns "foo". "foo(v=>v-10)" returns "foo" while mutating x again, making it 42. Finally, the expression "foo('stop')" causes foo to return the number 42. </p>
<p> As in the Haskell programming language, the monads described above encapsulate sequences of computations. The similarity is greater when we avoid mutation, as we do in some of the more-complex definitions of "Monad" (or whatever we decide to call it). </p>



<p> Anonymous monads never interfere with other monads. The demonstration below illustrates this by running seven anonymous monads in rapid succession. The number you enter is "num" in </p>
{bonadsD}
<input id = "one" type = "number" on:input={bonads}  bind:value={num} />
<p> num is {num} so bonads(num) returns {bonads(num)} </p>

<span class = tao> Named monads retain their values, even after they encounter "stop" and return the value of x held in the Monad closure. The following examples illustrate this: </span>
<pre>
{axe}
</pre>






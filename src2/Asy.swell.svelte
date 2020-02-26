<script>
import {fade} from "svelte/transition"
let visible = true;

function Monad (z = []) {
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

const prod = a => b => a*b;
const sum = a => b => a+b;




</script>
{#if visible}
    <div style = "font-family: Times New Roman;  text-    align: center; color: hsl(210, 90%, 90%); font-size: 32px;"
      transition:fade>
      ASYNCHRONOUS MONADS
    </div>
{/if}
<h3>You bet!</h3>

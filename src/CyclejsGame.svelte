<script>
import {fade} from "svelte/transition"
let visible = true;


let axe = `var mon = Monad(3);var a = mon(x=>x**3)(x=>x+3)(x=>x**2)(stop)console.log("a is", a) // a os 900console.log("mon is", mon); /*ƒ foo(func) {var stop = "stop";if (func.name === "stop") return x;else {x = func(x);return foo;}} */mon(x => x/100)console.log("mon(stop) now is",mon(stop))`
</script>


{#if visible}
 <div style = "font-family: Times New Roman;  text-align: center; color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
 <br><br>
CYCLE.JS INTERACTIVE DICE GAME
 </div>
{/if}
<p>This was part of "".</p>

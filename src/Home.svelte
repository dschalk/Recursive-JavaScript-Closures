
<script>
let cache = [[1,2,3,4,5,6,7,8,9]];
let j = 0;
let ob = {
  x: [], 
  push: function push (e) {
    ob.x.push(parseInt(e.target.id.slice(1,2), 10));
    if (ob.x.length >1) {
      let d = exchange(ob.x[0], ob.x[1]);
      cache.splice(j+1,0,d);
      ob.x = [];
      j+=1;
      return cache;   let j = 0;
    }
  }
}

function exchange (k,n) {
  let ar = cache[j].slice();
  let a = ar[k]
  ar[k] = ar[n];
  ar[n] = a;
  return ar;
}

let back = function back () {
  if (j > 0) j = j-=1;
  else j = j;
}

let forward = function forward () {
  if (j+1 < cache.length) j = j+=1;
  else j = j;
}

import {fade} from "svelte/transition"
let visible = true;

import Cow from "./Cow.svelte";

</script>

{#if visible}
<div style = "font-family: Times New Roman;  text-align: center; color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
INTRODUCTION 
</div>
{/if}

<p> Each item in the menu on the left links to a Svelte component. Some components are supported by a modified Haskell Wai Websockets server. </p>
  









<br>
<br>
<br>
<div style = "text-align: center">...</div>

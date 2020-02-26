<script>
import {fade, fly} from "svelte/transition"

let cache = [[1,2,3,4,5,6,7,8,9]];

let j = 5;
$: j;

let jj = 0;
$: jj;

  var ob = {x: [], push: function push (e) {
     ob.x.push(parseInt(e.target.id.slice(1,2), 10));
     if (ob.x.length >1) {
         var d = exchange(ob.x[0], ob.x[1]);
         cache.splice(j+1,0,d);
         ob.x = [];
         j+=1;
         return cache;   var j = 0;
        }
     }
  }

   function exchange (k,n) {
      var ar = cache[jj].slice();
      var a = ar[k]
      ar[k] = ar[n];
      ar[n] = a;
      return ar;
   }

   var back = function back () {
      if (jjj > 0) jj = jj-=1;
      else jj = jj;
   }

   var forward = function forward () {
      if (jj+1 < cache.length) jj = jj
      else {
         JJ+=1
         var d = exchange(ob.x[0], ob.x[1]);
         cache.splice(j+1,0,d);
         ob.x = [];
         return cache;
      }
   }

var code = `
  var cache = [[1,2,3,4,5,6,7,8,9]];
  var j = 0;
  var ob = {x: [], push: function push (e) {
     ob.x.push(parseInt(e.target.id.slice(1,2), 10));
     if (ob.x.length >1) {
         var d = exchange(ob.x[0], ob.x[1]);
         cache.splice(j+1,0,d);
         ob.x = [];
         j+=1;
         return cache;   var j = 0;
        }
     }
  }

   function exchange (k,n) {
      var ar = cache[j].slice();
      var a = ar[k]
      ar[k] = ar[n];
      ar[n] = a;
      return ar;
   }

   var back = function back () {
      if (j > 0) j = j-=1;
      else j = j;
   }

   var forward = function forward () {
      if (j+1 < cache.length) j = j+=1;
      else j = j;
    }

    $: j

     var cache = [[1,2,3,4,5,6,7,8,9]];
     var j = 0;
     $: j
     var ob = {x: [], push: function push (e) {
        ob.x.push(parseInt(e.target.id.slice(1,2), 10));
        if (ob.x.length >1) {
            var d = exchange(ob.x[0], ob.x[1]);
            cache.splice(j+1,0,d);
            ob.x = [];
            j+=1;
            return cache;
           }
        }
     }`;

var html = `{#if visible}
 <div style = "font-family: Times New Roman;  text-align: center; color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
 <br><br>
 A LITTLE SVELTE MODULE
 </div>
{/if}

                        <div style = "display: flex">
                        <div style = "margin-Left: 2%; width: 50%" >

<br>	<button on:click={back}>
		BACK
	</button>
<br>
<br>

   <div style="text-indent:20px"><button>{ j }</button></div>
<br>
	<button on:click={forward}>
		FORWARD
	</button>
                        </div>
                     <div style = "marginRight: 2%; width: 50%; font-size: 30">
<br><br><br><br><br><p>Suck my dick</p>
<button id = m0  on:click = {ob.push} >{cache[j][0]}</button>
<button id = m1  on:click = {ob.push} >{cache[j][1]}</button>
<button id = m2  on:click = {ob.push} >{cache[j][
   2]}</button>
<br>
<br>
<button id = m3  on:click = {ob.push} >{cache[j][3]}</button>
<button id = m4  on:click = {ob.push} >{cache[j][4]}</button>
<button id = m5  on:click = {ob.push} >{cache[j][5]}</button>
<br>
<br>
<button id = m6  on:click = {ob.push} >{cache[j][6]}</button>
<button id = m7  on:click = {ob.push} >{cache[j]
   [7]}</button>r
<button id = m8  on:click = {ob.push} >{cache[j][8]}</button>
</div>
</div> `
</script>
<style>
.fade {
   font-family: Times New Roman;
   text-align: center; color: rgb(210, 90%, 90%);
   font-size: 32px;
}
</style>

{#if j === 5} 
 <div class = fade  in:fade = {{duration: 1000}} out:fly = {{y: -40, duration: 1000}}  >
 <br><br>
 A LITTLE SVELTE MODULE
 </div>
 console.log("Fuck her real hard and long.")
{/if}
<p> If you click any two numbers (below), they switch locations and a "BACK" button appears. If you go back and click two numbers, the result gets inserted  at the current location.</p>
<p> Each topic in this blog is a small module. Global variables are only global relative to their containing modules, so name clashes, unexpected state changes, and bugs stemming from mutations are easily avoided. </p>
<br>
<br>
                        <div style = "display: flex">
                        <div style = "text-align: right">


	  <button on:click={back}>
		  BACK
  	</button>
<br>
<br>
   <div>Index: { j }</div>
<br>
	<button on:click={forward}>
		  FORWARD
	</button>
 <br>
 <br>
                        </div>
                     <div style = "margin-left: 5%; width: 50%;">
<button id = m0  on:click = {ob.push} >{cache[jj][0]}</button>
<button id = m1  on:click = {ob.push} >{cache[jj][1]}</button>
<button id = m2  on:click = {ob.push} >{cache[jj][2]}</button>
<br>
<br>
<button id = m3  on:click = {ob.push} >{cache[jj][3]}</button>
<button id = m4  on:click = {ob.push} >{cache[jj][4]}</button>
<button id = m5  on:click = {ob.push} >{cache[jj][5]}</button>
<br>
<br>
<button id = m6  on:click = {ob.push} >{cache[jj][6]}</button>
<button id = m7  on:click = {ob.push} >{cache[jj][7]}</button>
<button id = m8  on:click = {ob.push} >{cache[jj][8]}</button>
</div>
</div>
<p> This is the essential JavaScript code inside of the script tags; </p>
<pre>{code}</pre>
<p> And here's the HTML code (commentary omitted): </p>
<pre>{html}</pre>
<p> Svelte still has some quirks and rough edges, but the ease with which it handles reactivity is so impressive that I'm sticking with it for this little application and more to come.   </p>

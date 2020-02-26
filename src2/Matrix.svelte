<script>
import {fade} from "svelte/transition"

let visible = true;

  var cache = [[1,2,3,4,5,6,7,8,9]];
  var k= 0;
  var ob = {x: [], push: function push (e) {
     ob.x.push(parseInt(e.target.id.slice(1,2), 10));
     if (ob.x.length >1) {
         var d = exchange(ob.x[0], ob.x[1]);
         cache.splice(k+1,0,d);
         ob.x = [];
         k+=1;
         return cache;   var k= 0;
        }
     }
  }

   function exchange (k,n) {
      var ar = cache[k].slice();
      var a = ar[k]
      ar[k] = ar[n];
      ar[n] = a;
      return ar;
   }

   var back = function back () {
      if (k> 0) k= k-=1;
      else k = k;
   }

   var forward = function forward () {
      if (k+1 < cache.length) k = k+=1;
      else k = k;
    }

    $: k

     var cache = [[1,2,3,4,5,6,7,8,9]];
     var k= 0;
     $: k
     var ob = {x: [], push: function push (e) {
        ob.x.push(parseInt(e.target.id.slice(1,2), 10));
        if (ob.x.length >1) {
            var d = exchange(ob.x[0], ob.x[1]);
            cache.splice(k+1,0,d);
            ob.x = [];
            k+=1;
            return cache;
           }
        }
     }
var code = `
  var cache = [[1,2,3,4,5,6,7,8,9]];
  var k= 0;
  var ob = {x: [], push: function push (e) {
     ob.x.push(parseInt(e.target.id.slice(1,2), 10));
     if (ob.x.length >1) {
         var d = exchange(ob.x[0], ob.x[1]);
         cache.splice(k+1,0,d);
         ob.x = [];
         k+=1;
         return cache;   var k= 0;
        }
     }
  }

   function exchange (k,n) {
      var ar = cache[k].slice();
      var a = ar[k]
      ar[k] = ar[n];
      ar[n] = a;
      return ar;
   }

   var back = function back () {
      if (k > 0) k= k-=1;
      else k = k;
   }

   var forward = function forward () {
      if (k+1 < cache.length) k= k+=1;
      else k= k;
    }

    $: k

     var cache = [[1,2,3,4,5,6,7,8,9]];
     var k= 0;
     $: k
     var ob = {x: [], push: function push (e) {
        ob.x.push(parseInt(e.target.id.slice(1,2), 10));
        if (ob.x.length >1) {
            var d = exchange(ob.x[0], ob.x[1]);
            cache.splice(k+1,0,d);
            ob.x = [];
            k+=1;
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

<p> If you click any two numbers (below), they switch locations and a "BACK" button appears. If you go back and click two numbers, the result gets inserted  at your location.</p>
<p> I can use simple variables knowing they will never clash with a similarly named variable in a differenct module. Svelte code is consise and efficient. Coding in Svelte is so relaxing. Slap that bitch.</p>

<br>	<button on:click={back}>
		BACK
	</button>
<br>
<br>

   <div style="text-indent:20px"><button>{ k}</button></div>
<br>
	<button on:click={forward}>
		FORWARD
	</button>
                        </div>
                     <div style = "marginRight: 2%; width: 50%; font-size: 30">
<br><br><br><br><br><p>Suck my dick</p>
<button id = m0  on:click = {ob.push} >{cache[k][0]}</button>
<button id = m1  on:click = {ob.push} >{cache[k][1]}</button>
<button id = m2  on:click = {ob.push} >{cache[k][
   2]}</button>
<br>
<br>
<button id = m3  on:click = {ob.push} >{cache[k][3]}</button>
<button id = m4  on:click = {ob.push} >{cache[k][4]}</button>
<button id = m5  on:click = {ob.push} >{cache[k][5]}</button>
<br>
<br>
<button id = m6  on:click = {ob.push} >{cache[k][6]}</button>
<button id = m7  on:click = {ob.push} >{cache[k]
   [7]}</button>
<button id = m8  on:click = {ob.push} >{cache[k][8]}</button>
</div>
</div>
<p> This is the JavaScript code inside of the script tags except for the definitions of the variables "code" and "html", which are just the code and html cut and pasted inside of back quotes: </p>
<pre>{code}</pre>
<p> And here is the HTML code: </p>
<pre>{html}</pre>
<p> Is Svelte awesome, or what? </p> `

</script>

{#if k=== 5}
 <div style = "font-family: Times New Roman;  text-align: center; color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
 <br><br>
 A LITTLE SVELTE MODULE
 </div>
{/if}
                        <div style = "display: flex">
                        <div style = "margin-Left: 2%; width: 50%" >

<p> If you click any two numbers (below), they switch locations and a "BACK" button appears. If you go back and click two numbers, the result gets inserted  at your location.</p>
<p> I can use simple variables knowing they will never clash with a similarly named variable in a differenct module. Svelte code is consise and efficient. Coding in Svelte is so relaxing. </p>

<br>
<br>
	<button on:click={back}>
		BACK
	</button>
<br>
<br>
   <div style="text-indent:20px"><button>{ k}</button></div>
<br>
	<button on:click={forward}>
		FORWARD
	</button>
 <br>
 <br>
                        </div>
                     <div style = "marginRight: 2%; width: 50%;">
<br><br><br><br><br><br><br><br><br><br>
<button id = m0  on:click = {ob.push} >{cache[k][0]}</button>
<button id = m1  on:click = {ob.push} >{cache[k][1]}</button>
<button id = m2  on:click = {ob.push} >{cache[k][2]}</button>
<br>
<br>
<button id = m3  on:click = {ob.push} >{cache[k][3]}</button>
<button id = m4  on:click = {ob.push} >{cache[k][4]}</button>
<button id = m5  on:click = {ob.push} >{cache[k][5]}</button>
<br>
<br>
<button id = m6  on:click = {ob.push} >{cache[k][6]}</button>
<button id = m7  on:click = {ob.push} >{cache[k][7]}</button>
<button id = m8  on:click = {ob.push} >{cache[k][8]}</button>
</div>
</div>
<p> This is the JavaScript code inside of the script tags except for the definitions of the variables "code" and "html", which are just the code and html cut and pasted inside of back quotes: </p>
<pre>{code}</pre>
<p> And here is the HTML code: </p>
<pre>{html}</pre>
<p> Is Svelte awesome, or what? </p>

<script>
	import { count } from './stores.js';

	function reset() {
		count.set(0);
	}
</script>

<button on:click={reset}>
	reset
</button      var Mona = function Mona ( AR = [])  {
        let p, run, f_;
        let  ar = AR.slice();
        let x = ar.splice(-1)[0] ;
        return run = (function run (x) {
          if (x instanceof Promise && x != undefined && x == x) x.then(y => {ar = ar.concat(y)})
          else if (!(x instanceof Promise)) {
              console.log(x, "is not an instance of a Promise")
              if (x != undefined && x == x) ar = ar.concat(x)
              console.log("not Promise ar is", ar);
          }
          f_ = function f_ (func) {
            if (func === 'halt' || func === 'h' || func == null) return ar.slice();
            else if (typeof func !== "function") p = func;
            else if (x instanceof Promise) p = x.then(v => func(v));
            else p = func(x);
            return run(p);
          };
          return f_;
        })(x);
      }>

<script>

   import {fade} from "svelte/transition"
   let visible = true;

    import Monad from './Monad.svelte'
    import Monad2 from './Monad2.svelte'
    import Monad3 from './Monad3.svelte'
    import Haskell from './Haskell.svelte'
    import Bugs from './Bugs.svelte'
    import Matrix from './Matrix.svelte'
    import Transducer from './Transducer.svelte'
    import Asynchronous_Monad from './Asynchronous_Monad.svelte'
    import ToggleTheme from './ToggleTheme.svelte'
    import Home from './Home.svelte'
    import Score from './Score.svelte'

    export let j = 0
    $: j

    function monad () {j = 1; console.log(j)};
    function monad2 () {j = 2; console.log(j)};
    function monad3 () {j = 3; console.log(j)};
    function haskell () {j = 9; console.log(j)};
    function bugs () {j = 4; console.log(j)};
    function matrix () {j = 5; console.log(j)};
    function transduce () {j = 6}; console.log(j);
    function async () {j = 7; console.log(j)};
    function tog () {j = 8; console.log(j)};
    function score () {j = 10; console.log(j)};
    function home () {j = 0; console.log(j)};
	function foo(Monad2) {
		// the node has been mounted in the DOM

		return {
			destroy() {
				// the node has been removed from the DOM
			}
		};
	}

    console.log("j is", j)

</script>

<style>
div {
   font-size: 18px;
   color: #bccbaa;
}

.gamma {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 50%;
}

  ul {  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 50%;
  list-style: none;
  }

  tao {
    margin-left: 3%;
  }

  .narrow {
    font-family: monospace;
    font-size: 22px;
    margin-left: auto;  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 50%;
    margin-right: auto;
    display: block;
    text-indent: 1.6%;
  }
</style>
<div class="content">
<br><br>
<div use:foo></div>
<br><br>

                        <div style = "display: flex">

                        <div style = "margin-Right: 2%; width: 20%" >
                        <br><br><br><br><h1>j is {j}></h1><br><br><br>
                        <ul style = "list-style: none;">
                        <li><div class='button'  on:click={() => j = 5}>Why Svelte</div></li>
                        <br>
                        <li><div>MONAD SERIES</div></li>
                        <br>
                        <li><div class='button' on:click={()=>{j = 1; console.log("j is", j)}}>A Simple Monad</div></li>
                        <br>
                        <li><div class='button' on:click={()=>{j=2; console.log("j is", j)}}>Asynchronous Monads</div></li>
                        <br>
                        <li><div class='button' on:click={()=>{j=3; console.log("j is", j)}}>Promises Monad</div></li>
                        <br>
                        <li><div class='button' on:click={() => {j = 7; console.log("j is", j)}}>Transducer Simulator</div></li>
                        <br>
                        <li><div class='button' on:click={()=>{j=10; console.log("j is", j)}}>Game of Score</div></li>
                        <br>
                        <li><div>MISCELANEOUS TOPICS</div></li>
                        <br>
                        <li><div class='button' on:click={() => {j = 9; console.log("j is", j)}}>Hidden Haskell Information</div></li>
                        <br>
                        <li><div class='button' on:click={() => {j = 4; console.log("j is", j)}}>Bed Bug Eradication</div></li>
                        <br>
                        <li><div class='button' on:click={() => {j = 8; console.log("j is", j)}}>Toggle Theme</div></li>
                        <br>
                        <li><div class='button' on:click={() => {j = 0; console.log("j is", j)}}>Home</div></li>
                        <br>
                        </ul>
                        </div>
                        <div style = "margin-Right: 2%; width: 80%" >
                        <div style=" font-weight: 900; font-size: 45px; color: #bbbb00; text-align: center; ">DAVID SCHALK'S BLOG</div>


{#if j === 0}
		<Home />
{/if}
{#if j === 1}
<Monad />
{/if}
{#if j === 2}
<Monad2 />
{/if}
{#if j === 3}
<Monad3 />
{/if}
{#if j === 9}
<Haskell />
{/if}
{#if j === 4}
<Bugs />
{/if}
{#if j === 5}
<Matrix />
{/if}
{#if j === 6}
<Asynchronous_Monad />
{/if}
{#if j === 7}
<Transducer />
{/if}
{#if j === 8}
<ToggleTheme />
{/if}
{#if j === 10}
<Score />
{/if}


<br><br><br>
</div>
</div>
</div>
<br><br>

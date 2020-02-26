<script>

export let j = 0;

import Cow from './Cow.svelte'
import Monad from './Monad.svelte'
import Monad2 from './Monad2.svelte'
import Monad3 from './Monad3.svelte'
import Monad5 from './Monad5.svelte'
import Haskell from './Haskell.svelte'
import Bugs from './Bugs.svelte'
import Matrix from './Matrix.svelte'
import Transducer from './Transducer.svelte'
import ToggleClass from './ToggleClass.svelte'
import ToggleTheme from './ToggleTheme.svelte'
import Home from './Home.svelte'
import Score from './Score.svelte'
import Stor from './Stor.svelte'
import Snack from './Snack.svelte'
import Cargo from './Cargo.svelte'

function id (v) {return v}

</script>

    <style>
div {
font-style: "Times New Roman";
font-size: 25px;
}

.large {
  font-size: 28px;
  color: #ffffbb;
  text-align: center;
}

.show {   
  position: fixed;
  top: 50px;
  left: 10%;
  width: 16%;
display: inline-block;
background-color: #361B01;
font-size: 34px;
color: #EEF7DD;
}

.stat {
  position: relative;
  top: 30px;
  left: 82%;
  width: 16%;
display: inline-block;
background-color: #361B01;
color: #CCFFCC;
}

.dropbtn {
background-color: #361B01;
color: orange;
font-size: 27px;
border: none;
}

.dropdown {
  position: fixed;
  top: 115px;
  left: 10%;
  width: 16%;
display: inline-block;
background-color: #361B01;
}

.dropdown3 {
  position: fixed;
  top: 300px;
  left: 77%;
  width: 16%;
display: inline-block;
background-color: #361B01;
}

.dropdown-content {
font-size: 23px;    
display: none;
position: absolute;
color: sky-blue;    
z-index: 0;
background-color: #361B01;
}

.dropdown3-content {
font-size: 23px;    
display: none;
position: absolute;
color: sky-blue;    
z-index: -1    ;
background-color: #361B01;  
display: block;
color: #DDFFBB      ; 
}

.dropdown-content a:hover {color: gold; background-color: #361B01;}

.dropdown:hover .dropdown-content {display: block; 

background-color:#361B01;}

.dropdown3-content a:hover {color: gold; background-color: #361B01;}

.dropdown3:hover .dropdown3-content {display: block; 

background-color:#361B01;}



.dropbtn {color: gold; background-color: #361B01;}

</style>

<div style = "font-size: 56px; color: #FFD700; text-align: center">Functions In JavaScript</div> 

<div class = stat>
<div style = "font-size: 24px">David E. Schalk</div>  
<div>fp3216@protonmail.com</div>
<div>https://github.com/dschalk</div>

</div>

<div class="dropdown">
  <div class="dropbtn">Table of Contents</div>
  <div class="dropdown-content">
  <br>
<div class = menu on:click = {() => j = 0}> Home</div>
  <br>
<div class = large>Composable Closures</div>
<div class = large>A/K/A "Monads"</div>
  <br>
<div class = menu on:click = {() => j = 1}> A Simple Monad</div>
  <br>
<div class = menu on:click = {() => j = 2}> A Messaging Monad</div>
  <br>
<div class = menu on:click = {() => j = 3}> A Promises Monad</div>
  <br>
<div class = menu on:click = {() => j = 14}> Another Promises Monad</div>
  <br>
<div class = menu on:click = {() => j = 4}> A Transducer Monad</div>
  <br>
<div class = menu on:click = {() => j = 5}> Why Svelte</div>
  <br>
<div class = menu on:click = {() => j = 6}> Haskell Secrets</div>
  <br>
<div class = menu on:click = {() => j = 7}> React Game of Score</div>
  <br>
<div class = menu on:click = {() => j = 8}> Functional Cargo Cult</div>
  <br>
<div class = menu on:click = {() => j = 9}> Eradicating Bed Bugs</div>
  <br>
<div class = menu on:click = {() => j = 10}> Toggle Class</div>
  <br>
<div class = menu on:click = {() => j = 11}> Toggle Theme</div>
  <br>
  </div>
</div>

<!--  
<div on:click = {() => j = 1}> A Simple Monad</div>
<div on:click = {() => j = 2}> A Messaging Monad</div>
<div on:click = {() => j = 3}> A Promises Monad OUOIU OIUIUIO HJHKHKI DSDFDFH 234 HJHKHKI</div>
  </div>
<div style = "width: 70%; margin-right: 2%"> -->
<!-- <div on:click = {() => j = 3}> A Promises Monad</div>
<div>
</div>

        <ul >
            <div>VARIATIONS ON THE MONAD THEME</div>
            <li class='button' on:click={() => {j = 1; console.log("j is", j)}}>A Simple Monad</li>>
            <li class='button' on:click={() => {j = 2; console.log("j is", j)}}>Message Monad</li>
            <li class='button' on:click={() => {j = 3; console.log("j is", j)}}>Promise Monad</li>
            <li class='button' on:click={() => {j = 7; console.log("j is", j)}}>Transducer Simulator</li>
            <li class='button' on:click={() => {j = 10; console.log("j is", j)}}>React Interactive Game of Score</li>
        </ul>
        
        <ul>

        <li><div>MISCELLANEOUS TOPICS</div></li>
        <li class='button'  on:click={() => j = 5}> Why Svelte</li>
        <li class='button' on:click={() => {j = 9; console.log("j is", j)}}>Hidden Haskell Informationx</li>
        <li class='button' on:click={() => {j = 4; console.log("j is", j)}}>Bed Bugs</li>
        <li class='button' on:click={() => {j = 0; console.log("j is", j)}}>Home</li>
        <li class='button' on:click={() => {j = 23; console.log("j is", j)}}>StoreDemo</li>
        </ul>
        <ul>
        <li><div>SVELTE SNIPPETS</div></li>
        <li class='button' on:click={() => {j = 8; console.log("j is", j)}}>Toggle Theme</li>
        <li class='button' on:click={() => {j = 11; console.log("j is", j)}}>Toggle Class</li>
        <li class='button' on:click={stor}>Stor</li>
        <li class='button' on:click={snack}>Snack</li>
        <li class='button' on:click={cargo}>Cargo</li>
            <li class='button' on:click={() => {j = 40; console.log("j is", j)}}>Drop1</li>
            <li class='button' on:click={() => {j = 41; console.log("j is", j)}}>Drop2</li>
            <li class='button' on:click={() => {j = 42; console.log("j is", j)}}>Drop3</li>
            <li class='button' on:click={() => {j = 43; console.log("j is", j)}}>Drop4</li>
            <li class='button' on:click={() => {j = 44; console.log("j is", j)}}>Drop5</li>
            
            
        <br>
        </ul>
        </div>  -->                                                         
       <!-- <div class = margins> -->

<div style = "margin-left: 25%; margin-right: 25%;">

 <br>

{#if j === 0}
<div class = show>Home</div>
<Home />
{/if}
{#if j === 1}
<div class = show>Simple Monad</div>
<Monad />
{/if}
{#if j === 2}
<div class = show>Messages Monad</div>
<Monad2 />
{/if}
{#if j === 3}
<div class = show>Promises Monad</div>
<Monad3 />
{/if}
{#if j === 14}
<div class = show>Promises II</div>
<Monad5 />
{/if}
{#if j === 4}
<div class = show>Transducer Monad</div>
<Transducer />
{/if}
{#if j === 5}
<div class = show>Why Svelte</div>
<Matrix />
{/if}
{#if j === 6}
<div class = show>Haskell Tip</div>
<Haskell />
{/if}
{#if j === 7}
<div class = show>Game of Score</div>
<Score />
{/if}
{#if j === 8}
<div class = show>Cargo Cult</div>
<Cargo />
{/if}
{#if j === 9}
<div class = show>Bed Bugs</div>
<Bugs />
{/if}
{#if j === 10}
<div class = show>Toggle Class</div>
<ToggleClass />
{/if}
{#if j === 11}
<div class = show>Toggle Theme</div>
<ToggleTheme />
{/if}

</div>
<br><br>
<slot />

<br><br>
<br><br>
<br><br>




<script>
import {fade} from "svelte/transition"
let visible = true;
</script>
{#if visible}
 <div style = "font-family: Times New Roman;  text-align: center; color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
 GAME OF SCORE
 </div>
{/if}
<br>

<p> Score is an elaborate React project with a Haskell Wai WebSockets server on the back end. Users can form or join groups that play, exchange text messages, and maintain a todo list among themselves.</p>

<p> You will be in the default group "solo" until you join or create a group with another name. You can change the user name assigned to you by entering a new name and password, separated by a comma (name,password). </p>

<p> Game rules are available at the game site, which runs online here:</p>
<a href = "http://game.schalk.site" target = "_blank">Online game of Score></a>
<span> The code is here: </span>
<a href = "https://github.com/dschalk/score2" target = "_blank">Score Github Repository</a>
<br><br>
<span> I switched from </span>
<a href = "https://nodejs.org/en/about/" target = "_blank">Node</a>
<span> to </span>
<a href = "https://reactjs.org/" target = "_blank">React</a>
<span> and then, a few years ago, I switched to </span>
<a href = "https://cycle.js.org" target = "_blank">Cycle.js></a>
<span>. Recently, I started using </span>
<a href = "https://svelte.dev/" target = "_blank">Svelte</a>
<span>. For me, writing and maintaining code became easier and easier as I went from React to Cycle.js to Svelte. Another important feature of Svelte is that </span>
<a href = "https://www.freecodecamp.org/news/a-realworld-comparison-of-front-end-frameworks-with-benchmarks-2019-update-4be0d3c78075/" target = "_blank">substantially less code needs to be uploaded to browsers</a>
<span>. I'm impressed. </span>

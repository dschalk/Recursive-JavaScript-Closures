<script>
let current = 'foo';
	
export let num_a;
export let num_b;
export let mod;
export let car;
/* we don't need to declare `squared` and `cubed`
	— Svelte does it for us
$: squared = num * num;
$: cubed = squared * num; */

num_a = 0;
num_b = 0;
mod = 5;
car = ['foo', 'foo', 'foo', 'bar', 'bar', 'bar', 'baz', 'baz', 'baz']

setInterval(() => {
	if (mod) {
		num_a = (num_a += 1) % mod
		num_b = (num_b += 1) % 9
		current = car[num_b]
	}	
}, 1000)

let code = `num_a = 0;
num_b = 0;
mod = 5;
car = ['foo', 'foo', 'foo', 'bar', 'bar', 'bar', 'baz', 'baz', 'baz']

setInterval(() => {
	if (mod) {
		num_a = (num_a += 1) % mod
		num_b = (num_b += 1) % 9
		current = car[num_b]
	}	
}, 1000)

<button
class:active={current === 'foo'}
on:click={() => num_b = 0}
>foo</button>

<button
class:active={current === 'bar'}
on:click={() => num_b = 4}
>bar</button>

<button
class:active={current === 'baz'}
on:click={() => num_b = 7}
>baz</button> `


</script>

<style>
button {
	display: block;
}

.active {
	background-color: #0000FF;
	color: #FF0000;
}


input {
	width: 20px;
}
</style>

<span>Elapsed time modulo </span>
<input bind:value = {mod} > 
<span> is </span>
<span>{num_a +1} seconds. Clicking selects a button. If you don't click, the buttons change every three seconds regardless of the elapsed time. </span>
<br><br>
<button
class:active={current === 'foo'}
on:click={() => num_b = 0}
>foo</button>

<button
class:active={current === 'bar'}
on:click={() => num_b = 4}
>bar</button>

<button
class:active={current === 'baz'}
on:click={() => num_b = 7}
>baz</button>
<span>This module demonstrates manipulation of CSS classes in Svelte. Here is the most relevant code </span>
<span> (the rest of the code is in the </span>
<a href = "https://github.com/dschalk/blog" target = "_blank" >Repository</a>
<span>):</span>
<pre style = "color: #aaccff">{code}</pre>
<br><br><br>
<br><br><br>
<div style = "text-align: center">_._._._</div>
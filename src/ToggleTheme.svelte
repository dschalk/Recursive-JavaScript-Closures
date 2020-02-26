<script>
	let dark = false;
	const toggleTheme = () => dark = dark === false

	import Stor from './Stor.svelte';                   

</script>

<svelte:head>
	{#if dark}
	<link rel="stylesheet" href="style.css">
	{/if}
</svelte:head>

<h1>Hello World!</h1>
<Stor />

<button on:click={toggleTheme}>
	toggle theme
</button>

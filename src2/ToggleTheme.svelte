<script>
	let dark = false;
	const toggleTheme = () => dark = dark === false
</script>

<svelte:head>
	{#if dark}
	<link rel="stylesheet" href="style.css">
	{/if}
</svelte:head>

<h1>Hello World!</h1>

<button on:click={toggleTheme}>
	toggle theme
</button>

<script>
	import { writable } from 'svelte/store';

	const count = writable(0);
	console.log($count); // logs 0

	count.set(1);
	console.log($count); // logs 1

	$count = 2;
	console.log($count); // logs 2

	const loc = writable(false);
	console.log($loc); // logs false

	loc.set(true);
	console.log($loc); // logs true

	$loc = false;
	console.log($loc); // logs false

	loc.set(true);
	console.log($loc); // logs true


</script>

<h2>loc is {$loc}</h2>

























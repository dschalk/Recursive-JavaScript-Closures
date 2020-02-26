<script>
	import { count } from './stores.js';

	function increment() {
		count.update(k => k + 1);
	}
</script>

<button on:click={increment}>
	+
</button>
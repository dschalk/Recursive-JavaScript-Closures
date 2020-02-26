<script>
	import { count } from './stores.js';

	function decrement() {
		count.update(k => k - 1);
	}
</script>

<button on:click={decrement}>
	-
</button>
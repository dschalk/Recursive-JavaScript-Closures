import { writable } from 'svelte/store';

export const count = writable(0); 
export var count2 = createCount();
function createCount() {
	const { subscribe, set, update } = writable(0);

	return {
		subscribe,
		increment: () => update(n => n + 1),
		decrement: () => update(n => n - 1),
		reset: () => set(0)
	};
}






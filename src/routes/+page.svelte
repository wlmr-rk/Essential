<!-- src/routes/+page.svelte -->
<script lang="ts">
	/**
	 * Todos page (Svelte 5 + Tailwind v4 + daisyUI v5)
	 * - Optimistic CRUD with clear visual states
	 * - Svelte transitions/animations (no custom CSS)
	 * - daisyUI components for consistent UI and less class noise
	 * - Tailwind utilities only in markup (no @apply)
	 *
	 * Note: We removed cosmetic "in-flight" hints (optimisticClass, spinners)
	 * because your ops are effectively instant. We keep rollbackData and
	 * optimisticOps for correctness on failures.
	 */

	// Data layer
	import { getTodos, addTodo, toggleTodo, deleteTodo, updateTodo } from './todos.remote';

	// Utils
	import { nanoid } from 'nanoid';

	// Svelte animations
	import { fly, fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	// -------------------------------------------------------------------------------------
	// State
	// -------------------------------------------------------------------------------------

	let todos = $state(await getTodos());

	// UI state
	let newTodoName = $state('');
	let error = $state<string | null>(null);

	// Optimistic tracking
	type OpKind = 'add' | 'toggle' | 'delete' | 'update';
	let optimisticOps = $state(new Map<string, OpKind>());
	let rollbackData = $state(new Map<string, any>());

	// Edit state
	let editingId = $state<string | null>(null);
	let editText = $state('');

	// Derived: hide items pending delete
	let displayTodos = $derived(todos.filter((t) => !optimisticOps.has(key('delete', t.id))));

	// -------------------------------------------------------------------------------------
	// Helpers
	// -------------------------------------------------------------------------------------

	function key(kind: OpKind, id: string) {
		return `${kind}-${id}`;
	}

	let errorTimeout: ReturnType<typeof setTimeout> | null = null;
	function setError(msg: string) {
		error = msg;
		if (errorTimeout) clearTimeout(errorTimeout);
		errorTimeout = setTimeout(() => (error = null), 5000);
	}

	// -------------------------------------------------------------------------------------
	// Toasts (Undo delete)
	// -------------------------------------------------------------------------------------

	type UndoToast = {
		id: string;
		name: string;
		timeoutId: ReturnType<typeof setTimeout>;
	};

	let undoToasts = $state<UndoToast[]>([]);

	function showUndoToast(todoId: string, todoName: string) {
		const timeoutId = setTimeout(() => {
			undoToasts = undoToasts.filter((t) => t.id !== todoId);
		}, 4000);
		undoToasts = [...undoToasts, { id: todoId, name: todoName, timeoutId }];
	}

	function undoDelete(todoId: string) {
		optimisticOps.delete(key('delete', todoId));
		const toast = undoToasts.find((t) => t.id === todoId);
		if (toast) {
			clearTimeout(toast.timeoutId);
			undoToasts = undoToasts.filter((t) => t.id !== todoId);
		}
	}

	// -------------------------------------------------------------------------------------
	// Actions (Optimistic)
	// -------------------------------------------------------------------------------------

	async function handleAddTodo(e: Event) {
		e.preventDefault();
		const name = newTodoName.trim();
		if (!name) return;

		const tempId = `temp-${nanoid()}`;
		const temp = { id: tempId, name, done: false };

		// Optimistic add
		todos = [...todos, temp];
		optimisticOps.set(key('add', tempId), 'add');
		newTodoName = '';

		try {
			const created = await addTodo({ name });
			// Replace temp with server row
			todos = todos.map((t) => (t.id === tempId ? created : t));
			optimisticOps.delete(key('add', tempId));
		} catch (e) {
			// Rollback
			todos = todos.filter((t) => t.id !== tempId);
			optimisticOps.delete(key('add', tempId));
			newTodoName = name;
			setError(e instanceof Error ? e.message : 'Failed to add todo');
		}
	}

	async function handleToggle(id: string) {
		const k = key('toggle', id);
		const current = todos.find((t) => t.id === id);
		if (!current) return;

		// Snapshot for rollback
		rollbackData.set(k, { ...current });
		optimisticOps.set(k, 'toggle');

		// Optimistic toggle
		todos = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));

		try {
			const updated = await toggleTodo({ id });
			todos = todos.map((t) => (t.id === id ? updated : t));
			optimisticOps.delete(k);
			rollbackData.delete(k);
		} catch (e) {
			// Rollback
			const original = rollbackData.get(k);
			if (original) todos = todos.map((t) => (t.id === id ? original : t));
			optimisticOps.delete(k);
			rollbackData.delete(k);
			setError(e instanceof Error ? e.message : 'Failed to toggle todo');
		}
	}

	async function handleDelete(id: string) {
		const k = key('delete', id);
		const current = todos.find((t) => t.id === id);
		if (!current) return;

		// Snapshot for potential restore and hide row immediately
		rollbackData.set(k, current);
		optimisticOps.set(k, 'delete');

		// Show undo toast while we try the server delete
		showUndoToast(id, current.name);

		try {
			await deleteTodo({ id });
			// Remove permanently after success
			todos = todos.filter((t) => t.id !== id);
			optimisticOps.delete(k);
			rollbackData.delete(k);
		} catch (e) {
			// Failed: just clear the op; row was never removed from 'todos'
			optimisticOps.delete(k);
			rollbackData.delete(k);
			setError(e instanceof Error ? e.message : 'Failed to delete todo');
		}
	}

	function startEdit(id: string, current: string) {
		editingId = id;
		editText = current;
	}

	function cancelEdit() {
		editingId = null;
		editText = '';
	}

	async function saveEdit(id: string) {
		const name = editText.trim();
		if (!name) return;

		const k = key('update', id);
		const current = todos.find((t) => t.id === id);
		if (!current) return;

		// Snapshot and optimistic rename
		rollbackData.set(k, { ...current });
		optimisticOps.set(k, 'update');
		todos = todos.map((t) => (t.id === id ? { ...t, name } : t));
		cancelEdit();

		try {
			const updated = await updateTodo({ id, name });
			todos = todos.map((t) => (t.id === id ? updated : t));
			optimisticOps.delete(k);
			rollbackData.delete(k);
		} catch (e) {
			// Rollback and re-enter edit mode with original
			const original = rollbackData.get(k);
			if (original) {
				todos = todos.map((t) => (t.id === id ? original : t));
				startEdit(id, original.name);
			}
			optimisticOps.delete(k);
			rollbackData.delete(k);
			setError(e instanceof Error ? e.message : 'Failed to update todo');
		}
	}

	function onEditKeydown(e: KeyboardEvent, id: string) {
		if (e.key === 'Enter') {
			e.preventDefault();
			void saveEdit(id);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			cancelEdit();
		}
	}
</script>

<!--
  Layout
  - Page shell
  - Toasts (daisyUI toast + alert)
  - Error alert (daisyUI alert-error)
  - Add form (daisyUI join)
  - Todos list (daisyUI list + list-row, keyed + animate:flip)
  - Footer stats
-->
<div class="min-h-screen bg-base-200 p-8 text-base-content">
	<div class="mx-auto max-w-2xl">
		<h1 class="mb-8 text-4xl font-bold text-primary">Todo List</h1>

		<!-- Undo toasts (daisyUI toast stack, each item flies in/out) -->
		{#if undoToasts.length > 0}
			<div class="toast-top toast-end toast z-50">
				{#each undoToasts as toast (toast.id)}
					<div
						in:fly={{ y: -10, duration: 200, opacity: 0 }}
						out:fly={{ y: -10, duration: 200, opacity: 0 }}
						class="alert alert-warning"
						role="status"
					>
						<span>Deleted "{toast.name}"</span>
						<button
							class="btn btn-outline btn-xs"
							onclick={() => undoDelete(toast.id)}
							aria-label={`Undo delete ${toast.name}`}
						>
							Undo
						</button>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Error alert (daisyUI alert-error) -->
		{#if error}
			<div
				in:fly={{ y: -10, duration: 200, opacity: 0 }}
				out:fade={{ duration: 150 }}
				class="mb-4 alert alert-error"
				role="alert"
			>
				<span>{error}</span>
			</div>
		{/if}

		<!-- Add form (daisyUI join for cohesive input+button) -->
		<form onsubmit={handleAddTodo} class="mb-6">
			<div class="join w-full">
				<input
					type="text"
					bind:value={newTodoName}
					placeholder="Add a new todo..."
					class="input-bordered input join-item w-full input-primary"
					aria-label="New todo name"
				/>
				<button type="submit" class="btn join-item btn-primary" disabled={!newTodoName.trim()}>
					Add
				</button>
			</div>
		</form>

		<!-- Todo list (daisyUI list + list-row) -->
		{#if displayTodos.length === 0}
			<div class="py-8 text-center text-base-content/60">
				{todos.length === 0 ? 'No todos yet. Add one above!' : 'All todos completed!'}
			</div>
		{:else}
			<ul class="list space-y-2">
				{#each displayTodos as todo (todo.id)}
					<!-- Each item animates with FLIP; group reveals actions on hover -->
					<li
						animate:flip
						class="group list-row items-center gap-3 rounded-lg border border-base-300 bg-base-100 p-3 hover:border-base-300/70"
					>
						<!-- Checkbox -->
						<input
							type="checkbox"
							class="checkbox checkbox-primary"
							checked={todo.done}
							onchange={() => handleToggle(todo.id)}
							aria-label={`Toggle ${todo.name}`}
						/>

						<!-- Name / edit input (middle column grows) -->
						<div class="list-col-grow">
							{#if editingId === todo.id}
								<!-- svelte-ignore a11y_autofocus -->
								<input
									type="text"
									bind:value={editText}
									class="input input-sm w-full input-ghost focus:ring-2 focus:ring-primary/60"
									onkeydown={(e) => onEditKeydown(e, todo.id)}
									autofocus
									aria-label={`Edit name for ${todo.name}`}
								/>
							{:else}
								<span
									class="cursor-pointer transition-colors {todo.done
										? 'text-base-content/60 line-through'
										: 'hover:text-primary'}"
									onclick={() => startEdit(todo.id, todo.name)}
								>
									{todo.name}
								</span>
							{/if}
						</div>

						<!-- Actions (revealed on row hover) -->
						{#if editingId === todo.id}
							<div class="flex gap-2">
								<button
									class="btn btn-xs btn-primary"
									onclick={() => saveEdit(todo.id)}
									disabled={!editText.trim() || editText === todo.name}
								>
									Save
								</button>
								<button class="btn btn-ghost btn-xs" onclick={cancelEdit}> Cancel </button>
							</div>
						{:else}
							<div class="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
								<button
									class="btn text-primary btn-ghost btn-xs"
									onclick={() => startEdit(todo.id, todo.name)}
									aria-label={`Edit ${todo.name}`}
								>
									Edit
								</button>
								<button
									onclick={() => handleDelete(todo.id)}
									class="btn text-error btn-ghost btn-xs"
									aria-label={`Delete ${todo.name}`}
								>
									Delete
								</button>
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}

		<!-- Stats -->
		<div
			class="mt-8 flex justify-between border-t border-base-300 pt-4 text-sm text-base-content/70"
		>
			<span>{displayTodos.filter((t) => !t.done).length} remaining</span>
			<span>{displayTodos.filter((t) => t.done).length} completed</span>
		</div>
	</div>
</div>

<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { getTodos, addTodo, toggleTodo, deleteTodo, updateTodo } from './todos.remote';

	// Clean top-level await - boundary handled by layout
	let todos = $state(await getTodos());
	let newTodoName = $state('');
	let error = $state<string | null>(null);

	// inline edit state
	let editingId = $state<string | null>(null);
	let editText = $state('');

	async function handleAddTodo(e: Event) {
		e.preventDefault();
		if (!newTodoName.trim()) return;
		try {
			const newTodo = await addTodo({ name: newTodoName });
			todos = [...todos, newTodo];
			newTodoName = '';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to add todo';
		}
	}

	async function handleToggle(id: string) {
		try {
			const updated = await toggleTodo({ id });
			todos = todos.map((t) => (t.id === id ? updated : t));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to toggle todo';
		}
	}

	async function handleDelete(id: string) {
		try {
			await deleteTodo({ id });
			todos = todos.filter((t) => t.id !== id);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to delete todo';
		}
	}

	function startEdit(todoId: string, current: string) {
		editingId = todoId;
		editText = current;
	}

	function cancelEdit() {
		editingId = null;
		editText = '';
	}

	async function saveEdit(id: string) {
		const name = editText.trim();
		if (!name) return;
		try {
			const updated = await updateTodo({ id, name });
			todos = todos.map((t) => (t.id === id ? updated : t));
			cancelEdit();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to update todo';
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

<div class="min-h-screen bg-gray-900 p-8 text-gray-100">
	<div class="mx-auto max-w-2xl">
		<h1 class="mb-8 text-4xl font-bold text-cyan-400">Todo List</h1>

		{#if error}
			<div class="mb-4 rounded border border-red-500 bg-red-900/50 px-4 py-3 text-red-200">
				{error}
			</div>
		{/if}

		<form onsubmit={handleAddTodo} class="mb-6 flex gap-2">
			<input
				type="text"
				bind:value={newTodoName}
				placeholder="Add a new todo..."
				class="input flex-1 input-neutral"
			/>
			<button type="submit" class="btn btn-neutral"> Add </button>
		</form>

		{#if todos.length === 0}
			<div class="py-8 text-center text-gray-500">No todos yet. Add one above!</div>
		{:else}
			<ul class="list">
				{#each todos as todo (todo.id)}
					<li class="list-row">
						<input
							type="checkbox"
							class="checkbox checkbox-primary"
							checked={todo.done}
							onchange={() => handleToggle(todo.id)}
							aria-label="toggle"
						/>

						<!-- name / edit input -->
						<div class="flex-1">
							{#if editingId === todo.id}
								<!-- svelte-ignore a11y_autofocus -->
								<input
									type="text"
									bind:value={editText}
									class="input input-sm input-ghost"
									onkeydown={(e) => onEditKeydown(e, todo.id)}
									autofocus
								/>
							{:else}
								<span class={todo.done ? 'text-gray-500 line-through' : ''}>
									{todo.name}
								</span>
							{/if}
						</div>

						{#if editingId === todo.id}
							<div class="flex gap-2">
								<button
									class="rounded bg-cyan-600 px-3 py-1 text-sm font-medium transition-colors hover:bg-cyan-700"
									onclick={() => saveEdit(todo.id)}
								>
									Save
								</button>
								<button
									class="rounded bg-gray-700 px-3 py-1 text-sm font-medium transition-colors hover:bg-gray-600"
									onclick={cancelEdit}
								>
									Cancel
								</button>
							</div>
						{:else}
							<div class="flex gap-3">
								<button
									class="text-cyan-400 transition-colors hover:text-cyan-300"
									onclick={() => startEdit(todo.id, todo.name)}
								>
									Edit
								</button>
								<button
									onclick={() => handleDelete(todo.id)}
									class="text-red-400 transition-colors hover:text-red-300"
								>
									Delete
								</button>
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

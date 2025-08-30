// src/routes/todos.remote.ts
import { command, query } from '$app/server';
import { db } from '$lib/server/db';
import { todos } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';

const AddTodo = z.object({
	name: z.string().min(1, 'Todo name is required')
});

const TodoId = z.object({
	id: z.string().min(1, 'ID is required')
});

const UpdateTodo = z.object({
	id: z.string().min(1, 'ID is required'),
	name: z.string().min(1, 'Todo name is required')
});

export const getTodos = query(async () => {
	const allTodos = await db.select().from(todos).orderBy(todos.id);
	return allTodos;
});

export const addTodo = command(AddTodo, async ({ name }) => {
	const [row] = await db
		.insert(todos)
		.values({
			id: process.hrtime.bigint().toString(),
			name,
			done: false
		})
		.returning();
	return row;
});

export const toggleTodo = command(TodoId, async ({ id }) => {
	const updated = await db
		.update(todos)
		.set({ done: sql`not ${todos.done}` })
		.where(eq(todos.id, id))
		.returning();
	if (updated.length === 0) throw fail(404, { message: 'Todo not found' });
	return updated[0];
});

export const deleteTodo = command(TodoId, async ({ id }) => {
	const deleted = await db.delete(todos).where(eq(todos.id, id)).returning();
	if (deleted.length === 0) throw fail(404, { message: 'Todo not found' });
	return deleted[0];
});

// NEW: Update todo name
export const updateTodo = command(UpdateTodo, async ({ id, name }) => {
	const updated = await db.update(todos).set({ name }).where(eq(todos.id, id)).returning();
	if (updated.length === 0) throw fail(404, { message: 'Todo not found' });
	return updated[0];
});

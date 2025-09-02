<!-- Premium Button Component -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	
	interface Props {
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		loading?: boolean;
		active?: boolean;
		icon?: any;
		iconOnly?: boolean;
		type?: 'button' | 'submit' | 'reset';
		ariaLabel?: string;
		onclick?: () => void;
		children?: Snippet;
	}
	
	let {
		variant = 'ghost',
		size = 'md',
		disabled = false,
		loading = false,
		active = false,
		icon,
		iconOnly = false,
		type = 'button',
		ariaLabel,
		onclick,
		children
	}: Props = $props();
	
	function handleClick() {
		if (!disabled && !loading && onclick) {
			onclick();
		}
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleClick();
		}
	}
</script>

<button
	class="btn btn-{variant} btn-{size} {active ? 'btn-active' : ''}"
	class:btn-icon-only={iconOnly}
	{type}
	{disabled}
	aria-label={ariaLabel || (iconOnly ? 'Button' : undefined)}
	aria-pressed={active ? 'true' : undefined}
	onclick={handleClick}
	onkeydown={handleKeydown}
>
	{#if loading}
		<div class="loading-spinner" aria-hidden="true"></div>
		<span class="sr-only">Loading...</span>
	{:else if icon}
		{@const IconComponent = icon}
		<IconComponent 
			size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} 
			aria-hidden="true"
		/>
	{/if}
	
	{#if !iconOnly && children}
		{@render children()}
	{/if}
</button>

<style>
	.btn {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border: 1px solid var(--color-gray-700);
		border-radius: 0.5rem;
		background-color: var(--color-gray-800);
		color: white;
		font-weight: 500;
		font-size: 0.875rem;
		line-height: 1.25;
		cursor: pointer;
		transition: all 150ms ease-out;
		user-select: none;
		white-space: nowrap;
		transform: translateY(0);
	}
	
	.btn:hover:not(:disabled) {
		border-color: var(--color-gray-600);
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
		transform: translateY(-1px);
	}
	
	.btn:active:not(:disabled) {
		transform: translateY(0) scale(0.98);
		box-shadow: none;
	}
	
	.btn:focus-visible {
		outline: 2px solid #14b8a6;
		outline-offset: 2px;
	}
	
	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.btn-primary {
		background-color: #0d9488;
		border-color: #0d9488;
		color: white;
	}
	
	.btn-primary:hover:not(:disabled) {
		background-color: #0f766e;
		border-color: #0f766e;
	}
	
	.btn-primary:active:not(:disabled) {
		background-color: #134e4a;
		border-color: #134e4a;
	}
	
	.btn-secondary {
		background-color: var(--color-gray-600);
		border-color: var(--color-gray-600);
		color: white;
	}
	
	.btn-secondary:hover:not(:disabled) {
		background-color: var(--color-gray-700);
		border-color: var(--color-gray-700);
	}
	
	.btn-ghost {
		background-color: transparent;
		border-color: var(--color-gray-700);
		color: var(--color-gray-400);
	}
	
	.btn-ghost:hover:not(:disabled) {
		background-color: var(--color-gray-800);
		color: white;
	}
	
	.btn-danger {
		background-color: #dc2626;
		border-color: #dc2626;
		color: white;
	}
	
	.btn-danger:hover:not(:disabled) {
		background-color: #b91c1c;
		border-color: #b91c1c;
	}
	
	.btn-danger:active:not(:disabled) {
		background-color: #991b1b;
		border-color: #991b1b;
	}
	
	.btn-sm {
		padding: 0.25rem 0.75rem;
		font-size: 0.75rem;
		border-radius: 0.375rem;
	}
	
	.btn-lg {
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		border-radius: 0.75rem;
	}
	
	.btn-icon-only.btn-sm {
		padding: 0.25rem;
	}
	
	.btn-icon-only.btn-md {
		padding: 0.5rem;
		aspect-ratio: 1;
	}
	
	.btn-icon-only.btn-lg {
		padding: 0.75rem;
	}
	
	.btn-active {
		background-color: rgba(20, 184, 166, 0.1);
		border-color: #0d9488;
		color: #5eead4;
	}
	
	.btn-active:hover:not(:disabled) {
		background-color: rgba(20, 184, 166, 0.2);
		border-color: #14b8a6;
	}
	
	.loading-spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
	
	.btn-sm .loading-spinner {
		width: 0.75rem;
		height: 0.75rem;
	}
	
	.btn-lg .loading-spinner {
		width: 1.25rem;
		height: 1.25rem;
	}
	
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
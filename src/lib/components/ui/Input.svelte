<!-- src/lib/components/ui/Input.svelte -->
<script lang="ts">
	interface Props {
		type?: 'text' | 'time' | 'number' | 'email' | 'password';
		value?: string | number;
		placeholder?: string;
		label?: string;
		disabled?: boolean;
		required?: boolean;
		id?: string;
	}
	
	let {
		type = 'text',
		value = $bindable(),
		placeholder,
		label,
		disabled = false,
		required = false,
		id
	}: Props = $props();
</script>

<div class="space-y-2">
	{#if label}
		<label for={id} class="arasaka-label block">
			{label}
			{#if required}
				<span class="cyber-text-secondary ml-1">*</span>
			{/if}
		</label>
	{/if}
	
	<input
		{id}
		{type}
		{placeholder}
		{disabled}
		{required}
		bind:value
		class="arasaka-input"
	/>
</div>
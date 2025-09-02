<!-- Premium Input Component -->
<script lang="ts">
	interface Props {
		type?: 'text' | 'time' | 'number' | 'email' | 'password' | 'tel' | 'url' | 'search';
		value?: string | number;
		placeholder?: string;
		label?: string;
		helpText?: string;
		errorMessage?: string;
		disabled?: boolean;
		required?: boolean;
		readonly?: boolean;
		autocomplete?: HTMLInputElement['autocomplete'];
		min?: number | string;
		max?: number | string;
		step?: number | string;
		pattern?: string;
		id?: string;
		name?: string;
		ariaLabel?: string;
		ariaDescribedBy?: string;
	}
	
	let {
		type = 'text',
		value = $bindable(),
		placeholder,
		label,
		helpText,
		errorMessage,
		disabled = false,
		required = false,
		readonly = false,
		autocomplete,
		min,
		max,
		step,
		pattern,
		id,
		name,
		ariaLabel,
		ariaDescribedBy
	}: Props = $props();
	
	let inputElement: HTMLInputElement;
	let focused = $state(false);
	
	const hasError = $derived(!!errorMessage);
	const describedBy = $derived(() => {
		const ids: string[] = [];
		if (helpText && id) ids.push(`${id}-help`);
		if (errorMessage && id) ids.push(`${id}-error`);
		if (ariaDescribedBy) ids.push(ariaDescribedBy);
		return ids.length > 0 ? ids.join(' ') : undefined;
	});
	
	function handleFocus() {
		focused = true;
	}
	
	function handleBlur() {
		focused = false;
	}
	
	function focus() {
		inputElement?.focus();
	}
	
	// Export focus method for parent components
	export { focus };
</script>

<div class="flex flex-col gap-2">
	{#if label}
		<label for={id} class="block text-sm font-medium text-white leading-tight">
			{label}
			{#if required}
				<span class="text-red-400" aria-label="required">*</span>
			{/if}
		</label>
	{/if}
	
	<div class="relative transition-all duration-150 ease-out {focused ? '-translate-y-px' : ''} {hasError ? 'animate-shake' : ''}">
		<input
			bind:this={inputElement}
			{id}
			{name}
			{type}
			{placeholder}
			{disabled}
			{readonly}
			{required}
			autocomplete={autocomplete}
			{min}
			{max}
			{step}
			{pattern}
			bind:value
			class="w-full px-4 py-3 bg-gray-900 border rounded-lg text-white font-normal text-sm leading-tight transition-all duration-150 ease-out hover:border-gray-600 focus:outline-none focus:border-teal-500 focus:shadow-[0_0_0_3px_rgb(20_184_166_/_0.1)] disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed disabled:opacity-60 read-only:bg-gray-800 read-only:cursor-default placeholder:text-gray-500 {hasError ? 'border-red-500 focus:border-red-500 focus:shadow-[0_0_0_3px_rgb(239_68_68_/_0.1)]' : 'border-gray-700'}"
			aria-label={ariaLabel}
			aria-describedby={describedBy()}
			aria-invalid={hasError ? 'true' : undefined}
			onfocus={handleFocus}
			onblur={handleBlur}
		/>
	</div>
	
	{#if helpText && !errorMessage}
		<p id="{id}-help" class="m-0 text-xs text-gray-500 leading-normal">
			{helpText}
		</p>
	{/if}
	
	{#if errorMessage}
		<p id="{id}-error" class="m-0 text-xs text-red-400 font-medium leading-normal" role="alert">
			{errorMessage}
		</p>
	{/if}
</div>

<style>
	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
		20%, 40%, 60%, 80% { transform: translateX(2px); }
	}
	
	.animate-shake {
		animation: shake 250ms ease-out;
	}
</style>
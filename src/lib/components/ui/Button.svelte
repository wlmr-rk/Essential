<!-- src/lib/components/ui/Button.svelte -->
<script lang="ts">
	interface Props {
		variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		loading?: boolean;
		active?: boolean;
		icon?: any;
		iconOnly?: boolean;
		onclick?: () => void;
		children?: any;
	}
	
	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		loading = false,
		active = false,
		icon,
		iconOnly = false,
		onclick,
		children
	}: Props = $props();
	
	function getClasses() {
		let classes = 'arasaka-btn';
		
		if (size === 'sm') classes += ' arasaka-btn-sm';
		if (iconOnly) classes += ' arasaka-btn-icon';
		if (variant === 'danger') classes += ' arasaka-btn-danger';
		if (active) classes += ' active';
		if (disabled || loading) classes += ' opacity-50 cursor-not-allowed';
		
		return classes;
	}
</script>

<button
	class={getClasses()}
	{disabled}
	onclick={disabled || loading ? undefined : onclick}
	type="button"
>
	{#if loading}
		<div class="arasaka-loading"></div>
	{:else if icon}
		{@const IconComponent = icon}
		<IconComponent size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
	{/if}
	
	{#if !iconOnly && children}
		{#if icon && !loading}
			<span class="ml-2">
				{@render children()}
			</span>
		{:else if !loading}
			{@render children()}
		{/if}
	{/if}
</button>
<!-- src/lib/components/ui/Panel.svelte -->
<script lang="ts">
	interface Props {
		title?: string;
		subtitle?: string;
		icon?: any;
		value?: string | number;
		status?: 'optimal' | 'warning' | 'critical' | 'info';
		loading?: boolean;
		children?: any;
	}
	
	let {
		title,
		subtitle,
		icon,
		value,
		status,
		loading = false,
		children
	}: Props = $props();
	
	function getStatusClass(status?: string) {
		switch (status) {
			case 'optimal': return 'status-optimal';
			case 'warning': return 'status-warning';
			case 'critical': return 'status-critical';
			case 'info': return 'status-info';
			default: return 'cyber-text-primary';
		}
	}
</script>

<div class="arasaka-panel p-6">
	{#if title || icon || value}
		<div class="flex items-center justify-between mb-6">
			<div class="flex items-center gap-3">
				{#if icon}
					{@const IconComponent = icon}
					<IconComponent size={20} class="cyber-text-primary" />
				{/if}
				<div>
					{#if title}
						<h3 class="arasaka-subtitle">{title}</h3>
					{/if}
					{#if subtitle}
						<p class="arasaka-label mt-1">{subtitle}</p>
					{/if}
				</div>
			</div>
			
			{#if value !== undefined}
				<div class="text-right">
					<div class="arasaka-value text-xl {getStatusClass(status)}">
						{value}
					</div>
					{#if status}
						<div class="arasaka-label {getStatusClass(status)}">
							{status.toUpperCase()}
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
	
	{#if loading}
		<div class="flex items-center justify-center py-8">
			<div class="arasaka-loading"></div>
		</div>
	{:else if children}
		{@render children()}
	{/if}
</div>
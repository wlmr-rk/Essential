<!-- src/lib/components/ui/ProgressBar.svelte -->
<script lang="ts">
	interface Props {
		value: number;
		max?: number;
		label?: string;
		showValue?: boolean;
		status?: 'optimal' | 'warning' | 'critical' | 'info';
	}
	
	let {
		value,
		max = 100,
		label,
		showValue = true,
		status
	}: Props = $props();
	
	const percentage = $derived(Math.min(Math.max((value / max) * 100, 0), 100));
	
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

<div class="space-y-2">
	{#if label || showValue}
		<div class="flex items-center justify-between">
			{#if label}
				<span class="arasaka-label">{label}</span>
			{/if}
			{#if showValue}
				<span class="arasaka-value text-sm {getStatusClass(status)}">
					{Math.round(value)}/{max}
				</span>
			{/if}
		</div>
	{/if}
	
	<div class="arasaka-progress">
		<div 
			class="arasaka-progress-bar"
			style="width: {percentage}%"
		></div>
	</div>
</div>
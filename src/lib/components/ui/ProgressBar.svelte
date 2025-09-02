<!-- Premium Progress Bar Component -->
<script lang="ts">
	interface Props {
		value: number;
		max?: number;
		label?: string;
		showValue?: boolean;
		showPercentage?: boolean;
		status?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
		size?: 'sm' | 'md' | 'lg';
		animated?: boolean;
		ariaLabel?: string;
	}
	
	let {
		value,
		max = 100,
		label,
		showValue = true,
		showPercentage = false,
		status = 'neutral',
		size = 'md',
		animated = false,
		ariaLabel
	}: Props = $props();
	
	const percentage = $derived(Math.min(Math.max((value / max) * 100, 0), 100));
	const displayValue = $derived(Math.round(value));
	const displayPercentage = $derived(Math.round(percentage));
	
	function getStatusClass(status: string) {
		switch (status) {
			case 'success': return 'text-emerald-400';
			case 'warning': return 'text-amber-400';
			case 'error': return 'text-red-400';
			case 'info': return 'text-blue-400';
			default: return 'text-teal-400';
		}
	}
	
	function getProgressBarClass(status: string) {
		switch (status) {
			case 'success': return 'bg-emerald-500';
			case 'warning': return 'bg-amber-500';
			case 'error': return 'bg-red-500';
			case 'info': return 'bg-blue-500';
			default: return 'bg-teal-500';
		}
	}
</script>

<div class="flex flex-col gap-2">
	{#if label || showValue || showPercentage}
		<div class="flex items-center justify-between gap-2">
			{#if label}
				<span class="text-gray-300 font-medium text-sm leading-normal">
					{label}
				</span>
			{/if}
			{#if showValue || showPercentage}
				<div class="flex items-center gap-2 font-medium">
					{#if showValue}
						<span class="whitespace-nowrap text-sm font-normal leading-normal {getStatusClass(status)}">
							{displayValue}{showPercentage ? '' : `/${max}`}
						</span>
					{/if}
					{#if showPercentage}
						<span class="whitespace-nowrap text-sm font-normal leading-normal {getStatusClass(status)}">
							{displayPercentage}%
						</span>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
	
	<div 
		class="relative w-full bg-gray-800 rounded-full overflow-hidden {size === 'sm' ? 'h-1' : size === 'lg' ? 'h-2' : 'h-1.5'}"
		role="progressbar"
		aria-valuenow={value}
		aria-valuemin="0"
		aria-valuemax={max}
		aria-label={ariaLabel || label || `Progress: ${displayPercentage}%`}
	>
		<div 
			class="h-full rounded-full relative transition-[width] duration-250 ease-out {getProgressBarClass(status)} {animated ? 'animate-shimmer' : ''}"
			style="width: {percentage}%"
		></div>
	</div>
</div>

<style>
	.animate-shimmer::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
		animation: shimmer 2s infinite;
	}
	
	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}
</style>
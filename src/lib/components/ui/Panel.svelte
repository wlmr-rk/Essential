<!-- Premium Panel Component -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	
	interface Props {
		title?: string;
		subtitle?: string;
		icon?: any;
		value?: string | number;
		status?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
		loading?: boolean;
		compact?: boolean;
		interactive?: boolean;
		elevated?: boolean;
		ariaLabel?: string;
		onclick?: () => void;
		children?: Snippet;
	}
	
	let {
		title,
		subtitle,
		icon,
		value,
		status = 'neutral',
		loading = false,
		compact = false,
		interactive = false,
		elevated = false,
		ariaLabel,
		onclick,
		children
	}: Props = $props();
	
	function getStatusClass(status: string) {
		switch (status) {
			case 'success': return 'text-emerald-400';
			case 'warning': return 'text-amber-400';
			case 'error': return 'text-red-400';
			case 'info': return 'text-blue-400';
			default: return 'text-teal-400';
		}
	}
	
	function getStatusDotClass(status: string) {
		switch (status) {
			case 'success': return 'bg-emerald-400';
			case 'warning': return 'bg-amber-400';
			case 'error': return 'bg-red-400';
			case 'info': return 'bg-blue-400';
			default: return 'bg-gray-600';
		}
	}
	
	function handleClick() {
		if (interactive && onclick && !loading) {
			onclick();
		}
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (interactive && (event.key === 'Enter' || event.key === ' ')) {
			event.preventDefault();
			handleClick();
		}
	}
	
	const baseClasses = 'bg-gray-900 border border-gray-800 overflow-hidden transition-all duration-250 ease-out h-full';
	const compactClasses = compact ? 'rounded-lg shadow-none' : 'rounded-xl shadow-sm';
	const elevatedClasses = elevated ? 'shadow-md' : '';
	const interactiveClasses = interactive ? 'cursor-pointer hover:border-gray-700 hover:shadow-md hover:-translate-y-px active:translate-y-0 active:scale-[0.99] active:shadow-sm focus-visible:outline-2 focus-visible:outline-teal-500 focus-visible:outline-offset-2' : '';
	
	const panelClasses = `${baseClasses} ${compactClasses} ${elevatedClasses} ${interactiveClasses}`;
</script>

{#if interactive}
	<button
		class={panelClasses}
		aria-label={ariaLabel || title}
		onclick={handleClick}
		onkeydown={handleKeydown}
		disabled={loading}
	>
		<div class={compact ? 'p-4' : 'p-6'}>
			{#if title || icon || value !== undefined}
				<header class="flex items-start justify-between gap-4 {compact ? 'mb-4' : 'mb-6'}">
					<div class="flex items-start {compact ? 'gap-2' : 'gap-3'} flex-1 min-w-0">
						{#if icon}
							{@const IconComponent = icon}
							<div class="flex-shrink-0 mt-1">
								<IconComponent 
									size={compact ? 18 : 20} 
									class={getStatusClass(status)}
									aria-hidden="true"
								/>
							</div>
						{/if}
						<div class="flex-1 min-w-0">
							{#if title}
								<h3 class="m-0 leading-tight {compact ? 'text-base font-normal text-gray-300' : 'text-lg font-medium text-white'}">
									{title}
								</h3>
							{/if}
							{#if subtitle}
								<p class="mt-1 mb-0 leading-normal text-xs font-normal text-gray-500">
									{subtitle}
								</p>
							{/if}
						</div>
					</div>
					
					{#if value !== undefined}
						<div class="text-right flex-shrink-0">
							<div class="m-0 leading-tight {compact ? 'text-lg font-semibold text-white' : 'text-2xl font-bold text-white'} {getStatusClass(status)}">
								{value}
							</div>
							{#if status !== 'neutral'}
								<div class="flex items-center justify-end gap-1 mt-1">
									<span class="inline-block w-2 h-2 rounded-full {getStatusDotClass(status)}" aria-hidden="true"></span>
									<span class="text-xs font-medium uppercase tracking-wide leading-tight {getStatusClass(status)}">
										{status.toUpperCase()}
									</span>
								</div>
							{/if}
						</div>
					{/if}
				</header>
			{/if}
			
			<div class="flex-1">
				{#if loading}
					<div class="flex items-center justify-center {compact ? 'py-6' : 'py-8'}">
						<div class="w-5 h-5 border-2 border-gray-700 border-t-teal-500 rounded-full animate-spin" aria-hidden="true"></div>
						<span class="sr-only">Loading content...</span>
					</div>
				{:else if children}
					{@render children()}
				{/if}
			</div>
		</div>
	</button>
{:else}
	<div 
		class={panelClasses}
		role="region"
		aria-label={ariaLabel || title}
	>
		<div class={compact ? 'p-4' : 'p-6'}>
			{#if title || icon || value !== undefined}
				<header class="flex items-start justify-between gap-4 {compact ? 'mb-4' : 'mb-6'}">
					<div class="flex items-start {compact ? 'gap-2' : 'gap-3'} flex-1 min-w-0">
						{#if icon}
							{@const IconComponent = icon}
							<div class="flex-shrink-0 mt-1">
								<IconComponent 
									size={compact ? 18 : 20} 
									class={getStatusClass(status)}
									aria-hidden="true"
								/>
							</div>
						{/if}
						<div class="flex-1 min-w-0">
							{#if title}
								<h3 class="m-0 leading-tight {compact ? 'text-base font-normal text-gray-300' : 'text-lg font-medium text-white'}">
									{title}
								</h3>
							{/if}
							{#if subtitle}
								<p class="mt-1 mb-0 leading-normal text-xs font-normal text-gray-500">
									{subtitle}
								</p>
							{/if}
						</div>
					</div>
					
					{#if value !== undefined}
						<div class="text-right flex-shrink-0">
							<div class="m-0 leading-tight {compact ? 'text-lg font-semibold text-white' : 'text-2xl font-bold text-white'} {getStatusClass(status)}">
								{value}
							</div>
							{#if status !== 'neutral'}
								<div class="flex items-center justify-end gap-1 mt-1">
									<span class="inline-block w-2 h-2 rounded-full {getStatusDotClass(status)}" aria-hidden="true"></span>
									<span class="text-xs font-medium uppercase tracking-wide leading-tight {getStatusClass(status)}">
										{status.toUpperCase()}
									</span>
								</div>
							{/if}
						</div>
					{/if}
				</header>
			{/if}
			
			<div class="flex-1">
				{#if loading}
					<div class="flex items-center justify-center {compact ? 'py-6' : 'py-8'}">
						<div class="w-5 h-5 border-2 border-gray-700 border-t-teal-500 rounded-full animate-spin" aria-hidden="true"></div>
						<span class="sr-only">Loading content...</span>
					</div>
				{:else if children}
					{@render children()}
				{/if}
			</div>
		</div>
	</div>
{/if}
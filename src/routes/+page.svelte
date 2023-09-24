<script lang="ts">
	import { createCombobox, createSelect, createTagsInput, melt } from '@melt-ui/svelte';
	import { Command, Search, X as Close, Check } from 'lucide-svelte';
	import { flip } from 'svelte/animate';
	import { backOut, cubicOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';
	import type { Movie } from '$lib/index';
	const {
		elements: { menu, input, option, label },
		states: { open, inputValue, touchedInput }
	} = createCombobox({
		forceVisible: true
	});

	const {
		elements: { root, tag, deleteTrigger },
		states: { tags }
	} = createTagsInput({
		defaultTags: [
			{
				id: 'add',
				value: 'add'
			}
		],
		add(tag) {
			return { id: tag, value: tag };
		},

		remove: async (tag) => {
			selected.set($selected?.filter((select) => select.value !== tag.id) ?? []);

			return true;
		}
	});

	const options = ['Title', 'Genre', 'Director', 'Actor', 'Language', 'Country', 'Description'];

	const {
		elements: { trigger: selectTrigger, menu: selectMenu, option: selectOption },
		states: { selected, open: selectOpen },
		helpers: { isSelected },
		options: { positioning: selectPositioning }
	} = createSelect<string, true>({
		forceVisible: true,
		positioning: {
			placement: 'bottom-start',
			overlap: true,
			gutter: 8
		},
		multiple: true,
		onSelectedChange: ({ curr, next }) => {
			if ((curr?.length ?? 0) > (next?.length ?? 0)) return next;

			const newTags =
				next?.map((item) => {
					return { id: item.value, value: item.value };
				}) ?? [];

			tags.set(
				newTags.concat({
					id: 'add',
					value: 'add'
				})
			);

			return next;
		}
	});

	let dropdown: HTMLDivElement;

	$: {
		if (dropdown) {
			console.log(dropdown);

			$selectPositioning = {
				placement: 'bottom-start',
				overflowPadding: 24,
				flip: false,
				gutter: 8,
				boundary: dropdown
			};
		}
	}

	let searchResult: Movie[] = [];

	let debounceTimer: ReturnType<typeof setTimeout>;

	const debounce = (callback: () => void) => {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(callback, 500);
	};

	$: {
		if ($touchedInput) {
			debounce(async () => {
				const res = await fetch('/', {
					method: 'POST',
					body: JSON.stringify({
						query: $inputValue,
						tags: $selected?.map((item) => item.value) ?? []
					})
				}).then((res) => res.json());

				searchResult = res;
			});
		} else {
			searchResult = [];
		}
	}

	const colors = {
		black: '#515151',
		blue: '#4e8fce',
		grey: '#ebebeb'
	};
</script>

<div class="wrapper">
	<div class="searchbox-container">
		<input type="text" use:melt={$input} class:open={$open} placeholder="Search..." />
		<div class="icons left">
			<Search color={colors.black} />
		</div>
		<div class="icons right">
			{#if $open}
				<div class="key">
					<Close color={colors.black} size={16} />
				</div>
			{:else}
				<div class="key">
					<Command color={colors.black} size={16} />
				</div>
				<div class="key">K</div>
			{/if}
		</div>
	</div>
	{#if $open}
		<div
			id="dropdown"
			class="dropdown"
			bind:this={dropdown}
			use:melt={$menu}
			transition:fly={{ duration: 150, y: -5 }}
		>
			<div class="filters">
				<p>Searching For</p>
				<div class="tags" use:melt={$root}>
					{#each $tags as t (t.id)}
						<div
							class="animate"
							transition:fade={{ duration: 150, easing: cubicOut }}
							animate:flip={{ duration: 300, easing: backOut }}
						>
							{#if t.id === 'add'}
								<button class="add-filter" use:melt={$selectTrigger} class:active={$selectOpen}>
									<div class="inside-border">Add New</div>
								</button>
							{:else}
								<div class="tag" use:melt={$tag(t)}>
									<p>{t.value}</p>
									<button use:melt={$deleteTrigger(t)}>
										<Close size={16} />
									</button>
								</div>
							{/if}
						</div>
					{/each}

					{#if $selectOpen}
						<div
							class="select-dropdown"
							use:melt={$selectMenu}
							transition:fly={{ duration: 150, y: -5 }}
						>
							<div class="select-header"><p>Add Filter</p></div>
							<div class="select-options">
								{#each options as o}
									<div class="select-option" use:melt={$selectOption({ value: o, label: o })}>
										<div class="checkbox" class:selected={$isSelected(o)}>
											{#if $isSelected(o)}
												<div class="checkbox-checkmark" transition:fade={{ duration: 150 }}>
													<Check size={14} color={colors.blue} strokeWidth={3} />
												</div>
											{/if}
										</div>

										{o}
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
			<div class="results">
				{#each searchResult as result}
					<p>
						{result.title} - {result.release_date}
					</p>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	$grey: #ebebeb;
	$black: #515151;
	$blue: #4e8fce;

	:global(:root) {
		--grey: #{$grey};
		--black: #{$black};
		--blue: #{$blue};
	}

	.wrapper {
		display: grid;
		place-items: center;
		height: 100vh;
		width: 100vw;
	}

	.searchbox-container {
		position: relative;

		input {
			display: flex;
			height: 3.5rem;
			align-items: center;
			border-radius: 0.75rem;
			padding: 1rem 4rem;

			min-width: 600px;

			background-color: white;

			border: 1px solid $grey;
			box-shadow: 0 1px 1px rgba($color: $black, $alpha: 0.2);

			transition: box-shadow 0.3s ease;

			&::placeholder {
				opacity: 0.5;
			}

			&.open {
				border: 1px solid $blue;
				box-shadow: 0 0 0 4px rgba($color: $blue, $alpha: 0.2);
			}
		}

		.icons {
			position: absolute;
			top: 50%;
			translate: 0 -50%;
		}

		.left {
			display: grid;
			place-items: center;
			left: 1.5rem;
		}

		.right {
			right: 0.75rem;
			display: flex;
			column-gap: 0.5rem;
		}
	}

	.dropdown {
		z-index: 10;
		display: flex;
		flex-direction: column;
		border-radius: 1rem;
		border: 1px solid $grey;
		height: 30rem;

		background-color: white;

		box-shadow: 0 1px 1px rgba($color: $black, $alpha: 0.2);

		padding: 1.5rem;
		margin-top: 0.5rem;
	}

	.filters {
		display: flex;
		flex-direction: column;
		row-gap: 1rem;
		border-bottom: 1px solid $grey;
		padding-bottom: 1rem;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		column-gap: 0.5rem;
		row-gap: 0.5rem;
	}

	.tag {
		display: flex;
		align-items: center;
		column-gap: 0.5rem;
		padding: 0.5rem 1rem;
		background-color: rgba($color: $grey, $alpha: 0.2);
		border: 1px solid $grey;
		border-radius: 999px;

		box-shadow: 0 1px 1px rgba($color: $black, $alpha: 0.2);

		button {
			display: contents;
			cursor: pointer;
		}
	}

	.add-filter {
		display: flex;
		align-items: center;
		padding: 0.125rem;
		border-radius: 999px;

		cursor: pointer;

		background-color: white;

		border: 1px solid $grey;
		box-shadow: 0 1px 1px rgba($color: $black, $alpha: 0.2);

		transition: box-shadow 300ms ease, border-color 300ms ease, background-color 150ms ease;

		&:hover {
			background-color: rgba($color: $grey, $alpha: 0.2);
		}

		&.active {
			border: 1px solid transparent;
			box-shadow: 0 1px 1px transparent;
		}

		.inside-border {
			border: 1px solid transparent;
			border-radius: 999px;

			padding: 0.375rem 0.625rem;

			transition: box-shadow 300ms ease, border-color 300ms ease;
		}

		&.active .inside-border {
			border: 1px solid $blue;
			box-shadow: 0 0 0 4px rgba($color: $blue, $alpha: 0.2);
		}
	}

	.select-dropdown {
		z-index: 10;
		display: flex;
		flex-direction: column;
		max-height: 250px;
		overflow: hidden;
		width: 200px;
		border: 1px solid $grey;
		border-radius: 0.5rem;
		background-color: white;
		box-shadow: 0 1px 1px rgba($color: $black, $alpha: 0.2);
	}

	.select-header {
		border-bottom: 1px solid $grey;
		padding: 1rem;
	}

	.select-options {
		display: flex;
		flex-direction: column;
		overflow: auto;
		max-height: max-content;
		padding: 0.5rem;
	}

	.select-option {
		display: flex;
		align-items: center;
		column-gap: 0.5rem;
		padding: 0.5rem;
		border-radius: 0.5rem;

		transition: background-color 100ms ease;

		&:hover {
			background-color: rgba($color: $grey, $alpha: 0.5);
		}

		.checkbox {
			display: grid;
			place-items: center;
			height: 1.125rem;
			width: 1.125rem;
			border: 1px solid $grey;
			background-color: white;

			transition: box-shadow 150ms ease, border-color 150ms ease;
			border-radius: 0.25rem;

			box-shadow: 0 1px 1px rgba($color: $black, $alpha: 0.2);

			&.selected {
				border: 1px solid $blue;
				box-shadow: 0 0 0 2px rgba($color: $blue, $alpha: 0.2);
			}
		}

		.checkbox-checkmark {
			display: grid;
			place-items: center;
		}
	}

	.results {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		overflow: auto;
	}

	.key {
		display: grid;
		height: 2rem;
		width: 2rem;
		place-items: center;
		border-radius: 0.5rem;

		border: 1px solid $grey;
		box-shadow: 0 1px 1px rgba($color: $black, $alpha: 0.2);
	}
</style>

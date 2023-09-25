<script lang="ts">
	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import { Bookmark, ExternalLink, Link, MoreVertical, Trash } from 'lucide-svelte';
	import { fly } from 'svelte/transition';

	const {
		elements: { trigger, menu, item, separator, arrow },
		builders: { createSubmenu, createMenuRadioGroup, createCheckboxItem },
		states: { open }
	} = createDropdownMenu({
		forceVisible: true,
		positioning: {
			placement: 'bottom-end',
			overlap: true,
			gutter: 8
		}
	});

	const colors = {
		black: '#515151',
		blue: '#4e8fce',
		grey: '#ebebeb'
	};
</script>

<button
	type="button"
	class="trigger"
	class:active={$open}
	use:melt={$trigger}
	aria-label="Update dimensions"
>
	<MoreVertical size={20} color={colors.black} />
</button>

{#if $open}
	<div class="menu" use:melt={$menu} transition:fly={{ duration: 150, y: -5 }}>
		<div class="item" use:melt={$item}>
			<Link color={colors.black} size={16} />
			<p>Copy Link</p>
		</div>
		<div class="item" use:melt={$item}>
			<Bookmark color={colors.black} size={16} />
			<p>Save Product</p>
		</div>
		<div class="item" use:melt={$item}>
			<ExternalLink color={colors.black} size={16} />
			<p>Go to Product</p>
		</div>
		<div class="item" use:melt={$item}>
			<Trash color={colors.black} size={16} />
			<p>Remove From List</p>
		</div>
	</div>
{/if}

<style lang="scss">
	$grey: #ebebeb;
	$black: #515151;
	$blue: #4e8fce;

	.trigger {
		display: grid;
		place-items: center;
		padding: 0.125rem;

		background-color: white;
		border-radius: 999px;

		cursor: pointer;

		border: 1px solid transparent;

		transition: background-color 150ms ease-in-out, box-shadow 150ms ease-in-out;

		&:hover {
			border: 1px solid $grey;
		}

		&.active {
			border: 1px solid $grey;
			box-shadow: 0 1px 1px rgba($color: $black, $alpha: 0.2);
		}
	}

	.menu {
		display: flex;
		flex-direction: column;
		row-gap: 0.25rem;

		border: 1px solid $grey;
		background-color: white;
		box-shadow: 0 5px 5px 0 rgba($black, 0.2);
		border-radius: 0.5rem;

		padding: 0.5rem;
	}

	.item {
		display: flex;
		align-items: center;
		column-gap: 0.75rem;
		padding: 0.5rem 0.75rem;

		border-radius: 0.5rem;

		&:hover {
			background-color: rgba($color: $grey, $alpha: 0.5);
		}
	}

	.content {
		top: 50%;
		bottom: 50%;

		translate: -50% -50%;
	}
</style>

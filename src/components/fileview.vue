<template>
	<ul>
		<li :class="'dirs' + (dir.ignored ? ' ignored' : '')" v-for="dir in files.subdirs">
			<details>
				<summary>
					<img src="/svgs/folder.svg">
					{{ dir.name.split('/').pop() }}
				</summary>
				<fileview :files="dir"></fileview>
			</details>
		</li>
		<li @click="OpenFile(files.name + '/' + file.name)" :class="'files' + (file.ignored ? ' ignored' : '')"
			v-for="file in files.files">
			<img src="/svgs/file.svg">
			{{ file.name }}
		</li>
	</ul>
</template>

<script setup lang="ts">
import { Dirs, OpenFile } from '../modules/files/files';

defineProps<{
	files: Dirs
}>()
</script>

<style scoped>
img {
	width: 1.5ch;
}

ul {
	list-style: none;
	padding: 0;
	margin: 0;
	margin-left: 20px;

	li {
		text-wrap: nowrap;
		padding-left: 4px;
		user-select: none;
		-webkit-user-select: none;
		cursor: pointer;
		margin: 2px 0;
	}

	.dirs {
		color: var(--sidebar_dirs);

		&.ignored {
			color: grey;
		}
	}

	.files {
		color: var(--sidebar_files);
		margin-left: 19px;
		border-radius: 5px;
		transition: 200ms background linear;

		&.ignored {
			color: grey;
		}

		&:hover {
			background: var(--sidebar_file_background);
		}
	}
}

details {
	summary {
		list-style: none;
		border-radius: 5px;
		transition: 200ms background linear;

		&:hover {
			background: var(--sidebar_file_background);
		}

		&::-webkit-details-marker {
			height: 8px;
			width: 8px;
			color: white;
			padding-left: 5px;
		}

	}
}
</style>

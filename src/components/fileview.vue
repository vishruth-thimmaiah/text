<template>
	<ul>
		<li class="dirs" v-for="dir in files.subdirs">
			<details>
				<summary>
					<img src="/svgs/folder.svg">
					{{ dir.name.split('/').pop() }}
				</summary>
				<fileview :files="dir"></fileview>
			</details>
		</li>
		<li @click="open_file(files.name + '/' + file.name)" class="files" v-for="file in files.files">
			<img src="/svgs/file.svg">
			{{ file.name }}
		</li>
	</ul>
</template>

<script setup lang="ts">
import { Dirs } from '../modules/files/files';
import { open_file } from '../modules/files/files';

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
		color: lightblue;
	}

	.files {
		color: lightcyan;
		margin-left: 19px;
		border-radius: 5px;
		transition: 200ms background linear;

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

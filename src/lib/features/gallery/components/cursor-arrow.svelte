<script lang="ts">
	let { colorValue } = $props<{ colorValue: string }>();
</script>

<svg
	width="20"
	height="24"
	viewBox="0 0 20 24"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true"
>
	<!-- Classic pointer arrow: tip at (0,0), body extends down-right -->
	<path
		d="M2 2 L2 18 L6.5 13.5 L10.5 21 L13 20 L9 13 L15.5 13 Z"
		fill={colorValue}
		stroke="white"
		stroke-width="1.5"
		stroke-linejoin="round"
		stroke-linecap="round"
	/>
</svg>

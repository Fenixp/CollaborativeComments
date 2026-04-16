import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	build: {
		chunkSizeWarningLimit: 3500,
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (!id.includes('node_modules')) {
						return;
					}

					const packagePath = id.split('node_modules/')[1];

					if (!packagePath) {
						return;
					}

					const segments = packagePath.split('/');
					const packageName = segments[0]?.startsWith('@') ? `${segments[0]}-${segments[1]}` : segments[0];

					if (!packageName || packageName === 'devalue') {
						return;
					}

					return `vendor-${packageName.replace('@', '')}`;
				}
			}
		}
	}
});

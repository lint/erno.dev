import { defineConfig } from "vite";
import viteReact from '@vitejs/plugin-react'

// https://github.com/tabler/tabler-icons/issues/1233#issuecomment-2428245119
export default defineConfig({
    plugins: [viteReact()],
    resolve: {
        alias: {
            // /esm/icons/index.mjs only exports the icons statically, so no separate chunks are created
            '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
        },
    },
})
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

const removeCrossoriginPlugin = () => {
    return {
        name: 'no-attribute-crossorigin',
        transformIndexHtml(html: string) {
            return html.replace(/ crossorigin/g, '');
        }
    }
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), removeCrossoriginPlugin()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "react-native": path.resolve(__dirname, "./src/utils/mocks/react-native.ts"),
            "react-native-sim-cards-manager": path.resolve(__dirname, "./src/utils/mocks/sim-cards-manager.ts"),
            "react-native-device-info": path.resolve(__dirname, "./src/utils/mocks/sim-cards-manager.ts"),
            "@react-native-community/netinfo": path.resolve(__dirname, "./src/utils/mocks/netinfo.ts"),
        },
    },
})

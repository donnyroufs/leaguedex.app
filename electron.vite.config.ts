import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
// @ts-ignore dont care
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@contracts': resolve('src/contracts/index.ts'),
        '@hexagon': resolve('src/main/hexagon')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@contracts': resolve('src/contracts/index.ts'),
        '@hexagon': resolve('src/main/hexagon')
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@contracts': resolve('src/contracts/index.ts'),
        '@hexagon': resolve('src/main/hexagon')
      }
    },
    plugins: [react(), tailwindcss()]
  }
})

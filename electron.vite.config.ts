import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
// @ts-ignore dont care
import tailwindcss from '@tailwindcss/vite'
import obfuscator from 'vite-plugin-javascript-obfuscator'

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin(),
      obfuscator({
        options: {
          // Strong obfuscation for main process
          compact: true,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.75,
          deadCodeInjection: true,
          deadCodeInjectionThreshold: 0.4,
          debugProtection: true, // Set to true for extra protection
          debugProtectionInterval: 0,
          disableConsoleOutput: true,
          identifierNamesGenerator: 'hexadecimal',
          log: false,
          numbersToExpressions: true,
          renameGlobals: false,
          selfDefending: true,
          simplify: true,
          splitStrings: true,
          splitStringsChunkLength: 10,
          stringArray: true,
          stringArrayCallsTransform: true,
          stringArrayEncoding: ['base64'],
          stringArrayIndexShift: true,
          stringArrayRotate: true,
          stringArrayShuffle: true,
          stringArrayWrappersCount: 2,
          stringArrayWrappersChainedCalls: true,
          stringArrayWrappersParametersMaxCount: 4,
          stringArrayWrappersType: 'function',
          stringArrayThreshold: 0.9,
          transformObjectKeys: true,
          unicodeEscapeSequence: false
        }
      })
    ],
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

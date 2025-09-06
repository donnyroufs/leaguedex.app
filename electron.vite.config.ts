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
          // Safer obfuscation for Electron main process
          compact: true,
          controlFlowFlattening: false, // Can break IPC
          deadCodeInjection: true, // Can break entry points,
          deadCodeInjectionThreshold: 0.3,
          debugProtection: false, // Breaks Electron debugging
          disableConsoleOutput: false, // Needed for Electron logs
          identifierNamesGenerator: 'hexadecimal',
          log: false,
          numbersToExpressions: true,
          renameGlobals: false,
          selfDefending: false, // Can break process management
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
    plugins: [
      externalizeDepsPlugin(),
      // Light obfuscation for preload
      obfuscator({
        options: {
          compact: true,
          identifierNamesGenerator: 'hexadecimal',
          log: false,
          stringArray: true,
          stringArrayThreshold: 0.9,
          transformObjectKeys: true
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

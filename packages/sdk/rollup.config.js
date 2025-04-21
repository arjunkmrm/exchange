import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true,
    },
  ],
  plugins: [
    resolve({
      extensions: ['.js', '.ts'],
    }),
    commonjs({
      ignoreGlobal: true,
      requireReturnsDefault: 'auto'
    }),
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      outputToFilesystem: true,
    }),
    terser(),
  ],
  onwarn(warning, warn) {
    if (warning.code === 'THIS_IS_UNDEFINED') return;
    warn(warning);
  }
};
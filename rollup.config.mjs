import typescript from "@rollup/plugin-typescript";

export default {
  input: './code.ts',
  output: {
    dir: 'widget'
  },
  context: 'this',
  plugins: [typescript()]
}
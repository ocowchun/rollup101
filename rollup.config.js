import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';

export default {
	entry: 'src/main.js',
	format: 'cjs',
	plugins: [
		resolve({
			jsnext: true,
			main: true,
			browser: false,
		}),
		commonjs(),
		babel({
			exclude: 'node_modules/**',
		}), json()
	],
	dest: 'bundle.js' // equivalent to --output
};
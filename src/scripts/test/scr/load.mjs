//require( "@babel/register")( {plugins: ['babel-plugin-rewire']});
//import * as Imp from "./bsc_stake.js"
//import Imp from "./bsc_stake.js"
//import * as O_BABEL from "../node_modules/@babel/core"
//import * as O_BABEL from "@babel/core"
//O_BABEL.loadOptions( {presets: [["@babel/preset-env", {targets: {node: "current"}}]], 
//										plugins: ["babel-plugin-rewire"]});
/*const S = import.meta.url;	
const O_OPTS = O_BABEL.loadOptions( {cwd: S.slice( 'file://'.length, S.lastIndexOf( '/')), 
											rootMode: "upward-optional", 
											presets: [["@babel/preset-env", {targets: {node: "current"}}]], 
											plugins: ["babel-plugin-rewire"]});
*//*											plugins: [["babel-plugin-rewire", {
																			root: S.slice( 'file://'.length, S.lastIndexOf( '/')), 
																			rootMode: "upward-optional"}]]});
*//*import {createRequire} from 'module';
const F_REQUIRE = createRequire( import.meta.url);
F_REQUIRE( '@babel/register')( {presets: ["@babel/preset-es2015"], 
																	plugins: ['babel-plugin-rewire']});
const O_ = F_REQUIRE( '@babel/core');
F_REQUIRE( 'babel-plugin-cache');
/**/
/*import F from '@babel/register'
F( {plugins: ['babel-plugin-rewire']});
*/
//import {runLoaders} from 'loader-runner'
import FS from 'fs';
import MOD from 'module';

let o_m = null;

async function o_load()	{
/*	const S = import.meta.url;
	const O_OPTS = {cwd: S.slice( 'file://'.length, S.lastIndexOf( '/')), 
											rootMode: "upward-optional", 
											presets: [["@babel/preset-env", {targets: {node: "current"}}]], 
											plugins: ["babel-plugin-rewire"]};
*/	let o = null;
//	await (async () => {o = await import( `./bsc_stake.js?update=${Date.now()}`)})();
//	await (async () => {o = await import( `./bsc_stake.js`)})();
//	await (async () => {o = await import( 
//												`babel-loader?${ JSON.stringify( O_OPTS)}!./bsc_stake.js`)})();
//	await (async () => {o = await runLoaders( {
	let s_src = FS.readFileSync( './scr/bsc_stake.js').toString();
let s = s_src.replace( /(^import .*govPoolABI.*').*'/m, 
														'$1data:text/javascript,export const govPoolABI = "dummy"\'');
	let o_src = Buffer.from( s_src.replace( /(^import .*govPoolABI.*').*'/m, 
										'$1data:text/javascript,export const govPoolABI = "dummy"\'').replace( 
										/^const [^\s]+ =/gm, 'export $&'));
//	await (async () => {o = await import( 'data:text/javascript,export const X = 2;')})();
//	await (async () => {o = await import( 'data:text/javascript,console.log( "hi")')})();
//	await (async () => {o = await import( 'data:text/javascript;charset=utf-8,' + 
//																													encodeURIComponent( s_src)})();
	await (async () => {o = await import( 'data:text/javascript;base64,' + 
																													o_src.toString( 'base64'))})();
//	const O_MOD = new 
debugger;
	return o;
}

const O = o_load();

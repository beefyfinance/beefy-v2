var __dsPreview = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // <define:import.meta.env>
  var init_define_import_meta_env = __esm({
    "<define:import.meta.env>"() {
    }
  });

  // ds-raw:__ds_raw__
  var require_ds_raw = __commonJS({
    "ds-raw:__ds_raw__"(exports, module) {
      init_define_import_meta_env();
      module.exports = window.BeefyV2;
    }
  });

  // shim:react-shim
  var require_react_shim = __commonJS({
    "shim:react-shim"(exports, module) {
      init_define_import_meta_env();
      var R = window.React;
      function np(p, k) {
        var o = {};
        for (var x in p) if (x !== "children") o[x] = p[x];
        if (k !== void 0) o.key = k;
        return o;
      }
      function jsx2(t, p, k) {
        var c = p && p.children;
        return c === void 0 ? R.createElement(t, np(p, k)) : R.createElement(t, np(p, k), c);
      }
      function jsxs2(t, p, k) {
        return R.createElement.apply(R, [t, np(p, k)].concat(p.children));
      }
      module.exports = R;
      module.exports.jsx = jsx2;
      module.exports.jsxs = jsxs2;
      module.exports.jsxDEV = function(t, p, k, s) {
        return (s ? jsxs2 : jsx2)(t, p, k);
      };
      module.exports.Fragment = R.Fragment;
    }
  });

  // .design-sync/previews/LinkIcon.tsx
  var LinkIcon_exports = {};
  __export(LinkIcon_exports, {
    Row: () => Row,
    SvgLogo: () => SvgLogo
  });
  init_define_import_meta_env();

  // ds-shim:ds
  var ds_exports = {};
  __export(ds_exports, {
    default: () => ds_default
  });
  init_define_import_meta_env();
  __reExport(ds_exports, __toESM(require_ds_raw()));
  var g = window.BeefyV2;
  var ds_default = "default" in g ? g.default : g;

  // .design-sync/previews/LinkIcon.tsx
  var import_jsx_runtime = __toESM(require_react_shim(), 1);
  var DiscordLogo = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { viewBox: "0 0 24 24", fill: "currentColor", ...props, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M20.3 4.5A19 19 0 0 0 15.6 3l-.24.44c1.6.4 2.34.96 3.14 1.64a11 11 0 0 0-3.9-1.24 14.3 14.3 0 0 0-5.2 0A11 11 0 0 0 5.5 5.1c.8-.68 1.7-1.3 3.14-1.64L8.4 3a19 19 0 0 0-4.7 1.5C1.2 8.2.5 11.9.8 15.5a19 19 0 0 0 5.8 2.9l1.2-1.9c-.7-.26-1.4-.6-2-1l.5-.36a13.6 13.6 0 0 0 11.4 0l.5.36c-.6.4-1.3.74-2 1l1.2 1.9a19 19 0 0 0 5.8-2.9c.4-4.2-.7-7.9-2.9-11zM8.5 13.6c-1.1 0-2-1-2-2.3s.9-2.3 2-2.3 2 1 2 2.3-.9 2.3-2 2.3zm7 0c-1.1 0-2-1-2-2.3s.9-2.3 2-2.3 2 1 2 2.3-.9 2.3-2 2.3z" }) });
  var SvgLogo = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.LinkIcon, { href: "https://discord.gg/beefy", alt: "Discord", logo: DiscordLogo });
  var TelegramLogo = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { viewBox: "0 0 24 24", fill: "currentColor", ...props, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M21.9 4.3 18.6 20c-.25 1.1-.9 1.37-1.83.85l-5.05-3.72-2.44 2.35c-.27.27-.5.5-1.02.5l.36-5.14L18 6.3c.4-.36-.09-.56-.63-.2L6.4 13.06 1.4 11.5c-1.08-.34-1.1-1.08.23-1.6L20.5 2.62c.9-.33 1.7.22 1.4 1.68z" }) });
  var Row = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 16, alignItems: "center" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.LinkIcon, { href: "https://discord.gg/beefy", alt: "Discord", logo: DiscordLogo }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.LinkIcon, { href: "https://t.me/beefyfinance", alt: "Telegram", logo: TelegramLogo })
  ] });
  return __toCommonJS(LinkIcon_exports);
})();

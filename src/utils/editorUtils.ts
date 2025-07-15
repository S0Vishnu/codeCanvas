export const TABS = ["html", "css", "javascript"];

export const DEFAULT_CODE = {
  html: `<!DOCTYPE html>\n<html>\n  <head>\n    <title>Live Editor</title>\n  </head>\n  <body>\n    <h1>Hello, world!</h1>\n  </body>\n</html>`,
  css: `body {\n  font-family: sans-serif;\n  background: #181818;\n  color: #fff;\n}\nh1 {\n  color: #4fc3f7;\n}`,
  javascript: `console.log('Welcome to the Live Editor!');`,
};

export function buildPreviewHtml(html: string, css: string, js: string) {
  return `<!DOCTYPE html>\n<html>\n<head>\n<style>${css}</style>\n</head>\n<body>\n${html}\n<script>\nwindow.onerror = function(msg, url, line, col, error) {\n  window.parent.postMessage({ type: 'error', message: msg }, '*');\n};\n(function() {\n  const origLog = console.log, origWarn = console.warn, origError = console.error;
  ['log','warn','error'].forEach(type => {
    const orig = console[type];
    console[type] = function(...args) {
      window.parent.postMessage({ type, message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
      orig.apply(console, args);
    };
  });
})();\n${js}\n<\/script>\n</body>\n</html>`;
} 
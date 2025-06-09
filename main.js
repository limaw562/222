const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { URL } = require('url');

const app = express();

// 移除请求头数组，保留请求端隐私头处理
const REQ_HEADERS = [
  'x-forwarded-for', 'x-real-ip', 'cf-connecting-ip', 'cf-ipcountry', 'cf-worker',
  'true-client-ip', 'forwarded', 'via', 'x-cluster-client-ip', 'x-forwarded-host',
  'x-forwarded-proto', 'x-originating-ip', 'x-remote-ip', 'x-remote-addr',
  'x-envoy-external-address', 'x-amzn-trace-id', 'x-request-id', 'x-correlation-id',
];

// 创建可复用的代理中间件，动态路由和路径重写
const proxy = createProxyMiddleware({
  changeOrigin: true,
  router: (req) => {
    const targetUrl = req.originalUrl.substring(1);
    const urlObj = new URL(targetUrl);
    return `${urlObj.protocol}//${urlObj.host}`;
  },
  pathRewrite: (path, req) => {
    const targetUrl = req.originalUrl.substring(1);
    const urlObj = new URL(targetUrl);
    return urlObj.pathname + urlObj.search;
  },
  onProxyReq: (proxyReq) => {
    REQ_HEADERS.forEach(h => proxyReq.removeHeader(h));
  }
});

// 主中间件：校验 URL 并代理
app.use('/', (req, res, next) => {
  const targetUrl = req.originalUrl.substring(1);
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    return res.status(400).send('你好，我是银贼，这里是我的极简风格个人主页！');
  }
  return proxy(req, res, next);
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`你好，我是银贼`);
});

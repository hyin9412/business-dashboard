# business-dashboard

商品经营力首页与详情页演示项目，基于 `React + TypeScript + Vite` 构建。

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## GitHub Pages

- 仓库名：`business-dashboard`
- Pages 路径：`/business-dashboard/`
- 部署方式：本地构建后，手动发布 `dist` 到 `gh-pages` 分支

### 手动发布

```bash
npm run deploy:pages
```

这条命令会：

- 先在本地执行 `npm run build`
- 再把 `dist` 内容发布到仓库的 `gh-pages` 分支
- 自动补 `404.html` 和 `.nojekyll`，方便 GitHub Pages 托管

发布完成后，可在以下地址访问：

- [https://hyin9412.github.io/business-dashboard/](https://hyin9412.github.io/business-dashboard/)

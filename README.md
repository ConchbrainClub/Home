# ConchBrainClub.github.io
海螺大脑俱乐部官方网站

此网站目前为静态网页，部署在GithubPages，前端开发完成后会迁移到服务器

> 网页属于spa应用，使用vanillajs

前端的一些依赖由cdn提供商提供

如果想使用本地依赖（部署在服务器）需要安装 npm（windows平台下nodejs包含了npm），接下来在根目录执行

```bash
npm install
```
并将 Index.html > head 中的

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css"/>
<!-- <link rel="stylesheet" href="/node_modules/bootstrap/dist/css/bootstrap.min.css"/> -->
<script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
<!-- <script src="/node_modules/jquery/dist/jquery.min.js"></script> -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/js/bootstrap.min.js"></script>
<!-- <script src="/node_modules/bootstrap/dist/js/bootstrap.min.js"></script> -->
```

改为

```html
<link rel="stylesheet" href="/node_modules/bootstrap/dist/css/bootstrap.min.css"/>
<script src="/node_modules/jquery/dist/jquery.min.js"></script>
<script src="/node_modules/bootstrap/dist/js/bootstrap.min.js"></script>
```

## 运行
需要部署在服务器才能正常运行（不部署的话ajax请求本地文件存在跨域问题）

推荐使用 vscode + IIS Express + IIS Express扩展（run the current folder as a website in IIS Express）
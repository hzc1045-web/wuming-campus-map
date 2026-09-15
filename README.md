# 武鸣校区校园地图

一个可旋转、搜索和切换视角的校园地图示意项目，采用 Three.js、原生 HTML/CSS/JavaScript 和 Node.js。源码按 **MIT** 许可证开放，可修改和再分发。

![鸟瞰预览](docs/preview.png)

## 已有功能

- 鸟瞰 3D、正上方、二维平面图及 Google 在线卫星对照入口。
- 34 个地点、70 个建筑单体、1,900 株实例化林木。
- 地点搜索、分类筛选、位置服务列表、标签、巡游与缩放。
- 电脑和手机自适应，Three.js 随包提供。

## 快速运行

安装 [Node.js 20 或更新版本](https://nodejs.org/)，然后**完整解压**此文件夹。

Windows：双击根目录 **start.cmd**。它会打开地图；若默认端口被占用，会尝试后续端口。保持启动窗口开启，关闭窗口或按 Ctrl+C 停止服务。

其他系统，或使用命令行：

```sh
node server.cjs
```

浏览器打开终端显示的地址，默认是 http://127.0.0.1:8120/ 。也可使用 `npm start`；**不需要 npm install，不需要 API 密钥**。不要直接双击 public/index.html，浏览器模块需要本地 HTTP 服务。

需要换端口时，PowerShell 示例：

```powershell
$env:CAMPUS_PORT = '8121'
node server.cjs
```

macOS/Linux：

```sh
CAMPUS_PORT=8121 node server.cjs
```

## 项目结构

```text
wuming-campus-map/
  public/             网页、场景源码、布局示意及 Three.js
  scripts/start.cjs   打开浏览器的便携启动器
  test/               Node.js 内置测试
  docs/               预览、已知限制、验证说明
  server.cjs          本地服务器与 Google 连接检测
  start.cmd           Windows 双击入口
  LICENSE             项目 MIT 许可证
  THIRD_PARTY_NOTICES.md
```

## 检查与修改

```sh
npm run check
npm test
```

运行时仅使用 Node.js 内置模块，测试也不需要安装依赖。场景与地点配置在 public/app.js，界面在 public/index.html 和 public/style.css。贡献说明见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## Google 地图与准确性

**本包不是卫星实景模型。** Google 对照入口已接入，但制作环境无法连接 Google，因此实际影像加载及模型与影像的配准尚未完成。学校布局、楼高及地形仍为示意，不用于精确导航。完整限制见 [docs/LIMITATIONS.md](docs/LIMITATIONS.md)。

原始参考照片和应用截图未纳入开源包，布局对照使用本项目程序绘制的 SVG。Three.js 的 MIT 许可证已保留；Google 在线内容不属于本项目许可证，详见 [第三方声明](THIRD_PARTY_NOTICES.md)。

## 分享源码

可以直接分享此 ZIP，或将解压目录内容提交到你自己的 Git 仓库。根目录已经包含 README、许可证和忽略规则；本包不预设 GitHub 账号或仓库地址。

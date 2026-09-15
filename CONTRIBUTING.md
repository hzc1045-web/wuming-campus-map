# 参与改进

使用 Node.js 20 或更新版本。修改后运行 `npm run check` 和 `npm test`，再用浏览器检查电脑和手机布局。

地点和几何位于 public/app.js：X/Z 函数把示意图像素转换为场景坐标；area/rect/register 定义地点；architecture/courtyard 定义楼体；setView 定义视角。请为新增地点记录来源与核验状态，未经核实的名称和高度保持示意标注。

界面为 public/index.html 和 public/style.css。服务端为 server.cjs，测试为 test/server.test.cjs。Three.js 文件在 public/vendor/，升级时同步版本说明与许可证。

提交修改时说明用户可见变化、验证方法和仍存在的限制。请勿提交本机绝对路径、账号信息、API 密钥或未获分发授权的照片。贡献按项目 MIT 许可证提交。

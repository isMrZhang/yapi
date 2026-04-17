# Tasks
- [x] Task 1: 修复 sass-loader 和 Dart Sass 的废弃语法警告
  - [x] SubTask 1.1: 修改 `build/webpack.common.js`，在 `sass-loader` 选项中添加 `api: 'modern-compiler'` 和 `sassOptions: { silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin'] }` 配置。
  - [x] SubTask 1.2: 修改 `client/components/Loading/Loading.scss`，在文件顶部添加 `@use "sass:math";`，并将 `$quarter: ($loader-radius/2) + ($loader-radius/5.5);` 替换为使用 `math.div` 的形式以修复 slash 除法废弃警告。

- [x] Task 2: 修复 Webpack "export was not found" 的警告
  - [x] SubTask 2.1: 修改 `client/components/Postman/CheckCrossInstall.js`，将 `exports.initCrossRequest = function (fn) {` 更改为 `export const initCrossRequest = function (fn) {` 以符合 ES 模块规范。
  - [x] SubTask 2.2: 修改 `client/containers/Group/GroupList/GroupList.js`，移除对 `setGroupList` 的所有引用（包括 `import` 列表、`@connect` 映射和 `propTypes` 验证）。
  - [x] SubTask 2.3: 修改 `client/containers/Group/ProjectList/ProjectList.js`，移除对 `changeUpdateModal` 的所有引用（包括 `import` 列表、`@connect` 映射和 `propTypes` 验证）。
  - [x] SubTask 2.4: 修改 `client/containers/Project/Interface/InterfaceCol/InterfaceColMenu.js`，移除对 `fetchInterfaceCaseList` 的所有引用（包括 `import` 列表、`@connect` 映射和 `propTypes` 验证）。
  - [x] SubTask 2.5: 修改 `exts/yapi-plugin-advanced-mock/client.js`，将 `import AdvMock from './AdvMock'` 更改为 `const AdvMock = require('./AdvMock')`。
  - [x] SubTask 2.6: 修改 `exts/yapi-plugin-import-swagger/client.js`，将 `import run from './run'` 更改为 `const run = require('./run')`。

# Task Dependencies
无特殊依赖，Task 1 和 Task 2 可以同时并行处理。

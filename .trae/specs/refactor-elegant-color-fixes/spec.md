# Refactor Elegant Color Fixes Spec

## Why
此前为了修复“容器显示异常黑色背景”的问题，我们在 `GroupList.scss` 等局部文件中，直接将深色背景替换为了 `transparent` 或 `#fff`，并将文字颜色硬编码为 `#333`、`#999`。
这种做法虽然解决了表面的视觉问题，但破坏了 YApi 原有的 Sass/Less 主题变量体系（如 `$color-bg-dark`、`$color-white`）。作为前端专家，应该采用更优雅的方式：不仅要恢复这些语义化的颜色变量，还要从根本上解决系统深色模式（Dark Mode）导致的透明穿透问题，同时确保布局高度能够正常撑满，不出现“半截黑块”。

## What Changes
- 移除前期在 `.scss` 和 `.less` 中引入的硬编码颜色（如 `#333`, `#999`, `transparent`）。
- 恢复原有代码中的主题变量定义（如 `color: $color-white;`, `background-color: $color-bg-dark;`）。
- 在全局层级（如 `html`, `body` 或 `.router-main`）设置一个兜底的白色/浅灰色背景，防止透明层穿透到系统底层的深色画布。
- 修复因布局高度未撑满导致背景色截断的 CSS 问题（例如通过 `height: 100%`、`flex: 1` 或 `min-height` 让左侧边栏正常延伸到底部）。

## Impact
- Affected specs: UI Theming, CSS Maintainability
- Affected code: `client/styles/common.scss`, `client/containers/Group/GroupList/GroupList.scss` 等。

## ADDED Requirements
### Requirement: 优雅的主题颜色管理
The system SHALL maintain consistent UI theming by strictly using predefined SASS/LESS variables instead of hardcoded hex values.

#### Scenario: Success case
- **WHEN** developers style components
- **THEN** they use variables like `$color-bg-dark` or `$color-white`, and the UI renders correctly across OS light/dark modes due to a global base background color.
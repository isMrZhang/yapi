# UI Styling Fixes Spec

## Why
在某些浏览器或特定操作系统主题（如系统级别的暗色模式）下，如果网页的布局容器没有明确指定背景颜色，透明背景会导致原本预期为白色的区域显示为黑色（异常黑色背景）。这严重影响了 YApi 可视化管理平台的用户体验和视觉一致性。因此，需要系统性地排查全局样式文件并进行修复。

## What Changes
- 排查并修复全局布局容器（如左侧边栏、主内容区、Tab 面板）缺失的背景颜色。
- 排查并修复弹出层（Modal）、下拉菜单（Dropdown）等浮动组件可能存在的透明背景问题。
- 在修复过程中，尽可能统一使用项目中已定义的 Less/Scss 主题变量（如 `@component-background` 或 `#fff`），而不是随意的硬编码颜色。
- 对相关修改进行严格的代码评审，确保不破坏原有的布局和响应式设计。

## Impact
- Affected specs: 前端界面渲染 (UI Rendering)、用户体验 (UX)
- Affected code: `client/styles/*`, `client/containers/*`, `client/components/*` 等目录下的相关样式文件 (`.scss`, `.less`)。

## MODIFIED Requirements
### Requirement: UI 样式渲染规范
- **修改前**: 某些容器（如 `.left-menu` 等）未设置或注释了 `background` 属性，过度依赖浏览器的默认白色背景行为。
- **修改后**: 所有主要的视觉块状元素和层级组件必须显式声明背景色，优先使用项目规范的主题变量或基础色值，以确保跨端、跨浏览器渲染的高度一致性。
# Refactor Group List Sidebar Color Spec

## Why
目前在 `http://127.0.0.1:3000/group/11` 个人空间分组列表页面的左侧边栏，因为在最近的重构中错误地将背景色强制设置为了深色变量 `$color-bg-dark`（深黑色），这导致了与整个 YApi 项目其他页面（如项目接口页面的纯白侧边栏）的视觉规范严重脱节。同时，深色背景破坏了 Ant Design 默认浅色（light）主题下菜单的 Hover 和 Selected 交互效果，导致文字模糊、选中态诡异。

## What Changes
- 将左侧边栏外层容器 `.group-bar` 及子元素的背景色从深黑色（`$color-bg-dark`）恢复为纯白色（`#fff`）。
- 移除强加在文本上的 `$color-white` 和 `$color-white-secondary` 字体颜色变量，恢复为浅色背景下的标准深色文本。
- 移除 `.group-item:hover` 和 `.group-item.selected` 强行覆盖的深蓝色高亮样式，让 Ant Design 原生的浅蓝色选中态自然生效。
- 调整并清理 `.m-sider` 的背景覆盖，确保整个左侧边栏区域白底效果统一。

## Impact
- Affected specs: UI Theming, 个人空间 (Group) UI Rendering
- Affected code: `client/containers/Group/GroupList/GroupList.scss`, `client/containers/Group/Group.scss` 等。

## ADDED Requirements
### Requirement: 恢复侧边栏标准的浅色 UI 规范
The system SHALL display the Group list sidebar with a standard light theme (white background) consistent with the rest of the application's sidebars.

#### Scenario: Success case
- **WHEN** user visits the group list page (`/group/11`)
- **THEN** the left sidebar renders with a white background, dark text, and default Ant Design light-theme hover/selected effects, ensuring high legibility.
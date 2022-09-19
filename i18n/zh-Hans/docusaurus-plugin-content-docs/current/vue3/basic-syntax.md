---
sidebar_position: 1
description: Vue 3 基本语法
keywords: [piesdoc, vue3]
---

# 基本语法

学习 Vue 3 组件 (component) 的基本语法。

:::info

一定要试试这个超方便的线上 Vue 3 IDE — [Vue SFC Playground](https://sfc.vuejs.org/)！

:::

## 范例组件

下面是一个 Vue 3 单文件组件 (SFC) 搭配[组合式 API](https://vuejs.org/guide/introduction.html#composition-api) (Composition API) 的范例：

```html showLineNumbers
<template>
  <div>
    <h1>Hello, {{ name }}</h1>
    <input v-model="name">
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const name = ref('world')
</script>

<style scoped>
h1 {
  color: blue;
}
</style>
```

和 Vue 2 相似，Vue 3 的 SFC 是由三个标签组成 — `<template>`、`<script>` 和 `<style>`。

- 主要的差别是 `<script>` 标签中多了一个 `setup` 属性；这个属性只能和组合式API一起使用。
- TypeScript 在 Vue 3 中已有官方支援，我们只要在 `<script>` 标签中加上 `lang="ts"` 属性，就能开始用 TypeScript 撰写组件。
- [`<style>`](https://vuejs.org/api/sfc-spec.html#style) 标签依然是非必要的，[`scoped` 属性](https://vue-loader.vuejs.org/guide/scoped-css.html#scoped-css) 也还在。
- 模版语法 (template syntax) 和 Vue 2 一样，分别是双大括弧 `{{ }}`、`v-on` (缩写为 `@`) 和 `v-bind` (缩写为 `:`)。

:::info

Vue 3 有个 [在 CSS 里面使用 `v-bind`](https://vuejs.org/api/sfc-css-features.html#v-bind-in-css) 的新功能，他让我们能够在 `<style>` 里面使用动态值，这某些情况下满实用的。

:::

## `<script setup>`

什么是 `<scrtip setup>`？ 这个 `setup` 属性又有什么用处？

和选项式 API (Options API) 中的 `export default { ... }` 相似，`<script>` 中的 `setup` 属性是用来告诉 Vue 这个 `<script>` 区块里面的代码代表这个组件的定义。所有我们在选项式 API 里面能做到的事情，在 `<script setup>` 里面也都能做到。

此外，一个 SFC 里面**最多只能有一个** `<script setup>`，这个概念和我们无法在同个档案里面 `export default` 多次是一样的。在一个 SFC 里面，您可以有很多个 `<script>` 标签，但是这些标签里面只能有一个有 `setup` 属性。

## 定义组件

在 Vue 3 里面有很多方法可以用来定义组件，`<script setup>` 只是其中一个。选项式 API 依然能用，而且还加上了新的 `setup()` 选项。阅读[定义组件](./define-a-component)章节来了解更多细节。
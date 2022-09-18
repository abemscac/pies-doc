---
sidebar_position: 1
description: Vue 3 基本語法
keywords: [piesdoc, vue3]
---

# 基本語法

學習 Vue 3 元件 (component) 的基本語法。

:::info

一定要試試這個超方便的線上 Vue 3 IDE — [Vue SFC Playground](https://sfc.vuejs.org/)！

:::

## 範例元件

下面是一個 Vue 3 單文件元件 (SFC) 搭配[組合式 API](https://vuejs.org/guide/introduction.html#composition-api) (Composition API) 的範例：

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

和 Vue 2 相似，Vue 3 的 SFC 是由三個標籤組成 — `<template>`、`<script>` 和 `<style>`。

- 主要的差別是 `<script>` 標籤中多了一個 `setup` 屬性；這個屬性只能和組合式API一起使用。
- TypeScript 在 Vue 3 中已有官方支援，我們只要在 `<script>` 標籤中加上 `lang="ts"` 屬性，就能開始用 TypeScript 撰寫元件。
- [`<style>`](https://vuejs.org/api/sfc-spec.html#style) 標籤依然是非必要的，[`scoped` 屬性](https://vue-loader.vuejs.org/guide/scoped-css.html#scoped-css) 也還在。
- 模版語法 (template syntax) 和 Vue 2 一樣，分別是雙大括弧 `{{ }}`、`v-on` (縮寫為 `@`) 和 `v-bind` (縮寫為 `:`)。

:::info

Vue 3 有個 [在 CSS 裡面使用 `v-bind`](https://vuejs.org/api/sfc-css-features.html#v-bind-in-css) 的新功能，他讓我們能夠在 `<style>` 裡面使用動態值，這某些情況下滿實用的。

:::

## `<script setup>`

什麼是 `<scrtip setup>`？ 這個 `setup` 屬性又有什麼用處？

和選項式 API (Options API) 中的 `export default { ... }` 相似，`<script>` 中的 `setup` 屬性是用來告訴 Vue 這個 `<script>` 區塊裡面的程式碼代表這個元件的定義。所有我們在選項式 API 裡面能做到的事情，在 `<script setup>` 裡面也都能做到。

此外，一個 SFC 裡面**最多只能有一個** `<script setup>`，這個概念和我們無法在同個檔案裡面 `export default` 多次是一樣的。在一個 SFC 裡面，您可以有很多個 `<script>` 標籤，但是這些標籤裡面只能有一個有 `setup` 屬性。

## 定義元件

在 Vue 3 裡面有很多方法可以用來定義元件，`<script setup>` 只是其中一個。選項式 API 依然能用，而且還加上了新的 `setup()` 選項。閱讀[定義元件](./define-a-component)章節來了解更多細節。
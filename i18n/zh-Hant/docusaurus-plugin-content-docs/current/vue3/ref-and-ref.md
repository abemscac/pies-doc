---
title: Ref<T> 和 ref()
sidebar_position: 3
description: 說明 Vue 3 ref() 函式的功用
keywords: [piesdoc, vue3, ref]
---

# `Ref<T>` 和 `ref()`

這個章節也許是 Vue 3 最重要的一環！

:::info

如果您還沒有學過 TypeScript 或是物件導向設計，`<T>` 指的是 TypeScript 中的[泛型](https://www.typescriptlang.org/docs/handbook/2/generics.html)。

:::

## 什麼是 `Ref<T>`？

`Ref<T>` 是只有一個公開屬性 `value` 的**型別**。

簡單的 `Ref<T>` 介面如下：

```ts showLineNumbers
interface Ref<T> {
  value: T
}
```

一個 `Ref<T>` 只能存放**一個**任意型別的值，所以他可以是：

- `Ref<number>`
- `Ref<number[]>`
- `Ref<{ id: number, name: string }>`
- `Ref<Promise<() => void>>`
- ...任何你需要的型別！

## 什麼是 `ref()`？

`ref()` 是一個**函式**，只接收一個任意型別的參數；`ref()` 會把這個參數當做 `Ref<T>` 的 `value` 屬性值，然後回傳整個 `Ref<T>` 物件。

```ts showLineNumbers
import { ref } from 'vue'

const name = ref('hello')

console.log(name) // { value: 'hello' }
```

要修改 `Ref<T>` 的 `value`，我們只需要使用典型的作法即可：

```ts showLineNumbers
import { ref } from 'vue'

const name = ref('hello')
console.log(name.value) // 'hello'

// highlight-next-line
name.value = 'world'
console.log(name.value) // 'world'
```

任何型別的 `Ref<T>` 都遵守同樣的規則，例如：

```ts showLineNumbers
import { ref } from 'vue'

// 陣列
const fruits = ref(['apple', 'banana'])
console.log(fruits.value) // ['apple', 'banana']

// highlight-next-line
fruits.value[0] = 'cherry'
console.log(fruits.value) // ['cherry', 'banana']

// 物件
const user = ref({
  name: 'hello'
  age: 5,
})
console.log(user.value) // { name: 'hello', age: 5 }

// highlight-next-line
user.value.name = 'world'
console.log(user.value) // { name: 'world', age: 5 }
```

:::info

雖然 `ref()` 的回傳值看起來是一個長得像 `{ value: 'hello' }` 的簡單對象 (plain object，或稱 POJO)，事實上他不是！`ref()` 回傳的其實是一個叫做 `RefImpl` 的類別 (class) 實體 (instance)，而且這個類別只有一個公開屬性 `value`。所以從使用者的角度來看 (你和我，開發人員)，我們可以直接把 `RefImpl` 看做是 `Ref<T>`，因為他們有著相同的公開屬性。

此外，`ref()` 並不是盲目的把數值包成 `Ref<T>` 的結構而已，但是現在還不需要知道實際的邏輯。我們會在 [`ref()` 或 `reactive()`](./ref-or-reactive) 章節做更詳細的描述。
:::

很好，我們已經大致了解 `Ref<T>` 在 `<script>` 中運作的原理了。現在我們來看看 `Ref<T>` 如何在 `<template>` 中運作！

## `<template>` 中的 `Ref<T>`

在 Vue 2，我們可以使用三種不同的語法在 `<template>` 中存取 `<script>` 的變數 — 雙大括弧 `{{ }}`、`v-on` (縮寫為 `@`) 和 `v-bind` (縮寫為 `:`)。這三種語法在 Vue 3 中仍然存在，但是邏輯上有小小的不同。以這個元件為例：

```html showLineNumbers
<template>
  <!-- 這樣能正常運作嗎？ -->
  <!-- highlight-next-line -->
  <div>{{ name.value }}</div>
</template>

<script setup>
import { ref } from 'vue'

const name = ref('hello')
</script>
```

由於 `name` 是一個 `Ref<T>`，我們會很合理的認為 `<div>{{ name.value }}</div>` 最後會得到 `<div>hello</div>`。但是當這個元件被渲染 (render) 後，輸出的 HTML 卻是 `<div></div>`，沒有中間的 `hello` — 我們的 `hello` 到哪去了？

在 Vue 3 中，當我們嘗試從 `<template>` 存取 `Ref<T>` 型別的變數時，**有時候** (沒錯，有時候！) 他們會被自動解包。**解包** (unwrap 或是 [**unref**](https://vuejs.org/api/reactivity-utilities.html#unref)) 的意思是將 `value` 從 `Ref<T>` 中取出來。因此在某些情況下我們必須在 `<template>` 中省略 `Ref<T>` 後面的 `.value`，那麼「某些情況」指的是哪些情況呢？

規則很簡單：當該 `Ref<T>` 屬於 `<script setup>` 中的**頂層屬性**時，Vue 就會在 `<template>` 中將他自動解包；這個規則同樣適用於 v-on 和 v-bind。

所以在上方的例子中，如果我們想要在畫面上看見 `hello`，我們就必須寫 `{{ name }}` 而不是 `{{ name.value }}`，因為 `name` 屬於 `<script setup>` 中的頂層屬性。

```html showLineNumbers
<template>
  <!-- 這樣就能正常運作 -->
  <!-- highlight-next-line -->
  <div>{{ name }}</div>
</template>

<script setup>
import { ref } from 'vue'

const name = ref('hello')
</script>
```

我們再來看看一個自動解包的例子：

```html showLineNumbers
<template>
  <div>
    <!-- highlight-start -->
    <h1>A: {{ age.toFixed }}</h1>
    <h2>B: {{ user.age.toFixed }}</h2>
    <!-- highlight-end -->
  </div>
</template>

<script setup>
import { ref } from 'vue'

// highlight-next-line
const age = ref(5)

// highlight-start
const user = {
  age: age,
}
// highlight-end
</script>
```

這個元件所輸出的 HTML 會是這樣：

```html showLineNumbers
<div>
  <h1>A: function toFixed() { [native code] }</h1>
  <h2>B: </h2>
</div>
```

你知道為什麼會有這樣的差異嗎？

<details>
  <summary>這是因為... (在看解答之前請先想想！)</summary>

  - `age` 和 `user` 都是 `<script setup>` 中的頂層屬性。
  - 因為 `age` 在 `<script setup>` 中是一個頂層的 `Ref<T>`，他在 `<template>` 中會被自動解包，代表在 `<template>` 寫 `{{ age }}` 就會等於在 `<script setup>` 裡面寫 `age.value`，因此得到 `5`。
  - 在 JavaScript 中，`toFixed` 是數字原型 (prototype) 中的一個方法；既然 `5` 是一個數字，那麼 `5.toFixed` 就會得到該方法，因此在畫面上就顯示了 `function toFixed() { [native code] }`。
  - 雖然 `user.age` 和 `age` 在 `<script setup>` 的來源其實是同一個變數，但 `{{ user.age }}` 在 `<template>` 中**不會**被自動解包，因為 `user.age` 不是一個頂層屬性 — `user` 才是！
  - 既然 `user.age` 在 `<template>` 中沒有被自動解包，在 `<template>` 寫 `{{ user.age }}` 就會等於 `<script setup>` 中的 `user.age`，也就是 `Ref<T>`。
  - `Ref<T>` 裡面沒有 `toFixed` 這個屬性，因此 `{{ user.age.toFixed }}` 就會是 `undefined`，導致 `<h2>B: {{ undefined }}</h2>` 被渲染成 `<h2>B: </h2>`。

</details>

太棒了，現在你知道 `Ref<T>` 在 `<template>` 中是如何運作的了！這個知識在使用[組合式函數](./composables) (composable) 時尤其重要。若是不了解這些知識，我們的 `<template>` 最後就會出現一大堆本來可以被避免的 `.value`，造成程式碼的可讀性降低。

## `ComputedRef<T>` 也屬於 `Ref<T>`

`ComputedRef<T>` 是 [`computed()`](https://vuejs.org/api/reactivity-core.html#computed) 的 **回傳型別**。

`ComputedRef<T>` 繼承自 `Ref<T>`，所以他們運作的邏輯很相似 — `ComputedRef<T>` 也只有一個公開屬性 `value`，當他處於 `<script setup>` 中的頂層時，在 `<template>` 中也會被自動解包。

---
title: Ref<T> 和 ref()
sidebar_position: 3
description: 说明 Vue 3 ref() 函数的功用
keywords: [piesdoc, vue3, ref]
---

# `Ref<T>` 和 `ref()`

这个章节也许是 Vue 3 最重要的一环！

:::info

如果您还没有学过 TypeScript 或是物件导向设计，`<T>` 指的是 TypeScript 中的[泛型](https://www.typescriptlang.org/docs/handbook/2/generics.html)。

:::

## 什么是 `Ref<T>`？

`Ref<T>` 是只有一个公开属性 `value` 的**型别**。

简单的 `Ref<T>` 介面如下：

```ts showLineNumbers
interface Ref<T> {
  value: T
}
```

一个 `Ref<T>` 只能存放**一个**任意型别的值，所以他可以是：

- `Ref<number>`
- `Ref<number[]>`
- `Ref<{ id: number, name: string }>`
- `Ref<Promise<() => void>>`
- ...任何你需要的型别！

## 什么是 `ref()`？

`ref()` 是一个**函数**，只接收一个任意型别的参数；`ref()` 会把这个参数当做 `Ref<T>` 的 `value` 属性值，然后返回整个 `Ref<T>` 物件。

```ts showLineNumbers
import { ref } from 'vue'

const name = ref('hello')

console.log(name) // { value: 'hello' }
```

要修改 `Ref<T>` 的 `value`，我们只需要使用典型的作法即可：

```ts showLineNumbers
import { ref } from 'vue'

const name = ref('hello')
console.log(name.value) // 'hello'

// highlight-next-line
name.value = 'world'
console.log(name.value) // 'world'
```

任何型别的 `Ref<T>` 都遵守同样的规则，例如：

```ts showLineNumbers
import { ref } from 'vue'

// 阵列
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

虽然 `ref()` 的返回值看起来是一个长得像 `{ value: 'hello' }` 的简单对象 (plain object，或称 POJO)，事实上他不是！`ref()` 返回的其实是一个叫做 `RefImpl` 的类别 (class) 实体 (instance)，而且这个类别只有一个公开属性 `value`。所以从使用者的角度来看 (你和我，开发人员)，我们可以直接把 `RefImpl` 看做是 `Ref<T>`，因为他们有着相同的公开属性。

此外，`ref()` 并不是盲目的把数值包成 `Ref<T>` 的结构而已，但是现在还不需要知道实际的逻辑。我们会在 [`ref()` 还是 `reactive()`](./ref-or-reactive) 章节做更详细的描述。
:::

很好，我们已经大致了解 `Ref<T>` 在 `<script>` 中运作的原理了。现在我们来看看 `Ref<T>` 如何在 `<template>` 中运作！

## `<template>` 中的 `Ref<T>`

在 Vue 2，我们可以使用三种不同的语法在 `<template>` 中存取 `<script>` 的变量—双大括弧 `{{ }}`、`v-on` (缩写为 `@`) 和 `v-bind` (缩写为 `:`)。这三种语法在 Vue 3 中仍然存在，但是逻辑上有小小的不同。以这个组件为例：

```html showLineNumbers
<template>
  <!-- 这样能正常运作吗？ -->
  <!-- highlight-next-line -->
  <div>{{ name.value }}</div>
</template>

<script setup>
import { ref } from 'vue'

const name = ref('hello')
</script>
```

由于 `name` 是一个 `Ref<T>`，我们会很合理的认为 `<div>{{ name.value }}</div>` 最后会得到 `<div>hello</div>`。但是当这个组件被渲染 (render) 后，输出的 HTML 却是 `<div></div>`，没有中间的 `hello` — 我们的 `hello` 到哪去了？

在 Vue 3 中，当我们尝试从 `<template>` 存取 `Ref<T>` 型别的变量时，**有时候** (没错，有时候！) 他们会被自动解包。**解包** (unwrap 或是 [**unref**](https://vuejs.org/api/reactivity-utilities.html#unref)) 的意思是将 `value` 从 `Ref<T>` 中取出来。因此在某些情况下我们必须在 `<template>` 中省略 `Ref<T>` 后面的 `.value`，那么「某些情况」指的是哪些情况呢？

规则很简单：当该 `Ref<T>` 属于 `<script setup>` 中的**顶层属性**时，Vue 就会在 `<template>` 中将他自动解包；这个规则同样适用于 v-on 和 v-bind。

所以在上方的例子中，如果我们想要在画面上看见 `hello`，我们就必须写 `{{ name }}` 而不是 `{{ name.value }}`，因为 `name` 属于 `<script setup>` 中的顶层属性。

```html showLineNumbers
<template>
  <!-- 这样就能正常运作 -->
  <!-- highlight-next-line -->
  <div>{{ name }}</div>
</template>

<script setup>
import { ref } from 'vue'

const name = ref('hello')
</script>
```

我们再来看看一个自动解包的例子：

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

这个组件所输出的 HTML 会是这样：

```html showLineNumbers
<div>
  <h1>A: function toFixed() { [native code] }</h1>
  <h2>B: </h2>
</div>
```

你知道为什么会有这样的差异吗？

<details>
  <summary>这是因为... (在看解答之前请先想想！)</summary>

  - `age` 和 `user` 都是 `<script setup>` 中的顶层属性。
  - 因为 `age` 在 `<script setup>` 中是一个顶层的 `Ref<T>`，他在 `<template>` 中会被自动解包，代表在 `<template>` 写 `{{ age }}` 就会等于在 `<script setup>` 里面写 `age.value`，因此得到 `5`。
  - 在 JavaScript 中，`toFixed` 是数字原型 (prototype) 中的一个方法；既然 `5` 是一个数字，那么 `5.toFixed` 就会得到该方法，因此在画面上就显示了 `function toFixed() { [native code] }`。
  - 虽然 `user.age` 和 `age` 在 `<script setup>` 的来源其实是同一个变量，但 `{{ user.age }}` 在 `<template>` 中**不会**被自动解包，因为 `user.age` 不是一个顶层属性 — `user` 才是！
  - 既然 `user.age` 在 `<template>` 中没有被自动解包，在 `<template>` 写 `{{ user.age }}` 就会等于 `<script setup>` 中的 `user.age`，也就是 `Ref<T>`。
  - `Ref<T>` 里面没有 `toFixed` 这个属性，因此 `{{ user.age.toFixed }}` 就会是 `undefined`，导致 `<h2>B: {{ undefined }}</h2>` 被渲染成 `<h2>B: </h2>`。

</details>

太棒了，现在你知道 `Ref<T>` 在 `<template>` 中是如何运作的了！这个知识在使用[组合式函数](./composables) (composable) 时尤其重要。若是不了解这些知识，我们的 `<template>` 最后就会出现一大堆本来可以被避免的 `.value`，造成代码的可读性降低。

## `ComputedRef<T>` 也属于 `Ref<T>`

`ComputedRef<T>` 是 [`computed()`](https://vuejs.org/api/reactivity-core.html#computed) 的 **返回型别**。

`ComputedRef<T>` 继承自 `Ref<T>`，所以他们运作的逻辑很相似 — `ComputedRef<T>` 也只有一个公开属性 `value`，当他处于 `<script setup>` 中的顶层时，在 `<template>` 中也会被自动解包。

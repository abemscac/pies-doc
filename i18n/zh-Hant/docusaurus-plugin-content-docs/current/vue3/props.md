---
sidebar_position: 6
description: Vue 3 中的 props 是什麼
keywords: [派氏文件, vue3, vue props]
---

import Video from '@site/src/widgets/Video';

# 屬性 (Props)

## 什麼是屬性？

Props 指的是**從父元件傳遞下來的數值**。這些數值會被存放在一個通常叫做 `props` 的物件中。

舉例來說，若您在子元件中這樣宣告 props：

```ts title="ChildComponent.vue" showLineNumbers
const props = defineProps<{
  name: string
  age: number
}>()
```

那麼在父元件您就能這樣把數值傳遞下去：

```html title="ParentComponent.vue" showLineNumbers
<template>
  <ChildComponent
    :name="myName"
    :age="myAge"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const myName = ref('hello')
const myAge = ref(5)
</script>
```

## 淺層響應 (Shallow Reactive) 和淺層唯讀 (Shallow Readonly)

這裡有個有趣的知識：`props` 物件其實是一個有著**淺層唯讀**限制的**非嚴格淺響應代理** (non-strict shallow reactive proxy)！

### 什麼是淺層響應 (Shallow Reactive)？

**淺層響應**指的是在一個物件中，只有頂層屬性具有響應性；所有非頂層屬性都不具有響應性。我們可以使用 [`shallowReactive()`](https://vuejs.org/api/reactivity-advanced.html#shallowreactive) 函式來宣告一個淺響應代理，例如：

```ts showLineNumbers
import { shallowReactive } from 'vue'

const user = shallowReactive({
  name: 'hello',
  child: {
    age: 5,
  },
})
```

在這個範例中，`user` 被宣告為一個淺響應代理，這意味著：

- 修改 `user.name` 的值會導致元件重新渲染。
- 將 `user.child` 取代成其他任意數值會導致元件重新渲染。
- 修改 `user.child.age` **不會**導致元件重新渲染。

然而，如果 `user.child` 在一開始就已經是響應式代理，那麼修改 `user.child.age` 也會造成元件重新渲染；因為 `shallowReactive()` 能做的只有賦予響應性給頂層屬性，他從來不會「去除響應性」，例如：

```ts showLineNumbers
import { reactive, shallowReactive } from 'vue'

const user = shallowReactive({
  name: 'hello',
  child: reactive({
    age: 5,
  }),
})
```

在這個範例中：

- 修改 `user.name` 會導致元件重新渲染，因為 `user` 是一個淺響應代理。
- 將 `user.child` 取代成其他任意數值會導致元件重新渲染，因為 `user` 是一個淺響應代理。
- 修改 `user.child.age` 也會導致元件重新渲染，因為 `user.child` 是一個響應式代理。

:::info

和 `reactive()` 不同，`shallowReactive()` 在建立代理的過程中不會經過[解包的過程](./unwrap-nested-ref)，所以 `shallowReactive()` 的回傳型別必定會和傳入的參數型別相同。

:::

### 什麼是淺層唯讀 (Shallow Readonly)？

**淺層唯讀**指的是在一個物件中，只有頂層屬性具有唯讀的限制；所有非頂層屬性都不具有唯讀的限制。我們可以使用 [`shallowReadonly()`](https://vuejs.org/api/reactivity-advanced.html#shallowreadonly) 函式來建立一個淺層唯讀物件，例如：

```ts showLineNumbers
import { shallowReadonly } from 'vue'

const user = shallowReadonly({
  name: 'hello',
  child: {
    age: 5,
  },
})
```

在這個範例中，`user` 被宣告為一個淺層唯讀物件，這意味著：

- 我們無法修改 `user.name`。
- 我們無法將 `user.child` 取代為其他數值。
- 我們**可以**修改 `user.child.age`。

總結一下，您可以將 `props` 想像成是一個使用 `shallowReactive()` 和 `shallowReadonly()` 宣告出來的淺響應代理；只不過所有的屬性值都是由父元件傳遞下來的。

```ts showLineNumbers
import { shallowReactive, shallowReadonly } from 'vue'

const props =
  shallowReadonly(
    shallowReactive({
      // ...
    })
  )
```

:::info

您應該**極力避免從子元件直接修改 `props`**，如此一來才能維持單向資料流 (從上方流向下方)。若您的子元件需要修改 props 的數值，您應該使用[自定義事件](https://vuejs.org/guide/components/events.html#component-events) (events)。主要的概念是，只有父元件才被允許修改 props 的數值，子元件做的只是「觸發」那些做出改變的事件而已。

:::

## Props 的響應性

您是否曾經遇過**出於某種原因，「某些」props 中的屬性就是不具有響應性**？

在大多數情況下，這意味著您不小心破壞了 props 的響應性。由於 `props` 物件是一個淺響應代理，您可以把它當成是響應式代理來處理。看看[這裡](./reactive#響應式代理的響應性)提到的解決方法！

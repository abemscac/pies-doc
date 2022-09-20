---
sidebar_position: 6
description: Vue 3 中的 props 是什么
keywords: [派氏文件, vue3, vue props]
---

import Video from '@site/src/widgets/Video';

# Props

## 什么是 Props？

Props 指的是**从父组件传递下来的属性**。这些属性会被存放在一个通常叫做 `props` 的物件中。

举例来说，若您在子组件中这样宣告 props：

```ts title="ChildComponent.vue" showLineNumbers
const props = defineProps<{
  name: string
  age: number
}>()
```

那么在父组件您就能这样把数值传递下去：

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

## 浅层响应 (Shallow Reactive) 和浅层唯读 (Shallow Readonly)

这里有个有趣的知识：`props` 物件其实是一个有着**浅层唯读**限制的**非严格浅响应代理** (non-strict shallow reactive proxy)！

### 什么是浅层响应 (Shallow Reactive)？

**浅层响应**指的是在一个物件中，只有顶层属性具有响应性；所有非顶层属性都不具有响应性。我们可以使用 [`shallowReactive()`](https://vuejs.org/api/reactivity-advanced.html#shallowreactive) 函数来宣告一个浅响应代理，例如：

```ts showLineNumbers
import { shallowReactive } from 'vue'

const user = shallowReactive({
  name: 'hello',
  child: {
    age: 5,
  },
})
```

在这个范例中，`user` 被宣告为一个浅响应代理，这意味着：

- 修改 `user.name` 的值会导致组件重新渲染。
- 将 `user.child` 取代成其他任意数值会导致组件重新渲染。
- 修改 `user.child.age` **不会**导致组件重新渲染。

然而，如果 `user.child` 在一开始就已经是响应式代理，那么修改 `user.child.age` 也会造成组件重新渲染；因为 `shallowReactive()` 能做的只有赋予响应性给顶层属性，他从来不会「去除响应性」，例如：

```ts showLineNumbers
import { reactive, shallowReactive } from 'vue'

const user = shallowReactive({
  name: 'hello',
  child: reactive({
    age: 5,
  }),
})
```

在这个范例中：

- 修改 `user.name` 会导致组件重新渲染，因为 `user` 是一个浅响应代理。
- 将 `user.child` 取代成其他任意数值会导致组件重新渲染，因为 `user` 是一个浅响应代理。
- 修改 `user.child.age` 也会导致组件重新渲染，因为 `user.child` 是一个响应式代理。

:::info

和 `reactive()` 不同，`shallowReactive()` 在建立代理的过程中不会经过[解包的过程](./unwrap-nested-ref)，所以 `shallowReactive()` 的返回型别必定会和传入的参数型别相同。

:::

### 什么是浅层唯读 (Shallow Readonly)？

**浅层唯读**指的是在一个物件中，只有顶层属性具有唯读的限制；所有非顶层属性都不具有唯读的限制。我们可以使用 [`shallowReadonly()`](https://vuejs.org/api/reactivity-advanced.html#shallowreadonly) 函数来建立一个浅层唯读物件，例如：

```ts showLineNumbers
import { shallowReadonly } from 'vue'

const user = shallowReadonly({
  name: 'hello',
  child: {
    age: 5,
  },
})
```

在这个范例中，`user` 被宣告为一个浅层唯读物件，这意味着：

- 我们无法修改 `user.name`。
- 我们无法将 `user.child` 取代为其他数值。
- 我们**可以**修改 `user.child.age`。

总结一下，您可以将 `props` 想像成是一个使用 `shallowReactive()` 和 `shallowReadonly()` 宣告出来的浅响应代理；只不过所有的属性值都是由父组件传递下来的。

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

您应该**极力避免从子组件直接修改 `props`**，如此一来才能维持单向资料流 (从上方流向下方)。若您的子组件需要修改 props 的数值，您应该使用[自定义事件](https://vuejs.org/guide/components/events.html#component-events) (events)。主要的概念是，只有父组件才被允许修改 props 的数值，子组件做的只是「触发」那些做出改变的事件而已。

:::

## Props 的响应性

您是否曾经遇过**出于某种原因，「某些」props 中的属性就是不具有响应性**？

在大多数情况下，这意味着您不小心破坏了 props 的响应性。由于 `props` 物件是一个浅响应代理，您可以把它当成是响应式代理来处理。看看[这里](./reactive#响应式代理的响应性)提到的解决方法！

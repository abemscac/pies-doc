---
title: UnwrapNestedRef<T>
sidebar_position: 8
description: 介绍 Vue 3 reactive() 函数中的解包机制
keywords: [派氏文件, vue3, vue unwrapnestedref, vue reactive(), vue解包]
---

# `UnwrapNestedRef<T>`

学习 `reactive()` 的解包机制。

:::caution 先修章节

建议您在学习完 [`ref()`](./ref-and-ref) 和 [`reactive()`](./reactive) 之后再阅读此章节。

:::

:::note

老实说，这也许不是一个非常重要的主题，因为在大多数情况下，您的 IDE 会为您推算输出类型；你可能甚至没有注意到这个东西的存在。

若您觉得本章节的内容很让人困惑，请放心地跳过它！即使您不知道这些内容，您也能过得很好！

:::

## 范例

您是否曾经好奇如果我们对着某个含有 `Ref<T>` 属性的简单对象 (plain object) 使用 `ref()` 会发生什么事？例如：

```ts showLineNumbers
import { ref } from 'vue'

const dog = ref({
  name: 'hello'
})

const we = ref({
  have: {
    a: {
      dog,
    }
  }
})
```

要从 `we` 拿到 `hello`，我们会很自然的想到 `we.value.have.a.dog.value.name`，因为 `we` 和 `dog` 都是藉由 `ref()` 所宣告出来的变量，因此便创造了一个巢状结构。

但是当您尝试运行这一段代码时，您会得到一个错误，内容是 `TypeError: Cannot read properties of undefined (reading 'name')`。怎么会这样呢？

发生这种事情的原因是：

- 正如我们在 [`ref()` 还是 `reactive()`](./ref-or-reactive#ref-的运作原理) 中所提到的， `ref()` 在内部使用了 `reactive()`。
- 在 `reactive()` 中其实有个内建的解包机制，进而导致了上面的错误。

因此想要从 `we` 拿到 `hello`，正确的方式是 `we.value.have.a.dog.name`，因为 `we.value.have.a.dog` 被 `reactive()` 给解包了。

在这个章节中，我们会尝试说明这个藏在 `reactive()` 中的秘密解包机制是如何运作的。

## 什么是 `UnwrapNestedRef<T>`？

`UnwrapNestedRef<T>` 是 `reactive()` 的**返回型别**，它的名字其实已经解释了它的用途—解包所有 `T` 中的巢状 `Ref`。 

下面的伪代码展示了 `UnwrapNestedRef<T>` 的简化版定义(但还是挺复杂的)；它和原始码不完全相同，但是很接近了：

```ts showLineNumbers
type UnwrapNestedRef<T> = (
  if (T is Ref) {
    return T
  } else {
    return UnwrapRef<T>
  }
)

type UnwrapRef<T> = (
  if (T is Ref) {
    return T['value']
  } else if (T is plain object) {
    return { for key in T: UnwrapRef<T[key]> }
  } else if (T is Array) {
    return [for key in T: UnwrapRef<T[key]>]
  } else {
    return T
  }
)
```

下面的伪代码展示了依照上面的型别所实践的虚构函数：

```ts showLineNumbers
const unwrapNestedRef = <T>(arg: T): UnwrapNestedRef<T> => {
  if (arg is Ref) {
    return arg
  } else {
    return unwrapRef(arg)
  }
}

const unwrapRef = <T>(arg: T): UnwrapRef<T> => {
  if (arg is Ref) {
    return arg.value
  } else if (arg is plain object) {
    const result = {}
    for (const key in arg) {
      result[key] = unwrapRef(arg[key])
    }
    return result
  } else if (arg is Array) {
    return arg.map((item) => unwrapRef(item))
  } else {
    return arg
  }
}
```

上面的伪代码已经替一切做了很好的总结了！花点时间慢慢阅读和理解这些伪代码，希望它能让您对 `reactive()` 中的解包机制有个不错的理解！

下面我们将提到一些常见的案例，还有应该要注意的事项。

## 键值集合 (Collections)

储存于映射 (`Map`) 和集合 (`Set`) 等键值集合类型中的 `Ref<T>` **不会**被 `reactive()` 解包，但响应性依然存在。

## 部分响应式物件

在使用 Vue 3 时，您应该**极力避免宣告部分响应式物件**，因为他们通常是 bug 的来源，例如：


```ts showLineNumbers
import { reactive } from 'reactive'

const user = {
  name: 'hello',
  friend: {
    // highlight-start
    child: reactive({
      name: 'world',
    }),
    // highlight-end
  },
}
```

在这个范例中，修改 `user.friend.child` 中的任何属性都会造成组件重新渲染，修改其他属性则不会。在这种情况下，使用 `ref()` 会比 `reactive()` 还要好一些，因为看见 `.value` 我们至少能猜测它大概是一个 `Ref<T>` (但无法肯定)。尽管如此，我们还是建议避免这种模式，因为他不好理解。
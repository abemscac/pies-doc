---
title: ref() 还是 reactive()
sidebar_position: 5
description: 比较 Vue 3 ref() 和 reactive() 函数的差异
keywords: [piesdoc, vue3, ref, reactive]
---

# `ref()` 还是 `reactive()`

:::caution 先修章节

建议您在学习完 [`ref()`](./ref-and-ref#什么是-ref) 和 [`reactive()`](./reactive#什么是-reactive) 之后再阅读此章节。

:::

*所以... 我该用哪一个来宣告状态，`ref()` 还是 `reactive()`？*

我们终于到这里了！这可能是 Vue 3 里面最常见的问题。

我们会先解释这两个函数的运作原理，然后依据参数的类型来回答这个问题。总而言之，结论是:

- 针对原始型别的参数，建议使用 `ref()`。
- 针对函数，`ref()` 和 `reactive()` 都不建议；直接使用 `let`、`var` 或 `const` 宣告即可—看看哪个最适合您。
- 针对其他型别的数值，`ref()` 或 `reactive()` 都可以。

## `ref()` 和 `reactive()` 是如何运作的

为了明白该如何选择 `ref()` 和 `reactive()`，我们必须要知道他们分别是如何运作的。

### `ref()` 的运作原理

下面的伪代码 (pseudocode) 能大概让我们知道 `ref()` 在 Vue 3 中是如何运作的。虽然这个伪代码经过极度的化简和改写，我们还是能一窥 `ref()` 的运作原理：

```ts showLineNumbers
import { reactvie, Ref } from 'vue'

const ref = (arg) => {
  if (arg is Ref) {
    return arg
  } else {
    return new RefImpl(arg)
  }
}

class RefImp<T> implements Ref<T> {
  public value: T

  constructor(arg: T) {
    if (arg is primitive value) {
      this.value = arg
    } else {
      this.value = reactive(arg)
    }
    track(this.value)
  }
}
```

- 如我们先前所提到的，`RefImpl` 是一个只有一个公开属性 `value` 的类别。
- 若参数为原始型别，`RefImpl` 会直接把它当成 `this.value`。
- 若参数是非原始型别，`RefImpl` 则会调用 `reactive()`，然后用它的返回值当做 `this.value`；所以在使用 `ref()` 的同时，您其实也使用了 `reactive()`，只是您没有发现罢了！
- `track(this.value)` 在原始码之中其实不是这么运作的；总之重点是，`RefImpl` 会在必要时「追踪」 `this.value` 的变化，才能达成响应性。

### `reactive()` 的运作原理

 下面的伪代码能大概让我们知道 `reactive()` 在 Vue 3 中是如何运作的。他和原始码有点不同，不过挺接近的，能够让我们知道 `reactive()` 的运作原理：

```ts showLineNumbers
const reactive = (arg) => {
  if (arg is primitive value) {
    if (is in development mode) {
      console.warn(`value cannot be made reactive: ${String(arg)}`)
    }
    return arg
  } else if (arg is Ref OR arg is reactive OR arg is function) {
    return arg
  } else {
    const unwrappedValue = unwrapNestedRef(arg)
    return toProxy(unwrappedValue)
  }
}
```

- 如我们先前所提到的，`reactive()` 只能和非原始型别的数值一起使用。
- 虽然函数属于非原始型别，但它还是没办法和 `reactive()` 一起使用；`reactive()` 会立刻返回它。
- `unwrapNestedRef()` 是我们在 [`UnwrapNestedRef<T>`](./unwrap-nested-ref#what-is-unwrapnestedreft) 中提到的一个虚构函数；他被用来解包物件和阵列中的巢状 `Ref<T>`。
- `toProxy()` 是一个用来创造响应式代理的虚构函数。

## 解释

我们终于可以进到最重要的环节—解释为什么我们依据参数类型的不同而选择 `ref()` 或是 `reactive()`。

### 原始型别

若参数是原始型别，那么 `ref()` 会是比较好的选择，因为 `reactive()` 只能和非原始型别的数值一起使用。

我们当然可以把数值包在一个物件里面，这样他就能和 `reactive()` 一起使用 (例如 `const age = reactive({ value: 5 })`)，不过...为什么要这样？直接用 `ref()` 也可以得到相同的结果！

### 函数

若参数型别是函数，您可能不会想要它具有响应性。函数属于**不该被呈现在萤幕上**的东西，同时它也**不该被用来表示组件的状态**，因此让它具有响应性是没有意义的。

然而，在某些情况下，我们的确需要将函数赋予给某个变量。例如**事件的订阅/注册**。那些是我们在组件挂载后注册，然后在组件卸载前移除的东西。

以 [Vue Router](https://router.vuejs.org/) 的 [Navigation Guards](https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards) (导航守卫) 为例：

```ts showLineNumbers
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// highlight-next-line
let unregisterNavGuard: () => void | undefined = undefined

onMounted(() => {
  // highlight-start
  unregisterNavGuard = router.beforeEach((to, from) => {
    // ...
  })
  // highlight-end
})

onBeforeUnmount(() => {
  // highlight-next-line
  unregisterNavGuard?.()
})
```

1. 我们在 `onMounted()` 中使用 `router.beforeEach()` 来注册导航守卫，这个注册函数会返回用来取消注册的函数。
2. 取消注册的函数应该要在 `onBeforeUnmount()` 中被调用。
3. 从第一步取得取消注册函数后，我们将他赋予给 `unregisterNavGuard`，这样才能在第二步调用他。

由于 `unregisterNavGuard` 和组件渲染没有任何关系，我们在宣告的时候就选择使用 `let`，而不是 `ref()` 或 `reactive()`。如此一来如果因为某些原因我们需要重新赋值，组件也不会进行不必要的重新渲染，因为 `unregisterNavGuard` 既不是响应式代理也不是 `Ref<T>`。

若您真的很想要宣告一个响应式的函数 (虽然我们想不到任何好原因)，`ref()` 会是比较好的选择，因为 `reactive()` 在面对函数时会直接返回。这代表写下 `const func = reactive(() => {})` 就等于 `const func = () => {}`。

### 其他型别

除了原始型别和函数以外的数值都属于这一类，例如简单对象、阵列、映射 (`Map`) 等。

针对这些数值，使用 `ref()` 还是 `reactive()` 其实没什么差别；因为这些数值最后都会被传给 `reactive()`，唯一的差别是使用 `ref()` 的话就会出现 `.value`，因为他返回的是 `Ref<T>`。

既然两个函数相较之下没有哪一个明显比另外一个好，那么使用 `ref()` 或是 `reactive()` 都可以。只要确保**整个团队/专案在选择使用 `ref()` 和 `reactive()` 时的判断标准是一致的**，用以维持代码的一致性，这样就行了！
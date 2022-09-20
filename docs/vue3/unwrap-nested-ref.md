---
title: UnwrapNestedRef<T>
sidebar_position: 8
description: Introduce the unwrap mechanism in reactive() function in Vue 3.
keywords: [piesdoc, vue3, vue unwrapnestedref, vue reactive, vue unwrap]
---

# `UnwrapNestedRef<T>`

Learn the unwrap process of `reactive()`.

:::caution Prerequisites

You must learn [`ref()`](./ref-and-ref) and [`reactive()`](./reactive) before getting into this chapter.

:::

:::note

To be honest, this may not be a very important topic because for most of the time, your IDE would have evaluated the output type for you; you probably didn't even notice the existence of this thing.

If you find this chapter very confusing, feel free to skip it! You'll do just fine without knowing anything about it!

:::

## Example

Have you ever wonder what happens if we use `ref()` on a plain object with any `Ref<T>` property in it? For example:

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

To get `hello` from `we`, it's very natural to think that we have to use `we.value.have.a.dog.value.name` because both `we` and `dog` are variables declared by using `ref()`, thus creating a nested structure.

But when you try to run that code, you'll get an error that says `TypeError: Cannot read properties of undefined (reading 'name')`. How come?

This happens because:

- As we've mentioned in [`ref()` or `reactive()`](./ref-or-reactive#how-ref-works), `ref()` uses `reactive()` internally.
- There's actually an unwrap mechanism (unwrap/unref `Ref<T>`) built inside `reactive()`, thus leading to the error we see.

So to get `hello` from `we`, the correct way would be `we.value.have.a.dog.name`, because `we.value.have.a.dog` is unwrapped by `reactive()`.

In this chapter, we'll try to explain how this secret unwrap mechanism works in `reactive()`.

## What Is `UnwrapNestedRef<T>`?

`UnwrapNestedRef<T>` is the **return type** of `reactive()` which pretty much explains itself — unwrap all of the nested `Ref`s in `T`.

The following pseudocode demonstrates the simplified (yet still complicated) definition of `UnwrapNestedRef<T>` (not exactly the same as the source code, but it's close!):

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

The following pseudocode demonstrates the imaginary functions implemented based on the types we see above:

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

The above pseudocode just sums everything up! Take your time to read and understand the pseudocode, hopefully it will give you a decent understanding of how the unwrap mechanism works in `reactive()`!

Below here we'll just highlight some commonly seen scenarios, and things you should pay attention to.

## Collections

`Ref<T>`s stored in collection types like `Map` and `Set` will **not** be unwrapped by `reactive()`, but the reactivity is still applied.

## Partial Reactive Object

When using Vue 3, you should try to **avoid declaring partial reactive object** because usually the are the source of bugs. For example:


```ts showLineNumbers
import { reactive } from 'reactive'

const user = {
  name: 'hello',
  friend: {
    child: reactive({
      name: 'world',
    }),
  },
}
```

In this example, mutating any property inside `user.friend.child` will cause the component to re-render, while mutating any other property will not. In this case, using `ref()` would be slight better than using `reactive()` because by seeing `.value`, you'll know that it's probably a `Ref<T>` (but not guaranteed). Still, it's recommended to avoid such pattern because it's difficult to understand.
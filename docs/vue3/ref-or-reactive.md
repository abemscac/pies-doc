---
title: ref() or reactive()
sidebar_position: 5
description: Compare the differences between ref and reactive in Vue 3.
keywords: [piesdoc, vue3, ref, reactive]
---

# `ref()` or `reactive()`

:::caution Prerequisites

You must learn [`ref()`](./ref-and-ref#what-is-ref) and [`reactive()`](./reactive#what-is-reactive) before getting into this chapter.

:::

*So... which one should I use to declare reactive values, `ref()` or `reactive()`?*

We're finally here! This is probably the most commonly asked question in Vue 3.

We'll try to answer this question by explaining how these two functions work, then decide which one should we use based on the type of argument. But all in all the conclusion is:

- For primitive values, `ref()` is recommended.
- For functions, neither `ref()` nor `reactive()` is recommended; just use `let`, `var`, or `const` — whichever is best for you.
- For any other type of values, either `ref()` or `reactive()` is fine.

## How `ref()` and `reactive()` Work

In order to know how to choose between `ref()` and `reactive()`, it's essential to know how they work respectively.

### How `ref()` Works

The following pseudocode gives us a decent concept of how `ref()` works in Vue 3. Although it is extremely simplified and rearranged, we're still able to get the main idea of what's going on inside `ref()`:

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

- As we've mentioned before, `RefImpl` is a class with only one public property `value`.
- If the argument is a primitive value, `RefImpl` will use it as `this.value`.
- If the argument is not a primitive value, `RefImpl` will just call `reactive()` and use the returned value as `this.value`.
- The `track(this.value)` works very differently than the source code; but the point is, `RefImpl` will "track" the changes of `this.value` when needed so that reactivity can be fulfilled.
- By using `ref()`, you're actually using `reactive()` as well (if the argument is not a primitive value); you just didn't realize it!

### How `reactive()` Works

The following pseudocode gives us a good concept of how `reactive()` works in Vue 3. It's not exactly the same as the source code, but it's close enough to let us know what's going on inside `reactive()`:

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

- As we've mentioned before, `reactive()` only works with non-primitive values.
- Even if functions are non-primitive values, `reactive()` still doesn't work with it; it immediately returns it.
- `unwrapNestedRef()` is an imaginary function we've described in [`UnwrapNestedRef<T>`](./unwrap-nested-ref#what-is-unwrapnestedreft); it is used to unwrap the nested `Ref<T>`s in an object or an array.
- `toProxy()` is an imaginary function that is used to create reactive proxy.

## Explanation

We can finally dive into the most important part — explain why we choose `ref()` or `reactive()` over the other based on different types of arguments.

### Primitive Values

If the argument is a primitive value, then `ref()` would be the best choice because `reactive()` only works with non-primitive values.

Of course we can wrap the primitive value into an object to make it work (for example, `const age = reactive({ value: 5 })`), but...why? Just use `ref()` and you'll get the same result!

### Functions

If the argument is a function, you probably don't want it to be reactive. Functions are something that **should not be rendered** on the screen, and it **should not be used to represent the state of a component**, so making them reactive is just meaningless.

However, there are some cases where we do want to assign functions to variables. For example, **event subscription/registration**. It's those things we register after component is mounted, and we remove them before component unmounts.

Take the [Navigation Guards](https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards) of [Vue Router](https://router.vuejs.org/) as an example:

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

1. We register the navigation guard in `onMounted()` by using `router.beforeEach()`, which returns the unregister function.
2. The unregister function should only be called in `onBeforeUnmount()`.
3. After we get the unregister function in step 1, we assign it to a variable called `unregisterNavGuard` so that we can use it in step 2.

Since `unregisterNavGuard` has nothing to do with the rendering of a component, we just use `let` instead of `ref()` or `reactive()` during declaration. If for some reason we want to re-assign the value in the future, the component won't do unnecessary re-renders because it's neither a reactive proxy nor a `Ref<T>`.

If you REALLY want a function to be reactive (which we cannot think of any good reason), `ref()` would be a better choice because `reactive()` directly returns the argument if it's a function. That means `const func = reactive(() => {})` will equal to `const func = () => {}`.

### Any Other Type

Anything other than primitive value and function falls into this category. For example, plain object, Array, Map, etc.

In these cases, it doesn't really matter if you use `ref()` or `reactive()`; because under these circumstances, the inner value returned by `ref()` and `reactive()` are exactly the same; the `.value` after `Ref<T>` would be the only difference.

Since none is better than the other, using either `ref()` or `reactive()` is fine. Just make sure **the whole team/project is following the same rule when choosing `ref()` and `reactive()`** for code consistency and you'll be just fine!
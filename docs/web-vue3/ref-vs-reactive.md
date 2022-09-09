---
title: ref VS reactive
sidebar_position: 5
---

# `ref` VS `reactive`

:::caution Prerequisites

You must learn [`ref`](./ref) and [`reactive`](./reactive) before getting into this chapter.

:::

*So... which one should I use to declare reactive states, `ref` or `reactive`?*

We're finally here! This is probably the most commonly asked question when it comes to Vue 3; we'll try to answer this question based on the type of argument.


## Primitive Value

If the argument is a primitive value, then `ref` would be the best choice because `reactive` only works with non-primitive values.

Of course we can just wrap the value into an object like `const age = reactive({ value: 5 })`, but... why? Just use `ref` and you'll get the same result!

## Function

If the argument is a function, you probably don't want it to be reactive; because function is something that **should not be rendered** on the screen, making it reactive is meaningless.

A common use case is event subscription/registration. It's those things being registered when component mounts, and be removed before component unmounts.

Take the [Navigation Guards](https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards) of [Vue Router](https://router.vuejs.org/) for example:

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

1. We register the navigation guard in `onMounted` by using `router.beforeEach(...)`.
2. `router.beforeEach` returns the unregister function.
3. The unregister function should only be called in `onBeforeUnmount`.

After we get the unregister function in step 2, we assign it to a variable called `unregisterNavGuard` and use it in step 3. So why do we use `let` instead of `ref` or `reactive`? The reason is:

- Since users don't have to be informed of this change, we can just declare it with `let` or `var` so that we can re-assign the value later.
- `const unregisterNavGuard = ref<() => void>()` would work, but that'll lead to an unnecessary re-render after component is mounted, because `unregisterNavGuard` is now a reactive variable.
- `let unregisterNavGuard = reactive<() => void>()` works too, but the returned value will not be reactive due to how `reactive` works internally, so writing `let func = reactive(() => {})` will actually equal to `let func = () => {}`. We'll explain more in detail below.

To sum up, if you REALLY want a function to be reactive (which we currently cannot think of any reason), `ref` would be a better choice.

## Any Other Type

Anything other than primitive value and `Ref` falls into this category.

Before getting into this section, it's very importan to know how `ref` and `reactive` works internally.

### How `ref` works

The following pseudocode gives us a good concept of how `ref` works in Vue 3. Although it is extremely simplified and rearranged, it's still close enough to let us know what's going on inside:

```ts showLineNumbers
import { reactvie, Ref } from 'vue'

function ref(arg) {
  if (arg is Ref) {
    return arg
  } else {
    return new RefImpl(arg)
  }
}

class RefImp implements Ref {
  public value: typeof arg

  constructor(arg) {
    if (arg is primitive value) {
      this.value = arg
      track(this.value)
    } else {
      this.value = reactive(arg)
    }
  }
}
```

- As we've mentioned [before](ref-and-ref#under-the-hood-of-ref), `RefImpl` is a class with only one public property `value`.
- If the argument is a primitive value, `RefImpl` will use it as `this.value`, and track the changes so that reactivity can be fulfilled.
- If the argument is not a primitive value, `RefImpl` will just call `reactive` and use the returned value as `this.value`.

### How `reactive` works

The following pseudocode gives us a good concept of how `reactive` works in Vue 3. It's not exactly the same as the source code, but it's close enough to let us know what's going on inside:

```ts showLineNumbers
function reactive(arg) {
  if (arg is primitive value) {
    if (is in development mode) {
      console.warn(`value cannot be made reactive: ${String(arg)}`)
    }
    return arg
  } else if (arg is reactive OR arg is function) {
    return arg
  } else {
    return reactive version of arg
  }
}
```

- As we've mentioned before, `reactive` only works with non-primitive values.
- `reactive` doesn't work with function as well.
- The "reactive version of arg" means a **`Proxy` object**.

Great, now we know how `ref` and `reactive` work in Vue 3. Let's 


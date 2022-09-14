---
title: UnwrapNestedRef<T>
sidebar_position: 8
---

# `UnwrapNestedRef<T>`

Learn the unwrap mechanism of `reactive()`.

:::caution Prerequisites

You must learn [`reactive()`](./reactive) before getting into this chapter.

:::

:::note

If you find this chapter very confusing, it's totally fine to skip it! You'll do just fine without knowing anything about it!

:::

## What Is `UnwrapNestedRef<T>`

`UnwrapNestedRef<T>` is the **return type** of `reactive()`. It pretty much explains itself — unwrap all of the nested `Ref`s in `T`.

To be honest, this may not be a very important topic because for most of the time, your IDE would have evaluated the output type for you; you probably didn't even notice the existence of this thing.

To get straight to the point, there's actually an unwrap mechanism (unwrap `Ref<T>`) built inside `reactive()`. The following pseudocode demonstrates the simplified (yet still complicated) definition of `UnwrapNestedRef<T>`:

```ts showLineNumbers
type UnwrapNestedRef<T> = (
  if (T is Ref) {
    return T
  } else {
    return UnwrapRef<T>
  }
)

type UnwrapRef<T> = (
  if (T is plain object) {
    return { for key in T: UnwrapRef<T> }
  } else if (T is Array) {
    return [for key in T: UnwrapRef<T[key]>]
  } else {
    return T
  }
)
```

The most complicated part lies in `UnwrapRef<T>` because it's a recursive structure. Since `UnwrapNestedRef<T>` is just a type, we still need a function that is used to create a recursively unwrapped object:

```ts
const unwrapNestedly = <T>(arg: T): UnwrapNestedRef<T> => {
  // Doing all the complicated logic here...
  return unwrappedObject
}
```

@@@@@@@@@@@@@@@@@@@@@@@@@@@@

### Unwrap a Plain Object

If the argument is a plain object, `reactive()` will return a new, unwrapped object based on that argument.

For example, if we have an object like this:

```ts showLineNumbers
import { reactive } from 'vue'

const user = reactive({
  shippingInfo: ref({
    phoneNumber: '123',
  }),
})
```

To get the value of `phoneNumber` from `user`, it's very natural to think that we have to use `user.shippingInfo.value.phoneNumber` because `user.shippingInfo` is a `Ref<T>`. But if you try to run that line of code, you'll get an error that says `TypeError: Cannot read properties of undefined (reading 'phoneNumber')`.

This happens because `shippingInfo`, which is a `Ref<T>`, is being wrapped in an object . So to get the value of `phoneNumber` from `user`, we should use `user.shippingInfo.phoneNumber`. Notice that there's no `.value` after `shippingInfo`.

**Recursively** means the `Ref<T>` does not necessarily have to be the (top-level) property of the object being passed to `reactive()` to be unwrapped; it will get unwrapped as long as `reactive()` appears in one of its' ancestors. For eaxmple:

```ts showLineNumbers
import { reactive } from 'vue'

const user = reactive({
  shippingInfo: {
    phoneNumber: '123',
    address: ref({
      line1: 'hello',
      line2: 'world',
    }),
  },
})

console.log(user.shippingInfo.address.line1) // 'hello'
```

In this example, even if `address` is not a (top-level) property of the object being passed to `reactive()`, it will still get unwrapped by `reactive()`. So to get the value of `line1` from `user`, we'll have to use `user.shippingInfo.address.line1`. Notice that there's no `.value` after `address`.

### Nestedly Unwrap an Array

If the argument is an array, `reactive()` will return a new array consists of unwrapped elements. You can simply think of the unwrap logic as something similar to the following pseudocode:

```ts showLineNumbers
const newArray = array.map((element) => unwrapNestedly(element))
return newArray
```

The `unwrapNestedly()` will run the unwrap logic we described in [Nestedly Unwrap a Plain Object](#nestedly-unwrap-a-plain-object); if the element is not a plain object, it'll use it as is without doing anything.

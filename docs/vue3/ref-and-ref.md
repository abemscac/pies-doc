---
title: Ref<T> and ref()
sidebar_position: 3
---

# `Ref<T>` and `ref()`

Probably the most important part in Vue 3!

:::info

In case you're new to TypeScript or OOP, `<T>` is the [Generic Type](https://www.typescriptlang.org/docs/handbook/2/generics.html) syntax of TypeScript. If it's too much for you, it's okay to ignore the `<T>` for now.

:::

## What is `Ref<T>`

`Ref<T>` is a **type** with only one public property `value`.

A simple interface for `Ref<T>` would look like this:

```ts showLineNumbers
interface Ref<T> {
  value: T
}
```

A `Ref<T>` contain only **one** value of any type, so you can have:

- `Ref<number>`
- `Ref<number[]>`
- `Ref<{ id: number, name: string }>`
- `Ref<Promise<() => void>>`
- ...anything you need!

## What is `ref()`

`ref()` is a **function** that takes an argument of any type, and returns a `Ref<T>` object with that argument as its' `value`. For example:

```ts showLineNumbers
import { ref } from 'vue'

const name = ref('hello')

console.log(name) // { value: 'hello' }
```

To mutate the `value` of a `Ref<T>`, we can simply do it in the classic JavaScript way:

```ts showLineNumbers
import { ref } from 'vue'

const name = ref('hello')
console.log(name.value) // 'hello'

// highlight-next-line
name.value = 'world'
console.log(name.value) // 'world'
```

The same rule applies to any type of value, including array and object. For example:

```ts showLineNumbers
import { ref } from 'vue'

// array
const fruits = ref(['apple', 'banana'])
console.log(fruits.value) // ['apple', 'banana']

// highlight-next-line
fruits.value[0] = 'orange'
console.log(fruits.value) // ['orange', 'banana']

// object
const somebody = ref({
  name: 'hello'
  age: 5,
})
console.log(somebody.value) // { name: 'hello', age: 5 }

// highlight-next-line
somebody.value.name = 'world'
console.log(somebody.value) // { name: 'world', age: 5 }
```

:::info

Although the returned value of `ref()` seems to be a plain object like `{ value: 'hello' }`, it's actually not! Instead, it's an instance of a class called `RefImpl` which has only one public property `value`. So from user's perspective (you and me, the developers), it's okay to just see `RefImpl` as `Ref<T>` because they expose the same property. Also, `ref()` does not just blindly wrap value into `Ref<T>` structure; we'll explain more in detail in [`ref()` vs `reactive()`](./ref-vs-reactive.md).
:::

Great, we've learned enough about how `Ref<T>` works in `<script>` for now. Let's see how `Ref<T>` works in `<template>`!

## `Ref<T>` in `<template>`

In Vue 2 we can access variables declared in `<script>` from `<template>` using 3 different syntax — double curly braces `{{ }}`, `v-on` (shorthand as `@`), and `v-bind` (shorthand as `:`). These 3 syntax still exist in Vue 3, but the logic is a little different. Take the following component as an example:

```html showLineNumbers
<template>
  <!-- Will this work? -->
  <!-- highlight-next-line -->
  <div>{{ name.value }}</div>
</template>

<script setup>
import { ref } from 'vue'

const name = ref('hello')
</script>
```

Because `name` is a `Ref<T>`, it is very reasonable to think that `<div>{{ name.value }}</div>` will evaluate to `<div>hello</div>`. But when this component gets rendered, the output HTML is actually `<div></div>`, without `hello` in the middle — where's our `hello`?

In Vue 3, when we try to access `Ref<T>` from `<template>`, **sometimes** (yes, SOMETIMES!) they will be automatically unwrapped. To **unwrap** (or **unref**) means to take the `value` out from `Ref<T>`. Hence, we must omit the `.value` behind a `Ref<T>` in `<template>` under some circumstances because Vue auto-unwrap them for us. So what are these "circumstances"?

The rule is simple: Vue will only auto-unwrap a `Ref<T>` in `<template>` if it is exposed as a **top-level property** in `<script setup>`. This rule also applies to v-on and v-bind.

So for the above example, if we want to see `hello` on the screen, we'll have to write `{{ name }}` instead of `{{ name.value }}` because `name` is a top-level `Ref<T>` in `<script setup>`.

```html showLineNumbers
<template>
  <!-- This will work correctly. -->
  <!-- highlight-next-line -->
  <div>{{ name }}</div>
</template>

<script setup>
import { ref } from 'vue'

const name = ref('hello')
</script>
```

Great, let's see one more example of auto-unwrap:

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

The output HTML of this component is:

```html showLineNumbers
<div>
  <h1>A: function toFixed() { [native code] }</h1>
  <h2>B: </h2>
</div>
```

Do you know why there's such difference?

<details>
  <summary>This happens because... (think about it for a while before revealing the answer!)</summary>

  - Both `age` and `user` are exposed as top-level properties in `<script setup>`.
  - Since `name` is a top-level `Ref<T>` in `<script setup>`, it gets auto-unwrapped in `<template>`, which means `{{ age }}` in `<template>` will equal to `age.value` in `<script setup>`, thus resolves to `5`.
  - In JavaScript, `toFixed` is a method defined in the prototype of number; `5` is a number, so `5.toFixed` will evaluate to that function, thus showing `function toFixed() { [native code] }` on the screen.
  - Although `user.age` and `age` are exactly the same variable in `<script setup>`, `{{ user.age }}` will **NOT** get auto-unwrapped in `<template>` because `user.age` is not a top-level property — `user` is!
  - Since `user.age` is not auto-unwrapped in `<template>`, `{{ user.age }}` in `<template>` will equal to `user.age` in `<script setup>`, which is a `Ref<T>`.
  - `Ref<T>` does not have a property called `toFixed`, so `{{ user.age.toFixed }}` resolves to `undefined` in `<template>`, causing `<h2>B: {{ undefined }}</h2>` to be rendered as `<h2>B: </h2>`.

</details>

Great, now you know how `Ref<T>` works in `<template>`! This is especially important when using [composables](./composables). Without knowing this, you will end up writing so many `.value` in `<template>` that could have been avoided, which decreases the readibility of your code.

## `ComputedRef<T>` is Also `Ref<T>`

`ComputedRef<T>` is the type of value returned by [`computed()`](https://vuejs.org/api/reactivity-core.html#computed).

Since `ComputedRef<T>` extends `Ref<T>`, they work pretty much the same way in `<script>` and `<template>`. For example, `value` is the only public property exposed by `ComputedRef<T>`, and top-level `ComputedRef<T>` also gets auto-unwrapped in `<template>`.

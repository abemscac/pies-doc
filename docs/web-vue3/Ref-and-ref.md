---
title: Ref and ref
sidebar_position: 3
---

# `Ref` and `ref`

This is probably the most important part in Vue 3.

## What is `Ref`?

`Ref` is a **type** that has only one public property `value`.

A simple interface for `Ref` would look like this:

```ts showLineNumbers
interface Ref<T> {
  value: T
}
```

A `Ref` variable can contain only **one** value with **any type**, so you can have:

- `Ref<number>`
- `Ref<boolean>`
- `Ref<Map>`
- `Ref<{ id: number, name: string }>`
- `Ref<YourOwnInterface[]>`
- `Ref<Promise<() => void>>`
- ...anything you need!

Great, that's all we need to know about `Ref` for now!

## What is `ref`?

`ref` is a **function** that accepts an argument of any type, and returns a `Ref` with that "thing" as its' `value`. For example:

```ts showLineNumbers
import { ref } from 'vue'

const name = ref('hello')

console.log(name.value) // 'hello'
```

Very straightforward, nothing more to explain for now!

:::caution

Hey there, please don't leave yet! The description about `ref` here is not 100% correct! If for some reason you want to directly jump to conclusions, please see [here](#the-real-ref).

:::

## Mutating a `Ref`

Because a `Ref` variable is just an object with `value` property, if we want to change the value in it, we can simply do it in the classic JavaScript way:

```ts showLineNumbers
import { ref } from 'vue'

const name = ref('hello')
console.log(name.value) // 'hello'

name.value = 'world'
console.log(name.value) // 'world'
```

**The same rule applies to any type of value**, including array and object. For example:

```ts showLineNumbers
import { ref } from 'vue'

// array
const fruits = ref(['apple', 'banana'])
console.log(fruits.value) // ['apple', 'banana']

fruits.value[0] = 'orange'
console.log(fruits.value) // ['orange', 'banana']

// object
const somebody = ref({
  name: 'hello'
  age: 5,
})
console.log(somebody) // { name: 'hello', age: 5 }

somebody.value.name = 'world'
console.log(somebody) // { name: 'world', age: 5 }
```

Yes, that's how easy it is!

## `ref` a `Ref`

So we know what `Ref` and `ref` are, but here comes the question — what happens if we use `ref` on a `Ref`? For example:

```ts showLineNumbers
import { ref } from 'vue'

const myName = ref('hello')
console.log(myName.value) // 'hello'

const yourName = ref(myName)
console.log(yourName.value.value) // Will this give us 'hello' too?
```

Based on how we described `Ref` and `ref` earlier in this chapter, it's very natural to think that `ref(myName)` will give us something like this:

```ts showLineNumbers
const yourName = {
  value: {
    value: 'hello'
  }
}
```

But when you try to `console.log(yourName.value.value)`, you'll see that it's showing `undefined` instead of `hello`. If you're using TypeScript, you'll even see an error before running anything. That's strange, isn't it? Why is this happening? Apparently this happens because `ref` is actually doing more than what we think it is!

## The Real `ref`

aaaaaaaa

## `Ref` in `<template>` (Interpolations)

In Vue 2 we can access variables declared in `<script>` from `<template>` using 3 different syntax — double curly braces `{{ }}`, `v-on` (shorthand as `@`), and `v-bind` (shorthand as `:`). These 3 syntax still exist in Vue 3, but the logic is a little different. Use the following component as an example:

```html showLineNumbers
<template>
  <div>{{ name.value }}</div>
</template>

<script setup>
import { ref } from 'vue'

const name = ref('hello')
</script>
```

Because `name` is a variable of type `Ref`, it's very reasonable to think that `<div>{{ name.value }}</div>` will give us `<div>hello</div>`. But when this component gets rendered, nothing shows up on the screen; it only renders `<div></div>` as the output HTML, no `hello` in the middle. Why is that?

This is because when we try to access `Ref` variables declared in `<script>` from `<template>`, some of them will get automatically "unwrapped", which means **we can (and must) omit the `.value` to get the value of a `Ref` in `<template>`**. We say "some of them" because not all `Ref` variables get auto-unwrapped!

So under what circumstances does a `Ref` variable gets auto-unwrapped in `<teplate>`? The rule is: **if a `Ref` variable is exposed as a top-level property in `<script>`, it will then gets auto-unwrapped in `<template>`**.

Use the following component as an example:

```html showLineNumbers
<template>
  <div>
    <h1>{{ firstName }}, {{ firstName.value }}</h1>
    <h2>{{ user.lastName }}, {{ user.lastName.value }}</h2>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const firstName = ref('first')

const user = {
  lastName: ref('last')
}
</script>
```

When this component gets rendered, you'll see `<h1>first, </h1>` and `<h2>"last", last</h2>` in the output HTML. So why do we only see `first` on the screen once, but seeing `last` twice? Also, there are these strange `""` in `<h2>"last", last</h2>`, why are they here? We've never seen them in all of the previous examples!

Let's try to break things down:

1. There are 2 top-level properties in this component — `firstName` and `user`. Since `firstName` is of type `Ref` at the same time, it gets auto-unwrapped in `<template>`. Thus `{{ firstName }}` resolves to `first`.

2. `Ref<string>` gives us `string` after unwrapped, which means the type of `{{ firstName }}` in `<template>` is `string` instead of `Ref<string>`. In JavaScript, there's no property called `value` in `string`, so `{{ firstName.value }}` will be resolved to `undefined` in `<template>`. Thus, the output HTML of `<h1>{{ firstName }}, {{ firstName.value }}</h1>` will be `<h1>first, </h1>`.

3. Although `user.lastName` is also a `Ref` variable, it is NOT a top-level property in this component (it's a property of `user`), so it doesn't get auto-unwrapped when accessed in `<template>`. That means the type of `{{ user.lastName }}` in `<template>` will be `Ref<string>` instead of `string`.

4. Due to how Vue 3 handle `Ref` object in `<template>`, we will see those quotation marks in `{{ user.lastName }}`.
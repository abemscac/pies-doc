---
title: Ref and ref
sidebar_position: 3
---

# `Ref` and `ref`

This is probably the most important part in Vue 3.

## What is `Ref`?

`Ref` is a **type** that has only one public property `value`.

A simple (yet not 100% correct) interface for `Ref` would look like this:

```ts
interface Ref<T> {
  value: T
}
```

A `Ref` variable can contain only **one** value with any type, so you can have `Ref<number>`, `Ref<boolean>`, `Ref<Map>`, `Ref<{ id: number, name: string }>`, `Ref<YourOwnInterface[]>`, `Ref<Promise<() => void>>`, anything you need.

That's all we need to know about `Ref` for now!

## What is `ref`?

`ref` is a **function** that accepts an argument of any type, and returns a `Ref` with that "thing" as its' `value`. For example:

```ts
import { ref } from 'vue'

const name = ref('hello')

console.log(name.value) // 'hello'
```

Very straightforward, nothing more to explain!

### Mutating a `Ref`

If we want to change the value of a `Ref`, we can simply change it in an easy way:

```ts
import { ref } from 'vue'

const name = ref('hello')

console.log(name.value) // 'hello'

name.value = 'world'

console.log(name.value) // 'world'
```

The same rule applies to any type of value, including array and object. For example:

```ts
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

Great, now we know how to mutate a `Ref`!

### `ref` a `Ref`

What happens if we use `ref` on a `Ref`?

### `Ref` in `<template>` (Interpolations)

We know that in Vue 2, we can access variables declared in `<script>` using either the double curly braces `{{ }}`, `v-on` (shorthand as `@`), or `v-bind` (shorthand as `:`) from `<template>`. These 3 syntax still exist in Vue 3, but the logic is a little different.

For example, if we have a variable `name` which is declared using `const name = ref('hello')`, we may think that writing `{{ name.value }}` in `<template>` will give us `hello`, because `name` is a variable of type `Ref`, and `Ref` has a property called `value`.

That's very reasonable, but unfortunately things don't go as we expected — it actually shows nothing on the screen:

```html
<template>
  <div>{{ name.value }}</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const name = ref('hello')
</script>
```
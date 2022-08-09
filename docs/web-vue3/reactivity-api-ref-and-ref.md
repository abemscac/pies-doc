---
title: Reactivity API - Ref and ref
sidebar_position: 3
---

# `Ref` and `ref`

This is probably the most important part in Vue 3. Both `Ref` and `ref` are part of Vue 3 [Reactivity API](https://vuejs.org/api/reactivity-core.html#reactivity-api-core).

## What is `Ref`?

`Ref` is a **type** with one public property `value`.

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

`ref` is a **function** that accepts an argument of any type, and returns a `Ref` object with that "thing" as its' `value`. For example:

```ts showLineNumbers
import { ref } from 'vue'

// highlight-next-line
const name = ref('hello') // The type of name is Ref<string>

console.log(name.value) // 'hello'
```

Very straightforward, isn't it? Nothing more to explain for now!

:::caution

Well, the description here about `ref` is actually not 100% correct! If for some reason you want to directly jump to conclusions, please see [below](#the-real-ref).

:::

## Mutating a `Ref`

Because a `Ref` variable is just an object with `value` property, if we want to change the value in it, we can simply do it in the classic JavaScript way:

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
console.log(somebody) // { name: 'hello', age: 5 }

// highlight-next-line
somebody.value.name = 'world'
console.log(somebody) // { name: 'world', age: 5 }
```

Yeah, that's how easy it is!

## `ref` a `Ref`

So we know what `Ref` and `ref` are, but here comes the question — what happens if we use `ref` on a `Ref`? For example:

```ts showLineNumbers
import { ref } from 'vue'

const myName = ref('hello')
console.log(myName.value) // 'hello'

// highlight-next-line
const yourName = ref(myName)
// highlight-next-line
console.log(yourName.value.value) // Will this give us 'hello' too?
```

Based on how we describe `Ref` and `ref` earlier in this chapter, it's very natural to think that `ref(myName)` will give us something like this:

```ts showLineNumbers
const yourName = {
  value: {
    value: 'hello'
  }
}
```

But when you try to `console.log(yourName.value.value)`, you'll see that it's showing `undefined` instead of `hello`. If you're using TypeScript, you'll probably see an error in your IDE even before running anything. That's strange, isn't it? Apparently this happens because `ref` is actually doing more than what we think it can do!

## Under the Hood of `ref`

So what does `ref` actually do? Isn't it just wrapping the argument into a new `Ref` object and returns it to us? The answer is no. Under the hood of `ref`, it uses another function that's also from Vue 3 called [`reactive`](./reactivity-api-reactive-and-reactive.md), which we have not introduced yet.

Wait, does that mean we have to learn `reactive` before `ref`? Well, not really. You're still doing fine without knowing anything about `reactive`, don't you? That being said, we still want to give you the answer about why in the above example, `console.log(yourName.value.value)` logs `undefined`?

We'll explain more in detail when we get to `reactive`, for now the only thing to keep in mind is: **if the argument of `ref` is already a `Ref`, it'll just returns it without doing anything**.

So in the above example, writing `const yourName = ref(myName)` is equal to `const yourName = myName` because `myName` is a variable of type `Ref`. We can verify this by using the [strict equality operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality) (===) to check if `myName` and `yourName` are the same object.

```ts showLineNumbers
import { ref } from 'vue'

const myName = ref('hello')
console.log(myName.value) // 'hello'

const yourName = ref(myName)
console.log(yourName.value.value) // undefined

// highlight-next-line
console.log(myName === yourName) // true
```

We get `true` from the comparison, which means `ref` is returning the same value we just gave it — that also means if we want to get `hello` from `yourName`, we can just use `yourName.value` like how we did it with `myName`, just because they're the same object!


## `Ref` in `<template>` (Interpolations)

In Vue 2 we can access variables declared in `<script>` from `<template>` using 3 different syntax — double curly braces `{{ }}`, `v-on` (shorthand as `@`), and `v-bind` (shorthand as `:`). These 3 syntax still exist in Vue 3, but the logic is a little different. Use the following component as an example:

```html showLineNumbers
<template>
  <!-- highlight-next-line -->
  <div>{{ name.value }}</div>
</template>

<script setup>
import { ref } from 'vue'

const name = ref('hello')
</script>
```

Because `name` is a `Ref`, it is very reasonable to think that `<div>{{ name.value }}</div>` will give us `<div>hello</div>`. But when this component gets rendered, nothing shows up on the screen; it only renders `<div></div>` as the output HTML, no `hello` in the middle. Why is that?

This is because when we try to access `Ref` variables from `<template>`, sometimes (yes, SOMETIMES!) they will be automatically "unwrapped", which means in this case `{{ name }}` in `<template>` equals to `name.value` in `<script setup>`. Hence, **we must omit the `.value` to get the value of a `Ref` in `<template>` under some circumstances**. So what are these "circumstances"?

The rule is simple: **if a `Ref` variable is exposed as a top-level property in `<script setup>`, Vue will auto-unwrap it for us when it is used in `<template>`**. This rule also applies to v-on and v-bind.

So in the above example, if we want to display `hello` on the screen, we will have to write `{{ name }}` instead of `{{ name.value }}` because `name` is a top-level `Ref` in `<script setup>`, and Vue is going it auto-unwrap it for us.

```html showLineNumbers
<template>
  <!-- highlight-next-line -->
  <div>{{ name }}</div>
</template>

<script setup>
import { ref } from 'vue'

const name = ref('hello')
</script>
```

This time the component will correctly render `<div>hello</div>` as the output HTML.

Let's see one more example of auto-unwrap:

```html showLineNumbers
<template>
  <div>
    <h1>A: {{ age.toFixed }}</h1>
    <h2>B: {{ user.age.toFixed }}</h2>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const age = ref(5)

const user = {
  age: age,
}
</script>
```

In this example, the output HTML will be `<h1>A: function toFixed() { [native code] }</h1>` and `B: `. Do you know how does this happen?

<details>
  <summary>That happens because...</summary>

  - Both `age` and `user` are exposed as top-level properties in `<script setup>`, so `<template>` can access these two variables without problem.
  - Since `name` is a top-level `Ref` in `<script setup>`, it gets auto-unwrapped in `<template>`, which means `{{ age }}` in `<template>` will equal to `age.value` in `<script setup>`, thus resolves to `5`.
  - In JavaScript, `toFixed` is a method defined in `Number`; `5` is a number, so `5.toFixed` will give us that function, thus showing `function toFixed() { [native code] }` on the screen.
  - Although `user.age` and `age` are exactly the same variable in `<script setup>`, `{{ user.age }}` will NOT get auto-unwrapped in `<template>` because `user.age` is NOT a top-level property — `user` is!
  - Since `user.age` is not auto-unwrapped in `<template>`, `{{ user.age }}` in `<template>` will equal to `user.age` in `<script setup>`, thus resolves to `Ref<number>` (and the value is `5` by the way).
  - There's no property called `toFixed` in `Ref<number>` (see [above](#what-is-ref) if you forget why!), so `{{ user.age.toFixed }}` resolves to `undefined`, causing that block of HTML to show nothing.

</details>

Great, now you know how `Ref` works in `<template>`! This is especially important when using composables. Without knowing this, you will end up writing so many `.value` in `<template>` that could have been avoided, which decreases the readibility of your code.
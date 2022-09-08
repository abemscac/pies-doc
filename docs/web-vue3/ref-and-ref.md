---
title: Ref and ref
sidebar_position: 3
---

# `Ref` and `ref`

Probably the most important part in Vue 3!

## What is a `Ref`?

`Ref` is a **type** with only one public property `value`.

A simple interface for `Ref` would look like this:

```ts showLineNumbers
interface Ref<T> {
  value: T
}
```

A `Ref` variable can contain only **one** value of any type, so you can have:

- `Ref<number>`
- `Ref<boolean>`
- `Ref<Map>`
- `Ref<{ id: number, name: string }>`
- `Ref<YourOwnInterface[]>`
- `Ref<Promise<() => void>>`
- ...anything you need!

## What is `ref`?

`ref` is a **function** that accepts one argument of any type, and returns a `Ref` object with that argument as its' `value`. For example:

```ts showLineNumbers
import { ref } from 'vue'

const name = ref('hello')

console.log(name.value) // 'hello'
```

To mutate the value in it, we can simply do it in the classic JavaScript way:

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

That's how easy it is!

## `ref` a `Ref`

So we know what `Ref` and `ref` are, but here comes the question — what if we use `ref` on a `Ref`? For example:

```ts showLineNumbers
import { ref } from 'vue'

const myName = ref('hello')
// highlight-next-line
const yourName = ref(myName)
```

Based on how we describe `Ref` and `ref` earlier in this chapter, it's very natural to think that `ref(myName)` will evaluate to a nested object like `{ value: { value: 'hello' }}`. But when we try to `console.log(yourName.value.value)`, you'll see that it's showing `undefined` instead of `hello`.

```ts
console.log(yourName.value.value) // undefined
```

If you're using TypeScript, you'll probably see an error in your IDE even before running anything. This happens because `ref` is actually doing more than just wrapping stuff into `Ref` structure.

## Under the Hood of `ref`

So what does `ref` actually do? Well, that depends on the type of the argument we send to `ref`. The returned type of `ref` is guaranteed to be a `Ref`, what really matters is what `value` is in the `Ref`.

- If the arugment is a [primitive value](https://developer.mozilla.org/en-US/docs/Glossary/Primitive), `ref` will directly use it as the `value` of the `Ref`, and "track" any changes we made to it.
- Otherwise `ref` would call another function called [`reactive`](./reactive.md) internally, and use the returned value from `reactive` as the `value` of the `Ref`. We'll talk more about `reactive` when we get to it, just don't worry about it for now.

:::info

Although the returned value of `ref` seems to be a plain object of type `Ref` (e.g. `{ value: 'hello' }`), it's actually not! Instead, it's an instance of a class called `RefImpl` which has only one public property `value`. So from user's perspective (you and me, the developers), it's okay to just see `RefImpl` as `Ref` because they expose exactly the same public property.

:::

Let's get back to the [`ref` a `Ref`](#ref-a-ref) example — why `console.log(yourName.value.value)` logs `undefined`? It has something to do with the `reactive` function we just mentioned, we'll explain that in detail in [`ref` VS `reactive`](./ref-vs-reactive). For now the only thing to know is if the argument of `ref` is **already a `Ref`**, it'll just returns it without doing anything.

Therefore, in the above example, writing `const yourName = ref(myName)` will actually equal to `const yourName = myName` because `myName` is a variable declared via `ref`. We can verify this by using the [strict equality operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality) (===) to check if `myName` and `yourName` are the same object.

```ts showLineNumbers
import { ref } from 'vue'

const myName = ref('hello')
const yourName = ref(myName)
// highlight-next-line
console.log(myName === yourName) // true
```

Thus, to get the value of `yourName`, all we need to do is using `yourName.value`, just like how we get value from `myName`. The reason is simple — because they're the same object!

```ts
import { ref } from 'vue'

const myName = ref('hello')
const yourName = ref(myName)
console.log(yourName.value) // 'hello'
```

:::tip

Vue provides some convenient utility functions like [`isRef`](https://vuejs.org/api/reactivity-utilities.html#isref) and [`unref`](https://vuejs.org/api/reactivity-utilities.html#unref). They may come in handy in your custom functions sometime.

:::

Great, we've learned enough about how `ref` and `Ref` works in `<script>` for now. Let's see how `Ref` works in `<template>`!

## `Ref` in `<template>`

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

Because `name` is a `Ref`, it is very reasonable to think that `<div>{{ name.value }}</div>` will evaluate to `<div>hello</div>`. But when this component gets rendered, the output HTML is actually `<div></div>` — where's our `hello`?

In Vue 3, when we try to access `Ref` variables from `<template>`, **sometimes** (yes, SOMETIMES!) they will be automatically **"unwrapped"**. To unwrap (or **unref**) means to take the `value` out from `Ref`. Hence, we must omit the `.value` behind a `Ref` in `<template>` under some circumstances. So what are these "circumstances"?

The rule is simple: if a `Ref` variable is exposed as a **top-level property** in `<script setup>`, Vue will auto-unwrap it in `<template>`. This rule also applies to v-on and v-bind.

So in the above example, if we want to display `hello` on the screen, we will have to write `{{ name }}` instead of `{{ name.value }}` because `name` is a top-level `Ref` in `<script setup>`. Vue is going to auto-unwrap it, and we can't say no.

```html showLineNumbers
<template>
  <!-- This will work! -->
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

The output HTML of this component is:

```html
<div>
  <h1>A: function toFixed() { [native code] }</h1>
  <h2>B: </h2>
</div>
```

Do you know why there's such difference?

<details>
  <summary>That happens because... (think about it for a while before revealing the answer!)</summary>

  - Both `age` and `user` are exposed as top-level properties in `<script setup>`.
  - Since `name` is a top-level `Ref` in `<script setup>`, it gets auto-unwrapped in `<template>`, which means `{{ age }}` in `<template>` will equal to `age.value` in `<script setup>`, thus resolves to `5`.
  - In JavaScript, `toFixed` is a method defined in `Number`; `5` is a number, so `5.toFixed` will evaluate to that function, thus showing `function toFixed() { [native code] }` on the screen.
  - Although `user.age` and `age` are exactly the same variable in `<script setup>`, `{{ user.age }}` will **NOT** get auto-unwrapped in `<template>` because `user.age` is **NOT** a top-level property — `user` is!
  - Since `user.age` is not auto-unwrapped in `<template>`, `{{ user.age }}` in `<template>` will equal to `user.age` in `<script setup>`, which is `Ref<number>` instead of `number`.
  - `Ref<number>` does not have a property called `toFixed`, so `{{ user.age.toFixed }}` resolves to `undefined` in `<template>`, so `<h2>B: {{ undefined }}</h2>` will be rendered as `<h2>B: </h2>`.

</details>

Great, now you know how `Ref` works in `<template>`! This is especially important when using composables. Without knowing this, you will end up writing so many `.value` in `<template>` that could have been avoided, which decreases the readibility of your code.
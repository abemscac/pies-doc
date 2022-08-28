---
title: Reactivity API - Reactive and reactive
sidebar_position: 4
---

# `reactive`

This chapter is a part of Vue 3 [Reactivity API](https://vuejs.org/api/reactivity-core.html#reactivity-api-core).

## What is `reactive`

`reactive` is a **function** that accepts only **one non-primitive value**, and returns a **"reactive"** version of that thing, with type `UnwrapNestedRefs`. This one-line definition actually sums it up very well, but it might have brought so many questions to your head.

:::note

You don't have to figure out all these stuff now! Feel free to skip these questions and move on!

- What is a **"non-primitive value"**?
  - Actually this is not a Vue thing. In JavaScript, anything that is not a [primitive value](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) is called non-primitive value (*WOW, thanks for the explanation!*).
  - In other words, a non-primitive value in JavaScript means anything **being passed by reference** in functions. For example, plain object, `Array`, and `Map` are all non-primitive values, because are passed by reference in functions.
- What do you mean **"reactive"** version? Is there any difference betweeen a "normal" variable and a "reactive" variable?
  - We would like to explain those stuff by using some examples, please see [below](#reactive-variable-vs-non-reactive-variable).
- What is **UnwrapNestedRefs**?
  - It's a type that has something to do with [`Ref`](./reactivity-api-ref-and-ref), please see [below](#what-is-unwrapnestedrefs).

:::

Let's take a look at an example of `reactive`:

```ts showLineNumbers
import { reactive } from 'vue'

const user = reactive({
  name: 'hello',
  age: 5,
})

console.log(user.name) // 'hello'
console.log(user.age) // 5
```

As you can see, the `reactive` function gives you exactly what you gave it; the variable structure and type remains the same.

To mutate a reactive value, we can simply do it in the classic JavaScript way:

```ts showLineNumbers
import { reactive } from 'vue'

const user = reactive({
  name: 'hello',
  age: 5,
})

console.log(user.name) // 'hello'
console.log(user.age) // 5

// highlight-next-line
user.name = 'world'
// highlight-next-line
user.age = 10

console.log(user.name) // 'world'
console.log(user.age) // 10
```

Nice and easy. So what would happen if we use `reactive` on a primitive value like `0`? For example:

```ts showLineNumbers
import { reactive } from 'vue'

const count = reactive(0)
```

Since `reactive` is only designed for non-primitive value, when `reactive` sees a primitive value, it'll directly returns it without doing anything. So the type of `count` will be a non-reactive `number`.

In development mode, you should see a warning log says `value cannot be made reactive: true`.

## Normal (Non-Reactive) Variable VS Reactive Variable

To get straight to the point:

- A **reactive variable** means when the value changes, it **will re-render components** that access it.
- A **non-reactive variable** means when the value changes, it **will not re-render components** that access it.

Let's take a look at an example:

```html showLineNumbers title="Reactive variable"
<template>
  <div>
    <h1>{{ user.name }} is {{ user.age }} years old</h1>
    <button @click="getOld">Get Old</button>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const user = reactive({
  name: 'hello',
  age: 5,
})

const getOld = () => {
  user.age++
  console.log(user.age)
}
</script>
```

The logic of this component is very simple — every time we click "Get Old", `user.age` is going to be incremeneted by 1. In the very beginning, we see `hello is 5 years old` on the screen; after clicking "Get Old" for 3 times, we now see `user is 8 years old` on the screen.

Nice and simple, now let's look at another example:

```html showLineNumbers title="Non-reactive variable"
<template>
  <div>
    <h1>{{ user.name }} is {{ user.age }} years old</h1>
    <button @click="getOld">Get Old</button>
  </div>
</template>

<script setup>
const user = {
  name: 'hello',
  age: 5,
}

const getOld = () => {
  user.age++
  console.log(user.age)
}
</script>
```

The code here is almost the same with the previous example, the only difference is we didn't use `reactive` when declaring `user`.

Click on "Get Old" for a couple of times, and you'll find that no matter how many times we click "Get Old", the text on the screen will always be `hello is 5 years old`, it just don't change! Furthermore, we are 100% sure `user.age` is being updated! We can verify that by checking the logs in console.

The is happens because Vue is designed in such way that components will only re-render when reactive variables changes. In the 1st example, we declare `user` with `reactive`, so any change we made to `user` will cause the component to re-render. On the other hand, in the 2nd example, `user` is nothing but a normal, non-reactive variable in a component, which will not lead to any re-render no matter how many times it changes.

But here's a cool fact — that doens't mean the changes of non-reactive variables will never be reflected on the screen! Please take a look at the following example:

```html showLineNumbers title="Both reactive and non-reactive variables"
<template>
  <div>
    <h1>{{ user.name }} is {{ age }} years old</h1>
    <button @click="changeName">Change Name</button>
    <button @click="getOld">Get Old</button>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const user = reactive({
  name: 'hello',
})

let age = 5

const changeName = () => {
  user.name += 'o'
}

const getOld = () => {
  age++
}
</script>
```

In this example, we declare `user` with `reactive`, and declare `age` as a non-reactive variable. We know that the changes made to `user` will cause the component to re-render, while the changes made to `age` will not. Clicking "Get Old" will incremenet `age` variable by 1, and clickig "Change Name" will append an `o` after `user.name`.

So what would happen if we click "Get Old" multiple times, then proceed to click "Change Name"?

@@@@@@@@@@@@@@@GIF

The change we made to `age` is now being reflected on the screen! Quite confusing, isn't it? When using Vue 3, you should **always avoid such pattern** because it is not only more likely to cause bugs, but makes your app more difficult to maintain.

So when should a variable be made reactive? A simple rule of thumb is:

- Always make a variable reactive when this thing **will change**, and **users must be informed of that change** on the screen.

- Otherwise just make it non-reactive.

## What is `UnwrapNestedRefs`

`UnwrapNestedRefs` is a **type** that pretty much explains itself — a thing that unwraps all of the nested `Ref`s! To be more specific, `UnwrapNestedRefs` means:

- A
- B
- C

## `reactive` or `ref`

@@@@@@@@@@@@@@@@@@@@@@
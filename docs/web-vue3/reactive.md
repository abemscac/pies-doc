---
title: reactive
sidebar_position: 4
---

# `reactive`

## What is `reactive`

`reactive` is a **function** that accepts only **one non-primitive value** as argument, and returns a **"reactive" (proxy) variable** based on that value **without mutating the argument**, with type `UnwrapNestedRefs<T>`. This one-line definition actually sums it up very well, but it might have brought so many questions to your head:

- What is **non-primitive value**?
- What is **reactive** (proxy) variable? What's the difference betweeen a normal variable and a reactive variable?
- What is `UnwrapNestedRefs<T>`?

We'll try to explain these stuff in this chapter. But before doing that, let's take a look at a simple example of `reactive` first:

```ts showLineNumbers
import { reactive } from 'vue'

const user = reactive({
  name: 'hello',
  age: 5,
})

console.log(user.name) // 'hello'
console.log(user.age) // 5
```

As you can see, the `reactive` function gives you exactly what you gave it; the variable structure remains all the same.

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

Esay peasy!

## `reactive` Only Works with Non-Primitive Values

:::info

What is **non-primitive value**? Simply put, anything that is not a primitive value is called non-primitive value (yeah, of course). If you don't know what primitive value is, please see [here](https://developer.mozilla.org/en-US/docs/Glossary/Primitive).

:::

If you try to use `reactive` on **primitive value** like `0`, you'll see a warning log that says `value cannot be made reactive: 0` in development mode.


```ts showLineNumbers
import { reactive } from 'vue'

const count = reactive(0) // This is wrong!
```

This is because `reactive` is designed for **non-primitive value**. You can think of the implementation of `reactive` to be something similar to the following pseudocode:

```ts
const reactive = (arg) => {
  if (arg is primitive value) {
    if (is in development mode) {
      console.warn(`value cannot be made reactive: ${String(arg)}`)
    }
    return arg
  }
  return reactive version of arg
}
```

As you can see, `reactive` will directly returns the argument when the argument is a primitive value. This means writing `const count = reactive(0)` is actually the same as `const count = 0` thanks to how `reactive` works internally. Even if you declare it with `let` like `let count = reactive(0)`, your component will still NOT re-render when `count` changes, because `count` is nothing more than a normal `number`.

:::info

If you need "reactive" primitive value, you should use [`ref`](./ref-and-ref#what-is-ref).

:::

We've learned enough about how `reactive` works in `<script>`. Let's see how it works in `<template>`!

## Normal Variable VS Reactive Variable

What's the difference between a normal variable and a reactive variable? To get straight to the point:

- A **reactive variable** means when the value changes, it **will re-render components** that access it.
- A **non-reactive variable** means when the value changes, it **will not re-render components** that access it.

Let's take a look at **reactive variable** first:

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

The logic of this component is very simple — every time we click "Get Old", `user.age` will be incremeneted by 1. In the very beginning, we see `hello is 5 years old` on the screen; after clicking "Get Old" for 3 times, we now see `user is 8 years old`.

@@@@@@@@@@@@@@@GIF

Nice and simple, now let's take a look at **non-reactive variable**:

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

This component is almost the same as the previous one, the only difference is we're now declaring `user` without using `reactive`.

Click on "Get Old" for a couple of times, and you'll find that no matter how many times the button is clicked, the text on the screen will always be `hello is 5 years old`, even though we're very sure `user.age` has been correctly updated (we can check the `console.log(user.age)` to verify that).

@@@@@@@@@@@@@@@@@@GIF

So why is this happening? This happens because Vue is designed in such way that components will only re-render when **reactive variables** and/or **`Ref` variables** change. So if we declare `user` without using `reactive` or `ref`, it will be nothing but a normal object. Our components just don't care about the changes we made to those normal, **non-reactive** variables.

But be careful, that doens't mean the changes being made to a non-reactive variable will never be reflected on the screen. Let's take a look at an example of using both reactive and non-reactive variables at the same time:

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

The logic of this component is also very simple — clicking "Get Old" will incremenet `age` by 1, and clicking "Change Name" will append an `o` to `user.name`.

Here we declare `user` as a reactive variable, and declare `age` as a non-reactive variable. We know that the changes being made to `user` will cause the component to re-render because `user` is reactive, while the changes made to `age` will not.

At first we click "Change Name" for a couple of times, and each time we click it, the component re-renders with an `o` being appended to `hello`.

@@@@@@@@@@@@@@@GIF

Then we click "Get Old" for a couple of times as well, this time the component does not re-render. That's exepcted because `age` is just a normal, non-reactive variable.

@@@@@@@@@@@@@@@@GIF

Then we go back to click "Change Name" again, and something strange happens — the `5 years old` on the screen is now being changed!

@@@@@@@@@@@@@@@GIF

Quite confusing, isn't it? The secret behind this is:

- When we click "Get Old", the value of `age` do gets updated; it's just that this change is not reflected on the screen yet because the component does not re-render.
- When we click "Change Name", `user.name` gets updated; since `user` is a reactive variable, the component will now re-render with the latest state of variables in `<script>`.

So When using Vue 3, you should **always avoid such pattern** because it is more likely to cause bugs in your app. Knowing when to make a variable reactive is important, a simple rule of thumb is:

- Always make a variable reactive (by using `ref` or `reactive`) if this thing **will change**, and **users must be informed of that change** on the screen.
- Otherwise just make it non-reactive.

## What is `UnwrapNestedRefs<T>`

:::caution Prerequisites

You must learn [`Ref`](./ref-and-ref#what-is-ref) first before getting into this section.

:::

`UnwrapNestedRefs<T>` is a **type** that pretty much explains itself — unwrap all of the nested `Ref`s! To be more specific, `UnwrapNestedRefs` means to **recursively unwrap all `Ref`s in a plain object** (in case you're new to TypeScript, `<T>` is the [Generic Type](https://www.typescriptlang.org/docs/handbook/2/generics.html) syntax of TypeScript.)

For example, if we have an object like this:

```ts showLineNumbers
import { ref } from 'vue'

const child = ref({ name: 'hello' })

const parent = reactive({
  name: 'world',
  child,
})
```

In the above example:

- To get `hello` from `child` (in `<script>`), we have to write `child.value.name` because `child` is a `Ref`.
- To get `hello` from `parent`, we have to write `parent.child.name` instead of `parent.child.value.name` because `parent.child` has been unwrapped by `reactive`.

Reactivity still remains after `reactive` internally unwraps `Ref`s; mutating `child` will also effect `parent.child` (and vice versa) because they're actually pointing to the same object:

```ts showLineNumbers title=UnwrapNestedRefs
import { ref } from 'vue'

const child = ref({ name: 'hello' })

const parent = reactive({
  child,
})

// highlight-next-line
parent.child.name = 'world'
console.log(child.value.name) // 'world'

// highlight-next-line
child.value.name = 'hello again'
console.log(parent.child.name) // 'hello again'
```

It may have confused you at first glance, but don't panic yet! It's actually very easy to understand — it works in the same way as how object works in JavaScript.

In JavaScript, putting one object into another object will kind of "connect" them together because objects are being passed by reference. For example:


```ts showLineNumbers
const child = {
  name: 'hello',
}

const parent = {
  child,
}

console.log(child) // { name: 'hello' }
console.log(parent) // { child: { name: 'hello' } }

// highlight-next-line
child.name = 'world' // Or parent.child.name = 'world'

console.log(child) // { name: 'world' }
console.log(parent) // { child: { name: 'world' } }
```

We know that "unwrap" is just to extract the `value` out from `Ref`; since `child.value` is an object, the idea of `UnwrapNestedRefs<T>` is very similar to "peel" the `Ref` off the variable. So in the example of UnwrapNestedRefs, `parent.child` will directly points to `child.value` instead of `child` itself.

## Props is Reactive

Have you ever wonder why component re-renders whenever `props` changes? The answer is simple — because `props` is a reactive variable! We can verify that by using the [`isReactive`](https://vuejs.org/api/reactivity-utilities.html#isreactive) utility function in Vue 3:

```ts showLineNumbers
import { isReactive } from 'vue'

const props = defineProps<{
  name: string
}>()

console.log(isReactive(props)) // true
```
---
title: reactive
sidebar_position: 4
---

import Video from '@site/src/components/Video'

# `reactive`

## What is `reactive`?

`reactive` is a **function** that accepts a **non-primitive** value as argument, and returns a **"reactive" (proxy) variable** based on that value **without mutating the argument**, with type `UnwrapNestedRefs<T>`. This one-line definition actually sums it up very well, but it might have brought so many questions to your head:

- What is **non-primitive value**?
- What is a **reactive** variable? What's the difference betweeen a normal variable and a reactive variable?
- What is `UnwrapNestedRefs<T>`?

We'll try to explain these stuff in this chapter. But before doing that, let's take a look at a simple example of `reactive`:

```ts showLineNumbers
import { reactive } from 'vue'

const user = reactive({
  name: 'hello',
  age: 5,
})

console.log(user.name) // 'hello'
console.log(user.age) // 5
```

As you can see, the returned value of `reactive` looks exactly the same as what you gave it; the variable structure remains just the same.

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

## `reactive` Only Works with Non-Primitive Values

:::info

What is **non-primitive value**? Simply put, anything that is not a primitive value is called non-primitive value (yeah, of course). If you don't know what primitive value is, please see [here](https://developer.mozilla.org/en-US/docs/Glossary/Primitive).

:::

If you try to use `reactive` on **primitive value** like `0`, you'll see a warning in console that says `value cannot be made reactive: 0` in development mode.


```ts showLineNumbers
import { reactive } from 'vue'

const count = reactive(0) // value cannot be made reactive: 0
```

This is because `reactive` is only designed for **non-primitive** values. You can think of the implementation of `reactive` to be something similar to the following pseudocode:

```ts showLineNumbers
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

The above pseudocode is not quite correct, but that's fine, we'll explain more in detail in [`ref` VS `reactive`](./ref-vs-reactive#how-reactive-works). Just don't worry too much at the moment.

As you can see, `reactive` will directly returns the argument when the argument is a primitive value. This means writing `const count = reactive(0)` is actually the same as `const count = 0` due to how `reactive` works internally. Even if you declare it using `let count = reactive(0)`, your component will still not re-render when `count` changes, because `count` is nothing more than a normal `number`.

:::info

If you really need to use `reactive` on primitive values, you should use [`ref`](./ref-and-ref#what-is-ref).

:::

We've learned enough about how `reactive` works in `<script>`. Let's see how it works in `<template>`.

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

The logic of this component is very simple — every time we click "Get Old", `user.age` will be incremeneted by 1. In the very beginning, we see `hello is 5 years old` on the screen; after clicking "Get Old" for 3 times, we now see `hello is 8 years old`.

<Video src="/video/reactive_reactive-variable.mov" />

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

Click on "Get Old" for a couple of times, and you'll find that no matter how many times the button is clicked, the text on the screen will always be `hello is 5 years old`, even though we're very sure `user.age` has been correctly updated (we can check the console to verify that).

<Video src="/video/reactive_non-reactive-variable.mov" />

So why is this happening? This happens because Vue is designed in such way that components will only re-render when **reactive variables** and/or **`Ref` variables** change. So if we declare `user` without using `reactive` or `ref`, Vue will not do anything when `user` changes, because `user` is nothing more than a normal variable.

But be careful, that doens't mean the changes being made to a non-reactive variable will never be reflected on the screen. Take a look at the following example:

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

In this example, we use both reactive and non-reactive variables at the same time. The logic of this component is also very simple — clicking "Get Old" will incremenet `age` by 1, and clicking "Change Name" will append an `o` to `user.name`.

Here we declare `user` as a reactive variable, and declare `age` as a non-reactive variable. We know that the changes being made to `user` will cause the component to re-render because `user` is reactive, while the changes made to `age` will not.

At first we click "Change Name" for a couple of times, and each time we click it, the component re-renders with an `o` being appended to `hello`.

<Video src="/video/reactive_both-0.mov" />

Then we click "Get Old" for a couple of times as well, this time the component does not re-render. That's exepcted because `age` is just a normal, non-reactive variable.

<Video src="/video/reactive_both-1.mov" />

Then we go back to click "Change Name" again, and something strange happens — the number on the screen is now being changed!

<Video src="/video/reactive_both-2.mov" />

Quite confusing, isn't it? The secret behind this is:

- When we click "Get Old", the value of `age` do gets updated; it's just not being reflected on the screen yet because the component does not re-render.
- When we click "Change Name", `user.name` gets updated; since `user` is a reactive variable, the component will now re-render with the latest state of variables in `<script>`.

So When using Vue 3, you should **always avoid such pattern** because it is more likely to cause bugs in your app (and make it super hard to maintain). Knowing when to make a variable reactive is important, a simple rule of thumb would be:

- Always make a variable reactive (by using `ref` or `reactive`) if the value **will change**, and **users must be informed of that change** on the screen.
- Otherwise just make it non-reactive.

## What is `UnwrapNestedRefs<T>`?

:::caution Prerequisites

You must learn [`Ref`](./ref-and-ref#what-is-a-ref) before getting into this section.

:::

`UnwrapNestedRefs<T>` is a **type** that pretty much explains itself — unwrap all of the nested `Ref`s! To be more specific, `UnwrapNestedRefs` means to **recursively unwrap all `Ref`s in a plain object** (in case you're new to TypeScript, `<T>` is the [Generic Type](https://www.typescriptlang.org/docs/handbook/2/generics.html) syntax of TypeScript; it's fine to ignore it for now.)

@@@@@@

## The Reactivity of Reactive Object

### Does Destructing Assignment Breaks Reactivity?

A common mistake developers make is they take primitive values out from reactive objects, assigning them to some other variables, and hope they will stay "connected". The most common example is destructing assignment:

```ts showLineNumbers
const user = reactive({
  name: 'hello',
  age: '5',
})

const { name: myName, age: myAge } = user
```

We may think to ourselves "Okay, so now `myName` and `myAge` are connected to `user`", and proceed to mutate `user.name` and `user.age`:

```ts showLineNumbers
import { reactive } from 'vue'

const user = reactive({
  name: 'hello',
  age: '5',
})

const { name: myName, age: myAge } = user

// highlight-next-line
user.name = 'world'
// highlight-next-line
user.age = 10

console.log(user.name, user.age) // 'world' 10 
console.log(myName, myAge) // 'hello' 5
```

As you can see, the changes we made to `user` did not effect `myName` and `myAge` at all (and vice versa!).

*So there's a problem when using destructing assignment with `reactive`?*

Kind of, but not really. The same thing would happen even if we write `const myName = user.name` (because that's exactly what destructing assignment do), so it's not quite correct to say destructing assignment causes the problem.

*Okay, so why is this happening then?*

The answer is actually very simple. All we have to do is to recap how variable works in JavaScript, and you'll know it right away!

in JavaScript, variables are either being **passed by value** or being **passed by reference**. For primitive values, they are always being **passed by value**, and non-primitive values are always being **passed by reference**. So by writing `const { name: myName, age: myName } = user`, we're actually saying:

```js
const myName = user.name
const myAge = user.age
```

You see the problem already, don't you? Because `user.name` (string) and `user.age` (number) are both **primitive values**, they are being **passed by value** when declaring `myName` and `myAge`; that means `myName` and `myAge` will be new variables with new memory addresses, thus they "disconnect" from `user`.

So as long as the target value is non-primitive, you can use as many destructing assignment as you want without having any problem. For example:

```ts showLineNumbers
import { reactive } from 'vue'

const user = reactive({
  name: 'hello',
  age: '5',
  child: {
    name: 'I am child'
  }
})

const { child } = user

// highlight-next-line
child.name = 'world'

console.log(user.child.name) // 'world'
console.log(child.name) // 'world'
```

The example above demonstrate the common misconception that everything we get from reactive object is "connected" to the source, but it's acutally not. The reason why mutating `child` would effect `user.child` is because `user.child` is a non-primitive value, which means it is being passed to `child` by reference.

### How to Keep Reactivity

Is there a way that we can use the convenient destructing assignment syntax with `reactive`, but keeping reactivity at the same time? Yes, there is! The closest we can get is to use [`toRef`](https://vuejs.org/api/reactivity-utilities.html#toref) and/or [`toRefs`](https://vuejs.org/api/reactivity-utilities.html#torefs) functions.

`toRef` and `toRefs` do exactly what they say — turn something into a [`Ref`](./ref-and-ref#what-is-a-ref). These two functions are almost the same, but in a nutshell, **`toRefs` = a lot of `toRef`**. For example:

```ts showLineNumbers
import { reactive, toRef, toRefs } from 'vue'

const user = reactive({
  name: 'hello',
  age: '5',
  child: {
    name: 'I am child'
  }
})

// We can either do this:
const myName = toRef(user, 'name')
const myAge = toRef(user, 'age')

// or:
const { name: myName, age: myAge } = toRefs(user)
```

Most of the time we'll just use `toRefs` because it's slightly more convenient than `toRef`, but the results are the same. The returned type of `toRef` will be `Ref<T>`, and is connected to the source property. By using `toRef` and/or `toRefs`, we no longer have to worry about if a property is primitive or not. Just turn it into a `Ref`, and everything would work as expected!

## Props are Reactive!

One thing worth mentioning is, the returned value of [`defineProps`](https://vuejs.org/api/sfc-script-setup.html#defineprops-defineemits) is actually a reactive object! We can verify this by using [`isReactive`](https://vuejs.org/api/reactivity-utilities.html#isreactive) function:

```ts showLineNumbers
import { isReactive } from 'vue'

const props = defineProps<{
  name: string
  age: number
}>()

console.log(isReactive(props)) // true
```

So it's perfectly fine to treat props as a value returned by `reactive` function in `<script>`. We'll talk more about props when we get to [Props](./props).
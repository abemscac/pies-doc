---
sidebar_position: 4
description: What does reactive function do in Vue 3.
keywords: [piesdoc, vue3, vue reactive(), vue reactivity, vue reactive proxy]
---

import Video from '@site/src/widgets/Video'

# `reactive()`

## What Is `reactive()`?

`reactive()` is a **function** that takes a **non-primitive** value as argument, and returns a **reactive proxy** of type `UnwrapNestedRef<T>`.

This one line definition actually sums it up very well, but it might have brought so many questions to your head:

- What is a **non-primitive value**?
- What is a **reactive proxy**?
- What is **`UnwrapNestedRef<T>`**? (optional)

We'll try to explain these things in this chapter. But before doing that, let's take a look at a simple example of `reactive()`:

```ts showLineNumbers
import { reactive } from 'vue'

const user = reactive({
  name: 'hello',
  age: 5,
})

console.log(user.name) // 'hello'
console.log(user.age) // 5
```

In this example, the returned value of `reactive()` has exactly the same data structure as what we gave it (but that's not always the case!). To mutate the value of a reactive proxy, we can simply do it in the classic JavaScript way:

```ts showLineNumbers
import { reactive } from 'vue'

const user = reactive({
  name: 'hello',
  age: 5,
})

console.log(user.name, user.age) // 'hello', 5

// highlight-next-line
user.name = 'world'
// highlight-next-line
user.age = 10

console.log(user.name, user.age) // 'world', 10
```

## `reactive()` Only Works With Non-primitive Values

:::info

What are **non-primitive values**? Simply put, anything that is not a primitive value is called non-primitive value (yeah, of course).
Please see [here](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) for the definition of primitive values.

:::

If you try to use `reactive()` on primitive value like `0`, you'll see a warning in console that says `value cannot be made reactive: 0` in development mode.

```ts showLineNumbers
import { reactive } from 'vue'

const count = reactive(0) // value cannot be made reactive: 0
```

This is because `reactive()` is only designed for **non-primitive** values. If the argument is a primitive value, `reactive()` returns it immediately.
This means `const count = reactive(0)` will do the same thing as `const count = 0` due to how `reactive()` works internally.
Even if you declare it using `let count = reactive(0)`, your component will still not re-render when `count` changes, because `count` is nothing more than a normal `number`.

:::info

- If you need reactive primitive values, you should use [`ref()`](./ref-and-ref#what-is-ref).
- We'll talk more about how `reactive()` works in [`ref()` or `reactive()`](./ref-or-reactive#how-reactive-works).

:::

## What Is a Reactive Proxy?

If you don't know what [proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) is, don't worry; you can still learn `reactive()` very well without knowing it!

Briefly speaking, a proxy is an object that allows you to run custom logic whenever someone tries to access or change the value in a targeted object. That's how Vue applies reactivity to reactive proxies.

So you can just think of a reactive proxy as something that has almost the same data structure as the targeted object, the only difference is it runs some extra logic when the value changes.

### Non-reactive Value in `<template>`

Let's start by looking at an example of **non-reactive value**, as known as the standard, normal JavaScript variable. For example, a plain object:

```html title="Non-reactive value" showLineNumbers
<template>
  <div>
    <h1>{{ user.name }} is {{ user.age }} years old</h1>
    <button @click="getOld">Get Old</button>
  </div>
</template>

<script setup>
// highlight-start
const user = {
  name: 'hello',
  age: 5,
}
// highlight-end

const getOld = () => {
  // highlight-next-line
  user.age++
  console.log(user.age)
}
</script>
```

The logic of this component is very simple — every time we click "Get Old", `user.age` will be incremented by 1.
In the very beginning, we see `hello is 5 years old` on the screen; no matter how many times the button is clicked, the number on the screen will always be `5`.

<Video src="/video/vue3/reactive_non-reactive-value.mov" />

This happens because `user` is not a reactive variable declared by using either `ref()` or `reactive()`. Since it's a non-reactive variable, our component just doesn't care about its changes. Even though the value of `user.age` did get updated, the component still didn't re-render.


### Reactive Proxy in `<template>`

Now let's take a look at an example of **reactive proxy**:

```html title="Reactive proxy" showLineNumbers
<template>
  <div>
    <h1>{{ user.name }} is {{ user.age }} years old</h1>
    <button @click="getOld">Get Old</button>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

// highlight-start
const user = reactive({
  name: 'hello',
  age: 5,
})
// highlight-end

const getOld = () => {
  // highlight-next-line
  user.age++
  console.log(user.age)
}
</script>
```

This component is almost the same as the previous one, the only difference is we're now declaring `user` with `reactive()`. Click the button a couple of times, and you'll see the component finally gets re-rendered as we expected it to be.

<Video src="/video/vue3/reactive_reactive-proxy.mov" />

So why would using `reactive()` make such difference? This is because Vue is designed in such way that by default, components re-render whenever **reactive proxy** or **`Ref<T>`** changes. So if we declare `user` without using `reactive()` or `ref()`, Vue will not do anything when `user` changes because `user` is neither a reactive proxy nor a `Ref<T>`.

### Both Reactive and Non-reactive Values

But be careful, that doesn't mean the changes being made to non-reactive values will never be reflected on the screen. Let's take a look at the following example:

```html title="Both reactive and non-reactive values" showLineNumbers
<template>
  <div>
    <h1>{{ cat.name }} is {{ dog.age }} years old</h1>
    <button @click="changeName">Change Name</button>
    <button @click="getOld">Get Old</button>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

// highlight-start
const cat = reactive({
  name: 'hello',
})
// highlight-end

const changeName = () => {
  // highlight-next-line
  cat.name += 'o'
}

// highlight-start
const dog = {
  age: 5,
}
// highlight-end

const getOld = () => {
  // highlight-next-line
  dog.age++
}
</script>
```

In this example, we use both reactive and non-reactive values at the same time. The logic is simple — clicking "Change Name" will append an `o` to `cat.name`, and clicking "Get Old" will increment `dog.age` by 1.

Here we declare `cat` as a reactive proxy, and declare `dog` as a non-reactive object. We know that the changes being made to `cat` will cause the component to re-render because `cat` is a reactive proxy, while the changes being made to `dog` will not.

At first we click "Change Name" a couple of times, and each time we click it, the component re-renders with an `o` being appended to `hello`.

<Video src="/video/vue3/reactive_both-0.mov" />

Then we click "Get Old" a couple of times as well, this time the component does not re-render. That's expected because `dog` is neither a reactive proxy nor a `Ref<T>`.

<Video src="/video/vue3/reactive_both-1.mov" />

Then we go back to click "Change Name" again, and something strange happened — the `5` on the screen is now being changed!

<Video src="/video/vue3/reactive_both-2.mov" />

Quite confusing, isn't it? The secret behind this is:

- When we click "Get Old", the value of `dog.age` do gets updated; it's just not being reflected on the screen yet because the component does not re-render.
- When we click "Change Name", `cat.name` gets updated; since `cat` is a reactive proxy, the component will now re-render with the latest state of variables in `<script>`.

So When using Vue 3, you should **always avoid mixing reactive values and non-reactive values in `<template>`** because it is more likely to cause bugs in your app. Knowing when to make a variable reactive is important, a simple rule of thumb would be:

- Always make a variable reactive (by using either `ref()` or `reactive()`) if the value **will change**, and **users must be informed of that change** on the screen.
- Otherwise just make it non-reactive.

## The Reactivity of Reactive Proxy

### Does Destructing Assignment Break Reactivity?

A common mistake developers make is they take primitive values out from a reactive proxy, assigning them to some other variables, and think they are still reactive. The most common case is destructing assignment:

```ts showLineNumbers
import { reactive } from 'vue'

const user = reactive({
  child: {
    name: 'hello',
  },
})

// highlight-next-line
const { child } = user

console.log(user.child.name, child.name) // 'hello', 'hello'

// highlight-next-line
child.name = 'world'

console.log(user.child.name, child.name) // 'world', 'world'
```

The above example demonstrates a common misconception that everything we get from reactive proxy is always "connected" to the source, but it's actually not! For example:

```ts showLineNumbers
import { reactive } from 'vue'

const user = reactive({
  name: 'hello',
  age: 5,
})

// highlight-next-line
const { name: myName, age: myAge } = user

console.log(user.name, myName) // 'hello', 'hello'
console.log(user.age, myAge) // 5, 5
```

We may think to ourselves "Okay, so now `myName` and `myAge` must be connected to `user`", and proceed to mutate `user.name` and `user.age`:

```ts showLineNumbers
import { reactive } from 'vue'

const user = reactive({
  name: 'hello',
  age: 5,
})

const { name: myName, age: myAge } = user

console.log(user.name, myName) // 'hello', 'hello'
console.log(user.age, myAge) // 5, 5

// highlight-next-line
user.name = 'world'
// highlight-next-line
user.age = 10

console.log(user.name, myName) // 'world', 'hello'
console.log(user.age, myAge) // 10, 5
```

As you can see, the changes we made to `user` did not effect `myName` and `myAge` at all (and vice versa).

Why is it that in the first example, mutating `child.name` did effect `user.child`, while the same behavior cannot be observed in the second example?

_Is it a problem to use a destructing assignment with `reactive()`?_

Not really. The same thing would happen even if we use `const myName = user.name` (because that's exactly what destructing assignment does), so it's not quite correct to say destructing assignment causes the problem.

The answer is actually very simple. All we have to do is to recap how variable works in JavaScript, and you'll know it right away!

In JavaScript, variables are either being **passed by value** or being **passed by reference**. For primitive values, they are always being **passed by value**, and non-primitive values are always being **passed by reference**. So by writing `const { name: myName, age: myName } = user`, we're actually saying:

```js showLineNumbers
const myName = user.name
const myAge = user.age
```

Because `user.name` (string) and `user.age` (number) are both **primitive values**, they will get passed to `myName` and `myAge` **by value**; that means `myName` and `myAge` will now be new variables with new memory addresses, thus they "disconnect" from `user`.

So technically, as long as the target value is non-primitive, you can use as many destructing assignment with `reactive()` as you want while keeping reactivity. But we don't recommend doing this because it creates inconsistent behavior between variables (some of them are reactive, and some of them are not).

### How to Keep Reactivity

So is there a way that we can use the convenient destructing assignment syntax with `reactive()`, but keeping reactivity at the same time? Yes, there is! The closest we can get is to use [`toRef()`](https://vuejs.org/api/reactivity-utilities.html#toref) and [`toRefs()`](https://vuejs.org/api/reactivity-utilities.html#torefs).

`toRef()` and `toRefs()` do exactly what they say — turning something into `Ref<T>`(s). These two functions are very similar to each other, but there's still a difference; in a nutshell, **`toRefs()` = a lot of `toRef()`**. For example:

```ts showLineNumbers
import { reactive, toRef, toRefs } from 'vue'

const user = reactive({
  name: 'hello',
  age: 5,
})

// We can either do this:
// highlight-start
const name = toRef(user, 'name')
const age = toRef(user, 'age')
// highlight-end

// Or this:
// highlight-next-line
const { name, age } = toRefs(user)
```

Most of the time we'll just use `toRefs()` because it's slightly more convenient than `toRef()`, but the results are the same. The `Ref<T>` generated by `toRef()` and `toRefs()` are always connected to the source, which means reactivity will be kept. By using `toRef()` and `toRefs()`, we no longer have to worry about if a property is primitive or not. Just turn it into a `Ref<T>`, and everything would work as expected!


:::info

In the above example, will we get the same result if we replace `toRefs()` with `ref()`? For example:

```ts showLineNumbers
import { reactive, ref } from 'vue'

const user = reactive({
  name: 'hello',
  age: 5,
})

// Originally we did this.
const { name, age } = toRefs(user)

// Can we achieve the same goal by doing this?
// highlight-start
const name = ref(user.name)
const age = ref(user.age)
// highlight-end
```

The answer is **no** — `name` and `age` will **not** be connected to `user` if we use `ref()`. They will be treated as separate `Ref<T>`s.

This is because since `user.name` and `user.age` are both primitive values, they will be passed to `ref()` **by value**. So writing `const name = ref(user.name)` will equal to `const name = ref('hello')`, which then creates an individual `Ref<T>` with `hello` as initial value.

Furthermore, even though the return type of `ref()` and `toRef()` are both `Ref<T>`, they are actually returning different class instances that run different logic.

But be careful, if the target object is a non-primitive value, both `ref()` and `toRef()` would connect to the same source, and updating them would both cause the component to re-render. For example:


```ts showLineNumbers
import { reactive, ref, toRef } from 'vue'

const user = reactive({
  name: 'hello',
  child: {
    age: 5,
  },
})

// highlight-start
const cat = ref(user.child)
const dog = toRef(user, 'child')
// highlight-end

console.log(user.child.age, cat.value.age, dog.value.age) // 5, 5, 5

// highlight-next-line
cat.value.age = 10

console.log(user.child.age, cat.value.age, dog.value.age) // 10, 10, 10

// highlight-next-line
dog.value.age = 15

console.log(user.child.age, cat.value.age, dog.value.age) // 15, 15, 15
```

In short, `ref()` should only be used when declaring new states without referencing any kind of source, while `toRef()` and `toRefs()` should only be used when declaring states that is referencing a source to keep reactivity.

:::

## What Is `UnwrapNestedRef<T>`

`UnwrapNestedRef<T>` is the **return type** of `reactive()`. Since it's not really necessary to know it because your IDE would have already done the most difficult part for you, and it's somewhat complicated as well, we think it's better to not include it here. But if you're still interested in learning what it is, feel free to visit the chapter of [`UnwrapNestedRef<T>`](./unwrap-nested-ref)!
---
sidebar_position: 4
---

import Video from '@site/src/components/Video'

# `reactive()`

## What is `reactive()`?

`reactive()` is a **function** that takes a **non-primitive** value as argument,and returns a **reactive proxy** of type `UnwrapNestedRef<T>`.

This one line definition actually sums it up very well, but it might have brought so many questions to your head:

- What is a **non-primitive value**?
- What is a **reactive proxy**?
- What is **`UnwrapNestedRef<T>`**?

We'll try to explain these stuff in this chapter. But before doing that, let's take a look at a simple example of `reactive()`:

```ts showLineNumbers
import { reactive } from 'vue'

const user = reactive({
  name: 'hello',
  age: 5,
})

console.log(user.name) // 'hello'
console.log(user.age) // 5
```

In this example, the returned value of `reactive()` has exactly the same data structure as what we gave it, but that's not always the case.
The reason is there's an unwrap mechanism inside `reactive()`, but it rarely gets "triggered". We'll explain more in detail [below](#what-is-unwrapnestedreft).

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

## `reactive()` Only Works with Non-Primitive Values

:::info

What are **non-primitive values**? Simply put, anything that is not a primitive value is called non-primitive value (yeah, of course).
Please see [here](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) for the definition of primitive values.

:::

If you try to use `reactive()` on primitive value like `0`, you'll see a warning in console that says `value cannot be made reactive: 0` in development mode.

```ts showLineNumbers
import { reactive } from 'vue'

const count = reactive(0) // value cannot be made reactive: 0
```

This is because `reactive()` is only designed for **non-primitive** values. If the argument is a primitive value, `reactive()` will just returns it without doing anything.
This means `const count = reactive(0)` will do the same thing as `const count = 0` due to how `reactive()` works internally.
Even if you declare it using `let count = reactive(0)`, your component will still not re-render when `count` changes, because `count` is nothing more than a normal `number`.

:::info

- If you really need reactive primitive values, you should use [`ref()`](./ref-and-ref#what-is-ref).
- We'll talk more about how `reactive()` works in [`ref()` or `reactive()`](./ref-or-reactive#how-reactive-works).

:::

## What is a Reactive Proxy?

If you don't know what [proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) is, don't worry;
you can still learn `reactive()` very well without knowing it!

Briefly speaking, a proxy is an object that allows you to run custom logic whenever someone tries to access or change the value in a targeted object.
That's why reactive proxy is "reactive" — Vue re-renders the component for us when the value in a reactive proxy changes.

So you can just think of a reactive proxy as something that has almost the same data structure as the targeted object, the only difference is it runs some extra logic when the value changes.

### Non-Reactive Value in `<template>`

Let's start by looking at an example of **non-reactive value**, as known as the standard, plain JavaScript object.

```html title="Non-reactive value" showLineNumbers
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

The logic of this component is very simple — every time we click "Get Old", `user.age` will be incremeneted by 1.
In the very beginning, we see `hello is 5 years old` on the screen; after clicking "Get Old" for a couple of times, we find that despite the fact that `user.age` do gets updated, the number on the screen is still `5`.

<Video src="/video/reactive_non-reactive-value.mov" />

So why is this happening? The reason is that since `user` is not declared with either `ref()` or `reactive()`, it'll be nothing but a plain object in `<script>`.
Vue components just don't care about the changes of these normal, non-reactive values.


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

This component is almost the same as the previous one, the only difference is we're now declaring `user` with `reactive()`.
Besides, the component re-renders whenever we click "Get Old", which is exactly what we want.

<Video src="/video/reactive_reactive-proxy.mov" />

This happens because Vue is designed in such way that by default, components re-render whenever **reactive proxy** or **`Ref<T>`** changes. So if we declare `user` without using `reactive()` or `ref()`, Vue will not do anything when `user` changes because `user` is neither a reactive proxy nor a `Ref<T>`.

### Both Reactive And Non-Reactive Values

But be careful, that doens't mean the changes being made to non-reactive values will never be reflected on the screen. Let's take a look at the following example:

```html title="Both reactive and non-reactive values" showLineNumbers
<template>
  <div>
    <h1>{{ userA.name }} is {{ userB.age }} years old</h1>
    <button @click="changeName">Change Name</button>
    <button @click="getOld">Get Old</button>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const userA = reactive({
  name: 'hello',
})

const changeName = () => {
  userA.name += 'o'
}

const userB = {
  age: 5,
}

const getOld = () => {
  userB.age++
}
</script>
```

In this example, we use both reactive and non-reactive values at the same time. The logic of this component is very similar to the previous one — clicking "Get Old" will incremenet `userB.age` by 1, and clicking "Change Name" will append an `o` to `userA.name`.

Here we declare `userA` as a reactive proxy, and declare `userB` as a non-reactive object. We know that the changes being made to `userA` will cause the component to re-render because `userA` is a reactive proxy, while the changes made to `userB` will not.

At first we click "Change Name" for a couple of times, and each time we click it, the component re-renders with an `o` being appended to `hello`.

<Video src="/video/reactive_both-0.mov" />

Then we click "Get Old" for a couple of times as well, this time the component does not re-render. That's exepcted because `userB` is neither a reactive proxy nor a `Ref<T>`.

<Video src="/video/reactive_both-1.mov" />

Then we go back to click "Change Name" again, and something strange happens — the `5` on the screen is now being changed!

<Video src="/video/reactive_both-2.mov" />

Quite confusing, isn't it? The secret behind this is:

- When we click "Get Old", the value of `userB.age` do gets updated; it's just not being reflected on the screen yet because the component does not re-render.
- When we click "Change Name", `userA.name` gets updated; since `userA` is a reactive proxy, the component will now re-render with the latest state of variables in `<script>`.

So When using Vue 3, you should **always avoid such pattern** because it is more likely to cause bugs in your app. Knowing when to make a variable reactive is important, a simple rule of thumb would be:

- Always make a variable reactive (by using either `ref()` or `reactive()`) if the value **will change**, and **users must be informed of that change** on the screen.
- Otherwise just make it non-reactive.

## The Reactivity of a Reactive Proxy

### Does Destructing Assignment Break Reactivity?

A common mistake developers make is they take primitive values out from a reactive proxy, assigning them to some other variables, and think they are still "connected". The most common case is destructing assignment:

```ts showLineNumbers
import { reactive } from 'vue'

const user = reactive({
  child: {
    name: 'hello',
  },
})

const { child } = user

console.log(user.child.name) // 'hello'
console.log(child.name) // 'hello'

// highlight-next-line
child.name = 'world'

console.log(user.child.name) // 'world'
console.log(child.name) // 'world'
```

The above example demonstrates a common misconception that everything we get from reactive proxy is "connected" to the source, but it's acutally not. For example:

```ts showLineNumbers
import { reactive } from 'vue'

const user = reactive({
  name: 'hello',
  age: 5,
})

const { name: myName, age: myAge } = user

console.log(user.name, myName) // 'hello', 'hello'
console.log(user.age, myAge) // 5, 5
```

We may think to ourselves "Okay, so now `myName` and `myAge` are connected to `user`", and proceed to mutate `user.name` and `user.age`:

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

_So there's a problem using destructing assignment with `reactive()`?_

Not really. The same thing would happen even if we use `const myName = user.name` (because that's exactly what destructing assignment do), so it's not quite correct to say destructing assignment causes the problem.

_But if it's not for destructing assignment, what is the real cause then?_

The answer is actually very simple. All we have to do is to recap how variable works in JavaScript, and you'll know it right away!

In JavaScript, variables are either being **passed by value** or being **passed by reference**. For primitive values, they are always being **passed by value**, and non-primitive values are always being **passed by reference**. So by writing `const { name: myName, age: myName } = user`, we're actually saying:

```js
const myName = user.name
const myAge = user.age
```

Because `user.name` (string) and `user.age` (number) are both **primitive values**, they are being **passed by value** when declaring `myName` and `myAge`; that means `myName` and `myAge` will be new variables with new memory addresses, thus they "disconnect" from `user`.

So as long as the target value is non-primitive, you can use as many destructing assignment as you want while keeping reactivity (but not recommended though!).

### How to Keep Reactivity

So is there a way that we can use the convenient destructing assignment syntax with `reactive()`, but keeping reactivity at the same time? Yes, there is! The closest we can get is to use [`toRef()`](https://vuejs.org/api/reactivity-utilities.html#toref) or [`toRefs()`](https://vuejs.org/api/reactivity-utilities.html#torefs).

`toRef()` and `toRefs()` do exactly what they say — turn something into `Ref<T>`(s). These two functions are very similar to each other, but there's still a difference; in a nutshell, **`toRefs()` = a lot of `toRef()`**. For example:

```ts showLineNumbers
import { reactive, toRef, toRefs } from 'vue'

const user = reactive({
  name: 'hello',
  age: 5,
})

// We can either do this:
const myName = toRef(user, 'name')
const myAge = toRef(user, 'age')

// Or this:
const { name: myName, age: myAge } = toRefs(user)
```

Most of the time we'll just use `toRefs()` because it's slightly more convenient than `toRef()`, but the results are the same. The `Ref<T>` generated by `toRef()` and `toRefs()` are always connected to the source, which is `user` in this example. By using `toRef()` and `toRefs()`, we no longer have to worry about if a property is primitive or not. Just turn it into a `Ref<T>`, and everything would work as expected!

## What is `UnwrapNestedRef<T>`

:::caution Prerequisites

You must learn [`Ref<T>`](./ref-and-ref#what-is-reft) before getting into this section.

:::

`UnwrapNestedRef<T>` is the type of value returned by `reactive()`; it's a somewhat complicated **type** that pretty much explains itself — unwrap all of the nested `Ref<T>`s, but **recursively**.

To be honest, this may not be a very important topic because for most of the time, your IDE would have evaluated the output type for you; you probably didn't even notice the existence of this thing.

:::note

If you find this section very confusing, don't worry, it's totally fine to skip it! You'll do just fine without knowing anything about it.

:::

To get straight to the point, there's actually an unwrap mechanism of `Ref<T>` built inside `reactive()`. The following pseudocode demonstrates the simplified (yet still complicated) definition of `UnwrapNestedRef<T>`:

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

Based on the pseoducode above, you can imagine there's an imaginary function that's used to create an reactive unwrapped

### Nestedly Unwrap a Plain Object

If the argument is a plain object, `reactive()` will return a new, unwrapped object based on that argument.

For example, if we have an object like this:

```ts showLineNumbers
import { reactive } from 'vue'

const user = reactive({
  shippingInfo: ref({
    phoneNumber: '123',
  }),
})

console.log(user.shippingInfo.value.phoneNumber) // This will cause an error!
```

To get the value of `phoneNumber` from `user`, it's very natural to think that we have to use `user.shippingInfo.value.phoneNumber` because `user.shippingInfo` is a `Ref<T>`. But if you try to run that line of code, you'll get an error that says `TypeError: Cannot read properties of undefined (reading 'phoneNumber')`.

This happens because `reactive()` is implemented in such way that it **recursively** unwraps all the `Ref<T>`s in a plain object. So to get the value of `phoneNumber` from `user`, we should use `user.shippingInfo.phoneNumber`. Notice that there's no `.value` after `shippingInfo`.

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

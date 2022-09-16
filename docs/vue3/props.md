---
sidebar_position: 6
description: What are props in Vue 3.
keywords: [piesdoc, vue3, props]
---

import Video from '@site/src/widgets/Video';

# Props

## What Are Props?

Props are **properties coming from parent component**. These properties are stored in an object that, for most of the time, is being called `props`.

For example, if you declare your props in a component like this:

```ts title="ChildComponent.vue" showLineNumbers
const props = defineProps<{
  name: string
  age: number
}>()
```

Then in the parent you could pass values to it like this:

```html title="ParentComponent.vue" showLineNumbers
<template>
  <ChildComponent
    :name="myName"
    :age="myAge"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const myName = ref('hello')
const myAge = ref(5)
</script>
```

## Shallow Reactive and Shallow Readonly

Here's an interesting fact: the `props` object is actually a **non-strict shallow reactive proxy** with **shallow readonly** constraint!

### What Is Shallow Reactive?

**Shallow reactive** means in an object, only the root-level properties are reactive; properties deeper than that are not reactive. We can use the [`shallowReactive()`](https://vuejs.org/api/reactivity-advanced.html#shallowreactive) function to create a shallow reactive proxy, for example:

```ts showLineNumbers
import { shallowReactive } from 'vue'

const user = shallowReactive({
  name: 'hello',
  child: {
    age: 5,
  },
})
```

In this example, `user` is declared as a shallow reactive proxy, which means:

- Mutating `user.name` will cause the component to re-render.
- Replacing `user.child` with any other value will cause the component to re-render.
- Mutating `user.child.age` will **not** cause the component to re-render.

However, if `user.child` has been a reactive proxy since the beginning, mutating `user.child.age` would also cause the component to re-render, because all `shallowReactive()` does is making root-level properties reactive; it never "de-reactive" any reactive properties. For example:

```ts showLineNumbers
import { reactive, shallowReactive } from 'vue'

const user = shallowReactive({
  name: 'hello',
  child: reactive({
    age: 5,
  }),
})
```

In this example:

- Mutating `user.name` will cause the component to re-render, because `user` is a shallow reactive proxy.
- Replacing `user.child` with any other value will cause the component to re-render, because `user` is a shallow reactive proxy.
- Mutating `user.child.age` will also cause the component to re-render, because `user.child` is a reactive proxy.

:::info

Unlike `reactive()`, `shallowReactive()` does not go throught the [unwrap process](./unwrap-nested-ref) while making a proxy, so the return type of `shallowReactive()` is guaranteed to be the same as the type of arugment.

:::

### What Is Shallow Readonly?

**Shallow readonly** means in an object, only the root-level properties are readonly; properties deeper than that are not readonly. We can use the [`shallowReadonly()`](https://vuejs.org/api/reactivity-advanced.html#shallowreadonly) function to create a shallow readonly object, for example:

```ts showLineNumbers
import { shallowReadonly } from 'vue'

const user = shallowReadonly({
  name: 'hello',
  child: {
    age: 5,
  },
})
```

In this example, `user` is declared as a shallow readonly object, which means:

- We cannot mutate `user.name`.
- We cannot replace `user.child` with any other value.
- We **can** mutate `user.child.age`.

To sum up, you can think of `props` as a reactive proxy made by `shallowReactive()` and `shallowReadonly()`; it's just that all property values are coming from parent component.

```ts showLineNumbers
import { shallowReactive, shallowReadonly } from 'vue'

const props =
  shallowReadonly(
    shallowReactive({
      // ...
    })
  )
```

:::info

You should **always avoid directly mutating props in child components** so that the data flow of your components stays one-way (from top to bottom). If you have to mutate props in child components, you should use [`events`](https://vuejs.org/guide/components/events.html#component-events). The main concept is, parent component would be the only one that's allowed to mutate those values; all children do is to "trigger" those changes.

:::

## The Reactivity of Props

Have you ever been in a situation that **for some reason, "some" properties in your props are just not reactive**?

For most of the time, that means you've accidentally broke the reactivity of props. Since `props` is a shallow reactive proxy, you can just treat it like a reactive proxy. Check [here](./reactive#the-reactivity-of-reactive-proxy) for solutions!

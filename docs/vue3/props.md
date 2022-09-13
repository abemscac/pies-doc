---
sidebar_position: 6
---

import Video from '@site/src/components/Video';

# Props

## What are Props

Props are properties coming from parent component. These properties are stored in a **readonly, shallow-reactive proxy**.

For example, if you do this in a component called `ChildComponent`:

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

### Shallow-Reactive Proxy

Here's an interesting fact: the value returned by [`defineProps()`](https://vuejs.org/api/sfc-script-setup.html#defineprops-defineemits) is actually a **shallow-reactive proxy**!

Before explaining what shallow-reactive proxy is, let's just see an example of shallow-reactive proxy! We can use [`shallowReactive()`](https://vuejs.org/api/reactivity-advanced.html#shallowreactive) to generate a shallow-reactive proxy. For example:

```html
<template>
  <div>{{ user.name }}'s child is {{ user.child.age }} years old.</div>
  <button @click="changeName">Change Name</button>
  <button @click="getOld">Get Old</button>
</template>

<script lang="ts" setup>
import { shallowReactive } from 'vue'

const user = shallowReactive({
  name: 'hello',
  child: {
    age: 5,
  },
})

const changeName = () => {
  user.name += 'o'
  console.log(user.name)
}

const getOld = () => {
  user.child.age++
  console.log(user.child.age)
}
</script>
```

In this example, `user` is declared with `shallowReactive()`. Clicking "Change Name" will append an `o` to `user.name`, while clicking "Get Old" will increment `user.child.age` by 1.

You could try clicking the buttons for a couple of times, and you'll find the same result as what we've discovered in one of the example of [`reactive()`](./reactive#both-reactive-and-non-reactive-values).

<Video src="/video/props_shallow-reactive.mov" />

**Shallow-reactive** means reactivity is only applied to the root object itself; any nested object will **not** be reactive. So in this example, `user.name` will be the only reactive property because `user` is declared with `shallowReactive()`; since `user.child` is a nested object, any property start from that position is not going to be reactive.

### Readonly Constraint

If you try to mutate a property in props from child components, you'll see a warning in console:

```ts title="ChildComponent.vue" showLineNumbers
const props = defineProps<{
  name: string
  age: number
}>()

props.name += 'hello' // [Vue warn] Set operation on key "name" failed: target is readonly.
```

But be careful, the readonly constraint is only applied to **primitve properties** in props. If the property is a non-primitive value, the warning won't show up when you mutate those props:

```ts title="ChildComponent.vue" showLineNumbers
const props = defineProps<{
  user: {
    name: string
  }
}>()

props.user.name += 'hello' // This would work without warning!
```

You should **always avoid directly mutating props in child components** regardless of the type, so that the data flow of your components stays one-way (from top to bottom). If you have to mutate props in child components, you should use [`events`](https://vuejs.org/guide/components/events.html#component-events). The main concept is, parent component would be the only one that's allowed to mutate those values; all children do is to "trigger" those changes.

## The Reactivity of Props

Have you ever been in a situation that **for some reason, some properties in your props are just not reactive**?

You spent a lot of time debugging but still can't find a solution. So you start to find some workaround:

_What if I can just receive `Ref<T>` in props without unwrap, so that it's guaranteed to be reactive?_

So maybe this kind of props definition would work:

```ts
import { Ref } from 'vue'

const props = defineProps<{
  name: Ref<string>
}>()

name.value = 'victory!'
```

That's actually not a very bad idea, but **don't do that!** The main reason is that it breaks the [readonly constraint](#readonly-constraint) we've mentioned above, which increases the chance of props getting modified by children.

If that's the case, that means you've accidentally broke the reactivity of props. Since shallow-reactive proxy is also a proxy, you can just treat it like a reactive proxy. Check [here](./reactive#the-reactivity-of-a-reactive-proxy) for solutions!



<details>
  <summary>In case you're really curious about how to pass <code>Ref</code> down without being unwrapped...</summary>

  The main concept here is to prevent Vue from automatically unwrapping `Ref<T>` in `<template>`.

  1. Use a non top-level `Ref<T>` as the value of props, for example:

  ```html title="ParentComponent.vue" showLineNumbers
  <template>
    <ChildComponent :name="user.name" />
  </template>

  <script lang="ts" setup>
  import { ref } from 'vue'

  const user = {
    name: ref('hello'),
  }
  </script>
  ```

  2. Use a function to return `Ref<T>`, for example:

  ```html title="ParentComponent.vue" showLineNumbers
  <template>
    <ChildComponent :name="getName()" />
  </template>

  <script lang="ts" setup>
  import { ref } from 'vue'

  const user = {
    name: ref('hello'),
  }

  const getName = () => user.name
  </script>
  ```

  3. Use [Provide / Inject](https://vuejs.org/guide/components/provide-inject.html)

</details>
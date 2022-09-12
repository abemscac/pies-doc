---
sidebar_position: 6
---

# Props

## What are Props

Props are properties coming from parent component. These properties are stored in a **readonly** object returned by [`defineProps()`](https://vuejs.org/api/sfc-script-setup.html#defineprops-defineemits).

For example, if you do this in a component called `ChildComponent`:

```ts title="ChildComponent.vue" showLineNumbers
const props = defineProps<{
  name: string
  age: number
}>()
```

Then in the parent you could use it like this:

```html title="ParentComponent.vue" showLineNumbers
<template>
  <ChildComponent
    :name="'hello'"
    :age="5"
  />
</template>
```

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

You should **always avoid directly mutating props in child components** regardless of the type, so that the data flow of your components stays one-way (from top to bottom). If you have to mutate props in child components, you should use [`events`](https://vuejs.org/guide/components/events.html#component-events). The main concept is, parent component is the only one that's allowed to mutate those values; all children do is to trigger those events.

## Props are Reactive

Have you ever wonder why your component re-renders whenever props changes? That's because props are reactive!

We've mentioned this before in [`reactive()`](./reactive#props-are-reactive). Make sure to learn all things about `reactive()` if you have not!

## How to Receive `Ref<T>` in Props Without Unwrap

**You don't!** 

The only reason you want to do this is because you're in a situation that **some properties in your props are not reactive for some reason**.

You're annoyed because Vue [auto-unwrap](./ref-and-ref#ref-in-template) `Ref<T>` for you, so you try to find a way to bypass the auto-unwrap mechanics. This way child components can receive the whole `Ref<T>` as props without being unwrapped.

We have to say this again, **you don't**!  Seriously, don't do this.

Because `defineProps()` already returns a reactive object, this kind of props definition makes no sense at all (but it still work). Also, since `Ref<T>` is a non-primitive type, it breaks the [readonly constraint](#what-are-props) we mentioned above.

If that's the case, that means you've accidentally broke the reactivity of props. Check [here](./reactive#the-reactivity-of-reactive-object) for solutions!

<details>
  <summary>In case you're really curious about how to pass <code>Ref</code> down...</summary>

  **CAUTION! Please don't do this.**

  The main concept here is to prevent Vue from automatically unwrapping `Ref<T>` in `<template>`.

  1. Use a non top-level `Ref<T>` as the value of props, for example:

  ```html title="ParentComponent.vue" showLineNumbers
  <template>
    <Child :name="user.name" />
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
    <Child :name="getName()" />
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
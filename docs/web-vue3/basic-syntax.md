---
sidebar_position: 1
---

# Basic Syntax

Learn the essentials of a component in Vue 3.

## Sample Component

Here's an example of Vue 3 single file component (SFC) with [Composition API](https://vuejs.org/guide/introduction.html#composition-api):

```html showLineNumbers
<template>
  <div>
    <h1>Hello, {{ name }}</h1>
    <input v-model="name">
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const name = ref('world')
</script>

<style scoped>
h1 {
  color: blue;
}
</style>
```

Similar to Vue 2, a SFC in Vue 3 consists of 3 tags — `<template>`, `<script>`, and `<style>`.

- The main difference is, now we have a `setup` attribute on `<script>` tag, which only works with Composition API.
- TypeScript is now officially supported in Vue 3, we can just add `lang="ts"` attribute on `<script>` tag to start building components in TypeScript.
- [`<style>`](https://vuejs.org/api/sfc-spec.html#style) tag is still optional, and the [`scoped` attribute](https://vue-loader.vuejs.org/guide/scoped-css.html#scoped-css) still works.
- Although we didn't show them in this example, the template syntax remains the same! These syntax are double curly braces `{{ }}`, `v-on` (shorthand as `@`), and `v-bind` (shorthand as `:`).

:::info

Make sure to checkout the new [`v-bind` in CSS](https://vuejs.org/api/sfc-css-features.html#v-bind-in-css) feature! It may come in handy in some situations.

:::

## `<script setup>`

So what is this `<scrtip setup>` thing? What can the `setup` attribute do in a SFC?

Basically it is used to tell Vue that **the code in this `<script>` block should be treated as the definition of a component**, even if we didn't explicitly export an object like how we did it in Options API. So anything we can do in Options API, we can also do it in `<script setup>`.

One thing worth mentioning is **there cannot be more than one `<script setup>` in a SFC**, just like how we cannot `export default` multiple times in a single file. You can have as many `<script>` as you want, just remember only one of them can be decorated with `setup` attribute.

## Defining a component

There are multiple ways to define a component in Vue 3, `<script setup>` is just one of them. Make sure to checkout [Define a Component](./define-a-component) if you're curious how Options API and Composition API differ from each other in component implementation.
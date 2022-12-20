---
sidebar_position: 7
description: What are composables in Vue 3.
keywords: [piesdoc, vue3, vue composables, vue tutorial]
---

# Composables

The most powerful tool in Composition API!

## What Are Composables?

Composables are **functions** that can be called within any component in Vue. In a composable, you can do most of the things you could do in `<script setup>`, and return anything (or nothing) to fulfill your requirements.

:::info

You might be wondering what's the difference between a (util) function and a composable, because the statement "functions that can be called within any component in Vue" sounds just like an utility function. Generally speaking, if any Vue-specific feature is used within the function (i.e. `ref()` and `onMounted()`), we would call it a **composable** instead of a normal function.

:::

In fact, you may have used composables before; you just didn't realize it. For example, the [`useRouter()`](https://router.vuejs.org/api/index.html#userouter) in VueRouter, and the [`useI18n()`](https://vue-i18n.intlify.dev/api/composition.html#usei18n) in Vue I18n are both composables.

To give you a basic concept of what composables really are, we'll use a commonly seen scenario — **fetching data on mount** as an example. In this scenario, usually we would need the following states (assuming the data is an array of users):

- A `loading` state to indicate if the API call is still going on.
- A `users` state to store the API response (an array of user).

So in your component, you would probably do this:

```html title="UsersPage.vue" showLineNumbers
<template>
  <div>
      <span v-if="loading">Loading...</span>
      <table v-else>
        <!-- Render users here -->
      </table>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

// highlight-start
const loading = ref(true)
const users = ref([])
// highlight-end

// Fetch data on mount
// highlight-start
onMounted(async () => {
  const response = await fetch('/users')
  users.value = await response.json()
  loading.value = false
})
// highlight-end
</script>
```

:::caution

You probably don't want to manage your API like this! We only write it in this way for the sake of simplicity. If you're not sure what to do, a simple encapsulation would be a good start because it's more readable and more maintainable:

```ts showLineNumbers
export const useUserApi = () => {
  const getUsers = () => fetch('/users')

  return {
    getUsers,
  }
}
```
:::

Since a lot of pages in the app fetch data on mount, we would have to repeat similar code again and again. Instead of doing that, we can make a composable and shove the code in it. For example:

```ts title="UseFetchOnMount.ts" showLineNumbers
import { ref, onMounted } from 'vue'

export const useFetchOnMount = <T>(url: string, initialValue: T) => {
  const loading = ref(true)
  const data = ref(initialValue)

  onMounted(async () => {
    const response = await fetch(url)
    data.value = await response.json()
    loading.value = false
  })

  return [
    loading,
    data,
  ]
}
```

<details>
  <summary>For those who are from React...</summary>

  If you've learned React Hooks API, you might be wondering why we can't just return something like `[loading.value, data.value]` so that we can omit the `.value` outside composables.

  This is because React is using JSX, which means almost every piece of code in a component is being re-run on each re-render, but things are not the same in Vue. In a Vue component, `<script setup>` and `setup()` would only run once for each instance, so if we return `Ref<T>.value` instead of `Ref<T>` itself, we would lose the reactivity on these states.
</details>

The code in this composable is pretty much the same as the original code in the component; we're just moving it to a `.ts` file so that it's more reusable and testable. After we're done implementing it, we're now ready to use it in our components:

```html title="UsersPage.vue" showLineNumbers
<template>
  <div>
      <span v-if="loading">Loading...</span>
      <table v-else>
        <!-- Render users here -->
      </table>
  </div>
</template>

<script lang="ts" setup>
// highlight-next-line
import { useFetchOnMount } from '../somewhere-else/UseFetchOnMount'

// highlight-next-line
const [loading, users] = useFetchOnMount('/users', [])
</script>
```

Like this, you can design your own system in a composable and reuse it in any component in your app. In a composable, you can declare as many variables and functions as you want, update them as needed, and choose which values to export (return). Ultimately, the component will be a combination of multiple composables, making it a "composition".

Even if you call it multiple times (whether in the same file or not), the value returned by `useFetchOnMount()` will still be independent due to how it's implemented.

```html showLineNumbers
<template>
  <div>
    <div class="users">
      <span v-if="loadingUsers">Loading users...</span>
      <table v-else>
        <!-- Render users here -->
      </table>
    </div>
    <div class="products">
      <span v-if="loadingProducts">Loading products...</span>
      <table v-else>
        <!-- Render products here -->
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useFetchOnMount } from '../somewhere-else/UseFetchOnMount'

// highlight-start
const [loadingUsers, users] = useFetchOnMount('/users', [])
const [loadingProducts, products] = useFetchOnMount('/products', [])
// highlight-end
</script>
```

With the help of composables, we're now able to reuse some functionality that's shared across the whole app, thus reducing duplicate code.

However, there are a few important things to keep in mind:

- Reusability is not the only thing to be taken into consideration before making composables; if the logic of a component is somewhat complicated, it's totally fine to "slice" (modularize) that huge feature into several small features (composables), even if only one component within the whole app is using it. This way our codebase would be more readable, maintainable, and testable, comparing with putting everything in a single component.
- Component is not the only place you can use composables; you can also use composables in another composable!
- Things like `defineProps()` and `defineEmits()` are not allowed in composables; they only work when directly used in `<script setup>`.
- **More reusability does NOT equal to better code!** A lot of developers would try to modify an existing composable instead of creating a new one in order to reuse it in even more components. It is very common to see composables go out of control in this kind of situation — in order to handle all kinds of (edge) cases, more and more arguments/methods are added, making things way more complicated than it should be; and the cost of refactoring/replacement would only get higher as time goes on. Don't be afraid to create new composables if the old one starts to get too complicated.
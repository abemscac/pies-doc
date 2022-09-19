---
sidebar_position: 7
description: What are composables in Vue 3.
keywords: [piesdoc, vue3, composables]
---

# Composables

The most powerful tool in Composition API!

## What Is a Composable?

A composable is a **function** that can be called from almost anywhere in a Vue app. In a composable, you can do most of the things you could do in `<script setup>`, and return anything you want to fulfill your requirements.

:::info

You might be wondering what's the difference between a (util) function and a composable, because the statement "a function that can be called from almost anywhere in a Vue app" sounds just like a utility function. Generally speaking, if any Vue-specific feature is used within the function (for example, `ref()` and `onMounted()`), we would call it a **composable** instead of a normal function.

:::

:::caution

Despite the fact that composables can be called from almost anywhere in a Vue app (because they're functions), it may not work if it's called before Vue instance is set up. For example, calling `onMounted()` before your Vue instance is set up is apparently not going to work.

:::

In fact, you may have used composables before; you just didn't realize it. For example, the [`useRouter()`](https://router.vuejs.org/api/index.html#userouter) in VueRouter, and the [`useI18n()`](https://vue-i18n.intlify.dev/api/composition.html#usei18n) in Vue I18n are both composables.

To give you a basic concept of what composables really are, we'll use a commonly seen scenario — **fetching data on mount** as an example. In this scenario, usually we would need the following states (assuming the data is an array of users):

- A `loading` state to indicate if the API call is still going on.
- A `users` state to store the API response (an array of user).

So in your component, you would probably do it like this:

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

const loading = ref(true)
const users = ref([])

onMounted(async () => {
  const response = await fetch('/users')
  users.value = await response.json()
  loading.value = false
})
</script>
```

:::caution

You should probably not manage your API like this! We only write it in this way for the sake of simplicity. If you're not sure what to do, a simple encapsulation would be a good start because it's more readable and more maintainable:

```ts showLineNumbers
export const useUserApi = () => {
  const getUsers = () => fetch('/users')

  return {
    getUsers,
  }
}
```
:::

Since a lot of pages in the app are fetching data on mount, we would have to repeat the similar code again and again. Instead of doing that, we can make a composable and shove these code in it. For example:

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

The code in this composable is pretty much the same as the original code in the component; we're just moving it to a `.ts` file so that it's more reusable and testable. After we've done implementing it, we're now ready to use it in our components:

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
import { useFetchOnMount } from '../somewhere-else/UseFetchOnMount'

const [loading, users] = useFetchOnMount('/users', [])
</script>
```

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

const [loadingUsers, users] = useFetchOnMount('/users', [])
const [loadingProducts, products] = useFetchOnMount('/products', [])
</script>
```

With the help of composables, we're now able to reuse some functionalities that's shared across the whole app, thus reduce duplicate code.

However, there are a few important things to keep in mind:

- Reusability is not the only thing to be taken into consideration before making composables; if the logic of a component is somewhat complicated, it's totally fine to "cut" (modularize) that huge feature into several small features (composables), even if only one component within the whole app is using it. This way our codebase would be more readable, maintainable, and testable, comparing with putting everything in a single component.
- Component is not the only place you can use composable; you can also use a composable in another composable!
- Things like `defineProps()` and `defineEmits()` are not allowed in composables; they only work when directly used in `<script setup>`.
- **More reusability does NOT equal to better code!** A lot of developers would try to modify an existing composable instead of creating a new one in order to reuse it in even more components. It is very common to see composables go out of control in this kind of situation — in order to handle all kinds of (edge) cases, more and more arguments/methods are added, making things way more complicated than it should be; and the cost of refactoring/replacement would only get higher as time goes on. Don't be afraid to create new composables if the old one starts to get too complicated.
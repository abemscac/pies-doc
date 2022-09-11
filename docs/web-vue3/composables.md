---
sidebar_position: 7
---

# Composables

The most powerful tool in Composition API!

## What is a Composable

A composable is a **function** that can be called from almost anywhere in a Vue app; in a composable, you can do most of the things you could do in `<script setup>`, and return anything you want to fulfill your requirements.

We know it's difficult to understand, but you may have used composables before; you just didn't realize it. For example, the [`useRouter()`](https://router.vuejs.org/api/index.html#userouter) in VueRouter and the [`useI18n()`](https://vue-i18n.intlify.dev/api/composition.html#usei18n) in Vue I18n are both composables.

To give you a basic concept of what composables are, we'll use a commonly seen scenario — **fetching data on mount** as an example.

:::info

You might be wondering what is the difference between a (utility) function and a composable, because obviously we are allowed to call any custom function in any component. Generally speaking, if any Vue-specific feature is used within the function (for example, `ref()` and `onMounted()`), we would call it a **composable** instead of just calling it a function.

:::

:::caution

Although a composable can be called from almost anywhere around the app (because it's a function), it may not work if it is called before Vue instance is set up. For example, calling `onMounted()` before your Vue instance is set up is apparently not going to work.

:::

Usually we would need the following states in the fetching data on mount scenario (assuming the data here is an array of users):

- A `loading` state to indicate if the API call is still going on.
- A `users` state to store the API response (an array of user).

So in your component, you would do it like this:

```html showLineNumbers
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

You should never manage your API in this way! We only write it like this for the sake of simplicity. Encapsulating them would probably be a good start:

```ts
export const useUserApi = () => {
  const getUsers = () => fetch('/users')

  return {
    getUsers,
  }
}
```
:::

Since a lot of pages in the app are fetching data on mount, we would have to repeat the similar code again and again. Instead of doing that, we can make a composable and shove those code in it. For example:

```ts title=UseFetchOnMount.ts
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

The code in this composable is pretty much the same as the original code in the component; we're just moving it to a `.ts` file so that it's more reusable and testable. After we've done implementing it, we're now ready to use it in our components:

```html
<template>
  <div>
      <span v-if="loading">Loading...</span>
      <table v-else>
        <!-- Render users here -->
      </table>
  </div>
</template>

<script lang="ts" setup>
import { useFetchOnMount } from '../somewhere/UseFetchOnMount'

const [loading, users] = useFetchOnMount('/users', [])
</script>
```

Even if you call it multiple times (whether in the same file or not), the value returned by `useFetchOnMount()` will still be independent due how it's implemented.

```html
<template>
  <div>
    <section class="users">
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
import { useFetchOnMount } from '../somewhere/UseFetchOnMount'

const [loadingUsers, users] = useFetchOnMount('/users', [])
const [loadingProducts, products] = useFetchOnMount('/products', [])
</script>
```

With the help of composables, we will be able to reuse some functionalities that's shared logic across the whole app, thus reduce duplicate code.

However, there are a few important things to keep in mind:

- Reusability is not the only thing we should take into consideration before making composables; if the logic of a component is somewhat complicated, it's totally fine to "cut" (modularize) that huge feature into several small features, even if only one component within the whole app is using it. This way our codebase would be more maintainable and testable, comparing with putting everything in a single component.
- **More reusability does NOT equal to better code!** A lot of developers would try to modify an existing composable instead of creating a new one in order to reuse it in even more components. In order to handle all kinds of edge cases, it is very common to see composables go out of control — they become way more complicated than they should be, and the cost of refactoring/replacement would only get higher as time goes on. Sometimes it's even better to not having a composable for repeated code if you haven't think of a good design.
---
sidebar_position: 7
description: Vue 3 中的组合式函数 (组合式函数) 是什么
keywords: [派氏文件, vue3, vue组合式函数, 组合式函数]
---

# 组合式函数

组合式 API 中最强大的工具！

## 什么是组合式函数 (Composables)？

组合式函数是几乎可以从 Vue 应用程序的任何地方被调用的**函数**。在组合式函数中，您可以做到绝大部分在 `<script setup>` 中能做到的事，并返回任何东西来满足您的需求。

:::info

您可能在想通用函数 (util function) 和组合式函数之间有什么区别，因为「几乎可以从 Vue 应用程序的任何地方被调用的函数」这句话听起来就像是在描述通用函数。一般来说，只要函数中使用了 Vue 才有的功能 (例如 `ref()` 或是 `onMounted()`)，我们就会称它为组合式函数而不是普通的函数。

:::

:::caution

尽管组合式函数几乎可以从 Vue 应用程序的任何地方被调用 (因为他们是函数)，若我们在 Vue 实体设置完成前就调用它，它可能无法正常运行。
举例来说，在 Vue 实体设置完成前调用 `onMounted()` 很明显地不会成功。

:::

事实上，您之前可能已经使用过组合式函数了，只是您没有意识到而已。例如 VueRouter 中的 [`useRouter()`](https://router.vuejs.org/api/index.html#userouter)，还有 Vue I18n 中的 [`useI18n()`](https://vue-i18n.intlify.dev/api/composition.html#usei18n) 都属于组合式函数。

为了让您了解组合式函数的基本概念，我们将使用一个常见的使用情境—**在组件挂载后加载资料**作为范例。在这个情境中，我们通常会需要下面这些状态 (假设这里的资料指的是使用者阵列)：

- 一个 `loading` 状态来表示 API 的调用是否还在进行中。
- 一个 `users` 状态来储存 API 的回应 (使用者阵列)。

因此在组件中，您可能会这么做：

```html title="UsersPage.vue" showLineNumbers
<template>
  <div>
      <span v-if="loading">Loading...</span>
      <table v-else>
        <!-- 在这里渲染使用者 -->
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

您也许不该这样管理您的 API！我们这么做是为了让范例看起来简单。若您不确定该怎么做，一个简单的封装 (encapsulation) 会是个挺好的开始，因为他更具有可读性和维护性：

```ts showLineNumbers
export const useUserApi = () => {
  const getUsers = () => fetch('/users')

  return {
    getUsers,
  }
}
```
:::

由于应用程序中的许多页面都需要在组件挂载后加载资料，因此我们就得一次又一次地重复撰写类似的代码。但是，我们其实可以制作一个组合式函数，然后把这些代码塞进去。例如：

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
  <summary>给那些从 React 过来的开发人员...</summary>

  若您曾经学过 React 的 Hooks API，您可能会想知道为什么我们不直接返回 `[loading.value, data.value]`，这样我们就能在组合式函数外面省略那些 `.value`。

  这是因为 React 使用的是 JSX，这意味着几乎每行代码都会随着组件每次的重新渲染被重新执行；但是 Vue 不是这么运作的。在 Vue 组件中，`<script setup>` 和 `setup()` 在每个组件实体中只会被执行一次，因此若我们返回的是 `Ref<T>.value` 而不是 `Ref<T>` 本身，我们就会失去那些状态的响应性。
</details>

这个组合式函数中的代码和原先在组件中撰写的逻辑几乎一样，我们只是把它移到一个 `.ts` 档中让它更容易重用及测试。在实作完成后，我们就能在组件中汇入并使用：

```html title="UsersPage.vue" showLineNumbers
<template>
  <div>
      <span v-if="loading">Loading...</span>
      <table v-else>
        <!-- 在这里渲染使用者 -->
      </table>
  </div>
</template>

<script lang="ts" setup>
import { useFetchOnMount } from '../somewhere-else/UseFetchOnMount'

const [loading, users] = useFetchOnMount('/users', [])
</script>
```

即便您调用它多次 (无论是否在同一个组件中)，`useFetchOnMount()` 的返回值仍然是独立的。

```html showLineNumbers
<template>
  <div>
    <div class="users">
      <span v-if="loadingUsers">Loading users...</span>
      <table v-else>
        <!-- 在这里渲染使用者 -->
      </table>
    </div>
    <div class="products">
      <span v-if="loadingProducts">Loading products...</span>
      <table v-else>
        <!-- 在这里渲染产品 -->
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

藉由组合式函数的帮助，我们现在能够重用在整个应用程序中共享的一些功能，从而减少重复的代码。

然而，有一些重要的事情要记住：

- 在制作组合式函数时，重用性不是唯一需要考量的点。若某个组件的逻辑有点复杂，即使整个应用程序中只有一个组件在使用这个功能，将这个巨大的功能「切」(模块化) 成数个小功能 (组合式函数) 也是完全没问题的。如此一来，与将所有逻辑都放在同一个组件中相比，我们的代码将变得更容易阅读、维护及测试。
- 组件并不是唯一一个能够调用组合式函数的地方；您也可以在组合式函数中调用另外一个组合式函数！
- `defineProps()` 和 `defineEmits()` 这些东西在组合式函数中是不被允许的；他们只有在 `<script setup>` 的顶层范围才会起作用。
- **更高的重用性不等于更好的代码！**很多开发人员在面对新功能时会选择修改既有的组合式函数而不是制作一个新的，只为了让他能够在更多组件中被使用。在这种情况下，我们常常见到组合式函数「失控」— 为了能处理各种(边缘)情况，越来越多的参数和方法被加入，导致事情远比它应有的还要复杂；而且随着时间推移，重构/替换的成本只会越来越高。若您发现旧的组合式函数开始变得过于复杂，不要害怕建立新的组合式函数。
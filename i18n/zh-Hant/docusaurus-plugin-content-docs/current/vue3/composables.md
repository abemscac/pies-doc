---
sidebar_position: 7
description: Vue 3 中的組合式函式 (組合式函式) 是什麼
keywords: [派氏文件, vue3, vue組合式函式, 組合式函式]
---

# 組合式函式

組合式函式在 Vue 3 中扮演著非常重要的角色。藉由組合式函式，我們可以在一個元件中整合多種不同的有狀態邏輯，從而建構成一個「組合 (composition)」。

## 什麼是組合式函式 (Composables)？

在 Vue 中，組合式函式是指**可以在任何元件中被呼叫的函式**。在組合式函式中，您可以做到絕大部分在 `<script setup>` 中能做到的事，並回傳任何東西 (或是不回傳任何東西) 來滿足您的需求。

:::info

您可能在想通用函式 (util function) 和組合式函式之間有什麼區別，因為「可以在任何元件中被呼叫的函式」這句話聽起來就像是在描述通用函式。一般來說，只要函式中使用了 Vue 才有的功能 (例如 `ref()` 或是 `onMounted()`)，我們就會稱它為組合式函式而不是普通的函式。

:::

事實上，您之前可能已經使用過組合式函式了，只是您沒有意識到而已。例如 VueRouter 中的 [`useRouter()`](https://router.vuejs.org/api/index.html#userouter)，還有 Vue I18n 中的 [`useI18n()`](https://vue-i18n.intlify.dev/api/composition.html#usei18n) 都屬於組合式函式。

為了讓您了解組合式函式的基本概念，我們將使用一個常見的使用情境—**在元件掛載後讀取資料**作為範例。在這個情境中，我們通常會需要下面這些狀態 (假設這裡的資料指的是使用者陣列)：

- 一個 `loading` 狀態來表示 API 的呼叫是否還在進行中。
- 一個 `users` 狀態來儲存 API 的回應 (使用者陣列)。

因此在元件中，您可能會這麼做：

```html title="UsersPage.vue" showLineNumbers
<template>
  <div>
      <span v-if="loading">Loading...</span>
      <table v-else>
        <!-- 在這裡渲染使用者 -->
      </table>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

// highlight-start
const loading = ref(true)
const users = ref([])
// highlight-end

// 在元件掛載後讀取資料
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

您也許不該這樣管理您的 API！我們這麼做是為了讓範例看起來簡單。若您不確定該怎麼做，一個簡單的封裝 (encapsulation) 會是個挺好的開始，因為他更具有可讀性和維護性：

```ts showLineNumbers
export const useUserApi = () => {
  const getUsers = () => fetch('/users')

  return {
    getUsers,
  }
}
```
:::

由於應用程式中的許多頁面都需要在元件掛載後讀取資料，因此我們就得一次又一次地重複撰寫類似的程式碼。但是，我們其實可以製作一個組合式函式，然後把這些程式碼塞進去。例如：

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
  <summary>給那些從 React 過來的開發人員...</summary>

  若您曾經學過 React 的 Hooks API，您可能會想知道為什麼我們不直接回傳 `[loading.value, data.value]`，這樣我們就能在組合式函式外面省略那些 `.value`。

  這是因為 React 使用的是 JSX，這意味著幾乎每行程式碼都會隨著元件每次的重新渲染被重新執行；但是 Vue 不是這麼運作的。在 Vue 元件中，`<script setup>` 和 `setup()` 在每個元件實體中只會被執行一次，因此若我們回傳的是 `Ref<T>.value` 而不是 `Ref<T>` 本身，我們就會失去那些狀態的響應性。
</details>

這個組合式函式中的程式碼和原先在元件中撰寫的邏輯幾乎一樣，我們只是把它移到一個 `.ts` 檔中讓它更容易重用及測試。在實作完成後，我們就能在元件中匯入並使用：

```html title="UsersPage.vue" showLineNumbers
<template>
  <div>
      <span v-if="loading">Loading...</span>
      <table v-else>
        <!-- 在這裡渲染使用者 -->
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

就像這樣，您可以在一個組合式函式中設計自己的系統，並在任何元件中重複使用。在組合式函式中，您可以任意宣告變數和函式，按需求更新他們，並自行選擇要輸出(回傳) 哪些數值。最終，一個元件將會是多個組合式函式的結合，使其成為一個「組合」(composition)。

即便您呼叫它多次 (無論是否在同一個元件中)，`useFetchOnMount()` 的回傳值仍然是獨立的。

```html showLineNumbers
<template>
  <div>
    <div class="users">
      <span v-if="loadingUsers">Loading users...</span>
      <table v-else>
        <!-- 在這裡渲染使用者 -->
      </table>
    </div>
    <div class="products">
      <span v-if="loadingProducts">Loading products...</span>
      <table v-else>
        <!-- 在這裡渲染產品 -->
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

藉由組合式函式的幫助，我們現在能夠重用在整個應用程式中共享的一些功能，從而減少重複的程式碼。

然而，有一些重要的事情要記住：

- 在製作組合式函式時，重用性不是唯一需要考量的點。若某個元件的邏輯有點複雜，即使整個應用程式中只有一個元件在使用這個功能，將這個巨大的功能「切」(模組化) 成數個小功能 (組合式函式) 也是完全沒問題的。如此一來，與將所有邏輯都放在同一個元件/組合式函式中相比，我們的程式碼將變得更容易閱讀、維護及測試。
- 元件並不是唯一一個能夠呼叫組合式函式的地方；您也可以在組合式函式中呼叫另外一個組合式函式！
- `defineProps()` 和 `defineEmits()` 這些東西在組合式函式中是不被允許的；他們只有在 `<script setup>` 的頂層範圍才會起作用。
- **更高的重用性不等於更好的程式碼！**很多開發人員在面對新功能時會選擇修改既有的組合式函式而不是製作一個新的，只為了讓他能夠在更多元件中被使用。在這種情況下，我們常常見到組合式函式「失控」— 為了能處理各種(邊緣)情況，越來越多的參數和方法被加入，導致事情遠比它應有的還要複雜；而且隨著時間推移，重構/替換的成本只會越來越高。若您發現舊的組合式函式開始變得過於複雜，不要害怕建立新的組合式函式。
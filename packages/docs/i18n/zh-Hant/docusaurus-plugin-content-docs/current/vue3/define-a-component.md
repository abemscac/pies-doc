---
sidebar_position: 2
description: 如何在 Vue 3 使用不同的方法定義元件
keywords: [派氏文件, vue3, vue元件, vue定義元件]
---

import Badge from '@site/src/widgets/Badge'

# 定義元件

學習如何在 Vue 3 使用不同的方法定義元件。

在 Vue 3 中定義元件有很多方法，我們想展示幾個工作上較常見的模式。

## 1. 傳統選項式 API (Options API)

選項式 API 在 Vue 3 依然有用，而且幾乎一樣！若您直接將 Vue 2 的元件複製到 Vue 3 專案中，也許在解決一些小問題之後他們就能運作良好。

話雖如此，我們還是強烈建議您嘗試新的組合式 API，而不要黏著選項式 API 不放。否則升級到 Vue 3 又有什麼意義呢，對吧？

但是別誤會，選項式 API 仍然是一個好工具！他在 Vue 3 中仍然是一個有效的定義元件方法。

```html title="傳統選項式 API" showLineNumbers
<template>
  <div>
    <div>Hello, {{ name }}, I'm {{ age }} years old.</div>
    <div>I'll be {{ ageAfter3years }} years old after 3 years.</div>
    <input v-model="name" />
    <button @click="incrementAge">Increment age</button>
  </div>
</template>

<script>
  export default {
    props: {
      age: Number,
    },
    emits: ['incrementAge'],
    data() {
      return {
        name: 'world',
      }
    },
    computed: {
      ageAfter3years() {
        return this.age + 3
      },
    },
    methods: {
      incrementAge() {
        this.$emit('incrementAge')
      },
    },
    mounted() {
      console.log('I am mounted!')
    },
  }
</script>
```

:::info

- 一定要看看新的 [`emits`](https://vuejs.org/guide/components/events.html#declaring-emitted-events) 選項！

- Vue 3 裡面有一個新的輔助函式 (helper function) [`defineComponent()`](https://vuejs.org/api/general.html#definecomponent)。若您想要在定義元件的時候有一些介面的幫助，您可以這樣做：

  ```html title="Example.vue" showLineNumbers
  <script>
  import { defineComponent } from 'vue'

  export default defineComponent({
    props: {
      // 平常的元件內容
    },
  })
  </script>
  ```

:::

## 2. 組合式 API 搭配 `<script setup>`

<p>
  <Badge variant="success" text="推薦" />
</p>

這是目前最受歡迎的模式。若您曾經學過 React 的 Hooks API，您可能會發現這個模式的風格和他很像。如果您沒有學過，也不用擔心！這個模式其實很好懂。

預設情況下，無論您使用的是一般函式還是箭頭函式，`<script setup>` 裡面不都會有 `this` 的出現。所以如果您不喜歡 `this`，這會是個好消息！

```html title="組合式 API 搭配 <script setup>" showLineNumbers
<template>
  <div>
    <div>Hello, {{ name }}, I'm {{ age }} years old.</div>
    <div>I'll be {{ ageAfter3years }} years old after 3 years.</div>
    <input v-model="name" />
    <button @click="incrementAge">Increment age</button>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, toRefs } from 'vue'

// 定義 props
const props = defineProps<{
  age: number
}>()
const { age } = toRefs(props)

// 定義自定義事件
const emit = defineEmits<{
  (e: 'incrementAge'): void
}>()

// 定義 data
const name = ref('world')

// 定義計算 (computed) 屬性
const ageAfter3years = computed(() => age.value + 3)

// 定義方法
const incrementAge = () => {
  emit('incrementAge')
}

// 註冊生命週期鉤子
onMounted(() => {
  console.log('I am mounted!')
})
</script>
```

:::info

您可能已經注意到，我們使用 `defineProps()` 和 `defineEmits()` 卻沒有定義或匯入他們，這是因為他們是 [**編譯器宏函式**](https://vuejs.org/api/sfc-script-setup.html#defineprops-defineemits)。如果您在元件中匯入並使用他們，Vue 反而會在主控台中顯示警告訊息。

:::

## 3. 組合式 API 搭配 `setup()`

另外一個方法是在選項式 API 中使用新的 [`setup()`](https://vuejs.org/api/composition-api-setup.html) 選項：

```html title="組合式 API 搭配 setup()" showLineNumbers
<template>
  <div>
    <div>Hello, {{ name }}, I'm {{ age }} years old.</div>
    <div>I'll be {{ ageAfter3years }} years old after 3 years.</div>
    <input v-model="name" />
    <button @click="incrementAge">Increment age</button>
  </div>
</template>

<script>
  import { computed, onMounted, ref } from 'vue'

  export default {
    props: {
      age: Number,
    },
    emits: ['incrementAge'],
    setup(props, context) {
      // 定義狀態
      const name = ref('world')

      // 定義計算 (computed) 屬性
      const ageAfter3years = computed(() => props.age + 3)

      // 定義方法
      const incrementAge = () => {
        context.emit('incrementAge')
      }

      // 註冊生命週期鉤子
      onMounted(() => {
        console.log('I am mounted!')
      })

      // 回傳一個物件，裡面包含所有想要開放給 <template> 存取的變數
      return {
        name,
        ageAfter3years,
        incrementAge,
      }
    },
  }
</script>
```

這個模式看起來和 `<script setup>` 差不多，主要的差別是：

1. `props` 必須使用 `props` 選項來定義而非 `defineProps()`，因為 `defineProps()` 只能在 `<script setup>` 中使用。這代表我們無法使用一些方便的新功能，例如 [僅使用類型來定義 props/emit](https://vuejs.org/api/sfc-script-setup.html#typescript-only-features)。
2. 自定義事件必須使用 `emits` 選項來定義而非 `defineEmits()`，因為 `defineEmits()` 只能在 `<script setup>` 中使用.
3. `props` 可以直接被 `<template>` 存取，但是在 `setup()` 裡面定義的變數必須被包在一個物件中並回傳，才能在 `<template>` 中被存取。

若您使用 SFC，我們建議您使用 `<script setup>`，因為他的樣板碼 (boilerplate) 比較少。

:::caution

由於 `setup()` 是選項式 API 的一部分，`data()`、`computed`、`methods` 和 `mounted()` 等等的選項如果有被定義，他們仍然會作用。

舉例來說，以下的元件能夠順利運行，而且不會產生任何的警告和錯誤：

```html showLineNumbers
<template>
  <div>
    <h1>Hello, {{ upperCaseName }}.</h1>
    <button @click="sayMyAge">Say my age</button>
  </div>
</template>

<script>
  import { onMounted, ref } from 'vue'

  export default {
    setup() {
      const name = ref('world')

      // highlight-start
      onMounted(() => {
        console.log('[setup()] I am mounted!')
      })
      // highlight-end

      return {
        name,
      }
    },
    computed: {
      upperCaseName() {
        return this.name.toUpperCase()
      },
    },
    methods: {
      sayMyAge() {
        console.log('I am 5 years old')
      },
    },
    // highlight-start
    mounted() {
      console.log('[mounted()] I am mounted!')
    },
    // highlight-end
  }
</script>
```

- 這裡有兩個 `mounted` 生命週期鉤子被註冊，而且**兩個鉤子都會作用**。
- 我們可以在 `setup()` 中定義狀態 (data) 和方法 (methods)，但這就和 `data()` 及 `methods` 選項的功能重疊了；這代表我們現在需要檢查多個地方才能找到變數的來源。

隨著應用程式逐漸變大，問題只會越來越多，因此我們建議您**極力避免混用選項式 API 和 組合式 API！**
:::

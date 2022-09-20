---
sidebar_position: 2
description: 如何在 Vue 3 使用不同的方法定义组件
keywords: [piesdoc, vue3]
---

import Badge from '@site/src/widgets/Badge'

# 定义组件

学习如何在 Vue 3 使用不同的方法定义组件。

在 Vue 3 中定义组件有很多方法，我们想展示几个工作上较常见的模式。

## 1. 传统选项式 API (Options API)

选项式 API 在 Vue 3 依然有用，而且几乎一样！若您直接将 Vue 2 的组件复制到 Vue 3 专案中，也许在解决一些小问题之后他们就能运作良好。

话虽如此，我们还是强烈建议您尝试新的组合式 API，而不要黏着选项式 API 不放。否则升级到 Vue 3 又有什么意义呢，对吧？

但是别误会，选项式 API 仍然是一个好工具！他在 Vue 3 中仍然是一个有效的定义组件方法。

```html title="传统选项式 API" showLineNumbers
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

- 一定要看看新的 [`emits`](https://vuejs.org/guide/components/events.html#declaring-emitted-events) 选项！

- Vue 3 里面有一个新的辅助函数 (helper function) [`defineComponent()`](https://vuejs.org/api/general.html#definecomponent)。若您想要在定义组件的时候有一些介面的帮助，您可以这样做：

  ```html title="MyComponent.vue" showLineNumbers
  <script>
  import { defineComponent } from 'vue'

  export default defineComponent({
    props: {
      // 平常的组件内容
    },
  })
  </script>
  ```

:::

## 2. 组合式 API 搭配 `<script setup>`

<p>
  <Badge variant="success" text="推荐" />
</p>

这是目前最受欢迎的模式。若您曾经学过 React 的 Hooks API，您可能会发现这个模式的风格和他很像。如果您没有学过，也不用担心！这个模式其实很好懂。

预设情况下，无论您使用的是一般函数还是箭头函数，`<script setup>` 里面不都会有 `this` 的出现。所以如果您不喜欢 `this`，这会是个好消息！

```html title="组合式 API 搭配 <script setup>" showLineNumbers
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

// 定义 props
const props = defineProps<{
  age: number
}>()
const { age } = toRefs(props)

// 定义自定义事件
const emit = defineEmits<{
  (e: 'incrementAge'): void
}>()

// 定义 data
const name = ref('world')

// 定义计算 (computed) 属性
const ageAfter3years = computed(() => age.value + 3)

// 定义方法
const incrementAge = () => {
  emit('incrementAge')
}

// 注册生命周期钩子
onMounted(() => {
  console.log('I am mounted!')
})
</script>
```

:::info

您可能已经注意到，我们使用 `defineProps()` 和 `defineEtmis()` 却没有定义或汇入他们，这是因为他们是 [**编译器宏函数**](https://vuejs.org/api/sfc-script-setup.html#defineprops-defineemits)。如果您在组件中汇入并使用他们，Vue 反而会在主控台中显示警告讯息。

:::

## 3. 组合式 API 搭配 `setup()`

另外一个方法是在选项式 API 中使用新的 [`setup()`](https://vuejs.org/api/composition-api-setup.html) 选项：

```html title="组合式 API 搭配 setup()" showLineNumbers
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
      // 定义状态
      const name = ref('world')

      // 定义计算 (computed) 属性
      const ageAfter3years = computed(() => props.age + 3)

      // 定义方法
      const incrementAge = () => {
        context.emit('incrementAge')
      }

      // 注册生命周期钩子
      onMounted(() => {
        console.log('I am mounted!')
      })

      // 返回一个物件，里面包含所有想要开放给 <template> 存取的变量
      return {
        name,
        ageAfter3years,
        incrementAge,
      }
    },
  }
</script>
```

这个模式看起来和 `<script setup>` 差不多，主要的差别是：

1. `props` 必须使用 `props` 选项来定义而非 `defineProps()`，因为 `defineProps()` 只能在 `<script setup>` 中使用。这代表我们无法使用一些方便的新功能，例如 [仅使用类型来定义 props/emit](https://vuejs.org/api/sfc-script-setup.html#typescript-only-features)。
2. 自定义事件必须使用 `emits` 选项来定义而非 `defineEmits()`，因为 `defineEtmis()` 只能在 `<script setup>` 中使用.
3. `props` 可以直接被 `<template>` 存取，但是在 `setup()` 里面定义的变量必须被包在一个物件中并返回，才能在 `<template>` 中被存取。

若您使用 SFC，我们建议您使用 `<script setup>`，因为他的样板码 (boilerplate) 比较少。

:::caution

由于 `setup()` 是选项式 API 的一部分，`data()`、`computed`、`methods` 和 `mounted()` 等等的选项如果有被定义，他们仍然会作用。

举例来说，以下的组件能够顺利运行，而且不会产生任何的警告和错误：

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

- 这里有两个 `mounted` 生命周期钩子被注册，而且**两个钩子都会作用**。
- 我们可以在 `setup()` 中定义状态 (data) 和方法 (methods)，但这就和 `data()` 及 `methods` 选项的功能重叠了；这代表我们现在需要检查多个地方才能找到变量的来源。

随着应用程序逐渐变大，问题只会越来越多，因此我们建议您**极力避免混用选项式 API 和 组合式 API！**
:::

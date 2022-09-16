---
sidebar_position: 2
description: How to define a component in various ways in Vue 3.
keywords: [piesdoc, vue3]
---

import Badge from '@site/src/widgets/Badge'

# Define a Component

Learn a couple of ways to define a component in Vue 3.

There are multiple ways to define a component in Vue 3, we want to bring up some commonly seen patterns you may use in your everyday life.

## 1. Legacy Options API

The legacy Options API still works in Vue 3, in almost the same way! If you just copy & paste your Vue 2 components into a Vue 3 project, they'll probably work fine after some other minor issues are resolved.

That being said, it is strongly recommended to try out the new Composition API instead of sticking to the legacy Options API. Otherwise what is the point of upgrading from Vue 2 to Vue 3, right?

But don't get me wrong, Options API is still a great tool! It's still a valid way to define a component in Vue 3.

```html title="Legacy Options API" showLineNumbers
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

- Make sure to check out the new [`emits`](https://vuejs.org/guide/components/events.html#declaring-emitted-events) option in Vue 3!

- There's also a new [`defineComponent()`](https://vuejs.org/api/general.html#definecomponent) helper function in Vue 3. If you would like to see some type interfaces while defining components, you can use it like this:

  ```html title="MyComponent.vue" showLineNumbers
  <script>
  import { defineComponent } from 'vue'

  export default defineComponent({
    props: {
      // Typical component stuff.
    },
  })
  </script>
  ```

:::

## 2. Composition API With `<script setup>`

<p>
  <Badge variant="success" text="Recommended" />
</p>

This is the most popular option at the moment. If you've leaned React Hooks API, you may find the coding styles very similar. If you don't, don't worry! It's actually very easy to understand.

By default there's no `this` in `<script setup>` whether you use function or arrow function. So if don't like `this`, this will be a good news!

```html title="Composition API with <script setup>" showLineNumbers
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

// Define props.
const props = defineProps<{
  age: number
}>()
const { age } = toRefs(props)

// Define emitted events.
const emit = defineEmits<{
  (e: 'incrementAge'): void
}>()

// Define data.
const name = ref('world')

// Define computed properties.
const ageAfter3years = computed(() => age.value + 3)

// Define methods.
const incrementAge = () => {
  emit('incrementAge')
}

// Register lifecycle hooks.
onMounted(() => {
  console.log('I am mounted!')
})
</script>
```

:::info

You may have noticed that we're using `defineProps()` and `defineEtmis()` without importing them, this is because those functions are [**compiler macros**](https://vuejs.org/api/sfc-script-setup.html#defineprops-defineemits). Vue will show a warning in console if you explicitly import and use them in a component.

:::

## 3. Composition API With `setup()`

Another option is to use the new [`setup()`](https://vuejs.org/api/composition-api-setup.html) option in Options API:

```html title="Composition API with setup()" showLineNumbers
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
      // Define data.
      const name = ref('world')

      // Define computed properties.
      const ageAfter3years = computed(() => props.age + 3)

      // Define methods.
      const incrementAge = () => {
        context.emit('incrementAge')
      }

      // Register lifecycle hooks.
      onMounted(() => {
        console.log('I am mounted!')
      })

      // Return an object with all of the properties you want to expose to <template>.
      return {
        name,
        ageAfter3years,
        incrementAge,
      }
    },
  }
</script>
```

It's almost the same with `<script setup>`, the main differences are:

1. `props` must be defined using `props` option instead of `defineProps()`, because `defineProps()` only works in `<script setup>`. This means we will not be able to use some convenient features like [type-only props/emit declarations](https://vuejs.org/api/sfc-script-setup.html#typescript-only-features).
2. Emitted events must be defined using `emits` option instead of `defineEmits()`, because `defineEtmis()` only works in `<script setup>`.
3. `props` can be directly accessed in `<template>`, but variables declared in `setup()` must be returned in the function to make them accessible in `<template>`.

If you're using SFC, we recommend you to just use `<script setup>` instead because there's less boilerplate.

:::caution

Since `setup()` is a part of Options API, things like `data()`, `computed`, `methods`, `mounted()` could still work if they are defined.

For example, the following component will work without any warning/error:

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

- There are 2 `mounted` lifecycle hooks getting registered, and **both of them works**.
- `upperCaseName` in `computed` is referencing the `name` we returned in `setup()`.
- We could define data and methods in `setup()`, but that is now overlapping with `data()` and `methods: { ... }`; this means we may have to check multiple places to find the source of a variable in a component.

Things would only get worse as your app gets bigger, so we strongly recommend you to **avoid mixing Options API and Composition API** like this at all cost!
:::

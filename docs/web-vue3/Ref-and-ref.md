---
sidebar_position: 3
---

# Ref and ref

This is probably the most important part in Vue 3!

## What is Ref?

`Ref` is a **type** that has only one public property `value`.

A simple (yet not 100% correct) interface for `Ref` would look like this:

```ts
interface Ref<T> {
  value: T
}
```

A `Ref` variable can contain only **one** value with any type, so you can have `Ref<number>`, `Ref<boolean>`, `Ref<Map>`, `Ref<{ id: number, name: string }>`, `Ref<YourOwnInterface[]>`, `Ref<Promise<number>>`, anything you need.

That's all we need to know about `Ref` for now!

## What is ref?

`ref` is a `function` that accepts an argument (value or variable), and returns a `Ref` with that "thing" as its' `value`. For example:

```ts
import { ref } from 'vue'

const name = ref('hello')

console.log(name.value) // 'hello'
```

Pretty easy, eh?
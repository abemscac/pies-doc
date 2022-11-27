---
sidebar_position: 4
description: 说明 Vue 3 reactive() 函数的功用
keywords: [派氏文件, vue3, vue reactive, vue响应性, vue响应式代理]
---

import Video from '@site/src/widgets/Video'

# `reactive()`

## 什么是 `reactive()`？

`reactive()` 是一个**函数**，只接收一个**非原始型别**的参数，并且返回一个类型为 `UnwrapNestedRef<T>` 的**响应式代理** (reactive proxy)。

这一行其实已经很好的做完总结了，但是他可能给你带来了你很多问题：

- 什么是**非原始型别**？
- 什么是**响应式代理**？
- 什么是 **`UnwrapNestedRef<T>`**？ (不见得要学)

我们将在本章中尝试解释这些内容。但在此之前，我们先来看一个 `reactive()` 的简单范例：

```ts showLineNumbers
import { reactive } from 'vue'

const user = reactive({
  name: 'hello',
  age: 5,
})

console.log(user.name) // 'hello'
console.log(user.age) // 5
```

在这个范例中，`reactive()` 返回值的资料结构和我们传给他的参数一模一样 (但并非永远都是如此！)。要修改响应式代理的数值，我们只需要使用典型的作法即可：

```ts showLineNumbers
import { reactive } from 'vue'

const user = reactive({
  name: 'hello',
  age: 5,
})

console.log(user.name, user.age) // 'hello', 5

// highlight-next-line
user.name = 'world'
// highlight-next-line
user.age = 10

console.log(user.name, user.age) // 'world', 10
```

## `reactive()` 只能和非原始型别一起使用

:::info

什么是**非原始型别**？简单来说，任何不是原始型别的数值都称为非原始型别 (还用你说吗？)。关于原始型别的定义请参考[这里](https://developer.mozilla.org/en-US/docs/Glossary/Primitive)。

:::

若您尝试将 `reactive()` 用在如 `0` 的原始型别上，在开发模式下您会在主控台中看见一个警告讯息，内容为 `value cannot be made reactive: 0`。

```ts showLineNumbers
import { reactive } from 'vue'

const count = reactive(0) // value cannot be made reactive: 0
```

这是因为 `reactive()` 仅适用于**非原始型别**。如果参数是一个原始型别，`reactive()` 会直接将他返回。
这代表由于 `reacitve()` 运作机制的关系，写下 `const count = reactive(0)` 其实就等于写下 `const count = 0`。
即使您使用 `let count = reactive(0)` 这样的方式来宣告他，您的组件在 `count` 发生变化时依然不会重新渲染 (re-render)，因为 `count` 只不过是一个普通的数字罢了。

:::info

- 若您需要响应式的原始型别，您应该使用 [`ref()`](./ref-and-ref#什么是-ref)。
- 我们会在 [`ref()` 还是 `reactive()`](./ref-or-reactive#reactive-的运作原理) 章节中详细说明 `reactive()` 是如何运作的。

:::

## 什么是响应式代理 (Reactive Proxy)？

如果您不知道什么是[代理](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) (proxy)，不用担心；就算不知道他是什么，您也可以把 `reactive()` 学得很好！

简单来说，代理指的是一个特别的物件，能让我们在某个特定物件被存取或修改时执行额外的逻辑。这就是 Vue 将响应性 (reactivity) 套用到响应式代理上的方式。

所以您可以把响应式代理想像成是一个和目标物件长得一模一样的东西，只是当他的数值改变时，他会帮我们执行一些额外的逻辑。

### `<template>` 中的非响应性数值

在学习响应式代理前，我们先来看看**非响应式数值**的例子，也就是一个标准、普通的 JavaScript 变量。例如一个简单对象 (plain object)：

```html title="非响应式数值" showLineNumbers
<template>
  <div>
    <h1>{{ user.name }} is {{ user.age }} years old</h1>
    <button @click="getOld">Get Old</button>
  </div>
</template>

<script setup>
// highlight-start
const user = {
  name: 'hello',
  age: 5,
}
// highlight-end

const getOld = () => {
  // highlight-next-line
  user.age++
  console.log(user.age)
}
</script>
```

这个组件的逻辑很简单—每次我们点击 "Get Old"，`user.age` 都会增加 1。一开始我们在萤幕上看见 `hello is 5 years old`，无论我们点击按钮多少次，画面上的数字永远会是 `5`。

<Video src="/video/vue3/reactive_non-reactive-value.mov" />

发生这种情况的原因是 `user` 不是一个使用 `ref()` 或 `reactive()` 宣告出来的响应式数值。由于它是一个非响应式数值，我们的组件根本不在乎他发生了什么变化。即使 `user.age` 的数值的确改变了，我们的组件还是没有重新渲染。


### `<template>` 中的响应式代理

现在我们来看看**响应式代理**的例子：

```html title="响应式代理" showLineNumbers
<template>
  <div>
    <h1>{{ user.name }} is {{ user.age }} years old</h1>
    <button @click="getOld">Get Old</button>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

// highlight-start
const user = reactive({
  name: 'hello',
  age: 5,
})
// highlight-end

const getOld = () => {
  // highlight-next-line
  user.age++
  console.log(user.age)
}
</script>
```

这个组件和上面那个几乎一样，唯一的差别是我们现在使用 `reactive()` 来宣告 `user`。随意点击按钮几次，您会发现组件终于按照预期的重新渲染了。

<Video src="/video/vue3/reactive_reactive-proxy.mov" />

为什么使用 `reactive()` 就会产生这样的差别呢？原因是 Vue 的组件被设计成在预设情况下，只有在**响应式代理**或是 **`Ref<T>`** 的数值发生变化时，才会重新渲染。所以只要我们没有使用 `reactive()` 或 `ref()` 来宣告 `user`，我们的组件就不会在他发生变化时重新渲染，因为 `user` 既不是响应式代理，也不是 `Ref<T>`。

### 同时使用响应式和非响应式数值

请注意，这并不代表非响应性数值的改变永远不会被呈现在画面上。我们来看看下面这个例子：

```html title="同时使用响应式和非响应式数值" showLineNumbers
<template>
  <div>
    <h1>{{ cat.name }} is {{ dog.age }} years old</h1>
    <button @click="changeName">Change Name</button>
    <button @click="getOld">Get Old</button>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

// highlight-start
const cat = reactive({
  name: 'hello',
})
// highlight-end

const changeName = () => {
  // highlight-next-line
  cat.name += 'o'
}

// highlight-start
const dog = {
  age: 5,
}
// highlight-end

const getOld = () => {
  // highlight-next-line
  dog.age++
}
</script>
```

在这个范例中，我们同时使用了响应式和非响应式数值。他的逻辑很简单—点击 "Change Name" 会在 `cat.name` 的后面加上一个 `o`，而点击 "Get Old" 会使得 `dog.age` 增加 1。

我们在这里将 `cat` 宣告为响应式代理，`dog` 则是被宣告为非响应式数值。我们知道 `cat` 的改变会导致组件重新渲染，而 `dog` 的改变则不会，因为 `cat` 是一个响应式代理的缘故。

一开始我们随意点击 "Change Name" 几次，每次点击组件都会重新渲染，画面上的 `hello` 会随着每次的点击逐次增加一个 `o`。

<Video src="/video/vue3/reactive_both-0.mov" />

接下来我们点击 "Get Old" 几次，这次组件并没有重新渲染。这在我们的预料之内，因为 `dog` 既不是响应式代理也不是 `Ref<T>`。

<Video src="/video/vue3/reactive_both-1.mov" />

接着我们回头点击 "Change Name" 一次，奇怪的事就发生了—画面上的 `5` 竟然改变了！

<Video src="/video/vue3/reactive_both-2.mov" />

很让人困惑对吧？这背后的祕密是：

- 当我们点击 "Get Old" 时，`dog.age` 的数值的确改变了，只是这个变化并没有被反应在画面上，因为组件并没有重新渲染。
- 当我们点击 "Change Name" 时，`cat.name` 发生了变化；因为 `cat` 是一个响应式代理，组件便会随着这个变化而重新渲染，于是他就从 `<script>` 中抓取变量最新的状态，并将他们显示在画面上。

因此在使用 Vue 3 时，你应该**极力避免在 `<template>` 中混用响应式和非响应式数值**，因为这样的写法更容易导致 bug 的出现。知道何时该将变量宣告为响应式是很重要的，一个简单的判断基准是：

- 如果这个数值**会发生变化**，而且**使用者必须观察到他的变化**，那么就使用 `ref()` 或是 `reactive()` 来将他宣告成响应式数值。
- 否则就不要将他宣告成响应式数值。

## 响应式代理的响应性

### 解构赋值 (Destructing Assignment) 会破坏响应性吗？

开发人员常犯的一个错误是，他们将原始型别属性从响应式代理中取出，将他们分配给一些变量，并认为他们仍然具有响应性。这种情况最常发生在解构赋值上面：

```ts showLineNumbers
import { reactive } from 'vue'

const user = reactive({
  child: {
    name: 'hello',
  },
})

// highlight-next-line
const { child } = user

console.log(user.child.name, child.name) // 'hello', 'hello'

// highlight-next-line
child.name = 'world'

console.log(user.child.name, child.name) // 'world', 'world'
```

这个范例展示了一个常见的误解，即所有我们从响应式代理身上拿到的数值都会「连接」到源头，实际上并非如此！例如：

```ts showLineNumbers
import { reactive } from 'vue'

const user = reactive({
  name: 'hello',
  age: 5,
})

// highlight-next-line
const { name: myName, age: myAge } = user

console.log(user.name, myName) // 'hello', 'hello'
console.log(user.age, myAge) // 5, 5
```

我们心想「好，现在 `myName` 和 `myAge` 一定和 `user` 连接在一起了」，接着便去修改 `user.name` 和 `user.age` 的数值：

```ts showLineNumbers
import { reactive } from 'vue'

const user = reactive({
  name: 'hello',
  age: 5,
})

const { name: myName, age: myAge } = user

console.log(user.name, myName) // 'hello', 'hello'
console.log(user.age, myAge) // 5, 5

// highlight-next-line
user.name = 'world'
// highlight-next-line
user.age = 10

console.log(user.name, myName) // 'world', 'hello'
console.log(user.age, myAge) // 10, 5
```

如您所见，我们对 `user` 所造成的改动完全没有影响到 `myName` 和 `myAge` (反之亦然)。

为什么在第一个范例中，修改 `child.name` 的确影响到了 `user.child`，但同样的情况却无法在第二个范例中被观察到呢？

_这是我们在 `reactive()` 身上使用解构赋值所导致的问题吗？_

这么说不太对。即便我们把它写成 `const myName = user.name`，同样的情况还是会发生 (因为那正是解构赋值所做的事情)，所以把问题都推到解构赋值身上是不正确的。

答案其实很间单。我们需只要复习一下变量在 JavaScript 中运作的方式，您马上就会了解其中的原因了！

在 JavaScript 中，数值只能经由两种方式被传递—**传值**或是**传参考**。原始型别总是透过**传值**的方式被传递，而非原始型别总是透过**传参考**的方式被传递。因此，透过写下 `const { name: myName, age: myName } = user`，我们其实就是在写：

```js showLineNumbers
const myName = user.name
const myAge = user.age
```

因为 `user.name` (字串) 和 `user.age` (数字) 皆属于**原始型别**，他们会以**传值**的方式被传递给 `myName` 和 `myAge`；意思就是说 `myName` 和 `myAge` 会是有着新记忆体位置的新变量，于是就和 `user`「断线」了。

所以单从程式方面来说，只要目标值是非原始型别，您就可以随心所欲地对着 `reactive()` 使用解构赋值。但是我们还是不建议这么做，因为那会使得变量之间表现出不同的行为 (有些具有响应性，有些则没有)。

### 如何保持响应性

所以是否存在一个方法让我们在对着 `reactive()` 使用解构赋值的同时，又能保有变量的响应性呢？有的！最接近的解决方案是 [`toRef()`](https://vuejs.org/api/reactivity-utilities.html#toref) 和 [`toRefs()`](https://vuejs.org/api/reactivity-utilities.html#torefs)。

`toRef()` 和 `toRefs()` 的功能和他们的名称所描述的的一样—将某个东西转换为 `Ref<T>` 的形式。这两个函数非常相近，但还是有一点小差异；总的来说，**`toRefs()` = 很多个 `toRef()`**。例如：

```ts showLineNumbers
import { reactive, toRef, toRefs } from 'vue'

const user = reactive({
  name: 'hello',
  age: 5,
})

// 我们可以这么做：
// highlight-start
const name = toRef(user, 'name')
const age = toRef(user, 'age')
// highlight-end

// 或是这样：
// highlight-next-line
const { name, age } = toRefs(user)
```

大多数情况我们会使用 `toRefs()`，因为他比 `toRef()` 更方便一些，但结果是一样的。使用 `toRef()` 和 `toRefs()` 所产生的 `Ref<T>` 总是会连接到来源，这意味着响应性将被保留。透过使用 `toRef()` 和 `toRefs()`，我们再也不需要担心属性是否是原始型别。只要将他转换为 `Ref<T>` 的形式，一切就能按照我们所预期的方式运作！


:::info

在上面的例子中，如果我们把 `toRefs()` 换成 `ref()` 会得到相同的结果吗？例如：

```ts showLineNumbers
import { reactive, ref } from 'vue'

const user = reactive({
  name: 'hello',
  age: 5,
})

// 原本是这个样子：
const { name, age } = toRefs(user)

// 换成这种作法会得到一样的结果吗？
// highlight-start
const name = ref(user.name)
const age = ref(user.age)
// highlight-end
```

答案是**不会** — `name` 和 `age` **并不会**和 `user` 连接起来。他们会被视为是独立的 `Ref<T>`。

这是因为 `user.name` 和 `user.age` 都是原始型别的数值，他们会以**传值**的方式被传递给 `ref()`。所以写下 `const name = ref(user.name)` 就会等于写下 `const name = ref('hello')`，代表我们建立了一个新的 `Ref<T>`，只不过是初始值是 `hello` 罢了。

此外，虽然 `ref()` 和 `toRef()` 的返回值都是 `Ref<T>` 介面，他们返回的其实是有着不同逻辑的类别实体。

另外要注意的是，如果目标数值属于非原始型别，`ref()` 和 `toRef()` 所产生的 `Ref<T>` 都会连接到来源，而且他们的更新都会导致组件重新渲染。例如：


```ts showLineNumbers
import { reactive, ref, toRef } from 'vue'

const user = reactive({
  name: 'hello',
  child: {
    age: 5,
  },
})

// highlight-start
const cat = ref(user.child)
const dog = toRef(user, 'child')
// highlight-end

console.log(user.child.age, cat.value.age, dog.value.age) // 5, 5, 5

// highlight-next-line
cat.value.age = 10

console.log(user.child.age, cat.value.age, dog.value.age) // 10, 10, 10

// highlight-next-line
dog.value.age = 15

console.log(user.child.age, cat.value.age, dog.value.age) // 15, 15, 15
```

简单来说，只有在我们要宣告新变量，而且没有参考任何来源的时候才使用 `ref()`；而 `toRef()` 和 `toRefs()` 则是用在依据某个来源来宣告新变量，同时保有响应性的状况。

:::

## 什么是 `UnwrapNestedRef<T>`

`UnwrapNestedRef<T>` 是 `reactive()` 的**返回型别**。由于您的 IDE 可能已经帮您把最复杂的部分做完了，我们其实不见得需要学习这个型别，因此我们认为不要把它放在这里比较好，而且他也有点复杂。不过如果您对它仍然有兴趣，您可以透过阅读 [`UnwrapNestedRef<T>`](./unwrap-nested-ref) 章节来了解他！
---
sidebar_position: 4
description: 說明 Vue 3 reactive() 函式的功用
keywords: [派氏文件, vue3, vue reactive, vue響應性, vue響應式代理]
---

import Video from '@site/src/widgets/Video'

# `reactive()`

## 什麼是 `reactive()`？

`reactive()` 是一個**函式**，只接收一個**非原始型別**的參數，並且回傳一個類型為 `UnwrapNestedRef<T>` 的**響應式代理** (reactive proxy)。

這一行其實已經很好的做完總結了，但是他可能給你帶來了你很多問題：

- 什麼是**非原始型別**？
- 什麼是**響應式代理**？
- 什麼是 **`UnwrapNestedRef<T>`**？ (不見得要學)

我們將在本章中嘗試解釋這些內容。但在此之前，我們先來看一個 `reactive()` 的簡單範例：

```ts showLineNumbers
import { reactive } from 'vue'

const user = reactive({
  name: 'hello',
  age: 5,
})

console.log(user.name) // 'hello'
console.log(user.age) // 5
```

在這個範例中，`reactive()` 回傳值的資料結構和我們傳給他的參數一模一樣 (但並非永遠都是如此！)。要修改響應式代理的數值，我們只需要使用典型的作法即可：

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

## `reactive()` 只能和非原始型別一起使用

:::info

什麼是**非原始型別**？簡單來說，任何不是原始型別的數值都稱為非原始型別 (還用你說嗎？)。關於原始型別的定義請參考[這裡](https://developer.mozilla.org/en-US/docs/Glossary/Primitive)。

:::

若您嘗試將 `reactive()` 用在如 `0` 的原始型別上，在開發模式下您會在主控台中看見一個警告訊息，內容為 `value cannot be made reactive: 0`。

```ts showLineNumbers
import { reactive } from 'vue'

const count = reactive(0) // value cannot be made reactive: 0
```

這是因為 `reactive()` 僅適用於**非原始型別**。如果參數是一個原始型別，`reactive()` 會直接將他回傳。
這代表由於 `reacitve()` 運作機制的關係，寫下 `const count = reactive(0)` 其實就等於寫下 `const count = 0`。
即使您使用 `let count = reactive(0)` 這樣的方式來宣告他，您的元件在 `count` 發生變化時依然不會重新渲染 (re-render)，因為 `count` 只不過是一個普通的數字罷了。

:::info

- 若您需要響應式的原始型別，您應該使用 [`ref()`](./ref-and-ref#什麼是-ref)。
- 我們會在 [`ref()` 還是 `reactive()`](./ref-or-reactive#reactive-的運作原理) 章節中詳細說明 `reactive()` 是如何運作的。

:::

## 什麼是響應式代理 (Reactive Proxy)？

如果您不知道什麼是[代理](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) (proxy)，不用擔心；就算不知道他是什麼，您也可以把 `reactive()` 學得很好！

簡單來說，代理指的是一個特別的物件，能讓我們在某個特定物件被存取或修改時執行額外的邏輯。這就是 Vue 將響應性 (reactivity) 套用到響應式代理上的方式。

所以您可以把響應式代理想像成是一個和目標物件長得一模一樣的東西，只是當他的數值改變時，他會幫我們執行一些額外的邏輯。

### `<template>` 中的非響應性數值

在學習響應式代理前，我們先來看看**非響應式數值**的例子，也就是一個標準、普通的 JavaScript 變數。例如一個簡單對象 (plain object)：

```html title="非響應式數值" showLineNumbers
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

這個元件的邏輯很簡單—每次我們點擊 "Get Old"，`user.age` 都會增加 1。一開始我們在螢幕上看見 `hello is 5 years old`，無論我們點擊按鈕多少次，畫面上的數字永遠會是 `5`。

<Video src="/video/reactive_non-reactive-value.mov" />

發生這種情況的原因是 `user` 不是一個使用 `ref()` 或 `reactive()` 宣告出來的響應式數值。由於它是一個非響應式數值，我們的元件根本不在乎他發生了什麼變化。即使 `user.age` 的數值的確改變了，我們的元件還是沒有重新渲染。


### `<template>` 中的響應式代理

現在我們來看看**響應式代理**的例子：

```html title="響應式代理" showLineNumbers
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

這個元件和上面那個幾乎一樣，唯一的差別是我們現在使用 `reactive()` 來宣告 `user`。隨意點擊按鈕幾次，您會發現元件終於按照預期的重新渲染了。

<Video src="/video/reactive_reactive-proxy.mov" />

為什麼使用 `reactive()` 就會產生這樣的差別呢？原因是 Vue 的元件被設計成在預設情況下，只有在**響應式代理**或是 **`Ref<T>`** 的數值發生變化時，才會重新渲染。所以只要我們沒有使用 `reactive()` 或 `ref()` 來宣告 `user`，我們的元件就不會在他發生變化時重新渲染，因為 `user` 既不是響應式代理，也不是 `Ref<T>`。

### 同時使用響應式和非響應式數值

請注意，這並不代表非響應性數值的改變永遠不會被呈現在畫面上。我們來看看下面這個例子：

```html title="同時使用響應式和非響應式數值" showLineNumbers
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

在這個範例中，我們同時使用了響應式和非響應式數值。他的邏輯很簡單—點擊 "Change Name" 會在 `cat.name` 的後面加上一個 `o`，而點擊 "Get Old" 會使得 `dog.age` 增加 1。

我們在這裡將 `cat` 宣告為響應式代理，`dog` 則是被宣告為非響應式數值。我們知道 `cat` 的改變會導致元件重新渲染，而 `dog` 的改變則不會，因為 `cat` 是一個響應式代理的緣故。

一開始我們隨意點擊 "Change Name" 幾次，每次點擊元件都會重新渲染，畫面上的 `hello` 會隨著每次的點擊逐次增加一個 `o`。

<Video src="/video/reactive_both-0.mov" />

接下來我們點擊 "Get Old" 幾次，這次元件並沒有重新渲染。這在我們的預料之內，因為 `dog` 既不是響應式代理也不是 `Ref<T>`。

<Video src="/video/reactive_both-1.mov" />

接著我們回頭點擊 "Change Name" 一次，奇怪的事就發生了—畫面上的 `5` 竟然改變了！

<Video src="/video/reactive_both-2.mov" />

很讓人困惑對吧？這背後的祕密是：

- 當我們點擊 "Get Old" 時，`dog.age` 的數值的確改變了，只是這個變化並沒有被反應在畫面上，因為元件並沒有重新渲染。
- 當我們點擊 "Change Name" 時，`cat.name` 發生了變化；因為 `cat` 是一個響應式代理，元件便會隨著這個變化而重新渲染，於是他就從 `<script>` 中抓取變數最新的狀態，並將他們顯示在畫面上。

因此在使用 Vue 3 時，你應該**極力避免在 `<template>` 中混用響應式和非響應式數值**，因為這樣的寫法更容易導致 bug 的出現。知道何時該將變數宣告為響應式是很重要的，一個簡單的判斷基準是：

- 如果這個數值**會發生變化**，而且**使用者必須觀察到他的變化**，那麼就使用 `ref()` 或是 `reactive()` 來將他宣告成響應式數值。
- 否則就不要將他宣告成響應式數值。

## 響應式代理的響應性

### 解構賦值 (Destructing Assignment) 會破壞響應性嗎？

開發人員常犯的一個錯誤是，他們將原始型別屬性從響應式代理中取出，將他們分配給一些變數，並認為他們仍然具有響應性。這種情況最常發生在解構賦值上面：

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

這個範例展示了一個常見的誤解，即所有我們從響應式代理身上拿到的數值都會「連接」到源頭，實際上並非如此！例如：

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

我們心想「好，現在 `myName` 和 `myAge` 一定和 `user` 連接在一起了」，接著便去修改 `user.name` 和 `user.age` 的數值：

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

如您所見，我們對 `user` 所造成的改動完全沒有影響到 `myName` 和 `myAge` (反之亦然)。

為什麼在第一個範例中，修改 `child.name` 的確影響到了 `user.child`，但同樣的情況卻無法在第二個範例中被觀察到呢？

_這是我們在 `reactive()` 身上使用解構賦值所導致的問題嗎？_

這麼說不太對。即便我們把它寫成 `const myName = user.name`，同樣的情況還是會發生 (因為那正是解構賦值所做的事情)，所以把問題都推到解構賦值身上是不正確的。

答案其實很間單。我們需只要複習一下變數在 JavaScript 中運作的方式，您馬上就會了解其中的原因了！

在 JavaScript 中，數值只能經由兩種方式被傳遞—**傳值**或是**傳參考**。原始型別總是透過**傳值**的方式被傳遞，而非原始型別總是透過**傳參考**的方式被傳遞。因此，透過寫下 `const { name: myName, age: myName } = user`，我們其實就是在寫：

```js showLineNumbers
const myName = user.name
const myAge = user.age
```

因為 `user.name` (字串) 和 `user.age` (數字) 皆屬於**原始型別**，他們會以**傳值**的方式被傳遞給 `myName` 和 `myAge`；意思就是說 `myName` 和 `myAge` 會是有著新記憶體位置的新變數，於是就和 `user`「斷線」了。

所以單從程式方面來說，只要目標值是非原始型別，您就可以隨心所欲地對著 `reactive()` 使用解構賦值。但是我們還是不建議這麼做，因為那會使得變數之間表現出不同的行為 (有些具有響應性，有些則沒有)。

### 如何保持響應性

所以是否存在一個方法讓我們在對著 `reactive()` 使用解構賦值的同時，又能保有變數的響應性呢？有的！最接近的解決方案是 [`toRef()`](https://vuejs.org/api/reactivity-utilities.html#toref) 和 [`toRefs()`](https://vuejs.org/api/reactivity-utilities.html#torefs)。

`toRef()` 和 `toRefs()` 的功能和他們的名稱所描述的的一樣—將某個東西轉換為 `Ref<T>` 的形式。這兩個函式非常相近，但還是有一點小差異；總的來說，**`toRefs()` = 很多個 `toRef()`**。例如：

```ts showLineNumbers
import { reactive, toRef, toRefs } from 'vue'

const user = reactive({
  name: 'hello',
  age: 5,
})

// 我們可以這麼做：
// highlight-start
const name = toRef(user, 'name')
const age = toRef(user, 'age')
// highlight-end

// 或是這樣：
// highlight-next-line
const { name, age } = toRefs(user)
```

大多數情況我們會使用 `toRefs()`，因為他比 `toRef()` 更方便一些，但結果是一樣的。使用 `toRef()` 和 `toRefs()` 所產生的 `Ref<T>` 總是會連接到來源，這意味著響應性將被保留。透過使用 `toRef()` 和 `toRefs()`，我們再也不需要擔心屬性是否是原始型別。只要將他轉換為 `Ref<T>` 的形式，一切就能按照我們所預期的方式運作！


:::info

在上面的例子中，如果我們把 `toRefs()` 換成 `ref()` 會得到相同的結果嗎？例如：

```ts showLineNumbers
import { reactive, ref } from 'vue'

const user = reactive({
  name: 'hello',
  age: 5,
})

// 原本是這個樣子：
const { name, age } = toRefs(user)

// 換成這種作法會得到一樣的結果嗎？
// highlight-start
const name = ref(user.name)
const age = ref(user.age)
// highlight-end
```

答案是**不會** — `name` 和 `age` **並不會**和 `user` 連接起來。他們會被視為是獨立的 `Ref<T>`。

這是因為 `user.name` 和 `user.age` 都是原始型別的數值，他們會以**傳值**的方式被傳遞給 `ref()`。所以寫下 `const name = ref(user.name)` 就會等於寫下 `const name = ref('hello')`，代表我們建立了一個新的 `Ref<T>`，只不過是初始值是 `hello` 罷了。

此外，雖然 `ref()` 和 `toRef()` 的回傳值都是 `Ref<T>` 介面，他們回傳的其實是有著不同邏輯的類別實體。

另外要注意的是，如果目標數值屬於非原始型別，`ref()` 和 `toRef()` 所產生的 `Ref<T>` 都會連接到來源，而且他們的更新都會導致元件重新渲染。例如：


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

簡單來說，只有在我們要宣告新變數，而且沒有參考任何來源的時候才使用 `ref()`；而 `toRef()` 和 `toRefs()` 則是用在依據某個來源來宣告新變數，同時保有響應性的狀況。

:::

## 什麼是 `UnwrapNestedRef<T>`

`UnwrapNestedRef<T>` 是 `reactive()` 的**回傳型別**。由於您的 IDE 可能已經幫您把最複雜的部分做完了，我們其實不見得需要學習這個型別，因此我們認為不要把它放在這裡比較好，而且他也有點複雜。不過如果您對它仍然有興趣，您可以透過閱讀 [`UnwrapNestedRef<T>`](./unwrap-nested-ref) 章節來了解他！
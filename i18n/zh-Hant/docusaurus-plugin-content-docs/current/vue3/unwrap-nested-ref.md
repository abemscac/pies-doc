---
title: UnwrapNestedRef<T>
sidebar_position: 8
description: 介紹 Vue 3 reactive() 函式中的解包機制
keywords: [派氏文件, vue3, vue unwrapnestedref, vue reactive(), vue解包]
---

# `UnwrapNestedRef<T>`

學習 `reactive()` 的解包機制。

:::caution 先修章節

建議您在學習完 [`ref()`](./ref-and-ref) 和 [`reactive()`](./reactive) 之後再閱讀此章節。

:::

:::note

老實說，這也許不是一個非常重要的主題，因為在大多數情況下，您的 IDE 會為您推算輸出類型；你可能甚至沒有注意到這個東西的存在。

若您覺得本章節的內容很讓人困惑，請放心地跳過它！即使您不知道這些內容，您也能過得很好！

:::

## 範例

您是否曾經好奇如果我們對著某個含有 `Ref<T>` 屬性的簡單對象 (plain object) 使用 `ref()` 會發生什麼事？例如：

```ts showLineNumbers
import { ref } from 'vue'

const dog = ref({
  name: 'hello'
})

const we = ref({
  have: {
    a: {
      dog,
    }
  }
})
```

要從 `we` 拿到 `hello`，我們會很自然的想到 `we.value.have.a.dog.value.name`，因為 `we` 和 `dog` 都是藉由 `ref()` 所宣告出來的變數，因此便創造了一個巢狀結構。

但是當您嘗試運行這一段程式碼時，您會得到一個錯誤，內容是 `TypeError: Cannot read properties of undefined (reading 'name')`。怎麼會這樣呢？

發生這種事情的原因是：

- 正如我們在 [`ref()` 還是 `reactive()`](./ref-or-reactive#ref-的運作原理) 中所提到的， `ref()` 在內部使用了 `reactive()`。
- 在 `reactive()` 中其實有個內建的解包機制，進而導致了上面的錯誤。

因此想要從 `we` 拿到 `hello`，正確的方式是 `we.value.have.a.dog.name`，因為 `we.value.have.a.dog` 被 `reactive()` 給解包了。

在這個章節中，我們會嘗試說明這個藏在 `reactive()` 中的秘密解包機制是如何運作的。

## 什麼是 `UnwrapNestedRef<T>`？

`UnwrapNestedRef<T>` 是 `reactive()` 的**回傳型別**，它的名字其實已經解釋了它的用途—解包所有 `T` 中的巢狀 `Ref`。 

下面的虛擬碼展示了 `UnwrapNestedRef<T>` 的簡化版定義(但還是挺複雜的)；它和原始碼不完全相同，但是很接近了：

```ts showLineNumbers
type UnwrapNestedRef<T> = (
  if (T is Ref) {
    return T
  } else {
    return UnwrapRef<T>
  }
)

type UnwrapRef<T> = (
  if (T is Ref) {
    return T['value']
  } else if (T is plain object) {
    return { for key in T: UnwrapRef<T[key]> }
  } else if (T is Array) {
    return [for key in T: UnwrapRef<T[key]>]
  } else {
    return T
  }
)
```

下面的虛擬碼展示了依照上面的型別所實踐的虛構函式：

```ts showLineNumbers
const unwrapNestedRef = <T>(arg: T): UnwrapNestedRef<T> => {
  if (arg is Ref) {
    return arg
  } else {
    return unwrapRef(arg)
  }
}

const unwrapRef = <T>(arg: T): UnwrapRef<T> => {
  if (arg is Ref) {
    return arg.value
  } else if (arg is plain object) {
    const result = {}
    for (const key in arg) {
      result[key] = unwrapRef(arg[key])
    }
    return result
  } else if (arg is Array) {
    return arg.map((item) => unwrapRef(item))
  } else {
    return arg
  }
}
```

上面的虛擬碼已經替一切做了很好的總結了！花點時間慢慢閱讀和理解這些虛擬碼，希望它能讓您對 `reactive()` 中的解包機制有個不錯的理解！

下面我們將提到一些常見的案例，還有應該要注意的事項。

## 鍵值集合 (Collections)

儲存於映射 (`Map`) 和集合 (`Set`) 等鍵值集合類型中的 `Ref<T>` **不會**被 `reactive()` 解包，但響應性依然存在。

## 部分響應式物件

在使用 Vue 3 時，您應該**極力避免宣告部分響應式物件**，因為他們通常是 bug 的來源，例如：


```ts showLineNumbers
import { reactive } from 'reactive'

const user = {
  name: 'hello',
  friend: {
    // highlight-start
    child: reactive({
      name: 'world',
    }),
    // highlight-end
  },
}
```

在這個範例中，修改 `user.friend.child` 中的任何屬性都會造成元件重新渲染，修改其他屬性則不會。在這種情況下，使用 `ref()` 會比 `reactive()` 還要好一些，因為看見 `.value` 我們至少能猜測它大概是一個 `Ref<T>` (但無法肯定)。儘管如此，我們還是建議避免這種模式，因為他不好理解。
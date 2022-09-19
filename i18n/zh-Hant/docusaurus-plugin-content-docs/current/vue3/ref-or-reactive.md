---
title: ref() 還是 reactive()
sidebar_position: 5
description: 比較 Vue 3 ref() 和 reactive() 函式的差異
keywords: [piesdoc, vue3, ref, reactive]
---

# `ref()` 還是 `reactive()`

:::caution 先修章節

建議您在學習完 [`ref()`](./ref-and-ref#什麼是-ref) 和 [`reactive()`](./reactive#什麼是-reactive) 之後再閱讀此章節。

:::

*所以... 我該用哪一個來宣告狀態，`ref()` 還是 `reactive()`？*

我們終於到這裡了！這可能是 Vue 3 裡面最常見的問題。

我們會先解釋這兩個函式的運作原理，然後依據參數的類型來回答這個問題。總而言之，結論是:

- 針對原始型別的參數，建議使用 `ref()`。
- 針對函式，`ref()` 和 `reactive()` 都不建議；直接使用 `let`、`var` 或 `const` 宣告即可—看看哪個最適合您。
- 針對其他型別的數值，`ref()` 或 `reactive()` 都可以。

## `ref()` 和 `reactive()` 是如何運作的

為了明白該如何選擇 `ref()` 和 `reactive()`，我們必須要知道他們分別是如何運作的。

### `ref()` 的運作原理

下面的虛擬碼 (pseudocode) 能大概讓我們知道 `ref()` 在 Vue 3 中是如何運作的。雖然這個虛擬碼經過極度的化簡和改寫，我們還是能一窺 `ref()` 的運作原理：

```ts showLineNumbers
import { reactvie, Ref } from 'vue'

const ref = (arg) => {
  if (arg is Ref) {
    return arg
  } else {
    return new RefImpl(arg)
  }
}

class RefImp<T> implements Ref<T> {
  public value: T

  constructor(arg: T) {
    if (arg is primitive value) {
      this.value = arg
    } else {
      this.value = reactive(arg)
    }
    track(this.value)
  }
}
```

- 如我們先前所提到的，`RefImpl` 是一個只有一個公開屬性 `value` 的類別。
- 若參數為原始型別，`RefImpl` 會直接把它當成 `this.value`。
- 若參數是非原始型別，`RefImpl` 則會呼叫 `reactive()`，然後用它的回傳值當做 `this.value`；所以在使用 `ref()` 的同時，您其實也使用了 `reactive()`，只是您沒有發現罷了！
- `track(this.value)` 在原始碼之中其實不是這麼運作的；總之重點是，`RefImpl` 會在必要時「追蹤」 `this.value` 的變化，才能達成響應性。

### `reactive()` 的運作原理

 下面的虛擬碼能大概讓我們知道 `reactive()` 在 Vue 3 中是如何運作的。他和原始碼有點不同，不過挺接近的，能夠讓我們知道 `reactive()` 的運作原理：

```ts showLineNumbers
const reactive = (arg) => {
  if (arg is primitive value) {
    if (is in development mode) {
      console.warn(`value cannot be made reactive: ${String(arg)}`)
    }
    return arg
  } else if (arg is Ref OR arg is reactive OR arg is function) {
    return arg
  } else {
    const unwrappedValue = unwrapNestedRef(arg)
    return toProxy(unwrappedValue)
  }
}
```

- 如我們先前所提到的，`reactive()` 只能和非原始型別的數值一起使用。
- 雖然函式屬於非原始型別，但它還是沒辦法和 `reactive()` 一起使用；`reactive()` 會立刻回傳它。
- `unwrapNestedRef()` 是我們在 [`UnwrapNestedRef<T>`](./unwrap-nested-ref#what-is-unwrapnestedreft) 中提到的一個虛構函式；他被用來解包物件和陣列中的巢狀 `Ref<T>`。
- `toProxy()` 是一個用來創造響應式代理的虛構函式。

## 解釋

我們終於可以進到最重要的環節—解釋為什麼我們依據參數類型的不同而選擇 `ref()` 或是 `reactive()`。

### 原始型別

若參數是原始型別，那麼 `ref()` 會是比較好的選擇，因為 `reactive()` 只能和非原始型別的數值一起使用。

我們當然可以把數值包在一個物件裡面，這樣他就能和 `reactive()` 一起使用 (例如 `const age = reactive({ value: 5 })`)，不過...為什麼要這樣？直接用 `ref()` 也可以得到相同的結果！

### 函式

若參數型別是函式，您可能不會想要它具有響應性。函式屬於**不該被呈現在螢幕上**的東西，同時它也**不該被用來表示元件的狀態**，因此讓它具有響應性是沒有意義的。

然而，在某些情況下，我們的確需要將函式賦予給某個變數。例如**事件的訂閱/註冊**。那些是我們在元件掛載後註冊，然後在元件卸載前移除的東西。

以 [Vue Router](https://router.vuejs.org/) 的 [Navigation Guards](https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards) (導航守衛) 為例：

```ts showLineNumbers
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// highlight-next-line
let unregisterNavGuard: () => void | undefined = undefined

onMounted(() => {
  // highlight-start
  unregisterNavGuard = router.beforeEach((to, from) => {
    // ...
  })
  // highlight-end
})

onBeforeUnmount(() => {
  // highlight-next-line
  unregisterNavGuard?.()
})
```

1. 我們在 `onMounted()` 中使用 `router.beforeEach()` 來註冊導航守衛，這個註冊函式會回傳用來取消註冊的函式。
2. 取消註冊的函式應該要在 `onBeforeUnmount()` 中被呼叫。
3. 從第一步取得取消註冊函式後，我們將他賦予給 `unregisterNavGuard`，這樣才能在第二步呼叫他。

由於 `unregisterNavGuard` 和元件渲染沒有任何關係，我們在宣告的時候就選擇使用 `let`，而不是 `ref()` 或 `reactive()`。如此一來如果因為某些原因我們需要重新賦值，元件也不會進行不必要的重新渲染，因為 `unregisterNavGuard` 既不是響應式代理也不是 `Ref<T>`。

若您真的很想要宣告一個響應式的函式 (雖然我們想不到任何好原因)，`ref()` 會是比較好的選擇，因為 `reactive()` 在面對函式時會直接回傳。這代表寫下 `const func = reactive(() => {})` 就等於 `const func = () => {}`。

### 其他型別

除了原始型別和函式以外的數值都屬於這一類，例如簡單對象、陣列、映射 (`Map`) 等。

針對這些數值，使用 `ref()` 還是 `reactive()` 其實沒什麼差別；因為這些數值最後都會被傳給 `reactive()`，唯一的差別是使用 `ref()` 的話就會出現 `.value`，因為他回傳的是 `Ref<T>`。

既然兩個函式相較之下沒有哪一個明顯比另外一個好，那麼使用 `ref()` 或是 `reactive()` 都可以。只要確保**整個團隊/專案在選擇使用 `ref()` 和 `reactive()` 時的判斷標準是一致的**，用以維持程式碼的一致性，這樣就行了！
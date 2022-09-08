---
title: ref VS reactive
sidebar_position: 5
---

# `ref` VS `reactive`

*So... which one should I use? `ref` or `reactive`?*

We're finally here! This is probably the most commonly asked question when it comes to Vue 3.

```ts
function ref(arg) {
  let value
  // ...
  if (arg is primitive value) {
    // Vue will track this value
    value = trackedArg
  } else if (arg is Ref) {
    // Vue will use it directly
    value = arg
  } else {
    // Vue will use reactive()
    value = reactive(arg)
  }
  // Return a new RefImpl, which can be seen as Ref
  return { value }
}
```
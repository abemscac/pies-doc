---
title: ref VS reactive
sidebar_position: 5
---

# `ref` VS `reactive`

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
  // ...
  return { value }
}
```
# http请求队列

## 目标

- [x] 优先级队列（无依赖关系）
- [ ] 存放数组的优先级队列（有依赖关系）
- [x] 控制并发请求数量（偶数？）

## 提交format

```
type(scope?): subject  #scope is optional
```

type num
```ts
'build' | 构建相关
'ci' | 持续集成相关
'chore' | updating grunt tasks etc; no production code change
'docs' | changes to documentation
'feat' | new feature
'fix' | bug fix
'perf' | 性能相关
'refactor' | refactoring production code
'revert' | 返回之前的版本
'style' | formatting, missing semi colons, etc; no code change
'test' adding missing tests, refactoring tests; no production code change
```

scope enum
```ts
'init'
'runner'
'watcher'
'config'
'web-server'
'proxy'
```
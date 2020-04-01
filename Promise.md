# Promise

### Promise到底是做什么的呢？

Promise是异步编程的一种解决方案

### 什么情况下会用到Promise？

一般情况下进行异步操作时，你用Promise对这个异步操作进行封装

#### Promise执行过程

##### 	1.new -> 构造函数(1.保存了一些状态信息 2.执行传入的函数)

##### 	2.在执行传入的回调函数时，会传入两个参数，resolve,reject，本身又是函数

##### 	3.resolve() ->这个函数代表成功的会掉。会被.then捕获到

##### 	4.reject() ->这个函数代表失败的回调。会被.catch捕获到

```js
new Promise((resolve, reject) => {  //伪代码
            //发送请求
            $.ajax({
                type: "GET",
                url: "xxx",
                success: (data) => {
                    resolve(data)
                }
            })
        }).then((data) => {
            console.log(data)
        })
```

### Promise三种状态

##### 首先, 当我们开发中有异步操作时, 就可以给异步操作包装一个Promise

异步操作之后会有三种状态

##### 		● pending：等待状态，比如正在进行网络请求，或者定时器没有到时间。

##### 		● fulfill：满足状态，当我们主动回调了resolve时，就处于该状态，并且会回调.then()

##### 		● reject：拒绝状态，当我们主动回调了reject时，就处于该状态，并且会回调.catch()

###  小练习：Promise的链式调用

第一种：

```js
 new Promise((resolve, rej) => {
            setTimeout(() => {
                resolve("aaa")
            }, 1000)
        }).then((res) => {
            console.log(res, '第一层')

            return new Promise((resolve) => {
                resolve(res + '111')
            })
        }).then((res) => {
            console.log(res, '第二层')
            return new Promise((resolve) => {
                resolve(res + '222')
            })
        }).then((res) => {
            console.log(res, '第三层')
        })
```

第二种：使用Promise.resolve

```js
 new Promise((resolve) => {
            setTimeout(() => {
                resolve('aaa')
            }, 1000)
        }).then((res) => {
            console.log(res, '第一层')

            return Promise.resolve(res + '111') //调用Promise.resolve,里面传递res参数就可以了
        }).then((res) => {
            console.log(res, '第二层')
            return Promise.resolve(res + '222')
        }).then((res) => {
            console.log(res, '第三层')
        })
```

第三种，省略Promise.resolve

```js
 new Promise((resolve) => {
            setTimeout(() => {
                resolve('aaa')
            })
        }).then(res => {
            console.log(res, '第一层')
            return res + '111'  //省略掉Promise.resolve，直接返回结果，它会在里面包装一层Promise
        }).then(res => {
            console.log(res, '第二层')
            return res + '222'
        }).then(res => {
            console.log(res, '第三层')
        })
```

### Promise.all

一起发送请求

```js
let p1 = new Promise((resolve) => {
            setTimeout(() => {  //模拟请求
                resolve('这是第一个请求的')
            }, 1000)
        })
        let p2 = new Promise((resolve) => {
            setTimeout(() => {
                resolve('这是第二个请求的')
            }, 2000)
        })

        Promise.all([p1, p2]).then(results => {
            console.log(results[0]) //这是第一个请求的
            console.log(results[1]) //这是第二个请求的

        })
```

### Promise.allSettled

> `allSettled` 用于处理多个`promise` ，只关注执行完成，不关注是否全部执行成功，`allSettled` 状态只会是`fulfilled`。

````js
const p1 = new Promise((resolve,reject) => {
    reject('111')
  })
  const p2 = new Promise((resolve,reject) => {
    reject('111')
  })
  Promise.allSettled([p1,p2]).then(results =>{
    console.log(results)
  })
````

### race

使用`Promise.race()` 处理容错异步，和`race`单词一样哪个Promise快用哪个，哪个先返回用哪个。

- 以最快返回的promise为准
- 如果最快返加的状态为`rejected` 那整个`promise`为`rejected`执行cache
- 如果参数不是promise，内部将自动转为promise

下面将第一次请求的异步时间调整为两秒，这时第二个先返回就用第二人。

```js
const hdcms = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("第一个Promise");
  }, 2000);
});
const houdunren = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("第二个异步");
  }, 1000);
});
Promise.race([hdcms, houdunren])
.then(results => {
  console.log(results);
})
.catch(msg => {
  console.log(msg);
});
```

### async/await

使用 `async/await` 是promise 的语法糖，可以让编写 promise 更清晰易懂，也是推荐编写promise 的方式。

- `async/await` 本质还是promise，只是更简洁的语法糖书写
- `async/await` 使用更清晰的promise来替换 promise.then/catch 的方式

#### 用法

````js
function getAsync() {
      return new Promise((res, rej) => {
        setTimeout(() => {
           res(1)
        }, 10)
      })
    }
    async function getPromise() {
      const result = await getAsync()
      console.log(result)
    }
    getPromise()
````


# Promise

> 有三种状态，pending(进行中)、fulfilled(已成功)、rejected(已失败)

### Promise的使用

````js
new Promise((resolve, reject) => {
  // resolve & reject：是自己任意执行的，但是一般情况下，大家都约定成功执行resolve，失败执行reject
  // => excutor函数（执行函数）中可以不管控异步操作（但是不管控异步没什么意义）
  resolve(100)
}).then(result => {
  // resolve执行的时候会触发第一个回调函数执行
  console.log(1)
  return 1000; //=>会把这个值传递给下一个then中的方法,如果返回的是一个新的promise实例，则等到promise处理完成，把处理完成的结果传递给下一个then
},reason =>{
  // reject执行的时候会触发第二个回调函数执行
  console.log(2)
}).then(result =>{ //需要保证执行then方法返回的依然是promise实例，这样才可以实现链式调用
  // =>上一个then中管控的两个方法只要任何一个执行不报错，都会执行和这个then中的第一个方法，如果执行报错，会执行此then中的第二个回调函数
}).catch(reason =>{
  // catch就相当于then(null,reason =>{})
})
console.log(3)


// => 等待所有的promise都成功执行then,反之只要有一个失败就会执行catch
Promise.all([promise1,...]).then()
````

### 初始的Promise

````js
class Promise {
  constructor(excutorCallback) {
    this.status = 'pending';  //默认状态
    this.value = 'undefined'; //结果
    this.fulfilledAry = []; //成功要做的方法
    this.rejectedAry = []; //失败要做的方法
    let resolveFn = result => {
      let timer = setTimeout(() => {  //设置定时器，将以下任务放进宏任务区，等待主栈任务完成
        clearTimeout(timer);
        if (this.status !== 'pending') return
        this.status = 'fulfilled';
        this.value = result;
        this.fulfilledAry.forEach(item => item(this.value))  //执行成功函数，并传递值
      }, 0)

    }
    let rejectFn = reason => {
      let timer = setTimeout(() => { //设置定时器，将以下任务放进宏任务区，等待主栈任务完成
        clearTimeout(timer);
        if (this.status !== 'pending') return
        this.status = 'rejected';
        this.value = reason;
        this.rejectedAry.forEach(item => item(this.value)) //执行失败函数，并传递值
      }, 0)

    }
    // 执行excutor (异常捕获) 如果excutorCallback函数执行发现异常，捕获异常，执行rejectFn函数
    try {
      excutorCallback(resolveFn, rejectFn)
    } catch (err) {
      // 有异常信息按照rejected状态处理
      rejectFn(err)
    }
  }
  then(fulfilledCallback, rejectedCallback) {   //then方法
    if (typeof fulfilledCallback === 'function') {  //检测是否是方法
      this.fulfilledAry.push(fulfilledCallback)
    }
    if (typeof rejectedCallback === 'function') {
      this.rejectedAry.push(rejectedCallback)
    }
  }
}
````

### Promise链式调用原理

> 原生promise执行原理

````js
let p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    Math.random() < 0.5 ? resolve(100) : reject(-100)
  }, 1000)

})
let p2 = p1.then(result => {
  return result + 100;
}, reason => {
  return reason - 100;
});

p2.then(result => {
  console.log(p1 === p2) //执行then返回的是一个新的promise实例
  console.log(result)
}, reason => {
  console.log(p1 === p2)
  console.log(reason)
})
console.log(3)
````



### Promise.all用法

````js
let p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(100)
  }, 50)
})
let p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(200)
  }, 10)
})
let p3 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(300)
  }, 80)
})

Promise.all([p1,p2,p3]).then(result => {
  // 所有的promise都成功执行,result中分别存储每一个实例返回的结果,而且和数组中的顺序是一样的
  console.log(result) //[ 100, 200, 300 ]
}).catch(reason => {
  // 只要有一个失败，就执行这个方法，失败后不再执行后面的操作
  console.log(reason)
})
````

### 完整版Promise

````js
class Promise {
  constructor(excutorCallback) {
    this.status = 'pending';  //默认状态
    this.value = 'undefined'; //结果
    this.fulfilledAry = []; //成功要做的方法
    this.rejectedAry = []; //失败要做的方法
    let resolveFn = result => {
      let timer = setTimeout(() => {  //设置定时器，将以下任务放进宏任务区，等待主栈任务完成
        clearTimeout(timer);
        if (this.status !== 'pending') return
        this.status = 'fulfilled';
        this.value = result;
        this.fulfilledAry.forEach(item => item(this.value))  //执行成功函数，并传递值
      }, 0)

    }
    let rejectFn = reason => {
      let timer = setTimeout(() => { //设置定时器，将以下任务放进宏任务区，等待主栈任务完成
        clearTimeout(timer);
        if (this.status !== 'pending') return
        this.status = 'rejected';
        this.value = reason;
        this.rejectedAry.forEach(item => item(this.value)) //执行失败函数，并传递值
      }, 0)

    }
    // 执行excutor (异常捕获) 如果excutorCallback函数执行发现异常，捕获异常，执行rejectFn函数
    try {
      excutorCallback(resolveFn, rejectFn)
    } catch (err) {
      // 有异常信息按照rejected状态处理
      rejectFn(err)
    }
  }
  then(fulfilledCallback, rejectedCallback) {   //then方法
    // 如果成功函数没有传递,创建一个函数帮它传递
    typeof fulfilledCallback !== 'function' ? fulfilledCallback = result => result : null;
    // 如果失败函数没有传递,创建一个函数帮它承接错误,并且抛给下一个then的错误函数
    typeof rejectedCallback !== 'function' ? rejectedCallback = reason => {
      // 判断reason是否是一个异常，如果是异常，把异常的message抛出，如果不是异常，把原值抛出
      throw new Error(reason instanceof Error ? reason.message : reason)
    } : null;

    //每次执行then,返回一个新的promise实例
    return new Promise((resolve, reject) => {
      this.fulfilledAry.push(() => {  //=>在外层包一层匿名函数
        // 当这个函数执行的时候,如果发生异常,捕获异常,并用reject把异常抛出
        try {
          // 执行传递进来的函数,并把对应的值传给函数,获取函数的返回值
          let x = fulfilledCallback(this.value);
          // 如果函数的返回值是有个新的Promise函数,直接调用这个新Promise的then方法
          // 如果不是Promise函数,直接调用resolve方法,并且把值传递过去,抛给下一个then
          x instanceof Promise ? x.then(resolve, reject) : resolve(x);
        } catch (err) {
          reject(err);
        }
      })
      this.rejectedAry.push(() => {
        try {
          let x = rejectedCallback(this.value);;
          x instanceof Promise ? x.then(resolve, reject) : resolve(x);
        } catch (err) {
          reject(err);
        }
      })
    })
  }
  catch(rejectedCallback) {
    return this.then(null, rejectedCallback)
  }
  static all(promiseAry = []) { //=>私有属性 使用Promise.all()调用
    return new Promise((resolve, reject) => {
      // index：记录成功的数量
      // result：记录成功的结果
      let index = 0,
        result = [];
      for (let i = 0; i < promiseAry.length; i++) {
        // promiseAry[i] ：每一个需要处理的Promise实例
        promiseAry[i].then(val => {
          index++;
          result[i] = val;  //索引需要和promiseAry对应上，保证结果的顺序和数组顺序一致
          if (index === promiseAry.length) {
            resolve(result)
          }
        },reject)    //失败就执行reject
      }
    })
  }
}
module.exports = Promise;
````


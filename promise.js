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
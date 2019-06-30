## 基本用法
Promise是ES6的语言标准，为异步编程提供了一种解决方案。Promise的常用实例如下
```js
let promise = new Promise(function(resolve, reject) {
    // ...some code
    if (/*异步操作成功*/) {
        resolve(value)
    } else {
        reject(error)
    }
})
```
Promise构造函数接受一个函数作为参数，该函数的两个参数分别是resolve和reject。它们是两个函数，由 JavaScript 引擎提供，不用自己部署。<br />
我们可以理解Promise维护了三个状态：`pending`（进行中）、`resolved`（已成功）、`rejected`（已失败）。<br />
resolve函数的作用：将Promise对象的状态从`pending`变为`resolved`，在异步操作成功时调用，并将异步操作的结果，作为参数传递出去；reject函数的作用：将Promise对象的状态从`pending`变为`rejected`，在异步操作失败时调用，并将异步操作报出的错误，作为参数传递出去。<br />
Promise实例生成以后，可以用then方法分别指定resolved状态和rejected状态的`回调函数`，如果没有调用`resolve`或者`reject`来使Promise发生状态变化，是不会调用这两个`回调函数`的。
```js
promise.then(function(value) {
    // success
}, function(error) {
    // failure
});
```
## 注意事项
### Promise新建后会立即执行
看下面的示例
```js
let promise = new Promise(function(resolve, reject) {
    console.log('Promise');
    resolve();
});

promise.then(function() {
    console.log('resolved.');
});

console.log('Hi!');

// Promise
// Hi!
// resolved
```
上面代码中，Promise 新建后立即执行，所以首先输出的是Promise。然后，then方法指定的回调函数，将在当前脚本所有同步任务执行完才会执行，所以resolved最后输出。关于JavaScript的执行机制可参考[《这一次，彻底弄懂 JavaScript 执行机制》](https://juejin.im/post/59e85eebf265da430d571f89)
### resolve和reject的参数问题
如果调用`resolve`函数和`reject`函数时带有参数，那么它们的参数会被传递给对应的回调函数。`reject`函数的参数通常是`Error`对象的实例，表示抛出的错误；`resolve`函数的参数除了正常的值以外，还可能是另一个 Promise 实例，比如像下面这样
```js
const p1 = new Promise(function (resolve, reject) {
    // ...
});

const p2 = new Promise(function (resolve, reject) {
    // ...
    resolve(p1);
})
```
`p1`的状态就会传递给`p2`，也就是说，`p2`的回调函数此时是根据`p1`的状态来判断是否执行的。如果`p1`的状态是`pending`，那么`p2`的回调函数就会等待`p1`的状态改变；如果`p1`的状态已经是`resolved`或者`rejected`，那么`p2`的回调函数将会立刻执行
### resolve和reject不会终结Promise执行
一般来说，调用`resolve`或`reject`以后，`Promise`的使命就完成了，后继操作应该放到`then`方法里面，而不应该直接写在`resolve`或`reject`的后面。所以，最好在它们前面加上`return`语句，这样就不会有意外
```js
new Promise((resolve, reject) => {
    return resolve(1);
    // 后面的语句不会执行
    console.log(2);
})
```
### then/catch方法返回新的Promise实例
`then`的作用是为`Promise`实例添加状态改变时的回调函数，可以多次在同一个Promise实例上执行then方法，对于`catch`方法是一样的效果
```js
function timeout(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(reject, ms, 'done');
    });
}
let time1 = timeout(100)
time1.then((value) => {
    console.log('first',value);
    time1.then((value) => {
        console.log('third', value)
    })
});

time1.then((value) => {
    console.log('second', value)
})

// first done
// second done
// third done
```
`then`返回的是新的Promise实例，所以可以使用链式操作，后边继续使用then/catch方法。这里有两种情况：<br />
如果`return`的是一个非Promise对象，则该Promise实例的状态为`resolved`，`return`的值作为`resolve()`的参数传给下一个`then`方法作为参数；<br />
如果`return`的是一个Promise对象，则后续的then/catch方法需要根据该Promise对象的状态转变来进行判断执行。
### Promise对象的错误具有“冒泡”性质
Promise对象的错误具有“冒泡”性质，会一直向后传递，直到被捕获为止。也就是说，错误总是会被下一个catch语句捕获
```js
// getJSON为异步获取json方法
getJSON('/post/1.json').then(function(post) {
    return getJSON(post.commentURL);
}).then(function(comments) {
    // some code
}).catch(function(error) {
    // 处理前面三个Promise产生的错误
});
```
上面代码中，一共有三个`Promise`对象：一个由`getJSON`产生，两个由`then`产生。它们之中任何一个抛出的错误，都会被最后一个`catch`捕获。一般来说，不要在then方法里面定义`Reject`状态的回调函数（即then的第二个参数），总是使用`catch`方法。
### 其他方法
Promise的其他方法，如`finally`、`all`、`resolve`、`reject`、`try`等方法，可以参考[《阮一峰ES6入门》](http://es6.ruanyifeng.com/#docs/promise)
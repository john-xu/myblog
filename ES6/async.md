## 优势
与Generator比较async函数有以下优点<br />
* 内置执行器
* 更好的语义表达
* 更广的适用性，await后边可以是Promise或者原始类型（数值、字符串和布尔值，但这时会自动转成立即 resolved 的 Promise 对象）
* 返回值是 Promise  

async函数完全可以看作多个异步操作，包装成的一个`Promise`对象，而`await`命令就是内部`then`命令的语法糖
## 基本用法
`async`函数返回一个`Promise`对象，可以使用`then`方法添加回调函数。当函数执行的时候，一旦遇到`await`就会先返回，等到异步操作完成，再接着执行函数体内后面的语句。
```js
function timeout(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function asyncPrint(value, ms) {
    await timeout(ms);
    console.log(value);
}

asyncPrint('hello world', 50);
```
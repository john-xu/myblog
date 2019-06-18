## 需求
在[express](http://www.expressjs.com.cn/)中需要使用session时，我们常使用[express-session](https://github.com/expressjs/session)，使用案例如下
```js
var express = require('express')
var session = require('express-session')

var app = express()
app.use(session({ 
    secret: 'keyboard cat', 
    cookie: { maxAge: 60000 }
}))

app.post('/', function(req, res, next){
    req.session.userData = 'userData' //直接设置session的值，在http结束返回时会自动调用session的save方法进行保存
})
```
但是`express-session`默认使用的是`MemoryStore`进行存储，多用于开发环境，但是我们常常要将session存储在redis中，这时我们常使用[connect-redis](https://github.com/tj/connect-redis)来配合

## 使用
[connect-redis](https://github.com/tj/connect-redis)是一个快速、方便的redis连接库，需要`redis >= 2.0.0`，安装如下
```bash
npm install connect-redis
```
和`express-session`配合使用的案例如下
```js
var express = require('express')
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

var app = express()
app.use(session({
    store: new RedisStore(redisOptions),
    secret: 'keyboard cat',
    cookie: { maxAge: 60000 }
}));
```
`redisOptions`的主要选项如下
```json
{
    "host": "localhost", 
    "port": 6379,
    "pass": "PASSWORD", //redis的密码
    "prefix": "mysite:sess:", //key的前缀，默认为"sess:"
}
```
如果使用redis集群的话需要[ioredis](https://github.com/luin/ioredis)，使用如下，原文在[这里](https://github.com/tj/connect-redis/issues/240)
```js
var express = require('express');
var app = express();
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var Redis = require('ioredis');

var redisClient = new Redis.Cluster([
    {port: 6379, host: 'your-cluster-ip-1'},
    {port: 6379, host: 'your-cluster-ip-2'},
    {port: 6379, host: 'your-cluster-ip-3'},
    {port: 6379, host: 'your-cluster-ip-4'}
]);
app.use(session({
    secret: 'redis-session-test',
    store: new RedisStore({client: redisClient}),
    resave: false,
    saveUninitialized: true
}));
```
## kafka-node介绍
[kafka-node](https://www.npmjs.com/package/kafka-node)是node的一个kafka client，可方便的使用kafka

## 代码案例
以下为kafka-node的Producer的简单使用案例

### Producer定义
```js
var kafka = require('kafka-node'),
    Producer = kafka.Producer,
    KeyedMessage = kafka.KeyedMessage,
    client = new kafka.KafkaClient({
        kafkaHost:'localhost:9092'  //kafkaHost为host或者是以分号','连接的broker列表
    }),
    producer = new Producer(client);

/**
 * kafka的producer方法
 * @param  {Array} payloads 
 *      [
 *          { topic: 'test', messages: 'this is first', partition: 0 },
 *          { topic: 'test', messages: 'this is second' }
 *      ];
 * @return {Promise}          
 */
module.exports =  function(payloads){
    return new Promise(function(resolve,reject){
        producer.on('ready', function () {
            producer.send(payloads, function (err, data) {
                if(err){
                    console.log('send error', err)
                    reject(err)
                }
                console.log('ok', data);
                resolve(data)
            });
        });
        producer.on('error', function(err){
            console.log('error', err)
            reject(err)
        })
    })
}
```

### Producer使用
```js
let kafkaLog= require('./kafka.js')

kafkaLog([
    {topic: 'test',messages: 'this is third'},
    {topic:'test',messages:'this is forth'}
])
.then(data => {
    console.log('ok',data)
})
.catch(err => {
    consol.log('error', err)
})
````
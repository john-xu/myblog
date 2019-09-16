## HTTP缓存首部
### Cache-Control
HTTP1.1协议版本新增的通用消息头字段，可用在请求和响应中。客户端可以在HTTP请求中使用的标准`Cache-Control`指令如下:
```
Cache-Control: max-age=<seconds>
Cache-Control: max-stale[=<seconds>]
Cache-Control: min-fresh=<seconds>
Cache-control: no-cache 
Cache-control: no-store
Cache-control: no-transform
Cache-control: only-if-cached
```
服务器可以在响应中使用的标准`Cache-Control`指令如下：
```
Cache-control: must-revalidate
Cache-control: no-cache
Cache-control: no-store
Cache-control: no-transform
Cache-control: public
Cache-control: private
Cache-control: proxy-revalidate
Cache-Control: max-age=<seconds>
Cache-control: s-maxage=<seconds>
```
以下分别对各值的含义做解释，可参考[RFC7234](https://tools.ietf.org/html/rfc7234#section-5.2.1)中的相关说明
#### 可缓存性
* public: 表明响应可以被任何对象（包括：发送请求的客户端，代理服务器，等等）缓存，即使是通常不可缓存的内容（例如，该响应没有max-age指令或Expires消息头）。
* private: 表明响应只能被单个用户缓存，不能作为共享缓存（即代理服务器不能缓存它）。私有缓存可以缓存响应内容。
* no-cache: 在使用缓存副本作为响应返回给用户之前，强制要求缓存把请求提交给原始服务器进行验证。可分两种情况理解：当客户端在请求中发送这个头时，表明客户端不愿接受缓存服务器在未经过源服务器的再次验证(`revalidation`)时把缓存返回；当服务器在响应请求中使用这个头时，表明服务器告诉中间的缓存服务器和客户端，使用该响应的缓存时必须先和源服务器进行再次验证(`revalidation`)，不可直接使用缓存。
* no-store: cache禁止存储请求和响应中的任何部分。当请求中使用该头时，告诉缓存服务器不可使用当前缓存，必须从源服务器重新获取；当响应中使用该头时，告诉缓存服务器和客户端，不可存储该响应为缓存，并且必须尽最大努力在转发请求/响应之后移除这些信息。
#### 到期性
* max-age: 指定缓存的保质期。当请求中使用时，表示客户端不愿接受一个生命期`Age`大于所给`max-age`的缓存作为响应，除非另外也使用了`max-stale`。
* max-stale: 指定客户端能容忍的缓存最大过期时间。只用于请求中，指令标示了客户端愿意接收一个已经过期了的响应。如果指定了`max-stale`的值，则最大容忍时间为对应的秒数。如果没有指定，那么说明浏览器愿意接收任何`Age`的响应。
* min-fresh: 设定能够容忍的最小新鲜度。标示了客户端不愿意接受剩余新鲜度小于设定的时间的响应。
#### must-revalidate
* must-revalidate: 一旦资源过期（比如已经超过max-age），在成功向原始服务器验证之前，缓存不能用该资源响应后续请求，必须和源服务器重新验证。即便有`stale-while-revalidate`、`stale-if-error`等指令，也必须重新验证。
* proxy-revalidate: 与must-revalidate作用相同，但它仅适用于共享缓存（例如代理），并被私有缓存忽略。
#### 其他
* no-transform: 禁止中间人更改payload（请求体）。
* only-if-cached: 只要缓存的内容。`only-if-cached`请求指定指示了客户端指向获取一个缓存的响应。如果接收到这个指定，cache应该要么用缓存的内容给出响应，要么给出一个`504（GateWay Timeou）`响应码。如果一组cache被作为一个内部相连的系统，那么其中的某个成员可以向这个缓存组里请求响应。
### Expires
响应头包含一个服务器生成的日期/时间，即在此时候之后，响应缓存过期。该值是服务器生成该响应的值，客户端收到响应时新鲜度已经过去了`Age`。无效的日期，比如0，代表着过去的日期，即该资源已经过期。但是应尽量避免使用0，因为有些http应用会引起问题。如果在Cache-Control响应头设置了`max-age`或者`s-max-age`指令，那么`Expires`头会被忽略。
### Pragma
该指令是一个在HTTP/1.0中规定的通用首部，这个首部的效果依赖于不同的实现，所以在“请求-响应”链中可能会有不同的效果。它用来向后兼容只支持HTTP/1.0协议的缓存服务器，那时候HTTP/1.1协议中的`Cache-Control`还没有出来。只可用于请求中，值为`no-cache`。假如`Cache-Control`不存在的话，它的行为与`Cache-Control: no-cache`一致。建议只在需要兼容HTTP/1.0客户端的场合下应用`Pragma`首部。
### Etag
HTTP响应头是资源的特定版本的标识符。值对客户端及中间缓存服务器透明。这可以让缓存更高效，并节省带宽，因为如果内容没有改变，Web服务器不需要发送完整的响应。而如果内容发生了变化，使用ETag有助于防止资源的同时更新相互覆盖（“空中碰撞”）。如果给定URL中的资源更改，则一定要生成新的Etag值。 因此Etags类似于指纹，也可能被某些服务器用于跟踪。 比较etags能快速确定此资源是否变化，但也可能被跟踪服务器永久存留。
### Last-Modified
一个响应首部，其中包含源头服务器认定的资源做出修改的日期及时间。 它通常被用作一个验证器来判断接收到的或者存储的资源是否彼此一致。精确到秒，精确度比`ETag`要低，所以这是一个备用机制。包含有`If-Modified-Since`或`If-Unmodified-Since`首部的条件请求会使用这个字段。
### If-None-Match
如果远端资源的实体标签与在`ETag`这个首部中列出的值都不相同的话，表示条件匹配成功。默认地，除非实体标签带有`W/`前缀，否者它将会执行强验证。
### If-Modified-Since
如果远端资源的`Last-Modified`首部标识的日期比在该首部中列出的值要更晚，表示条件匹配成功。
## 常见首部比较
### max-age=0与no-cache
* `max-age=0`表示客户端或缓存服务器`应该`不使用该过期缓存，但是如果请求中有`max-stale`且响应中没有`must-revalidate`则仍可以使用该缓存。
* `no-cache`表示客户端和缓存服务器`必须`不能使用过期缓存，每次都需要和源服务器重新验证
### no-cache与must-revalidate
* `no-cache`表示每次请求都需要和源服务器进行重新验证
* `must-revalidate`表示只有当缓存过期后才必须和源服务器重新验证
## 缓存控制顺序
响应中关于缓存的各首部及对应值有如下的优先级递减，及相关的描述：
### Cache-Control: no-store
### Cache-Control: no-cache
### Cache-Control: must-revalidate
### Cache-Control: max-age
### Expires
### 试探性过期
* 有`Last-Modified`: 会有多种试探性过期算法，其中`LM-Factor`算法大致为：当前响应的服务器时间`Data`减去`Last-Modified`，再乘一个系数，比如`0.1或者0.2`，但是多半多数缓存客户端会限制最大值，比如一周。
* 无`Last-Modified`: 如果练最后修改时间也没有，那么缓存就没有什么信息可使用了，这时候缓存客户端会分配一个默认的新鲜生命期，比如`一个小时或一天`。但也有保守的缓存客户端会设置新鲜生命期为0，强制每次都去重新验证
## HTTP-EQUIV控制
Http2.0定义了`<meta http-equiv>`标签，这个可选的标签位于HTML文档的顶部，定义了与该文档有所关联的HTTP首部。与缓存相关的设置如下：
### Expires
常用格式为：
```html
<meta http-equiv="expires" content="Wed,10 Apr 2017 16:34:59 GMT">
```
### Pragma
常用格式为：
```html
<meta http-equiv="Pragma" content="no-cache">
```
### Cache-Control
常用格式为：
```html
<meta http-equiv="cache-control" content="no-cache">
```
### 各端的使用
* 最初，`http-equiv`标签是给Web服务器使用的，服务器应该为HTML解析`http-equiv`标签，并将规定的首部插入HTTP响应中，但是支持这个可选特性会增加服务器的额外负载，所以很少有Web服务器和代理支持此特性。
* 有些浏览器也会解析HTML中的`http-equiv`标签，想对待真实的HTTP首部那样进行处理，但是这样解析出来的`Cache-Control`规则可能会和拦截代理缓存所用的规则有所不同，会使缓存的过期处理行为发生混乱。
* `http-equiv`标签并不是控制文档缓存特性的好方法。通过配追正确的服务器发出HTTP首部，使传送文档缓存控制请求的唯一可靠方法。
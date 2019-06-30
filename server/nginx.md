## 运行和控制
### nginx命令行参数
常用的命令行参数如下：
* `-c </path/to/config>` 为`Nginx`指定一个配置文件，来代替缺省的
* `-t` 不运行，而仅仅测试配置文件。nginx将检查配置文件的语法的正确性，并尝试打开配置文件中所引用到的文件
* `-v` 显示nginx的版本
* `-V` 显示nginx的版本，编译器版本和配置参数
启动命令：`/usr/local/nginx/nginx`（nginx二进制文件的绝对路径）
### nginx控制信号
主进程可以处理以下的信号：  
信号 | 信号说明
----| -------
TERM，INT | 快速关闭命令，立刻关闭nginx进程
QUIT | 从容停止命令，等所有请求结束后关闭服务
HUP | 重载配置，用新的配置开始新的工作进程，从容关闭旧的工作进程
USR1 | 重新打开日志文件
USR2 | 平滑升级可执行程序
WINCH | 从容关闭工作进程

信号的使用案例如下：
```sh
ps aux | grep nginx
kill -QUIT nginx主进程号
```
## 主模块
### daemon
```
语法：daemon on | off;
默认：on
上下文：main
```
决定`nginx`是否应以守护进程的方式工作，主要用于开发。但是当使用`supervisor`来管理`nginx`时需要不以守护进程方式工作，设置为off
### error_log
```
语法：error_log file | stderr [debug | info | notice | warn | error | crit | alert | emerg];
默认：error logs/error.log error
上下文：main,http,server,location
```
第一个参数定义了存放日志的文件，如果为stderr则会将日志输出到标准错误输出。<br />
第二个参数为日志级别，上述级别依次从低到高，会记录制定的日志级别和更高级级别的日志。默认为`crit`<br />
如果要关闭错误日志功能需要这样设置`error_log /dev/null [error_state];`，为了使debug日志工作，需要添加`--with-debug`编译选项
### include
```
语法：include file | mask;
默认：-
上下文：任意
```
将另一个file，或者匹配制定mask的文件包含到配置中，被包含文件需由语法正确的指令和块组成。
### pid
```
语法：pid file;
默认：pid nginx.pid
上下文：main
```
定义存储nginx主进程ID的file，例如可以使用`kill -HUP cat /var/log/nginx.pid`来进行配置文件重新加载
### user
```
语法：user user [group];
默认：user nobody nobody;
上下文：main
```
定义工作进程使用的user和group身份
### worker_cpu_affinity
```
语法：worker_cpu_affinity cpumask ...;
默认：-
上下文：main
```
绑定工作进程到制定的cpu集合，因为工作进程默认不会绑定到任何特定的cpu，这样可以更好利用多核cpu，例如分别绑定到4核：`worker_cpu_affinity 0001 0010 0100 1000;`，该指令仅在`FreeFSD`和`Linux`系统有效。
### worker_processes
```
语法：work_processes number | auto
默认：worker_processes 1;
上下文：main
```
定义工作进程的数量。关于这个值的优化依赖很多因素，包括但不限于cpu核数、硬盘数量和负载模式等，设置为cpu核数会是一个不错的开始，`auto`时nginx会自动检测它
## 事件模块
`events`模块提供配置上下文，以解析那些影响连接处理的指令
### use
```
语法：use [ kqueue | rtsig | epoll | /dev/poll | select | poll | eventport ];
默认：-
上下文：events
```
指定使用的连接处理方式，通常不需要明确设置，因为nginx默认会使用最高效的方法。
### worker_connections
```
语法：worker_connections number;
默认：worker_connections 512;
上下文：events
```
设置每个工作进程可以打开的最大并发数，这个数量包含所有连接（和后端服务器建立的连接等），而不仅仅是和客户端的连接。实际并发数不能超过打开文件的最大数量限制，这个限制可以用`worker_rlimit_nofile`指令修改。作为反向代理时，`max_clients`为`worker_processes * worker_connections/4`。
## HTTP核心模块
### alias
```
语法：alias path;
默认：-
上下文：location
```
定义指定路径的替换路径，比如
```
location /i/ {
    alias /data/w3/images/;
}
```
`/i/top.gif`将由`/data/w3/images/top.gif`文件来响应
### client_body_buffer_size
```
语法：client_body_buffer_size size;
默认：client_body_buffer_size 8k | 16k;
上下文：http,server,location
```
设置读取客户端请求正文的缓冲容量，如果正文大雨缓冲容量，整个正文或正文的一部分会写入临时文件`client_body_temp_path`，就要涉及I/O操作了。
### client_header_buffer_size
```
语法：client_header_buffer_size size;
默认：client_header_buffer_size 1k;
上下文：http,server
```
设置读取客户端请求头部的缓冲容量。对于大多数请求1k足够，如果含有的`cookie`很长，或者请求来自wap客户端，可能就要增大，如果请求头不能完整放在这块空间中，则将按照`large_client_header_buffers`指令的配置分配更多更大的缓冲
### client_max_body_size
```
语法：client_max_body_size size;
默认：client_max_body_size 1m;
上下文：http,server,location
```
设置允许客户端请求正文的最大长度，请求的长度由`Content-Length`请求头定。如果请求长度超过设定值，nginx将返回错误413`Request Entity Too Large`到客户端。浏览器不能正确显示这个错误，将`size`设置成0可以使nginx不检查客户端请求正文的长度。
### default_type
```
语法：default_type mime-type;
默认：default_type text/plain;
上下文：http,server,location
```
定义响应的默认MIME类型，设置文件扩展名和响应的MIME类型的映射表则使用`types`指令。
### error_page
```
语法：error_page code ... [=[response]] uri;
默认：-
上下文：http,server,location,if in location
```
为指令错误定义显示的URI，当前配置级别没有error_page指令时，将从上层配置继承，例如：
```
error_page 404             /404.html
error_page 500 502 503 504 /50x.html
```
也可以使用`=response`语法改变响应状态码，例如：
```
error_page 404 =200 /empty.gif
```
更多参考可查看[这里](http://tengine.taobao.org/nginx_docs/cn/docs/http/ngx_http_core_module.html#error_page)
### if_modified_since
```
语法：if_modified_since off | exact | before;
默认：if_modified_since exact;
上下文：http,server,location
```
指定响应的修改时间和“If-Modified-Since”请求头的比较方法。
### index
```
语法：index file ...;
默认：index index.html;
上下文：http,server,location
```
定义将要被作为默认页的文件。文件`file`的名字可以包含变量。文件以配置中指定的顺序被nginx检查。列表中的最后一个元素可以是一个带有绝对路径的文件。例子：
```
index index.$geo.html index.0.html /index.html;
```
index文件会引发内部重定向，请求可能会被其它location处理。 比如：
```
location = / {
    index index.html;
}

location / {
    ...
}
```
请求`/`实际上将会在第二个`location`中作为`/index.html`被处理。
### internal
```
语法：internal;
默认：-
上下文：location
```
指定一个路径是否只能用于内部访问。如果是外部访问，客户端将收到`404(Not Found)`错误。例如：
```
error_page 404 /404.html;

location /404.html {
    internal;
}
```
**注意：** nginx限制每个请求只能最多进行10次内部重定向，以防配置错误引起请求处理出现问题。 如果内部重定向次数已达到10次，nginx将返回`500(Internal Server Error)`错误。 同时，错误日志中将有`rewrite or internal redirection cycle`的信息。
### keepalive_timeout
```
语法：keepalive_timeout timeout [header_timeout];
默认：keepalive_timeout 75s;
上下文：http,server,location
```
第一个参数设置客户端的长连接在服务器端保持的最长时间（在此时间客户端未发起新请求，则长连接关闭）。第二个参数为可选项，设置“Keep-Alive: timeout=time”响应头的值。可以为这两个参数设置不同的值。更多细节及各浏览器的反应参见[这里](http://www.nginx.cn/doc/standard/httpcore.html)
### keepalive_requests
```
语法：keepalive_requests number;
默认：keepalive_requests 100;
上下文：http,server,location
```
设置通过一个长连接可以处理的最大请求数。请求数超过此值，长连接将关闭。
### listen
```
语法：listen address[:port] [default_server] [setfib=number];
默认：listen *:80 | *:8000;
上下文：server
```
设置nginx监听地址，nginx从这里接受请求。对于IP协议，这个地址就是address和port；对于UNIX域套接字协议，这个地址就是path。 一条listen指令只能指定一个address或者port。例如：
```
listen 127.0.0.1:8000;
listen 127.0.0.1;
listen 8000;
listen *:8000;
listen localhost:8000;
```
IPv6地址使用方括号来表示：
```
listen [::]:8000;
listen [fe80::1];
```
UNIX域套接字则使用“unix:”前缀：
```
listen unix:/var/run/nginx.sock;
```
如果listen指令携带`default_server`参数，当前虚拟主机将成为指定address:port的默认虚拟主机。 如果任何listen指令都没有携带`default_server`参数，那么第一个监听address:port的虚拟主机将被作为这个地址的默认虚拟主机。
### location
```
语法：location [ = | ~ | ~* | ^~ ] uri { ... }
     location @name { ... }
默认：-
上下文：server,location
```
* 为某个请求URI（路径）建立配置。<br />
* 路径匹配在URI规范化以后进行。所谓规范化，就是先将URI中形如“%XX”的编码字符进行解码， 再解析URI中的相对路径“.”和“..”部分， 另外还可能会压缩相邻的两个或多个斜线成为一个斜线。<br />
* 可以使用前缀字符串或者正则表达式定义路径。使用正则表达式需要在路径开始添加`~*`前缀 (不区分大小写)，或者`~`前缀(区分大小写)。为了根据请求URI查找路径，nginx先检查前缀字符串定义的路径 (前缀路径)，在这些路径中找到能最精确匹配请求URI的路径。然后nginx按在配置文件中的出现顺序检查正则表达式路径，匹配上某个路径后即停止匹配并使用该路径的配置，否则使用最大前缀匹配的路径的配置。
更多参考可查看[location使用说明](http://tengine.taobao.org/nginx_docs/cn/docs/http/ngx_http_core_module.html#location)。
### root
```
语法：root path;
默认：root html;
上下文：http,server,location,if in location
```
为请求设置根目录，例如：
```
location /i/ {
    root /data/w3;
}
```
那么nginx将使用文件`/data/w3/i/top.gif`响应请求`/i/top.gif`。文件路径的构造仅仅是将URI拼在`root`指令的值后面。如果需要修改URI，应该使用`alias`指令。
### server
```
语法：server {...}
默认：-
上下文：http
```
表示开始设置虚拟主机的配置，更多信息可参加[Nginx如何处理一个请求](http://tengine.taobao.org/nginx_docs/cn/docs/http/request_processing.html)。
### server_name
```
语法：server_name name ...;
默认：server_name "";
上下文：server
```
设置虚拟主机名，例如：
```
server {
    server_name example.com www.example.com;
}
```
共有三种：`确切名称`，`通配符`，`正则表达式`，更多信息参考[虚拟主机名](http://tengine.taobao.org/nginx_docs/cn/docs/http/server_names.html)。
### try_files
```
语法：try_files file ... uri;
     try_files file ... =code;
默认：-
上下文：server,location
```
按指定顺序检查文件是否存在，并且使用第一个找到的文件来处理请求，那么处理过程就是在当前上下文环境中进行的。文件路径是根据`root`指令和`alias`指令，将`file`参数拼接而成。可以在名字尾部添加斜线以检查目录是否存在，比如`$uri/`。如果找不到任何文件，将按最后一个参数指定的uri进行内部跳转。比如：
```
location / {
    try_files $uri $uri/index.html $uri.html =404;
}
```
### types
```
语法：types {...}
默认：types {
        text/html html;
        image/gif gif;
        image/jpeg jpg;
     }
上下文：http,server,location
```
设置文件扩展名和响应的MIME类型的映射表。
## HTTP Upstream模块
该模块允许定义一组服务器来实现后端服务器负载均衡，他们可以在`proxy_pass`,`fastcgi_pass`,`memcached_pass`中被引用到。更多信息可参考[ngx_http_upstream_module模块](http://tengine.taobao.org/nginx_docs/cn/docs/http/ngx_http_upstream_module.html)。配置例子如下：
```
upstream backend {
    server backend1.example.com       weight=5;
    server backend2.example.com:8080;
    server unix:/tmp/backend3;        max_fails=3 fail_timeout=30s;

    server backup1.example.com:8080   backup;
    server backup2.example.com:8080   backup;
}

server {
    location / {
        proxy_pass http://backend;
    }
}
```
### upstream
```
语法：upstream name {...}
默认：-
上下文：http
```
定义一组服务器。这些服务器可以监听不同的端口。而且，监听在TCP和UNIX域套接字的服务器可以混用。默认情况下，nginx按加权轮转的方式将请求分发到各服务器。
### server
```
语法：server address [parameters]
默认：-
上下文：upstream
```
定义服务器的地址address和其他参数parameters。地址可以是域名或者IP地址，端口是可选的，或者是指定`unix:`前缀的UNIX域套接字的路径。如果没有指定端口，就使用`80`端口。如果一个域名解析到多个IP，本质上是定义了多个server。可选择的参数如下：<br />
**`weight=number:`** 设定服务器的权重，默认是1。<br />
**`max_fails=number:`** 设定Nginx与服务器通信的尝试失败的次数。在fail_timeout参数定义的时间段内，如果失败的次数达到此值，Nginx就认为服务器不可用。在下一个fail_timeout时间段，服务器不会再被尝试。失败的尝试次数默认是1。设为0就会停止统计尝试次数，认为服务器是一直可用的。<br />
**`fail_timeout=time:`** 1.统计失败尝试次数的时间段。2.服务器被认为不可用的时间段。<br />
**`backup:`** 标记为备用服务器。当主服务器不可用以后，请求会被传给这些服务器。<br />
**`down:`** 标记服务器永久不可用，可以跟`ip_hash`指令一起使用。
### iphash
```
语法：iphash
默认：-
上下文：upstream
```
指定服务器组的负载均衡方法，请求基于客户端的IP地址在服务器间进行分发。IPv4地址的前三个字节或者IPv6的整个地址，会被用来作为一个散列key。这种方法可以确保从同一个客户端过来的请求，会被传给同一台服务器。如果其中一个服务器想暂时移除，应该加上down参数。这样可以保留当前客户端IP地址散列分布。
### keepalive
```
语法：keepalive connections;
默认：-
上下文：upstream
```
激活对上游服务器的连接进行缓存。connections参数设置每个worker进程与后端服务器保持连接的最大数量。这些保持的连接会被放入缓存。如果连接数大于这个值时，最久未使用的连接会被关闭。
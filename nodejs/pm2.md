## pm2介绍
[pm2](https://pm2.io/doc/en/runtime/overview/)是一个流行的进程管理工具，nodejs常用它来做进程管理，支持负载均衡、自动重启、性能监控等

## 安装
可以全局依赖安装，也可以本地依赖安装
```bash
npm install -g pm2 #全局依赖安装
npm install --save-prod pm2 #本地依赖安装
```

## 使用
简单的启动命令如下
```bash
pm2 start app.js #全局依赖安装pm2
./node_modules/pm2/bin/pm2 start app.js #本地依赖安装pm2
```
生成开机自启动的命令如下
```bash
pm2 startup #生成开机启动
```
一旦pm2启动了，会在`$HOME/.pm2/`下生成一系列文件或者文件夹，大致如下
```bash
$HOME/.pm2 #包含PM2相关的所有文件
$HOME/.pm2/logs/ #PM2下所有应用的日志
$HOME/.pm2/pids/ #PM2下所有应用的pids文件
$HOME/.pm2/pm2.log #PM2日志
$HOME/.pm2/pm2.pid #PM2的pid日志
$HOME/.pm2/rpc.sock #远程命令的socket文件
$HOME/.pm2/pub.sock #Socket file for publishable events
$HOME/.pm2/conf.js #PM2 Configuration，在mac下会是module_conf.json
$HOME/.pm2/modules/ 
```

## Ecosystem file
可以在pm2命令行中指定各项配置，但是最佳实践是使用[配置文件](https://pm2.io/doc/en/runtime/guide/ecosystem-file/)ecosystem.config.js文件，`pm2 start`会默认使用当前文件夹下面的`ecosystem.config.js`文件，也可以指定配置文件`pm2 start /path/to/ecosystem.config.js`,可以手动在项目根路径中创建该文件，也可以在项目根路径中使用如下生成命令创建
```bash
pm2 init #初始化一个ecosystem.config.js文件
```
ecosystem.config.js的常见内容格式如下，更详细信息查看[这里](https://pm2.io/doc/en/runtime/reference/ecosystem-file/)
```js
module.exports = {
    apps : [{
        name: 'APP', //在pm2管理中的应用名称
        script: 'app.js', //启动的脚本名称，在cwd有值的情况下是相对于cwd路径的
        cwd: '/path/to/project', //项目的工作路径
        args: 'one two', //传递给启动脚本的参数
        instances: 1/'max', //以cluster 模式启动的实例数量，默认为1，max为按照cpu数量最大来创建
        exec_mode: 'fork', //启动模式，fork/cluster，默认为fork
        autorestart: true, //进程挂掉后是否自动启动，默认为true
        watch: false, //是否监控文件变化以重启应用，默认为true
        max_memory_restart: '1G', //超过多大的内存后进行重启
        output: '/path/to/outputfile', //stdout的日志输出文件路径，默认为~/.pm2/logs/APPNAME-out.log
        error: '/path/to/errorfile', //stderr的日志输出文件路径，默认为~/.pm2/logs/APPNAME-error.log
        log: '/path/to/logfile', //包含stdout和stderr的日志文件路径，默认为/dev/null
        port: '3000', //env的PORT环境变量的快捷字段
        env: { //不使用--env参数时传递给process.env的环境变量
          NODE_ENV: 'development'
        },
        env_production: { //pm2 start app.js --env production使用--env参数时传递给process.env的环境变量
          NODE_ENV: 'production'
        }
    },{
        name: 'ANOTHER-APP',
        script: 'another.js'
    }]
}
```

## 命令列表
[常用命令](https://pm2.io/doc/en/runtime/features/commands-cheatsheet/)列表如下
```bash
pm2 start app.js [-i number/max] #启动app.js，-i来指定instance数量
pm2 start app.js --watch [--ignore-watch /*/] #启动应用并且当文件变化时自动重启
pm2 start <app_name>/<app_id> #按应用名称/应用ID来启动应用
pm2 stop <app_name>/<app_id> #按应用名称/应用ID来停止应用
pm2 restart <app_name>/<app_id> #按应用名称/应用ID来重启应用
pm2 delete <app_name>/<app_id> #按应用名称/应用ID来删除应用
pm2 list #列出所有应用
pm2 show <app_name>/<app_id> #按应用名称/应用ID来显示应用信息
pm2 prettylist #以可读性好的json形式列出所有应用信息
pm2 restart app --update-env #修改了ecosystem.config.js的env后需要--update-env来重启更新
pm2 logs [<app_name>/<app_id>] #显示日志，或者某个应用的日志
pm2 env <app_id> #显示某个app的环境变量信息
pm2 monitor #显示监控信息
```
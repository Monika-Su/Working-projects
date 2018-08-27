# 登录接口集

## 用户登录
用户登录页面，客户端发起的登录请求。

* 接口名：`login`
* Method：`Socket (client)`
* 接收参数：
```
{
    username : String,
    password : String
}
```

## 用户登录回复
服务端对用户登录请求的回复。

* 接口名：`loginReply`
* Method：`Socket (socket)`
* 接收参数：
```
{
    status : String,
    data : Object,
    message : String
}
```
| 字段 | 说明 |
| --- | --- |
| status | success 或 failed |
| data | TBD |
| message | 错误信息 |
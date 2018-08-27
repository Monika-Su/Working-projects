# 公共接口集

## 接口模板
> 这里是接口描述

* 接口名：`apiName`
* Method：`GET`
* 接收参数：
```
{
    param : paramType,
    param : paramType
}
```

## 获取登录用户信息
客户端发起，用于登录用户信息获取与确认。
* 接口名：`getUserInfo`
* Method：`Socket`
* 发起参数：无

## 用户信息反馈
服务端将登录用户的信息返回给当前用户
* 接口名：`userInfo`
* Method: `Socket` socket型
* 输出参数:
```
{
    data : String,
}
```
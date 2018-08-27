# 详情接口集

## 获取概要数据
客户端发起，请求当前语言下的概要数据。只需要在进入页面时发起，随后会由`概要数据更新`方法进行提供。
* 接口名：`getOverview`
* Method：`Socket (client)`
* 输入参数：
```
{
    geo : String
}
```
| 字段 | 说明 |
| --- | --- |
| geo | 提供"HK" "CN" "MO" "HKEN" "TW"中的一种，其余值不进行解析，并会提供一个返回结果 |

## 概要数据回复
服务端对收到的获取请求进行回复。data格式同`概要数据更新`接口
* 接口名：`overviewReply`
* Method：`Socket (socket)`
* 返回参数：
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
| data | Overview页面的展示内容，数据结构TBD，参考[数据结构](data.md) |
| message | 错误信息 |

## 概要数据更新
服务端将更新后的概要数据实时推送给所有socket链接。
* 接口名：`overviewUpdate`
* Method：`Socket (io)`
* 返回参数：
```
{
    data : Object
}
```
| 字段 | 说明 |
| --- | --- |
| data | Overview页面的展示内容，数据结构TBD，参考[数据结构](data.md) |
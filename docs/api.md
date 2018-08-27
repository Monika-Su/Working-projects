#外部接口集

用于与外部项目做对接。

## WS数据同步

通过Chris的插件将WS的项目状态同步到InventoryList系统中来。

* 接口名：`/ws`
* Method：`POST`
* 输入参数：
```json
{
data : {}
}
```
* 输出参数：
```
{
    status : String,
    data : String,
    message : String.
}
```
| 字段 | 取值 |
| --- | --- |
| status | success 或 failed |
| message | 'Upload data received.'或'Upload data not detected.' |
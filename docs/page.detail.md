# 详情接口集

## 获取详情数据
客户端发起，请求当前语言下的详情数据。只需要在进入页面时发起，随后会由`详情数据更新`方法进行提供。
* 接口名：`getDetail`
* Method：`Socket`
* 发起参数：无

## 详情数据回复
服务端对收到的获取请求进行回复。
* 接口名：`detailReply`
* Method：`Socket`
* 发起参数：无

## 更新详情数据
客户端将修改后的详情数据推送给服务端。成功后会带来一次详情数据更新。
* 接口名：`updateDetail`
* Method：`Socket`
* 发起参数：无

## 详情数据更新
服务端将更新后的数据实时推送给所有socket链接。
* 接口名：`detailUpdate`
* Method：`Socket`
* 发起参数：无



## 获取用户列表
客户端发起，请求当前系统中已登录的用户列表。只需要在进入页面时发起，随后会由`用户列表更新`方法进行提供。
* 接口名：`getUserList`
* Method：`Socket`
* 发起参数：无

## 用户列表回复
服务端对收到的获取请求进行回复。
* 接口名：`userListReply`
* Method：`Socket`
* 发起参数：无

## 用户列表更新 <span id="userListUpdate">.</span>
服务端将更新后的数据实时推送给所有socket链接。
* 接口名：`userListUpdate`
* Method：`Socket`
* 发起参数：无

## 获取当前修改用户
客户端发起，请求当前正在修改详情页面的用户。只需要在进入页面时发起，随后会由`当前修改用户更新`方法进行提供。
* 接口名：`getCurrentUser`
* Method：`Socket`
* 发起参数：无

## 当前修改用户回复
服务端对收到的获取请求进行回复。
* 接口名：`currentUserReply`
* Method：`Socket`
* 发起参数：无

## 申请修改
客户端发起一次请求，用以申请对当前详情页面进行修改。成功后会带来一次当前修改用户的变更
* 接口名：`editApply`
* Method：`Socket`
* 发起参数：无

## 修改申请回复
客户端发起一次请求，用以申请对当前详情页面进行修改。成功后会带来一次当前修改用户的变更
* 接口名：`editReply`
* Method：`Socket`
* 发起参数：无

## 完成修改
客户端发起一次请求，用以结束对当前详情页面进行修改。成功后会带来一次当前修改用户的变更
* 接口名：`editFinish`
* Method：`Socket`
* 发起参数：无

## 当前修改用户更新
服务端将更新后的当前修改用户推送给所有的socket链接
* 接口名：`currentUserUpdate`
* Method：`Socket`
* 发起参数：无
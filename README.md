## 项目介绍
> 人事管理系统是一个前后端分离的人力资源管理系统，项目采用 SpringBoot+Vue 开发，项目加入常见的企业级应用所涉及到的技术点，例如 Redis、RabbitMQ 等。

此项目是我的大学毕业设计，系统是用于企业对人力资源的自动化管理，由SpringBoot+VUE+微信小程序联合完成管理。该系统覆盖员工在企业中的整个职业生涯，从员工的入职到离 职、退休，能自动化的管理企业员工的各个方面：添加新员工，配置薪资，自动生成系统账户；自动排班，根据排班自动生成考勤打卡任务；每月自动统计考勤数据，再以此为依据计算月薪；合同管理、人事调动、薪资调整，系统都会相应的自动修改一系列数据。不仅如此，系统也实现了数据可视化、操作简单、容易上手的优点。 
**此项目适用于初学者学习理解！**
### 项目技术栈
### 后端
1. Spring Boot
2. Spring Security
3. MyBatis
4. MySQL
5. Redis
6. RabbitMQ
7. Spring Cache
8. 七牛云云存储
9. JWT
### 前端
1. Vue
2. ElementUI
3. axios
4. vue-router
5. Vuex
6. vue-cli4
7. AntV的G2 Plot数据可视化
### 主要实现的功能
1. 简单的增删查改
2. 简单的Excel导入导出
3. 复杂的多表连表查询计算（主要是员工的自动排班与每月薪资自动计算）
4. 基于Spring Security实现的RBAC系统角色访问控制
5. 基于Redis实现的JWT单点登录
6. 基于RabbitMQ简单的实现了系统的高并发功能、接口的幂等性以及消息的可靠性传递
7. 简单的面向切面的编程用于记录系统日志

### 后端项目地址[HRManagement](https://github.com/AlexYY0/HRManagement)
### 前端项目地址[hrmanagement-f](https://github.com/AlexYY0/hrmanagement-f)
### 配套微信小程序地址[HRManagementWX](https://github.com/AlexYY0/HRManagementWX)

### 快速部署
1. clone 后端项目到本地 `https://github.com/AlexYY0/HRManagement.git`
2. 导入数据库脚本
3. 提前准备好 Redis，在 项目的 application.yml 文件中，将 Redis 配置改为自己的
4. 提前准备好 RabbitMQ，在项目的 application.yml 文件中将 RabbitMQ 的配置改为自己的
5. 在 IntelliJ IDEA 中打开 HRManagement 项目，启动 HrManagementApplication

**OK，至此，服务端就启动成功了，此时我们直接在地址栏输入 `http://localhost:8081/index.html` 即可访问我们的项目，如果要做二次开发，请继续看第七、八步。**

6. 进入到前端 hrmanagement-f 项目中，在命令行依次输入如下命令：

```
# 安装依赖
npm install

# 在 localhost:8080 启动项目
npm run serve
```

由于我在 hrmanagement-f 项目中已经配置了端口转发，将数据转发到 Spring Boot 上，因此项目启动之后，在浏览器中输入 `http://localhost:8080` 就可以访问我们的前端项目了，所有的请求通过端口转发将数据传到 Spring Boot 中（注意此时不要关闭 Sprin gBoot 项目）。

7. 最后可以用 WebStorm 等工具打开 hrmanagement-f 项目，继续开发，开发完成后，当项目要上线时，依然进入到 hrmanagement-f 目录，然后执行如下命令：

```
npm run build
```

该命令执行成功之后，hrmanagement-f 目录下生成一个 dist 文件夹，将该文件夹中的两个文件 static 和 index.html 拷贝到 Spring Boot 项目中 resources/static/ 目录下，然后就可以像第 5 步那样直接访问了。


**步骤 6 中需要大家对 NodeJS、NPM 等有一定的使用经验，不熟悉的小伙伴可以先自行搜索学习下，推荐 [Vue 官方教程](https://cn.vuejs.org/v2/guide/)。**

**此项目的大体框架是基于松哥的 [微人事](https://github.com/lenve/vhr)。**

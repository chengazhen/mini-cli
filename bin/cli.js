#! /usr/bin/env node

const program = require('commander')
const { version } = require('../package.json')
const inquirer = require('inquirer');
const templates = require('./template.js')
const path = require("path")
const downloadGitRepo = require('download-git-repo')
const ora = require('ora') // 引入ora
const fs = require('fs-extra') // 引入fs-extra
const chalk = require('chalk') // 引入chalk

const { yellow, cyanBright } = chalk

const { info } = console

program
  .command('create')
  .description('创建模版')
  .action(async () => {
    // 输入项目名称代码
    const { name } = await inquirer.prompt({
      type: 'input',
      name: 'name',
      message: '请输入项目名称：'
    })

    // 新增选择模版代码
    const { template } = await inquirer.prompt({
      type: 'list',
      name: 'template',
      message: '请选择模版：',
      choices: templates // 模版列表
    })


    const dest = path.join(process.cwd(), name)
    // 判断文件夹是否存在，存在就交互询问用户是否覆盖
    if (fs.existsSync(dest)) {
      const { force } = await inquirer.prompt({
        type: 'confirm',
        name: 'force',
        message: '目录已存在，是否覆盖？',
      })
      // 如果覆盖就删除文件夹继续往下执行，否的话就退出进程
      force ? fs.removeSync(dest) : process.exit(1)
    }

    const loading = ora('正在下载模版...')
    loading.start()
    download(template, dest, { clone: template.includes('hexfuture') }).then(() => {
      handleSuccess(name)
    }).catch(err => {
      handleFail(err)
    })
  });



// 定义当前版本
program.version(`v${version}`)

// 定义使用方法
program.on('--help', () => { }) // 添加--help


// 解析用户执行命令传入参数
program.parse(process.argv)


function download(repo, dest, opt) {
  return new Promise((resolve, reject) => {
    downloadGitRepo(repo, dest, opt, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

function handleSuccess(name) {
  info(`${yellow('$')}  ${cyanBright(`cd ${name}`)}  进入项目目录`)
  info(`${yellow('$')}  ${cyanBright('npm i')}  安装依赖`)
  info(`${yellow('$')}  ${cyanBright('npm run dev')}   运行项目`)
  process.exit(1)
}

function handleFail(err) {
  console.log(err)
  process.exit(1)
}
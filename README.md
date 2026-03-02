# 贪吃蛇 Snake Game

一个纯前端（HTML/CSS/JavaScript）的贪吃蛇小游戏。

## 玩法

- 方向键或 WASD 控制
- 空格键暂停/继续
- 点击“重新开始”重开

## 本地运行

直接双击 `index.html`，或使用任意静态服务器。

## 发布到 GitHub

1. 在 GitHub 创建一个新仓库（例如 `snake-game`）
2. 在该目录执行：

```bash
git init
git add .
git commit -m "feat: add snake game"
git branch -M main
git remote add origin <你的仓库地址>
git push -u origin main
```

如果你已安装并登录 GitHub CLI (`gh auth login`)，可直接：

```bash
gh repo create snake-game --public --source=. --remote=origin --push
```

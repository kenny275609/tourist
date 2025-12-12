# GitHub 設定指南

## 步驟 1：在 GitHub 上創建新倉庫

1. 前往 [GitHub](https://github.com)
2. 點擊右上角的 **"+"** 按鈕，選擇 **"New repository"**
3. 填寫倉庫資訊：
   - **Repository name**: `tourist`（或您喜歡的名稱）
   - **Description**: 武陵四秀登山行程規劃應用
   - **Visibility**: 選擇 Public 或 Private
   - **不要**勾選 "Initialize this repository with a README"（因為本地已有代碼）
4. 點擊 **"Create repository"**

## 步驟 2：添加遠端倉庫

創建倉庫後，GitHub 會顯示倉庫 URL，格式類似：
- HTTPS: `https://github.com/您的用戶名/tourist.git`
- SSH: `git@github.com:您的用戶名/tourist.git`

在終端執行以下命令（將 URL 替換為您的實際 URL）：

```bash
# 添加遠端倉庫（使用 HTTPS）
git remote add origin https://github.com/您的用戶名/tourist.git

# 或者使用 SSH（如果您已設定 SSH 金鑰）
git remote add origin git@github.com:您的用戶名/tourist.git
```

## 步驟 3：推送到 GitHub

```bash
# 推送到 main 分支
git push -u origin main
```

如果遇到認證問題（HTTPS），您可能需要：
- 使用 Personal Access Token 代替密碼
- 或設定 SSH 金鑰使用 SSH URL

## 步驟 4：驗證設定

```bash
# 檢查遠端倉庫設定
git remote -v

# 應該會顯示：
# origin  https://github.com/您的用戶名/tourist.git (fetch)
# origin  https://github.com/您的用戶名/tourist.git (push)
```

## 故障排除

### 問題：認證失敗

**解決方案**：
1. 使用 Personal Access Token：
   - 前往 GitHub Settings > Developer settings > Personal access tokens
   - 生成新的 token（選擇 `repo` 權限）
   - 推送時使用 token 作為密碼

2. 或使用 SSH：
   ```bash
   # 生成 SSH 金鑰（如果還沒有）
   ssh-keygen -t ed25519 -C "your_email@example.com"
   
   # 將公鑰添加到 GitHub
   cat ~/.ssh/id_ed25519.pub
   # 複製輸出，然後在 GitHub Settings > SSH and GPG keys 中添加
   ```

### 問題：分支名稱不匹配

如果 GitHub 倉庫使用 `master` 而不是 `main`：

```bash
# 重命名本地分支
git branch -M master

# 或推送時指定分支
git push -u origin main:master
```

## 下一步：部署到 Vercel

推送成功後，您可以：
1. 前往 [Vercel](https://vercel.com)
2. 導入 GitHub 倉庫
3. 設定環境變數
4. 部署！

詳細步驟請參考 `VERCEL_DEPLOYMENT.md`


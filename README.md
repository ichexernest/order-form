# GoodMood 訂單登錄 LIFF App

這是一個部署在 Vercel 的 LINE LIFF 應用程式，用於讓消費者輸入訂單編號登錄活動。

## 功能

給消費者輸入訂單編號登錄活動

## 流程

1. 從 LINE 官方帳號點入網頁
2. 驗證 LINE 帳號登入
3. 取得用戶 LINE ID
4. 顯示 Tips component - 顯示活動責任聲明及同意按鈕
5. 按下同意按鈕，切換顯示 Form component
6. 一個輸入框可以輸入訂單編號
7. 按下確認送出 POST `https://test.goodmoods.store/wp-json/gm/v1/set-logged`
   - Body: `{"order_number":"xxx"}`
8. 根據 response 判斷跳出回饋 dialog：
   - `line_id` 與登入 LINE ID 不同：顯示訂單驗證失敗
   - `is_completed=false`：顯示查無訂單或訂單未完成
   - `is_logged=true`：顯示該訂單已登錄
9. 若都正確，跳出登錄完成 dialog 顯示登錄成功

## 結構

1. 只有 homepage，form、tips 或其他 component 都在此頁內轉換
2. 載入後第一件事就是抓 LINE ID 存 state

## 技術棧

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- LINE LIFF SDK

## 環境設定

1. 複製 `.env.local.example` 為 `.env.local`
2. 在 [LINE Developers Console](https://developers.line.biz/) 建立 LIFF App
3. 將 LIFF ID 填入 `.env.local` 的 `NEXT_PUBLIC_LIFF_ID`

## 開發

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建置
npm run build
```

## 部署

部署到 Vercel，記得在 Vercel 設定環境變數 `NEXT_PUBLIC_LIFF_ID`。

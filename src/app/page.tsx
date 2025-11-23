"use client";

import { useEffect, useState } from "react";
import liff from "@line/liff";
import Tips from "@/component/tips";
import Form from "@/component/form";
import Dialog from "@/component/dialog";

type ViewMode = "loading" | "tips" | "form";

interface DialogState {
  isOpen: boolean;
  title: string;
  message: string;
  type: "success" | "error" | "warning";
}

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("loading");
  const [lineId, setLineId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  // 初始化 LIFF
  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID || "" });

        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        // 取得用戶資料
        const profile = await liff.getProfile();
        setLineId(profile.userId);
        setViewMode("tips");
      } catch (error) {
        console.error("LIFF initialization failed", error);
        showDialog("初始化失敗", "無法連接到 LINE，請重新開啟應用程式", "error");
      }
    };

    initLiff();
     //setViewMode("tips");
  }, []);

  const showDialog = (title: string, message: string, type: DialogState["type"]) => {
    setDialog({ isOpen: true, title, message, type });
  };

  const closeDialog = () => {
    setDialog({ ...dialog, isOpen: false });
  };

  const handleAgree = () => {
    setViewMode("form");
  };

  const handleSubmit = async (orderNumber: string) => {
    setIsLoading(true);

    try {
      const response = await fetch("https://test.goodmoods.store/wp-json/gm/v1/set-logged", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order_number: orderNumber }),
      });

      const data = await response.json();

      // 根據 response 判斷結果
      // 1. 檢查 line_id 是否與登入的 lineId 不同
      if (data.line_id && data.line_id !== lineId) {
        showDialog("訂單驗證失敗", "此訂單與您的 LINE 帳號不符", "error");
      }
      // 2. 檢查訂單是否未完成
      else if (data.is_completed === false) {
        showDialog("訂單狀態錯誤", "查無訂單或訂單未完成", "error");
      }
      // 3. 檢查訂單是否已登錄
      else if (data.is_logged === true) {
        showDialog("訂單已登錄", "該訂單已經登錄過活動", "warning");
      }
      // 4. 訂單正確且未登錄，顯示成功
      else if (data.is_completed === true && data.is_logged === false) {
        showDialog("登錄成功", "您的訂單已成功登錄活動！", "success");
      }
      // 5. 其他情況
      else {
        showDialog("提交失敗", "訂單狀態異常，請聯繫客服", "error");
      }
    } catch (error) {
      console.error("Submit failed", error);
      showDialog("提交失敗", "網路錯誤，請稍後再試", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-red-100">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-start pb-8  bg-white">
        {viewMode === "loading" && (
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
            <p className="text-gray-600">載入中...</p>
          </div>
        )}
        <div className="w-full h-[250px] bg-sky-200">
          <h1>GoodMood 聖誕抽獎登錄活動</h1>
        </div>
        {viewMode === "tips" && <Tips onAgree={handleAgree} />}

        {viewMode === "form" && (
          <Form lineId={lineId} onSubmit={handleSubmit} isLoading={isLoading} />
        )}

        <Dialog
          isOpen={dialog.isOpen}
          onClose={closeDialog}
          title={dialog.title}
          message={dialog.message}
          type={dialog.type}
        />
      </main>
    </div>
  );
}

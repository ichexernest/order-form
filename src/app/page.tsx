"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
      // 1. 查詢訂單資訊
      const orderInfo = await fetchOrderInfo(orderNumber);

      // 2. 驗證訂單狀態
      const validation = validateOrder(orderInfo, lineId);

      if (!validation.isValid) {
        showDialog(validation.title, validation.message, validation.type);
        return;
      }

      // 3. 登錄訂單
      await registerOrder(orderNumber);
      showDialog("登錄成功", "您的訂單已成功登錄活動！", "success");
    } catch (error) {
      console.error("Submit failed", error);
      const errorMessage = error instanceof Error ? error.message : "網路錯誤，請稍後再試";
      showDialog("提交失敗", errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // 查詢訂單資訊
  const fetchOrderInfo = async (orderNumber: string) => {
    const response = await fetch(
      `https://goodmoods.store/wp-json/gm/v1/order-info?order_number=${orderNumber}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  };

  // 驗證訂單
  const validateOrder = (data: any, currentLineId: string) => {
    // 1. LINE ID 不符
    if (data.line_id && data.line_id !== currentLineId) {
      return {
        isValid: false,
        title: "訂單驗證失敗",
        message: "此訂單與您的 LINE 帳號不符",
        type: "error" as const,
      };
    }

    // 2. 訂單未完成
    if (data.is_completed === false) {
      return {
        isValid: false,
        title: "訂單狀態錯誤",
        message: "查無訂單或訂單未完成",
        type: "error" as const,
      };
    }

    // 3. 訂單已登錄
    if (data.is_logged === true) {
      return {
        isValid: false,
        title: "訂單已登錄",
        message: "該訂單已經登錄過活動",
        type: "warning" as const,
      };
    }

    // 4. 訂單驗證通過
    if (data.is_completed === true && data.is_logged === false) {
      return { isValid: true, title: "", message: "", type: "success" as const };
    }

    // 5. 其他異常情況
    return {
      isValid: false,
      title: "提交失敗",
      message: "訂單狀態異常，請聯繫客服",
      type: "error" as const,
    };
  };

  // 登錄訂單
  const registerOrder = async (orderNumber: string) => {
    const response = await fetch("https://goodmoods.store/wp-json/gm/v1/set-logged", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ order_number: orderNumber, action: "add" }),
    });

    if (!response.ok) {
      throw new Error("訂單登錄失敗");
    }

    return await response.json();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-red-100">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-start pb-8  bg-white">
        <div className="w-full h-[250px] relative">
          <Image
            src="/a.jpg"
            alt="GoodMood 聖誕抽獎登錄活動"
            fill
            className="object-cover"
            priority
          />
        </div>
        {viewMode === "loading" && (
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
            <p className="text-gray-600">載入中...</p>
          </div>
        )}
        <h1 className="mt-5 font-bold text-2xl text-red-800">GoodMood 2025聖誕抽獎登錄活動</h1>

        <a
          href="https://goodmoods.store/notice-20251201/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-md"
        >
          前往查看活動詳情
        </a>

        {viewMode === "tips" && <Tips onAgree={handleAgree} />}

        {viewMode === "form" && (
          <Form lineId={lineId} onSubmit={handleSubmit} isLoading={isLoading}  />
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

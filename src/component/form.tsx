"use client";

import { useState } from "react";

interface FormProps {
  lineId: string;
  onSubmit: (orderNumber: string) => void;
  isLoading: boolean;
}

export default function Form({ lineId, onSubmit, isLoading }: FormProps) {
  const [orderNumber, setOrderNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim()) {
      onSubmit(orderNumber.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-800">輸入訂單資訊</h1>
      <p className="text-gray-600 text-center">請輸入您的訂單編號以完成活動登錄</p>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
            訂單編號
          </label>
          <input
            id="orderNumber"
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="請輸入訂單編號"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
            disabled={isLoading}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !orderNumber.trim()}
          className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-white font-semibold rounded-xl transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? "處理中..." : "確認送出"}
        </button>
      </form>

      {lineId && (
        <p className="text-xs text-gray-500">LINE ID: {lineId}</p>
      )}
    </div>
  );
}
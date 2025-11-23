interface TipsProps {
  onAgree: () => void;
}

export default function Tips({ onAgree }: TipsProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">活動責任聲明</h2>
      <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-gray-700">
        <p>1. 本活動僅限已完成訂單的消費者參加。</p>
        <p>2. 每筆訂單僅能登錄一次，重複登錄將無效。</p>
        <p>3. 訂單編號必須與您的 LINE 帳號綁定的訂單相符。</p>
        <p>4. 主辦方保留最終解釋權及修改活動內容的權利。</p>
        <p>5. 參加本活動即表示您同意以上條款。</p>
      </div>
      <button
        onClick={onAgree}
        className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-white font-semibold rounded-xl transition-colors"
      >
        我同意並繼續
      </button>
    </div>
  );
}
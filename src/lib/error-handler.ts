import { toast } from "sonner";

export interface AppError extends Error {
  code?: string;
  digest?: string;
}

export const handleError = (error: unknown, fallbackMessage: string = "Đã có lỗi xảy ra") => {
  console.error("Error encountered:", error);

  let message = fallbackMessage;
  let description = "Vui lòng thử lại sau.";

  if (error instanceof Error) {
    const err = error as AppError;
    
    // Handle specific error patterns
    if (err.message.includes("fetch") || !navigator.onLine) {
      message = "Lỗi kết nối mạng";
      description = "Vui lòng kiểm tra lại kết nối internet của bạn.";
    } else if (err.message.includes("timeout")) {
      message = "Hết thời gian chờ";
      description = "Máy chủ phản hồi quá chậm. Vui lòng thử lại sau ít phút.";
    } else if (err.message.includes("database") || err.message.includes("drizzle")) {
      message = "Lỗi cơ sở dữ liệu";
      description = "Không thể truy cập dữ liệu lúc này. Chúng tôi đang khắc phục.";
    } else {
      message = err.message;
    }
  }

  toast.error(message, {
    description,
    duration: 5000,
  });
};

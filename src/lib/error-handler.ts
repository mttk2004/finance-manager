import { toast } from "sonner";
import { ErrorCode } from "./errors";

export interface AppError extends Error {
  code?: string;
  digest?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  [ErrorCode.INSUFFICIENT_BALANCE]: "Số dư tài khoản không đủ!",
  [ErrorCode.TRANSACTION_NOT_FOUND]: "Không tìm thấy giao dịch!",
  [ErrorCode.FUND_NOT_FOUND]: "Không tìm thấy tài khoản nguồn hoặc đích!",
  [ErrorCode.CANNOT_DELETE_DEFAULT_FUND]: "Không thể xóa tài khoản mặc định!",
  [ErrorCode.VALIDATION_FAILED]: "Dữ liệu không hợp lệ!",
};

export const handleError = (error: unknown, fallbackMessage: string = "Đã có lỗi xảy ra") => {
  console.error("Error encountered:", error);

  let message = fallbackMessage;
  let description = "Vui lòng thử lại sau.";

  if (error instanceof Error) {
    const err = error as AppError;
    
    // Check if the error code or message maps to a known error code message
    const errCode = err.code || err.message;
    if (errCode && ERROR_MESSAGES[errCode]) {
      message = ERROR_MESSAGES[errCode];
      description = "Vui lòng kiểm tra lại thông tin và thử lại.";
    } else if (err.message.includes("fetch") || !navigator.onLine) {
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

import { EmptyState } from "@/components/empty-state";
import { ReceiptText } from "lucide-react";
import { Transaction } from "@/types";
import { useRouter } from "next/navigation";

interface RecentTransactionsProps {
  groupedTransactions: Record<string, Transaction[]>;
  isSubmitting: boolean;
}

export function RecentTransactions({ groupedTransactions, isSubmitting }: RecentTransactionsProps) {
  const router = useRouter();

  return (
    <section className="lg:pl-4 mt-4 lg:mt-0">
      <div className="sticky top-24">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Giao dịch gần đây</h3>
          <button onClick={() => router.push('/transactions')} className="text-[10px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer">Xem tất cả</button>
        </div>
        
        <div className="space-y-6">
          {isSubmitting && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-2 w-16 bg-white/5 rounded animate-pulse"></div>
                <div className="h-[1px] flex-1 bg-white/[0.03]"></div>
              </div>
              <div className="w-full p-3 rounded-2xl bg-card border border-border flex items-center justify-between opacity-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse shrink-0"></div>
                  <div className="space-y-1.5">
                    <div className="h-3 w-24 bg-white/5 rounded animate-pulse"></div>
                    <div className="h-2 w-16 bg-white/5 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="h-3 w-16 bg-white/5 rounded animate-pulse"></div>
              </div>
            </div>
          )}
          {Object.keys(groupedTransactions).length === 0 && !isSubmitting ? (
            <EmptyState 
              icon={ReceiptText}
              title="Chưa có giao dịch"
              description="Các giao dịch gần đây của bạn sẽ xuất hiện tại đây."
              className="py-6"
            />
          ) : (
            Object.entries(groupedTransactions).map(([date, txs]) => (
              <div key={date} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 font-bold">{date}</span>
                  <div className="h-[1px] flex-1 bg-white/[0.03]"></div>
                </div>
                <div className="space-y-1.5">
                  {txs.map((tx) => (
                    <button 
                      key={tx.id} 
                      className="w-full p-3 rounded-2xl bg-card border border-border flex items-center justify-between hover:bg-secondary/50 cursor-pointer transition-all hover:translate-x-1 group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base shrink-0 shadow-inner transition-colors ${
                          tx.type === 'INCOME' || tx.type === 'BORROW' ? 'bg-emerald-500/10 text-emerald-400' : 
                          tx.type === 'EXPENSE' || tx.type === 'LEND' ? 'bg-rose-500/10 text-rose-400' : 
                          'bg-blue-500/10 text-blue-400'
                        }`}>
                          {tx.type === 'TRANSFER' ? '⇄' : (tx.category?.icon || (tx.type === 'INCOME' ? "💰" : "💸"))}
                        </div>
                        <div>
                          <p className="text-xs text-foreground font-medium mb-0.5 truncate max-w-[120px] sm:max-w-[200px] lg:max-w-[140px]">
                            {tx.type === 'TRANSFER' ? (
                              <>
                                {tx.fund?.name} <span className="text-muted-foreground mx-1">→</span> {tx.toFund?.name}
                              </>
                            ) : (
                              tx.note || tx.category?.name || "Giao dịch"
                            )}
                          </p>
                          <p className="text-[9px] text-muted-foreground font-mono tracking-tight uppercase">
                            {tx.type === 'TRANSFER' ? 'Chuyển quỹ' : (tx.category?.name || (tx.type === 'INCOME' ? 'Thu nhập' : 'Chi tiêu'))}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-mono font-bold ${
                        tx.type === 'INCOME' || tx.type === 'BORROW' ? 'text-emerald-400' : 
                        tx.type === 'EXPENSE' || tx.type === 'LEND' ? 'text-rose-400' : 
                        'text-blue-400'
                      }`}>
                        {tx.type === 'INCOME' || tx.type === 'BORROW' ? '+' : tx.type === 'TRANSFER' ? '' : '-'}{tx.amount.toLocaleString('vi-VN')}đ
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

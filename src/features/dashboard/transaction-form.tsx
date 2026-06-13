import { useState, useCallback, useMemo, useEffect } from "react";
import { AmountInput } from "@/components/amount-input";
import { Category, TransactionType, Template } from "@/types";
import { toast } from "sonner";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransactions } from "@/hooks/use-transactions";
import { useDashboardStore } from "@/hooks/use-dashboard-store";

interface TransactionFormProps {
  allCategories: Category[];
  allTemplates: Template[];
}

export function TransactionForm({ 
  allCategories, 
  allTemplates,
}: TransactionFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { activeFund } = useDashboardStore();
  const { createTransaction, isSubmitting } = useTransactions();

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const isLoading = isSubmitting;

  const onOpenFundSelector = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('modal', 'fund-selector');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const onOpenTransferModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('modal', 'transfer');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleTransaction = async (type: TransactionType, amount: string, note: string) => {
    if (!amount || amount === '0' || isSubmitting || !activeFund) return;
    
    await createTransaction({
      fundId: activeFund.id,
      amount: parseInt(amount),
      type,
      note,
    });
  };

  const hashtags = useMemo(() => ['#an_sang', '#cafe', '#di_chuyen', '#mua_sam', '#vui_ve', '#lam_viec', '#luong', '#thuong', '#kinh_doanh', '#qua_tang'], []);

  const applyTemplate = useCallback((template: Template) => {
    if (template.amount) setAmount(template.amount.toString());
    if (template.notePreset) setNote(template.notePreset);
    toast.info(`Đã áp dụng lối tắt: ${template.title}`);
  }, []);

  const detectedCategory = useMemo(() => {
    const foundHashtags = note.match(/#\w+/g);
    if (!foundHashtags) return null;
    const lowerHashtags = foundHashtags.map(t => t.toLowerCase());
    
    return allCategories.find(cat => 
      cat.hashtags?.some(h => lowerHashtags.includes(h.toLowerCase()))
    );
  }, [note, allCategories]);

  const isIncomeDisabled = detectedCategory?.type === 'EXPENSE';
  const isExpenseDisabled = detectedCategory?.type === 'INCOME';

  const onHandleTransaction = useCallback(async (type: TransactionType) => {
    if (type === 'TRANSFER') {
      onOpenTransferModal();
      return;
    }
    await handleTransaction(type, amount, note);
    setAmount("");
    setNote("");
  }, [amount, note, handleTransaction, onOpenTransferModal]);

  return (
    <section className="bg-card border border-border rounded-3xl p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Nhập nhanh (One-Tap)</h3>
          <button 
            onClick={onOpenFundSelector}
            disabled={isLoading}
            className="text-[10px] uppercase font-mono font-medium tracking-tight bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            {activeFund?.name || "Chọn quỹ"}
          </button>
        </div>
        <div className="hidden md:flex gap-2">
          {allTemplates.slice(0, 4).map((template) => (
             <button 
              key={template.id} 
              onClick={() => applyTemplate(template)}
              disabled={isLoading}
              className="px-4 py-2 border border-white/5 rounded-full bg-secondary hover:bg-[#222222] active:scale-95 transition-all text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
                <span>{template.category?.icon || "⚡"}</span>
                <span>{template.title}</span>
             </button>
          ))}
          <button 
            onClick={() => router.push('/settings?tab=shortcuts')}
            disabled={isLoading}
            className="px-4 py-2 border border-white/5 rounded-full bg-secondary/50 hover:bg-secondary transition-all text-xs font-medium text-muted-foreground/60 hover:text-muted-foreground cursor-pointer disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>

      {/* Mobile quick templates */}
      <div className="flex md:hidden overflow-x-auto pb-4 gap-2 snap-x scrollbar-hide -mx-2 px-2 mb-2">
         {allTemplates.map((template) => (
           <button 
            key={template.id} 
            onClick={() => applyTemplate(template)}
            disabled={isLoading}
            className="snap-start shrink-0 px-4 py-3 border border-white/5 rounded-full bg-secondary hover:bg-[#222222] active:scale-95 transition-all text-xs font-medium text-muted-foreground cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
           >
              <span>{template.category?.icon || "⚡"}</span>
              <span>{template.title}</span>
           </button>
         ))}
         <button 
          onClick={() => router.push('/settings?tab=shortcuts')}
          disabled={isLoading}
          className="snap-start shrink-0 px-4 py-3 border border-white/5 rounded-full bg-secondary/50 text-xs font-medium text-muted-foreground/60 cursor-pointer disabled:opacity-50"
         >
          + Thêm
         </button>
      </div>
      
      <div className="space-y-6 md:space-y-8 mt-4 md:mt-8">
        <div className="relative group">
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2 block">Số tiền (VND)</label>
          <AmountInput 
            value={amount}
            onChange={setAmount}
            placeholder="0" 
            disabled={isLoading}
            className="w-full bg-transparent text-5xl md:text-7xl font-mono text-foreground py-2 focus:outline-none placeholder:text-neutral-800 text-center md:text-left border-b border-white/5 focus:border-white transition-colors pb-4 disabled:opacity-50" 
          />
          <span className="absolute right-0 bottom-6 text-muted-foreground/60 text-xl font-mono hidden md:block">đ</span>
        </div>
        
        <div className="relative">
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2 block">Ghi chú & Hashtag</label>
          
          {showHashtagSuggestions && (
            <div className="absolute bottom-full left-0 w-full mb-2 z-20 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              <div className="p-2 border-b border-white/5 bg-white/5">
                <span className="text-[10px] uppercase tracking-tighter text-muted-foreground font-medium px-2">Gợi ý danh mục</span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {hashtagSuggestions.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => applyHashtag(cat.hashtags?.[0] || `#${cat.name.replace(/\s+/g, '_').toLowerCase()}`)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/[0.03] last:border-0 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{cat.icon || "📝"}</span>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium text-foreground">{cat.name}</span>
                        <span className="text-[10px] text-muted-foreground">{cat.hashtags?.[0] || 'Chưa có hashtag'}</span>
                      </div>
                    </div>
                    <div className="text-xs text-emerald-500/50 group-hover:text-emerald-500 transition-colors font-mono">CHỌN</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <input 
            type="text" 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: Ăn trưa #vui_ve" 
            disabled={isLoading}
            className="w-full bg-[#161616] border border-white/[0.03] rounded-2xl px-4 md:px-6 py-4 md:py-5 text-sm text-neutral-300 focus:outline-none focus:border-white/20 placeholder:text-muted-foreground/60 transition-colors disabled:opacity-50" 
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {hashtags.map(tag => (
              <button 
                key={tag}
                onClick={() => setNote(prev => prev.includes(tag) ? prev : (prev ? `${prev} ${tag}` : tag))}
                disabled={isLoading}
                className="text-[10px] px-2 py-1 rounded-full bg-white/[0.03] border border-border text-muted-foreground hover:text-neutral-300 hover:bg-white/[0.08] transition-all cursor-pointer disabled:opacity-50"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4">
          <button 
            onClick={() => onHandleTransaction('EXPENSE')}
            disabled={!amount || amount === '0' || isLoading || isExpenseDisabled || !activeFund}
            className="group relative py-4 md:py-5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-sm md:text-base border border-rose-500/20 hover:border-rose-500/40 active:scale-[0.95] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden shadow-[0_0_20px_rgba(244,63,94,0.1)] hover:shadow-[0_0_30px_rgba(244,63,94,0.2)]"
          >
            <span className="relative z-10">{isLoading ? 'ĐANG XỬ LÝ...' : 'CHI TIỀN'}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>
          <button 
            onClick={() => onHandleTransaction('INCOME')}
            disabled={!amount || amount === '0' || isLoading || isIncomeDisabled || !activeFund}
            className="group relative py-4 md:py-5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-bold text-sm md:text-base border border-emerald-500/20 hover:border-emerald-500/40 active:scale-[0.95] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]"
          >
            <span className="relative z-10">{isLoading ? 'ĐANG XỬ LÝ...' : 'THU VÀO'}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-2">
          <button 
            onClick={() => onHandleTransaction('BORROW')}
            disabled={!amount || amount === '0' || isLoading || !activeFund}
            className="py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.02] font-medium text-xs border border-transparent hover:border-border transition-all cursor-pointer disabled:opacity-40"
          >
            Đi vay
          </button>
          <button 
            onClick={() => onHandleTransaction('LEND')}
            disabled={!amount || amount === '0' || isLoading || !activeFund}
            className="py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.02] font-medium text-xs border border-transparent hover:border-border transition-all cursor-pointer disabled:opacity-40"
          >
            Cho vay
          </button>
          <button 
            onClick={() => onHandleTransaction('TRANSFER')}
            disabled={!amount || amount === '0' || isLoading || !activeFund}
            className="py-2 rounded-xl text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 font-medium text-xs border border-transparent hover:border-blue-500/20 transition-all cursor-pointer disabled:opacity-40"
          >
            Chuyển quỹ
          </button>
        </div>
      </div>
    </section>
  );
}

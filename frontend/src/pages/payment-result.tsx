import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { CheckCircle2, XCircle, ArrowLeft, Home, Receipt, Wallet, Hash, Clock } from 'lucide-react';
import { ROUTES } from '@/routes';

export default function PaymentResultPage() {
  const router = useRouter();
  const { paymentOrderId, resultCode, message, methodPayment } = router.query;

  const result = useMemo(() => {
    const success = String(resultCode) === '0';
    return {
      success,
      statusLabel: success ? 'Thanh toán thành công' : 'Thanh toán thất bại',
      message: typeof message === 'string' ? message : '',
      methodPayment: typeof methodPayment === 'string' ? methodPayment : 'MOMO',
    };
  }, [resultCode, message, methodPayment]);

  const timestamp = useMemo(() => {
    const now = new Date();
    return (
      now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
      ' — ' +
      now.toLocaleDateString('vi-VN')
    );
  }, []);

  if (!router.isReady) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-20">
        <div className="rounded-3xl bg-white p-10 shadow-xl text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
          <p className="text-base font-medium text-slate-600">Đang tải kết quả thanh toán…</p>
        </div>
      </main>
    );
  }

  const { success } = result;

  return (
    <main
      className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-20"
      style={{ background: '#f8f9fb' }}
    >
      {/* Ambient orbs */}
      <div
        className="pointer-events-none absolute -top-24 -right-16 h-80 w-80 rounded-full blur-[80px]"
        style={{
          background: success
            ? 'radial-gradient(circle, #1D9E75 0%, transparent 70%)'
            : 'radial-gradient(circle, #D85A30 0%, transparent 70%)',
          opacity: 0.14,
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-12 h-60 w-60 rounded-full blur-[60px]"
        style={{
          background: success
            ? 'radial-gradient(circle, #0F6E56 0%, transparent 70%)'
            : 'radial-gradient(circle, #993C1D 0%, transparent 70%)',
          opacity: 0.12,
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div
          className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_48px_-12px_rgba(0,0,0,0.12)]"
          style={{ animation: 'slideUp 0.45s cubic-bezier(0.16,1,0.3,1) both' }}
        >
          {/* Accent bar */}
          <div
            className="h-1"
            style={{
              background: success
                ? 'linear-gradient(90deg, #1D9E75 0%, #5DCAA5 60%, #9FE1CB 100%)'
                : 'linear-gradient(90deg, #D85A30 0%, #F0997B 60%, #F5C4B3 100%)',
            }}
          />

          <div className="px-8 pb-0 pt-8">
            {/* Icon */}
            <div className="mb-5 flex justify-center">
              <div
                className={`relative flex h-[72px] w-[72px] items-center justify-center rounded-full ${
                  success ? 'bg-emerald-50' : 'bg-orange-50'
                }`}
              >
                {/* Pulse ring */}
                <span
                  className={`absolute inset-[-6px] animate-ping rounded-full border-2 opacity-20 ${
                    success ? 'border-emerald-400' : 'border-orange-400'
                  }`}
                  style={{ animationDuration: '2.4s' }}
                />
                {success ? (
                  <CheckCircle2 className="h-9 w-9 text-emerald-600" strokeWidth={1.75} />
                ) : (
                  <XCircle className="h-9 w-9 text-orange-600" strokeWidth={1.75} />
                )}
              </div>
            </div>

            {/* Heading */}
            <h1
              className="text-center text-[22px] font-bold tracking-tight text-slate-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {result.statusLabel}
            </h1>
            <p className="mt-2 mb-6 text-center text-[13px] leading-relaxed text-slate-500">
              {result.message ||
                (success
                  ? 'Giao dịch của bạn đã được xử lý thành công.'
                  : 'Giao dịch không thể hoàn tất. Vui lòng thử lại.')}
            </p>

            {/* Divider */}
            <div className="h-px bg-slate-100" />

            {/* Detail rows */}
            <div className="divide-y divide-slate-100">
              {[
                {
                  icon: <Receipt className="h-[15px] w-[15px]" />,
                  label: 'Mã đơn hàng',
                  value: paymentOrderId ?? '—',
                },
                {
                  icon: <Wallet className="h-[15px] w-[15px]" />,
                  label: 'Phương thức',
                  value: result.methodPayment,
                },
                {
                  icon: <Hash className="h-[15px] w-[15px]" />,
                  label: 'Mã phản hồi',
                  value: (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        success
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-orange-50 text-orange-800'
                      }`}
                    >
                      {resultCode ?? '—'}
                    </span>
                  ),
                },
                {
                  icon: <Clock className="h-[15px] w-[15px]" />,
                  label: 'Thời gian',
                  value: timestamp,
                },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center justify-between py-[11px]">
                  <span className="flex items-center gap-2 text-[13px] text-slate-400">
                    {icon}
                    {label}
                  </span>
                  <span className="text-[13px] font-medium text-slate-800">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2.5 px-8 pb-8 pt-6">
            <Link
              href={ROUTES.cart}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-[11px] text-[13px] font-medium text-slate-700 transition hover:bg-slate-50 active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Giỏ hàng
            </Link>
            <Link
              href={ROUTES.home}
              className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-[11px] text-[13px] font-medium text-white transition active:scale-95 ${
                success
                  ? 'bg-emerald-900 hover:bg-emerald-800'
                  : 'bg-orange-900 hover:bg-orange-800'
              }`}
              style={{ color: success ? '#9FE1CB' : '#F5C4B3' }}
            >
              Trang chủ
              <Home className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
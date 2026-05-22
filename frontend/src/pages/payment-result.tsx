import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Home,
  Receipt,
  Wallet,
  Hash,
  Clock
} from 'lucide-react'
import { ROUTES } from '@/routes'

type StripeStatusResponse = {
  success: boolean
  message: string
  data: {
    orderId: string
    checkoutSessionId: string
    paymentIntentId: string | null
    amount: number
    paymentStatus: 'UNPAID' | 'PAID' | 'FAILED' | 'REFUNDED'
    createdAt: string
    updatedAt: string
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

export default function PaymentResultPage() {
  const router = useRouter()
  const { paymentOrderId, resultCode, message, methodPayment, provider, session_id } = router.query

  const [stripeLoading, setStripeLoading] = useState(false)
  const [stripeStatus, setStripeStatus] = useState<StripeStatusResponse['data'] | null>(null)
  const [stripeError, setStripeError] = useState('')

  const isStripe = provider === 'stripe' && typeof session_id === 'string'

  useEffect(() => {
    if (!router.isReady || !isStripe) return

    const fetchStripeStatus = async () => {
      try {
        setStripeLoading(true)

        const res = await fetch(`${API_URL}/payment/stripe/status/${session_id}`)
        const json: StripeStatusResponse = await res.json()

        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Cannot get Stripe payment status')
        }

        setStripeStatus(json.data)
      } catch (error) {
        setStripeError(error instanceof Error ? error.message : 'Cannot get Stripe payment status')
      } finally {
        setStripeLoading(false)
      }
    }

    fetchStripeStatus()
  }, [router.isReady, isStripe, session_id])

  const result = useMemo(() => {
    if (isStripe) {
      const success = stripeStatus?.paymentStatus === 'PAID'

      return {
        success,
        statusLabel: stripeLoading
          ? 'Đang kiểm tra thanh toán'
          : success
            ? 'Thanh toán thành công'
            : 'Thanh toán thất bại',
        message: stripeError || stripeStatus?.paymentStatus || '',
        methodPayment: 'STRIPE',
        orderCode: stripeStatus?.orderId || session_id || '—',
        responseCode: stripeStatus?.paymentStatus || '—'
      }
    }

    const success = String(resultCode) === '0'

    return {
      success,
      statusLabel: success ? 'Thanh toán thành công' : 'Thanh toán thất bại',
      message: typeof message === 'string' ? message : '',
      methodPayment: typeof methodPayment === 'string' ? methodPayment : 'MOMO',
      orderCode: paymentOrderId ?? '—',
      responseCode: resultCode ?? '—'
    }
  }, [
    isStripe,
    stripeStatus,
    stripeLoading,
    stripeError,
    session_id,
    resultCode,
    message,
    methodPayment,
    paymentOrderId
  ])

  const timestamp = useMemo(() => {
    const now = new Date()
    return (
      now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
      ' — ' +
      now.toLocaleDateString('vi-VN')
    )
  }, [])

  if (!router.isReady || stripeLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-20">
        <div className="rounded-3xl bg-white p-10 shadow-xl text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
          <p className="text-base font-medium text-slate-600">Đang kiểm tra kết quả thanh toán…</p>
        </div>
      </main>
    )
  }

  const { success } = result

  return (
    <main
      className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-20"
      style={{ background: '#f8f9fb' }}
    >
      <div
        className="pointer-events-none absolute -top-24 -right-16 h-80 w-100 rounded-full blur-[80px]"
        style={{
          background: success
            ? 'radial-gradient(circle, #1D9E75 0%, transparent 70%)'
            : 'radial-gradient(circle, #D85A30 0%, transparent 70%)',
          opacity: 0.14
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_48px_-12px_rgba(0,0,0,0.12)]">
          <div
            className="h-1"
            style={{
              background: success
                ? 'linear-gradient(90deg, #1D9E75 0%, #5DCAA5 60%, #9FE1CB 100%)'
                : 'linear-gradient(90deg, #D85A30 0%, #F0997B 60%, #F5C4B3 100%)'
            }}
          />

          <div className="px-8 pb-0 pt-8">
            <div className="mb-5 flex justify-center">
              <div
                className={`relative flex h-[72px] w-[72px] items-center justify-center rounded-full ${
                  success ? 'bg-emerald-50' : 'bg-orange-50'
                }`}
              >
                {success ? (
                  <CheckCircle2 className="h-9 w-9 text-emerald-600" strokeWidth={1.75} />
                ) : (
                  <XCircle className="h-9 w-9 text-orange-600" strokeWidth={1.75} />
                )}
              </div>
            </div>

            <h1 className="text-center text-[22px] font-bold tracking-tight text-emerald-700">
              {result.statusLabel}
            </h1>

            <p className="mt-2 mb-6 text-center text-[13px] leading-relaxed text-gray-600">
              {success
                ? 'Giao dịch của bạn đã được xử lý thành công.'
                : stripeError || 'Giao dịch không thể hoàn tất. Vui lòng thử lại.'}
            </p>

            <div className="h-px bg-slate-100" />

            <div className="divide-y divide-slate-100">
              {[
                {
                  icon: <Receipt className="h-[15px] w-[15px]" />,
                  label: isStripe ? 'Mã đơn hàng' : 'Mã thanh toán',
                  value: result.orderCode,
                  isLong: true
                },
                {
                  icon: <Wallet className="h-[15px] w-[15px]" />,
                  label: 'Phương thức',
                  value: result.methodPayment
                },
                {
                  icon: <Hash className="h-[15px] w-[15px]" />,
                  label: isStripe ? 'Trạng thái' : 'Mã phản hồi',
                  value: (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        success
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                          : 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'
                      }`}
                    >
                      {result.responseCode}
                    </span>
                  )
                },
                {
                  icon: <Clock className="h-[15px] w-[15px]" />,
                  label: 'Thời gian',
                  value: timestamp
                }
              ].map(({ icon, label, value, isLong }) => (
                <div key={label} className="flex items-start justify-between gap-4 py-[12px]">
                  <span className="flex shrink-0 items-center gap-2 text-[13px] text-slate-400 mt-1">
                    {icon}
                    {label}
                  </span>

                  <span
                    className={`min-w-0 text-right text-[13px] font-semibold text-slate-800 ${
                      isLong
                        ? 'max-w-[220px] break-all rounded-lg bg-slate-50 px-2 py-1 font-mono text-[11px] leading-relaxed text-slate-600'
                        : ''
                    }`}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 px-8 pb-8 pt-6">
            <Link
              href={ROUTES.cart}
              className="group flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white hover:text-slate-950 hover:shadow-md active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
              Giỏ hàng
            </Link>

            <Link
              href={ROUTES.home}
              className={`group flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-semibold text-white shadow-md transition hover:shadow-lg active:scale-95 ${
                success
                  ? 'bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-800 hover:to-teal-700'
                  : 'bg-gradient-to-r from-slate-900 to-slate-700 hover:from-black hover:to-slate-800'
              }`}
            >
              Trang chủ
              <Home className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
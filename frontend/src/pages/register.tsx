import { AuthRedirect } from '@/features/auth/components/AuthRedirect';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  return (
    <AuthRedirect>
      <div className="flex min-h-[calc(100vh-64px)] flex-col bg-surface font-sans selection:bg-primary selection:text-on-primary">
        <main className="flex flex-1 items-center justify-center p-4 md:p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="grid w-full max-w-[1000px] grid-cols-1 overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-2xl md:grid-cols-2"
          >
            {/* Image Side */}
            <div className="relative hidden h-full min-h-[600px] md:block">
              <div className="absolute inset-0 bg-surface-container" />
              <motion.img 
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 1.2, ease: "easeOut" }}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOOdBv9NJM563i6IsvoAMwbokJFYpJ02AWCPLvE9O9Se6HM_MNNBw0qh86AK9DpMI7_G6tCfXcnt0kS8GO090PCSkOp5EigU1Y4YVk0e-EL4XMDWw93e4G3T4PBQnDRUtowpT-jkLsT-QBRY-SFqgLZIUVTSReloHLQxVs9EJms_XQbfgbRwDFYjGDDr_5EA1Uhgz2gwT8U889Yn0gvkJ_OlZCsLu1MYSYNburQCKNbl_Rq4vk_EO0EMpPs4WOZRLAYLU_fHqc50k"
                alt="Premium Sneaker"
                className="absolute inset-0 h-full w-full object-cover mix-blend-multiply"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-8 left-8">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary space-x-4">
                  SK-2026 // SEASONAL DROPS
                </span>
              </div>
            </div>

            {/* Form Side */}
            <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
              <RegisterForm />
            </div>
          </motion.div>
        </main>
      </div>
    </AuthRedirect>
  );
}


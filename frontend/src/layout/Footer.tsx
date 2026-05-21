import Link from 'next/link';
import { Maximize2, Globe, Share2 } from 'lucide-react';
import { ROUTES } from '@/routes';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-outline-variant/20 mt-20">
      <div className="mx-auto px-10 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
          <div className="space-y-6">
            <Link href={ROUTES.home} className="text-headline-md font-bold text-on-surface hover:opacity-85 transition-opacity block">
              ShopKicks
            </Link>
            <p className="text-base text-on-surface-variant max-w-md font-medium leading-relaxed">
              Engineered for those who move faster. Our platform delivers exclusive access to the world's most sought-after drops with unparalleled speed and precision.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center hover:opacity-80 transition-all cursor-pointer">
                <Maximize2 className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center hover:opacity-80 transition-all cursor-pointer">
                <Globe className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center hover:opacity-80 transition-all cursor-pointer">
                <Share2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <h4 className="text-label-lg text-primary">Quick Links</h4>
              <Link href="#" className="text-sm text-on-surface-variant font-medium hover:text-on-surface transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-on-surface-variant font-medium hover:text-on-surface transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-sm text-on-surface-variant font-medium hover:text-on-surface transition-colors">
                Shipping & Returns
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-label-lg text-primary">Support</h4>
              <Link href="#" className="text-sm text-on-surface-variant font-medium hover:text-on-surface transition-colors">
                Help Center
              </Link>
              <Link href="#" className="text-sm text-on-surface-variant font-medium hover:text-on-surface transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-outline-variant/10">
          <p className="text-sm text-on-surface-variant font-medium">
            © 2026 ShopKicks. Engineered for speed and precision.
          </p>
        </div>
      </div>
    </footer>
  );
};


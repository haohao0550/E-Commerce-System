import { Edit2, ArrowRight } from 'lucide-react';

export const ShippingAddress = () => {
  return (
    <section className="bg-white p-8 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-headline-md text-primary">Default Shipping</h3>
          <button type="button" className="text-on-surface-variant hover:text-primary transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-1">
          <p className="text-label-lg text-primary">Home Office</p>
          <p className="text-base text-on-surface-variant font-medium">1248 Kinetic Drive, Suite 400</p>
          <p className="text-base text-on-surface-variant font-medium">Los Angeles, CA 90015</p>
          <p className="text-base text-on-surface-variant font-medium">United States</p>
        </div>
      </div>
      <div className="mt-8 border-t border-outline-variant/30 pt-6">
        <a href="#" className="group text-primary text-label-lg flex items-center gap-2 hover:gap-4 transition-all">
          Manage Addresses
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
};


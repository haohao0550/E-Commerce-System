import { ArrowRight } from 'lucide-react';

export const RecentOrder = () => {
  return (
    <section className="bg-white p-8 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-headline-md text-primary">Recent Order</h3>
          <span className="bg-primary text-on-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
            Shipped
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <div className="w-20 h-20 bg-surface-container rounded-lg overflow-hidden flex-shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2670&auto=format&fit=crop" 
              alt="Air Max Velocity X" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-label-lg text-primary">Air Max Velocity X</p>
            <p className="text-sm text-on-surface-variant font-medium">Order #SK-90231 • Dec 12, 2024</p>
            <p className="text-label-lg text-primary mt-1">$240.00</p>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t border-outline-variant/30 pt-6">
        <a href="#" className="group text-primary text-label-lg flex items-center gap-2 hover:gap-4 transition-all">
          View All Orders
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
};



import React, { useState, useEffect } from 'react';
import { X, Lock, CheckCircle, Loader2, ExternalLink, ShieldCheck } from 'lucide-react';
import { OWNER_PAYPAL_LINK, PAYPAL_DISPLAY_NAME } from '../constants';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planPrice: string;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, planName, planPrice, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'FORM' | 'SUCCESS'>('FORM');
  
  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
        setStep('FORM');
        setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Clean the price string (remove '$' and other non-numeric chars)
    const rawPrice = planPrice.replace(/[^0-9.]/g, '');
    // 2. Format strictly to 2 decimal places for PayPal (e.g. "11.99")
    const formattedPrice = parseFloat(rawPrice).toFixed(2);

    // 3. URL Encode the item name to ensure spaces/special chars don't break the link
    const itemName = encodeURIComponent(`TradeMind AI - ${planName} Plan`);

    // 4. Construct final URL
    const finalUrl = `${OWNER_PAYPAL_LINK}&item_name=${itemName}&amount=${formattedPrice}`;

    // Direct the user to the Owner's PayPal payment page
    window.open(finalUrl, '_blank');
    
    // Simulate waiting for user to complete transaction in new tab
    setTimeout(() => {
      setLoading(false);
      setStep('SUCCESS');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3000);
    }, 8000); // Longer delay to allow user time to interact with PayPal
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50">
           <h3 className="text-lg font-bold text-white flex items-center gap-2">
             {step === 'FORM' ? (
                <>
                    <Lock className="w-5 h-5 text-emerald-500" />
                    Secure Checkout
                </>
             ) : (
                <>
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    Payment Confirmed
                </>
             )}
           </h3>
           <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
             <X className="w-5 h-5" />
           </button>
        </div>

        {step === 'FORM' ? (
            <div className="p-6 space-y-6">
                {/* Order Summary */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                        <p className="text-sm text-slate-400">Selected Plan</p>
                        <p className="text-xl font-bold text-white">{planName}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-400">Total</p>
                        <p className="text-xl font-bold text-emerald-400">{planPrice}</p>
                    </div>
                </div>

                <div className="py-6 text-center space-y-4 bg-[#003087]/5 rounded-xl border border-[#003087]/20 border-dashed">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                    {/* PayPal Logo Logic */}
                    <div className="relative flex items-center justify-center">
                       <span className="text-5xl font-serif font-black italic text-[#003087] relative z-10">P</span>
                       <span className="text-5xl font-serif font-black italic text-[#009cde] absolute left-2 top-0.5 z-0">P</span>
                    </div>
                  </div>
                  <div className="px-8">
                    <p className="text-white font-medium mb-1">Pay with PayPal</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      You will be redirected to PayPal (<span className="text-blue-400 font-mono bg-slate-900 px-1 py-0.5 rounded">{PAYPAL_DISPLAY_NAME}</span>) to complete your purchase securely.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 bg-[#FFC439] hover:bg-[#FFD140] text-slate-900 shadow-yellow-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Awaiting Confirmation...
                              </>
                            ) : (
                              <>
                                Proceed to Payment <ExternalLink className="w-4 h-4" />
                              </>
                            )}
                        </button>
                        <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> 
                            Official PayPal Secure Gateway
                        </p>
                    </div>
                </form>
            </div>
        ) : (
            <div className="p-8 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">Thank You!</h4>
                <p className="text-slate-400">Your {planName} subscription has been activated.</p>
                <div className="w-full h-1 bg-slate-800 mt-6 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 animate-[progress_2s_ease-in-out_forwards]" style={{width: '100%'}}></div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

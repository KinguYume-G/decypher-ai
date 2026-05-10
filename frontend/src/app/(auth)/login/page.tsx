"use client";

import React from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      toast.error("Login failed. Check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const unavailable = () => {
    toast("Use email login for this MVP build.");
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="orb absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-primary/20"></div>
        <div className="orb absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-secondary-container/20"></div>
        <div className="orb absolute top-[40%] right-[10%] w-[300px] h-[300px] rounded-full bg-tertiary-container/10"></div>
      </div>

      {/* Main Authentication Container */}
      <main className="w-full max-w-[480px] px-margin-mobile md:px-0 z-10 flex flex-col items-center">
        <div className="glass-card rounded-xl p-8 md:p-12 relative overflow-hidden w-full">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="mb-4">
              <span className="font-display-xl text-headline-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-tight">
                Decypher AI
              </span>
            </div>
            <p className="font-body-md text-on-surface-variant max-w-[300px]">
              Access the intelligent engine and unleash the power of discovery.
            </p>
          </div>

          {/* Social Login Cluster */}
          <div className="space-y-4 mb-8">
            <button 
              type="button"
              onClick={unavailable}
              className="w-full h-12 flex items-center justify-center gap-3 bg-surface-container-low border border-white/10 rounded-lg hover:bg-white/5 transition-all duration-300 active:scale-[0.98]"
            >
              <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnIMM56lf1QgCpjl3Gqvx-CbZfbN4Fkir0fuCgjasqFuzvGYsMKZjJ3MeJo5CBfzvFqNenvBetsX_yS98FLRcG3XpYQEMiSqNRjh9jD_xu3fNVs6ZoDiHgnCZZJDcGxV9aTnxqDn6w4f9kXF5G1mCV1iVGuw_I55nNiXpkxIDkfTdY7Q4scoUEuWDFYNSBn7g9Su1XR8KfeYJtn5WlUA0euFuTloG_NtlKO6p_tJx3UITXw3B74aE4Rlf1Bkq_bjg6OWt3CuSzsWg"/>
              <span className="font-body-md font-medium text-on-surface">Continue with Google</span>
            </button>
            <button 
              type="button"
              onClick={unavailable}
              className="w-full h-12 flex items-center justify-center gap-3 bg-surface-container-low border border-white/10 rounded-lg hover:bg-white/5 transition-all duration-300 active:scale-[0.98]"
            >
              <svg className="w-5 h-5 fill-on-surface" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.627-5.373-12-12-12"></path></svg>
              <span className="font-body-md font-medium text-on-surface">Continue with GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-8 flex items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="mx-4 font-label-sm text-outline-variant">OR EMAIL</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Authentication Form */}
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="font-label-sm text-primary uppercase tracking-widest block pl-1">Email Address</label>
              <div className="input-glow flex items-center bg-surface-container-lowest border border-white/10 rounded-lg transition-all duration-300">
                <span className="material-symbols-outlined ml-4 text-outline-variant">mail</span>
                <input name="email" className="w-full bg-transparent border-none text-on-surface placeholder:text-outline-variant focus:ring-0 h-12 px-4 font-body-md" placeholder="name@company.ai" type="email" required />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-label-sm text-primary uppercase tracking-widest block pl-1">Password</label>
                <Link href="#" className="font-label-sm text-secondary-fixed-dim hover:text-secondary transition-colors">Forgot?</Link>
              </div>
              <div className="input-glow flex items-center bg-surface-container-lowest border border-white/10 rounded-lg transition-all duration-300">
                <span className="material-symbols-outlined ml-4 text-outline-variant">lock</span>
                <input name="password" className="w-full bg-transparent border-none text-on-surface placeholder:text-outline-variant focus:ring-0 h-12 px-4 font-body-md" placeholder="••••••••" type="password" required />
              </div>
            </div>
            
            {/* Primary Action */}
            <button className="w-full h-14 btn-gradient rounded-xl font-display-xl text-body-lg font-bold text-white transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2" type="submit">
              {loading ? "Authenticating..." : "Authenticate"}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <p className="font-body-md text-on-surface-variant">
              Don't have an account? 
              <Link href="#" className="text-primary font-bold hover:underline decoration-primary/30 underline-offset-4 ml-1">Sign up for access</Link>
            </p>
          </div>

          {/* Subtle AI Pulse Indicator */}
          <div className="absolute bottom-0 left-0 w-full h-1 flex justify-center">
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
          </div>
        </div>

        {/* Decorative Card Image/Graphic Placeholder */}
        <div className="mt-12 relative w-full h-48 rounded-xl overflow-hidden border border-white/10 glass-card">
          <img alt="Deep tech background" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA96nVxkGdPCPaGujbXXEacQ0v2FOSQr5ESud3UvsMrNiuU12fTxdAUxCOH4mdntVwFFGD0wtoockLLmirZYciprYE5xMl0eh16_05g16sScZyuhgtRsAjzT63zFpO7DfeuzwLFmbHHZwZ1lTtaZ7CaZ6UBTaHftsUnxvJu5IumXCYpbEfsPosbXPN7E9RAxKwJzmqZRUR76QV2Wi1Ba9U7H92CrUHkd6ML6DlzNryv1nitv3O2uCRfP71oRPS1TXVHwsPPziqhlVU"/>
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 bg-gradient-to-t from-background to-transparent">
            <p className="font-label-sm text-secondary tracking-widest mb-2">SYSTEM STATUS</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#ffb784] shadow-[0_0_8px_#ffb784]"></div>
              <p className="font-body-md text-on-surface-variant">Engine Ready for Decyphering</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

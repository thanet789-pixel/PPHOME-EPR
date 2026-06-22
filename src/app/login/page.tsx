"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import { Lock, Mail, AlertTriangle, Key } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loading, isFirebase } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    try {
      setError(null);
      setAuthLoading(true);
      await login(email, password);
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่านของคุณ");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    try {
      setError(null);
      setAuthLoading(true);
      // Auto-populate inputs for dynamic visual feedback
      setEmail("demo@pphome.com");
      setPassword("password123");
      await login("demo@pphome.com", "password123");
      router.push("/");
    } catch (err: any) {
      setError(err.message || "ไม่สามารถเข้าสู่ระบบแบบด่วนได้");
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <span className="text-sm font-semibold text-zinc-400">กำลังเชื่อมต่อระบบความปลอดภัย...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="relative flex min-h-screen w-screen items-center justify-center px-4 overflow-hidden">
      {/* Dynamic structural background lines */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 h-[350px] w-[350px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Glass panel wrapper */}
        <div className="glass-panel rounded-3xl p-8 shadow-2xl flex flex-col gap-6">
          
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-extrabold text-2xl shadow-xl shadow-indigo-500/25">
              PP
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-4">
              PP HOME ERP
            </h2>
            <p className="text-sm text-zinc-400">
              ระบบจัดการผู้รับเหมาเฟอร์นิเจอร์ & งานบิวท์อินภายใน
            </p>
          </div>

          {/* Connection Mode Announcement */}
          <div className={`rounded-xl p-3 border text-xs text-center font-medium ${
            isFirebase 
              ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/15" 
              : "bg-amber-500/5 text-amber-400 border-amber-500/15"
          }`}>
            {isFirebase 
              ? "⚡ LIVE MODE: เชื่อมต่อและยืนยันตัวตนผ่านระบบ Firebase" 
              : "🛠️ SANDBOX MODE: ใช้งานบนระบบจำลอง (Demo Local Presets)"
            }
          </div>

          {/* Form validation alert */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-400">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">ที่อยู่อีเมล</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-zinc-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="เช่น admin@pphome.com"
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm glass-input"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">รหัสผ่าน</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-zinc-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm glass-input"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 active:scale-98 transition-all disabled:opacity-50"
            >
              {authLoading ? "กำลังตรวจสอบข้อมูลสิทธิ์..." : "เข้าสู่ระบบ ERP"}
            </button>
          </form>

          {/* Quick Sandbox Login tool */}
          {!isFirebase && (
            <div className="border-t border-zinc-900 pt-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span className="h-px bg-zinc-900 w-1/4" />
                <span>สำหรับทดลองระบบ</span>
                <span className="h-px bg-zinc-900 w-1/4" />
              </div>
              
              <button
                type="button"
                onClick={handleQuickLogin}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 py-3 text-sm font-semibold text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/40 active:scale-98 transition-all"
              >
                <Key className="h-4 w-4" />
                <span>เข้าสู่ระบบด้วยบัญชีเดโมแบบคลิกเดียว</span>
              </button>
              <p className="text-[10px] text-zinc-500 text-center">
                บัญชีเดโม: <code className="text-indigo-400">demo@pphome.com</code> / รหัสผ่าน: <code className="text-indigo-400">password123</code>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

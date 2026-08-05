import React, { useState, useEffect } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { firebaseAuth, googleAuthProvider } from '../lib/firebaseClient';
import { Utensils, ShieldCheck, ArrowRight, AlertCircle, LogOut, Building2, KeyRound } from 'lucide-react';

interface PartnerLoginProps {
  onNavigate: (path: string) => void;
}

export const PartnerLogin: React.FC<PartnerLoginProps> = ({ onNavigate }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [checkingMember, setCheckingMember] = useState<boolean>(false);
  const [memberDocExists, setMemberDocExists] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Claim form states
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('osteria-cantina');
  const [claimCode, setClaimCode] = useState<string>('');
  const [claiming, setClaiming] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await checkMembership(currentUser);
      } else {
        setLoading(false);
        setMemberDocExists(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const checkMembership = async (currentUser: User) => {
    setCheckingMember(true);
    setErrorMsg(null);
    try {
      const idToken = await currentUser.getIdToken();
      const res = await fetch('/api/partner/me', {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setMemberDocExists(false);
        return;
      }

      const data = await res.json();
      if (res.ok && (data.success || data.ok) && data.member && data.member.active) {
        setMemberDocExists(true);
        onNavigate('/partner/dashboard');
        return;
      }
      setMemberDocExists(false);
    } catch (err) {
      console.error('[Check Membership Error]', err);
      setMemberDocExists(false);
    } finally {
      setCheckingMember(false);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await signInWithPopup(firebaseAuth, googleAuthProvider);
    } catch (err: any) {
      console.error('[Google Sign In Error]', err);
      setErrorMsg(err.message || 'Не удалось войти через Google. Попробуйте ещё раз.');
      setLoading(false);
    }
  };

  const handleClaimAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!claimCode.trim()) {
      setErrorMsg('Введите код подключения ресторана');
      return;
    }

    setClaiming(true);
    setErrorMsg(null);

    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/partner/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          restaurantId: selectedRestaurantId,
          claimCode: claimCode.trim(),
        }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setErrorMsg('Сервер вернул некорректный ответ');
        return;
      }

      const data = await res.json();
      if (res.ok && (data.success || data.ok)) {
        onNavigate('/partner/dashboard');
      } else {
        setErrorMsg(data.message || data.error || 'Не удалось подключить ресторан.');
      }
    } catch (err) {
      console.error('[Claim Error]', err);
      setErrorMsg('Ошибка соединения с сервером.');
    } finally {
      setClaiming(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(firebaseAuth);
    setUser(null);
    setMemberDocExists(false);
  };

  return (
    <div className="min-h-screen bg-[#D9D0C2] text-[#211E19] flex flex-col justify-between font-['Geologica',sans-serif] px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Top Header Logo */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between pb-6 border-b border-[#BFB3A2]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#4F5328] flex items-center justify-center text-[#FFF4B8] shadow-md">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-[#4F5328] block leading-none">
              Tavoo
            </span>
            <span className="text-[11px] font-semibold text-[#707437] uppercase tracking-wider">
              Кабинет ресторана
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4B8] border border-[#BFB3A2] text-[#4F5328] text-xs font-bold shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-[#4F5328]" />
          <span>Защищённый вход</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-xl mx-auto w-full my-auto py-8">
        <div className="bg-[#FFFDF7] border-2 border-[#BFB3A2] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4F5328] tracking-tight">
              Кабинет ресторана
            </h1>
            <p className="text-sm text-[#6B645A] font-medium">
              Управление бронированиями Tavoo
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-[#FDF2F2] border border-[#F8B4B4] text-[#9B1C1C] text-xs font-medium flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-[#C81E1E] shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* State 1: Loading initial state */}
          {loading || checkingMember ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#4F5328] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-[#6B645A] font-semibold">Загрузка данных авторизации...</p>
            </div>
          ) : !user ? (
            /* State 2: Unauthenticated - Google Sign-In */
            <div className="space-y-6 pt-2">
              <div className="p-4 rounded-2xl bg-[#F2EBDD] border border-[#BFB3A2]/60 text-xs text-[#6B645A] leading-relaxed">
                Авторизуйтесь через сервисный аккаунт Google для доступа к панели управления бронированиями вашего заведения.
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-4 px-6 rounded-2xl bg-[#FFFDF7] border-2 border-[#BFB3A2] hover:border-[#4F5328] text-[#211E19] text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-3 min-h-[52px]"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Войти через Google</span>
              </button>
            </div>
          ) : !memberDocExists ? (
            /* State 3: Authenticated Google User but Not Claimed Yet */
            <form onSubmit={handleClaimAccount} className="space-y-5 pt-2">
              <div className="p-3.5 rounded-2xl bg-[#FFF4B8] border border-[#BFB3A2] text-xs text-[#4F5328] space-y-1">
                <p className="font-bold">Вы авторизованы как: {user.email}</p>
                <p>Ваш аккаунт ещё не привязан к ресторану. Выберите ваше заведение и введите код подключения.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#4F5328] uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Ресторан пилота</span>
                </label>
                <select
                  value={selectedRestaurantId}
                  onChange={(e) => setSelectedRestaurantId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[#BFB3A2] bg-white text-sm font-semibold text-[#211E19] focus:outline-none focus:border-[#4F5328] transition-colors"
                >
                  <option value="osteria-cantina">Osteria Cantina (ул. Революционная, 14)</option>
                  <option value="mornings-and-beans">Mornings & Beans (пр-т Независимости, 37)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#4F5328] uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Код подключения (Partner Claim Code)</span>
                </label>
                <input
                  type="password"
                  value={claimCode}
                  onChange={(e) => setClaimCode(e.target.value)}
                  placeholder="Введите секретный код"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[#BFB3A2] bg-white text-sm font-medium text-[#211E19] focus:outline-none focus:border-[#4F5328] transition-colors placeholder:text-[#9C9488]"
                />
              </div>

              <button
                type="submit"
                disabled={claiming}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#4F5328] hover:bg-[#3D401F] text-[#FFF4B8] text-sm font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {claiming ? (
                  <span>Подключение...</span>
                ) : (
                  <>
                    <span>Подключить аккаунт</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full py-2.5 px-4 text-xs font-semibold text-[#6B645A] hover:text-[#211E19] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Сменить аккаунт Google</span>
              </button>
            </form>
          ) : null}

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-xl mx-auto w-full pt-6 border-t border-[#BFB3A2] text-center text-xs text-[#6B645A]">
        Tavoo Partner Platform &copy; 2026. Облачная система управления бронированиями.
      </footer>

    </div>
  );
};

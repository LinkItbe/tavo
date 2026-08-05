import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { firebaseAuth } from '../lib/firebaseClient';
import { Utensils, AlertTriangle, LogOut } from 'lucide-react';

export interface PartnerMemberData {
  uid: string;
  email: string;
  restaurantId: string;
  role: 'owner' | 'manager' | 'host';
  active: boolean;
}

interface PartnerAuthGuardProps {
  children: (member: PartnerMemberData) => React.ReactNode;
  onNavigate: (path: string) => void;
}

export const PartnerAuthGuard: React.FC<PartnerAuthGuardProps> = ({ children, onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<PartnerMemberData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
        setMember(null);
        return;
      }

      try {
        const idToken = await currentUser.getIdToken();
        const res = await fetch('/api/partner/me', {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          setErrorMsg('Сервер вернул некорректный ответ.');
          setMember(null);
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if ((data.success || data.ok) && data.member && data.member.active) {
            setMember(data.member);
            setErrorMsg(null);
          } else {
            setErrorMsg('У вас нет активного доступа к кабинету ресторана.');
            setMember(null);
          }
        } else {
          const data = await res.json().catch(() => ({}));
          setErrorMsg(data.message || data.error || 'У вас нет активного доступа к ресторану.');
          setMember(null);
        }
      } catch (err) {
        console.error('[PartnerAuthGuard Error]', err);
        setErrorMsg('Ошибка проверки прав доступа.');
        setMember(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D9D0C2] flex items-center justify-center p-6 text-[#211E19] font-['Geologica',sans-serif]">
        <div className="bg-[#FFFDF7] border border-[#BFB3A2] rounded-3xl p-8 max-w-md w-full shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#4F5328]/10 text-[#4F5328] flex items-center justify-center mx-auto animate-pulse">
            <Utensils className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-[#6B645A]">Проверка авторизации партнёра...</p>
          <div className="h-2 w-full bg-[#E8DFC8] rounded-full overflow-hidden">
            <div className="h-full bg-[#4F5328] w-2/3 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#D9D0C2] flex items-center justify-center p-6 text-[#211E19] font-['Geologica',sans-serif]">
        <div className="bg-[#FFFDF7] border border-[#BFB3A2] rounded-3xl p-8 max-w-md w-full shadow-xl text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-[#A64F2C]/10 text-[#A64F2C] flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#211E19]">Авторизация обязательна</h2>
            <p className="text-xs text-[#6B645A]">Войдите в систему через Google, чтобы открыть кабинет ресторана.</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/partner/login')}
            className="w-full py-3 px-6 rounded-2xl bg-[#4F5328] text-[#FFF4B8] font-bold text-sm shadow-md hover:bg-[#3D401F] transition-all cursor-pointer"
          >
            Перейти к входу
          </button>
        </div>
      </div>
    );
  }

  if (errorMsg || !member) {
    return (
      <div className="min-h-screen bg-[#D9D0C2] flex items-center justify-center p-6 text-[#211E19] font-['Geologica',sans-serif]">
        <div className="bg-[#FFFDF7] border border-[#BFB3A2] rounded-3xl p-8 max-w-md w-full shadow-xl text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-[#A64F2C]/10 text-[#A64F2C] flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#211E19]">Доступ ограничен</h2>
            <p className="text-xs text-[#6B645A]">{errorMsg || 'Ваш аккаунт ещё не подключён ни к одному ресторану.'}</p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/partner/login')}
              className="w-full py-3 px-6 rounded-2xl bg-[#4F5328] text-[#FFF4B8] font-bold text-sm shadow-md hover:bg-[#3D401F] transition-all cursor-pointer"
            >
              Подключить аккаунт
            </button>
            <button
              type="button"
              onClick={async () => {
                await signOut(firebaseAuth);
                onNavigate('/partner/login');
              }}
              className="w-full py-2.5 px-6 rounded-2xl border border-[#BFB3A2] text-[#6B645A] font-semibold text-xs hover:bg-[#F2EBDD] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Выйти из Google</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children(member)}</>;
};

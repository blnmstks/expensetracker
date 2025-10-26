import { useState, useEffect } from 'react';
import { Wallet } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { authAPI } from '../services/api';
import axiosInstance from '../lib/axios';

interface LoginProps {
  onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error('Заполните все поля');
      return;
    }

    try {
      setLoginLoading(true);
      
      const response = await authAPI.login(loginEmail, loginPassword);

      if (response?.success) {
        const token =
        response?.data?.meta?.session_token

        const isAuth = response.data?.meta?.is_authenticated ?? true;
        if (isAuth) {
          toast.success('Вход выполнен успешно!');
          onLoginSuccess();
          localStorage.setItem('auth_token', token);
          
          try {
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (e) {
          console.error('Error setting auth header:', e);
        }

          return;
        }
      }
      // Fallback
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.errors) {
          // allauth headless error format
          const errorMessages = errorData.errors.map((e: any) => e.message).join(', ');
          toast.error(errorMessages);
        } else if (errorData.message) {
          toast.error(errorData.message);
        } else {
          toast.error('Ошибка входа. Проверьте email и пароль.');
        }
      } else {
        toast.error('Ошибка подключения к серверу');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerEmail || !registerPassword || !registerPasswordConfirm) {
      toast.error('Заполните все поля');
      return;
    }

    if (registerPassword !== registerPasswordConfirm) {
      toast.error('Пароли не совпадают');
      return;
    }

    if (registerPassword.length < 8) {
      toast.error('Пароль должен содержать минимум 8 символов');
      return;
    }

    try {
      setRegisterLoading(true);
      const response = await authAPI.register(registerEmail, registerPassword);

      if (response?.success) {
        toast.success('Регистрация успешна! Войдите в систему.');
        setActiveTab('login');
        setLoginEmail(registerEmail);
        setLoginPassword(registerPassword);
        return;
      }

    } catch (error: any) {
      console.error('Register error:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.errors) {
          // allauth headless error format
          const errorMessages = errorData.errors.map((e: any) => e.message).join(', ');
          toast.error(errorMessages);
        } else if (errorData.email) {
          toast.error(errorData.email[0]);
        } else if (errorData.password1) {
          toast.error(errorData.password1[0]);
        } else {
          toast.error('Ошибка регистрации');
        }
      } else {
        toast.error('Ошибка подключения к серверу');
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await authAPI.googleStart();
      if (response.redirect_url) {
        window.location.href = response.redirect_url;
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Ошибка входа через Google');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-md">
        
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <Wallet className="w-12 h-12 text-emerald-600 mr-3" />
          <h1 className="text-3xl font-bold text-neutral-900">Трекер расходов</h1>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Вход</TabsTrigger>
            <TabsTrigger value="register">Регистрация</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Вход в систему</CardTitle>
                <CardDescription>
                  Введите email и пароль для входа
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={loginLoading}
                      autoComplete="email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Пароль</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={loginLoading}
                      autoComplete="current-password"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-emerald-600 hover:bg-emerald-700" 
                    disabled={loginLoading}
                  >
                    {loginLoading ? 'Вход...' : 'Войти'}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-neutral-500">
                        Или
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleLogin}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Войти через Google
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Регистрация</CardTitle>
                <CardDescription>
                  Создайте новый аккаунт
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      disabled={registerLoading}
                      autoComplete="email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Пароль</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Минимум 8 символов"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      disabled={registerLoading}
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password-confirm">Подтвердите пароль</Label>
                    <Input
                      id="register-password-confirm"
                      type="password"
                      placeholder="Повторите пароль"
                      value={registerPasswordConfirm}
                      onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                      disabled={registerLoading}
                      autoComplete="new-password"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={registerLoading}
                  >
                    {registerLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

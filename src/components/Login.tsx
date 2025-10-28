import { useState } from 'react';
import { Form, Input, Button, Tabs, Card, message, Typography } from "antd";
import { MailOutlined, LockOutlined, GoogleOutlined, WalletOutlined } from '@ant-design/icons';
import { authAPI } from '../services/api';
import axiosInstance from '../lib/axios';

const { Title, Text } = Typography;

interface LoginProps {
  onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();


  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      setLoginLoading(true);
      
      const response = await authAPI.login(values.email, values.password);

      if (response?.success) {
        const token = response?.data?.meta?.session_token;
        const isAuth = response.data?.meta?.is_authenticated ?? true;
        
        if (isAuth) {
          message.success('Вход выполнен успешно!');
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
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.errors) {
          const errorMessages = errorData.errors.map((e: any) => e.message).join(', ');
          message.error(errorMessages);
        } else if (errorData.message) {
          message.error(errorData.message);
        } else {
          message.error('Ошибка входа. Проверьте email и пароль.');
        }
      } else {
        message.error('Ошибка подключения к серверу');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (values: { email: string; password: string; passwordConfirm: string }) => {
    if (values.password !== values.passwordConfirm) {
      message.error('Пароли не совпадают');
      return;
    }

    if (values.password.length < 8) {
      message.error('Пароль должен содержать минимум 8 символов');
      return;
    }

    try {
      setRegisterLoading(true);
      const response = await authAPI.register(values.email, values.password);

      if (response?.success) {
        message.success('Регистрация успешна! Войдите в систему.');
        setActiveTab('login');
        loginForm.setFieldsValue({
          email: values.email,
          password: values.password
        });
        return;
      }

    } catch (error: any) {
      console.error('Register error:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.errors) {
          const errorMessages = errorData.errors.map((e: any) => e.message).join(', ');
          message.error(errorMessages);
        } else if (errorData.email) {
          message.error(errorData.email[0]);
        } else if (errorData.password1) {
          message.error(errorData.password1[0]);
        } else {
          message.error('Ошибка регистрации');
        }
      } else {
        message.error('Ошибка подключения к серверу');
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
      message.error('Ошибка входа через Google');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '450px' }}>
        
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
          <WalletOutlined style={{ fontSize: '48px', color: '#2078F3', marginRight: '12px' }} />
          <Title level={2} style={{ margin: 0 }}>Трекер расходов</Title>
        </div>

        <Card>
          <Tabs 
            activeKey={activeTab} 
            onChange={(key) => setActiveTab(key as 'login' | 'register')}
            items={[
              {
                key: 'login',
                label: 'Вход',
                children: (
                  <>
                    <Title level={4}>Вход в систему</Title>
                    <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
                      Введите email и пароль для входа
                    </Text>
                    
                    <Form
                      form={loginForm}
                      onFinish={handleLogin}
                      layout="vertical"
                      autoComplete="off"
                    >
                      <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                          { required: true, message: 'Введите email' },
                          { type: 'email', message: 'Введите корректный email' }
                        ]}
                      >
                        <Input 
                          prefix={<MailOutlined />}
                          placeholder="your@email.com"
                          size="large"
                          autoComplete="email"
                        />
                      </Form.Item>

                      <Form.Item
                        name="password"
                        label="Пароль"
                        rules={[{ required: true, message: 'Введите пароль' }]}
                      >
                        <Input.Password
                          prefix={<LockOutlined />}
                          placeholder="••••••••"
                          size="large"
                          autoComplete="current-password"
                        />
                      </Form.Item>

                      <Form.Item>
                        <Button 
                          type="primary"
                          htmlType="submit"
                          size="large"
                          loading={loginLoading}
                          block
                          style={{ backgroundColor: '#2078F3', borderColor: '#2078F3' }}
                        >
                          Войти
                        </Button>
                      </Form.Item>

                      <div style={{ position: 'relative', textAlign: 'center', margin: '24px 0' }}>
                        <div style={{ borderTop: '1px solid #d9d9d9' }} />
                        <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '0 8px', color: '#999', fontSize: '12px' }}>
                          ИЛИ
                        </span>
                      </div>

                      <Button
                        icon={<GoogleOutlined />}
                        size="large"
                        block
                        onClick={handleGoogleLogin}
                      >
                        Войти через Google
                      </Button>
                    </Form>
                  </>
                )
              },
              {
                key: 'register',
                label: 'Регистрация',
                children: (
                  <>
                    <Title level={4}>Регистрация</Title>
                    <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
                      Создайте новый аккаунт
                    </Text>
                    
                    <Form
                      form={registerForm}
                      onFinish={handleRegister}
                      layout="vertical"
                      autoComplete="off"
                    >
                      <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                          { required: true, message: 'Введите email' },
                          { type: 'email', message: 'Введите корректный email' }
                        ]}
                      >
                        <Input 
                          prefix={<MailOutlined />}
                          placeholder="your@email.com"
                          size="large"
                          autoComplete="email"
                        />
                      </Form.Item>

                      <Form.Item
                        name="password"
                        label="Пароль"
                        rules={[
                          { required: true, message: 'Введите пароль' },
                          { min: 8, message: 'Минимум 8 символов' }
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined />}
                          placeholder="Минимум 8 символов"
                          size="large"
                          autoComplete="new-password"
                        />
                      </Form.Item>

                      <Form.Item
                        name="passwordConfirm"
                        label="Подтвердите пароль"
                        dependencies={['password']}
                        rules={[
                          { required: true, message: 'Подтвердите пароль' },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error('Пароли не совпадают'));
                            },
                          }),
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined />}
                          placeholder="Повторите пароль"
                          size="large"
                          autoComplete="new-password"
                        />
                      </Form.Item>

                      <Form.Item>
                        <Button 
                          type="primary"
                          htmlType="submit"
                          size="large"
                          loading={registerLoading}
                          block
                          style={{ backgroundColor: '#2078F3', borderColor: '#2078F3' }}
                        >
                          Зарегистрироваться
                        </Button>
                      </Form.Item>
                    </Form>
                  </>
                )
              }
            ]}
          />
        </Card>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Button, Card, Space, Typography, Divider, Alert } from 'antd';
import { expenseAPI, categoryAPI, currencyAPI } from '../services/api';

const { Title, Text } = Typography;

export function TestAPIPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<any>({});
  const [errors, setErrors] = useState<any>({});

  const testExpenses = async () => {
    setLoading('expenses');
    setErrors({ ...errors, expenses: null });
    try {
      console.log('🧪 Testing expenseAPI.getAll()...');
      const data = await expenseAPI.getAll();
      console.log('✅ Expenses data:', data);
      setResults({ ...results, expenses: data });
    } catch (error: any) {
      console.error('❌ Expenses error:', error);
      setErrors({ ...errors, expenses: error.message });
    } finally {
      setLoading(null);
    }
  };

  const testCategories = async () => {
    setLoading('categories');
    setErrors({ ...errors, categories: null });
    try {
      console.log('🧪 Testing categoryAPI.getAll()...');
      const data = await categoryAPI.getAll();
      console.log('✅ Categories data:', data);
      setResults({ ...results, categories: data });
    } catch (error: any) {
      console.error('❌ Categories error:', error);
      setErrors({ ...errors, categories: error.message });
    } finally {
      setLoading(null);
    }
  };

  const testCurrencies = async () => {
    setLoading('currencies');
    setErrors({ ...errors, currencies: null });
    try {
      console.log('🧪 Testing currencyAPI.getAll()...');
      const data = await currencyAPI.getAll();
      console.log('✅ Currencies data:', data);
      setResults({ ...results, currencies: data });
    } catch (error: any) {
      console.error('❌ Currencies error:', error);
      setErrors({ ...errors, currencies: error.message });
    } finally {
      setLoading(null);
    }
  };

  const testDefaultCurrency = async () => {
    setLoading('defaultCurrency');
    setErrors({ ...errors, defaultCurrency: null });
    try {
      console.log('🧪 Testing currencyAPI.getDefaultCurrency()...');
      const data = await currencyAPI.getDefaultCurrency();
      console.log('✅ Default Currency data:', data);
      setResults({ ...results, defaultCurrency: data });
    } catch (error: any) {
      console.error('❌ Default Currency error:', error);
      setErrors({ ...errors, defaultCurrency: error.message });
    } finally {
      setLoading(null);
    }
  };

  const testAll = async () => {
    await testExpenses();
    await testCategories();
    await testCurrencies();
    await testDefaultCurrency();
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>🧪 API Testing Page</Title>
      
      <Card title="Auth Info" style={{ marginBottom: '16px' }}>
        <Text>Token: {localStorage.getItem('auth_token') ? '✅ Present' : '❌ Missing'}</Text>
      </Card>

      <Card title="Test API Endpoints" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space wrap>
            <Button 
              type="primary" 
              onClick={testExpenses} 
              loading={loading === 'expenses'}
            >
              Test Expenses
            </Button>
            <Button 
              type="primary" 
              onClick={testCategories} 
              loading={loading === 'categories'}
            >
              Test Categories
            </Button>
            <Button 
              type="primary" 
              onClick={testCurrencies} 
              loading={loading === 'currencies'}
            >
              Test Currencies
            </Button>
            <Button 
              type="primary" 
              onClick={testDefaultCurrency} 
              loading={loading === 'defaultCurrency'}
            >
              Test Default Currency
            </Button>
            <Button 
              type="default" 
              onClick={testAll}
              disabled={loading !== null}
            >
              Test All
            </Button>
          </Space>
        </Space>
      </Card>

      <Divider />

      {/* Results */}
      {Object.keys(results).length > 0 && (
        <Card title="✅ Results" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {Object.entries(results).map(([key, value]) => (
              <div key={key}>
                <Text strong>{key}:</Text>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: '12px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  {JSON.stringify(value, null, 2)}
                </pre>
              </div>
            ))}
          </Space>
        </Card>
      )}

      {/* Errors */}
      {Object.keys(errors).filter(k => errors[k]).length > 0 && (
        <Card title="❌ Errors" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {Object.entries(errors).filter(([_, v]) => v).map(([key, value]) => (
              <Alert
                key={key}
                message={key}
                description={String(value)}
                type="error"
                showIcon
              />
            ))}
          </Space>
        </Card>
      )}

      <Alert
        message="Check Browser Console"
        description="Open DevTools Console (F12) to see detailed request/response logs"
        type="info"
        showIcon
      />
    </div>
  );
}

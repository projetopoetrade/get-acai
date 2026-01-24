'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function Teste() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products')
      .then((res) => {
        console.log('Produtos:', res.data);
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h1>Produtos do Backend</h1>
      <pre>{JSON.stringify(products, null, 2)}</pre>
    </div>
  );
}

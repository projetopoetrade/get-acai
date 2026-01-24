// src/services/address.ts
import  api  from '@/lib/api';

export interface Address {
  id: string;
  label: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  reference?: string;
  isDefault: boolean;
}

export interface CreateAddressDTO {
  label: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  reference?: string;
  isDefault?: boolean;
}

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string; // Cidade
  uf: string;
  ibge: string;
}

export const addressService = {
  // GET /addresses/cep/:cep
  getByCep: async (cep: string): Promise<ViaCepResponse> => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) throw new Error('CEP inválido');
    const response = await api.get<ViaCepResponse>(`/addresses/cep/${cleanCep}`);
    return response.data;
  },

  // GET /addresses
  getMyAddresses: async (): Promise<Address[]> => {
    const response = await api.get<Address[]>('/addresses');
    return response.data;
  },

  // POST /addresses
  create: async (data: CreateAddressDTO): Promise<Address> => {
    const response = await api.post<Address>('/addresses', data);
    return response.data;
  },

  // DELETE /addresses/:id
  delete: async (id: string): Promise<void> => {
    await api.delete(`/addresses/${id}`);
  }
};
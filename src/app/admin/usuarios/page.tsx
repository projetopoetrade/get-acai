'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Shield, 
  ShieldAlert, 
  User as UserIcon,
  MoreVertical,
  Loader2
} from 'lucide-react';
import { usersService, User } from '@/services/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { AdminGuard } from '@/components/admin/admin-guard';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      const data = await usersService.getAll();
      setUsers(data);
    } catch (error) {
      toast.error('Erro ao carregar lista de usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleUpdate = async (userId: string, newRole: 'admin' | 'user') => {
    setUpdatingId(userId);
    try {
      await usersService.updateRole(userId, newRole);
      
      // Atualiza estado local para refletir a mudança instantaneamente
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      
      toast.success(`Cargo atualizado para ${newRole}!`);
    } catch (error) {
      toast.error('Não foi possível alterar o cargo.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminGuard>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl dark:bg-indigo-900/30 dark:text-indigo-300">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Gerenciar Usuários</h1>
                <p className="text-sm text-neutral-500">Controle de acesso e permissões</p>
              </div>
            </div>

            {/* Barra de Pesquisa */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <Input 
                placeholder="Buscar por nome ou email..." 
                className="pl-9 bg-white dark:bg-neutral-900 border-neutral-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Lista de Usuários */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
                <p>Carregando usuários...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-20 text-neutral-500">
                <p>Nenhum usuário encontrado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-neutral-600 dark:text-neutral-300">Usuário</th>
                      <th className="px-6 py-4 font-semibold text-neutral-600 dark:text-neutral-300">Email</th>
                      <th className="px-6 py-4 font-semibold text-neutral-600 dark:text-neutral-300">Cargo</th>
                      <th className="px-6 py-4 font-semibold text-neutral-600 dark:text-neutral-300 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 font-bold text-xs">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-neutral-900 dark:text-neutral-100">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-neutral-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4">
                          {user.role === 'admin' ? (
                            <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none dark:bg-indigo-900/30 dark:text-indigo-300 gap-1">
                              <Shield className="h-3 w-3" /> Admin
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-neutral-500 gap-1 border-neutral-200">
                              <UserIcon className="h-3 w-3" /> Cliente
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                disabled={updatingId === user.id}
                                className="h-8 w-8 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                              >
                                {updatingId === user.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreVertical className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuLabel>Alterar Cargo</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleRoleUpdate(user.id, 'admin')}
                                disabled={user.role === 'admin'}
                                className="gap-2 text-indigo-600 focus:text-indigo-700 focus:bg-indigo-50 cursor-pointer"
                              >
                                <Shield className="h-4 w-4" /> Tornar Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleRoleUpdate(user.id, 'user')}
                                disabled={user.role === 'user'}
                                className="gap-2 text-neutral-600 focus:text-neutral-900 focus:bg-neutral-50 cursor-pointer"
                              >
                                <UserIcon className="h-4 w-4" /> Tornar Cliente
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
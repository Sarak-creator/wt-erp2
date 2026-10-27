'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Employee } from '@/types/database';
import { formatKHR } from '@/lib/utils';
import {
  UserCheck,
  Plus,
  Search,
  Phone,
  Mail,
  DollarSign,
  Briefcase,
  Edit2,
  Trash2,
  Calendar,
  X,
  RefreshCw,
  Truck,
} from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';

export default function EmployeesView() {
  const { lang, employees, addEmployee, updateEmployee, deleteEmployee, fetchFromSupabase, isSyncing } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState<Employee['role']>('driver');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [salaryType, setSalaryType] = useState<Employee['salary_type']>('monthly');
  const [baseSalary, setBaseSalary] = useState(250);
  const [commissionRate, setCommissionRate] = useState(0.05);
  const [status, setStatus] = useState<Employee['status']>('active');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const openAddModal = () => {
    setEditingEmployee(null);
    setName('');
    setRole('driver');
    setPhone('');
    setEmail('');
    setSalaryType('monthly');
    setBaseSalary(250);
    setCommissionRate(0.05);
    setStatus('active');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setRole(emp.role);
    setPhone(emp.phone || '');
    setEmail(emp.email || '');
    setSalaryType(emp.salary_type);
    setBaseSalary(emp.base_salary);
    setCommissionRate(emp.commission_rate);
    setStatus(emp.status);
    setNotes(emp.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (editingEmployee) {
      await updateEmployee(editingEmployee.id, {
        name,
        role,
        phone,
        email,
        salary_type: salaryType,
        base_salary: Number(baseSalary),
        commission_rate: Number(commissionRate),
        status,
        notes,
      });
    } else {
      await addEmployee({
        name,
        role,
        phone,
        email,
        salary_type: salaryType,
        base_salary: Number(baseSalary),
        commission_rate: Number(commissionRate),
        status,
        notes,
      });
    }

    setIsSaving(false);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, empName: string) => {
    const confirmMsg =
      lang === 'km'
        ? `តើលោកអ្នកប្រាកដជាចង់លុបបុគ្គលិក "${empName}" នេះមែនទេ?`
        : `Are you sure you want to delete employee "${empName}"?`;
    if (window.confirm(confirmMsg)) {
      await deleteEmployee(id);
    }
  };

  const filtered = employees.filter((emp) => {
    const matchesRole = filterRole === 'all' || emp.role === filterRole;
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.phone && emp.phone.includes(searchTerm));
    return matchesRole && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
            {lang === 'km' ? 'ការគ្រប់គ្រងបុគ្គលិក & កម្លាំងពលកម្ម' : 'Employee & Staff Management'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === 'km'
              ? 'គ្រប់គ្រងអ្នកបើកបរ អ្នកបញ្ជាម៉ាស៊ីនផលិត បេឡាករ និងការទូទាត់ប្រាក់បៀវត្សរ៍'
              : 'Manage delivery drivers, plant operators, cashiers, salaries, and commissions'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchFromSupabase()}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`} />
            {lang === 'km' ? 'ទាញទិន្នន័យថ្មី' : 'Sync Supabase'}
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            {lang === 'km' ? 'បន្ថែមបុគ្គលិកថ្មី' : 'Add New Staff'}
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={lang === 'km' ? 'ស្វែងរកឈ្មោះ ឬលេខទូរស័ព្ទ...' : 'Search staff name or phone...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {[
            { id: 'all', label: lang === 'km' ? 'ទាំងអស់' : 'All' },
            { id: 'driver', label: lang === 'km' ? 'អ្នកបើកបរ' : 'Drivers' },
            { id: 'operator', label: lang === 'km' ? 'អ្នកបញ្ជាម៉ាស៊ីន' : 'Operators' },
            { id: 'cashier', label: lang === 'km' ? 'បេឡាករ' : 'Cashiers' },
            { id: 'manager', label: lang === 'km' ? 'អ្នកគ្រប់គ្រង' : 'Managers' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterRole(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filterRole === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((emp) => (
          <div
            key={emp.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  {emp.role}
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1.5">{emp.name}</h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEditModal(emp)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                  title={lang === 'km' ? 'កែប្រែ' : 'Edit'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(emp.id, emp.name)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title={lang === 'km' ? 'លុប' : 'Delete'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              {emp.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{emp.phone}</span>
                </div>
              )}
              {emp.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{emp.email}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block">{lang === 'km' ? 'ប្រាក់ខែគោល' : 'Base Salary'}</span>
                <span className="font-bold text-slate-900 text-sm">{formatKHR(emp.base_salary)}</span>
                <span className="text-[10px] text-slate-400 block capitalize">{emp.salary_type}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{lang === 'km' ? 'កម្រៃជើងសារ' : 'Commission'}</span>
                <span className="font-bold text-emerald-600 text-sm">
                  {formatKHR(emp.commission_rate)}/u
                </span>
                <span className="text-[10px] text-slate-400 block">per unit</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">
                {lang === 'km' ? 'ស្ថានភាព:' : 'Status:'}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  emp.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {emp.status}
              </span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            <UserCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p>{lang === 'km' ? 'មិនមានបុគ្គលិកទេ' : 'No employees found'}</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base">
                {editingEmployee
                  ? lang === 'km'
                    ? 'កែប្រែព័ត៌មានបុគ្គលិក'
                    : 'Edit Employee'
                  : lang === 'km'
                  ? 'បន្ថែមបុគ្គលិកថ្មី'
                  : 'Add New Staff'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {lang === 'km' ? 'ឈ្មោះពេញ' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. ហុង វីរៈ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {lang === 'km' ? 'តួនាទី' : 'Role / Position'}
                  </label>
                  <CustomSelect
                    value={role}
                    onChange={(val) => setRole(val as any)}
                    options={[
                      { value: 'driver', label: 'Driver (អ្នកដឹកជញ្ជូន)', badge: 'Logistics' },
                      { value: 'operator', label: 'Plant Operator (អ្នកបញ្ជាម៉ាស៊ីន)', badge: 'Production' },
                      { value: 'cashier', label: 'Cashier (បេឡាករ)', badge: 'POS' },
                      { value: 'manager', label: 'Manager (អ្នកគ្រប់គ្រង)', badge: 'Management' },
                      { value: 'admin', label: 'Administrator (រដ្ឋបាល)', badge: 'Full' },
                    ]}
                    className="w-full"
                    buttonClassName="w-full py-2 px-3 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {lang === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone'}
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="098 765 432"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {lang === 'km' ? 'អ៊ីមែល' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@watererp.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {lang === 'km' ? 'ប្រភេទបៀវត្សរ៍' : 'Salary Type'}
                  </label>
                  <CustomSelect
                    value={salaryType}
                    onChange={(val) => setSalaryType(val as any)}
                    options={[
                      { value: 'monthly', label: 'Monthly' },
                      { value: 'daily', label: 'Daily' },
                      { value: 'commission', label: 'Commission' },
                    ]}
                    className="w-full"
                    buttonClassName="w-full py-2 px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {lang === 'km' ? 'ប្រាក់ខែគោល (៛)' : 'Base Salary (៛)'}
                  </label>
                  <input
                    type="number"
                    step="100"
                    required
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {lang === 'km' ? 'កម្រៃជើងសារ (៛/ដប)' : 'Commission (៛/unit)'}
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
                >
                  {lang === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : lang === 'km' ? 'រក្សាទុក' : 'Save Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

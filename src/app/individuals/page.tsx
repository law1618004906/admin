'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter, 
  FileDown, 
  Users, 
  Phone, 
  MapPin, 
  Building, 
  Vote,
  Edit,
  Trash2,
  SortAsc,
  SortDesc,
  ArrowUpDown
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Person {
  id: number;
  leader_name: string;
  full_name: string;
  residence: string | null;
  phone: string | null;
  workplace: string | null;
  center_info: string | null;
  station_number: string | null;
  votes_count: number;
  created_at: string;
  updated_at: string;
}

interface Leader {
  id: number;
  full_name: string;
  residence: string | null;
  phone: string | null;
  workplace: string | null;
  center_info: string | null;
  station_number: string | null;
  votes_count: number;
  created_at: string;
  updated_at: string;
}

type SortField = 'id' | 'votes_count';
type SortOrder = 'asc' | 'desc';

const IndividualsPage = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeader, setSelectedLeader] = useState<string>('all');
  const [leaderSearchTerm, setLeaderSearchTerm] = useState('');
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  // Edit/Add person modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [editForm, setEditForm] = useState({
    leader_name: '',
    full_name: '',
    residence: '',
    phone: '',
    workplace: '',
    center_info: '',
    station_number: '',
    votes_count: 0
  });

  // Fetch data
  const fetchPersons = async () => {
    try {
      const response = await fetch('/api/individuals');
      if (response.ok) {
        const data = await response.json();
        setPersons(data);
      }
    } catch (error) {
      console.error('Error fetching persons:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات الأفراد",
        variant: "destructive",
      });
    }
  };

  const fetchLeaders = async () => {
    try {
      const response = await fetch('/api/leaders');
      if (response.ok) {
        const data = await response.json();
        setLeaders(data);
      }
    } catch (error) {
      console.error('Error fetching leaders:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPersons(), fetchLeaders()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Filter and sort persons
  const filteredAndSortedPersons = useMemo(() => {
    let filtered = persons.filter(person => {
      const matchesSearch = 
        person.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.workplace?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLeader = selectedLeader === 'all' || person.leader_name === selectedLeader;
      const matchesStation = selectedStation === 'all' || person.station_number === selectedStation;
      
      return matchesSearch && matchesLeader && matchesStation;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [persons, searchTerm, selectedLeader, selectedStation, sortField, sortOrder]);

  // Filter leaders for dropdown
  const filteredLeaders = useMemo(() => {
    return leaders.filter(leader => 
      leader.full_name.toLowerCase().includes(leaderSearchTerm.toLowerCase())
    );
  }, [leaders, leaderSearchTerm]);

  // Get unique station numbers
  const uniqueStations = useMemo(() => {
    const stations = [...new Set(persons.map(p => p.station_number).filter(Boolean))];
    return stations.sort();
  }, [persons]);

  // Handle form operations
  const openAddModal = () => {
    setEditingPerson(null);
    setEditForm({
      leader_name: '',
      full_name: '',
      residence: '',
      phone: '',
      workplace: '',
      center_info: '',
      station_number: '',
      votes_count: 0
    });
    setIsEditModalOpen(true);
  };

  const openEditModal = (person: Person) => {
    setEditingPerson(person);
    setEditForm({
      leader_name: person.leader_name,
      full_name: person.full_name,
      residence: person.residence || '',
      phone: person.phone || '',
      workplace: person.workplace || '',
      center_info: person.center_info || '',
      station_number: person.station_number || '',
      votes_count: person.votes_count
    });
    setIsEditModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingPerson ? `/api/individuals/${editingPerson.id}` : '/api/individuals';
      const method = editingPerson ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        toast({
          title: "نجح",
          description: editingPerson ? "تم تحديث الفرد بنجاح" : "تم إضافة الفرد بنجاح",
        });
        setIsEditModalOpen(false);
        fetchPersons();
      } else {
        throw new Error('Failed to save person');
      }
    } catch (error) {
      console.error('Error saving person:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ بيانات الفرد",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفرد؟')) return;
    
    try {
      const response = await fetch(`/api/individuals/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "نجح",
          description: "تم حذف الفرد بنجاح",
        });
        fetchPersons();
      } else {
        throw new Error('Failed to delete person');
      }
    } catch (error) {
      console.error('Error deleting person:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الفرد",
        variant: "destructive",
      });
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvContent = [
      ['الرقم', 'اسم القائد', 'الاسم الكامل', 'السكن', 'الهاتف', 'جهة العمل', 'معلومات المركز', 'رقم المحطة', 'عدد الأصوات'],
      ...filteredAndSortedPersons.map(person => [
        person.id,
        person.leader_name,
        person.full_name,
        person.residence || '',
        person.phone || '',
        person.workplace || '',
        person.center_info || '',
        person.station_number || '',
        person.votes_count
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `individuals_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الأفراد</h1>
        <p className="text-gray-600">إدارة وعرض بيانات الأفراد والناخبين</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث في الاسم، الهاتف، أو جهة العمل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          {/* Leader Filter */}
          <div className="min-w-[200px]">
            <Select value={selectedLeader} onValueChange={setSelectedLeader}>
              <SelectTrigger>
                <SelectValue placeholder="فلترة حسب القائد" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <Input
                    placeholder="البحث في القادة..."
                    value={leaderSearchTerm}
                    onChange={(e) => setLeaderSearchTerm(e.target.value)}
                    className="mb-2"
                  />
                </div>
                <SelectItem value="all">جميع القادة</SelectItem>
                {filteredLeaders.map((leader) => (
                  <SelectItem key={leader.id} value={leader.full_name}>
                    {leader.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Station Filter */}
          <div className="min-w-[150px]">
            <Select value={selectedStation} onValueChange={setSelectedStation}>
              <SelectTrigger>
                <SelectValue placeholder="رقم المحطة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المحطات</SelectItem>
                {uniqueStations.map((station) => (
                  <SelectItem key={station} value={station}>
                    المحطة {station}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 ml-2" />
            إضافة فرد جديد
          </Button>
          
          <Button onClick={exportToCSV} variant="outline">
            <FileDown className="h-4 w-4 ml-2" />
            تصدير CSV
          </Button>

          <Button
            onClick={() => toggleSort('id')}
            variant="outline"
            className="flex items-center gap-2"
          >
            ترتيب حسب الرقم
            {sortField === 'id' && (
              sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
            )}
            {sortField !== 'id' && <ArrowUpDown className="h-4 w-4" />}
          </Button>

          <Button
            onClick={() => toggleSort('votes_count')}
            variant="outline"
            className="flex items-center gap-2"
          >
            ترتيب حسب الأصوات
            {sortField === 'votes_count' && (
              sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
            )}
            {sortField !== 'votes_count' && <ArrowUpDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold">{filteredAndSortedPersons.length}</p>
                <p className="text-gray-600">إجمالي الأفراد</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Vote className="h-8 w-8 text-green-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold">
                  {filteredAndSortedPersons.reduce((sum, person) => sum + person.votes_count, 0)}
                </p>
                <p className="text-gray-600">إجمالي الأصوات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Filter className="h-8 w-8 text-purple-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold">{persons.length}</p>
                <p className="text-gray-600">المجموع الكلي</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Persons Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedPersons.map((person) => (
            <Card key={person.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {person.full_name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      تحت إشراف: {person.leader_name}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    #{person.id}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  {person.residence && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 ml-2 text-gray-400" />
                      {person.residence}
                    </div>
                  )}
                  
                  {person.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 ml-2 text-gray-400" />
                      {person.phone}
                    </div>
                  )}
                  
                  {person.workplace && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Building className="h-4 w-4 ml-2 text-gray-400" />
                      {person.workplace}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Vote className="h-4 w-4 ml-1 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      {person.votes_count} صوت
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(person)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(person.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {person.station_number && (
                  <div className="mt-3 pt-3 border-t">
                    <Badge variant="outline" className="text-xs">
                      المحطة {person.station_number}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredAndSortedPersons.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد نتائج</h3>
          <p className="text-gray-600">لم يتم العثور على أفراد مطابقين لمعايير البحث</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {editingPerson ? 'تعديل بيانات الفرد' : 'إضافة فرد جديد'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="leader_name">اسم القائد *</Label>
                <Select
                  value={editForm.leader_name}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, leader_name: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر القائد" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaders.map((leader) => (
                      <SelectItem key={leader.id} value={leader.full_name}>
                        {leader.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="full_name">الاسم الكامل *</Label>
                <Input
                  id="full_name"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="residence">السكن</Label>
                <Input
                  id="residence"
                  value={editForm.residence}
                  onChange={(e) => setEditForm(prev => ({ ...prev, residence: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="workplace">جهة العمل</Label>
                <Input
                  id="workplace"
                  value={editForm.workplace}
                  onChange={(e) => setEditForm(prev => ({ ...prev, workplace: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="center_info">معلومات المركز</Label>
                <Input
                  id="center_info"
                  value={editForm.center_info}
                  onChange={(e) => setEditForm(prev => ({ ...prev, center_info: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="station_number">رقم المحطة</Label>
                <Input
                  id="station_number"
                  value={editForm.station_number}
                  onChange={(e) => setEditForm(prev => ({ ...prev, station_number: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="votes_count">عدد الأصوات</Label>
                <Input
                  id="votes_count"
                  type="number"
                  min="0"
                  value={editForm.votes_count}
                  onChange={(e) => setEditForm(prev => ({ ...prev, votes_count: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                إلغاء
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingPerson ? 'تحديث' : 'إضافة'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IndividualsPage;

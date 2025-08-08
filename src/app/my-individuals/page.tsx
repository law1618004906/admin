'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  User, 
  Phone, 
  MapPin, 
  Building, 
  Hash, 
  TrendingUp,
  Crown,
  Mail,
  Search,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Individual {
  id: string;
  full_name: string;
  residence?: string;
  phone?: string;
  workplace?: string;
  center_info?: string;
  station_number?: string;
  votes_count: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface LeaderData {
  leader: {
    id: string;
    name: string;
    email: string;
    residence?: string;
    phone?: string;
    workplace?: string;
    center_info?: string;
    station_number?: string;
    votes_count: number;
    status: string;
    campaign: {
      id: string;
      title: string;
      titleAr: string;
    };
  };
  individuals: Individual[];
  individualsCount: number;
  totalVotes: number;
}

export default function MyIndividuals() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<LeaderData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMyIndividuals();
    }
  }, [isAuthenticated, user]);

  const fetchMyIndividuals = async () => {
    try {
      const response = await fetch('/api/my-individuals', { credentials: 'include' });

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      } else if (response.status === 403) {
        // User is not a leader, redirect to dashboard
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching my individuals:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const filteredIndividuals = data?.individuals.filter(individual =>
    individual.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    individual.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { variant: 'default' as const, label: 'نشط', className: 'bg-green-100 text-green-800' },
      INACTIVE: { variant: 'secondary' as const, label: 'غير نشط', className: 'bg-gray-100 text-gray-800' },
      SUSPENDED: { variant: 'destructive' as const, label: 'موقوف', className: 'bg-red-100 text-red-800' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg font-medium">
            جاري التحميل...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" onClick={() => router.push('/')} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              العودة للرئيسية
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <Users className="h-5 w-5" />
                <span>أفرادي</span>
              </CardTitle>
              <CardDescription>
                عرض الأفراد التابعين لي فقط
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-8 w-3/4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push('/')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة للرئيسية
          </Button>
        </div>

        {/* Leader Info Card */}
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <Crown className="h-6 w-6 text-purple-600" />
                  <span className="text-xl">معلوماتي كقائد</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{data.individualsCount}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">عدد الأفراد</div>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{data.totalVotes}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">إجمالي الأصوات</div>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{data.leader.votes_count}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">أصواتي الشخصية</div>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-lg font-bold text-gray-800 dark:text-white">{data.leader.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">اسمي</div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">البريد الإلكتروني:</span>
                    <span className="font-medium">{data.leader.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">السكن:</span>
                    <span className="font-medium">{data.leader.residence || 'غير محدد'}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">الهاتف:</span>
                    <span className="font-medium">{data.leader.phone || 'غير محدد'}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">العمل:</span>
                    <span className="font-medium">{data.leader.workplace || 'غير محدد'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Individuals Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <Users className="h-5 w-5" />
                <span>قائمة أفرادي ({filteredIndividuals.length})</span>
              </CardTitle>
              <CardDescription>
                عرض جميع الأفراد التابعين لي فقط
              </CardDescription>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="بحث عن فرد..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </CardHeader>
            
            <CardContent>
              {filteredIndividuals.length > 0 ? (
                <ScrollArea className="h-[600px] w-full">
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-gray-50 dark:bg-gray-900">
                        <TableRow>
                          <TableHead className="text-right">الاسم الكامل</TableHead>
                          <TableHead className="text-right">السكن</TableHead>
                          <TableHead className="text-right">رقم الهاتف</TableHead>
                          <TableHead className="text-right">مكان العمل</TableHead>
                          <TableHead className="text-right">اسم ورقم المركز</TableHead>
                          <TableHead className="text-right">رقم المحطة</TableHead>
                          <TableHead className="text-right">عدد الأصوات</TableHead>
                          <TableHead className="text-right">الحالة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredIndividuals.map((individual, index) => (
                          <motion.tr
                            key={individual.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <TableCell className="font-medium">{individual.full_name}</TableCell>
                            <TableCell>{individual.residence || 'غير محدد'}</TableCell>
                            <TableCell>{individual.phone || 'غير محدد'}</TableCell>
                            <TableCell>{individual.workplace || 'غير محدد'}</TableCell>
                            <TableCell>{individual.center_info || 'غير محدد'}</TableCell>
                            <TableCell>{individual.station_number || 'غير محدد'}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <TrendingUp className="h-3 w-3 text-green-600" />
                                <span>{individual.votes_count}</span>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(individual.status)}</TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">
                    {searchTerm ? 'لا يوجد أفراد مطابقين لبحثك' : 'لا يوجد أفراد تابعين لك'}
                  </p>
                  <p className="text-sm">
                    {searchTerm ? 'حاول تغيير مصطلحات البحث' : 'سيتم عرض الأفراد هنا عند إضافتهم'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
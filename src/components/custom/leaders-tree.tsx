'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ChevronDown, 
  ChevronRight, 
  Users, 
  User, 
  Phone, 
  MapPin, 
  Building, 
  Hash, 
  TrendingUp,
  Crown,
  Search
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
}

interface Leader {
  id: string;
  name: string;
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
  individualsCount: number;
  individuals: Individual[];
}

interface LeadersTreeProps {
  className?: string;
}

export default function LeadersTree({ className }: LeadersTreeProps) {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLeaders, setExpandedLeaders] = useState<Set<string>>(new Set());
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    try {
      const response = await fetch('/api/leaders-tree', { credentials: 'include' });

      if (response.ok) {
        const data = await response.json();
        setLeaders(data.data);
      } else if (response.status === 401) {
        // Unauthorized: redirect to login
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error fetching leaders:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLeader = (leaderId: string) => {
    const newExpanded = new Set(expandedLeaders);
    if (newExpanded.has(leaderId)) {
      newExpanded.delete(leaderId);
      setSelectedLeader(null);
    } else {
      newExpanded.add(leaderId);
      const leader = leaders.find(l => l.id === leaderId);
      setSelectedLeader(leader || null);
    }
    setExpandedLeaders(newExpanded);
  };

  const filteredLeaders = leaders.filter(leader =>
    leader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leader.residence?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leader.center_info?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <Crown className="h-5 w-5" />
            <span>شجرة القادة والأفراد</span>
          </CardTitle>
          <CardDescription>
            عرض هرمي للقادة والأفراد التابعين لهم
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
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <Crown className="h-5 w-5" />
          <span>شجرة القادة والأفراد</span>
        </CardTitle>
        <CardDescription>
          عرض هرمي للقادة والأفراد التابعين لهم
        </CardDescription>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="بحث عن قائد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[600px] w-full">
          <div className="space-y-2">
            {filteredLeaders.map((leader, index) => (
              <motion.div
                key={leader.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Leader Header */}
                <div 
                  className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 cursor-pointer hover:from-purple-100 hover:to-blue-100 transition-all duration-200"
                  onClick={() => toggleLeader(leader.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="flex-shrink-0">
                        {expandedLeaders.has(leader.id) ? (
                          <ChevronDown className="h-5 w-5 text-purple-600" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Crown className="h-5 w-5 text-purple-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {leader.name}
                          </h3>
                          <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600 dark:text-gray-400">
                            <span>{leader.campaign.titleAr}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      {getStatusBadge(leader.status)}
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Users className="h-3 w-3 mr-1" />
                        {leader.individualsCount} فرد
                      </Badge>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {leader.votes_count} صوت
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedLeaders.has(leader.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-gray-800"
                  >
                    {/* Leader Details */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">السكن:</span>
                          <span className="font-medium">{leader.residence || 'غير محدد'}</span>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">الهاتف:</span>
                          <span className="font-medium">{leader.phone || 'غير محدد'}</span>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Building className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">العمل:</span>
                          <span className="font-medium">{leader.workplace || 'غير محدد'}</span>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Hash className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">المركز:</span>
                          <span className="font-medium">{leader.center_info || 'غير محدد'}</span>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Hash className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">المحطة:</span>
                          <span className="font-medium">{leader.station_number || 'غير محدد'}</span>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <TrendingUp className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">الأصوات:</span>
                          <span className="font-medium">{leader.votes_count}</span>
                        </div>
                      </div>
                    </div>

                    {/* Individuals Table */}
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2 space-x-reverse">
                        <Users className="h-4 w-4" />
                        <span>الأفراد التابعين ({leader.individuals.length})</span>
                      </h4>
                      
                      {leader.individuals.length > 0 ? (
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                          <Table>
                            <TableHeader className="bg-gray-50 dark:bg-gray-900">
                              <TableRow>
                                <TableHead className="text-right">الاسم الكامل</TableHead>
                                <TableHead className="text-right">القائد التابع له</TableHead>
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
                              {leader.individuals.map((individual) => (
                                <TableRow key={individual.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                  <TableCell className="font-medium">{individual.full_name}</TableCell>
                                  <TableCell>{leader.name}</TableCell>
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
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>لا يوجد أفراد تابعين لهذا القائد</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
            
            {filteredLeaders.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Crown className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>لا يوجد قادة مطابقين لبحثك</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
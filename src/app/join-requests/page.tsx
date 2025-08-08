'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { usePermissions } from '@/hooks/use-permissions';
import { withCsrf } from '@/lib/csrf-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Users, 
  Search, 
  Check, 
  X, 
  Eye,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Clock,
  Loader2,
  FileText,
  Home
} from 'lucide-react';

interface JoinRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  position?: string;
  experience?: string;
  message?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  reviewedAt?: string;
  campaign: {
    id: string;
    title: string;
    titleAr: string;
  };
  reviewer?: {
    id: string;
    name: string;
    email: string;
  };
}

interface Campaign {
  id: string;
  title: string;
  titleAr: string;
}

export default function JoinRequestsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { has } = usePermissions();
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);

  useEffect(() => {
    if (isAuthenticated && has('join_requests.read')) {
      fetchJoinRequests();
      fetchCampaigns();
    }
  }, [isAuthenticated, has]);

  const fetchJoinRequests = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedCampaign) params.append('campaignId', selectedCampaign);

      const response = await fetch(`/api/join-requests?${params}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        // Handle different response structures
        const joinRequestsData = data.data?.joinRequests || data.data || data.joinRequests || [];
        setJoinRequests(Array.isArray(joinRequestsData) ? joinRequestsData : []);
      }
    } catch (error) {
      console.error('Error fetching join requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns', { credentials: 'include' });

      if (response.ok) {
        const data = await response.json();
        // Handle different response structures
        const campaignsData = data.data?.campaigns || data.data || data.campaigns || [];
        setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const handleStatusChange = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(
        `/api/join-requests/${requestId}`,
        withCsrf({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ status }),
        })
      );

      if (response.ok) {
        await fetchJoinRequests();
      }
    } catch (error) {
      console.error('Error updating join request:', error);
    }
  };

  const handleView = (request: JoinRequest) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">قيد الانتظار</Badge>;
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-600">مقبول</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">مرفوض</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  useEffect(() => {
    fetchJoinRequests();
  }, [searchTerm, selectedStatus, selectedCampaign]);

  if (!has('join_requests.read')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <FileText className="h-5 w-5" />
              <span>غير مصرح</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              ليس لديك صلاحية للوصول إلى صفحة طلبات الانضمام.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="ml-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Home className="h-4 w-4 ml-2" />
              الرئيسية
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                طلبات الانضمام
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                إدارة طلبات المتطوعين والانضمام للحملات الانتخابية
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex space-x-4 space-x-reverse">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="بحث بالاسم، البريد الإلكتروني، أو الهاتف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              
              <div className="w-40">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="PENDING">قيد الانتظار</SelectItem>
                    <SelectItem value="APPROVED">مقبول</SelectItem>
                    <SelectItem value="REJECTED">مرفوض</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-48">
                <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                  <SelectTrigger>
                    <SelectValue placeholder="الحملة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحملات</SelectItem>
                    {campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.titleAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Join Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <Users className="h-5 w-5" />
              <span>قائمة طلبات الانضمام</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المتقدم</TableHead>
                    <TableHead>معلومات الاتصال</TableHead>
                    <TableHead>المسمى الوظيفي</TableHead>
                    <TableHead>الحملة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ التقديم</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {joinRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {request.name}
                          </p>
                          {request.experience && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              الخبرة: {request.experience}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{request.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{request.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.position && (
                          <Badge variant="outline">
                            {request.position}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {request.campaign.titleAr}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(request.createdAt).toLocaleDateString('ar-SA')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2 space-x-reverse">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {has('join_requests.update') && request.status === 'PENDING' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(request.id, 'APPROVED')}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                    <X className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>تأكيد الرفض</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      هل أنت متأكد من رفض طلب الانضمام من "{request.name}"؟
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleStatusChange(request.id, 'REJECTED')}>
                                      رفض
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>تفاصيل طلب الانضمام</DialogTitle>
            </DialogHeader>
            
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">الاسم الكامل</Label>
                    <p className="text-lg font-semibold">{selectedRequest.name}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">البريد الإلكتروني</Label>
                    <p className="text-lg">{selectedRequest.email}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">رقم الهاتف</Label>
                    <p className="text-lg">{selectedRequest.phone}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">المسمى الوظيفي</Label>
                    <p className="text-lg">{selectedRequest.position || 'غير محدد'}</p>
                  </div>
                </div>
                
                {selectedRequest.experience && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">الخبرة</Label>
                    <p className="text-gray-700 dark:text-gray-300">{selectedRequest.experience}</p>
                  </div>
                )}
                
                {selectedRequest.message && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">رسالة إضافية</Label>
                    <p className="text-gray-700 dark:text-gray-300">{selectedRequest.message}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">الحملة</Label>
                    <p className="font-medium">{selectedRequest.campaign.titleAr}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">الحالة</Label>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">تاريخ التقديم</Label>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(selectedRequest.createdAt).toLocaleString('ar-SA')}</span>
                    </div>
                  </div>
                  
                  {selectedRequest.reviewedAt && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">تاريخ المراجعة</Label>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{new Date(selectedRequest.reviewedAt).toLocaleString('ar-SA')}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {selectedRequest.reviewer && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">مراجع الطلب</Label>
                    <p className="font-medium">{selectedRequest.reviewer.name}</p>
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
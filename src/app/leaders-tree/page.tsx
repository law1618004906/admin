'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, User, ChevronDown, ChevronRight, Home } from 'lucide-react';

type TreeNode = {
  id: string;
  label: string;
  type: 'leader' | 'person';
  votes?: number;
  children?: TreeNode[];
};

export default function LeadersTreePage() {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selectedLeaderId, setSelectedLeaderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTree();
  }, []);

  const fetchTree = async () => {
    try {
      const res = await fetch('/api/leaders-tree', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setTree(data.data || []);
      }
    } catch (e) {
      console.error('Error fetching tree:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectLeader = (id: string) => {
    setSelectedLeaderId(id);
    setExpanded((prev) => ({ ...prev, [id]: true }));
  };

  const selectedLeader = useMemo(
    () => tree.find((n) => n.type === 'leader' && n.id === selectedLeaderId) || null,
    [tree, selectedLeaderId]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-slate-900 to-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white">
      {/* Header */}
      <header className="bg-purple-800/30 backdrop-blur-xl border border-purple-600/30 rounded-xl shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                <span className="text-black font-bold">ش ج</span>
              </div>
              <div className="mr-3">
                <h1 className="text-xl font-semibold text-amber-400">العرض الشجري للقادة</h1>
                <p className="text-sm text-purple-200">قائد واحد وكل أفراده كتفرعات</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="border-purple-600/30 bg-purple-700/20 backdrop-blur-lg text-white hover:bg-purple-600/30 rounded-xl"
              >
                <Home className="h-4 w-4 mr-2 text-white" />
                الرئيسية
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaders List */}
          <Card className="bg-purple-800/20 border border-purple-600/30 backdrop-blur-xl rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse text-amber-400">
                <Users className="h-5 w-5 text-amber-300" />
                <span>القادة</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                </div>
              ) : tree.length === 0 ? (
                <div className="text-gray-200 text-sm">لا يوجد قادة</div>
              ) : (
                <ul className="space-y-2">
                  {tree.map((leader) => (
                    <li key={leader.id}>
                      <button
                        onClick={() => selectLeader(leader.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition ${
                          selectedLeaderId === leader.id
                            ? 'bg-white/20 border border-white/25'
                            : 'bg-white/10 hover:bg-white/15 border border-white/15'
                        } text-gray-100`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <User className="h-4 w-4 text-sky-300" />
                            <span className="font-medium text-white">{leader.label}</span>
                          </div>
                          <span className="text-xs text-gray-200">
                            أصوات: {leader.votes ?? 0}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Tree View */}
          <Card className="lg:col-span-2 bg-purple-800/20 border border-purple-600/30 backdrop-blur-xl rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse text-white">
                <Users className="h-5 w-5 text-emerald-400" />
                <span>الشجرة</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedLeader ? (
                <div>
                  <TreeNodeView
                    node={selectedLeader}
                    expanded={expanded}
                    onToggle={toggle}
                  />
                </div>
              ) : (
                <div className="text-gray-200 text-sm">اختر قائداً من القائمة لعرض شجرته</div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function TreeNodeView({
  node,
  expanded,
  onToggle,
  level = 0,
}: {
  node: any;
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  level?: number;
}) {
  const isExpandable = (node.children?.length || 0) > 0;
  const isOpen = expanded[node.id] ?? false;

  return (
    <div className="ml-2">
      <div
        className={`flex items-center py-2 px-3 rounded-lg border backdrop-blur-xl text-gray-100 ${
          node.type === 'leader'
            ? 'bg-white/20 border-white/25'
            : 'bg-white/10 border-white/15'
        }`}
        style={{ marginInlineStart: level * 16 }}
      >
        {isExpandable ? (
          <button
            onClick={() => onToggle(node.id)}
            className="mr-2 text-gray-200 hover:text-white"
            aria-label={isOpen ? 'طي' : 'فتح'}
          >
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <span className="mr-6" />
        )}

        <span className="font-medium text-white">{node.label}</span>
        {typeof node.votes === 'number' && (
          <span className="ml-auto text-xs text-gray-200">أصوات: {node.votes}</span>
        )}
      </div>

      {isExpandable && isOpen && (
        <div className="mt-2 space-y-2">
          {node.children!.map((child: any) => (
            <TreeNodeView
              key={child.id}
              node={child}
              expanded={expanded}
              onToggle={onToggle}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
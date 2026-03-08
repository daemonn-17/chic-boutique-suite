import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Users, Eye, EyeOff, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

function useContactMessages() {
  return useQuery({
    queryKey: ['admin-contact-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

function useNewsletterSubscribers() {
  return useQuery({
    queryKey: ['admin-newsletter-subscribers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export default function AdminMessages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: messages, isLoading: messagesLoading } = useContactMessages();
  const { data: subscribers, isLoading: subscribersLoading } = useNewsletterSubscribers();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleRead = useMutation({
    mutationFn: async ({ id, is_read }: { id: string; is_read: boolean }) => {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-contact-messages'] }),
  });

  const deleteMessage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contact-messages'] });
      toast({ title: 'Message deleted' });
    },
  });

  const unreadCount = messages?.filter((m) => !m.is_read).length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold">Messages & Subscribers</h1>
        <p className="text-muted-foreground">Manage contact form submissions and newsletter subscribers.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Contact Messages</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages?.length ?? '–'}</div>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Newsletter Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscribers?.length ?? '–'}</div>
            <p className="text-xs text-muted-foreground">
              {subscribers?.filter((s) => s.is_active).length ?? 0} active
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="messages">
        <TabsList>
          <TabsTrigger value="messages">
            Contact Messages
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="subscribers">Newsletter Subscribers</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="mt-4">
          {messagesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : !messages?.length ? (
            <p className="text-center py-12 text-muted-foreground">No contact messages yet.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((msg) => (
                    <>
                      <TableRow
                        key={msg.id}
                        className={`cursor-pointer ${!msg.is_read ? 'bg-primary/5 font-medium' : ''}`}
                        onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
                      >
                        <TableCell>
                          {!msg.is_read && <span className="block w-2 h-2 rounded-full bg-primary" />}
                        </TableCell>
                        <TableCell>{msg.name}</TableCell>
                        <TableCell className="text-muted-foreground">{msg.email}</TableCell>
                        <TableCell>{msg.subject}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(msg.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRead.mutate({ id: msg.id, is_read: !msg.is_read });
                              }}
                              title={msg.is_read ? 'Mark unread' : 'Mark read'}
                            >
                              {msg.is_read ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteMessage.mutate(msg.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedId === msg.id && (
                        <TableRow key={`${msg.id}-detail`}>
                          <TableCell colSpan={6} className="bg-muted/30 px-8 py-4">
                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="subscribers" className="mt-4">
          {subscribersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : !subscribers?.length ? (
            <p className="text-center py-12 text-muted-foreground">No subscribers yet.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscribed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.email}</TableCell>
                      <TableCell>
                        <Badge variant={sub.is_active ? 'default' : 'secondary'}>
                          {sub.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(sub.subscribed_at), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

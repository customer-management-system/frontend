import { useEffect, useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { columns } from "./columns";
import { useUsersStore } from "./store";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, ChevronLeft } from "lucide-react";
import { UserForm } from "./UserForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function UsersPage() {
    const { users, fetchUsers, isActive, setFilter, userToEdit, setUserToEdit, meta } = useUsersStore();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">إدارة المستخدمين</h1>
                    <p className="text-muted-foreground">عرض وإدارة الحسابات وصلاحيات الوصول</p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            إضافة مستخدم
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                            <DialogDescription>
                                قم بإدخال بيانات الحساب الجديد والصلاحية.
                            </DialogDescription>
                        </DialogHeader>
                        <UserForm onSuccess={() => setOpen(false)} />
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={!!userToEdit} onOpenChange={(val) => !val && setUserToEdit(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
                            <DialogDescription>
                                قم بتحديث بيانات وصلاحية الحساب. اترق كلمة المرور فارغة إذا لم ترد تغييرها.
                            </DialogDescription>
                        </DialogHeader>
                        {userToEdit && (
                            <UserForm
                                initialData={userToEdit}
                                onSuccess={() => setUserToEdit(null)}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex border-b mb-6">
                    <button
                        onClick={() => setFilter(true)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${isActive
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        نشط
                    </button>
                    <button
                        onClick={() => setFilter(false)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${!isActive
                            ? 'border-red-500 text-red-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        غير نشط
                    </button>
                </div>

                <DataTable columns={columns} data={users} searchKey="username" enablePagination={false} />

                {/* Server-side pagination controls */}
                {meta && meta.totalPages > 1 && (
                    <div className="flex items-center justify-between py-4">
                        <div className="text-sm text-muted-foreground">
                            صفحة {meta.page} من {meta.totalPages} — إجمالي {meta.total} مستخدم
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchUsers(meta.page - 1)}
                                disabled={meta.page <= 1}
                            >
                                <ChevronRight className="h-4 w-4 ml-2" />
                                السابق
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchUsers(meta.page + 1)}
                                disabled={meta.page >= meta.totalPages}
                            >
                                التالي
                                <ChevronLeft className="h-4 w-4 mr-2" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

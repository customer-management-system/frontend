import { Pencil, Trash, Eye, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Customer } from './schema';
import { useCustomersStore } from './store';

export function CustomerActionsCell({ customer }: { customer: Customer }) {
    const { deleteCustomer, restoreCustomer, setCustomerToEdit, isDeleted } = useCustomersStore();
    const navigate = useNavigate();

    return (
        <div className="flex items-center gap-2 justify-center">
            {isDeleted ? (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-green-600"
                    onClick={() => {
                        if (confirm('هل أنت متأكد من استعادة هذا العميل؟')) {
                            restoreCustomer(customer.id!);
                        }
                    }}
                    title="استعادة"
                >
                    <RotateCcw className="h-4 w-4" />
                </Button>
            ) : (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-600"
                        onClick={() => navigate(`/customers/${customer.id}`)}
                        title="عرض التفاصيل"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600"
                        onClick={() => setCustomerToEdit(customer)}
                        title="تعديل"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600"
                        onClick={() => {
                            if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
                                deleteCustomer(customer.id!);
                            }
                        }}
                        title="حذف"
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </>
            )}
        </div>
    );
}

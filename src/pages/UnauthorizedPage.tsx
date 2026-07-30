import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldX } from 'lucide-react';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6" dir="rtl">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center space-y-4">
                <ShieldX className="h-16 w-16 text-red-500 mx-auto" />
                <h1 className="text-2xl font-bold text-gray-900">غير مصرح</h1>
                <p className="text-gray-600">
                    ليس لديك صلاحية للوصول إلى هذه الصفحة.
                </p>
                <Button asChild>
                    <Link to="/">العودة للرئيسية</Link>
                </Button>
            </div>
        </div>
    );
}

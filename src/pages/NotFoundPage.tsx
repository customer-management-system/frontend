import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6" dir="rtl">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center space-y-4">
                <FileQuestion className="h-16 w-16 text-gray-400 mx-auto" />
                <h1 className="text-2xl font-bold text-gray-900">404 — الصفحة غير موجودة</h1>
                <p className="text-gray-600">
                    الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
                </p>
                <Button asChild>
                    <Link to="/">العودة للرئيسية</Link>
                </Button>
            </div>
        </div>
    );
}

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Unhandled application error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6" dir="rtl">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center space-y-4">
                        <h1 className="text-2xl font-bold text-gray-900">حدث خطأ غير متوقع</h1>
                        <p className="text-gray-600">
                            نعتذر، حدث خطأ أثناء تحميل التطبيق. يرجى المحاولة مرة أخرى.
                        </p>
                        {import.meta.env.DEV && this.state.error && (
                            <pre className="text-xs text-red-600 bg-red-50 p-3 rounded text-left overflow-auto">
                                {this.state.error.message}
                            </pre>
                        )}
                        <Button onClick={this.handleReset}>العودة للرئيسية</Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

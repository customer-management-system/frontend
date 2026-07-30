export interface PrintOptions {
    printClass: string;
    onBeforePrint?: () => void;
    onAfterPrint?: () => void;
}

export function triggerPrint({ printClass, onBeforePrint, onAfterPrint }: PrintOptions): void {
    const cleanup = () => {
        document.body.classList.remove(printClass);
        window.onafterprint = null;
        onAfterPrint?.();
    };

    window.onafterprint = cleanup;
    onBeforePrint?.();
    document.body.classList.add(printClass);

    requestAnimationFrame(() => {
        window.print();
    });
}

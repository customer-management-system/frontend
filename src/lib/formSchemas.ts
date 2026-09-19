import { z } from 'zod';

export const requiredPositiveInt = (message = 'هذا الحقل مطلوب') =>
    z.number({ message }).int(message).min(1, message);

export const requiredPositiveQuantity = (message = 'أدخل الكمية') =>
    z.number({ message }).min(0.01, message);

export const requiredNonNegativeNumber = (message = 'هذا الحقل مطلوب') =>
    z.number({ message }).min(0, message);

export const requiredAmount = (message = 'أدخل المبلغ') =>
    z.number({ message }).min(0.01, message);

export const optionalNonNegativeNumber = () => z.number().min(0).optional();

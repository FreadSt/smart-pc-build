import { ReactNode, ElementType, ComponentPropsWithoutRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

// Утилита для удобного слияния классов Tailwind
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Определение собственных пропсов
interface TextOwnProps<E extends ElementType> {
    as?: E;
    children: ReactNode;
    size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
    weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
    color?: string; // Можно ограничить конкретными именами из конфига
    className?: string;
}

// Объединение своих пропсов со стандартными атрибутами HTML-тега
type TextProps<E extends ElementType> = TextOwnProps<E> &
    Omit<ComponentPropsWithoutRef<E>, keyof TextOwnProps<E>>;

export const Text = <E extends ElementType = 'p'>({
                                                      as,
                                                      children,
                                                      size = 'base',
                                                      weight = 'normal',
                                                      className,
                                                      ...props // Все остальные пропсы (id, onClick, style, etc.)
                                                  }: TextProps<E>) => {
    const Component = as || 'p';

    // Маппинг стилей (здесь пример с Tailwind, но логика применима к CSS Modules)
    const sizeClasses = {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
    };

    const weightClasses = {
        light: 'font-light',
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
    };

    return (
        <Component
            className={cn(
                sizeClasses[size],
                weightClasses[weight],
                className // Пользовательские классы дописываются в конец
            )}
            {...props}
        >
            {children}
        </Component>
    );
};
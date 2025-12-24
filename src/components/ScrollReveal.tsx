import React from 'react';
import { cn } from '@/lib/utils';
import { useScrollReveal } from '@/hooks/useScrollReveal';

type AnimationType = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'blur';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  threshold?: number;
  triggerOnce?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

const animationClasses: Record<AnimationType, { initial: string; visible: string }> = {
  'fade-up': {
    initial: 'opacity-0 translate-y-8',
    visible: 'opacity-100 translate-y-0',
  },
  'fade-down': {
    initial: 'opacity-0 -translate-y-8',
    visible: 'opacity-100 translate-y-0',
  },
  'fade-left': {
    initial: 'opacity-0 translate-x-8',
    visible: 'opacity-100 translate-x-0',
  },
  'fade-right': {
    initial: 'opacity-0 -translate-x-8',
    visible: 'opacity-100 translate-x-0',
  },
  scale: {
    initial: 'opacity-0 scale-90',
    visible: 'opacity-100 scale-100',
  },
  blur: {
    initial: 'opacity-0 blur-sm',
    visible: 'opacity-100 blur-0',
  },
};

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className,
  animation = 'fade-up',
  delay = 0,
  duration = 600,
  threshold = 0.1,
  triggerOnce = true,
  as: Component = 'div',
}) => {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold, triggerOnce });
  const { initial, visible } = animationClasses[animation];

  return React.createElement(
    Component,
    {
      ref,
      className: cn(
        'transition-all',
        isVisible ? visible : initial,
        className
      ),
      style: {
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
    children
  );
};

// Stagger children with scroll reveal
interface ScrollRevealGroupProps {
  children: React.ReactNode;
  className?: string;
  animation?: AnimationType;
  staggerDelay?: number;
  duration?: number;
  threshold?: number;
}

export const ScrollRevealGroup: React.FC<ScrollRevealGroupProps> = ({
  children,
  className,
  animation = 'fade-up',
  staggerDelay = 100,
  duration = 600,
  threshold = 0.1,
}) => {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold, triggerOnce: true });
  const { initial, visible } = animationClasses[animation];

  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        return React.cloneElement(child as React.ReactElement<any>, {
          className: cn(
            (child as React.ReactElement<any>).props.className,
            'transition-all',
            isVisible ? visible : initial
          ),
          style: {
            ...(child as React.ReactElement<any>).props.style,
            transitionDuration: `${duration}ms`,
            transitionDelay: `${index * staggerDelay}ms`,
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          },
        });
      })}
    </div>
  );
};

export default ScrollReveal;

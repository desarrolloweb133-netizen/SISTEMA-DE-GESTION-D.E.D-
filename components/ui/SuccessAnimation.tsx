import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface SuccessAnimationProps {
    isVisible: boolean;
    message?: string;
    onAnimationComplete?: () => void;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ isVisible, message, onAnimationComplete }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-white/80 backdrop-blur-sm animate-fade-in transition-all duration-300">
            <div className="flex flex-col items-center justify-center animate-scale-in">
                <div className="w-[300px] h-[300px]">
                    <DotLottieReact
                        src="https://lottie.host/3b691bfc-e415-4ae1-9ece-5dceaffa6bc8/ULmzOxqFd8.lottie"
                        autoplay
                        loop={false}
                        speed={1.5}
                    />
                </div>
                {message && (
                    <h3 className="text-2xl font-black text-gray-800 tracking-tight mt-[-2rem] animate-slide-up-fade">
                        {message}
                    </h3>
                )}
            </div>
        </div>
    );
};

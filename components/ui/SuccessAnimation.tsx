import React from 'react';

interface SuccessAnimationProps {
    isVisible: boolean;
    message?: string;
    onAnimationComplete?: () => void;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ isVisible, message }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-white/90 backdrop-blur-md animate-fade-in">
            <div className="flex flex-col items-center justify-center">
                <div className="success-checkmark">
                    <div className="check-icon">
                        <span className="icon-line line-tip"></span>
                        <span className="icon-line line-long"></span>
                        <div className="icon-circle"></div>
                        <div className="icon-fix"></div>
                    </div>
                </div>

                {message && (
                    <h3 className="text-2xl font-black text-gray-800 tracking-tight mt-8 animate-slide-up-fade text-center max-w-md">
                        {message}
                    </h3>
                )}
            </div>

            <style>{`
                .success-checkmark {
                    width: 80px;
                    height: 115px;
                    margin: 0 auto;
                }

                .check-icon {
                    width: 80px;
                    height: 80px;
                    position: relative;
                    border-radius: 50%;
                    box-sizing: content-box;
                    border: 4px solid #10B981;
                }

                .check-icon::before {
                    top: 3px;
                    left: -2px;
                    width: 30px;
                    transform-origin: 100% 50%;
                    border-radius: 100px 0 0 100px;
                }

                .check-icon::after {
                    top: 0;
                    left: 30px;
                    width: 60px;
                    transform-origin: 0 50%;
                    border-radius: 0 100px 100px 0;
                    animation: rotate-circle 4.25s ease-in;
                }

                .check-icon::before, .check-icon::after {
                    content: '';
                    height: 100px;
                    position: absolute;
                    background: transparent;
                    transform: rotate(-45deg);
                }

                .icon-line {
                    height: 5px;
                    background-color: #10B981;
                    display: block;
                    border-radius: 2px;
                    position: absolute;
                    z-index: 10;
                }

                .line-tip {
                    top: 46px;
                    left: 14px;
                    width: 25px;
                    transform: rotate(45deg);
                    animation: icon-line-tip 0.75s;
                }

                .line-long {
                    top: 38px;
                    right: 8px;
                    width: 47px;
                    transform: rotate(-45deg);
                    animation: icon-line-long 0.75s;
                }

                .icon-circle {
                    top: -4px;
                    left: -4px;
                    z-index: 10;
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    position: absolute;
                    box-sizing: content-box;
                    border: 4px solid rgba(16, 185, 129, 0.2);
                }

                .icon-fix {
                    top: 8px;
                    width: 5px;
                    left: 26px;
                    z-index: 1;
                    height: 85px;
                    position: absolute;
                    transform: rotate(-45deg);
                    background-color: transparent;
                }

                @keyframes rotate-circle {
                    0% { transform: rotate(-45deg); }
                    5% { transform: rotate(-45deg); }
                    12% { transform: rotate(-405deg); }
                    100% { transform: rotate(-405deg); }
                }

                @keyframes icon-line-tip {
                    0% { width: 0; left: 1px; top: 19px; }
                    54% { width: 0; left: 1px; top: 19px; }
                    70% { width: 50px; left: -8px; top: 37px; }
                    84% { width: 17px; left: 21px; top: 48px; }
                    100% { width: 25px; left: 14px; top: 46px; }
                }

                @keyframes icon-line-long {
                    0% { width: 0; right: 46px; top: 54px; }
                    65% { width: 0; right: 46px; top: 54px; }
                    84% { width: 55px; right: 0px; top: 35px; }
                    100% { width: 47px; right: 8px; top: 38px; }
                }

                .animate-slide-up-fade {
                    animation: slideUpFade 0.5s ease-out forwards;
                }

                @keyframes slideUpFade {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

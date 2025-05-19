type Props = {
    children: React.ReactNode;
    onClick: () => void;
    className?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
};

const Button = ({ children, onClick, className, disabled, type = 'button' }: Props) => {
    return (
        <button
            className={`${className} px-2 py-1 rounded-md bg-red-700 text-white text-base font-medium hover:bg-red-600  focus:ring-opacity-75`}
            onClick={onClick}
            disabled={disabled}
            type={type}
        >
            {children}
        </button>
    );
};

export default Button;

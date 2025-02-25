export function Button({ children, onClick, className }) {
    return (
        <button
            onClick={onClick}
            className={`px-12 py-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition ${className}`}
        >
            {children}
        </button>
    );
}
  
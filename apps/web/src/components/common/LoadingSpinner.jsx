import { motion } from "framer-motion";

const LoadingSpinner = ({ 
  size = "md", 
  text = "Loading...", 
  inline = false, // New prop for inline usage (buttons, etc.)
  showText = true, // Option to hide text
  color = "primary" // Color variant
}) => {
  const sizeClasses = {
    xs: "w-3 h-3 border-2",
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-3",
    lg: "w-8 h-8 border-3",
    xl: "w-10 h-10 border-4",
  };

  const colorClasses = {
    primary: "border-gray-200 border-t-primary-600",
    white: "border-gray-300 border-t-white",
    blue: "border-gray-200 border-t-blue-600",
    green: "border-gray-200 border-t-green-600",
    red: "border-gray-200 border-t-red-600",
  };

  const textSizeClasses = {
    xs: "text-xs",
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  // For inline usage (like buttons), use minimal layout
  if (inline) {
    return (
      <div className="flex items-center justify-center space-x-2">
        <motion.div
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
        {text && showText && (
          <span className={`${textSizeClasses[size]} font-medium text-current whitespace-nowrap`}>
            {text}
          </span>
        )}
      </div>
    );
  }

  // For standalone usage (full loading screens, cards, etc.)
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      {/* Spinner */}
      <motion.div
        className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />

      {/* Loading text with subtle animation */}
      {text && showText && (
        <motion.p
          className={`${textSizeClasses[size]} md:text-base font-medium text-gray-700 tracking-wide text-center`}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;
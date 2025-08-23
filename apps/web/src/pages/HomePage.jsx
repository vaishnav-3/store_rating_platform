import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  const getDashboardLink = () => {
    if (!isAuthenticated || !user) return "/login";

    switch (user.role) {
      case "admin":
        return "/admin";
      case "store_owner":
        return "/store-owner";
      case "user":
        return "/dashboard";
      default:
        return "/login";
    }
  };
 
  const features = [
    {
      icon: "🏪",
      title: "Discover Stores",
      description:
        "Browse through a wide variety of stores and find exactly what you're looking for.",
    },
    {
      icon: "⭐",
      title: "Rate & Review",
      description:
        "Share your experiences and help other customers make informed decisions.",
    },
    {
      icon: "📊",
      title: "Store Insights",
      description:
        "Store owners can track their performance and customer feedback easily.",
    },
    {
      icon: "🛡️",
      title: "Trusted Platform",
      description:
        "Secure and reliable platform with verified reviews and ratings.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Welcome to StoreRate
            </h1>
            <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Discover, rate, and review stores. Help build a community of
              informed shoppers and thriving businesses.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link
                  to={getDashboardLink()}
                  className="btn-primary bg-white text-primary-600 hover:bg-gray-50 text-lg px-8 py-3"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-primary bg-white text-primary-600 hover:bg-gray-50 text-lg px-8 py-3"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="btn-secondary border-2 border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-3"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose StoreRate?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform connects shoppers and businesses in a transparent,
              user-friendly environment that benefits everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card hover:shadow-lg transition-shadow duration-300 text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      
      
    </div>
  );
};

export default HomePage;

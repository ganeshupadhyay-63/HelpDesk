import { useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowRight, FiUser, FiUsers } from "react-icons/fi";

const RoleSelection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const categoryId = searchParams.get("category");

  const handleCustomer = () => {
    if (categoryId) {
      navigate(`/customer/register?category=${encodeURIComponent(categoryId)}`);
    } else {
      navigate("/customer/register");
    }
  };

  const handleProvider = () => {
    if (categoryId) {
      navigate(`/provider/register?category=${encodeURIComponent(categoryId)}`);
    } else {
      navigate("/provider/register");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
            HelpDesk
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Choose your role
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
            Select how you want to use HelpDesk to continue.
          </p>
        </div>

        {/* Role Selection */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {/* Customer */}
          <button
            type="button"
            onClick={handleCustomer}
            className="group rounded-2xl border border-slate-200 bg-white p-7 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FiUsers size={26} />
            </div>

            <h2 className="mt-6 text-xl font-bold text-slate-900">
              Become a Customer
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Find trusted local professionals and request the services you
              need.
            </p>

            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-blue-600">
              Continue as Customer
              <FiArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </div>
          </button>

          {/* Provider */}
          <button
            type="button"
            onClick={handleProvider}
            className="group rounded-2xl border border-slate-200 bg-white p-7 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-400 hover:shadow-lg"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <FiUser size={26} />
            </div>

            <h2 className="mt-6 text-xl font-bold text-slate-900">
              Become a Provider
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Offer your skills and services and connect with customers in your
              local area.
            </p>

            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-800">
              Continue as Provider
              <FiArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </div>
          </button>
        </div>

        {/* Back */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-sm font-medium text-slate-500 transition hover:text-blue-600"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;

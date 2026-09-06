import { Link } from "react-router-dom";
import {
  FiFacebook,
  FiInstagram,
  FiTwitter,
} from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        <div className="grid gap-10 md:grid-cols-4">

          {/* Brand */}
          <div className="md:col-span-2">
            <Link
              to="/"
              className="text-2xl font-bold"
            >
              Help<span className="text-blue-400">Desk</span>
            </Link>

            <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
              Find trusted local service providers around you.
              From everyday repairs to agricultural and
              construction services, HelpDesk connects you with
              the right professional.
            </p>

            <p className="mt-4 text-sm font-medium text-slate-300">
              तपाईंलाई जे चाहिन्छ, आफ्नो नजिकैबाट खोज्नुहोस्।
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-semibold">
              Explore
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
              <Link
                to="/"
                className="hover:text-white"
              >
                Home
              </Link>

              <Link
                to="/search"
                className="hover:text-white"
              >
                Find Services
              </Link>

              <a
                href="#categories"
                className="hover:text-white"
              >
                Categories
              </a>
            </div>
          </div>

          {/* Providers */}
          <div>
            <h3 className="text-sm font-semibold">
              For Providers
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
              <Link
                to="/provider/login"
                className="hover:text-white"
              >
                Provider Login
              </Link>

              <Link
                to="/provider/register"
                className="hover:text-white"
              >
                Become a Provider
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-5 border-t border-white/10 pt-6 sm:flex-row sm:items-center">

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} HelpDesk. All rights reserved.
          </p>

          <div className="flex gap-3">
            <button className="rounded-lg bg-white/5 p-2.5 text-slate-400 hover:bg-white/10 hover:text-white">
              <FiFacebook size={16} />
            </button>

            <button className="rounded-lg bg-white/5 p-2.5 text-slate-400 hover:bg-white/10 hover:text-white">
              <FiInstagram size={16} />
            </button>

            <button className="rounded-lg bg-white/5 p-2.5 text-slate-400 hover:bg-white/10 hover:text-white">
              <FiTwitter size={16} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
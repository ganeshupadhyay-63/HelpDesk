import { useState } from "react";
import {
  FiMapPin,
  FiSearch,
  FiArrowRight,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const HeroSearch = () => {
  const navigate = useNavigate();

  const [service, setService] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (service.trim()) {
      params.set("service", service.trim());
    }

    if (location.trim()) {
      params.set("location", location.trim());
    }

    navigate(
      params.toString()
        ? `/search?${params.toString()}`
        : "/search"
    );
  };

  return (
    <section className="relative overflow-hidden bg-slate-950">
      {/* Background decoration */}
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-4xl text-center">

          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Trusted local services near you
          </div>

          {/* Heading */}
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find the right service
            <span className="block text-blue-400">
              near you.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Find electricians, plumbers, mechanics, agricultural
            equipment, construction services and more from local
            professionals.
          </p>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="mx-auto mt-10 max-w-3xl rounded-2xl bg-white p-2 shadow-2xl"
          >
            <div className="flex flex-col gap-2 md:flex-row">

              {/* Service */}
              <div className="flex min-h-14 flex-1 items-center gap-3 rounded-xl border border-slate-200 px-4">
                <FiSearch
                  className="shrink-0 text-slate-400"
                  size={20}
                />

                <div className="flex-1 text-left">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    What do you need?
                  </label>

                  <input
                    type="text"
                    value={service}
                    onChange={(e) =>
                      setService(e.target.value)
                    }
                    placeholder="Electrician, plumber..."
                    className="mt-0.5 w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="flex min-h-14 flex-1 items-center gap-3 rounded-xl border border-slate-200 px-4">
                <FiMapPin
                  className="shrink-0 text-slate-400"
                  size={20}
                />

                <div className="flex-1 text-left">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Where?
                  </label>

                  <input
                    type="text"
                    value={location}
                    onChange={(e) =>
                      setLocation(e.target.value)
                    }
                    placeholder="City or location"
                    className="mt-0.5 w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Search button */}
              <button
                type="submit"
                className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-[0.98]"
              >
                Search
                <FiArrowRight size={17} />
              </button>
            </div>
          </form>

          {/* Popular */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="mr-1 text-slate-500">
              Popular:
            </span>

            {[
              "Electrician",
              "Plumber",
              "Mechanic",
              "Tractor",
              "JCB",
            ].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setService(item);
                }}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-400 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-300"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;
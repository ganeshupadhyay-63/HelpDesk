import {
  FiTool,
  FiZap,
  FiTruck,
  FiHome,
  FiSettings,
  FiDroplet,
  FiWind,
  FiMoreHorizontal,
} from "react-icons/fi";

const icons = {
  Electrician: FiZap,
  Plumber: FiDroplet,
  Mechanic: FiSettings,
  Carpenter: FiTool,
  Construction: FiHome,
  Tractor: FiTruck,
  Welder: FiWind,
  Others: FiMoreHorizontal,
};

const CategoryCard = ({ category, onClick }) => {
  const Icon = icons[category.name] || FiTool;

  return (
    <button
      type="button"
      onClick={() => onClick?.(category)}
      className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
        <Icon size={22} />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-900">
        {category.name}
      </h3>

      {category.description && (
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
          {category.description}
        </p>
      )}
    </button>
  );
};

export default CategoryCard;
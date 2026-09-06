import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Category from "../models/category.model.js";

dotenv.config();

const categories = [
  {
    name: "Electrician",
    slug: "electrician",
    description: "Electrical repair and installation services",
    icon: "Zap",
    isActive: true,
  },
  {
    name: "Plumber",
    slug: "plumber",
    description: "Water pipe, tap and plumbing services",
    icon: "Droplets",
    isActive: true,
  },
  {
    name: "Carpenter",
    slug: "carpenter",
    description: "Furniture and woodwork services",
    icon: "Hammer",
    isActive: true,
  },
  {
    name: "Painter",
    slug: "painter",
    description: "House and building painting services",
    icon: "Paintbrush",
    isActive: true,
  },
  {
    name: "Welder",
    slug: "welder",
    description: "Metal welding and fabrication services",
    icon: "Flame",
    isActive: true,
  },
  {
    name: "Mechanic",
    slug: "mechanic",
    description: "Vehicle repair and maintenance services",
    icon: "Wrench",
    isActive: true,
  },
  {
    name: "AC Technician",
    slug: "ac-technician",
    description: "AC installation, repair and maintenance",
    icon: "Snowflake",
    isActive: true,
  },
  {
    name: "Refrigerator Technician",
    slug: "refrigerator-technician",
    description: "Refrigerator repair and maintenance",
    icon: "Refrigerator",
    isActive: true,
  },
  {
    name: "Mobile Technician",
    slug: "mobile-technician",
    description: "Mobile phone repair services",
    icon: "Smartphone",
    isActive: true,
  },
  {
    name: "Tractor Service",
    slug: "tractor-service",
    description: "Tractor repair and agricultural services",
    icon: "Tractor",
    isActive: true,
  },
  {
    name: "Harvester Service",
    slug: "harvester-service",
    description: "Harvester and agricultural machinery services",
    icon: "Wheat",
    isActive: true,
  },
  {
    name: "JCB Service",
    slug: "jcb-service",
    description: "JCB and heavy equipment services",
    icon: "Construction",
    isActive: true,
  },
  {
    name: "Excavator Service",
    slug: "excavator-service",
    description: "Excavator and earthmoving services",
    icon: "Construction",
    isActive: true,
  },
  {
    name: "Crane Service",
    slug: "crane-service",
    description: "Crane and lifting services",
    icon: "Truck",
    isActive: true,
  },
  {
    name: "Towing Service",
    slug: "towing-service",
    description: "Vehicle towing and roadside assistance",
    icon: "Truck",
    isActive: true,
  },
  {
    name: "Labour Service",
    slug: "labour-service",
    description: "General labour and helper services",
    icon: "Users",
    isActive: true,
  },
  {
    name: "Water Pump Service",
    slug: "water-pump-service",
    description: "Water pump installation and repair",
    icon: "Waves",
    isActive: true,
  },
  {
    name: "Sprayer Service",
    slug: "sprayer-service",
    description: "Agricultural spraying machine services",
    icon: "SprayCan",
    isActive: true,
  },
  {
    name: "Rotavator Service",
    slug: "rotavator-service",
    description: "Rotavator and agricultural machine services",
    icon: "Settings",
    isActive: true,
  },
  {
    name: "Thresher Service",
    slug: "thresher-service",
    description: "Thresher and agricultural machinery services",
    icon: "Settings",
    isActive: true,
  },
];

const seedCategories = async () => {
  try {
    await connectDB();

    for (const category of categories) {
      await Category.findOneAndUpdate(
        { slug: category.slug },
        category,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      );
    }

    console.log("✅ Categories seeded successfully");
    console.log(`✅ Total categories: ${categories.length}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Category seed failed:", error.message);
    process.exit(1);
  }
};

seedCategories();
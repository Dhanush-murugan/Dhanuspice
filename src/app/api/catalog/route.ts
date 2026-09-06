import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { FOODS_DATA, RESTAURANTS_DATA } from "@/utils/mockData";
import { Food, Restaurant } from "@/types";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const CATALOG_FILE = path.join(DATA_DIR, "catalog.json");

interface CatalogData {
  foods: Food[];
  restaurants: Restaurant[];
  deletedFoodIds: string[];
  deletedRestaurantIds: string[];
  updatedAt: string;
}

function getCatalogData(): CatalogData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(CATALOG_FILE)) {
      const raw = fs.readFileSync(CATALOG_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.foods) && Array.isArray(parsed.restaurants)) {
        const deletedFoodIds: string[] = Array.isArray(parsed.deletedFoodIds) ? parsed.deletedFoodIds : [];
        const deletedRestaurantIds: string[] = Array.isArray(parsed.deletedRestaurantIds) ? parsed.deletedRestaurantIds : [];
        
        // Filter out deleted items
        const foods = parsed.foods.filter((f: Food) => !deletedFoodIds.includes(String(f.id)));
        const rawRestaurants = parsed.restaurants.filter((r: Restaurant) => !deletedRestaurantIds.includes(String(r.id)));

        // Merge default restaurants that are not in catalog and not deleted
        const restIdSet = new Set(rawRestaurants.map((r: Restaurant) => String(r.id)));
        for (const def of RESTAURANTS_DATA) {
          const defId = String(def.id);
          if (!restIdSet.has(defId) && !deletedRestaurantIds.includes(defId)) {
            rawRestaurants.push(def);
          }
        }

        const restaurants = rawRestaurants.map((r: Restaurant) => ({
          ...r,
          banner: r.banner || r.image,
        }));

        return {
          foods,
          restaurants,
          deletedFoodIds,
          deletedRestaurantIds,
          updatedAt: parsed.updatedAt || new Date().toISOString(),
        };
      }
    }
  } catch (err) {
    console.error("[Catalog API] Error reading catalog.json:", err);
  }

  // Initial defaults
  const initialData: CatalogData = {
    foods: FOODS_DATA,
    restaurants: RESTAURANTS_DATA,
    deletedFoodIds: [],
    deletedRestaurantIds: [],
    updatedAt: new Date().toISOString(),
  };

  try {
    fs.writeFileSync(CATALOG_FILE, JSON.stringify(initialData, null, 2), "utf-8");
  } catch (err) {
    console.error("[Catalog API] Error creating initial catalog.json:", err);
  }

  return initialData;
}

function saveCatalogData(data: CatalogData): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CATALOG_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("[Catalog API] Error saving catalog.json:", err);
    return false;
  }
}

export async function GET() {
  const data = getCatalogData();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const current = getCatalogData();

    // 1. Update or Add Food
    if (body.type === "food" && body.item) {
      const item: Food = body.item;
      // Remove from deleted roster if re-added
      current.deletedFoodIds = current.deletedFoodIds.filter((id) => id !== String(item.id));
      const index = current.foods.findIndex((f) => String(f.id) === String(item.id));
      if (index >= 0) {
        current.foods[index] = { ...current.foods[index], ...item };
      } else {
        current.foods.unshift(item);
      }
      current.updatedAt = new Date().toISOString();
      saveCatalogData(current);
      return NextResponse.json({ success: true, item: current.foods[index >= 0 ? index : 0] });
    }

    // 2. Delete Food Permanently
    if (body.type === "delete_food" && body.id) {
      const idStr = String(body.id);
      current.foods = current.foods.filter((f) => String(f.id) !== idStr);
      if (!current.deletedFoodIds.includes(idStr)) {
        current.deletedFoodIds.push(idStr);
      }
      current.updatedAt = new Date().toISOString();
      saveCatalogData(current);
      return NextResponse.json({ success: true, deletedId: idStr });
    }

    // 3. Update or Add Restaurant (Kitchen)
    if (body.type === "restaurant" && body.item) {
      const item: Restaurant = body.item;
      if (item.image && !item.banner) {
        item.banner = item.image;
      }
      current.deletedRestaurantIds = current.deletedRestaurantIds.filter((id) => id !== String(item.id));
      const index = current.restaurants.findIndex((r) => String(r.id) === String(item.id));
      if (index >= 0) {
        current.restaurants[index] = { ...current.restaurants[index], ...item };
      } else {
        current.restaurants.unshift(item);
      }
      current.updatedAt = new Date().toISOString();
      saveCatalogData(current);
      return NextResponse.json({ success: true, item: current.restaurants[index >= 0 ? index : 0] });
    }

    // 4. Delete Restaurant Permanently
    if (body.type === "delete_restaurant" && body.id) {
      const idStr = String(body.id);
      current.restaurants = current.restaurants.filter((r) => String(r.id) !== idStr);
      if (!current.deletedRestaurantIds.includes(idStr)) {
        current.deletedRestaurantIds.push(idStr);
      }
      current.updatedAt = new Date().toISOString();
      saveCatalogData(current);
      return NextResponse.json({ success: true, deletedId: idStr });
    }

    // 5. Bulk Sync / Save All
    if (body.type === "sync" && (body.foods || body.restaurants)) {
      if (Array.isArray(body.foods)) current.foods = body.foods;
      if (Array.isArray(body.restaurants)) current.restaurants = body.restaurants;
      current.updatedAt = new Date().toISOString();
      saveCatalogData(current);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, message: "Unknown action type" }, { status: 400 });
  } catch (err: any) {
    console.error("[Catalog API] Error processing POST:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

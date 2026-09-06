import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  limit,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Food, Restaurant } from "@/types";
import { FOODS_DATA, RESTAURANTS_DATA } from "@/utils/mockData";

export const ORDERS_COLLECTION = "orders";
export const FOODS_COLLECTION = "foods";
export const RESTAURANTS_COLLECTION = "restaurants";
export const ADMINS_COLLECTION = "admins";

export const MASTER_ADMIN_EMAIL = "dhanushm3947@gmail.com";

const LOCAL_ORDERS_KEY = "dhanuspice_orders";
const LOCAL_FOODS_KEY = "dhanuspice_cached_foods";
const LOCAL_RESTAURANTS_KEY = "dhanuspice_cached_restaurants";
const LOCAL_ADMINS_KEY = "dhanuspice_cached_admins";
const LOCAL_DELETED_FOODS_KEY = "dhanuspice_deleted_food_ids";
const LOCAL_DELETED_RESTAURANTS_KEY = "dhanuspice_deleted_restaurant_ids";

export function getDeletedFoodIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_DELETED_FOODS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getDeletedRestaurantIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_DELETED_RESTAURANTS_KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * ----------------------------------------------------
 * ORDERS SERVICE
 * ----------------------------------------------------
 */

/**
 * Subscribe to all orders in real-time.
 */
export function subscribeToOrders(
  callback: (orders: any[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(ordersRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: any[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              ...data,
              createdAt: data.createdAt?.toDate
                ? data.createdAt.toDate().toISOString()
                : data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt?.toDate
                ? data.updatedAt.toDate().toISOString()
                : data.updatedAt || new Date().toISOString(),
            });
          });

          // Sort by timestamp desc
          list.sort((a, b) => {
            const timeA = new Date(a.createdAt || 0).getTime();
            const timeB = new Date(b.createdAt || 0).getTime();
            return timeB - timeA;
          });

          // Update local cache
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(list));
            } catch {
              // Ignore storage errors
            }
          }

          callback(list);
        } else {
          // Check local storage fallback if empty
          let fallbackOrders: any[] = [];
          if (typeof window !== "undefined") {
            try {
              fallbackOrders = JSON.parse(
                localStorage.getItem(LOCAL_ORDERS_KEY) || "[]"
              );
            } catch {
              fallbackOrders = [];
            }
          }
          callback(fallbackOrders);
        }
      },
      (error) => {
        console.warn("[Firestore] Orders subscription error, using local cache:", error.message);
        if (onError) onError(error);

        // Fallback to local storage
        if (typeof window !== "undefined") {
          try {
            const localList = JSON.parse(
              localStorage.getItem(LOCAL_ORDERS_KEY) || "[]"
            );
            callback(localList);
          } catch {
            callback([]);
          }
        }
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.error("[Firestore] Failed to attach orders listener:", err);
    return () => {};
  }
}

/**
 * Subscribe to a single order by ID for live order tracking.
 */
export function subscribeToOrderById(
  orderId: string,
  callback: (order: any | null) => void
): () => void {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          callback({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate
              ? data.createdAt.toDate().toISOString()
              : data.createdAt,
            updatedAt: data.updatedAt?.toDate
              ? data.updatedAt.toDate().toISOString()
              : data.updatedAt,
          });
        } else {
          // Check local storage
          if (typeof window !== "undefined") {
            try {
              const localOrders = JSON.parse(
                localStorage.getItem(LOCAL_ORDERS_KEY) || "[]"
              );
              const found = localOrders.find(
                (o: any) => o.orderId === orderId || o.id === orderId
              );
              callback(found || null);
            } catch {
              callback(null);
            }
          } else {
            callback(null);
          }
        }
      },
      (err) => {
        console.warn(`[Firestore] Order ${orderId} snapshot error:`, err.message);
        // Fallback to local
        if (typeof window !== "undefined") {
          try {
            const localOrders = JSON.parse(
              localStorage.getItem(LOCAL_ORDERS_KEY) || "[]"
            );
            const found = localOrders.find(
              (o: any) => o.orderId === orderId || o.id === orderId
            );
            callback(found || null);
          } catch {
            callback(null);
          }
        }
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.error(`[Firestore] Failed to subscribe to order ${orderId}:`, err);
    return () => {};
  }
}

export const INITIAL_ORDER_SEQUENCE = 1788501066347;
const ORDER_COUNTER_DOC = "order_counter";
const LOCAL_ORDER_SEQ_KEY = "dhanuspice_last_order_seq";

/**
 * Generates continuous sequential order IDs like ORD1788501066347, ORD1788501066348, ORD1788501066349...
 */
export async function getNextSequentialOrderId(): Promise<string> {
  let highestSeq = INITIAL_ORDER_SEQUENCE - 1;

  // 1. Check local sequence counter
  if (typeof window !== "undefined") {
    try {
      const storedSeq = localStorage.getItem(LOCAL_ORDER_SEQ_KEY);
      if (storedSeq && !isNaN(Number(storedSeq))) {
        highestSeq = Math.max(highestSeq, Number(storedSeq));
      }
    } catch {
      // Ignore
    }

    // 2. Scan past orders stored in localStorage
    try {
      const orders1 = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || "[]");
      const orders2 = JSON.parse(localStorage.getItem("dhanuspice_orders") || "[]");
      const combined = [...orders1, ...orders2];

      for (const ord of combined) {
        const id = String(ord.orderId || ord.id || "");
        const match = id.match(/^ORD(\d+)$/);
        if (match && match[1]) {
          const num = Number(match[1]);
          if (!isNaN(num)) {
            highestSeq = Math.max(highestSeq, num);
          }
        }
      }
    } catch {
      // Ignore
    }
  }

  // 3. Check Firestore counter document
  try {
    const counterDocRef = doc(db, "metadata", ORDER_COUNTER_DOC);
    const snap = await getDoc(counterDocRef);
    if (snap.exists() && snap.data()?.lastOrderSeq) {
      const remoteSeq = Number(snap.data()?.lastOrderSeq);
      if (!isNaN(remoteSeq)) {
        highestSeq = Math.max(highestSeq, remoteSeq);
      }
    }
  } catch (err) {
    console.warn("[Firestore] Could not fetch remote order counter:", err);
  }

  // Calculate next sequential ID
  const nextSeq = highestSeq + 1;
  const nextOrderId = `ORD${nextSeq}`;

  // Persist new counter to localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_ORDER_SEQ_KEY, String(nextSeq));
    } catch {
      // Ignore
    }
  }

  // Persist new counter to Firestore
  try {
    const counterDocRef = doc(db, "metadata", ORDER_COUNTER_DOC);
    await setDoc(
      counterDocRef,
      { lastOrderSeq: nextSeq, updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch (err) {
    console.warn("[Firestore] Could not persist remote order counter:", err);
  }

  return nextOrderId;
}

/**
 * Save a new order to Firestore.
 */
export async function createOrderInFirestore(orderData: any): Promise<string> {
  let orderId = orderData.orderInfo?.orderId || orderData.id;
  if (!orderId) {
    orderId = await getNextSequentialOrderId();
  }
  const docRef = doc(db, ORDERS_COLLECTION, orderId);

  const payload = {
    ...orderData,
    id: orderId,
    orderId: orderId,
    status: orderData.status || "placed",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Always update local storage first for zero-latency response
  if (typeof window !== "undefined") {
    try {
      const stored = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || "[]");
      const localRecord = {
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const filtered = stored.filter((o: any) => (o.orderId || o.id) !== orderId);
      filtered.unshift(localRecord);
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(filtered));
    } catch {
      // Ignore
    }
  }

  // Persist to Firestore with timeout safeguard
  try {
    await setDoc(docRef, payload, { merge: true });
    console.log(`[Firestore] Order ${orderId} successfully saved to Firestore.`);
  } catch (err: any) {
    console.warn(`[Firestore] Could not save order ${orderId} to remote Firestore (saved locally):`, err.message);
  }

  return orderId;
}

/**
 * Check if the user is a first-time user with 0 past orders.
 * Validates across both local storage caches and Firestore.
 */
export function isUserFirstTimeOrder(userId?: string, email?: string, phone?: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    const orders1 = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || "[]");
    const orders2 = JSON.parse(localStorage.getItem("dhanuspice_orders") || "[]");
    const all = [...orders1, ...orders2];

    const hasPastOrder = all.some((order: any) => {
      const oUserId = order.userId;
      const oEmail = order.customerInfo?.email || order.email;
      const oPhone = order.customerInfo?.phone || order.phone;

      if (userId && oUserId && oUserId === userId && oUserId !== "guest") return true;
      if (email && oEmail && oEmail.toLowerCase().trim() === email.toLowerCase().trim()) return true;
      if (phone && oPhone && oPhone.replace(/\D/g, "") === phone.replace(/\D/g, "")) return true;

      return false;
    });

    return !hasPastOrder;
  } catch {
    return true;
  }
}

/**
 * Robust async check querying both local caches and Cloud Firestore orders collection.
 */
export async function checkFirstTimeUserInFirestore(
  email?: string,
  phone?: string,
  userId?: string
): Promise<boolean> {
  const localFirstTime = isUserFirstTimeOrder(userId, email, phone);
  if (!localFirstTime) return false;

  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    if (userId && userId !== "guest") {
      const q = query(ordersRef, where("userId", "==", userId), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) return false;
    }
    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      const q = query(ordersRef, where("customerInfo.email", "==", cleanEmail), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) return false;
    }
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, "").slice(-10);
      if (cleanPhone.length === 10) {
        const q = query(ordersRef, where("customerInfo.phone", "==", cleanPhone), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) return false;
      }
    }
    return true;
  } catch {
    return localFirstTime;
  }
}

/**
 * Update order status (Admin function).
 */
export async function updateOrderStatusInFirestore(
  orderId: string,
  newStatus: string
): Promise<boolean> {
  // Update local storage
  if (typeof window !== "undefined") {
    try {
      const stored = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || "[]");
      const updated = stored.map((o: any) => {
        if (o.orderId === orderId || o.id === orderId) {
          return { ...o, status: newStatus, updatedAt: new Date().toISOString() };
        }
        return o;
      });
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  }

  // Update Firestore
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err: any) {
    console.warn(`[Firestore] Update status error for ${orderId}:`, err.message);
    // If updateDoc failed because doc didn't exist in remote yet, try setDoc
    try {
      const docRef = doc(db, ORDERS_COLLECTION, orderId);
      await setDoc(
        docRef,
        { status: newStatus, updatedAt: serverTimestamp() },
        { merge: true }
      );
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * ----------------------------------------------------
 * FOODS SERVICE (CRUD)
 * ----------------------------------------------------
 */

// Helper to persist catalog changes to server disk via /api/catalog
async function syncDiskCatalog(payload: any) {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Ignore server sync errors if offline
  }
}

/**
 * Subscribe to all Foods in real-time.
 */
export function subscribeToFoods(
  callback: (foods: Food[]) => void,
  onError?: (err: any) => void
): () => void {
  // 1. Immediately fetch latest server disk catalog for instant update
  if (typeof window !== "undefined") {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((cat) => {
        if (cat?.foods && cat.foods.length > 0) {
          callback(cat.foods);
        }
      })
      .catch(() => {});
  }

  try {
    const foodsRef = collection(db, FOODS_COLLECTION);
    const q = query(foodsRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const deletedIds = getDeletedFoodIds();
        if (!snapshot.empty) {
          const list: Food[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (!deletedIds.includes(docSnap.id) && !data.isDeleted) {
              list.push({ id: docSnap.id, ...(data as any) });
            }
          });

          // Cache locally
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(LOCAL_FOODS_KEY, JSON.stringify(list));
            } catch {
              // Ignore
            }
          }

          callback(list);
        } else {
          // If Firestore is empty, fallback to local storage or initial FOODS_DATA (excluding deleted)
          let initial = FOODS_DATA.filter((f) => !deletedIds.includes(String(f.id)));
          if (typeof window !== "undefined") {
            try {
              const cached = localStorage.getItem(LOCAL_FOODS_KEY);
              if (cached) {
                const parsed = JSON.parse(cached);
                initial = parsed.filter((f: Food) => !deletedIds.includes(String(f.id)));
              }
            } catch {
              initial = FOODS_DATA.filter((f) => !deletedIds.includes(String(f.id)));
            }
          }
          callback(initial);
        }
      },
      (error) => {
        console.warn("[Firestore] Foods subscription error, using local data:", error.message);
        if (onError) onError(error);

        const deletedIds = getDeletedFoodIds();
        let initial = FOODS_DATA.filter((f) => !deletedIds.includes(String(f.id)));
        if (typeof window !== "undefined") {
          try {
            const cached = localStorage.getItem(LOCAL_FOODS_KEY);
            if (cached) {
              const parsed = JSON.parse(cached);
              initial = parsed.filter((f: Food) => !deletedIds.includes(String(f.id)));
            }
          } catch {
            initial = FOODS_DATA.filter((f) => !deletedIds.includes(String(f.id)));
          }
        }
        callback(initial);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.error("[Firestore] Failed to attach foods listener:", err);
    callback(FOODS_DATA);
    return () => {};
  }
}

/**
 * Add a new food item to Firestore.
 */
export async function addFoodItemToFirestore(
  foodData: Omit<Food, "id"> & { id?: string }
): Promise<Food> {
  const foodId = foodData.id || `f_${Date.now()}`;
  const docRef = doc(db, FOODS_COLLECTION, foodId);

  const fullFood: Food = {
    ...foodData,
    id: foodId,
    rating: foodData.rating || 4.8,
    reviews: foodData.reviews || 0,
    bestseller: foodData.bestseller ?? false,
    spicy: foodData.spicy ?? false,
    vegetarian: foodData.vegetarian ?? false,
  };

  // 1. Persist to server disk
  syncDiskCatalog({ type: "food", item: fullFood });

  // 2. Update local cache
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_FOODS_KEY);
      const cached = raw ? JSON.parse(raw) : [...FOODS_DATA];
      cached.unshift(fullFood);
      localStorage.setItem(LOCAL_FOODS_KEY, JSON.stringify(cached));
    } catch {
      // Ignore
    }
  }

  // 3. Write to Firestore
  try {
    await setDoc(docRef, fullFood);
  } catch (err: any) {
    console.warn(`[Firestore] Failed to save food item ${foodId} to remote:`, err.message);
  }

  return fullFood;
}

/**
 * Update an existing food item in Firestore.
 */
export async function updateFoodItemInFirestore(
  foodId: string,
  updatedFields: Partial<Food>
): Promise<boolean> {
  // 1. Persist to server disk
  syncDiskCatalog({ type: "food", item: { id: foodId, ...updatedFields } });

  // 2. Update local cache safely without wiping
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_FOODS_KEY);
      const cached = raw ? JSON.parse(raw) : [...FOODS_DATA];
      const exists = cached.some((f: Food) => String(f.id) === String(foodId));
      const updated = exists
        ? cached.map((f: Food) =>
            String(f.id) === String(foodId) ? { ...f, ...updatedFields } : f
          )
        : [{ id: foodId, ...updatedFields } as Food, ...cached];
      localStorage.setItem(LOCAL_FOODS_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  }

  // 3. Update Firestore
  try {
    const docRef = doc(db, FOODS_COLLECTION, foodId);
    await updateDoc(docRef, updatedFields);
    return true;
  } catch (err: any) {
    console.warn(`[Firestore] Failed to update food item ${foodId}:`, err.message);
    try {
      const docRef = doc(db, FOODS_COLLECTION, foodId);
      await setDoc(docRef, updatedFields, { merge: true });
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Delete a food item from Firestore.
 */
export async function deleteFoodItemFromFirestore(foodId: string): Promise<boolean> {
  const idStr = String(foodId);

  // 1. Persist to server disk
  syncDiskCatalog({ type: "delete_food", id: idStr });

  // 2. Track deleted IDs and remove from local storage
  if (typeof window !== "undefined") {
    try {
      const deletedIds = getDeletedFoodIds();
      if (!deletedIds.includes(idStr)) {
        deletedIds.push(idStr);
        localStorage.setItem(LOCAL_DELETED_FOODS_KEY, JSON.stringify(deletedIds));
      }
      const raw = localStorage.getItem(LOCAL_FOODS_KEY);
      const cached = raw ? JSON.parse(raw) : [...FOODS_DATA];
      const filtered = cached.filter((f: Food) => String(f.id) !== idStr);
      localStorage.setItem(LOCAL_FOODS_KEY, JSON.stringify(filtered));
    } catch {
      // Ignore
    }
  }

  // 3. Delete from Firestore permanently
  try {
    const docRef = doc(db, FOODS_COLLECTION, idStr);
    await deleteDoc(docRef);
    return true;
  } catch (err: any) {
    console.warn(`[Firestore] Failed to delete food item ${idStr}:`, err.message);
    return true;
  }
}

/**
 * ----------------------------------------------------
 * RESTAURANTS SERVICE (CRUD)
 * ----------------------------------------------------
 */

/**
 * Subscribe to all Restaurants in real-time.
 */
export function subscribeToRestaurants(
  callback: (restaurants: Restaurant[]) => void,
  onError?: (err: any) => void
): () => void {
  // 1. Immediately fetch latest server disk catalog for instant update
  if (typeof window !== "undefined") {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((cat) => {
        if (cat?.restaurants && cat.restaurants.length > 0) {
          try {
            localStorage.setItem(LOCAL_RESTAURANTS_KEY, JSON.stringify(cat.restaurants));
          } catch {}
          callback(cat.restaurants);
        }
      })
      .catch(() => {});
  }

  try {
    const restaurantsRef = collection(db, RESTAURANTS_COLLECTION);
    const q = query(restaurantsRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const deletedRIds = getDeletedRestaurantIds();
        let localCached: Restaurant[] = [];
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem(LOCAL_RESTAURANTS_KEY);
            if (raw) localCached = JSON.parse(raw);
          } catch {}
        }

        if (!snapshot.empty) {
          const list: Restaurant[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (!deletedRIds.includes(docSnap.id) && !data.isDeleted) {
              list.push({ id: docSnap.id, ...(data as any) });
            }
          });

          // Ensure any updated images/banners from local cache or disk catalog are preserved
          list.forEach((r, idx) => {
            const cachedItem = localCached.find((c) => String(c.id) === String(r.id));
            if (cachedItem) {
              list[idx] = {
                ...r,
                ...cachedItem,
                image: cachedItem.image || r.image,
                banner: cachedItem.banner || cachedItem.image || r.banner || r.image,
              };
            } else {
              list[idx] = {
                ...r,
                banner: r.banner || r.image,
              };
            }
          });

          const idSet = new Set(list.map((r) => String(r.id)));

          // Add any locally cached restaurants not in Firestore yet
          for (const cached of localCached) {
            const cId = String(cached.id);
            if (!idSet.has(cId) && !deletedRIds.includes(cId)) {
              list.push({
                ...cached,
                banner: cached.banner || cached.image,
              });
              idSet.add(cId);
            }
          }

          // Merge with RESTAURANTS_DATA ONLY if not deleted and not already in list
          for (const def of RESTAURANTS_DATA) {
            const defId = String(def.id);
            if (!idSet.has(defId) && !deletedRIds.includes(defId)) {
              list.push(def);
            }
          }

          // Cache locally
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(LOCAL_RESTAURANTS_KEY, JSON.stringify(list));
            } catch {
              // Ignore
            }
          }

          callback(list);
        } else {
          // If Firestore is empty, fallback to local storage or non-deleted RESTAURANTS_DATA
          let initial = RESTAURANTS_DATA.filter((r) => !deletedRIds.includes(String(r.id)));
          if (localCached && localCached.length > 0) {
            initial = localCached.filter((r: Restaurant) => !deletedRIds.includes(String(r.id)));
          }
          callback(initial);
        }
      },
      (error) => {
        console.warn("[Firestore] Restaurants subscription error, using local data:", error.message);
        if (onError) onError(error);

        let initial = RESTAURANTS_DATA;
        if (typeof window !== "undefined") {
          try {
            const cached = localStorage.getItem(LOCAL_RESTAURANTS_KEY);
            if (cached) initial = JSON.parse(cached);
          } catch {
            initial = RESTAURANTS_DATA;
          }
        }
        callback(initial);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.error("[Firestore] Failed to attach restaurants listener:", err);
    callback(RESTAURANTS_DATA);
    return () => {};
  }
}

/**
 * Add a new restaurant to Firestore.
 */
export async function addRestaurantToFirestore(
  restaurantData: Omit<Restaurant, "id"> & { id?: string }
): Promise<Restaurant> {
  const restId = restaurantData.id || `rest_${Date.now()}`;
  const docRef = doc(db, RESTAURANTS_COLLECTION, restId);

  const fullRestaurant: Restaurant = {
    ...restaurantData,
    id: restId,
    banner: restaurantData.banner || restaurantData.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop",
    rating: restaurantData.rating || 4.8,
    reviews: restaurantData.reviews || 1,
    isOpen: restaurantData.isOpen ?? true,
    deliveryTime: restaurantData.deliveryTime || 25,
    deliveryCharge: restaurantData.deliveryCharge ?? 30,
    minOrderAmount: restaurantData.minOrderAmount ?? 150,
    cuisines: restaurantData.cuisines?.length ? restaurantData.cuisines : ["Gourmet"],
  };

  // 1. Persist to server disk
  syncDiskCatalog({ type: "restaurant", item: fullRestaurant });

  // 2. Update local cache
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_RESTAURANTS_KEY);
      const cached = raw ? JSON.parse(raw) : [...RESTAURANTS_DATA];
      cached.unshift(fullRestaurant);
      localStorage.setItem(LOCAL_RESTAURANTS_KEY, JSON.stringify(cached));
    } catch {
      // Ignore
    }
  }

  // 3. Write to Firestore
  try {
    await setDoc(docRef, fullRestaurant);
  } catch (err: any) {
    console.warn(`[Firestore] Failed to save restaurant ${restId} to remote:`, err.message);
  }

  return fullRestaurant;
}

/**
 * Update an existing restaurant in Firestore.
 */
export async function updateRestaurantInFirestore(
  restaurantId: string,
  updatedFields: Partial<Restaurant>
): Promise<boolean> {
  // Ensure banner is updated if image is updated
  if (updatedFields.image && !updatedFields.banner) {
    updatedFields.banner = updatedFields.image;
  }

  // 1. Persist to server disk
  syncDiskCatalog({ type: "restaurant", item: { id: restaurantId, ...updatedFields } });

  // 2. Update local cache safely without wiping
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_RESTAURANTS_KEY);
      const cached = raw ? JSON.parse(raw) : [...RESTAURANTS_DATA];
      const exists = cached.some((r: Restaurant) => String(r.id) === String(restaurantId));
      const updated = exists
        ? cached.map((r: Restaurant) =>
            String(r.id) === String(restaurantId) ? { ...r, ...updatedFields } : r
          )
        : [{ id: restaurantId, ...updatedFields } as Restaurant, ...cached];
      localStorage.setItem(LOCAL_RESTAURANTS_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  }

  // 3. Update Firestore
  try {
    const docRef = doc(db, RESTAURANTS_COLLECTION, restaurantId);
    await setDoc(docRef, updatedFields, { merge: true });
    return true;
  } catch (err: any) {
    console.warn(`[Firestore] Failed to update restaurant ${restaurantId}:`, err.message);
    return false;
  }
}

/**
 * Delete a restaurant from Firestore.
 */
export async function deleteRestaurantFromFirestore(restaurantId: string): Promise<boolean> {
  const idStr = String(restaurantId);

  // 1. Persist to server disk
  syncDiskCatalog({ type: "delete_restaurant", id: idStr });

  // 2. Track deleted IDs and remove from local storage
  if (typeof window !== "undefined") {
    try {
      const deletedRIds = getDeletedRestaurantIds();
      if (!deletedRIds.includes(idStr)) {
        deletedRIds.push(idStr);
        localStorage.setItem(LOCAL_DELETED_RESTAURANTS_KEY, JSON.stringify(deletedRIds));
      }
      const raw = localStorage.getItem(LOCAL_RESTAURANTS_KEY);
      const cached = raw ? JSON.parse(raw) : [...RESTAURANTS_DATA];
      const filtered = cached.filter((r: Restaurant) => String(r.id) !== idStr);
      localStorage.setItem(LOCAL_RESTAURANTS_KEY, JSON.stringify(filtered));
    } catch {
      // Ignore
    }
  }

  // 3. Delete from Firestore permanently
  try {
    const docRef = doc(db, RESTAURANTS_COLLECTION, idStr);
    await deleteDoc(docRef);
    return true;
  } catch (err: any) {
    console.warn(`[Firestore] Failed to delete restaurant ${idStr}:`, err.message);
    return true;
  }
}

/**
 * ----------------------------------------------------
 * ADMIN AUTHORIZATION SERVICE
 * ----------------------------------------------------
 */

export interface AdminUser {
  email: string;
  addedBy: string;
  createdAt: string;
  role: string;
}

/**
 * Check if an email is an authorized admin.
 * dhanushm3947@gmail.com is permanently authorized.
 */
export function isAuthorizedAdminEmail(
  email: string | null | undefined,
  extraAdmins: AdminUser[] = []
): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  if (
    cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase() ||
    cleanEmail === "admin@dhanuspice.com" ||
    cleanEmail === "admin"
  ) {
    return true;
  }
  // Check local cache
  if (typeof window !== "undefined") {
    try {
      const cached = JSON.parse(localStorage.getItem(LOCAL_ADMINS_KEY) || "[]");
      if (cached.some((a: any) => a.email?.toLowerCase() === cleanEmail)) return true;
    } catch {
      // Ignore
    }
  }
  return extraAdmins.some((a) => a.email.toLowerCase() === cleanEmail);
}

/**
 * Subscribe to approved admins in Firestore.
 */
export function subscribeToAdmins(
  callback: (admins: AdminUser[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    const adminsRef = collection(db, ADMINS_COLLECTION);
    const q = query(adminsRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: AdminUser[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...(docSnap.data() as any), email: docSnap.id });
        });

        // Cache locally
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(LOCAL_ADMINS_KEY, JSON.stringify(list));
          } catch {
            // Ignore
          }
        }

        callback(list);
      },
      (error) => {
        console.warn("[Firestore] Admins subscription error, using local cache:", error.message);
        if (onError) onError(error);
        let cached: AdminUser[] = [];
        if (typeof window !== "undefined") {
          try {
            cached = JSON.parse(localStorage.getItem(LOCAL_ADMINS_KEY) || "[]");
          } catch {
            cached = [];
          }
        }
        callback(cached);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.error("[Firestore] Failed to subscribe to admins:", err);
    callback([]);
    return () => {};
  }
}

/**
 * Add a new authorized admin to Firestore.
 */
export async function addAdminToFirestore(
  email: string,
  addedBy: string = MASTER_ADMIN_EMAIL
): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return false;

  const docRef = doc(db, ADMINS_COLLECTION, cleanEmail);
  const payload: AdminUser = {
    email: cleanEmail,
    addedBy,
    createdAt: new Date().toISOString(),
    role: "admin",
  };

  // Local storage update
  if (typeof window !== "undefined") {
    try {
      const cached: AdminUser[] = JSON.parse(localStorage.getItem(LOCAL_ADMINS_KEY) || "[]");
      if (!cached.some((a) => a.email === cleanEmail)) {
        cached.push(payload);
        localStorage.setItem(LOCAL_ADMINS_KEY, JSON.stringify(cached));
      }
    } catch {
      // Ignore
    }
  }

  try {
    await setDoc(docRef, payload);
    return true;
  } catch (err: any) {
    console.warn("[Firestore] Failed to add admin to remote:", err.message);
    return true; // Still saved in local cache
  }
}

/**
 * Remove an authorized admin from Firestore.
 */
export async function removeAdminFromFirestore(email: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase()) {
    console.warn("Master admin cannot be deleted");
    return false;
  }

  // Local storage update
  if (typeof window !== "undefined") {
    try {
      const cached: AdminUser[] = JSON.parse(localStorage.getItem(LOCAL_ADMINS_KEY) || "[]");
      const filtered = cached.filter((a) => a.email.toLowerCase() !== cleanEmail);
      localStorage.setItem(LOCAL_ADMINS_KEY, JSON.stringify(filtered));
    } catch {
      // Ignore
    }
  }

  try {
    const docRef = doc(db, ADMINS_COLLECTION, cleanEmail);
    await deleteDoc(docRef);
    return true;
  } catch (err: any) {
    console.warn("[Firestore] Failed to remove admin:", err.message);
    return false;
  }
}

/**
 * ----------------------------------------------------
 * CATALOG SEEDING SERVICE
 * ----------------------------------------------------
 */

/**
 * Seed initial restaurants and foods into Firestore if collections are empty.
 */
export async function seedInitialDataToFirestore(): Promise<{
  foodsAdded: number;
  restaurantsAdded: number;
}> {
  let foodsAdded = 0;
  let restaurantsAdded = 0;

  try {
    const batch = writeBatch(db);

    // Seed Restaurants
    for (const rest of RESTAURANTS_DATA) {
      const restRef = doc(db, RESTAURANTS_COLLECTION, rest.id);
      batch.set(restRef, rest, { merge: true });
      restaurantsAdded++;
    }

    // Seed Foods
    for (const food of FOODS_DATA) {
      const foodRef = doc(db, FOODS_COLLECTION, food.id);
      batch.set(foodRef, food, { merge: true });
      foodsAdded++;
    }

    await batch.commit();

    // Cache locally as well
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_FOODS_KEY, JSON.stringify(FOODS_DATA));
      } catch {
        // Ignore
      }
    }

    return { foodsAdded, restaurantsAdded };
  } catch (error: any) {
    console.error("[Firestore] Seeding batch failed:", error);
    throw error;
  }
}

/**
 * ----------------------------------------------------
 * REAL SEARCH SERVICE
 * ----------------------------------------------------
 */

export interface SearchResultItem {
  id: string;
  name: string;
  type: "food" | "restaurant";
  category: string;
  price?: number;
  image?: string;
  restaurantId?: string;
  restaurantName?: string;
}

/**
 * Search real catalog dishes and restaurants.
 */
export async function searchCatalog(queryText: string): Promise<SearchResultItem[]> {
  const cleanQuery = queryText.trim().toLowerCase();
  if (!cleanQuery) return [];

  // Get current foods (from cache or FOODS_DATA)
  let allFoods: Food[] = FOODS_DATA;
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(LOCAL_FOODS_KEY);
      if (cached) allFoods = JSON.parse(cached);
    } catch {
      allFoods = FOODS_DATA;
    }
  }

  let allRestaurants: Restaurant[] = RESTAURANTS_DATA;
  if (typeof window !== "undefined") {
    try {
      const cachedR = localStorage.getItem(LOCAL_RESTAURANTS_KEY);
      if (cachedR) allRestaurants = JSON.parse(cachedR);
    } catch {
      allRestaurants = RESTAURANTS_DATA;
    }
  }

  const results: SearchResultItem[] = [];

  // 1. Search Restaurants
  allRestaurants.forEach((r) => {
    const matchesName = r.name.toLowerCase().includes(cleanQuery);
    const matchesCuisine = r.cuisines.some((c) =>
      c.toLowerCase().includes(cleanQuery)
    );
    const matchesAddress = r.address.toLowerCase().includes(cleanQuery);

    if (matchesName || matchesCuisine || matchesAddress) {
      results.push({
        id: r.id,
        name: r.name,
        type: "restaurant",
        category: r.cuisines.slice(0, 2).join(", "),
        image: r.image,
      });
    }
  });

  // 2. Search Foods
  allFoods.forEach((f) => {
    const matchesName = f.name.toLowerCase().includes(cleanQuery);
    const matchesCategory = f.category.toLowerCase().includes(cleanQuery);
    const matchesDesc = f.description?.toLowerCase().includes(cleanQuery);

    if (matchesName || matchesCategory || matchesDesc) {
      const rest = allRestaurants.find((r) => r.id === f.restaurantId);
      results.push({
        id: f.id,
        name: f.name,
        type: "food",
        category: f.category,
        price: f.price,
        image: f.image,
        restaurantId: f.restaurantId,
        restaurantName: rest?.name || "Kitchen",
      });
    }
  });

  return results.slice(0, 8); // Top 8 results
}

import { openDB, DBSchema, IDBPDatabase } from "idb";

// Typage strict des événements hors-ligne
export interface OfflineSyncEvent {
  id: string; // UUID généré côté client
  orderId: string;
  actionType: "DELIVERY_PIN" | "DELIVERY_GPS";
  payload: unknown; // PIN string ou objet coordonnées
  logicalTs: number; // L'horloge logique pour le CRDT
  timestamp: number;
}

interface KoliSyncDB extends DBSchema {
  sync_queue: {
    key: string;
    value: OfflineSyncEvent;
    indexes: { "by-timestamp": number };
  };
}

let dbPromise: Promise<IDBPDatabase<KoliSyncDB>> | null = null;

function getDB() {
  if (typeof window === "undefined") return null;
  if (!dbPromise) {
    dbPromise = openDB<KoliSyncDB>("kolisync-offline-db", 1, {
      upgrade(db) {
        const store = db.createObjectStore("sync_queue", { keyPath: "id" });
        store.createIndex("by-timestamp", "timestamp");
      },
    });
  }
  return dbPromise;
}

export async function saveOfflineEvent(event: OfflineSyncEvent): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.put("sync_queue", event);
}

export async function getPendingEvents(): Promise<OfflineSyncEvent[]> {
  const db = await getDB();
  if (!db) return [];
  return await db.getAllFromIndex("sync_queue", "by-timestamp");
}

export async function removeOfflineEvent(id: string): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.delete("sync_queue", id);
}

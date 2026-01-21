self.addEventListener("sync", (event) => {
  if (event.tag === "sync-pending-messages") {
    event.waitUntil(syncPendingMessages());
  }
});

async function syncPendingMessages() {
  const db = await openDB();

  const tx = db.transaction("pending_actions", "readwrite");
  const store = tx.objectStore("pending_actions");

  const allActions = await store.getAll();

  for (const action of allActions) {
    if (action.type !== "SEND_MESSAGE") continue;

    try {
      const session = await getAuthSession(db);

      const res = await fetch("/api/coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          prompt: action.payload.content,
          grade: session.grade,
          subject: session.subject,
          language: session.language,
          time_left_minutes: 10,
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      await store.delete(action.id);
    } catch (err) {
      console.error("Background sync failed", err);
    }
  }

  await tx.done;
}
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("shikshaSahayDB", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function getAuthSession(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("auth", "readonly");
    const store = tx.objectStore("auth");

    const req = store.get("session");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

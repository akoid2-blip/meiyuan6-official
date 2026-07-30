(() => {
  "use strict";

  const STORAGE_KEYS = Object.freeze({
    orders: "my6_orders",
    payments: "my6_payments",
    tasks: "my6_tasks",
    guestProfiles: "my6_guest_profiles",
    settings: "my6_settings",
    templates: "my6_templates",
    shortcuts: "my6_shortcuts",
    roomLocks: "my6_room_locks",
    auditLogs: "my6_audit_logs",
    notificationState: "my6_notification_state"
  });

  const CLOUD_DATASETS = Object.freeze([
    "orders", "payments", "tasks", "guestProfiles",
    "settings", "templates", "roomLocks", "auditLogs"
  ]);

  const TABLES = Object.freeze({
    orders: "orders",
    payments: "payments",
    tasks: "housekeeping_tasks",
    guestProfiles: "guest_profiles",
    settings: "property_settings",
    templates: "templates",
    roomLocks: "room_locks",
    auditLogs: "audit_logs"
  });

  const parse = (raw, fallback) => {
    try { return raw == null ? fallback : JSON.parse(raw); }
    catch { return fallback; }
  };

  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
  const num = value => Number(value || 0);
  const isoOrNull = value => value || null;
  const taskTimestampOrNull = (value, taskDate) => {
    const raw=String(value||"").trim();
    if(!raw)return null;
    if(/^\d{2}:\d{2}$/.test(raw) && /^\d{4}-\d{2}-\d{2}$/.test(String(taskDate||"")))return `${taskDate}T${raw}:00+08:00`;
    return raw;
  };

  class RepositoryError extends Error {
    constructor(message, code = "REPOSITORY_ERROR", cause = null) {
      super(message);
      this.name = "RepositoryError";
      this.code = code;
      this.cause = cause;
    }
  }

  class LocalRepository {
    constructor(storage = window.localStorage) {
      this.storage = storage;
      this.mode = "local";
    }

    validateName(name) {
      if (!(name in STORAGE_KEYS)) throw new RepositoryError(`Unknown repository: ${name}`, "UNKNOWN_DATASET");
    }

    async read(name, fallback = null) {
      this.validateName(name);
      return parse(this.storage.getItem(STORAGE_KEYS[name]), fallback);
    }

    async write(name, value) {
      this.validateName(name);
      this.storage.setItem(STORAGE_KEYS[name], JSON.stringify(value));
      return clone(value);
    }

    async remove(name) {
      this.validateName(name);
      this.storage.removeItem(STORAGE_KEYS[name]);
    }

    async snapshot(names = Object.keys(STORAGE_KEYS)) {
      const out = {};
      for (const name of names) out[name] = await this.read(name, null);
      return out;
    }

    async health() {
      return {
        ok: Number(this.storage.getItem("my6_schema_version") || 0) === 12,
        mode: this.mode,
        schemaVersion: 12,
        writable: true
      };
    }
  }

  class CloudRepository {
    constructor(client = null, config = window.MEIYUAN6_CLOUD_CONFIG || {}) {
      this.mode = "cloud";
      this.config = config;
      this.client = client || window.Meiyuan6Supabase?.getClient() || null;
    }

    ensureClient() {
      if (!this.client) this.client = window.Meiyuan6Supabase?.getClient() || null;
      if (!this.client) throw new RepositoryError("Supabase Client 尚未設定", "CLIENT_NOT_CONFIGURED");
      return this.client;
    }

    ensureProperty() {
      if (!this.config.propertyId) throw new RepositoryError("Property ID 尚未設定", "PROPERTY_NOT_CONFIGURED");
      return this.config.propertyId;
    }

    async currentUserId() {
      const { data, error } = await this.ensureClient().auth.getUser();
      if (error) throw new RepositoryError(error.message, "AUTH_USER_ERROR", error);
      return data.user?.id || null;
    }

    async requireSession() {
      const { data, error } = await this.ensureClient().auth.getSession();
      if (error) throw new RepositoryError(error.message, "AUTH_SESSION_ERROR", error);
      if (!data.session) throw new RepositoryError("尚未登入 Supabase", "AUTH_REQUIRED");
      return data.session;
    }

    async select(table, options = {}) {
      const propertyId = this.ensureProperty();
      let query = this.ensureClient().from(table).select(options.columns || "*").eq("property_id", propertyId);
      if (options.orderBy) query = query.order(options.orderBy, { ascending: options.ascending !== false });
      const { data, error } = await query;
      if (error) throw new RepositoryError(`${table}: ${error.message}`, "SELECT_FAILED", error);
      return data || [];
    }

    async upsert(table, rows, options = {}) {
      if (!Array.isArray(rows) || !rows.length) return [];
      const propertyId = this.ensureProperty();
      const payload = rows.map(row => ({ ...row, property_id: propertyId }));
      const { data, error } = await this.ensureClient()
        .from(table)
        .upsert(payload, { onConflict: options.onConflict || "id" })
        .select();
      if (error) throw new RepositoryError(`${table}: ${error.message}`, "UPSERT_FAILED", error);
      return data || [];
    }

    async replacePropertyRows(table, rows, options = {}) {
      const propertyId = this.ensureProperty();
      if (options.deleteMissing === true) {
        const ids = rows.map(row => row.id).filter(Boolean);
        let deletion = this.ensureClient().from(table).delete().eq("property_id", propertyId);
        if (ids.length) deletion = deletion.not("id", "in", `(${ids.map(id => `"${String(id).replaceAll('"','\\"')}"`).join(",")})`);
        const { error } = await deletion;
        if (error) throw new RepositoryError(`${table}: ${error.message}`, "DELETE_MISSING_FAILED", error);
      }
      return this.upsert(table, rows, options);
    }

    orderToRow(order, userId) {
      return {
        id: String(order.id),
        guest_name: order.name || order.guestName || "",
        phone: order.phone || "",
        checkin_date: order.checkin || order.checkinDate,
        checkout_date: order.checkout || order.checkoutDate,
        guest_count: Number(order.count ?? order.guests ?? order.guestCount ?? 1),
        package_type: order.packageType || "",
        order_type: order.orderType || "",
        status: order.lifecycleStatus || order.status || "",
        total_amount: num(order.total),
        opening_paid: num(order.openingPaid),
        source: order.source || "",
        note: order.note || "",
        backfill_reason: order.backfillReason || "",
        app_payload: clone(order),
        updated_by: userId,
        created_by: order.createdBy || userId
      };
    }

    orderFromRow(row, rooms = []) {
      const payload = row.app_payload && typeof row.app_payload === "object" ? clone(row.app_payload) : {};
      return {
        ...payload,
        id: row.id,
        name: row.guest_name,
        phone: row.phone,
        checkin: row.checkin_date,
        checkout: row.checkout_date,
        count: Number(payload.count ?? row.guest_count ?? 1),
        guests: Number(payload.guests ?? row.guest_count ?? 1),
        package: payload.package || row.package_type || "",
        packageType: payload.packageType || row.package_type || "",
        orderType: row.order_type || payload.orderType || "normal",
        lifecycleStatus: row.status || payload.lifecycleStatus || "詢問中",
        total: num(row.total_amount),
        paid: num(row.opening_paid),
        openingPaid: num(payload.openingPaid ?? row.opening_paid),
        source: row.source || payload.source || "",
        note: row.note || payload.note || "",
        backfillReason: row.backfill_reason || payload.backfillReason || "",
        revision: row.revision,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        rooms,
        room: rooms[0] || ""
      };
    }

    paymentToRow(payment, userId) {
      return {
        id: String(payment.id),
        order_id: String(payment.orderId),
        transaction_type: payment.type || payment.transactionType || "收款",
        amount: num(payment.amount),
        payment_method: payment.method || "",
        transaction_date: isoOrNull(payment.date),
        description: payment.description || "",
        refund_reason: payment.refundReason || "",
        verified: payment.verified === true,
        verified_at: isoOrNull(payment.verifiedAt),
        updated_by: userId,
        created_by: payment.createdBy || userId
      };
    }

    paymentFromRow(row) {
      return {
        id: row.id,
        orderId: row.order_id,
        type: row.transaction_type,
        amount: num(row.amount),
        method: row.payment_method,
        date: row.transaction_date,
        description: row.description,
        refundReason: row.refund_reason,
        verified: row.verified,
        verifiedAt: row.verified_at,
        revision: row.revision,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    }

    taskToRow(task) {
      return {
        id: String(task.id),
        order_id: task.orderId || null,
        room_id: task.room || task.roomId || null,
        task_date: isoOrNull(task.date),
        title: task.title || "",
        status: task.status || "",
        priority: task.priority || "",
        assignee: task.assignee || "",
        inspector: task.inspector || "",
        scheduled_checkout: taskTimestampOrNull(task.scheduledCheckout, task.date),
        started_at: taskTimestampOrNull(task.startedAt, task.date),
        paused_at: taskTimestampOrNull(task.pausedAt, task.date),
        inspected_at: taskTimestampOrNull(task.inspectedAt, task.date),
        completed_at: taskTimestampOrNull(task.completedAt, task.date),
        note: task.note || ""
      };
    }

    taskFromRow(row) {
      return {
        id: row.id,
        orderId: row.order_id,
        room: row.room_id,
        date: row.task_date,
        title: row.title,
        status: row.status,
        priority: row.priority,
        assignee: row.assignee,
        inspector: row.inspector,
        scheduledCheckout: row.scheduled_checkout,
        startedAt: row.started_at,
        pausedAt: row.paused_at,
        inspectedAt: row.inspected_at,
        completedAt: row.completed_at,
        note: row.note,
        revision: row.revision
      };
    }

    lockToRow(lock, userId) {
      return {
        id: String(lock.id),
        room_id: lock.room || lock.roomId,
        start_date: lock.start || lock.startDate,
        end_date: lock.end || lock.endDate,
        lock_type: lock.type || lock.lockType || "",
        reason: lock.reason || "",
        created_by: lock.createdBy || userId
      };
    }

    lockFromRow(row) {
      return {
        id: row.id,
        room: row.room_id,
        start: row.start_date,
        end: row.end_date,
        type: row.lock_type,
        reason: row.reason,
        revision: row.revision
      };
    }

    async readOrders() {
      const [orders, links] = await Promise.all([
        this.select("orders", { orderBy: "checkin_date" }),
        this.select("order_rooms")
      ]);
      const roomMap = {};
      for (const link of links) (roomMap[link.order_id] ||= []).push(link.room_id);
      return orders.map(row => this.orderFromRow(row, roomMap[row.id] || []));
    }

    async writeOrders(orders, options = {}) {
      await this.requireSession();
      const userId = await this.currentUserId();
      const rows = (orders || []).map(order => this.orderToRow(order, userId));
      await this.replacePropertyRows("orders", rows, { onConflict: "id", deleteMissing: options.deleteMissing === true });

      const propertyId = this.ensureProperty();
      for (const order of orders || []) {
        const orderId = String(order.id);
        const rooms = [...new Set([...(order.rooms || []), ...(order.room ? [order.room] : [])].filter(Boolean))];
        const { error: deleteError } = await this.ensureClient().from("order_rooms").delete().eq("property_id", propertyId).eq("order_id", orderId);
        if (deleteError) throw new RepositoryError(`order_rooms: ${deleteError.message}`, "ORDER_ROOM_DELETE_FAILED", deleteError);
        if (rooms.length) {
          const { error: insertError } = await this.ensureClient().from("order_rooms").insert(
            rooms.map(roomId => ({ property_id: propertyId, order_id: orderId, room_id: roomId }))
          );
          if (insertError) throw new RepositoryError(`order_rooms: ${insertError.message}`, "ORDER_ROOM_INSERT_FAILED", insertError);
        }
      }
      return clone(orders);
    }

    async upsertOrder(order) {
      await this.requireSession();
      const userId = await this.currentUserId();
      const row = this.orderToRow(order, userId);
      await this.upsert("orders", [row], { onConflict: "id" });
      const propertyId = this.ensureProperty();
      const orderId = String(order.id);
      const rooms = [...new Set([...(order.rooms || []), ...(order.room ? [order.room] : [])].filter(Boolean))];
      const { error: deleteError } = await this.ensureClient().from("order_rooms").delete().eq("property_id", propertyId).eq("order_id", orderId);
      if (deleteError) throw new RepositoryError(`order_rooms: ${deleteError.message}`, "ORDER_ROOM_DELETE_FAILED", deleteError);
      if (rooms.length) {
        const { error: insertError } = await this.ensureClient().from("order_rooms").insert(rooms.map(roomId => ({ property_id: propertyId, order_id: orderId, room_id: roomId })));
        if (insertError) throw new RepositoryError(`order_rooms: ${insertError.message}`, "ORDER_ROOM_INSERT_FAILED", insertError);
      }
      return clone(order);
    }

    async deleteOrder(orderId) {
      await this.requireSession();
      const { error } = await this.ensureClient().from("orders").delete().eq("property_id", this.ensureProperty()).eq("id", String(orderId));
      if (error) throw new RepositoryError(`orders: ${error.message}`, "ORDER_DELETE_FAILED", error);
      return true;
    }

    async readPayments() {
      return (await this.select("payments", { orderBy: "transaction_date" })).map(row => this.paymentFromRow(row));
    }

    async writePayments(payments, options = {}) {
      await this.requireSession();
      const userId = await this.currentUserId();
      const rows = (payments || []).map(payment => this.paymentToRow(payment, userId));
      await this.replacePropertyRows("payments", rows, { onConflict: "id", deleteMissing: options.deleteMissing === true });
      return clone(payments);
    }

    async readTasks() {
      return (await this.select("housekeeping_tasks", { orderBy: "task_date" })).map(row => this.taskFromRow(row));
    }

    async writeTasks(tasks, options = {}) {
      await this.requireSession();
      const rows = (tasks || []).map(task => this.taskToRow(task));
      await this.replacePropertyRows("housekeeping_tasks", rows, { onConflict: "id", deleteMissing: options.deleteMissing === true });
      return clone(tasks);
    }

    async readRoomLocks() {
      return (await this.select("room_locks", { orderBy: "start_date" })).map(row => this.lockFromRow(row));
    }

    async writeRoomLocks(locks, options = {}) {
      await this.requireSession();
      const userId = await this.currentUserId();
      const rows = (locks || []).map(lock => this.lockToRow(lock, userId));
      await this.replacePropertyRows("room_locks", rows, { onConflict: "id", deleteMissing: options.deleteMissing === true });
      return clone(locks);
    }

    async readGuestProfiles() {
      const rows = await this.select("guest_profiles", { orderBy: "name" });
      return Object.fromEntries(rows.map(row => [
        row.phone || row.id,
        {
          id: row.id,
          name: row.name,
          phone: row.phone,
          email: row.email,
          note: row.note,
          lastOrderAt: row.last_order_at
        }
      ]));
    }

    async writeGuestProfiles(profiles) {
      await this.requireSession();
      const values = Array.isArray(profiles) ? profiles : Object.values(profiles || {});
      const rows = values.map(profile => ({
        ...(profile.id ? { id: profile.id } : {}),
        name: profile.name || "",
        phone: profile.phone || "",
        email: profile.email || "",
        note: profile.note || "",
        last_order_at: isoOrNull(profile.lastOrderAt)
      }));
      await this.upsert("guest_profiles", rows, { onConflict: "id" });
      return clone(profiles);
    }

    async readTemplates() {
      const rows = await this.select("templates", { orderBy: "sort_order" });
      return Object.fromEntries(rows.map(row => [
        row.title,
        { id: row.id, title: row.title, category: row.category, content: row.content, sortOrder: row.sort_order }
      ]));
    }

    async writeTemplates(templates) {
      await this.requireSession();
      const values = Array.isArray(templates) ? templates : Object.values(templates || {});
      const rows = values.map((template, index) => ({
        ...(template.id ? { id: template.id } : {}),
        title: template.title || "",
        category: template.category || "",
        content: template.content || "",
        sort_order: Number(template.sortOrder ?? index),
        is_active: template.isActive !== false
      }));
      await this.upsert("templates", rows, { onConflict: "property_id,title" });
      return clone(templates);
    }

    async readSettings() {
      const propertyId = this.ensureProperty();
      const { data, error } = await this.ensureClient().from("property_settings").select("settings").eq("property_id", propertyId).maybeSingle();
      if (error) throw new RepositoryError(`property_settings: ${error.message}`, "SETTINGS_READ_FAILED", error);
      return data?.settings || {};
    }

    async writeSettings(settings) {
      await this.requireSession();
      const userId = await this.currentUserId();
      const propertyId = this.ensureProperty();
      const { error } = await this.ensureClient().from("property_settings").upsert({
        property_id: propertyId,
        settings: settings || {},
        updated_by: userId
      }, { onConflict: "property_id" });
      if (error) throw new RepositoryError(`property_settings: ${error.message}`, "SETTINGS_WRITE_FAILED", error);
      return clone(settings);
    }

    async readAuditLogs() {
      const rows = await this.select("audit_logs", { orderBy: "created_at", ascending: false });
      return rows.map(row => ({
        id: row.id,
        operator: row.operator_name,
        module: row.module,
        action: row.action,
        targetId: row.target_id,
        orderId: row.order_id,
        guestName: row.guest_name,
        roomName: row.room_name,
        summary: row.summary,
        before: row.before_data,
        after: row.after_data,
        deviceId: row.device_id,
        revision: row.revision,
        createdAt: row.created_at
      }));
    }

    async appendAudit(log) {
      await this.requireSession();
      const userId = await this.currentUserId();
      const row = {
        id: String(log.id),
        property_id: this.ensureProperty(),
        user_id: userId,
        operator_name: log.operator || "",
        module: log.module || "",
        action: log.action || "更新",
        target_id: log.targetId || null,
        order_id: log.orderId || null,
        guest_name: log.guestName || "",
        room_name: log.roomName || "",
        summary: log.summary || "",
        before_data: log.before || null,
        after_data: log.after || null,
        device_id: log.deviceId || "",
        revision: log.revision || null
      };
      const { error } = await this.ensureClient().from("audit_logs").insert(row);
      if (error) throw new RepositoryError(`audit_logs: ${error.message}`, "AUDIT_INSERT_FAILED", error);
      return clone(log);
    }

    async read(name, fallback = null) {
      switch (name) {
        case "orders": return this.readOrders();
        case "payments": return this.readPayments();
        case "tasks": return this.readTasks();
        case "roomLocks": return this.readRoomLocks();
        case "guestProfiles": return this.readGuestProfiles();
        case "templates": return this.readTemplates();
        case "settings": return this.readSettings();
        case "auditLogs": return this.readAuditLogs();
        default:
          if (fallback !== null) return clone(fallback);
          throw new RepositoryError(`Dataset 尚未支援雲端讀取：${name}`, "UNSUPPORTED_CLOUD_DATASET");
      }
    }

    async write(name, value, options = {}) {
      switch (name) {
        case "orders": return this.writeOrders(value, options);
        case "payments": return this.writePayments(value, options);
        case "tasks": return this.writeTasks(value, options);
        case "roomLocks": return this.writeRoomLocks(value, options);
        case "guestProfiles": return this.writeGuestProfiles(value);
        case "templates": return this.writeTemplates(value);
        case "settings": return this.writeSettings(value);
        case "auditLogs":
          throw new RepositoryError("Audit Log 為 append-only，請使用 appendAudit()", "AUDIT_APPEND_ONLY");
        default:
          throw new RepositoryError(`Dataset 尚未支援雲端寫入：${name}`, "UNSUPPORTED_CLOUD_DATASET");
      }
    }

    async health() {
      try {
        const session = await this.requireSession();
        const { data, error } = await this.ensureClient()
          .from("properties")
          .select("id,name")
          .eq("id", this.ensureProperty())
          .maybeSingle();
        if (error) throw error;
        return {
          ok: Boolean(data),
          mode: this.mode,
          authenticated: Boolean(session),
          property: data || null,
          schemaVersion: 12,
          writable: Boolean(this.config.cloudDataEnabled)
        };
      } catch (error) {
        return {
          ok: false,
          mode: this.mode,
          reason: error.message,
          schemaVersion: 12,
          writable: false
        };
      }
    }
  }

  class HybridRepository {
    constructor({
      local = new LocalRepository(),
      cloud = new CloudRepository(),
      config = window.MEIYUAN6_CLOUD_CONFIG || {}
    } = {}) {
      this.local = local;
      this.cloud = cloud;
      this.config = config;
      this.mode = config.enabled && config.mode === "cloud" ? "hybrid" : "local";
    }

    cloudReadable(name) {
      return this.config.enabled === true
        && this.config.mode === "cloud"
        && this.config.authEnabled === true
        && CLOUD_DATASETS.includes(name);
    }

    cloudWritable(name) {
      return this.cloudReadable(name) && this.config.cloudDataEnabled === true;
    }

    async read(name, fallback = null, options = {}) {
      if (!this.cloudReadable(name) || options.localOnly === true) {
        return this.local.read(name, fallback);
      }
      try {
        const value = await this.cloud.read(name, fallback);
        if (options.cacheLocal !== false) await this.local.write(name, value);
        return value;
      } catch (error) {
        if (this.config.allowLocalFallback === false) throw error;
        console.warn("[Cloud Data Layer] cloud read fallback", name, error);
        return this.local.read(name, fallback);
      }
    }

    async write(name, value, options = {}) {
      const localValue = await this.local.write(name, value);
      if (!this.cloudWritable(name) || options.localOnly === true) return localValue;
      try {
        await this.cloud.write(name, value, options);
        return clone(value);
      } catch (error) {
        if (this.config.offlineQueueEnabled && window.Meiyuan6OfflineGuard?.enqueue) {
          try {
            await window.Meiyuan6OfflineGuard.enqueue({
              dataset: name,
              operation: "replace",
              payload: clone(value),
              createdAt: new Date().toISOString()
            });
          } catch (queueError) {
            console.warn("[Cloud Data Layer] queue failed", queueError);
          }
        }
        if (this.config.allowLocalFallback === false) throw error;
        console.warn("[Cloud Data Layer] cloud write fallback", name, error);
        return localValue;
      }
    }

    async promoteLocalDataset(name, options = {}) {
      if (!this.cloudWritable(name)) throw new RepositoryError("Cloud Data Write 尚未啟用", "CLOUD_WRITE_DISABLED");
      const value = await this.local.read(name, options.fallback ?? (name === "guestProfiles" || name === "templates" || name === "settings" ? {} : []));
      await this.cloud.write(name, value, { deleteMissing: options.deleteMissing === true });
      return { dataset: name, promoted: true, count: Array.isArray(value) ? value.length : Object.keys(value || {}).length };
    }

    async promoteAll(options = {}) {
      const results = [];
      for (const name of CLOUD_DATASETS.filter(name => name !== "auditLogs")) {
        results.push(await this.promoteLocalDataset(name, options));
      }
      return results;
    }

    async health() {
      const [local, cloud] = await Promise.all([this.local.health(), this.cloud.health()]);
      return {
        ok: local.ok && (!this.config.enabled || cloud.ok),
        mode: this.mode,
        local,
        cloud,
        cloudDataEnabled: this.config.cloudDataEnabled === true,
        realtimeEnabled: this.config.realtimeEnabled === true
      };
    }
  }

  class RepositoryFactory {
    constructor(config = window.MEIYUAN6_CLOUD_CONFIG || {}) {
      this.config = config;
      this.instances = new Map();
    }
    normalizeMode(mode) {
      if (["local", "hybrid", "cloud"].includes(mode)) return mode;
      return this.config.enabled && this.config.mode === "cloud" ? "hybrid" : "local";
    }
    create(mode = "auto", options = {}) {
      const normalized = this.normalizeMode(mode);
      if (options.singleton !== false && this.instances.has(normalized)) return this.instances.get(normalized);
      const local = options.local || new LocalRepository(options.storage);
      const cloud = options.cloud || new CloudRepository(options.client || window.Meiyuan6Supabase?.getClient(), this.config);
      const repository = normalized === "local" ? local : normalized === "cloud" ? cloud : new HybridRepository({ local, cloud, config: this.config });
      if (options.singleton !== false) this.instances.set(normalized, repository);
      return repository;
    }
    get(mode = "auto") { return this.create(mode); }
    reset() { this.instances.clear(); }
  }

  const repositoryFactory = new RepositoryFactory();
  function createRepository(options = {}) {
    return repositoryFactory.create(options.mode || "auto", options);
  }

  const defaultRepository = createRepository();

  window.Meiyuan6Repositories = Object.freeze({
    STORAGE_KEYS,
    CLOUD_DATASETS,
    TABLES,
    RepositoryError,
    LocalRepository,
    CloudRepository,
    HybridRepository,
    RepositoryFactory,
    repositoryFactory,
    createRepository,
    defaultRepository
  });

  window.Meiyuan6Data = Object.freeze({
    repository: defaultRepository,
    read: (...args) => defaultRepository.read(...args),
    write: (...args) => defaultRepository.write(...args),
    health: () => defaultRepository.health(),
    promoteLocalDataset: (...args) => defaultRepository.promoteLocalDataset(...args),
    promoteAll: (...args) => defaultRepository.promoteAll(...args)
  });
})();

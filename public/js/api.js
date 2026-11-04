const API = {
  async get(url) {
    const res = await fetch(url);
    if (res.status === 401) { window.currentUser = null; updateNav(); return null; }
    return res.json();
  },
  async post(url, data) {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Request failed');
    return json;
  },
  async put(url, data) {
    const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Request failed');
    return json;
  },
  async postForm(url, formData) {
    const res = await fetch(url, { method: 'POST', body: formData });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Request failed');
    return json;
  },
  async delete(url) {
    const res = await fetch(url, { method: 'DELETE' });
    return res.json();
  }
};

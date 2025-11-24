// LocalStorage Management

  localStorage.setItem(key, JSON.stringify(data));
}

  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

  localStorage.removeItem(key);
}
